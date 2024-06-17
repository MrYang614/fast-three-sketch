import * as THREE from "three";


export type EventType = "click" | "mousedown" | "mouseup" | "mousemove" | "dblclick" | "pointerdown" | "pointermove" | "pointerup";
export type CallbackType = ( intersection: THREE.Intersection[] ) => void;
export type ObjectType = THREE.Object3D | THREE.Object3D[];
type EventQueueMap = Map<ObjectType, CallbackType[]>;
type EventQueueMapType = Map<EventType, EventQueueMap>;

export type ResultType = {
    clear: () => void;
    intersections: THREE.Intersection[];
};

export class Raycaster {

    raycaster: THREE.Raycaster;

    camera: THREE.Camera;

    element: HTMLElement;

    callbackMap: EventQueueMapType;

    intersections = null;

    constructor ( camera: THREE.Camera, element: HTMLElement );

    /** 重新设置 */
    set ( camera: THREE.Camera, element: HTMLElement ): void;

    /**
     * @param type 射线事件触发类型
     * @param object 射线检测对象，可以是数组
     * @param callback 射线检测回调
     */
    raycast ( type: EventType, object: ObjectType, callback: CallbackType ): ResultType;

    /** 返回是否包含此类型事件 */
    hasEvent ( type: EventType ): boolean;

    /** 设置某个事件的活跃状态 */
    setState ( type: EventType, value: boolean ): void;

    /** 获取某个事件的活跃状态 */
    getState ( type: EventType ): void;

}