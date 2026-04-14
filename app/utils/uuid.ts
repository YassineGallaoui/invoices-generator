/** SSR-safe UUID generator — requires Node >=19 (project enforces >=20.18). */
export function generateUUID(): string {
  return crypto.randomUUID();
}
