import { fail, ok, type Result } from '../errors'
import { newId } from '../id'
import type { AppState, ContainerNode, Grant, GrantEffect } from '../types'

export type PermissionAction = 'view' | 'edit'

function getUser(state: AppState, userId: string) {
  return state.users[userId]
}

function getNode(
  state: AppState,
  nodeId: string,
): ContainerNode | undefined {
  return state.nodes[nodeId]
}

/** Ancestor chain from the node up to the workspace root (node first). */
export function getAncestorChain(
  state: AppState,
  nodeId: string,
): ContainerNode[] {
  const chain: ContainerNode[] = []
  let current: ContainerNode | undefined = getNode(state, nodeId)

  while (current) {
    chain.push(current)
    current = current.parentId ? getNode(state, current.parentId) : undefined
  }

  return chain
}

function grantsForUser(
  state: AppState,
  userId: string,
): Map<string, GrantEffect> {
  const map = new Map<string, GrantEffect>()
  for (const grant of Object.values(state.grants) as Grant[]) {
    if (grant.userId === userId) {
      map.set(grant.nodeId, grant.effect)
    }
  }
  return map
}

/**
 * Nearest grant on the node or its ancestors wins.
 * Returns null when no grant applies.
 */
export function findNearestGrant(
  state: AppState,
  userId: string,
  nodeId: string,
): GrantEffect | null {
  const grants = grantsForUser(state, userId)
  for (const node of getAncestorChain(state, nodeId)) {
    const effect = grants.get(node.id)
    if (effect) {
      return effect
    }
  }
  return null
}

function hasPrivateAncestor(state: AppState, nodeId: string): boolean {
  return getAncestorChain(state, nodeId).some((node) => node.isPrivate)
}

/**
 * Admin bypasses everything.
 * Members: nearest grant wins (`allow`/`view` show, `deny` hides);
 * otherwise any private ancestor hides the node; otherwise visible.
 */
export function canView(
  state: AppState,
  userId: string,
  nodeId: string,
): boolean {
  const user = getUser(state, userId)
  const node = getNode(state, nodeId)
  if (!user || !node) {
    return false
  }
  if (user.role === 'admin') {
    return true
  }

  const nearest = findNearestGrant(state, userId, nodeId)
  if (nearest === 'allow' || nearest === 'view') {
    return true
  }
  if (nearest === 'deny') {
    return false
  }
  if (hasPrivateAncestor(state, nodeId)) {
    return false
  }
  return true
}

/**
 * Admin always edits. Members need nearest grant `allow`
 * (or public visibility with no deny/view override).
 * `view` grants are read-only.
 */
export function canEdit(
  state: AppState,
  userId: string,
  nodeId: string,
): boolean {
  const user = getUser(state, userId)
  const node = getNode(state, nodeId)
  if (!user || !node) {
    return false
  }
  if (user.role === 'admin') {
    return true
  }

  const nearest = findNearestGrant(state, userId, nodeId)
  if (nearest === 'allow') {
    return true
  }
  if (nearest === 'view' || nearest === 'deny') {
    return false
  }
  if (hasPrivateAncestor(state, nodeId)) {
    return false
  }
  return true
}

export function assertCan(
  state: AppState,
  userId: string,
  nodeId: string,
  action: PermissionAction,
): Result<true> {
  const node = getNode(state, nodeId)
  if (!node) {
    return fail('NOT_FOUND', `Node ${nodeId} not found`)
  }
  const user = getUser(state, userId)
  if (!user) {
    return fail('NOT_FOUND', `User ${userId} not found`)
  }

  const allowed =
    action === 'view'
      ? canView(state, userId, nodeId)
      : canEdit(state, userId, nodeId)

  if (!allowed) {
    return fail(
      'FORBIDDEN',
      `Forbidden — cannot ${action} “${node.name}”`,
    )
  }

  return ok(true)
}

export type UpsertGrantInput = {
  userId: string
  nodeId: string
  /** `null` removes any grant on this user+node. */
  effect: GrantEffect | null
}

/** Admin-only grant upsert/remove. Pure; does not mutate `state`. */
export function upsertGrant(
  state: AppState,
  actorId: string,
  input: UpsertGrantInput,
): Result<{ state: AppState; grant: Grant | null }> {
  const actor = getUser(state, actorId)
  if (!actor || actor.role !== 'admin') {
    return fail('FORBIDDEN', 'Forbidden — only admins can manage grants')
  }
  const target = getUser(state, input.userId)
  if (!target) {
    return fail('NOT_FOUND', `User ${input.userId} not found`)
  }
  if (target.role === 'admin') {
    return fail('VALIDATION', 'Admins bypass grants; no grant needed')
  }
  const node = getNode(state, input.nodeId)
  if (!node) {
    return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
  }

  const existing = Object.values(state.grants).find(
    (grant) =>
      grant.userId === input.userId && grant.nodeId === input.nodeId,
  )

  const grants = { ...state.grants }
  if (existing) {
    delete grants[existing.id]
  }

  if (input.effect == null) {
    return ok({ state: { ...state, grants }, grant: null })
  }

  const grant: Grant = {
    id: existing?.id ?? newId(),
    userId: input.userId,
    nodeId: input.nodeId,
    effect: input.effect,
  }
  grants[grant.id] = grant
  return ok({ state: { ...state, grants }, grant })
}

/** Admin-only toggle for container privacy. */
export function setNodePrivate(
  state: AppState,
  actorId: string,
  nodeId: string,
  isPrivate: boolean,
): Result<{ state: AppState; node: ContainerNode }> {
  const actor = getUser(state, actorId)
  if (!actor || actor.role !== 'admin') {
    return fail('FORBIDDEN', 'Forbidden — only admins can edit privacy')
  }
  const node = getNode(state, nodeId)
  if (!node) {
    return fail('NOT_FOUND', `Node ${nodeId} not found`)
  }

  const next: ContainerNode = {
    ...node,
    isPrivate,
    updatedAt: new Date().toISOString(),
  }
  return ok({
    state: {
      ...state,
      nodes: { ...state.nodes, [nodeId]: next },
    },
    node: next,
  })
}

export type VisibleTreeNode = {
  id: string
  node: ContainerNode
  /** True when included only so the user can navigate to an allowed descendant. */
  isShell: boolean
  children: VisibleTreeNode[]
}

/**
 * Visible hierarchy for a user. Directly visible nodes plus ancestors of
 * allowed nodes as navigable shells (isShell: true).
 */
export function filterTree(
  state: AppState,
  userId: string,
): VisibleTreeNode[] {
  const includeIds = new Set<string>()
  const directIds = new Set<string>()

  for (const node of Object.values(state.nodes)) {
    if (node.archivedAt) {
      continue
    }
    if (!canView(state, userId, node.id)) {
      continue
    }
    directIds.add(node.id)
    for (const ancestor of getAncestorChain(state, node.id)) {
      includeIds.add(ancestor.id)
    }
  }

  const childrenByParent = new Map<string | null, ContainerNode[]>()
  for (const node of Object.values(state.nodes)) {
    if (node.archivedAt || !includeIds.has(node.id)) {
      continue
    }
    const key = node.parentId
    const siblings = childrenByParent.get(key) ?? []
    siblings.push(node)
    childrenByParent.set(key, siblings)
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((a, b) => a.position - b.position)
  }

  function build(parentId: string | null): VisibleTreeNode[] {
    const siblings = childrenByParent.get(parentId) ?? []
    return siblings.map((node) => ({
      id: node.id,
      node,
      isShell: !directIds.has(node.id),
      children: build(node.id),
    }))
  }

  return build(null)
}
