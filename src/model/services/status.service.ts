import { fail, ok, type Result } from '../errors'
import { newId } from '../id'
import { after, before, between } from '../position'
import type { AppState, Status, StatusCategory } from '../types'

export type StatusMutation = {
  state: AppState
  status: Status
}

function cloneState(state: AppState): AppState {
  return {
    ...state,
    statuses: { ...state.statuses },
  }
}

function listStatuses(state: AppState, listId: string): Status[] {
  return Object.values(state.statuses)
    .filter((status) => status.listId === listId)
    .sort((a, b) => a.position - b.position)
}

function assertList(state: AppState, listId: string): Result<true> {
  const list = state.nodes[listId]
  if (!list || list.kind !== 'list') {
    return fail('NOT_FOUND', `List ${listId} not found`)
  }
  if (list.archivedAt) {
    return fail('VALIDATION', 'Cannot modify statuses on an archived list')
  }
  return ok(true)
}

export type AddStatusInput = {
  listId: string
  name: string
  category: StatusCategory
}

export function addStatus(
  state: AppState,
  _actorId: string,
  input: AddStatusInput,
): Result<StatusMutation> {
  const listCheck = assertList(state, input.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const name = input.name.trim()
  if (!name) {
    return fail('VALIDATION', 'Status name is required')
  }

  const siblings = listStatuses(state, input.listId)
  const status: Status = {
    id: newId(),
    listId: input.listId,
    name,
    category: input.category,
    position:
      siblings.length > 0
        ? after(siblings[siblings.length - 1]?.position)
        : after(null),
  }

  const next = cloneState(state)
  next.statuses[status.id] = status
  return ok({ state: next, status })
}

export type RenameStatusInput = {
  statusId: string
  name: string
}

export function renameStatus(
  state: AppState,
  _actorId: string,
  input: RenameStatusInput,
): Result<StatusMutation> {
  const existing = state.statuses[input.statusId]
  if (!existing) {
    return fail('NOT_FOUND', `Status ${input.statusId} not found`)
  }

  const listCheck = assertList(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const name = input.name.trim()
  if (!name) {
    return fail('VALIDATION', 'Status name is required')
  }

  const status: Status = { ...existing, name }
  const next = cloneState(state)
  next.statuses[status.id] = status
  return ok({ state: next, status })
}

export type ReorderStatusInput = {
  statusId: string
  afterId?: string | null
  beforeId?: string | null
}

export function reorderStatus(
  state: AppState,
  _actorId: string,
  input: ReorderStatusInput,
): Result<StatusMutation> {
  const existing = state.statuses[input.statusId]
  if (!existing) {
    return fail('NOT_FOUND', `Status ${input.statusId} not found`)
  }

  const listCheck = assertList(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const afterStatus =
    input.afterId != null ? state.statuses[input.afterId] : undefined
  const beforeStatus =
    input.beforeId != null ? state.statuses[input.beforeId] : undefined

  if (input.afterId != null && !afterStatus) {
    return fail('NOT_FOUND', `afterId ${input.afterId} not found`)
  }
  if (input.beforeId != null && !beforeStatus) {
    return fail('NOT_FOUND', `beforeId ${input.beforeId} not found`)
  }
  if (afterStatus && afterStatus.listId !== existing.listId) {
    return fail('VALIDATION', 'afterId must be on the same list')
  }
  if (beforeStatus && beforeStatus.listId !== existing.listId) {
    return fail('VALIDATION', 'beforeId must be on the same list')
  }
  if (input.afterId === input.statusId || input.beforeId === input.statusId) {
    return fail('VALIDATION', 'Cannot reorder relative to self')
  }

  let position: number
  if (afterStatus && beforeStatus) {
    position = between(afterStatus.position, beforeStatus.position)
  } else if (afterStatus) {
    position = after(afterStatus.position)
  } else if (beforeStatus) {
    position = before(beforeStatus.position)
  } else {
    const siblings = listStatuses(state, existing.listId).filter(
      (status) => status.id !== existing.id,
    )
    position =
      siblings.length > 0
        ? after(siblings[siblings.length - 1]?.position)
        : after(null)
  }

  const status: Status = { ...existing, position }
  const next = cloneState(state)
  next.statuses[status.id] = status
  return ok({ state: next, status })
}

export type DeleteStatusInput = {
  statusId: string
}

export function deleteStatus(
  state: AppState,
  _actorId: string,
  input: DeleteStatusInput,
): Result<{ state: AppState; deletedId: string }> {
  const existing = state.statuses[input.statusId]
  if (!existing) {
    return fail('NOT_FOUND', `Status ${input.statusId} not found`)
  }

  const listCheck = assertList(state, existing.listId)
  if ('error' in listCheck) {
    return listCheck
  }

  const inUse = Object.values(state.tasks).some(
    (task) => task.statusId === input.statusId,
  )
  if (inUse) {
    return fail('CONFLICT', 'Cannot delete a status that is in use')
  }

  const remaining = listStatuses(state, existing.listId).filter(
    (status) => status.id !== existing.id,
  )
  if (remaining.length === 0) {
    return fail('VALIDATION', 'A list must keep at least one status')
  }

  const next = cloneState(state)
  delete next.statuses[input.statusId]
  return ok({ state: next, deletedId: input.statusId })
}
