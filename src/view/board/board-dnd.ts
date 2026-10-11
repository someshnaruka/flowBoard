import {
  closestCorners,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core'
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

/**
 * Prefer pointer-within column droppables so empty columns still accept drops
 * (closestCorners alone often misses empty containers).
 */
export function createBoardCollisionDetection(
  columns: ColumnItems,
): CollisionDetection {
  return (args) => {
    const pointerHits = pointerWithin(args)
    const intersections =
      pointerHits.length > 0 ? pointerHits : rectIntersection(args)
    const overId = getFirstCollision(intersections, 'id')

    if (overId == null) {
      return closestCorners(args)
    }

    const containerId = String(overId)
    if (containerId in columns) {
      const containerItems = columns[containerId] ?? []
      if (containerItems.length > 0) {
        const nested = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) =>
            containerItems.includes(String(container.id)),
          ),
        })
        if (nested.length > 0) {
          return nested
        }
      }
      return [{ id: overId }]
    }

    return intersections.length > 0 ? intersections : closestCorners(args)
  }
}
