/** 单例 */
export function singleInstance(className) {

    let instance = null;

    const proxy = new Proxy(className, {

        construct(target, argArray, newTarget) {

            if (!instance) {
                instance = Reflect.construct(target, argArray, newTarget);
            }

            return instance;
        }

    });

    className.prototype.constructor = proxy;

    return proxy;

}
