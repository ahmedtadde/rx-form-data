export function panic(x: unknown): void {
  if (x instanceof Error) throw x;
  const error = new Error("[RxFormData] ERROR!");
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  error.details = JSON.stringify(x);
  throw error;
}
