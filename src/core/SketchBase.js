import * as THREE from 'three';
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { CSS2DRenderer, CSS3DRenderer, CSS2DObject, CSS3DSprite, CSS3DObject, OrbitControls } from 'three-stdlib';
import { Updatable, Timer, MemoryManager, Raycaster, TransformControls } from './lib';
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

    #_sceneHelpers

    get sceneHelpers() {
        return this.#_sceneHelpers
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

    #timer

    getDelta() {
        return this.#timer.delta
    }

    getElapsedTime() {
        return this.#timer.elapsedTime
    }

    get uDelta() {
        return this.#timer.uDelta
    }

    get uElapsedTime() {
        return this.#timer.uElapsedTime
    }

    get uTime() {
        return this.#timer.uDelta
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

    /**@type {Array< (innerWidth:number,innerHeight:number)=>void >} */
    #_resizeQueue

    /**@type {Function} */
    customRender = undefined

    /**
     * @param {THREE.WebGLRendererParameters | undefined} parameters 
     * @returns 
     */
    constructor(targetElement = document.body, parameters) {

        if (!isDesktop) {
            alert('当前项目仅支持PC端');
            return
        }

        this.#_cameraMap = new Map();
        this.#_sceneMap = new Map();

        this.#_updateQueue = []
        this.#_resizeQueue = []

        const width = targetElement.clientWidth || window.innerWidth
        const height = targetElement.clientHeight || window.innerHeight

        this.#_camera = new THREE.PerspectiveCamera(55, width / height, 0.01, 1000);
        this.#_camera.position.set(10, 10, 10);
        this.#_baseCamera = this.#_camera

        this.#_scene = new THREE.Scene();
        this.#_baseScene = this.#_scene

        this.#_sceneHelpers = new THREE.Scene()

        // WebGL渲染器
        this.#_renderer = new THREE.WebGLRenderer(parameters);
        this.#_renderer.setPixelRatio(window.devicePixelRatio);
        this.#_renderer.setSize(width, height);
        this.#_renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.#_renderer.toneMappingExposure = 1.0;
        this.#_renderer.shadowMap.enabled = true;
        this.#_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.#_renderer.domElement.id = "sketch_three_canvas";
        this.#_renderer.domElement.oncontextmenu = e => false;
        targetElement.appendChild(this.#_renderer.domElement);

        this.#_controls = new OrbitControls(this.#_baseCamera, targetElement)
        this.addUpdatable(this.#_controls)

        this.#timer = new Timer(this)

        const resizeQueue = this.#_resizeQueue

        window.addEventListener("resize", () => {

            const width = targetElement.clientWidth;
            const height = targetElement.clientHeight;

            const pixelRatio = Math.min(window.devicePixelRatio, 2);

            this.#_camera.aspect = width / height;
            this.#_camera.updateProjectionMatrix();
            this.#_renderer.setSize(width, height);
            this.#_renderer.setPixelRatio(pixelRatio);

            for (let i = 0; i < resizeQueue.length; i++) {

                const cb = resizeQueue[i]

                cb(width, height)

            }
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

    /**
     * 添加窗口自适应方法
     * @param {(innerWidth:number,innerHeight:number)=>void} resizeFunction 
     * @returns 
     */
    addResizeFn(resizeFunction) {
        if (typeof resizeFunction !== "function") {
            return
        }
        const resizeQueue = this.#_resizeQueue

        for (let i = 0, il = resizeQueue.length; i < il; i++) {
            if (resizeFunction === resizeQueue[i]) {
                return
            }
        }

        resizeQueue.push(resizeFunction);

    }

    /**
     * 移除窗口自适应方法
     * @param {(innerWidth:number,innerHeight:number)=>void} resizeFunction 
     * @returns 
     */
    removeResizeFn(resizeFunction) {
        if (typeof resizeFunction !== "function") {
            return
        }

        const resizeQueue = this.#_resizeQueue

        for (let i = 0, il = resizeQueue.length; i < il; i++) {
            if (resizeFunction === resizeQueue[i]) {
                resizeQueue.splice(i, 1)
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
        this.#_sceneHelpers.add(helper);
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
        this.#_sceneHelpers.add(helper);
    }

    initTransformControls() {
        this.transformControls = new TransformControls(this.#_camera, this.canvas)
        this.#_sceneHelpers.add(this.transformControls)
    }

    /**
     * 初始化 css2dRenderer 渲染器
     */
    initCSS2DRenderer() {
        const css2dRenderer = new CSS2DRenderer()
        css2dRenderer.domElement.id = "css2dRenderer"
        css2dRenderer.setSize(window.innerWidth, window.innerHeight)
        targetElement.appendChild(css2dRenderer.domElement)
        this.css2dRenderer = css2dRenderer
    }

    /**
     * 初始化 css3dRenderer 渲染器
     */
    initCSS3DRenderer() {
        const css3dRenderer = new CSS3DRenderer()
        css3dRenderer.domElement.id = "css3dRenderer"
        css3dRenderer.setSize(window.innerWidth, window.innerHeight)
        targetElement.appendChild(css3dRenderer.domElement)
        this.css3dRenderer = css3dRenderer
    }

    setHelpersVisible(visible) {
        this.sceneHelpers.visible = !!visible
    }

    /**
     * 
     * @param {HTMLElement} htmlElement 
     * @param {"2d"|"3d"|"3dSprite"} type 
     * @param {THREE.Vector3Like} position 
     */
    renderHTML(htmlElement, type) {

        let object = null

        if (type === "2d") {
            object = new CSS2DObject(htmlElement)
        } else if (type === "3d") {
            object = new CSS3DObject(htmlElement)
        } else if (type === "3dSprite") {
            object = new CSS3DSprite(htmlElement)
        } else {
            throw new Error("try to render htmlElement to wrong type")
        }

        this.#_scene.add(object)

        return object

    }

    /** 添加性能监视器 */
    initStats() {
        const stats = new Stats();
        targetElement.appendChild(stats.dom);
    }

    initGUI() {
        this.gui = new GUI()
        this.gui.open()
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

        const renderer = this.#_renderer
        if (this.customRender === undefined) {
            renderer.render(this.#_scene, this.#_camera)
        } else {
            this.customRender(this)
        }

        // render helpers
        renderer.autoClear = false
        if (this.#_sceneHelpers.visible === true) {
            renderer.render(this.#_sceneHelpers, this.#_camera)
        }
        renderer.autoClear = true

        if (this.css2dRenderer) {
            this.css2dRenderer.render(this.#_scene, this.#_camera)
        }

        if (this.css3dRenderer) {
            this.css3dRenderer.render(this.#_scene, this.#_camera)
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


