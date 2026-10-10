import { fail, ok, type Result } from '../errors'
import { newId } from '../id'
import { after } from '../position'
import type { AppState, Priority, Task } from '../types'

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
  _actorId: string,
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
  const task: Task = {
    id: newId(),
    listId: input.listId,
    title: titleResult.data,
    description: input.description ?? '',
    statusId: input.statusId,
    priority: input.priority ?? 'none',
    assigneeIds: [...(input.assigneeIds ?? [])],
    dueDate: input.dueDate ?? null,
    position,
    parentTaskId: input.parentTaskId ?? null,
    archivedAt: null,
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
  _actorId: string,
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

  const task: Task = {
    ...existing,
    title,
    description:
      input.description !== undefined ? input.description : existing.description,
    priority: input.priority ?? existing.priority,
    assigneeIds: input.assigneeIds
      ? [...input.assigneeIds]
      : existing.assigneeIds,
    dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
    updatedAt: nowIso(),
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
