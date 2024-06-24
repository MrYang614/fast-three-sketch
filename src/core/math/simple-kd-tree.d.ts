export class SimpleKDTree<T> {

    nearest: ( point: T, maxDistance: number ) => [ T, distance ][];

    remove: ( point: T ) => void;

    insert: ( point: T ) => void;

    balanceFactor: () => void;

    constructor ( points: T[], metric: ( a: T, b: T ) => number, dimensions: ( keyof T )[] );
}
