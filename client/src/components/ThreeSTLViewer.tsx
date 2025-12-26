import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

type Props = {
  src?: string; // STL path
  height?: string | number;
  background?: string;
  color?: string;
  metalness?: number;
  roughness?: number;
};

export default function ThreeSTLViewer({
  src = `${import.meta.env.BASE_URL}Robot_new.stl`,
  height = "75vh",
  background = "#ffffff",
  color = "#8899ff",
  metalness = 0.1,
  roughness = 0.4,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    scene.fog = new THREE.Fog(new THREE.Color(background), 15, 40);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(3.5, 2.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights: balanced, good highlights + ambient fill
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.7);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 7, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 50;
    dir.shadow.camera.left = -10;
    dir.shadow.camera.right = 10;
    dir.shadow.camera.top = 10;
    dir.shadow.camera.bottom = -10;
    scene.add(dir);

    // Soft shadow receiver plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Root group for model (for centering/scaling/floating)
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    let modelMesh: THREE.Mesh | null = null;
    let rafId: number | null = null;

    async function loadModel() {
      const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
      const loader = new STLLoader();
      loader.load(
        src,
        (geometry) => {
          geometry.computeVertexNormals();

          const material = new THREE.MeshStandardMaterial({
            color,
            metalness,
            roughness,
            side: THREE.DoubleSide,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = false;

          // STL is often Z-up; rotate to Y-up
          mesh.rotation.x = -Math.PI / 2;

          // Center and scale to fit into target size
          const box = new THREE.Box3().setFromObject(mesh);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          mesh.position.sub(center);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const target = 2.0; // world-units
          const scale = target / maxDim;
          mesh.scale.setScalar(scale);

          modelRoot.add(mesh);
          modelMesh = mesh;
        },
        undefined,
        (err) => {
          console.error("Failed to load STL:", err);
        }
      );
    }

    // OrbitControls (dynamically imported to avoid bundling everything)
    let controls: any;
    let disposeControls: (() => void) | undefined;
    (async () => {
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.minDistance = 1.0;
      controls.maxDistance = 20.0;
      controls.target.set(0, 0, 0);
      disposeControls = () => controls?.dispose();
    })();

    loadModel();

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      // gentle float + slow turn
      modelRoot.position.y = Math.sin(t * 0.8) * 0.15;
      modelRoot.rotation.y = t * 0.25;

      controls?.update?.();
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      disposeControls?.();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      // dispose geometry/material
      if (modelMesh) {
        modelMesh.geometry.dispose();
        if (Array.isArray(modelMesh.material))
          modelMesh.material.forEach((m) => m.dispose());
        else modelMesh.material.dispose();
      }
    };
  }, [src, background, color, metalness, roughness]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-border bg-card overflow-hidden"
      style={{ height }}
    />
  );
}
