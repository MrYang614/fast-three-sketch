import { Clock } from "three";
import { Updatable } from "./Updatable";
import { SketchBase } from "../SketchBase";

let delta = 0
let elapsedTime = 0

let uDelta = {
    value: 0
}
let uElapsedTime = {
    value: 0
}

export class Timer extends Updatable {

    get delta() {
        return delta
    }

    get elapsedTime() {
        return elapsedTime
    }

    get uDelta() {
        return uDelta
    }

    get uElapsedTime() {
        return uElapsedTime
    }

    /**
     * @param {SketchBase} sketch 
     */
    constructor(sketch) {

        this.order = 0

        this.sketchBase = sketch

        this.clock = new Clock()

        sketch.addUpdatable(this)
    }

    /**
     * 更新函数
     * @param {SketchBase} sketch 
     */
    update(sketch) {

        delta = this.clock.getDelta()
        elapsedTime += delta

        uDelta.value = delta
        uElapsedTime.value = elapsedTime

    }
}