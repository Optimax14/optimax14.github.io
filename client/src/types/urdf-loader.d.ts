import * as THREE from "three";

declare module "urdf-loader" {
  export type URDFJointType = "revolute" | "continuous" | "prismatic" | "fixed" | string;

  export interface URDFJoint extends THREE.Object3D {
    name: string;
    type: URDFJointType;
    limit?: {
      lower?: number;
      upper?: number;
    };
    setJointValue(value: number): void;
    jointValue?: number;
  }

  export class URDFRobot extends THREE.Group {
    joints: Record<string, URDFJoint>;
    setJointValue(name: string, value: number): void;
  }

  export default class URDFLoader extends THREE.Loader {
    constructor(manager?: THREE.LoadingManager);
    workingPath: string;
    packages: Record<string, string> | ((pkg: string) => string);
    fetchOptions: RequestInit;
    load(
      url: string,
      onLoad: (robot: URDFRobot) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (event: ErrorEvent | unknown) => void
    ): void;
    loadMeshCb?: (
      path: string,
      manager: THREE.LoadingManager,
      onComplete: (object: THREE.Object3D) => void
    ) => void;
  }
}
