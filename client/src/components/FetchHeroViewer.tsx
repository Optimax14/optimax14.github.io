import { useEffect, useMemo, useRef } from "react"; 
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

let fetchPreload: Promise<THREE.Object3D | null> | null = null;

function ensureFetchPreload(assetsBase: string, urdfUrl: string, onProgress?: (progress: number) => void) {
  if (fetchPreload) return fetchPreload;
  fetchPreload = new Promise((resolve) => {
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_url, loaded, total) => {
      if (total > 0) onProgress?.(loaded / total);
    };
    manager.onLoad = () => onProgress?.(1);
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
  floorPosRef, 
  headTargetRef, 
  onProgress,
}: { 
  urdfUrl: string; 
  assetsBase: string; 
  onReady?: (joints: string[]) => void; 
  onIntroCamera?: (center: THREE.Vector3, startPos: THREE.Vector3, endPos: THREE.Vector3) => void; 
  robotRef: React.MutableRefObject<THREE.Object3D | null>; 
  jointMapRef: React.MutableRefObject<Record<string, any>>; 
  floorPosRef: React.MutableRefObject<THREE.Vector3>; 
  headTargetRef: React.MutableRefObject<{ x: number; y: number; active: boolean }>; 
  onProgress?: (progress: number) => void;
}) { 
  const { scene, camera } = useThree(); 

  useEffect(() => {
    ensureFetchPreload(assetsBase, urdfUrl, onProgress).then((preloaded) => {
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
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        robot.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(robot); 
        const size = box.getSize(new THREE.Vector3()); 
        const rawCenter = box.getCenter(new THREE.Vector3()); 
        const center = rawCenter.clone().add(new THREE.Vector3(0, 0.55, 0)); 
        floorPosRef.current.set(rawCenter.x, box.min.y - 0.015, rawCenter.z); 
        // Keep head pointing forward on load
        headTargetRef.current = { x: 0, y: 0, active: false }; 
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
  }, [urdfUrl, assetsBase, scene, camera, onIntroCamera, onReady, onProgress]);

  return null;
}

function ClipRunner({  
  robotRef,  
  jointMapRef,    
  clipRef,    
  headTargetRef,   
  defaultTargetRef,  
  defaultCamPosRef,  
  enableInteraction,  
  introCamAnimRef, 
  restPose,
}: {    
  robotRef: React.MutableRefObject<THREE.Object3D | null>;    
  jointMapRef: React.MutableRefObject<Record<string, any>>;    
  clipRef: React.MutableRefObject<{ clip: Clip; start: number } | null>;    
  headTargetRef: React.MutableRefObject<{ x: number; y: number; active: boolean }>;    
  defaultTargetRef: React.MutableRefObject<THREE.Vector3>;  
  defaultCamPosRef: React.MutableRefObject<THREE.Vector3 | null>;  
  enableInteraction: boolean;  
  introCamAnimRef: React.MutableRefObject<{ 
    active: boolean; 
    start: number; 
    duration: number; 
    from: THREE.Vector3; 
    to: THREE.Vector3; 
    target: THREE.Vector3; 
  }>; 
  restPose: Record<string, number>;
}) {    
  const nowSec = () => performance.now() / 1000;    
  useFrame(({ camera }) => {   
    // Intro camera drift always runs while active
    if (introCamAnimRef.current.active) {
      const t = Math.min(1, (performance.now() - introCamAnimRef.current.start) / introCamAnimRef.current.duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      camera.position.lerpVectors(introCamAnimRef.current.from, introCamAnimRef.current.to, eased);
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      if (introCamAnimRef.current.target) {
        camera.lookAt(introCamAnimRef.current.target);
      }
      if (t >= 1) introCamAnimRef.current.active = false;
    }

    const applyPose = (pose: Record<string, number>) => {
      Object.entries(pose).forEach(([name, value]) => {
        const j = jointMapRef.current?.[name];
        if (!j || typeof j.setJointValue !== "function") return;
        j.setJointValue(value);
      });
    };

    if (robotRef.current && jointMapRef.current) {  
      if (clipRef.current) {
        const { clip, start } = clipRef.current;  
        const elapsed = nowSec() - start;  
        const duration = clip.frames[clip.frames.length - 1].time;  
        const t = clip.loop ? elapsed % duration : Math.min(elapsed, duration);  
        if (!clip.loop && elapsed >= duration) {  
          clipRef.current = null;
        } else {
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
        }
      }
      // When no clip is playing, hold the rest/default pose
      if (!clipRef.current) {
        applyPose(restPose);
      }
    }

    // Ensure defaults captured for reset
    if (!defaultCamPosRef.current) {
      defaultCamPosRef.current = (camera as THREE.PerspectiveCamera).position.clone();
    }
    if (defaultTargetRef.current.lengthSq() === 0) {
      defaultTargetRef.current.set(0, 1, 0);
    }

    // Head/eye follow (after intro completes)
    if (!introCamAnimRef.current.active && jointMapRef.current) {
      const headPan = jointMapRef.current["head_pan_joint"];
      const headTilt = jointMapRef.current["head_tilt_joint"];
      if (headPan && typeof headPan.setJointValue === "function") {
        const targetX = THREE.MathUtils.clamp(headTargetRef.current.active ? headTargetRef.current.x : 0, -1, 1);
        const desiredPan = THREE.MathUtils.degToRad(targetX * 50); // wider pan range
        const currentPan = headPan.jointValue ?? 0;
        headPan.setJointValue(THREE.MathUtils.lerp(currentPan, desiredPan, 0.12));
      }
      if (headTilt && typeof headTilt.setJointValue === "function") {
        const targetY = THREE.MathUtils.clamp(headTargetRef.current.active ? headTargetRef.current.y : 0, -1, 1);
        // tilt in the same direction as cursor movement (up cursor => head up)
        const desiredTilt = THREE.MathUtils.degToRad(targetY * 30);
        const currentTilt = headTilt.jointValue ?? 0;
        headTilt.setJointValue(THREE.MathUtils.lerp(currentTilt, desiredTilt, 0.12));
      }
    }

    robotRef.current?.updateMatrixWorld(true);
  }); 
  return null; 
} 

function ControlLocker({ controlsRef, introCamAnimRef, enableInteraction }: { controlsRef: React.MutableRefObject<any>; introCamAnimRef: React.MutableRefObject<{ active: boolean }>; enableInteraction: boolean; }) {
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = enableInteraction && !introCamAnimRef.current.active;
    }
  });
  return null;
}

export default function FetchHeroViewer({ 
  onLoaded, 
  onStartReady, 
  onWaveComplete, 
  enableInteraction = true,
  onProgress,
  introCamStart: introCamStartOverride,
  introCamEnd: introCamEndOverride,
  introCamTarget: introCamTargetOverride,
  enableIntroAnimation = true,
}: { 
  onLoaded?: () => void; 
  onStartReady?: (startWave: () => void) => void; 
  onWaveComplete?: () => void; 
  enableInteraction?: boolean;
  onProgress?: (progress: number) => void;
  introCamStart?: [number, number, number];
  introCamEnd?: [number, number, number];
  introCamTarget?: [number, number, number];
  enableIntroAnimation?: boolean;
}) { 
  const assetsBase = resolvePublic("assets/fetch/");
  const urdfUrl = resolvePublic("assets/fetch/fetch.urdf");

const clipRef = useRef<{ clip: Clip; start: number } | null>(null);   
  const robotRef = useRef<THREE.Object3D | null>(null);  
  const jointMapRef = useRef<Record<string, any>>({});  
  const floorPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, -0.02, 0));  
  const headTargetRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const defaultTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.8, 0));
  const defaultCamPosRef = useRef<THREE.Vector3 | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const resetAnimRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const introStartedRef = useRef(false);
  const introStartTimerRef = useRef<number | undefined>(undefined);
  const introCamAnimRef = useRef<{ 
    active: boolean; 
    start: number; 
    duration: number; 
    from: THREE.Vector3; 
    to: THREE.Vector3; 
    target: THREE.Vector3; 
  }>({ 
    active: false, 
    start: 0, 
    duration: 0, 
    from: new THREE.Vector3(), 
    to: new THREE.Vector3(), 
    target: new THREE.Vector3(), 
  }); 
  const restPose = useMemo<Record<string, number>>(
    () => ({
      shoulder_pan_joint: 1.81,
      shoulder_lift_joint: 2.0,
      elbow_flex_joint: 1.71,
      wrist_flex_joint: 1.5,
      wrist_roll_joint: 0.05,
      torso_lift_joint: 0.03,
      upperarm_roll_joint: 0.12,
    }),
    []
  );
  const introCamDuration = 4500;   
  const introPoseClip = useMemo<Clip>( 
    () => ({ 
      name: "intro-pose", 
      frames: [ 
        // Start in the existing relaxed pose
        { time: 0.0, joints: { ...restPose } },
        // Roll arm out to prep for a wave
        { time: 0.9, joints: { shoulder_pan_joint: 1.81, shoulder_lift_joint: 1.8, elbow_flex_joint: 1.5, wrist_flex_joint: 1.2, wrist_roll_joint: -0.2, torso_lift_joint: 0.06, upperarm_roll_joint: -2.8 } },
        // Wave up
        { time: 1.4, joints: { shoulder_pan_joint: 1.3, shoulder_lift_joint: 0.6, elbow_flex_joint: 0.3, wrist_flex_joint: 0.9, wrist_roll_joint: -0.5, torso_lift_joint: 0.06, upperarm_roll_joint: -2.8 } },
        // Wave down
        { time: 1.9, joints: { shoulder_pan_joint: 1.3, shoulder_lift_joint: 1.0, elbow_flex_joint: 0.8, wrist_flex_joint: 0.6, wrist_roll_joint: -0.2, torso_lift_joint: 0.06, upperarm_roll_joint: -2.8 } },
        // Wave up
        { time: 2.4, joints: { shoulder_pan_joint: 1.3, shoulder_lift_joint: 0.6, elbow_flex_joint: 0.3, wrist_flex_joint: 0.9, wrist_roll_joint: -0.5, torso_lift_joint: 0.06, upperarm_roll_joint: -2.8 } },
        // Wave down
        { time: 2.9, joints: { shoulder_pan_joint: 1.3, shoulder_lift_joint: 1.0, elbow_flex_joint: 0.8, wrist_flex_joint: 0.6, wrist_roll_joint: -0.2, torso_lift_joint: 0.06, upperarm_roll_joint: -2.8 } },
        // Settle slightly more neutral
        { time: 3.6, joints: { shoulder_pan_joint: 1.1, shoulder_lift_joint: 1.4, elbow_flex_joint: 1.0, wrist_flex_joint: 0.4, wrist_roll_joint: -0.1, torso_lift_joint: 0.05, upperarm_roll_joint: -2.0 } },
      ], 
    }), 
    [restPose] 
  ); 
  const nowSec = () => performance.now() / 1000;
const playClip = (clip: Clip) => {  
  clipRef.current = { clip, start: nowSec() };  
};  
  const startIntroClip = useMemo(() => {
    return () => {
      playClip(introPoseClip);
      const introMs = introPoseClip.frames[introPoseClip.frames.length - 1].time * 1000;
      setTimeout(() => {
        onWaveComplete?.();
      }, introMs + 1000);
    };
  }, [introPoseClip, onWaveComplete]);
 
// Clear any clips when interaction disabled; nothing auto-plays now
useEffect(() => {
  if (!enableInteraction) {
    clipRef.current = null;
    headTargetRef.current = { x: 0, y: 0, active: false };
  }
}, [enableInteraction]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (e.clientX / w) * 2 - 1; // -1 to 1 across viewport
      const ny = (e.clientY / h) * 2 - 1;
      if (!enableInteraction || introCamAnimRef.current.active) return;
      headTargetRef.current = { x: THREE.MathUtils.clamp(nx, -1, 1), y: THREE.MathUtils.clamp(ny, -1, 1), active: true };
    };
    const handleLeave = () => {
      headTargetRef.current = { x: 0, y: 0, active: false };
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("blur", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("blur", handleLeave);
    };
  }, [enableInteraction]);

  // Unlock camera after intro or resize
  useEffect(() => {
    const unlock = () => {
      introCamAnimRef.current.active = false;
      if (controlsRef.current) controlsRef.current.enabled = true;
    };
    window.addEventListener("resize", unlock);
    return () => window.removeEventListener("resize", unlock);
  }, []);

  // Inactivity reset: return camera to default after timeout
  useEffect(() => {
    if (!enableInteraction) return;
    let timeout: number | undefined;
    const smoothReset = () => {
      if (!defaultCamPosRef.current || !cameraRef.current || !controlsRef.current) return;
      if (resetAnimRef.current) cancelAnimationFrame(resetAnimRef.current);
      const startPos = cameraRef.current.position.clone();
      const endPos = defaultCamPosRef.current.clone();
      const startTarget = controlsRef.current.target.clone();
      const endTarget = defaultTargetRef.current.clone();
      const duration = 1200;
      const start = performance.now();
      const animate = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        cameraRef.current!.position.lerpVectors(startPos, endPos, eased);
        controlsRef.current.target.lerpVectors(startTarget, endTarget, eased);
        controlsRef.current.update();
        if (t < 1) {
          resetAnimRef.current = requestAnimationFrame(animate);
        } else {
          resetAnimRef.current = null;
        }
      };
      resetAnimRef.current = requestAnimationFrame(animate);
    };
    const resetView = () => {
      smoothReset();
    };
    const resetTimer = () => {
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(resetView, 2000);
    };

    const node = containerRef.current;
    if (!node) return;
    const handleMove = () => resetTimer();
    resetTimer();
    node.addEventListener("pointermove", handleMove);
    node.addEventListener("wheel", handleMove, { passive: true });
    node.addEventListener("touchstart", handleMove, { passive: true });
    node.addEventListener("pointerdown", handleMove);
    node.addEventListener("pointerenter", handleMove);
    return () => {
      if (timeout) window.clearTimeout(timeout);
      node.removeEventListener("pointermove", handleMove);
      node.removeEventListener("wheel", handleMove);
      node.removeEventListener("touchstart", handleMove);
      node.removeEventListener("pointerdown", handleMove);
      node.removeEventListener("pointerenter", handleMove);
    };
  }, [enableInteraction]);

  // Cleanup any pending intro timer on unmount
  useEffect(() => {
    return () => {
      if (introStartTimerRef.current) {
        clearTimeout(introStartTimerRef.current);
      }
    };
  }, []);

  return ( 
    <div className="w-full h-full relative" ref={containerRef}> 
      <Canvas 
        shadows 
        camera={{ position: [2.5, 1.5, 2.5], fov: 45, near: 0.01, far: 100 }} 
        gl={{ 
          antialias: true, 
          alpha: true, 
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 1.0, 
          shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap }, 
        } as any} 
        onCreated={({ camera }) => { 
          cameraRef.current = camera as THREE.PerspectiveCamera; 
        }} 
      > 
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={0.35} color={0xffffff} />
        <directionalLight position={[6, 10, 6]} intensity={1.1} color={0xffffff} castShadow shadow-mapSize={[2048, 2048] as any} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color={0xffffff} />
        <spotLight position={[0, 8, 4]} angle={0.7} penumbra={0.5} intensity={0.6} distance={40} color={0xffffff} />
        {/* Soft floor to ground the robot */} 
        <mesh  
          rotation={[-Math.PI / 2, 0, 0]}  
          position={[floorPosRef.current.x, floorPosRef.current.y, floorPosRef.current.z]}  
          receiveShadow  
        >  
          <circleGeometry args={[2, 64]} />  
          <meshStandardMaterial color="#bcc2cc" roughness={0.92} metalness={0.0} />  
        </mesh>  
        <ContactShadows  
          position={[floorPosRef.current.x, floorPosRef.current.y + 0.004, floorPosRef.current.z]}  
          opacity={0.6}  
          width={9}  
          height={9}  
          blur={2.4}  
          far={10}  
        />  
        <Environment preset="studio" background={false} blur={0.4} />

        <FetchRobot  
          urdfUrl={urdfUrl}  
          assetsBase={assetsBase}  
          robotRef={robotRef}  
          jointMapRef={jointMapRef}  
          floorPosRef={floorPosRef} 
          headTargetRef={headTargetRef}
          onProgress={onProgress}
          onIntroCamera={(center, _startPosInput, _endPosInput) => {
            // Manual camera control: use overrides when provided, otherwise a simple front-facing default.
            const defaultStart = center.clone().add(new THREE.Vector3(0, 0, 0));
            const defaultEnd = center.clone().add(new THREE.Vector3(2, 0, 0));

            const frontStart = introCamStartOverride ? new THREE.Vector3(...introCamStartOverride) : defaultStart;
            const frontEnd = introCamEndOverride ? new THREE.Vector3(...introCamEndOverride) : defaultEnd;
            const target = introCamTargetOverride ? new THREE.Vector3(...introCamTargetOverride) : center.clone();
            if (cameraRef.current) {
              cameraRef.current.position.copy(enableIntroAnimation ? frontStart : frontEnd);
              cameraRef.current.lookAt(target);
              cameraRef.current.updateProjectionMatrix();
            }
            if (controlsRef.current) {
              controlsRef.current.target.copy(target);
              controlsRef.current.update();
            }
            defaultTargetRef.current.copy(target);
            defaultCamPosRef.current = frontEnd.clone();
            introCamAnimRef.current = enableIntroAnimation
              ? {
                  active: true,
                  start: performance.now(),
                  duration: introCamDuration,
                  from: frontStart.clone(),
                  to: frontEnd.clone(),
                  target: target.clone(),
                }
              : { active: false, start: 0, duration: 0, from: frontEnd.clone(), to: frontEnd.clone(), target: target.clone() };
          }}
          onReady={() => {  
            onLoaded?.();  
            if (enableIntroAnimation) {
              // Only kick off the wave after the intro camera move finishes
              const startAfterCamera = () => {
                if (introStartedRef.current) return;
                introStartedRef.current = true;
                introStartTimerRef.current = window.setTimeout(() => {
                  startIntroClip();
                }, introCamDuration);
              };
              onStartReady?.(startAfterCamera);
            } else {
              onWaveComplete?.();
            }
          }}  
        />  
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.1}
          maxPolarAngle={Math.PI * 0.48}
          enablePan
          enabled={enableInteraction}
        /> 
        <ControlLocker
          controlsRef={controlsRef}
          introCamAnimRef={introCamAnimRef}
          enableInteraction={enableInteraction}
        />
        <ClipRunner
          robotRef={robotRef}
          jointMapRef={jointMapRef}
          clipRef={clipRef}
          headTargetRef={headTargetRef}
          defaultTargetRef={defaultTargetRef}
          defaultCamPosRef={defaultCamPosRef}
          enableInteraction={enableInteraction}
          introCamAnimRef={introCamAnimRef}
          restPose={restPose}
        /> 
      </Canvas> 
    </div> 
  ); 
} 
