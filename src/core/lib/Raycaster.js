import * as THREE from "three"
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh"

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.Raycaster.prototype.firstHitOnly = true

const mouse = new THREE.Vector2()

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

    raycast(type, object, callback) {

        if (!callback) return

        if (!this.hasEvent(type)) {

            this.#_registerEvent(type, object)

        }

        const eventMap = this.#_callbackMap.get(type)

        const taskQueue = eventMap.get(object)

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

    #_registerEvent(type, object) {

        const taskMap = new Map()

        taskMap.set(object, [])

        this.#_callbackMap.set(type, taskMap)

        const listener = (event) => {

            taskMap.forEach(taskQueue => {

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

        mouse.x = ((event.clientX - left) / width) * 2 - 1
        mouse.y = -((event.clientY - top) / height) * 2 + 1

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