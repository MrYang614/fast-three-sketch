/**
 * 单例方法
 * @param className 类
 */
export function singleInstance<T extends new ( ...args: any[] ) => any> ( className: T ): T;