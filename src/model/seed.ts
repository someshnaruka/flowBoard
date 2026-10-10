import type {
  AppState,
  ContainerNode,
  Status,
  User,
} from './types'
import { POSITION_GAP } from './position'

const NOW = '2026-10-10T12:00:00.000Z'

function node(
  partial: Omit<ContainerNode, 'createdAt' | 'updatedAt' | 'archivedAt'> & {
    archivedAt?: string | null
  },
): ContainerNode {
  return {
    archivedAt: partial.archivedAt ?? null,
    createdAt: NOW,
    updatedAt: NOW,
    ...partial,
  }
}

function buildUsers(): Record<string, User> {
  return {
    'user-alice': {
      id: 'user-alice',
      name: 'Alice Admin',
      email: 'alice@flowboard.dev',
      role: 'admin',
      color: '#7c3aed',
    },
    'user-bob': {
      id: 'user-bob',
      name: 'Bob Member',
      email: 'bob@flowboard.dev',
      role: 'member',
      color: '#2563eb',
    },
    'user-carol': {
      id: 'user-carol',
      name: 'Carol Member',
      email: 'carol@flowboard.dev',
      role: 'member',
      color: '#16a34a',
    },
  }
}

function buildNodes(): Record<string, ContainerNode> {
  return {
    'workspace-acme': node({
      id: 'workspace-acme',
      kind: 'workspace',
      name: 'Acme Corp',
      parentId: null,
      position: POSITION_GAP,
      isPrivate: false,
    }),
    'space-engineering': node({
      id: 'space-engineering',
      kind: 'space',
      name: 'Engineering',
      parentId: 'workspace-acme',
      position: POSITION_GAP,
      isPrivate: false,
    }),
    'space-leadership': node({
      id: 'space-leadership',
      kind: 'space',
      name: 'Leadership',
      parentId: 'workspace-acme',
      position: POSITION_GAP * 2,
      isPrivate: true,
    }),
    'folder-platform': node({
      id: 'folder-platform',
      kind: 'folder',
      name: 'Platform',
      parentId: 'space-engineering',
      position: POSITION_GAP,
      isPrivate: false,
    }),
    'folder-exec': node({
      id: 'folder-exec',
      kind: 'folder',
      name: 'Exec',
      parentId: 'space-leadership',
      position: POSITION_GAP,
      isPrivate: false,
    }),
    'list-backlog': node({
      id: 'list-backlog',
      kind: 'list',
      name: 'Backlog',
      parentId: 'folder-platform',
      position: POSITION_GAP,
      isPrivate: false,
    }),
    'list-sprint': node({
      id: 'list-sprint',
      kind: 'list',
      name: 'Sprint',
      parentId: 'folder-platform',
      position: POSITION_GAP * 2,
      isPrivate: false,
    }),
    'list-okrs': node({
      id: 'list-okrs',
      kind: 'list',
      name: 'OKRs',
      parentId: 'folder-exec',
      position: POSITION_GAP,
      isPrivate: false,
    }),
  }
}

function statusesForList(
  listId: string,
  prefix: string,
): Record<string, Status> {
  return {
    [`status-${prefix}-todo`]: {
      id: `status-${prefix}-todo`,
      listId,
      name: 'To do',
      category: 'todo',
      position: POSITION_GAP,
    },
    [`status-${prefix}-active`]: {
      id: `status-${prefix}-active`,
      listId,
      name: 'In progress',
      category: 'active',
      position: POSITION_GAP * 2,
    },
    [`status-${prefix}-done`]: {
      id: `status-${prefix}-done`,
      listId,
      name: 'Done',
      category: 'done',
      position: POSITION_GAP * 3,
    },
  }
}

function buildStatuses(): Record<string, Status> {
  return {
    ...statusesForList('list-backlog', 'backlog'),
    ...statusesForList('list-sprint', 'sprint'),
    ...statusesForList('list-okrs', 'okrs'),
  }
}

/**
 * Seed AppState: hierarchy, users and list statuses.
 * Tasks and grants are added in the following seed commit.
 */
export function createSeed(): AppState {
  return {
    nodes: buildNodes(),
    statuses: buildStatuses(),
    users: buildUsers(),
    grants: {},
    tasks: {},
    currentUserId: 'user-alice',
  }
}
