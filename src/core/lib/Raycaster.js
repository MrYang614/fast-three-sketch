import * as THREE from "three"
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh"

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.Raycaster.prototype.firstHitOnly = true

const mouse = new THREE.Vector2()
/*
 *  批量的射线检测优化：
 *  1. 针对同类型事件，不会重复监听。
 *  2. 针对同类型事件，相同检测对象，不会重复射线检测。
 *  3. 更好的事件控制，可针对事件类型设置活跃状态。
 *  4. 更好的事件清除控制，射线返回 Clear 方法。
 *
 *  callbackMap : {
 *                      
 *                  click : {
 * 
 *                           object1 : [ callback1,callback2,callback3 ....... ],
 * 
 *                           object2 : [ callback1,callback2,callback3 ....... ],
 *                              
 *                           ....................
 *                          },
 *                  mousemove : {
 * 
 *                           object1 : [ callback1,callback2,callback3 ....... ],
 * 
 *                           object2 : [ callback1,callback2,callback3 ....... ],
 *                              
 *                           ....................
 *                          },
 *                  dblclick : {
 * 
 *                           object1 : [ callback1,callback2,callback3 ....... ],
 * 
 *                           object2 : [ callback1,callback2,callback3 ....... ],
 *                              
 *                           ....................
 *                          },
 * 
 *                  ......
 * 
 *                 }
 */
export class Raycaster {

    #_callbackMap = new Map()

    #_listenerMap = new Map()

    #_stateMap = new Map()

    #_intersections = []

    get intersections() {
        return this.#_intersections
    }

    /**
     * @param {THREE.Camera} camera 
     * @param {HTMLElement} element 
     */
    constructor(camera, element) {

        this.raycaster = new THREE.Raycaster();

        this.camera = camera;
        this.element = element;

    }

    /**
     * 设置相机和DOM
     * @param {THREE.Camera} camera 
     * @param {HTMLElement} element 
     */
    set(camera, element) {
        this.camera = camera
        this.element = element
    }

    /**
     * @param {THREE.Vector4} scissor 
     */
    setScissor(scissor) {
        this.scissor = scissor
    }

    raycast(type, object, callback) {

        if (!callback) return

        if (!this.hasEvent(type)) {

            this.#_registerEvent(type)

        }

        const eventMap = this.#_callbackMap.get(type)

        let taskQueue
        if (!eventMap.has(object)) {
            taskQueue = []
            eventMap.set(object, taskQueue)
        } else {
            taskQueue = eventMap.get(object)
        }

        if (taskQueue.indexOf(callback) === -1) {
            taskQueue.push(callback)
        }

        return {
            clear: () => this.#_clear(type, object, callback),
            intersections: this.intersections
        }

    }

    hasEvent(type) {
        return this.#_callbackMap.has(type)
    }

    #_registerEvent(type) {

        const eventMap = new Map()

        this.#_callbackMap.set(type, eventMap)

        const listener = (event) => {

            eventMap.forEach((taskQueue, object) => {

                taskQueue.forEach(task => {

                    this.#_getIntersections(event, object, type)

                    task(this.intersections)

                })

            })

        }

        const removeListener = () => {

            this.element.removeEventListener(type, listener)

        }

        this.#_listenerMap.set(type, removeListener)

        this.element.addEventListener(type, listener)

    }

    #_clear(type, object, callback) {

        /**@type {Map<any,map>} */
        const eventMap = this.#_callbackMap.get(type)

        if (!eventMap) return

        const taskQueue = eventMap.get(object)

        if (!taskQueue) return

        for (let i = 0; i < taskQueue.length; i++) {

            if (taskQueue[i] === callback) {

                taskQueue.splice(i, 1)

                break
            }
        }

        if (taskQueue.length === 0) {

            eventMap.delete(object)

        }

        if (eventMap.size === 0) {

            this.#_callbackMap.delete(type)

            const removeEventListener = this.#_listenerMap.get(type)

            removeEventListener()

            this.#_listenerMap.delete(type)

        }

    }

    setState(type, value) {
        this.#_stateMap.set(type, value)
    }

    getState(type) {

        if (this.#_stateMap.has(type)) {
            return this.#_stateMap.get(type)
        }

        return true

    }

    #_getIntersections(event, object, type) {

        const state = this.getState(type)

        if (state === false) return

        const { left, top, width, height } = this.element.getBoundingClientRect()

        const scissor = this.scissor

        if (scissor) {
            mouse.x = ((event.clientX - left - scissor.x) / (width - scissor.x)) * 2 - 1
            mouse.y = -((event.clientY - top - (height - scissor.height - scissor.y)) / (scissor.height)) * 2 + 1
        } else {
            mouse.x = ((event.clientX - left) / width) * 2 - 1
            mouse.y = -((event.clientY - top) / height) * 2 + 1
        }

        this.intersections.length = 0

        const raycaster = this.raycaster
        const intersections = this.intersections

        raycaster.setFromCamera(mouse, this.camera)

        if (Array.isArray(object)) {
            raycaster.intersectObjects(object, true, intersections)
        } else {
            raycaster.intersectObject(object, true, intersections)
        }

    }

}