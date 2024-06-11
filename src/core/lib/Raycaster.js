import * as THREE from "three"
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh"

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.Raycaster.prototype.firstHitOnly = true

const mouse = new THREE.Vector2()

export class Raycaster {

    callbackMap

    #_listenerMap = new Map()

    /**
     * @param {THREE.Camera} camera 
     * @param {HTMLElement} element 
     */
    constructor(camera, element) {

        this.raycaster = new THREE.Raycaster();

        this.camera = camera;
        this.element = element;

        this.callbackMap = new Map()

        this.stateMap = new Map()

        this.intersections = []

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

            this.#_registerEvent(object, type)

        }

        const eventMap = this.callbackMap.get(type)

        const taskQueue = eventMap.get(object)

        if (taskQueue.indexOf(callback) === -1) {

            taskQueue.push(callback)
        }

        return {
            clear: () => this.clear(object, type, callback),
            intersections: this.intersections
        }

    }

    hasEvent(type) {
        return this.callbackMap.has(type)
    }

    #_registerEvent(type, object) {

        const taskMap = new Map()

        taskMap.set(object, [])

        this.callbackMap.set(type, taskMap)

        const listener = (event) => {

            taskMap.forEach(taskQueue => {

                taskQueue.forEach(task => {

                    const intersections = this.getIntersections(event, object, type)

                    task(intersections)
                })

            })

        }

        const removeListener = () => {

            this.element.removeEventListener(type, listener)

        }

        this.#_listenerMap.set(type, removeListener)

        this.element.addEventListener(type, listener)

    }

    clear(type, object, callback) {

        /**@type {Map<any,map>} */
        const eventMap = this.callbackMap.get(type)

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

            const removeEventListener = this.#_listenerMap.get(type)

            removeEventListener()

            this.#_listenerMap.delete(type)

        }

    }

    setState(type, value) {
        this.stateMap.set(type, value)
    }

    getState(type) {

        if (this.stateMap.has(type)) {
            return this.stateMap.get(type)
        }

        return true

    }

    getIntersections(event, object, type) {

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