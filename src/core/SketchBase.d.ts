import type * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Updatable } from './lib';

declare class SketchBase {

    renderer: THREE.WebGLRenderer;

    camera: THREE.Camera;

    baseCamera: THREE.PerspectiveCamera;

    scene: THREE.Scene;

    baseScene: THREE.Scene;

    cache: boolean;

    canvas: HTMLCanvasElement;

    controls: OrbitControls;

    customRender: Function | undefined;

    constructor ( antialias?: boolean, logarithmicDepthBuffer?: boolean );

    addUpdatable ( updatable: Updatable ): void;

    removeUpdatable ( updatable: Updatable ): void;

    initAxesHelper ( size?: number ): void;

    initGridHelper ( size?: number, division?: number, color1?: THREE.ColorRepresentation, color2?: THREE.ColorRepresentation ): void;

    initStats (): void;

    setCustomRender ( customRender: Function | undefined ): void;

    render (): void;

    update (): void;

    animate (): void;

    dispose ( object: THREE.Object3D | THREE.Object3D[], removeFromParent?: boolean ): void;

    async saveScreenshot ( name?: string ): Promise<void>;

}
