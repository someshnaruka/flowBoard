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
