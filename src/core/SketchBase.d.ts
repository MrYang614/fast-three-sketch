import type * as THREE from 'three';
import type { Updatable, RaycastCallbackType, RaycastEventType, RaycastObjectType, RaycastResultType } from './lib';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import type { TransformControls, OrbitControls } from 'three-stdlib';

export declare class SketchBase {

    /** WEBGL渲染器 */
    renderer: THREE.WebGLRenderer;

    /** 当前相机 */
    camera: THREE.Camera;

    /** 基础相机，引用始终保持不变 */
    baseCamera: THREE.PerspectiveCamera;

    /** 当前场景 */
    scene: THREE.Scene;

    /** helpers scene */
    sceneHelpers: THREE.Scene;

    /** 基础场景，引用始终保持不变 */
    baseScene: THREE.Scene;

    /** 缓存 */
    cache: boolean;

    /** 渲染Canvas */
    canvas: HTMLCanvasElement;

    /** 控制器 */
    controls: OrbitControls;

    /** 变换控制器 */
    transformControls: TransformControls;

    gui: GUI;

    /** 获取单帧时间间隔 */
    getDelta (): number;
    /** 获取经过的时间 */
    getElapsedTime (): number;

    /** 单帧时间间隔，用于着色器 */
    uDelta: { value: number; };

    /** 单帧时间间隔，用于着色器 */
    uTime: { value: number; };

    /** 经过的时间，用于着色器 */
    uElapsedTime: { value: number; };

    /** 自定义渲染函数 */
    customRender: ( ( sketch: SketchBase ) => void ) | undefined;

    /**
     * @param parameters WEBGL 渲染器参数
     */
    constructor ( parameters?: THREE.WebGLRendererParameters );

    /** 添加功能模块 */
    addUpdatable ( updatable: Updatable ): void;

    /** 移除功能模块 */
    removeUpdatable ( updatable: Updatable ): void;

    /** 添加窗口自适应方法,窗口发生改变时，会自动执行该方法 */
    addResizeFn ( resizeFunction: ( innerWidth: number, innerHeight: number ) => void ): void;

    /** 移除窗口自适应方法 */
    removeResizeFn ( resizeFunction: ( innerWidth: number, innerHeight: number ) => void ): void;

    /** 添加三维对象到当前场景 */
    add ( ...object: THREE.Object3D[] ): void;

    /** 从当前场景移除三维对象 */
    remove ( object: THREE.Object3D, needToDispose: boolean ): void;

    /** 初始化坐标系 */
    initAxesHelper ( size?: number ): void;

    /** 初始化网格 */
    initGridHelper ( size?: number, division?: number, color1?: THREE.ColorRepresentation, color2?: THREE.ColorRepresentation ): void;

    /** 初始化性能监视器 */
    initStats (): void;

    /** 初始化图形用户界面 */
    initGUI (): void;

    /** 初始化变换控制器 */
    initTransformControls (): void;

    setHelpersVisible ( visible: boolean ): void;

    /** 优化的射线拾取功能 */
    raycast ( type: RaycastEventType, object: RaycastObjectType, callback: RaycastCallbackType ): RaycastResultType;

    /** 设置自定义渲染函数，这个操作会取代基础渲染，用于后处理。 */
    setCustomRender ( customRender: ( sketch: SketchBase ) => void ): void;

    /** 渲染一帧 */
    render (): void;

    /** 更新可更新模块 */
    update (): void;

    /** 在动画帧中进行渲染 */
    animate (): void;

    /** 释放GPU内存资源 */
    dispose ( object: THREE.Object3D | THREE.Object3D[], removeFromParent?: boolean ): void;

    /** 截图 */
    saveScreenshot ( name?: string ): Promise<void>;

}
