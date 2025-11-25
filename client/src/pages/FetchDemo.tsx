import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import URDFLoader from "urdf-loader";

type Keyframe = { time: number; joints: Record<string, number> };
type Clip = { name: string; loop?: boolean; frames: Keyframe[] };

const baseUrl = (() => {
  const b = (import.meta as any).env?.BASE_URL || "/";
  return b.endsWith("/") ? b : `${b}/`;
})();

const resolvePublic = (p: string) => `${baseUrl}${p.replace(/^\/+/, "")}`;

function FetchRobot({
  urdfUrl,
  assetsBase,
  onReady,
  onStatus,
  onPlayReady,
  onBounds,
  basePose,
  onIntroCamera,
}: {
  urdfUrl: string;
  assetsBase: string;
  onReady?: (jointNames: string[]) => void;
  onStatus?: (loading: boolean, error: string | null) => void;
  onPlayReady?: (play: (clip: Clip) => void) => void;
  onBounds?: (center: THREE.Vector3, radius: number) => void;
  basePose?: Record<string, number>;
  onIntroCamera?: (config: { center: THREE.Vector3; startPos: THREE.Vector3; endPos: THREE.Vector3 }) => void;
}) {
  const { scene, camera, clock } = useThree();
  const robotRef = useRef<THREE.Object3D | null>(null);
  const jointMapRef = useRef<Record<string, any>>({});
  const clipRef = useRef<{ clip: Clip; start: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playClip = (clip: Clip) => {
    clipRef.current = { clip, start: clock.getElapsedTime() };
  };

  useEffect(() => {
    onPlayReady?.(playClip);
  }, [onPlayReady]);

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    (loader as any).packages = {
      fetch: assetsBase,
      fetch_description: assetsBase,
    };
    loader.workingPath = assetsBase;
    loader.fetchOptions = { credentials: "same-origin", mode: "cors" };

    manager.onStart = () => onStatus?.(true, null);
    manager.onError = (url) => {
      console.error("URDF asset error", url);
      setError(`Could not load asset: ${url}`);
      onStatus?.(false, `Could not load asset: ${url}`);
    };

    loader.load(
      urdfUrl,
      (robot: any) => {
        robotRef.current = robot;
        jointMapRef.current = robot.joints ?? {};

        // Align robot upright for Three.js (ROS uses Z-up). Adjusted to fix upside-down orientation.
        robot.rotation.set(-Math.PI / 2, 0, 0);

        scene.add(robot);
        robot.updateMatrixWorld(true);

        // Smooth normals and materials to reduce faceting
        robot.traverse((node: any) => {
          if (node.isMesh) {
            const g = node.geometry as THREE.BufferGeometry | undefined;
            if (g) {
              if (!g.attributes.normal) {
                g.computeVertexNormals();
              }
            }
            if (node.material) {
              const m = node.material as THREE.MeshStandardMaterial;
              if (m && "flatShading" in m) {
                m.flatShading = false;
                m.needsUpdate = true;
              }
              if ("roughness" in node.material) {
                m.roughness = Math.min(m.roughness ?? 1, 0.55);
              }
              if ("metalness" in node.material) {
                m.metalness = Math.max(m.metalness ?? 0, 0.05);
              }
            } else {
              node.material = new THREE.MeshStandardMaterial({
                color: 0xdddddd,
                roughness: 0.55,
                metalness: 0.05,
                flatShading: false,
              });
            }
          }
        });

        // Apply base pose if provided
        if (basePose) {
          Object.entries(basePose).forEach(([name, value]) => {
            const j = jointMapRef.current[name];
            if (j && typeof j.setJointValue === "function") {
              try {
                j.setJointValue(value);
              } catch (e) {
                console.warn("Failed to set base pose for joint", name, e);
              }
            }
          });
          robot.updateMatrixWorld(true);
        }

        // Fit camera
        const box = new THREE.Box3().setFromObject(robot);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        center.add(new THREE.Vector3(0, 1, 0)); // e.g., 0.5 to move up
        const maxDim = Math.max(size.x, size.y, size.z);
        const radius = Math.max(0.5, maxDim || 1);
        const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
        const dist = Math.max(1, (maxDim || 1) / Math.tan(fov / 2));

        const startPos = center.clone().add(new THREE.Vector3(radius, radius * 0.2, radius));
        const endPos = center.clone().add(new THREE.Vector3(dist, dist * 0.4, dist));

        // Place camera at start of intro
        camera.position.copy(startPos);
        camera.lookAt(center);
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

        // Notify parent to run intro animation
        onIntroCamera?.({ center, startPos, endPos });
        onBounds?.(center, maxDim || 1);

        const joints = Object.entries(robot.joints ?? {})
          .filter(([, j]: any) => (j.jointType || "").toLowerCase() !== "fixed")
          .map(([name]) => name);
        setLoading(false);
        onStatus?.(false, null);
        onReady?.(joints);
      },
      undefined,
      (err) => {
        console.error("Failed to load URDF", err);
        setError("Failed to load URDF. Check asset paths.");
        onStatus?.(false, "Failed to load URDF. Check asset paths.");
        setLoading(false);
      }
    );

    return () => {
      if (robotRef.current) scene.remove(robotRef.current);
    };
  }, [urdfUrl, assetsBase, scene, camera, onReady, clock]);

  useFrame(() => {
    if (!robotRef.current || !clipRef.current) return;
    const { clip, start } = clipRef.current;
    const elapsed = clock.getElapsedTime() - start;
    const duration = clip.frames[clip.frames.length - 1].time;

    const t = clip.loop ? (elapsed % duration) : Math.min(elapsed, duration);
    if (!clip.loop && elapsed >= duration) {
      clipRef.current = null;
      return;
    }

    let f1 = clip.frames[0];
    let f2 = clip.frames[clip.frames.length - 1];
    for (let i = 0; i < clip.frames.length - 1; i++) {
      const a = clip.frames[i];
      const b = clip.frames[i + 1];
      if (t >= a.time && t <= b.time) {
        f1 = a;
        f2 = b;
        break;
      }
    }
    const span = Math.max(0.001, f2.time - f1.time);
    const alpha = Math.min(1, Math.max(0, (t - f1.time) / span));
    const jointNames = new Set([...Object.keys(f1.joints), ...Object.keys(f2.joints)]);
    jointNames.forEach((name) => {
      const j = jointMapRef.current[name];
      if (!j || typeof j.setJointValue !== "function") return;
      const v1 = f1.joints[name] ?? 0;
      const v2 = f2.joints[name] ?? 0;
      j.setJointValue(THREE.MathUtils.lerp(v1, v2, alpha));
    });
    robotRef.current.updateMatrixWorld(true);
  });

  return (
    <primitive object={robotRef.current ?? new THREE.Group()} />
  );
}

function RobotControls({
  playClip,
  clips,
}: {
  playClip: ((clip: Clip) => void) | null;
  clips: Record<string, Clip>;
}) {

  return (
    <div className="absolute left-4 bottom-4 flex flex-wrap gap-2">
      <button className="px-3 py-2 rounded bg-white shadow text-sm border border-border disabled:opacity-50" disabled={!playClip} onClick={() => playClip?.(clips.wave)}>
        Wave
      </button>
      <button className="px-3 py-2 rounded bg-white shadow text-sm border border-border disabled:opacity-50" disabled={!playClip} onClick={() => playClip?.(clips.nod)}>
        Nod
      </button>
      <button className="px-3 py-2 rounded bg-white shadow text-sm border border-border disabled:opacity-50" disabled={!playClip} onClick={() => playClip?.(clips.dance)}>
        Dance
      </button>
      <button className="px-3 py-2 rounded bg-white shadow text-sm border border-border disabled:opacity-50" disabled={!playClip} onClick={() => playClip?.(clips.reset)}>
        Reset
      </button>
    </div>
  );
}

export default function FetchDemo() {
  const assetsBase = resolvePublic("assets/fetch/");
  const urdfUrl = resolvePublic("assets/fetch/fetch.urdf");
  const basePose: Record<string, number> = {
    shoulder_pan_joint: 1.2, // arm to the side
    shoulder_lift_joint: -0.3,
    elbow_flex_joint: -0.2,
    forearm_roll_joint: 0,
    wrist_flex_joint: 0,
    wrist_roll_joint: 0,
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playClip, setPlayClip] = useState<((clip: Clip) => void) | null>(null);
  const [autoCamera, setAutoCamera] = useState(false);
  const [cinematic, setCinematic] = useState(true);
  const [bounds, setBounds] = useState<{ center: THREE.Vector3; radius: number } | null>(null);
  const controlsRef = useRef<any>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introHoldRef = useRef<{ startPos: THREE.Vector3; center: THREE.Vector3 } | null>(null);
  const cameraAnimRef = useRef<{
    start: number;
    duration: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    active: boolean;
    center: THREE.Vector3;
  }>({ start: 0, duration: 2.5, startPos: new THREE.Vector3(), endPos: new THREE.Vector3(), center: new THREE.Vector3(), active: false });
  const waveTriggeredRef = useRef(false);

  const clips = useMemo<Record<string, Clip>>(
    () => ({
      wave: {
        name: "wave",
        frames: [
          { time: 0, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.6, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: 0 } },
          { time: 0.6, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.9, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: 1.2 } },
          { time: 1.2, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.3, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: -1.2 } },
          { time: 1.8, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.9, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: 1.2 } },
          { time: 2.4, joints: { shoulder_lift_joint: -0.3, shoulder_pan_joint: 0, elbow_flex_joint: -0.5, wrist_flex_joint: 0, wrist_roll_joint: 0 } },
        ],
      },
      nod: {
        name: "nod",
        frames: [
          { time: 0, joints: { head_tilt_joint: 0.0 } },
          { time: 0.5, joints: { head_tilt_joint: 0.6 } },
          { time: 1.0, joints: { head_tilt_joint: -0.4 } },
          { time: 1.5, joints: { head_tilt_joint: 0.5 } },
          { time: 2.0, joints: { head_tilt_joint: 0.0 } },
        ],
      },
      dance: {
        name: "dance",
        loop: true,
        frames: [
          { time: 0, joints: { torso_lift_joint: 0.05, head_pan_joint: -0.6, shoulder_pan_joint: -0.6, shoulder_lift_joint: -0.4, wrist_roll_joint: -1.2 } },
          { time: 1.0, joints: { torso_lift_joint: 0.25, head_pan_joint: 0.6, shoulder_pan_joint: 0.6, shoulder_lift_joint: -0.8, wrist_roll_joint: 1.2 } },
          { time: 2.0, joints: { torso_lift_joint: 0.15, head_pan_joint: 0, shoulder_pan_joint: -0.2, shoulder_lift_joint: -0.2, wrist_roll_joint: 0 } },
        ],
      },
      reset: {
        name: "reset",
        frames: [{ time: 0, joints: basePose }],
      },
    }),
    [basePose]
  );

  // Auto-trigger wave during intro zoom once playClip is ready and bounds are known
  useEffect(() => {
    if (waveTriggeredRef.current || !playClip || !bounds) return;
    waveTriggeredRef.current = true;
    const timer = setTimeout(() => {
      playClip(clips.wave);
    }, 800); // start wave shortly after intro begins
    return () => clearTimeout(timer);
  }, [playClip, bounds, clips, basePose]);

  // Intro camera animation only; no continuous auto movement
  const nowSec = () => performance.now() / 1000;
  const IntroCamera = () => {
    const { camera } = useThree();
    useFrame(() => {
      if (!bounds) return;

      // Hold the camera at the start position during delay
      if (!cameraAnimRef.current.active && introHoldRef.current) {
        const { startPos, center } = introHoldRef.current;
        camera.position.copy(startPos);
        camera.lookAt(center);
        if (controlsRef.current) {
          controlsRef.current.target.copy(center);
          controlsRef.current.update();
        }
        return;
      }

      if (!cameraAnimRef.current.active) return;

      const { start, duration, startPos, endPos, center } = cameraAnimRef.current;
      const t = Math.min(1, (nowSec() - start) / duration);
      camera.position.lerpVectors(startPos, endPos, t);
      camera.lookAt(center);
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
      if (t >= 1) {
        cameraAnimRef.current.active = false;
      }
    });
    return null;
  };

  return (
    <section className="section-padding">
      <div className="space-y-6 max-w-none">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Static GitHub Pages</p>
          <h1 className="text-3xl font-bold">Fetch Robot – Interactive URDF</h1>
          <p className="text-muted-foreground max-w-3xl">
            Orbit, zoom, and trigger simple joint motions (Wave, Nod, Dance, Reset) on the Fetch robot model. Everything runs client-side with your URDF and meshes.
          </p>
        </div>

        <div className="relative w-full h-[540px]">
          {loading && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
              <div className="bg-white px-4 py-2 rounded shadow text-sm">Loading Fetch URDF…</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm text-sm text-red-700">
                {error}
              </div>
            </div>
          )}
          <Canvas
            camera={{ position: [2.5, 1.5, 2.5], fov: 45, near: 0.01, far: 100 }}
          gl={{
            antialias: true,
            alpha: true,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
            shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
          } as any}
        >
            <color attach="background" args={["#ffffff"]} />
            {/* No fog, no ground */}

            {/* Floating, neutral white studio lighting */}
            <ambientLight intensity={0.35} color={0xffffff} />
            <directionalLight
              position={[6, 10, 6]}
              intensity={1.1}
              color={0xffffff}
              castShadow
              shadow-mapSize={[4096, 4096] as any}
              shadow-camera-near={1}
              shadow-camera-far={30}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} color={0xffffff} />
            <spotLight
              position={[0, 8, 4]}
              angle={0.7}
              penumbra={0.5}
              intensity={0.6}
              distance={40}
              color={0xffffff}
            />
            <Environment preset="studio" background={false} blur={0.4} />

            {/* Ground removed; contact shadows removed for floating effect */}

            <FetchRobot
              urdfUrl={urdfUrl}
              assetsBase={assetsBase}
              basePose={basePose}
              onStatus={(loadingState, err) => {
                setLoading(loadingState);
                setError(err);
              }}
              onPlayReady={(fn) => setPlayClip(() => fn)}
              onBounds={(center, radius) => setBounds({ center, radius })}
              onIntroCamera={({ center }) => {
                const r = bounds?.radius ?? 1;
                // Keep camera level with the ground: same Y as target center, directly in front on +Z
                const startPos = center.clone().add(new THREE.Vector3(0, 0, r * 1.0)); // close, level
                const endPos = center.clone().add(new THREE.Vector3(0, 0, r * 2.5));   // pull back, still level
                const delayMs = 4000; // adjust delay before zoom starts

                // Hold camera at start during delay
                introHoldRef.current = { startPos, center };

                // Clear prior intro timer
                if (introTimerRef.current) clearTimeout(introTimerRef.current);

                introTimerRef.current = setTimeout(() => {
                  introHoldRef.current = null;
                  cameraAnimRef.current = {
                    start: performance.now() / 1000,
                    duration: 2.5,
                    startPos,
                    endPos,
                    center,
                    active: true,
                  };
                }, delayMs);
              }}
            />
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.1}
              maxPolarAngle={Math.PI * 0.48}
              enablePan
            />
            <IntroCamera />
          </Canvas>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <RobotControls playClip={playClip} clips={clips} />
          {/* Auto camera removed */}
          <div className="flex items-center gap-2 text-sm">
            <input
              id="cine"
              type="checkbox"
              checked={cinematic}
              onChange={(e) => setCinematic(e.target.checked)}
            />
            <label htmlFor="cine" className="text-muted-foreground">Cinematic lights</label>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Assets served from <code className="px-1 py-0.5 rounded bg-card border border-border">/assets/fetch/</code>. No backend required.
        </p>
      </div>
    </section>
  );
}
