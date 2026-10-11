export type NodeKind = 'workspace' | 'space' | 'folder' | 'list'

export type StatusCategory = 'todo' | 'active' | 'done'

export type Priority = 'urgent' | 'high' | 'normal' | 'low' | 'none'

export type UserRole = 'admin' | 'member'

/**
 * `allow` = view + edit, `view` = read-only, `deny` = hidden.
 * Nearest grant on the node or ancestors wins.
 */
export type GrantEffect = 'allow' | 'view' | 'deny'

export type ContainerNode = {
  id: string
  kind: NodeKind
  name: string
  /** Null only for the workspace root. */
  parentId: string | null
  position: number
  /** Soft-delete timestamp; null when active. */
  archivedAt: string | null
  /** Spaces (and optionally deeper nodes) can be private. */
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export type Status = {
  id: string
  listId: string
  name: string
  category: StatusCategory
  /** Hex accent used for column dots and badges (e.g. `#2563EB`). */
  color: string
  position: number
}

/** Default hex colors aligned with Tailwind `status.*` tokens. */
export const DEFAULT_STATUS_COLOR: Record<StatusCategory, string> = {
  todo: '#64748B',
  active: '#2563EB',
  done: '#16A34A',
}

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  /** Stable accent for fallback avatars. */
  color: string
  /** Profile image URL (CDN). */
  avatarUrl: string
}

export type Grant = {
  id: string
  userId: string
  nodeId: string
  effect: GrantEffect
}

/** Append-only drawer activity line (Figma 02 / 09). */
export type TaskActivityItem = {
  id: string
  actorId: string
  /** Verb phrase after the actor name, e.g. "changed priority to Urgent". */
  summary: string
  createdAt: string
}

export type Task = {
  id: string
  listId: string
  title: string
  description: string
  statusId: string
  priority: Priority
  assigneeIds: string[]
  /** ISO date string (YYYY-MM-DD) or null. */
  dueDate: string | null
  position: number
  /** Optional parent for depth-1 subtasks. */
  parentTaskId: string | null
  archivedAt: string | null
  /** User who created the task. */
  createdById: string
  /** Newest-first activity for the drawer feed. */
  activity: TaskActivityItem[]
  createdAt: string
  updatedAt: string
}

/** Normalised app state keyed by id. */
export type AppState = {
  nodes: Record<string, ContainerNode>
  statuses: Record<string, Status>
  users: Record<string, User>
  grants: Record<string, Grant>
  tasks: Record<string, Task>
  currentUserId: string
}
