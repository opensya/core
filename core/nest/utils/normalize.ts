export function normalize(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[-_.*+?^${}()|[\]\\]/g, '');
}
