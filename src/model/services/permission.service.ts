import { fail, ok, type Result } from '../errors'
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
 * Members: nearest grant wins; otherwise any private ancestor hides the node;
 * otherwise visible.
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
  if (nearest === 'allow') {
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
 * Edit follows view for members (no separate edit grants).
 * Admin can always edit existing nodes.
 */
export function canEdit(
  state: AppState,
  userId: string,
  nodeId: string,
): boolean {
  return canView(state, userId, nodeId)
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
      `User ${userId} cannot ${action} node ${nodeId}`,
    )
  }

  return ok(true)
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
    if (!includeIds.has(node.id)) {
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
