import { SketchBase } from "../SketchBase"
export class Updatable {

    #_order = 1

    /** 渲染顺序 */
    get order() {
        return this.#_order
    }

    set order(value) {
        if (typeof value !== "number") {
            return
        }

        this.#_order = value
    }

    constructor() {

        if (new.target === Updatable) {
            throw new Error("new abstract class is not allowed")
        }

    }

    /**
     * 更新函数
     * @param {SketchBase} sketch 
     */
    update(sketch) {
        console.log(" wrong extends , no update function ");
    }

}