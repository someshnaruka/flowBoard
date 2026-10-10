import { fail, ok, type Result } from '../errors'
import { newId } from '../id'
import { after, before, between } from '../position'
import type { AppState, ContainerNode, NodeKind } from '../types'

const VALID_PARENT_KIND: Record<NodeKind, NodeKind | null> = {
  workspace: null,
  space: 'workspace',
  folder: 'space',
  list: 'folder',
}

export type HierarchyMutation = {
  state: AppState
  node: ContainerNode
}

function cloneState(state: AppState): AppState {
  return {
    ...state,
    nodes: { ...state.nodes },
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

export function getChildren(
  state: AppState,
  parentId: string | null,
): ContainerNode[] {
  return Object.values(state.nodes)
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.position - b.position)
}

export function validateParent(
  state: AppState,
  kind: NodeKind,
  parentId: string | null,
): Result<ContainerNode | null> {
  const expected = VALID_PARENT_KIND[kind]

  if (expected === null) {
    if (parentId !== null) {
      return fail(
        'INVALID_PARENT',
        'Workspace must not have a parent',
      )
    }
    return ok(null)
  }

  if (parentId === null) {
    return fail(
      'INVALID_PARENT',
      `${kind} requires a ${expected} parent`,
    )
  }

  const parent = state.nodes[parentId]
  if (!parent) {
    return fail('NOT_FOUND', `Parent ${parentId} not found`)
  }
  if (parent.kind !== expected) {
    return fail(
      'INVALID_PARENT',
      `${kind} parent must be a ${expected}, got ${parent.kind}`,
    )
  }
  if (parent.kind === 'list') {
    return fail('INVALID_PARENT', 'Nothing can be nested under a list')
  }

  return ok(parent)
}

export type CreateNodeInput = {
  kind: NodeKind
  name: string
  parentId: string | null
  isPrivate?: boolean
  /** When omitted, appends after the last sibling. */
  afterId?: string | null
  beforeId?: string | null
}

export function createNode(
  state: AppState,
  _actorId: string,
  input: CreateNodeInput,
): Result<HierarchyMutation> {
  const name = input.name.trim()
  if (!name) {
    return fail('VALIDATION', 'Name is required')
  }
  if (name.length > 200) {
    return fail('VALIDATION', 'Name must be at most 200 characters')
  }

  const parentResult = validateParent(state, input.kind, input.parentId)
  if ('error' in parentResult) {
    return parentResult
  }

  if (input.kind === 'workspace') {
    const existingWorkspace = Object.values(state.nodes).find(
      (node) => node.kind === 'workspace',
    )
    if (existingWorkspace) {
      return fail('CONFLICT', 'Only one workspace is allowed')
    }
  }

  const siblings = getChildren(state, input.parentId)
  const afterNode = input.afterId ? state.nodes[input.afterId] : undefined
  const beforeNode = input.beforeId ? state.nodes[input.beforeId] : undefined

  if (input.afterId && !afterNode) {
    return fail('NOT_FOUND', `afterId ${input.afterId} not found`)
  }
  if (input.beforeId && !beforeNode) {
    return fail('NOT_FOUND', `beforeId ${input.beforeId} not found`)
  }

  let position: number
  if (afterNode && beforeNode) {
    position = between(afterNode.position, beforeNode.position)
  } else if (afterNode) {
    position = after(afterNode.position)
  } else if (beforeNode) {
    position = before(beforeNode.position)
  } else if (siblings.length > 0) {
    position = after(siblings[siblings.length - 1]?.position)
  } else {
    position = after(null)
  }

  const timestamp = nowIso()
  const node: ContainerNode = {
    id: newId(),
    kind: input.kind,
    name,
    parentId: input.parentId,
    position,
    archivedAt: null,
    isPrivate: input.isPrivate ?? false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const next = cloneState(state)
  next.nodes[node.id] = node
  return ok({ state: next, node })
}

export type RenameNodeInput = {
  nodeId: string
  name: string
}

export function renameNode(
  state: AppState,
  _actorId: string,
  input: RenameNodeInput,
): Result<HierarchyMutation> {
  const existing = state.nodes[input.nodeId]
  if (!existing) {
    return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
  }

  const name = input.name.trim()
  if (!name) {
    return fail('VALIDATION', 'Name is required')
  }
  if (name.length > 200) {
    return fail('VALIDATION', 'Name must be at most 200 characters')
  }

  const node: ContainerNode = {
    ...existing,
    name,
    updatedAt: nowIso(),
  }
  const next = cloneState(state)
  next.nodes[node.id] = node
  return ok({ state: next, node })
}

function isDescendant(
  state: AppState,
  ancestorId: string,
  maybeDescendantId: string,
): boolean {
  let current = state.nodes[maybeDescendantId]
  while (current?.parentId) {
    if (current.parentId === ancestorId) {
      return true
    }
    current = state.nodes[current.parentId]
  }
  return false
}

export function collectDescendantIds(
  state: AppState,
  nodeId: string,
): string[] {
  const ids: string[] = []
  const queue = [nodeId]
  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId) {
      continue
    }
    for (const child of getChildren(state, currentId)) {
      ids.push(child.id)
      queue.push(child.id)
    }
  }
  return ids
}

export type MoveNodeInput = {
  nodeId: string
  newParentId: string | null
}

export function moveNode(
  state: AppState,
  _actorId: string,
  input: MoveNodeInput,
): Result<HierarchyMutation> {
  const existing = state.nodes[input.nodeId]
  if (!existing) {
    return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
  }
  if (existing.kind === 'workspace') {
    return fail('INVALID_PARENT', 'Cannot move the workspace')
  }

  if (input.newParentId === existing.parentId) {
    return ok({ state, node: existing })
  }

  if (input.newParentId === input.nodeId) {
    return fail('INVALID_PARENT', 'Cannot move a node under itself')
  }
  if (
    input.newParentId &&
    isDescendant(state, input.nodeId, input.newParentId)
  ) {
    return fail('INVALID_PARENT', 'Cannot move a node under its descendant')
  }

  const parentResult = validateParent(
    state,
    existing.kind,
    input.newParentId,
  )
  if ('error' in parentResult) {
    return parentResult
  }

  const siblings = getChildren(state, input.newParentId).filter(
    (node) => node.id !== input.nodeId,
  )
  const position =
    siblings.length > 0
      ? after(siblings[siblings.length - 1]?.position)
      : after(null)

  const node: ContainerNode = {
    ...existing,
    parentId: input.newParentId,
    position,
    updatedAt: nowIso(),
  }
  const next = cloneState(state)
  next.nodes[node.id] = node
  return ok({ state: next, node })
}

export type ReorderNodeInput = {
  nodeId: string
  /** Sibling id that should end up before this node; null = move to start. */
  afterId?: string | null
  /** Sibling id that should end up after this node; null = move to end. */
  beforeId?: string | null
}

export function reorderNode(
  state: AppState,
  _actorId: string,
  input: ReorderNodeInput,
): Result<HierarchyMutation> {
  const existing = state.nodes[input.nodeId]
  if (!existing) {
    return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
  }

  const afterNode =
    input.afterId != null ? state.nodes[input.afterId] : undefined
  const beforeNode =
    input.beforeId != null ? state.nodes[input.beforeId] : undefined

  if (input.afterId != null && !afterNode) {
    return fail('NOT_FOUND', `afterId ${input.afterId} not found`)
  }
  if (input.beforeId != null && !beforeNode) {
    return fail('NOT_FOUND', `beforeId ${input.beforeId} not found`)
  }
  if (afterNode && afterNode.parentId !== existing.parentId) {
    return fail('VALIDATION', 'afterId must be a sibling')
  }
  if (beforeNode && beforeNode.parentId !== existing.parentId) {
    return fail('VALIDATION', 'beforeId must be a sibling')
  }
  if (input.afterId === input.nodeId || input.beforeId === input.nodeId) {
    return fail('VALIDATION', 'Cannot reorder relative to self')
  }

  let position: number
  if (afterNode && beforeNode) {
    position = between(afterNode.position, beforeNode.position)
  } else if (afterNode) {
    position = after(afterNode.position)
  } else if (beforeNode) {
    position = before(beforeNode.position)
  } else {
    const siblings = getChildren(state, existing.parentId).filter(
      (node) => node.id !== existing.id,
    )
    position =
      siblings.length > 0
        ? after(siblings[siblings.length - 1]?.position)
        : after(null)
  }

  const node: ContainerNode = {
    ...existing,
    position,
    updatedAt: nowIso(),
  }
  const next = cloneState(state)
  next.nodes[node.id] = node
  return ok({ state: next, node })
}

export type ArchiveNodeInput = {
  nodeId: string
}

export function archiveNode(
  state: AppState,
  _actorId: string,
  input: ArchiveNodeInput,
): Result<{ state: AppState; archivedIds: string[] }> {
  const existing = state.nodes[input.nodeId]
  if (!existing) {
    return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
  }
  if (existing.kind === 'workspace') {
    return fail('VALIDATION', 'Cannot archive the workspace')
  }
  if (existing.archivedAt) {
    return fail('CONFLICT', 'Node is already archived')
  }

  const timestamp = nowIso()
  const archivedIds = [input.nodeId, ...collectDescendantIds(state, input.nodeId)]
  const next = cloneState(state)

  for (const id of archivedIds) {
    const node = next.nodes[id]
    if (!node || node.archivedAt) {
      continue
    }
    next.nodes[id] = {
      ...node,
      archivedAt: timestamp,
      updatedAt: timestamp,
    }
  }

  return ok({ state: next, archivedIds })
}

export type RestoreNodeInput = {
  nodeId: string
}

export function restoreNode(
  state: AppState,
  _actorId: string,
  input: RestoreNodeInput,
): Result<{ state: AppState; restoredIds: string[] }> {
  const existing = state.nodes[input.nodeId]
  if (!existing) {
    return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
  }
  if (!existing.archivedAt) {
    return fail('CONFLICT', 'Node is not archived')
  }

  if (existing.parentId) {
    const parent = state.nodes[existing.parentId]
    if (!parent) {
      return fail('NOT_FOUND', `Parent ${existing.parentId} not found`)
    }
    if (parent.archivedAt) {
      return fail(
        'INVALID_PARENT',
        'Cannot restore while parent is archived',
      )
    }
  }

  const timestamp = nowIso()
  const cascadeStamp = existing.archivedAt
  const candidateIds = [
    input.nodeId,
    ...collectDescendantIds(state, input.nodeId),
  ]
  const restoredIds = candidateIds.filter((id) => {
    const node = state.nodes[id]
    return node?.archivedAt === cascadeStamp
  })

  const next = cloneState(state)
  for (const id of restoredIds) {
    const node = next.nodes[id]
    if (!node) {
      continue
    }
    next.nodes[id] = {
      ...node,
      archivedAt: null,
      updatedAt: timestamp,
    }
  }

  return ok({ state: next, restoredIds })
}
