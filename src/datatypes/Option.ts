import { Predicate } from "@datatypes/base";
import { isString, isNonEmptyString } from "@operators/string";

export interface None {
  readonly _is: "None";
}

export interface Some<T> {
  readonly _is: "Some";
  readonly value: T;
}

export type Option<T> = None | Some<T>;
export type Type<T> = None | Some<T>;

export const none: Option<never> = { _is: "None" };

export function some<T>(x: T): Option<T> {
  return { _is: "Some", value: x };
}
export function isSome<T>(x: Option<T>): x is Some<T> {
  return x._is === "Some";
}

export function isNone<T>(x: Option<T>): x is None {
  return x._is === "None";
}

export function fold<T, N, S>(
  none: () => N,
  some: (y: T) => S
): (x: Option<T>) => N | S {
  return (x): N | S => (isNone(x) ? none() : some(x.value));
}

export function concat<T>(
  x: Option<T>,
  y: Option<T>,
  fn?: (a: T, b: T) => T
): Option<T> {
  if (isNone(x) && isNone(y)) return none;
  if (isSome(x) && isSome(y)) {
    return fn ? some(fn(x.value, y.value)) : y;
  }

  if (isSome(x) && isNone(y)) return x;
  if (isNone(x) && isSome(y)) return y;

  return none;
}

export function fromNullable<T>(x: T): Option<NonNullable<T>> {
  const isnull = x === null;
  const isundefined = typeof x === "undefined";
  return isnull || isundefined ? none : some(x as NonNullable<T>);
}

export function fromPredicate<T>(fn: Predicate<T>): (x: T) => Option<T> {
  return (x): Option<T> => (fn(x) ? some(x) : none);
}

export function fromNaN<T>(x: T): Option<number> {
  return isNaN(Number(x)) ? none : some(Number(x));
}

export function fromFalsy<T>(x: T): Option<T> {
  return !x ? none : some(x);
}

export function fromString(x: unknown, strict?: boolean): Option<string> {
  if (isString(x)) {
    return strict ? (isNonEmptyString(x) ? some(x) : none) : some(x);
  }
  return none;
}
