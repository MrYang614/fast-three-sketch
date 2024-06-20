import * as THREE from "three";
import type { SketchBase } from "fast-three-sketch";

type DepthRainParameters = {
    speed?: number,
    count?: number,
    size?: number;
};

export class DepthRain {

    /**
     * @param box 范围
     * @param depthRainParameters 参数
     */
    constructor ( box?: THREE.Box3, depthRainParameters?: DepthRainParameters );

    /** 添加深度遮挡对象 */
    addObject ( ...args: THREE.Object3D[] ): void;

    /** 移除深度遮挡对象 */
    removeObject ( obj: THREE.Object3D ): void;

    /** 渲染函数 */
    render ( sketch: SketchBase ): void;

}