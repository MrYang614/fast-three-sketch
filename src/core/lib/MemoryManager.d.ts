import * as THREE from "three";

declare class MemoryManager {

    resources: Set<any>;

    constructor ();

    /**
     * 收集内存引用
     * @param resource 待收集内存引用的资源
     */
    track ( resource: any ): void;

    /**
     * 取消收集
     * @param resource 
     */
    untrack ( resource: any ): void;

    /** 释放内存 */
    dispose ( removeFromParent: boolean ): void;

    /** 清除收集的内存引用 */
    clear (): void;

    static memoryManager: MemoryManager;

    /**
     * 是否内存
     * @param object 待释放内存的对象
     * @param removeFromParent 是否将对象从父级移除
     */
    static dispose ( object: THREE.Object3D | THREE.Object3D[], removeFromParent: boolean ): void;
}

