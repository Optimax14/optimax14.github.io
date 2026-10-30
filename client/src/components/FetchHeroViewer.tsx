import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { fetchJoints, fetchRest, fetchWave } from "@/data/fetch-rig";
import { asset } from "@/data/research";
export type FetchActions = { wave: () => void; reset: () => void };
let modelPromise: Promise<THREE.Group> | undefined;
let environmentPromise: Promise<THREE.DataTexture> | undefined;
function loadModel() {
  if (!modelPromise) {
    const decoder = new DRACOLoader()
      .setDecoderPath(asset("research/fetch/draco/"))
      .setWorkerLimit(1);
    modelPromise = new GLTFLoader()
      .setDRACOLoader(decoder)
      .loadAsync(asset("research/fetch/fetch-original-quality.glb"))
      .then(gltf => {
        decoder.dispose();
        gltf.scene.traverse(node => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            const materials = Array.isArray(node.material)
              ? node.material
              : [node.material];
            materials.forEach(material => {
              if (material instanceof THREE.MeshStandardMaterial) {
                material.roughness = 0.45;
                material.metalness = 0.05;
                material.flatShading = false;
              }
            });
          }
        });
        return gltf.scene;
      })
      .catch(error => {
        decoder.dispose();
        modelPromise = undefined;
        throw error;
      });
  }
  return modelPromise;
}
function loadEnvironment() {
  if (!environmentPromise)
    environmentPromise = new RGBELoader()
      .loadAsync(asset("research/fetch/studio-256.hdr"))
      .catch(error => {
        environmentPromise = undefined;
        throw error;
      });
  return environmentPromise;
}
export default function FetchHeroViewer({
  onLoaded,
  onError,
  actionsRef,
}: {
  onLoaded: () => void;
  onError: () => void;
  actionsRef: MutableRefObject<FetchActions | null>;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      onError();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      "Interactive Fetch robot. Arrow keys rotate; plus and minus zoom."
    );
    element.appendChild(canvas);
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 2.4);
    light.position.set(4, 6, 4);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.left = -2;
    light.shadow.camera.right = 2;
    light.shadow.camera.top = 3;
    light.shadow.camera.bottom = -2;
    light.shadow.bias = -0.0004;
    scene.add(light);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(-3, 3, -3);
    scene.add(fill);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.11 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.005;
    floor.receiveShadow = true;
    scene.add(floor);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const defaultPosition = new THREE.Vector3(2.6, 1.4, 1.05);
    camera.position.copy(defaultPosition);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.8, 0);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.minDistance = 1.7;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.update();
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false,
      visible = true,
      frame = 0,
      waveStart = 0;
    let clone: THREE.Group | null = null,
      environment: THREE.WebGLRenderTarget | null = null;
    let headPan = 0,
      headTilt = 0,
      targetPan = 0,
      targetTilt = 0;
    type Joint = {
      node: THREE.Object3D;
      axis: THREE.Vector3;
      quaternion: THREE.Quaternion;
      position: THREE.Vector3;
      type: string;
      min: number;
      max: number;
    };
    const rig: Record<string, Joint> = {};
    const setJoint = (name: string, value: number) => {
      const joint = rig[name];
      if (!joint) return;
      const angle = THREE.MathUtils.clamp(value, joint.min, joint.max);
      if (joint.type === "prismatic")
        joint.node.position
          .copy(joint.position)
          .addScaledVector(joint.axis, angle);
      else
        joint.node.quaternion
          .copy(joint.quaternion)
          .multiply(new THREE.Quaternion().setFromAxisAngle(joint.axis, angle));
    };
    const pose = (values: Record<string, number>) =>
      Object.entries(values).forEach(([name, value]) => setJoint(name, value));
    let previousFrame = 0;
    const draw = (now: number) => {
      const delta = previousFrame
        ? Math.min((now - previousFrame) / 1000, 0.1)
        : 1 / 60;
      previousFrame = now;
      frame = 0;
      if (cancelled || !visible) return;
      let moving = false;
      if (waveStart && clone) {
        const time = (now - waveStart) / 1000;
        if (time >= 3.6) {
          waveStart = 0;
          pose(fetchRest);
        } else {
          let index = 0;
          while (
            index < fetchWave.length - 2 &&
            fetchWave[index + 1].time < time
          )
            index++;
          const a = fetchWave[index],
            b = fetchWave[index + 1],
            alpha = THREE.MathUtils.clamp(
              (time - a.time) / (b.time - a.time),
              0,
              1
            );
          for (const name of Object.keys(fetchRest))
            setJoint(
              name,
              THREE.MathUtils.lerp(a.pose[name], b.pose[name], alpha)
            );
          moving = true;
        }
      }
      if (!motion.matches && clone) {
        headPan = THREE.MathUtils.lerp(
          headPan,
          targetPan,
          1 - Math.exp(-14 * delta)
        );
        headTilt = THREE.MathUtils.lerp(
          headTilt,
          targetTilt,
          1 - Math.exp(-14 * delta)
        );
        setJoint("head_pan_joint", headPan);
        setJoint("head_tilt_joint", headTilt);
        moving ||=
          Math.abs(headPan - targetPan) > 0.001 ||
          Math.abs(headTilt - targetTilt) > 0.001;
      }
      renderer.render(scene, camera);
      if (moving) invalidate();
    };
    const invalidate = () => {
      if (!frame && !cancelled && visible) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      invalidate();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const intersection = new IntersectionObserver(
      entries => {
        visible = entries[0].isIntersecting;
        if (visible) invalidate();
        else {
          waveStart = 0;
          pose(fetchRest);
        }
      },
      { threshold: 0.05 }
    );
    intersection.observe(element);
    controls.addEventListener("change", invalidate);
    const pointer = (event: PointerEvent) => {
      if (motion.matches || !visible || !clone) return;
      targetPan = ((event.clientX / innerWidth) * 2 - 1) * 0.8;
      targetTilt = ((event.clientY / innerHeight) * 2 - 1) * 0.4;
      invalidate();
    };
    const leave = () => {
      targetPan = 0;
      targetTilt = 0;
      invalidate();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "+", "=", "-"].includes(event.key))
        return;
      event.preventDefault();
      const offset = camera.position.clone().sub(controls.target);
      if (event.key.startsWith("Arrow"))
        offset.applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          event.key === "ArrowLeft" ? 0.15 : -0.15
        );
      else
        offset
          .multiplyScalar(event.key === "-" ? 1.1 : 0.9)
          .clampLength(1.7, 5);
      camera.position.copy(controls.target.clone().add(offset));
      controls.update();
      invalidate();
    };
    const motionChange = () => {
      if (motion.matches) {
        waveStart = 0;
        pose(fetchRest);
        headPan = 0;
        headTilt = 0;
        targetPan = 0;
        targetTilt = 0;
        setJoint("head_pan_joint", 0);
        setJoint("head_tilt_joint", 0);
        invalidate();
      }
    };
    motion.addEventListener("change", motionChange);
    const contextLost = (event: Event) => {
      event.preventDefault();
      if (!cancelled) onError();
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("blur", leave);
    document.addEventListener("mouseleave", leave);
    canvas.addEventListener("keydown", handleKey);
    canvas.addEventListener("webglcontextlost", contextLost);
    const pmrem = new THREE.PMREMGenerator(renderer);
    loadEnvironment()
      .then(texture => {
        if (cancelled) return;
        environment = pmrem.fromEquirectangular(texture);
        scene.environment = environment.texture;
        invalidate();
      })
      .catch(() => {
        /* Lighting remains usable if optional studio illumination fails. */
      });
    loadModel()
      .then(source => {
        if (cancelled) return;
        clone = source.clone(true);
        for (const [name, spec] of Object.entries(fetchJoints)) {
          const node = clone.getObjectByName(name);
          if (node)
            rig[name] = {
              node,
              axis: new THREE.Vector3(
                ...(spec.axis as [number, number, number])
              ),
              quaternion: node.quaternion.clone(),
              position: node.position.clone(),
              type: spec.type,
              min: spec.min,
              max: spec.max,
            };
        }
        pose(fetchRest);
        clone.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(clone),
          center = box.getCenter(new THREE.Vector3());
        clone.position.x -= center.x;
        clone.position.z -= center.z;
        scene.add(clone);
        actionsRef.current = {
          wave: () => {
            if (motion.matches) return;
            waveStart = performance.now();
            invalidate();
          },
          reset: () => {
            waveStart = 0;
            pose(fetchRest);
            camera.position.copy(defaultPosition);
            controls.target.set(0, 0.8, 0);
            controls.update();
            leave();
          },
        };
        renderer.render(scene, camera);
        onLoaded();
        if (!motion.matches) {
          waveStart = performance.now();
          invalidate();
        }
      })
      .catch(() => {
        if (!cancelled) onError();
      });
    return () => {
      motion.removeEventListener("change", motionChange);
      cancelled = true;
      actionsRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("blur", leave);
      document.removeEventListener("mouseleave", leave);
      canvas.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("webglcontextlost", contextLost);
      controls.removeEventListener("change", invalidate);
      controls.dispose();
      environment?.dispose();
      pmrem.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [onLoaded, onError, actionsRef]);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}
