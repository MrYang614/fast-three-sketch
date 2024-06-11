import * as THREE from "three";


export type EventType = "click" | "mousedown" | "mouseup" | "mousemove" | "dblclick" | "pointerdown" | "pointermove" | "pointerup";
export type CallbackType = ( intersection: THREE.Intersection[] ) => void;
export type ObjectType = THREE.Object3D | THREE.Object3D[];
type EventQueueMap = Map<ObjectType, CallbackType[]>;
type EventQueueMapType = Map<EventType, EventQueueMap>;

type ResultType = {
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


    set ( camera: THREE.Camera, element: HTMLElement ): void;

    raycast ( type: EventType, object: ObjectType, callback: CallbackType ): ResultType;

    exist () {

    }

    clear () {

    }

    setState () {

    }

    getState () {

    }

    getIntersections () {

    }


}