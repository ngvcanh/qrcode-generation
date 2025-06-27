import { mergeObject } from "./merge-object";

export function cloneArray<T>(value: T[]): T[] {
  return value.map((item) => cloneDeep(item));
}

export function cloneObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return cloneArray(value) as unknown as T;
  }

  if (value === null) {
    return null as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as unknown as T;
  }

  if (value instanceof Map) {
    return new Map(value) as unknown as T;
  }

  if (value instanceof Set) {
    return new Set(value) as unknown as T;
  }

  if (value instanceof ArrayBuffer) {
    return value.slice(0) as unknown as T;
  }

  if (value instanceof Blob) {
    return value.slice(0) as unknown as T;
  }

  if (value instanceof File) {
    return new File([value], value.name, { type: value.type }) as unknown as T;
  }

  if (value instanceof ImageData) {
    return new ImageData(value.data.slice(0), value.width, value.height) as unknown as T;
  }

  if (value instanceof DataView) {
    return new DataView(value.buffer, value.byteOffset, value.byteLength) as unknown as T;
  }

  return mergeObject(
    ...Object.entries(value as Record<string, unknown>).map(([key, val]) => ({
      [key]: cloneDeep(val),
    }))
  );
}

export function cloneDeep<T>(value: T): T {
  if (typeof value === "object") {
    return cloneObject(value);
  }

  return value;
}
