import type { SketchBase } from "../SketchBase";
import type { Updatable } from "../lib";

export class Component extends Updatable {

    order: number;

    constructor ( sketch: SketchBase );

    on ( type: string | Symbol, handler: ( event: any ) => void ): void;

    off ( type: string | Symbol, handler: ( event: any ) => void ): void;

    emit ( type: string | Symbol, event: any ): void;

    update ( sketch: SketchBase ): void;

}