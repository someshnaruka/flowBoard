import type { Priority, Task } from '@/model/types'

export type ListSortKey = 'dueDate' | 'priority'
export type ListSortDir = 'asc' | 'desc'

const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
  none: 0,
}

export function compareTasks(
  a: Task,
  b: Task,
  key: ListSortKey,
  dir: ListSortDir,
): number {
  const sign = dir === 'asc' ? 1 : -1

  if (key === 'priority') {
    const delta = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    if (delta !== 0) {
      return delta * sign
    }
  } else {
    const aDate = a.dueDate
    const bDate = b.dueDate
    if (aDate == null && bDate == null) {
      // fall through
    } else if (aDate == null) {
      return 1
    } else if (bDate == null) {
      return -1
    } else if (aDate !== bDate) {
      return aDate < bDate ? -1 * sign : 1 * sign
    }
  }

  return a.position - b.position
}

export function sortTasks(
  tasks: Task[],
  key: ListSortKey | null,
  dir: ListSortDir,
): Task[] {
  if (!key) {
    return [...tasks].sort((a, b) => a.position - b.position)
  }
  return [...tasks].sort((a, b) => compareTasks(a, b, key, dir))
}
