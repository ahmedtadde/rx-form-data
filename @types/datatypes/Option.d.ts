import { Predicate } from "./base";
export interface None {
    readonly _is: "None";
}
export interface Some<T> {
    readonly _is: "Some";
    readonly value: T;
}
export declare type Option<T> = None | Some<T>;
export declare type Type<T> = None | Some<T>;
export declare const none: Option<never>;
export declare function some<T>(x: T): Option<T>;
export declare function isSome<T>(x: Option<T>): x is Some<T>;
export declare function isNone<T>(x: Option<T>): x is None;
export declare function fold<T, N, S>(none: () => N, some: (y: T) => S): (x: Option<T>) => N | S;
export declare function concat<T>(x: Option<T>, y: Option<T>, fn?: (a: T, b: T) => T): Option<T>;
export declare function fromNullable<T>(x: T): Option<NonNullable<T>>;
export declare function fromPredicate<T>(fn: Predicate<T>): (x: T) => Option<T>;
export declare function fromNaN<T>(x: T): Option<number>;
export declare function fromFalsy<T>(x: T): Option<T>;
export declare function fromString(x: unknown, strict?: boolean): Option<string>;
