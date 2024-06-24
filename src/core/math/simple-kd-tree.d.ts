import type * as THREE from "three";


export class SimpleKDTree<T = THREE.Vector2Like | THREE.Vector3Like | THREE.Vector4Like> {

    /**
     * 最近邻查
     * @param point 选中点
     * @param maxDistance 最大距离
     */
    nearest: ( point: T, maxDistance: number ) => [ T, distance ][];

    /** 移除KDTree节点 */
    remove: ( point: T ) => void;

    /** 插入节点到KDTree */
    insert: ( point: T ) => void;

    /** 计算KDTree平衡度 */
    balanceFactor: () => void;

    /**
     * 
     * @param points 计算的点集
     * @param metric 计算函数
     * @param dimensions 计算分量
     */
    constructor ( points: T[], metric: ( a: T, b: T ) => number, dimensions: ( keyof T )[] );
}
