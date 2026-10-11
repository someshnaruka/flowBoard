import { fail, ok, type Result } from '../errors'
import { newId } from '../id'
import { after, before, between } from '../position'
import type {
  AppState,
  Priority,
  Status,
  StatusCategory,
  Task,
  TaskActivityItem,
} from '../types'

export type TaskMutation = {
  state: AppState
  task: Task
}

const MAX_TITLE = 500

function cloneState(state: AppState): AppState {
  return {
    ...state,
    tasks: { ...state.tasks },
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

function activityItem(
  actorId: string,
  summary: string,
  createdAt = nowIso(),
): TaskActivityItem {
  return {
    id: newId(),
    actorId,
    summary,
    createdAt,
  }
}

function withActivity(task: Task, item: TaskActivityItem): Task {
  return {
    ...task,
    activity: [item, ...task.activity].slice(0, 40),
    updatedAt: item.createdAt,
  }
}

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
  none: 'None',
}

function getListTasks(state: AppState, listId: string): Task[] {
  return Object.values(state.tasks)
    .filter((task) => task.listId === listId && task.parentTaskId == null)
    .sort((a, b) => a.position - b.position)
}

function validateTitle(title: string): Result<string> {
  const trimmed = title.trim()
  if (!trimmed) {
    return fail('VALIDATION', 'Title is required')
  }
  if (trimmed.length > MAX_TITLE) {
    return fail('VALIDATION', `Title must be at most ${MAX_TITLE} characters`)
  }
  return ok(trimmed)
}

function assertListWritable(
  state: AppState,
  listId: string,
): Result<true> {
  const list = state.nodes[listId]
  if (!list || list.kind !== 'list') {
    return fail('NOT_FOUND', `List ${listId} not found`)
  }
  if (list.archivedAt) {
    return fail('VALIDATION', 'Cannot modify tasks on an archived list')
  }
  return ok(true)
}

function assertStatusOnList(
  state: AppState,
  listId: string,
  statusId: string,
): Result<true> {
  const status = state.statuses[statusId]
  if (!status) {
    return fail('INVALID_STATUS', `Status ${statusId} not found`)
  }
  if (status.listId !== listId) {
    return fail(
      'INVALID_STATUS',
      `Status ${statusId} does not belong to list ${listId}`,
    )
  }
  return ok(true)
}

export type CreateTaskInput = {
  listId: string
  title: string
  statusId: string
  description?: string
  priority?: Priority
  assigneeIds?: string[]
  dueDate?: string | null
  parentTaskId?: string | null
}

export function createTask(
  state: AppState,
  actorId: string,
  input: CreateTaskInput,
): Result<TaskMutation> {
  const listCheck = assertListWritable(state, input.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const titleResult = validateTitle(input.title)
  if ('error' in titleResult) {
    return titleResult
  }

  const statusCheck = assertStatusOnList(state, input.listId, input.statusId)
  if ('error' in statusCheck) {
    return statusCheck
  }

  if (input.parentTaskId) {
    const parent = state.tasks[input.parentTaskId]
    if (!parent) {
      return fail('NOT_FOUND', `Parent task ${input.parentTaskId} not found`)
    }
    if (parent.listId !== input.listId) {
      return fail('VALIDATION', 'Subtask must share the parent list')
    }
    if (parent.parentTaskId) {
      return fail('VALIDATION', 'Subtasks may only be depth 1')
    }
  }

  for (const assigneeId of input.assigneeIds ?? []) {
    if (!state.users[assigneeId]) {
      return fail('NOT_FOUND', `Assignee ${assigneeId} not found`)
    }
  }

  const siblings = input.parentTaskId
    ? Object.values(state.tasks)
        .filter((task) => task.parentTaskId === input.parentTaskId)
        .sort((a, b) => a.position - b.position)
    : getListTasks(state, input.listId)

  const position =
    siblings.length > 0
      ? after(siblings[siblings.length - 1]?.position)
      : after(null)

  const timestamp = nowIso()
  const assignees = [...(input.assigneeIds ?? [])]
  const created = activityItem(actorId, 'created this task', timestamp)
  const activity: TaskActivityItem[] = [created]
  for (const assigneeId of assignees) {
    activity.push(
      activityItem(assigneeId, 'was assigned', timestamp),
    )
  }

  const task: Task = {
    id: newId(),
    listId: input.listId,
    title: titleResult.data,
    description: input.description ?? '',
    statusId: input.statusId,
    priority: input.priority ?? 'none',
    assigneeIds: assignees,
    dueDate: input.dueDate ?? null,
    position,
    parentTaskId: input.parentTaskId ?? null,
    archivedAt: null,
    createdById: actorId,
    activity,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const next = cloneState(state)
  next.tasks[task.id] = task
  return ok({ state: next, task })
}

export type UpdateTaskInput = {
  taskId: string
  title?: string
  description?: string
  priority?: Priority
  assigneeIds?: string[]
  dueDate?: string | null
}

export function updateTask(
  state: AppState,
  actorId: string,
  input: UpdateTaskInput,
): Result<TaskMutation> {
  const existing = state.tasks[input.taskId]
  if (!existing) {
    return fail('NOT_FOUND', `Task ${input.taskId} not found`)
  }

  const listCheck = assertListWritable(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  let title = existing.title
  if (input.title !== undefined) {
    const titleResult = validateTitle(input.title)
    if ('error' in titleResult) {
      return titleResult
    }
    title = titleResult.data
  }

  if (input.assigneeIds) {
    for (const assigneeId of input.assigneeIds) {
      if (!state.users[assigneeId]) {
        return fail('NOT_FOUND', `Assignee ${assigneeId} not found`)
      }
    }
  }

  const timestamp = nowIso()
  const nextAssignees = input.assigneeIds
    ? [...input.assigneeIds]
    : existing.assigneeIds
  const nextPriority = input.priority ?? existing.priority
  const nextDue =
    input.dueDate !== undefined ? input.dueDate : existing.dueDate

  let task: Task = {
    ...existing,
    title,
    description:
      input.description !== undefined ? input.description : existing.description,
    priority: nextPriority,
    assigneeIds: nextAssignees,
    dueDate: nextDue,
    updatedAt: timestamp,
  }

  if (input.priority !== undefined && input.priority !== existing.priority) {
    task = withActivity(
      task,
      activityItem(
        actorId,
        `changed priority to ${PRIORITY_LABEL[input.priority]}`,
        timestamp,
      ),
    )
  }

  if (input.dueDate !== undefined && input.dueDate !== existing.dueDate) {
    task = withActivity(
      task,
      activityItem(
        actorId,
        input.dueDate ? `set due date to ${input.dueDate}` : 'cleared due date',
        timestamp,
      ),
    )
  }

  if (input.assigneeIds) {
    const prev = new Set(existing.assigneeIds)
    const nextIds = new Set(input.assigneeIds)
    for (const id of input.assigneeIds) {
      if (!prev.has(id)) {
        task = withActivity(
          task,
          activityItem(id, 'was assigned', timestamp),
        )
      }
    }
    for (const id of existing.assigneeIds) {
      if (!nextIds.has(id)) {
        task = withActivity(
          task,
          activityItem(id, 'was unassigned', timestamp),
        )
      }
    }
  }

  if (
    input.title !== undefined &&
    title !== existing.title &&
    input.priority === undefined &&
    input.dueDate === undefined &&
    input.assigneeIds === undefined
  ) {
    task = withActivity(
      task,
      activityItem(actorId, 'updated the title', timestamp),
    )
  }

  const next = cloneState(state)
  next.tasks[task.id] = task
  return ok({ state: next, task })
}

export type DeleteTaskInput = {
  taskId: string
}

export function deleteTask(
  state: AppState,
  _actorId: string,
  input: DeleteTaskInput,
): Result<{ state: AppState; deletedIds: string[] }> {
  const existing = state.tasks[input.taskId]
  if (!existing) {
    return fail('NOT_FOUND', `Task ${input.taskId} not found`)
  }

  const listCheck = assertListWritable(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const deletedIds = [
    input.taskId,
    ...Object.values(state.tasks)
      .filter((task) => task.parentTaskId === input.taskId)
      .map((task) => task.id),
  ]

  const next = cloneState(state)
  for (const id of deletedIds) {
    delete next.tasks[id]
  }

  return ok({ state: next, deletedIds })
}

export type ArchiveTaskInput = {
  taskId: string
}

function taskCascadeIds(state: AppState, taskId: string): string[] {
  return [
    taskId,
    ...Object.values(state.tasks)
      .filter((task) => task.parentTaskId === taskId)
      .map((task) => task.id),
  ]
}

export function archiveTask(
  state: AppState,
  _actorId: string,
  input: ArchiveTaskInput,
): Result<{ state: AppState; archivedIds: string[] }> {
  const existing = state.tasks[input.taskId]
  if (!existing) {
    return fail('NOT_FOUND', `Task ${input.taskId} not found`)
  }
  if (existing.archivedAt) {
    return fail('CONFLICT', 'Task is already archived')
  }

  const listCheck = assertListWritable(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const timestamp = nowIso()
  const archivedIds = taskCascadeIds(state, input.taskId)
  const next = cloneState(state)
  for (const id of archivedIds) {
    const task = next.tasks[id]
    if (!task || task.archivedAt) {
      continue
    }
    next.tasks[id] = {
      ...task,
      archivedAt: timestamp,
      updatedAt: timestamp,
    }
  }

  return ok({ state: next, archivedIds })
}

export function restoreTask(
  state: AppState,
  _actorId: string,
  input: ArchiveTaskInput,
): Result<{ state: AppState; restoredIds: string[] }> {
  const existing = state.tasks[input.taskId]
  if (!existing) {
    return fail('NOT_FOUND', `Task ${input.taskId} not found`)
  }
  if (!existing.archivedAt) {
    return fail('CONFLICT', 'Task is not archived')
  }

  const listCheck = assertListWritable(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const stamp = existing.archivedAt
  const restoredIds = taskCascadeIds(state, input.taskId).filter(
    (id) => state.tasks[id]?.archivedAt === stamp,
  )
  const timestamp = nowIso()
  const next = cloneState(state)
  for (const id of restoredIds) {
    const task = next.tasks[id]
    if (!task) {
      continue
    }
    next.tasks[id] = {
      ...task,
      archivedAt: null,
      updatedAt: timestamp,
    }
  }

  return ok({ state: next, restoredIds })
}

export type ChangeStatusInput = {
  taskId: string
  statusId: string
}

export function changeStatus(
  state: AppState,
  actorId: string,
  input: ChangeStatusInput,
): Result<TaskMutation> {
  const existing = state.tasks[input.taskId]
  if (!existing) {
    return fail('NOT_FOUND', `Task ${input.taskId} not found`)
  }

  const listCheck = assertListWritable(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const statusCheck = assertStatusOnList(
    state,
    existing.listId,
    input.statusId,
  )
  if ('error' in statusCheck) {
    return statusCheck
  }

  if (existing.statusId === input.statusId) {
    return ok({ state, task: existing })
  }

  const status = state.statuses[input.statusId]
  const timestamp = nowIso()
  const task = withActivity(
    {
      ...existing,
      statusId: input.statusId,
      updatedAt: timestamp,
    },
    activityItem(
      actorId,
      `changed status to ${status?.name ?? 'updated'}`,
      timestamp,
    ),
  )
  const next = cloneState(state)
  next.tasks[task.id] = task
  return ok({ state: next, task })
}

export type ReorderTaskInput = {
  taskId: string
  afterId?: string | null
  beforeId?: string | null
}

export function reorderTask(
  state: AppState,
  _actorId: string,
  input: ReorderTaskInput,
): Result<TaskMutation> {
  const existing = state.tasks[input.taskId]
  if (!existing) {
    return fail('NOT_FOUND', `Task ${input.taskId} not found`)
  }

  const listCheck = assertListWritable(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const afterTask =
    input.afterId != null ? state.tasks[input.afterId] : undefined
  const beforeTask =
    input.beforeId != null ? state.tasks[input.beforeId] : undefined

  if (input.afterId != null && !afterTask) {
    return fail('NOT_FOUND', `afterId ${input.afterId} not found`)
  }
  if (input.beforeId != null && !beforeTask) {
    return fail('NOT_FOUND', `beforeId ${input.beforeId} not found`)
  }

  const sameGroup = (other: Task) =>
    other.listId === existing.listId &&
    other.parentTaskId === existing.parentTaskId

  if (afterTask && !sameGroup(afterTask)) {
    return fail('VALIDATION', 'afterId must be in the same list group')
  }
  if (beforeTask && !sameGroup(beforeTask)) {
    return fail('VALIDATION', 'beforeId must be in the same list group')
  }
  if (input.afterId === input.taskId || input.beforeId === input.taskId) {
    return fail('VALIDATION', 'Cannot reorder relative to self')
  }

  let position: number
  if (afterTask && beforeTask) {
    position = between(afterTask.position, beforeTask.position)
  } else if (afterTask) {
    position = after(afterTask.position)
  } else if (beforeTask) {
    position = before(beforeTask.position)
  } else {
    const siblings = (
      existing.parentTaskId
        ? Object.values(state.tasks).filter(
            (task) => task.parentTaskId === existing.parentTaskId,
          )
        : getListTasks(state, existing.listId)
    ).filter((task) => task.id !== existing.id)
    position =
      siblings.length > 0
        ? after(siblings[siblings.length - 1]?.position)
        : after(null)
  }

  const task: Task = {
    ...existing,
    position,
    updatedAt: nowIso(),
  }
  const next = cloneState(state)
  next.tasks[task.id] = task
  return ok({ state: next, task })
}

function statusesForList(state: AppState, listId: string): Status[] {
  return Object.values(state.statuses)
    .filter((status) => status.listId === listId)
    .sort((a, b) => a.position - b.position)
}

function remapStatusId(
  state: AppState,
  fromStatusId: string,
  targetListId: string,
): Result<string> {
  const fromStatus = state.statuses[fromStatusId]
  if (!fromStatus) {
    return fail('INVALID_STATUS', `Status ${fromStatusId} not found`)
  }

  const targetStatuses = statusesForList(state, targetListId)
  if (targetStatuses.length === 0) {
    return fail('INVALID_STATUS', `List ${targetListId} has no statuses`)
  }

  const sameCategory = targetStatuses.find(
    (status) => status.category === fromStatus.category,
  )
  if (sameCategory) {
    return ok(sameCategory.id)
  }

  const fallbackTodo = targetStatuses.find(
    (status) => status.category === ('todo' satisfies StatusCategory),
  )
  if (fallbackTodo) {
    return ok(fallbackTodo.id)
  }

  return ok(targetStatuses[0]!.id)
}

export type MoveTaskToListInput = {
  taskId: string
  targetListId: string
  /** Optional explicit status on the target list; otherwise remapped by category. */
  statusId?: string
  afterId?: string | null
  beforeId?: string | null
}

export function moveTaskToList(
  state: AppState,
  actorId: string,
  input: MoveTaskToListInput,
): Result<TaskMutation> {
  const existing = state.tasks[input.taskId]
  if (!existing) {
    return fail('NOT_FOUND', `Task ${input.taskId} not found`)
  }
  if (existing.parentTaskId) {
    return fail('VALIDATION', 'Move subtasks with their parent task')
  }

  if (existing.listId === input.targetListId) {
    return ok({ state, task: existing })
  }

  const sourceCheck = assertListWritable(state, existing.listId)
  if ('error' in sourceCheck) {
    return sourceCheck
  }
  const targetCheck = assertListWritable(state, input.targetListId)
  if ('error' in targetCheck) {
    return targetCheck
  }

  let statusId = input.statusId
  if (statusId) {
    const statusCheck = assertStatusOnList(
      state,
      input.targetListId,
      statusId,
    )
    if ('error' in statusCheck) {
      return statusCheck
    }
  } else {
    const remapped = remapStatusId(state, existing.statusId, input.targetListId)
    if ('error' in remapped) {
      return remapped
    }
    statusId = remapped.data
  }

  const siblings = getListTasks(state, input.targetListId).filter(
    (task) => task.id !== existing.id,
  )
  const afterTask =
    input.afterId != null ? state.tasks[input.afterId] : undefined
  const beforeTask =
    input.beforeId != null ? state.tasks[input.beforeId] : undefined

  if (input.afterId != null && !afterTask) {
    return fail('NOT_FOUND', `afterId ${input.afterId} not found`)
  }
  if (input.beforeId != null && !beforeTask) {
    return fail('NOT_FOUND', `beforeId ${input.beforeId} not found`)
  }

  let position: number
  if (afterTask && beforeTask) {
    position = between(afterTask.position, beforeTask.position)
  } else if (afterTask) {
    position = after(afterTask.position)
  } else if (beforeTask) {
    position = before(beforeTask.position)
  } else if (siblings.length > 0) {
    position = after(siblings[siblings.length - 1]?.position)
  } else {
    position = after(null)
  }

  const timestamp = nowIso()
  const targetName = state.nodes[input.targetListId]?.name ?? 'another list'
  const next = cloneState(state)
  const task = withActivity(
    {
      ...existing,
      listId: input.targetListId,
      statusId,
      position,
      updatedAt: timestamp,
    },
    activityItem(actorId, `moved task to ${targetName}`, timestamp),
  )
  next.tasks[task.id] = task

  for (const child of Object.values(state.tasks)) {
    if (child.parentTaskId !== existing.id) {
      continue
    }
    const childStatus = remapStatusId(state, child.statusId, input.targetListId)
    if ('error' in childStatus) {
      return childStatus
    }
    next.tasks[child.id] = {
      ...child,
      listId: input.targetListId,
      statusId: childStatus.data,
      updatedAt: timestamp,
    }
  }

  return ok({ state: next, task })
}
