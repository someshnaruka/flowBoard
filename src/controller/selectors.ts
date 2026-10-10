import { canView, filterTree } from '@/model/services/permission.service'
import type { AppState, Status, Task, User } from '@/model/types'
import type { VisibleTreeNode } from '@/model/services/permission.service'

export function selectCurrentUser(state: AppState): User | null {
  return state.users[state.currentUserId] ?? null
}

export function selectVisibleTree(state: AppState): VisibleTreeNode[] {
  return filterTree(state, state.currentUserId)
}

export function selectTasksForList(
  state: AppState,
  listId: string,
): Task[] {
  if (!canView(state, state.currentUserId, listId)) {
    return []
  }

  return Object.values(state.tasks)
    .filter(
      (task) =>
        task.listId === listId &&
        task.parentTaskId == null &&
        task.archivedAt == null,
    )
    .sort((a, b) => a.position - b.position)
}

export function selectStatusesForList(
  state: AppState,
  listId: string,
): Status[] {
  if (!canView(state, state.currentUserId, listId)) {
    return []
  }

  return Object.values(state.statuses)
    .filter((status) => status.listId === listId)
    .sort((a, b) => a.position - b.position)
}

export function selectSubtaskCount(state: AppState, taskId: string): number {
  return Object.values(state.tasks).filter(
    (task) => task.parentTaskId === taskId && task.archivedAt == null,
  ).length
}

export function selectTaskById(
  state: AppState,
  taskId: string,
): Task | null {
  const task = state.tasks[taskId]
  if (!task) {
    return null
  }
  if (!canView(state, state.currentUserId, task.listId)) {
    return null
  }
  return task
}
