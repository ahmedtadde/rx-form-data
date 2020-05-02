export const isString = (x: unknown): x is string => typeof x === "string";

export const isNonEmptyString = (x: unknown): x is string =>
  Boolean(isString(x) && x.trim().length);

export const isRegExp = (x: unknown): x is RegExp =>
  Object.prototype.toString.call(x) === "[object RegExp]";
