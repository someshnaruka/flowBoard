/** Generate a new opaque id. Seed data uses readable fixed ids instead. */
export function newId(): string {
  return crypto.randomUUID()
}
