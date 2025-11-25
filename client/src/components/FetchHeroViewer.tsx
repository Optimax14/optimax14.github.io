import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import URDFLoader from "urdf-loader";

type Keyframe = { time: number; joints: Record<string, number> };
type Clip = { name: string; loop?: boolean; frames: Keyframe[] };

const baseUrl = (() => {
  const b = (import.meta as any).env?.BASE_URL || "/";
  return b.endsWith("/") ? b : `${b}/`;
})();
const resolvePublic = (p: string) => `${baseUrl}${p.replace(/^\/+/, "")}`;

let fetchPreload: Promise<THREE.Object3D | null> | null = null;

function ensureFetchPreload(assetsBase: string, urdfUrl: string) {
  if (fetchPreload) return fetchPreload;
  fetchPreload = new Promise((resolve) => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    (loader as any).packages = { fetch: assetsBase, fetch_description: assetsBase };
    loader.workingPath = assetsBase;
    loader.fetchOptions = { credentials: "same-origin", mode: "cors" };
    loader.load(
      urdfUrl,
      (robot: any) => {
        resolve(robot);
      },
      undefined,
      () => resolve(null)
    );
  });
  return fetchPreload;
}

function FetchRobot({
  urdfUrl,
  assetsBase,
  onReady,
  onIntroCamera,
  robotRef,
  jointMapRef,
}: {
  urdfUrl: string;
  assetsBase: string;
  onReady?: (joints: string[]) => void;
  onIntroCamera?: (center: THREE.Vector3, startPos: THREE.Vector3, endPos: THREE.Vector3) => void;
  robotRef: React.MutableRefObject<THREE.Object3D | null>;
  jointMapRef: React.MutableRefObject<Record<string, any>>;
}) {
  const { scene, camera } = useThree();

  useEffect(() => {
    ensureFetchPreload(assetsBase, urdfUrl).then((preloaded) => {
      if (!preloaded) return;
      const robot = preloaded.clone(true);
        robot.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(robot);
        robotRef.current = robot;
        jointMapRef.current = robot.joints ?? {};

        // Smooth shading
        robot.traverse((node: any) => {
          if (node.isMesh) {
            const g = node.geometry as THREE.BufferGeometry | undefined;
            if (g && !g.attributes.normal) g.computeVertexNormals();
            const m = (node.material ||= new THREE.MeshStandardMaterial());
            if ("flatShading" in m) m.flatShading = false;
            if ("roughness" in m) m.roughness = 0.45;
            if ("metalness" in m) m.metalness = 0.05;
            m.needsUpdate = true;
          }
        });

        robot.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(robot);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0, 1, 0));
        const maxDim = Math.max(size.x, size.y, size.z);
        const radius = Math.max(0.5, maxDim || 1);
        const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
        const dist = Math.max(1, (maxDim || 1) / Math.tan(fov / 2));

        const startPos = center.clone().add(new THREE.Vector3(0, 0, radius * 1.0));
        const endPos = center.clone().add(new THREE.Vector3(0, 0, radius * 2.5));

        camera.position.copy(startPos);
        camera.lookAt(center);
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

        onIntroCamera?.(center, startPos, endPos);

        const joints = Object.entries(robot.joints ?? {})
          .filter(([, j]: any) => (j.jointType || "").toLowerCase() !== "fixed")
          .map(([name]) => name);
        onReady?.(joints);
    });

    return () => {
      if (robotRef.current) scene.remove(robotRef.current);
    };
  }, [urdfUrl, assetsBase, scene, camera, onIntroCamera, onReady]);

  return null;
}

function ClipRunner({
  robotRef,
  jointMapRef,
  clipRef,
  introAnimRef,
}: {
  robotRef: React.MutableRefObject<THREE.Object3D | null>;
  jointMapRef: React.MutableRefObject<Record<string, any>>;
  clipRef: React.MutableRefObject<{ clip: Clip; start: number } | null>;
  introAnimRef: React.MutableRefObject<{
    start: number;
    duration: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    center: THREE.Vector3;
    active: boolean;
  }>;
}) {
  const nowSec = () => performance.now() / 1000;
  useFrame(({ camera }) => {
    // No intro animation; keep camera as is

    if (!robotRef.current || !jointMapRef.current || !clipRef.current) return;
    const { clip, start } = clipRef.current;
    const elapsed = nowSec() - start;
    const duration = clip.frames[clip.frames.length - 1].time;
    const t = clip.loop ? elapsed % duration : Math.min(elapsed, duration);
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
  return null;
}

export default function FetchHeroViewer({
  onLoaded,
  onStartReady,
  onWaveComplete,
}: {
  onLoaded?: () => void;
  onStartReady?: (startWave: () => void) => void;
  onWaveComplete?: () => void;
}) {
  const assetsBase = resolvePublic("assets/fetch/");
  const urdfUrl = resolvePublic("assets/fetch/fetch.urdf");

  // Simple wave clip
  const playWaveRef = useRef<(clip: Clip) => void>();
  const clipRef = useRef<{ clip: Clip; start: number } | null>(null);
  const robotRef = useRef<THREE.Object3D | null>(null);
  const jointMapRef = useRef<Record<string, any>>({});
  const introAnimRef = useRef<{
    start: number;
    duration: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    center: THREE.Vector3;
    active: boolean;
  }>({ start: 0, duration: 0, startPos: new THREE.Vector3(), endPos: new THREE.Vector3(), center: new THREE.Vector3(), active: false });
  const nowSec = () => performance.now() / 1000;
  const waveClip = useMemo<Clip>(
    () => ({
      name: "wave",
      frames: [
        { time: 0, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.6, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: 0 } },
        { time: 0.6, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.9, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: 1.2 } },
        { time: 1.2, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.3, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: -1.2 } },
        { time: 1.8, joints: { shoulder_lift_joint: -0.5, shoulder_pan_joint: 0.9, elbow_flex_joint: -1.2, wrist_flex_joint: 0.7, wrist_roll_joint: 1.2 } },
        { time: 2.4, joints: { shoulder_lift_joint: -0.3, shoulder_pan_joint: 0, elbow_flex_joint: -0.5, wrist_flex_joint: 0, wrist_roll_joint: 0 } },
      ],
    }),
    []
  );

  // Expose play function
  useEffect(() => {
    playWaveRef.current = (clip: Clip) => {
      clipRef.current = { clip, start: nowSec() };
    };
  }, []);

  return (
    <div className="w-full h-full relative">
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
        <ambientLight intensity={0.35} color={0xffffff} />
        <directionalLight position={[6, 10, 6]} intensity={1.1} color={0xffffff} castShadow shadow-mapSize={[2048, 2048] as any} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color={0xffffff} />
        <spotLight position={[0, 8, 4]} angle={0.7} penumbra={0.5} intensity={0.6} distance={40} color={0xffffff} />
        <Environment preset="studio" background={false} blur={0.4} />

        <FetchRobot
          urdfUrl={urdfUrl}
          assetsBase={assetsBase}
          robotRef={robotRef}
          jointMapRef={jointMapRef}
          onReady={() => {
            onLoaded?.();
            const startWave = () => {
              playWaveRef.current?.(waveClip);
              const durationMs = waveClip.frames[waveClip.frames.length - 1].time * 1000;
              setTimeout(() => onWaveComplete?.(), durationMs);
            };
            onStartReady?.(startWave);
          }}
        />
        <OrbitControls enableDamping dampingFactor={0.1} maxPolarAngle={Math.PI * 0.48} enablePan />
        <ClipRunner robotRef={robotRef} jointMapRef={jointMapRef} clipRef={clipRef} introAnimRef={introAnimRef} />
      </Canvas>
    </div>
  );
}
