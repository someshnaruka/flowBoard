/** Default gap between newly appended / prepended positions. */
export const POSITION_GAP = 1024

/** When neighbours are closer than this, callers should rebalance. */
export const POSITION_MIN_GAP = 1e-6

/**
 * Position after `a`. When `a` is null/undefined, returns the default first slot.
 */
export function after(a: number | null | undefined): number {
  if (a == null) {
    return POSITION_GAP
  }
  return a + POSITION_GAP
}

/**
 * Position before `b`. When `b` is null/undefined, returns the default first slot.
 */
export function before(b: number | null | undefined): number {
  if (b == null) {
    return POSITION_GAP
  }
  return b / 2
}

/**
 * Fractional position strictly between `a` and `b`.
 * Pass null for open ends (start or end of the list).
 */
export function between(
  a: number | null | undefined,
  b: number | null | undefined,
): number {
  if (a == null && b == null) {
    return POSITION_GAP
  }
  if (a == null) {
    return before(b)
  }
  if (b == null) {
    return after(a)
  }
  if (!(a < b)) {
    throw new Error(`between expects a < b (got ${a}, ${b})`)
  }
  return (a + b) / 2
}

/** True when two neighbours are too close for another midpoint insert. */
export function needsRebalance(
  a: number | null | undefined,
  b: number | null | undefined,
): boolean {
  if (a == null || b == null) {
    return false
  }
  return b - a < POSITION_MIN_GAP
}

/**
 * Rebalance sibling positions to evenly spaced values.
 * Returns a new array of `{ id, position }` without mutating inputs.
 * Ordering follows the input order (already sorted by current position).
 */
export function rebalance<T extends { id: string; position: number }>(
  siblings: readonly T[],
  gap: number = POSITION_GAP,
): Array<{ id: string; position: number }> {
  return siblings.map((sibling, index) => ({
    id: sibling.id,
    position: (index + 1) * gap,
  }))
}
