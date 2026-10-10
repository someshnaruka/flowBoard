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
