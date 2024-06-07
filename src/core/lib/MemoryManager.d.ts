import * as THREE from "three";

declare class MemoryManager {

    resources: Set<any>;

    constructor (): void;

    track ( resource: any ): void;

    untrack ( resource: any ): void;

    dispose ( removeFromParent: boolean ): void;

    clear (): void;

    static memoryManager: MemoryManager;

    static dispose ( object: THREE.Object3D | THREE.Object3D[], removeFromParent: boolean ): void;
}

