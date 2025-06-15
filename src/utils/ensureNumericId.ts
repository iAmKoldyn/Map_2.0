export function ensureNumericId(id: unknown): number {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error('Invalid ID');
  }
  return num;
}
