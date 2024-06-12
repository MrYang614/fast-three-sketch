import * as THREE from 'three';
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Updatable, Timer, MemoryManager, Raycaster } from './lib';
import { download } from './utils';


const userAgent = navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
const isTablet = /iPad|Android/i.test(userAgent);
const isDesktop = !isMobile && !isTablet;

export class SketchBase {

    /**@type {THREE.WebGLRenderer} 渲染器 */
    #_renderer;

    /**@type {THREE.WebGLRenderer} 渲染器 */
    get renderer() {
        return this.#_renderer
    }

    /**@type {THREE.Camera} 相机 */
    #_camera;

    /**@type {THREE.Camera} 相机 */
    get camera() {
        return this.#_camera
    }

    set camera(camera) {

        if (!(camera instanceof THREE.Camera)) return

        this.#_camera = camera

    }

    /**@type {THREE.PerspectiveCamera} 初始透视相机 */
    #_baseCamera

    /**@type {THREE.PerspectiveCamera} 初始透视相机 */
    get baseCamera() {
        return this.#_baseCamera
    }

    /**@type {THREE.Scene} 场景 */
    #_scene;

    /**@type {THREE.Scene} 场景 */
    get scene() {
        return this.#_scene
    }

    set scene(scene) {

        if (!(scene instanceof THREE.Scene)) return

        this.#_scene = scene

    }

    /**@type {THREE.Scene} 场景 */
    #_baseScene

    /**@type {THREE.Scene} 基础场景 */
    get baseScene() {
        return this.#_baseScene
    }

    /** @param {boolean} value 设置 three 缓存 */
    set cache(value) {
        THREE.Cache.enabled = !!value
    }
    /** @param {boolean} value  是否开启缓存 */
    get cache() {
        return THREE.Cache.enabled
    }

    /** 获取 canvas 对象 */
    get canvas() {
        return this.#_renderer.domElement
    }

    /**@type {OrbitControls} 控制器 */
    #_controls

    get controls() {
        return this.#_controls
    }

    /**@type {Raycaster|undefined} 射线拾取器 */
    raycaster

    /**@type {Map<string,THREE.Camera>} */
    #_cameraMap

    /**@type {Map<string,THREE.Scene>} */
    #_sceneMap

    #_usePostprocessing = false

    /**@type {Updatable[]} */
    #_updateQueue

    /**@type {Function} */
    customRender = undefined

    constructor(antialias = true, logarithmicDepthBuffer = true) {

        if (!isDesktop) {
            alert('当前项目仅支持PC端');
            return
        }

        this.#_cameraMap = new Map();
        this.#_sceneMap = new Map();

        this.#_updateQueue = []

        this.#_camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000);
        this.#_camera.position.set(10, 10, 10);
        this.#_baseCamera = this.#_camera

        this.#_scene = new THREE.Scene();
        this.#_baseScene = this.#_scene

        this.sceneHelpers = new THREE.Scene()

        // WebGL渲染器
        this.#_renderer = new THREE.WebGLRenderer({ antialias, logarithmicDepthBuffer });
        this.#_renderer.setPixelRatio(window.devicePixelRatio);
        this.#_renderer.setSize(window.innerWidth, window.innerHeight);
        this.#_renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.#_renderer.toneMappingExposure = 1.0;
        this.#_renderer.shadowMap.enabled = true;
        this.#_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.#_renderer.domElement.id = "canvas";
        this.#_renderer.domElement.oncontextmenu = e => false;
        document.body.appendChild(this.#_renderer.domElement);


        this.#_controls = new OrbitControls(this.#_baseCamera, this.#_renderer.domElement)
        this.addUpdatable(this.#_controls)

        this.timer = new Timer(this)

        window.addEventListener("resize", () => {
            const { innerWidth, innerHeight } = window;
            this.#_camera.aspect = innerWidth / innerHeight;
            this.#_camera.updateProjectionMatrix();
            this.#_renderer.setSize(innerWidth, innerHeight);
        });

    }

    /**
     * 添加模块
     * @param {Updatable} updatable 
     */
    addUpdatable = (updatable) => {

        if (typeof updatable.update !== "function") {
            return
        }

        const updateQueue = this.#_updateQueue

        for (let i = 0, il = updateQueue.length; i < il; i++) {
            if (updatable === updateQueue[i]) {
                return
            }
        }

        updateQueue.push(updatable);

        updateQueue.sort((a, b) => a.order - b.order)

    }
    /**
     * 删除模块
     * @param {Updatable} updatable 
     */
    removeUpdatable(updatable) {

        if (typeof updatable.update !== "function") {
            return
        }

        const updateQueue = this.#_updateQueue

        for (let i = 0, il = updateQueue.length; i < il; i++) {
            if (updatable === updateQueue[i]) {
                updateQueue.splice(i, 1)
                return
            }
        }
    }

    add() {
        this.scene.add(...arguments)
    }

    remove(object, needToDispose = false) {

        this.scene.remove(object)

        if (needToDispose === false) {
            this.scene.remove(object)
        } else {
            MemoryManager.dispose(object, true)
        }

    }

    /**
     * 添加坐标系辅助线
     * @param {number} size Size of the lines representing the axes. Default 1
     */
    initAxesHelper(size) {
        const helper = new THREE.AxesHelper(size);
        this.#_scene.add(helper);
    }

    /**
     * 添加网格辅助线
     * @param {number} size The size of the grid. Default 10
     * @param {number} division  The number of divisions across the grid. Default 10
     * @param {THREE.ColorRepresentation} color1  The color of the centerline. This can be a Color, a hexadecimal value and an CSS-Color name. Default 0x444444
     * @param {THREE.ColorRepresentation} color2  The color of the lines of the grid. This can be a Color, a hexadecimal value and an CSS-Color name. Default 0x888888
     */
    initGridHelper(size, division, color1, color2) {
        const helper = new THREE.GridHelper(size, division, color1, color2);
        this.#_scene.add(helper);
    }

    /** 添加性能监视器 */
    initStats() {
        const stats = new Stats();
        document.body.appendChild(stats.dom);
    }

    /** 射线拾取 */
    raycast(type, object, callback) {

        this.raycaster = new Raycaster(this.#_camera, this.canvas);

        const controls = this.raycaster.raycast(type, object, callback)

        this.raycast = (type, object, callback) => {

            return this.raycaster.raycast(type, object, callback)

        }

        return controls
    }

    render = () => {
        if (this.customRender === undefined) {
            this.#_renderer.render(this.#_scene, this.#_camera)
        } else {
            customRender()
        }
    }

    setCustomRender = (customRender) => {
        if (typeof customRender === "function") {
            this.customRender = customRender
        } else {
            this.customRender = undefined
        }
    }

    /** 模块更新方法 */
    update = () => {

        const updateQueue = this.#_updateQueue

        for (let i = 0, il = updateQueue.length; i < il; i++) {
            const updatable = updateQueue[i]
            updatable.update(this)
        }

    }

    animate = () => {

        requestAnimationFrame(this.animate)

        this.update()

        this.render()

    }

    /**
     * 清除三维对象内存
     * @param {THREE.Object3D|THREE.Object3D[]} object 
     * @param {boolean} removeFromParent 
     */
    dispose(object, removeFromParent = true) {
        MemoryManager.dispose(object, removeFromParent)
    }

    async saveScreenshot(name = `screenshot.png`) {
        this.render();
        const blob = await new Promise((resolve) => {
            this.renderer.domElement.toBlob(resolve, "image/png");
        });
        if (blob) {
            download(blob, name);
        }
    }

}
