/** Simulated in-memory list page size (offset pagination). */
export const LIST_PAGE_SIZE = 10

export function pageSlice<T>(items: T[], visibleCount: number): T[] {
  return items.slice(0, Math.max(0, visibleCount))
}

export function nextVisibleCount(
  current: number,
  total: number,
  pageSize = LIST_PAGE_SIZE,
): number {
  return Math.min(total, current + pageSize)
}

export function hasMore(visibleCount: number, total: number): boolean {
  return visibleCount < total
}
