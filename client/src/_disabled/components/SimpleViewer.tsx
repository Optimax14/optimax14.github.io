import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SimpleViewer({
  height = "50vh",
  background = "#ffffff",
}: {
  height?: string | number;
  background?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(3, 2.5, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 6, 5);
    scene.add(dir);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xffa500, metalness: 0.1, roughness: 0.4 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    let controls: any;
    (async () => {
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enableZoom = true;
      controls.enablePan = true;
    })();

    let raf: number | null = null;
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      controls?.update?.();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, [background]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-border bg-card overflow-hidden"
      style={{ height }}
    />
  );
}
