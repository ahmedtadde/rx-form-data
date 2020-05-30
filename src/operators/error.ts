export function panic(x: unknown): void {
  if (x instanceof Error) throw x;
  const error = new Error("[RxFormData] ERR");
  // @ts-ignore
  error.details = JSON.stringify(x);
  throw error;
}
