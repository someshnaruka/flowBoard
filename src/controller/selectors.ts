import {
  canEdit,
  canView,
  filterTree,
} from '@/model/services/permission.service'
import type { AppState, ContainerNode, Status, Task, User } from '@/model/types'
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

export function selectCanEditTask(state: AppState, taskId: string): boolean {
  const task = state.tasks[taskId]
  if (!task) {
    return false
  }
  return canEdit(state, state.currentUserId, task.listId)
}

export function selectSubtasks(state: AppState, parentTaskId: string): Task[] {
  const parent = state.tasks[parentTaskId]
  if (!parent || !canView(state, state.currentUserId, parent.listId)) {
    return []
  }

  return Object.values(state.tasks)
    .filter(
      (task) =>
        task.parentTaskId === parentTaskId && task.archivedAt == null,
    )
    .sort((a, b) => a.position - b.position)
}

export function selectBreadcrumb(
  state: AppState,
  listId: string,
): ContainerNode[] {
  if (!canView(state, state.currentUserId, listId)) {
    return []
  }

  const chain: ContainerNode[] = []
  let current: ContainerNode | undefined = state.nodes[listId]
  while (current) {
    chain.unshift(current)
    current = current.parentId
      ? state.nodes[current.parentId]
      : undefined
  }
  return chain
}
