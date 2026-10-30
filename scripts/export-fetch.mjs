// One-time conversion entry. Bundled for a local browser, never shipped to visitors.
import * as THREE from "three";
import URDFLoader from "urdf-loader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
export async function exportFetch() {
  return await new Promise((resolve, reject) => {
    const manager = new THREE.LoadingManager();
    let model;
    manager.onError = url => reject(new Error("Failed to load " + url));
    const loader = new URDFLoader(manager);
    const base = "/assets/fetch/";
    loader.packages = { fetch: base, fetch_description: base };
    loader.workingPath = base;
    manager.onLoad = async () => {
      if (!model) return;
      model.rotation.x = -Math.PI / 2;
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model),
        center = bounds.getCenter(new THREE.Vector3());
      model.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
      model.updateMatrixWorld(true);
      let triangles = 0,
        meshes = 0;
      model.traverse(node => {
        if (node.isMesh) {
          meshes++;
          triangles +=
            (node.geometry.index?.count ||
              node.geometry.attributes.position.count) / 3;
          delete node.userData.urdfNode;
        }
      });
      // Drop XML nodes and URDF-specific bookkeeping; preserve visible geometry and transforms.
      model.traverse(node => {
        node.userData = {};
      });
      const result = await new GLTFExporter().parseAsync(model, {
        binary: true,
        onlyVisible: true,
        maxTextureSize: 512,
      });
      const bytes = new Uint8Array(result);
      let raw = "";
      for (let i = 0; i < bytes.length; i += 8192)
        raw += String.fromCharCode(...bytes.subarray(i, i + 8192));
      resolve({ base64: btoa(raw), bytes: bytes.length, triangles, meshes });
    };
    loader.load(
      base + "fetch.urdf",
      robot => (model = robot),
      undefined,
      reject
    );
  });
}
