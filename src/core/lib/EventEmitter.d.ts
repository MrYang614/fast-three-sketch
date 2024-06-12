

declare interface Emitter {
    /** 监听特定类型的事件 */
    on ( type: string | symbol | "*", handler: ( event: any ) => void ): void;

    /** 取消监听特定类型的事件，如果提供了handler，则只取消该handler；否则取消所有handler */
    off ( type: string | symbol | "*", handler?: ( event: any ) => void ): void;

    /** 触发特定类型的事件，并将事件对象传递给所有注册的handler */
    emit ( type: string | symbol, event?: any ): void;
}

/** 全局事件派发，请合理使用 */
declare const Emitter: Emitter;

// 导出Emitter  
export { Emitter };
