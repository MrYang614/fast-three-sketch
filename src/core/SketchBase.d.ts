import type * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Updatable, CallbackType, EventType, ObjectType } from './lib';

declare class SketchBase {

    /** WEBGL渲染器 */
    renderer: THREE.WebGLRenderer;

    /** 当前相机 */
    camera: THREE.Camera;

    /** 基础相机，引用始终保持不变 */
    baseCamera: THREE.PerspectiveCamera;

    /** 当前场景 */
    scene: THREE.Scene;

    /** 基础场景，引用始终保持不变 */
    baseScene: THREE.Scene;

    /** 缓存 */
    cache: boolean;

    /** 渲染Canvas */
    canvas: HTMLCanvasElement;

    /** 控制器 */
    controls: OrbitControls;

    /** 自定义渲染函数 */
    customRender: () => void | undefined;

    /**
     * @param antialias 抗锯齿开启
     * @param logarithmicDepthBuffer 对数缓冲区开启
     */
    constructor ( antialias?: boolean, logarithmicDepthBuffer?: boolean );

    /** 添加功能模块 */
    addUpdatable ( updatable: Updatable ): void;

    /** 移除功能模块 */
    removeUpdatable ( updatable: Updatable ): void;

    /** 初始化坐标系 */
    initAxesHelper ( size?: number ): void;

    /** 初始化网格 */
    initGridHelper ( size?: number, division?: number, color1?: THREE.ColorRepresentation, color2?: THREE.ColorRepresentation ): void;

    /** 初始化性能监视器 */
    initStats (): void;

    /** 优化的射线拾取功能 */
    raycast ( type: EventType, object: ObjectType, callback: CallbackType ): void;

    /** 设置自定义渲染函数，这个操作会取代基础渲染，用于后处理。 */
    setCustomRender ( customRender: Function | undefined ): void;

    /** 渲染一帧 */
    render (): void;

    /** 更新可更新模块 */
    update (): void;

    /** 在动画帧中进行渲染 */
    animate (): void;

    /** 释放GPU内存资源 */
    dispose ( object: THREE.Object3D | THREE.Object3D[], removeFromParent?: boolean ): void;

    /** 截图 */
    async saveScreenshot ( name?: string ): Promise<void>;

}
