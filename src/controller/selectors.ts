import {
  canEdit,
  canView,
  filterTree,
} from '@/model/services/permission.service'
import type {
  AppState,
  ContainerNode,
  GrantEffect,
  Status,
  Task,
  User,
} from '@/model/types'
import type { VisibleTreeNode } from '@/model/services/permission.service'

/**
 * Effective member access for Access Management UI.
 * Mirrors canView/canEdit: public default is read-write; grants override.
 */
export function selectEffectiveAccess(
  state: AppState,
  userId: string,
  nodeId: string,
): GrantEffect {
  if (!canView(state, userId, nodeId)) {
    return 'deny'
  }
  if (!canEdit(state, userId, nodeId)) {
    return 'view'
  }
  return 'allow'
}

export function selectCurrentUser(state: AppState): User | null {
  return state.users[state.currentUserId] ?? null
}

export function selectVisibleTree(state: AppState): VisibleTreeNode[] {
  return filterTree(state, state.currentUserId)
}

/** Lists the current user can edit (for move-task dropdown). */
export function selectEditableLists(state: AppState): ContainerNode[] {
  return Object.values(state.nodes)
    .filter(
      (node) =>
        node.kind === 'list' &&
        node.archivedAt == null &&
        canEdit(state, state.currentUserId, node.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
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

/** Case-insensitive title/description match for list search. */
export function taskMatchesQuery(task: Task, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }
  return (
    task.title.toLowerCase().includes(normalized) ||
    task.description.toLowerCase().includes(normalized)
  )
}

export function selectTasksForListQuery(
  state: AppState,
  listId: string,
  query: string,
): Task[] {
  return selectTasksForList(state, listId).filter((task) =>
    taskMatchesQuery(task, query),
  )
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
  return selectSubtaskProgress(state, taskId).total
}

export function selectSubtaskProgress(
  state: AppState,
  taskId: string,
): { done: number; total: number } {
  const children = Object.values(state.tasks).filter(
    (task) => task.parentTaskId === taskId && task.archivedAt == null,
  )
  const done = children.filter((task) => {
    const status = state.statuses[task.statusId]
    return status?.category === 'done'
  }).length
  return { done, total: children.length }
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

/** Active (non-archived) siblings of a node, ordered by position. */
export function selectSiblings(
  state: AppState,
  nodeId: string,
): ContainerNode[] {
  const node = state.nodes[nodeId]
  if (!node) {
    return []
  }

  return Object.values(state.nodes)
    .filter(
      (sibling) =>
        sibling.parentId === node.parentId && sibling.archivedAt == null,
    )
    .sort((a, b) => a.position - b.position)
}

/**
 * Ancestor names for a node (workspace → … → parent), used to show where an
 * archived item lived. Includes archived ancestors so cascade context remains.
 */
export function selectNodeOriginPath(
  state: AppState,
  nodeId: string,
): string[] {
  const labels: string[] = []
  let current: ContainerNode | undefined = state.nodes[nodeId]
  if (!current) {
    return labels
  }
  current = current.parentId ? state.nodes[current.parentId] : undefined
  while (current) {
    labels.unshift(current.name)
    current = current.parentId ? state.nodes[current.parentId] : undefined
  }
  return labels
}

/** List breadcrumb path for an archived task (workspace → … → list). */
export function selectTaskOriginPath(state: AppState, taskId: string): string[] {
  const task = state.tasks[taskId]
  if (!task) {
    return []
  }
  const list = state.nodes[task.listId]
  if (!list) {
    return []
  }
  const path = selectNodeOriginPath(state, list.id)
  return [...path, list.name]
}

/**
 * Archived containers the current user can see, limited to archive roots
 * (parent missing or not archived) so cascade children are restored via the root.
 */
export function selectArchivedRoots(state: AppState): ContainerNode[] {
  return Object.values(state.nodes)
    .filter((node) => {
      if (!node.archivedAt || node.kind === 'workspace') {
        return false
      }
      if (!canView(state, state.currentUserId, node.id)) {
        return false
      }
      if (!node.parentId) {
        return true
      }
      const parent = state.nodes[node.parentId]
      return !parent || parent.archivedAt == null
    })
    .sort((a, b) => {
      const aTime = a.archivedAt ?? ''
      const bTime = b.archivedAt ?? ''
      if (aTime !== bTime) {
        return bTime.localeCompare(aTime)
      }
      return a.name.localeCompare(b.name)
    })
}

/**
 * Archived top-level tasks the current user can see. Subtasks archived with a
 * parent are restored via that parent (same stamp cascade).
 */
export function selectArchivedTaskRoots(state: AppState): Task[] {
  return Object.values(state.tasks)
    .filter((task) => {
      if (!task.archivedAt || task.parentTaskId != null) {
        return false
      }
      return canView(state, state.currentUserId, task.listId)
    })
    .sort((a, b) => {
      const aTime = a.archivedAt ?? ''
      const bTime = b.archivedAt ?? ''
      if (aTime !== bTime) {
        return bTime.localeCompare(aTime)
      }
      return a.title.localeCompare(b.title)
    })
}
