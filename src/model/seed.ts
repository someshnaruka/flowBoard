import type {
  AppState,
  ContainerNode,
  Grant,
  Priority,
  Status,
  Task,
  User,
} from './types'
import { POSITION_GAP } from './position'

const NOW = '2026-10-10T12:00:00.000Z'

/**
 * Grants matrix (nearest grant wins; Alice is admin and bypasses all):
 *
 * | Node / List              | Alice | Bob              | Carol              |
 * |--------------------------|-------|------------------|--------------------|
 * | space-engineering        | ✅    | ✅ (public)      | ✅ (public)        |
 * | list-backlog             | ✅    | ✅               | 👁 VIEW (read-only)|
 * | list-sprint              | ✅    | ❌ DENY          | ✅                 |
 * | space-leadership (priv.) | ✅    | ❌ DENY          | ✅ ALLOW           |
 * | list-okrs                | ✅    | ❌ (via space)   | ✅ (via allow)     |
 */
function buildGrants(): Record<string, Grant> {
  return {
    'grant-bob-deny-leadership': {
      id: 'grant-bob-deny-leadership',
      userId: 'user-bob',
      nodeId: 'space-leadership',
      effect: 'deny',
    },
    'grant-bob-deny-sprint': {
      id: 'grant-bob-deny-sprint',
      userId: 'user-bob',
      nodeId: 'list-sprint',
      effect: 'deny',
    },
    'grant-carol-allow-leadership': {
      id: 'grant-carol-allow-leadership',
      userId: 'user-carol',
      nodeId: 'space-leadership',
      effect: 'allow',
    },
    'grant-carol-view-backlog': {
      id: 'grant-carol-view-backlog',
      userId: 'user-carol',
      nodeId: 'list-backlog',
      effect: 'view',
    },
  }
}

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

function task(partial: {
  id: string
  listId: string
  title: string
  statusId: string
  priority: Priority
  assigneeIds?: string[]
  dueDate?: string | null
  position: number
  description?: string
  parentTaskId?: string | null
  createdById?: string
}): Task {
  const createdById = partial.createdById ?? 'user-alice'
  const assigneeIds = partial.assigneeIds ?? []
  const activity = [
    {
      id: `${partial.id}-act-created`,
      actorId: createdById,
      summary: 'created this task',
      createdAt: NOW,
    },
    ...assigneeIds.map((assigneeId, index) => ({
      id: `${partial.id}-act-assign-${index}`,
      actorId: assigneeId,
      summary: 'was assigned',
      createdAt: NOW,
    })),
  ]

  return {
    id: partial.id,
    listId: partial.listId,
    title: partial.title,
    description: partial.description ?? '',
    statusId: partial.statusId,
    priority: partial.priority,
    assigneeIds,
    dueDate: partial.dueDate ?? null,
    position: partial.position,
    parentTaskId: partial.parentTaskId ?? null,
    archivedAt: null,
    createdById,
    activity,
    createdAt: NOW,
    updatedAt: NOW,
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
      avatarUrl:
        'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png',
    },
    'user-bob': {
      id: 'user-bob',
      name: 'Bob Member',
      email: 'bob@flowboard.dev',
      role: 'member',
      color: '#2563eb',
      avatarUrl:
        'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_3.png',
    },
    'user-carol': {
      id: 'user-carol',
      name: 'Carol Member',
      email: 'carol@flowboard.dev',
      role: 'member',
      color: '#16a34a',
      avatarUrl:
        'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_2.png',
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

function buildTasks(): Record<string, Task> {
  const tasks: Task[] = [
    // list-backlog (8)
    task({
      id: 'task-backlog-1',
      listId: 'list-backlog',
      title: 'Audit tree permission edges',
      statusId: 'status-backlog-todo',
      priority: 'high',
      assigneeIds: ['user-alice'],
      dueDate: '2026-10-05',
      position: POSITION_GAP,
    }),
    task({
      id: 'task-backlog-2',
      listId: 'list-backlog',
      title: 'Design empty states for board',
      statusId: 'status-backlog-todo',
      priority: 'normal',
      assigneeIds: ['user-carol'],
      dueDate: '2026-10-20',
      position: POSITION_GAP * 2,
    }),
    task({
      id: 'task-backlog-3',
      listId: 'list-backlog',
      title: 'Spike fractional ranking',
      statusId: 'status-backlog-active',
      priority: 'urgent',
      assigneeIds: ['user-bob'],
      dueDate: '2026-10-08',
      position: POSITION_GAP * 3,
    }),
    task({
      id: 'task-backlog-4',
      listId: 'list-backlog',
      title: 'Document seed grants matrix',
      statusId: 'status-backlog-done',
      priority: 'low',
      assigneeIds: ['user-alice'],
      dueDate: null,
      position: POSITION_GAP * 4,
    }),
    task({
      id: 'task-backlog-5',
      listId: 'list-backlog',
      title: 'Keyboard shortcut cheatsheet',
      statusId: 'status-backlog-todo',
      priority: 'none',
      assigneeIds: [],
      dueDate: '2026-11-01',
      position: POSITION_GAP * 5,
    }),
    task({
      id: 'task-backlog-6',
      listId: 'list-backlog',
      title: 'Avatar stack overflow cases',
      statusId: 'status-backlog-active',
      priority: 'normal',
      assigneeIds: ['user-carol', 'user-bob'],
      dueDate: '2026-10-12',
      position: POSITION_GAP * 6,
    }),
    task({
      id: 'task-backlog-7',
      listId: 'list-backlog',
      title: 'Persist UI density preference',
      statusId: 'status-backlog-todo',
      priority: 'low',
      assigneeIds: ['user-alice'],
      dueDate: '2026-09-30',
      position: POSITION_GAP * 7,
    }),
    task({
      id: 'task-backlog-8',
      listId: 'list-backlog',
      title: 'Archive cascade undo toast',
      statusId: 'status-backlog-todo',
      priority: 'high',
      assigneeIds: ['user-bob'],
      dueDate: '2026-10-18',
      position: POSITION_GAP * 8,
    }),

    // list-sprint (6)
    task({
      id: 'task-sprint-1',
      listId: 'list-sprint',
      title: 'Ship kanban column DnD',
      statusId: 'status-sprint-active',
      priority: 'urgent',
      assigneeIds: ['user-alice', 'user-carol'],
      dueDate: '2026-10-09',
      position: POSITION_GAP,
    }),
    task({
      id: 'task-sprint-2',
      listId: 'list-sprint',
      title: 'List view pagination',
      statusId: 'status-sprint-todo',
      priority: 'high',
      assigneeIds: ['user-carol'],
      dueDate: '2026-10-15',
      position: POSITION_GAP * 2,
    }),
    task({
      id: 'task-sprint-3',
      listId: 'list-sprint',
      title: 'Task drawer focus trap',
      statusId: 'status-sprint-active',
      priority: 'normal',
      assigneeIds: ['user-alice'],
      dueDate: '2026-10-11',
      position: POSITION_GAP * 3,
    }),
    task({
      id: 'task-sprint-4',
      listId: 'list-sprint',
      title: 'Status remap on list move',
      statusId: 'status-sprint-done',
      priority: 'normal',
      assigneeIds: ['user-bob'],
      dueDate: '2026-10-01',
      position: POSITION_GAP * 4,
    }),
    task({
      id: 'task-sprint-5',
      listId: 'list-sprint',
      title: 'Sidebar collapse animation',
      statusId: 'status-sprint-todo',
      priority: 'low',
      assigneeIds: [],
      dueDate: null,
      position: POSITION_GAP * 5,
    }),
    task({
      id: 'task-sprint-6',
      listId: 'list-sprint',
      title: 'Confirm dialog copy pass',
      statusId: 'status-sprint-todo',
      priority: 'none',
      assigneeIds: ['user-carol'],
      dueDate: '2026-10-07',
      position: POSITION_GAP * 6,
    }),

    // list-okrs (5)
    task({
      id: 'task-okrs-1',
      listId: 'list-okrs',
      title: 'Q4 narrative for board',
      statusId: 'status-okrs-active',
      priority: 'high',
      assigneeIds: ['user-alice'],
      dueDate: '2026-10-06',
      position: POSITION_GAP,
    }),
    task({
      id: 'task-okrs-2',
      listId: 'list-okrs',
      title: 'Hiring plan review',
      statusId: 'status-okrs-todo',
      priority: 'urgent',
      assigneeIds: ['user-carol'],
      dueDate: '2026-10-04',
      position: POSITION_GAP * 2,
    }),
    task({
      id: 'task-okrs-3',
      listId: 'list-okrs',
      title: 'Budget checkpoint',
      statusId: 'status-okrs-todo',
      priority: 'normal',
      assigneeIds: ['user-alice', 'user-carol'],
      dueDate: '2026-10-25',
      position: POSITION_GAP * 3,
    }),
    task({
      id: 'task-okrs-4',
      listId: 'list-okrs',
      title: 'Customer advisory notes',
      statusId: 'status-okrs-done',
      priority: 'low',
      assigneeIds: ['user-carol'],
      dueDate: null,
      position: POSITION_GAP * 4,
    }),
    task({
      id: 'task-okrs-5',
      listId: 'list-okrs',
      title: 'Risk register update',
      statusId: 'status-okrs-active',
      priority: 'high',
      assigneeIds: ['user-alice'],
      dueDate: '2026-10-03',
      position: POSITION_GAP * 5,
    }),
  ]

  return Object.fromEntries(tasks.map((item) => [item.id, item]))
}

/** Seed AppState used by the store factory and demos. */
export function createSeed(): AppState {
  return {
    nodes: buildNodes(),
    statuses: buildStatuses(),
    users: buildUsers(),
    grants: buildGrants(),
    tasks: buildTasks(),
    currentUserId: 'user-alice',
  }
}
