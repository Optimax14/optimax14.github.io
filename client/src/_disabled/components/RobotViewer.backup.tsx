import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  Center,
  useGLTF,
  Box,
} from "@react-three/drei";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

/** Describe a joint we can rotate */
type Joint = {
  name: string;
  rotation: [number, number, number];
  limits: [number, number]; // min/max around Y for this demo
};

/** Load + prepare the GLTF, detect joints/links, compute a nice scale, and wire up interactions */
function RobotModel({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelScale, setModelScale] = useState(1);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [joints, setJoints] = useState<Record<string, Joint>>({});

  // Compute scale to fit model into a ~2 unit cube
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2;
    setModelScale(targetSize / maxDim);
    setModelLoaded(true);
  }, [scene]);

  // Find meshes named *joint* or *link* and set defaults; also enable shadows & make materials non-transparent
  useEffect(() => {
    if (!scene) return;
    const discovered: Record<string, Joint> = {};
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const lname = (mesh.name || "").toLowerCase();
        if (lname.includes("joint") || lname.includes("link")) {
          discovered[mesh.name] = {
            name: mesh.name,
            rotation: [0, 0, 0],
            limits: [-Math.PI / 2, Math.PI / 2],
          };
        }

        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((mat) => (mat.transparent = false));
        else if (m) m.transparent = false;
      }
    });
    setJoints(discovered);

    // cleanup: dispose if this component unmounts
    return () => {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
          else (mat as THREE.Material | undefined)?.dispose?.();
        }
      });
    };
  }, [scene]);

  // Apply joint rotations every frame
  useFrame(() => {
    if (!group.current) return;
    group.current.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && joints[mesh.name]) {
        const j = joints[mesh.name];
        mesh.rotation.set(j.rotation[0], j.rotation[1], j.rotation[2]);
      }
    });
  });

  // Pointer interactions
  const onPointerOver = (e: any) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    if (joints[mesh.name]) {
      setHoveredPart(mesh.name);
      document.body.style.cursor = "pointer";
    }
  };
  const onPointerOut = () => {
    setHoveredPart(null);
    document.body.style.cursor = "auto";
  };
  const onClick = (e: any) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    const j = joints[mesh.name];
    if (!j) return;
    const next = { ...joints };
    const current = next[mesh.name].rotation.slice() as [number, number, number];
    current[1] = current[1] === 0 ? j.limits[1] : 0; // simple toggle around Y
    next[mesh.name] = { ...j, rotation: current };
    setJoints(next);
  };

  // Helpful overlay label
  const hoverLabel = useMemo(
    () =>
      hoveredPart ? (
        <Html center>
          <div className="bg-white/90 px-2 py-1 rounded text-sm shadow-sm">
            {hoveredPart}
          </div>
        </Html>
      ) : null,
    [hoveredPart]
  );

  return (
    <group ref={group}>
      {/* Debug cube to verify rendering */}
      <Box position={[0, 0, 0]} args={[0.2, 0.2, 0.2]}>
        <meshStandardMaterial color="orange" />
      </Box>

      {scene && modelLoaded && (
        <primitive
          object={scene}
          position={[0, 0, 0]}
          scale={modelScale}
          dispose={null}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={onClick}
        />
      )}

      {hoverLabel}
    </group>
  );
}

export default function RobotViewer({
  modelPath = "/Robot_new.gltf",
  height = "75vh",
}: {
  modelPath?: string;
  height?: string | number;
}) {
  const style = useMemo(() => ({ height }), [height]);

  return (
    <div
      className="w-full rounded-lg border border-border bg-card overflow-hidden"
      style={style}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        camera={{ position: [2.8, 1.6, 3.2], fov: 45, near: 0.1, far: 1000 }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
          gl.shadowMap.enabled = true;
        }}
      >
        <color attach="background" args={["#ffffff"]} />
        {/* Ambient + key light */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <Suspense
          fallback={
            <Html center>
              <div className="text-sm text-muted-foreground bg-white/90 border border-border rounded px-3 py-2 shadow">
                Loading model…
              </div>
            </Html>
          }
        >
          {/* Center keeps the model framed nicely */}
          <Center top>
            <RobotModel url={modelPath} />
          </Center>

          {/* nice studio image-based lighting */}
          <Environment preset="studio" />
          <OrbitControls enableDamping dampingFactor={0.06} minDistance={0.6} maxDistance={10} />
        </Suspense>
      </Canvas>
    </div>
  );
}
