import type { Updatable } from "./Updatable";
import type { SketchBase } from "../SketchBase";

export class Timer extends Updatable {

    order: number;

    delta: number;

    elapsedTime: number;

    uDelta: { value: number; };

    uElapsedTime: { value: number; };

    constructor ( sketch: SketchBase );

    update ( sketch: SketchBase ): void;
}