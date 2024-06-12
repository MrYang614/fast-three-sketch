
const all = new Map();

export const Emitter = {

    on(type, handler) {
        const handlers = all.get(type);
        if (handlers) {
            handlers.push(handler);
        } else {
            all.set(type, [handler]);
        }
    },
    off(type, handler) {
        const handlers = all.get(type);
        if (handlers) {
            if (handler) {
                handlers.splice(handlers.indexOf(handler) >>> 0, 1);
            } else {
                all.set(type, []);
            }
        }
    },
    emit(type, event) {
        let handlers = all.get(type);
        if (handlers) {
            handlers.slice().map((handler) => {
                handler(event);
            });
        }

        handlers = all.get('*');
        if (handlers) {
            handlers.slice().map((handler) => {
                handler(type, event);
            });
        }
    }
}