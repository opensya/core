export function getWhyleDefault<T = any>(val: any) {
  if (!val) return val as T;
  if (val.default) return getWhyleDefault<T>(val.default);
  return val as T;
}
