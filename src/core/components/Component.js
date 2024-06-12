import { SketchBase } from "../SketchBase";
import { Emitter } from "../lib/EventEmitter";
import { Updatable } from "../lib";

export class Component extends Updatable {

    /**
     * @param {SketchBase} sketch 
     */
    constructor(sketch) {
        super()
        this.sketchBase = sketch;
    }

    on(type, handler) {
        Emitter.on(type, handler)
    }

    off(type, handler) {
        Emitter.off(type, handler)
    }

    emit(type, event) {
        Emitter.emit(type, event)
    }

    update() {

    }
}