export interface Left<T> {
    readonly _is: "Left";
    value: T;
}
export interface Right<K> {
    readonly _is: "Right";
    value: K;
}
export declare type Either<T, K> = Left<T> | Right<K>;
export declare function left<T = never, K = never>(x: T): Either<T, K>;
export declare function right<T = never, K = never>(x: K): Either<T, K>;
export declare function fold<L, R, K, T>(onleft: (l: L) => K, onright: (r: R) => T): (x: Either<L, R>) => K | T;
