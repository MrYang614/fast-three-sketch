import * as THREE from "three";


export type RaycastEventType = "click" | "mousedown" | "mouseup" | "mousemove" | "dblclick" | "pointerdown" | "pointermove" | "pointerup";
export type RaycastCallbackType = ( intersection: THREE.Intersection[] ) => void;
export type RaycastObjectType = THREE.Object3D | THREE.Object3D[];
type EventQueueMap = Map<RaycastObjectType, RaycastCallbackType[]>;
type EventQueueMapType = Map<RaycastEventType, EventQueueMap>;

export type RaycastResultType = {
    clear: () => void;
    intersections: THREE.Intersection[];
};

export class Raycaster {

    raycaster: THREE.Raycaster;

    camera: THREE.Camera;

    element: HTMLElement;

    callbackMap: EventQueueMapType;

    intersections: THREE.Intersection[];

    constructor ( camera: THREE.Camera, element: HTMLElement );

    /** 重新设置 */
    set ( camera: THREE.Camera, element: HTMLElement ): void;

    /**
     * @param type 射线事件触发类型
     * @param object 射线检测对象，可以是数组
     * @param callback 射线检测回调
     */
    raycast ( type: RaycastEventType, object: RaycastObjectType, callback: RaycastCallbackType ): RaycastResultType;

    /** 返回是否包含此类型事件 */
    hasEvent ( type: RaycastEventType ): boolean;

    /** 设置某个事件的活跃状态 */
    setState ( type: RaycastEventType, value: boolean ): void;

    /** 获取某个事件的活跃状态 */
    getState ( type: RaycastEventType ): void;

}