export function mergeObject<Result, Obj = unknown>(...objects: Obj[]): Result {
  return objects.reduce((acc, item) => ({ ...acc, ...item }), {} as Result);
}
