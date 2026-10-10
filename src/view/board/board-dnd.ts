import type { Task } from '@/model/types'

export type ColumnItems = Record<string, string[]>

export function buildColumnItems(
  statuses: Array<{ id: string }>,
  tasksByStatus: Map<string, Task[]>,
): ColumnItems {
  const items: ColumnItems = {}
  for (const status of statuses) {
    items[status.id] = (tasksByStatus.get(status.id) ?? []).map(
      (task) => task.id,
    )
  }
  return items
}

export function findContainer(
  items: ColumnItems,
  id: string,
): string | undefined {
  if (id in items) {
    return id
  }
  return Object.keys(items).find((key) => items[key]?.includes(id))
}

export function neighborsForIndex(
  orderedIds: string[],
  index: number,
): { afterId: string | null; beforeId: string | null } {
  return {
    afterId: index > 0 ? (orderedIds[index - 1] ?? null) : null,
    beforeId:
      index < orderedIds.length - 1 ? (orderedIds[index + 1] ?? null) : null,
  }
}
