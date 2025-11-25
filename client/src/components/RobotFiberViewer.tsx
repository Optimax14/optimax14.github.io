import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Center } from "@react-three/drei/core/Center";
import { Html } from "@react-three/drei/web/Html";
import { useGLTF } from "@react-three/drei/core/useGLTF";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

type Props = {
  modelPath?: string;
  height?: string | number;
  autoRotate?: boolean;
  interactive?: boolean;
};

function GLBModel({ url, autoRotate = false, interactive = false }: { url: string; autoRotate?: boolean; interactive?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const mixer = useRef<THREE.AnimationMixer>();
  const nodesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const [jointNames, setJointNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [rot, setRot] = useState<[number, number, number]>([0, 0, 0]); // radians

  useEffect(() => {
    if (!scene) return;
    // Compute a uniform scale to fit model in a ~2 unit cube
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const target = 2;
    setScale(target / maxDim);
    setLoaded(true);

    // Collect candidate joints by name heuristics
    const candidates: string[] = [];
    nodesRef.current.clear();
    const patterns = /(joint|bone|arm|shoulder|elbow|wrist|gripper|base)/i;
    scene.traverse(obj => {
      if (!obj.name) return;
      nodesRef.current.set(obj.name, obj);
      if (patterns.test(obj.name)) candidates.push(obj.name);
    });
    setJointNames(candidates);
    setSelected(candidates[0] ?? null);

    // Setup animations if present: play first clip (idle) by default
    if (animations && animations.length) {
      mixer.current = new THREE.AnimationMixer(scene);
      const idle = animations[0];
      const action = mixer.current.clipAction(idle);
      action.reset().fadeIn(0.4).play();
    }

    // Materials: ensure sRGB correct and shadows enabled
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        const all: THREE.Material[] = Array.isArray(mat) ? mat : mat ? [mat] : [];
        all.forEach((m: any) => {
          if (m.map) m.map.colorSpace = SRGBColorSpace;
          if (m.emissiveMap) m.emissiveMap.colorSpace = SRGBColorSpace;
          if (m.roughnessMap) m.roughnessMap.colorSpace = SRGBColorSpace;
          if (m.metalnessMap) m.metalnessMap.colorSpace = SRGBColorSpace;
        });
      }
    });

    return () => {
      mixer.current?.stopAllAction();
      mixer.current?.uncacheRoot(scene);
    };
  }, [scene, animations]);

  useFrame((state, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.2;
    }
    mixer.current?.update(delta);

    // Apply interactive joint rotation to selected node
    if (interactive && selected) {
      const obj = nodesRef.current.get(selected);
      if (obj) {
        obj.rotation.set(rot[0], rot[1], rot[2]);
      }
    }
  });

  return (
    <group ref={group}>
      {scene && loaded && (
        <primitive object={scene} position={[0, 0, 0]} scale={scale} dispose={null} />
      )}
      {interactive && (
        <Html position={[0, 1.6, 0]} center transform occlude>
          <div className="bg-white/95 text-black border border-border rounded-md shadow px-3 py-2 w-[260px]">
            <div className="text-sm font-medium mb-2">Joint Controls</div>
            <div className="mb-2">
              <label className="text-xs text-gray-600">Select joint</label>
              <select
                className="w-full mt-1 border rounded px-2 py-1 text-sm"
                value={selected ?? ""}
                onChange={(e) => setSelected(e.target.value)}
              >
                {jointNames.length === 0 && <option value="">No joints detected</option>}
                {jointNames.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {["X", "Y", "Z"].map((axis, i) => (
                <div key={axis} className="flex items-center gap-2">
                  <span className="w-4 text-xs">{axis}</span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    className="flex-1"
                    value={(rot[i] * 180) / Math.PI}
                    onChange={(e) => {
                      const deg = Number(e.target.value);
                      const r = [...rot] as [number, number, number];
                      r[i] = (deg * Math.PI) / 180;
                      setRot(r);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function RobotFiberViewer({
  modelPath = `${import.meta.env.BASE_URL}Robot_new.glb`,
  height = "75vh",
  autoRotate = false,
  interactive = false,
}: Props) {
  const style = useMemo(() => ({ height }), [height]);

  return (
    <div className="w-full rounded-lg border border-border bg-card overflow-hidden" style={style}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        camera={{ position: [2.8, 1.6, 3.2], fov: 45, near: 0.1, far: 1000 }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          (gl as any).outputColorSpace = SRGBColorSpace;
          gl.shadowMap.enabled = true;
        }}
      >
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={0.6} />
        <hemisphereLight skyColor={0xffffff} groundColor={0x223344} intensity={0.45} />
        <directionalLight
          position={[5, 6, 5]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Suspense
          fallback={
            <Html center>
              <div className="text-sm text-muted-foreground bg-white/90 border border-border rounded px-3 py-2 shadow">
                Loading robot…
              </div>
            </Html>
          }
        >
          <Center top>
            <GLBModel url={modelPath} autoRotate={autoRotate} interactive={interactive} />
          </Center>
          <OrbitControls enableDamping dampingFactor={0.06} minDistance={0.6} maxDistance={10} />
        </Suspense>
      </Canvas>
    </div>
  );
}
