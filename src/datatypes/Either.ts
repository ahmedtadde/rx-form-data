export interface Left<T> {
  readonly _is: "Left";
  value: T;
}

export interface Right<K> {
  readonly _is: "Right";
  value: K;
}

export type Either<T, K> = Left<T> | Right<K>;

export function left<T = never, K = never>(x: T): Either<T, K> {
  return { _is: "Left", value: x };
}

export function right<T = never, K = never>(x: K): Either<T, K> {
  return { _is: "Right", value: x };
}

export function fold<L, R, K, T>(
  onleft: (l: L) => K,
  onright: (r: R) => T
): (x: Either<L, R>) => K | T {
  return (x: Either<L, R>): K | T =>
    x._is === "Left" ? onleft(x.value) : onright(x.value);
}
