import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import URDFLoader from "urdf-loader";

const baseUrl = (() => {
  const b = (import.meta as any).env?.BASE_URL || "/";
  return b.endsWith("/") ? b : `${b}/`;
})();
const resolvePublic = (p: string) => `${baseUrl}${p.replace(/^\/+/, "")}`;

type JointValues = Record<string, number>;

function FetchRobot({
  urdfUrl,
  assetsBase,
  basePose,
  jointValues,
  onStatus,
  onJointsDetected,
}: {
  urdfUrl: string;
  assetsBase: string;
  basePose?: JointValues;
  jointValues?: JointValues;
  onStatus?: (loading: boolean, error: string | null) => void;
  onJointsDetected?: (names: string[]) => void;
}) {
  const { scene, camera } = useThree();
  const robotRef = useRef<THREE.Object3D | null>(null);
  const jointMapRef = useRef<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    (loader as any).packages = { fetch: assetsBase, fetch_description: assetsBase };
    loader.workingPath = assetsBase;
    loader.fetchOptions = { credentials: "same-origin", mode: "cors" };

    manager.onStart = () => onStatus?.(true, null);
    manager.onError = (url) => {
      console.error("URDF asset error", url);
      onStatus?.(false, `Could not load asset: ${url}`);
    };

    loader.load(
      urdfUrl,
      (robot: any) => {
        if (robotRef.current) {
          scene.remove(robotRef.current);
        }
        robotRef.current = robot;
        jointMapRef.current = robot.joints ?? {};
        robot.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(robot);
        robot.updateMatrixWorld(true);

        // smooth shading
        robot.traverse((node: any) => {
          if (node.isMesh) {
            const g = node.geometry as THREE.BufferGeometry | undefined;
            if (g && !g.attributes.normal) g.computeVertexNormals();
            const m = (node.material ||= new THREE.MeshStandardMaterial());
            if ("flatShading" in m) m.flatShading = false;
            if ("roughness" in m) m.roughness = 0.45;
            if ("metalness" in m) m.metalness = 0.05;
            node.castShadow = true;
            node.receiveShadow = true;
            m.needsUpdate = true;
          }
        });

        // apply base pose
        if (basePose) {
          Object.entries(basePose).forEach(([name, val]) => {
            const j = jointMapRef.current[name];
            if (j && typeof j.setJointValue === "function") j.setJointValue(val);
          });
          robot.updateMatrixWorld(true);
        }

        const joints = Object.entries(robot.joints ?? {})
          .filter(([, j]: any) => (j.jointType || "").toLowerCase() !== "fixed")
          .map(([name]) => name);
        onJointsDetected?.(joints);

        // simple fit
        const box = new THREE.Box3().setFromObject(robot);
        const center = box.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0, 1, 0));
        const size = box.getSize(new THREE.Vector3()).length();
        const dist = Math.max(2.5, size * 0.8);
        camera.position.set(center.x + dist * 0.4, center.y + dist * 0.3, center.z + dist * 0.9);
        camera.lookAt(center);
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

        setLoading(false);
        onStatus?.(false, null);
      },
      undefined,
      (err) => {
        console.error("Failed to load URDF", err);
        onStatus?.(false, "Failed to load URDF. Check asset paths.");
        setLoading(false);
      }
    );

    return () => {
      if (robotRef.current) scene.remove(robotRef.current);
    };
  // Only reload when asset path changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urdfUrl, assetsBase]);

  useFrame(() => {
    if (!robotRef.current) return;
    if (jointValues) {
      Object.entries(jointValues).forEach(([name, value]) => {
        const j = jointMapRef.current[name];
        if (j && typeof j.setJointValue === "function") {
          j.setJointValue(value);
        }
      });
    }
    robotRef.current.updateMatrixWorld(true);
  });

  return null;
}

export default function FetchDemo() {
  const assetsBase = resolvePublic("assets/fetch/");
  const urdfUrl = resolvePublic("assets/fetch/fetch.urdf");
  const basePose: JointValues = {
    shoulder_pan_joint: 1.2,
    shoulder_lift_joint: -0.3,
    elbow_flex_joint: -0.2,
    forearm_roll_joint: 0,
    wrist_flex_joint: 0,
    wrist_roll_joint: 0,
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jointNames, setJointNames] = useState<string[]>([]);
  const [jointValues, setJointValues] = useState<JointValues>({});

  const resetJoints = () => {
    setJointValues(() => {
      const next: JointValues = {};
      jointNames.forEach((n) => (next[n] = 0));
      return next;
    });
  };

  return (
    <section className="section-padding">
      <div className="space-y-6 max-w-none">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Static GitHub Pages</p>
          <h1 className="text-3xl font-bold">Fetch Robot — Joint Tweaks</h1>
          <p className="text-muted-foreground max-w-3xl">
            Move sliders to set joint angles in real time. No extra animations or auto camera moves.
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
          <Canvas shadows camera={{ position: [2.6, 1.4, 2.6], fov: 45, near: 0.01, far: 100 }}>
            <color attach="background" args={["#ffffff"]} />
            <ambientLight intensity={0.35} color={0xffffff} />
            <directionalLight position={[6, 10, 6]} intensity={1.1} color={0xffffff} castShadow shadow-mapSize={[2048, 2048] as any} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} color={0xffffff} />
            <spotLight position={[0, 8, 4]} angle={0.7} penumbra={0.5} intensity={0.6} distance={40} color={0xffffff} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
              <circleGeometry args={[4.5, 64]} />
              <meshStandardMaterial color="#e1e4ea" roughness={0.9} metalness={0.0} />
            </mesh>
            <ContactShadows position={[0, -0.015, 0]} opacity={0.4} width={10} height={10} blur={2.5} far={10} />
            <Environment preset="studio" background={false} blur={0.3} />
            <FetchRobot
              urdfUrl={urdfUrl}
              assetsBase={assetsBase}
              basePose={basePose}
              jointValues={jointValues}
              onStatus={(loadingState, err) => {
                setLoading(loadingState);
                setError(err);
              }}
              onJointsDetected={(names) => {
                setJointNames(names);
                setJointValues((prev) => {
                  const next: JointValues = { ...prev };
                  names.forEach((n) => {
                    if (typeof next[n] !== "number") next[n] = 0;
                  });
                  return next;
                });
              }}
            />
            <OrbitControls enableDamping dampingFactor={0.1} maxPolarAngle={Math.PI * 0.48} enablePan />
          </Canvas>
        </div>

        <div className="border border-border rounded-lg p-4 bg-card/50">
          <h2 className="text-lg font-semibold mb-2">Live Joint Tweaks</h2>
          {jointNames.length === 0 && <p className="text-sm text-muted-foreground">Loading joints…</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jointNames.map((name) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">{(jointValues[name] ?? 0).toFixed(2)} rad</span>
                </div>
                <input
                  type="range"
                  min={-3.2}
                  max={3.2}
                  step={0.01}
                  value={jointValues[name] ?? 0}
                  onChange={(e) => setJointValues((prev) => ({ ...prev, [name]: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          {jointNames.length > 0 && (
            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-2 rounded bg-white shadow text-sm border border-border"
                onClick={resetJoints}
              >
                Reset joints
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Assets served from <code className="px-1 py-0.5 rounded bg-card border border-border">/assets/fetch/</code>. No backend required.
        </p>
      </div>
    </section>
  );
}
