import { useStore } from 'zustand'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { immer } from 'zustand/middleware/immer'
import { fail, isErr, ok, type Result } from '@/model/errors'
import { createSeed } from '@/model/seed'
import {
  archiveNode as archiveNodeService,
  createNode as createNodeService,
  renameNode as renameNodeService,
  reorderNode as reorderNodeService,
  restoreNode as restoreNodeService,
  type CreateNodeInput,
  type RenameNodeInput,
  type ReorderNodeInput,
} from '@/model/services/hierarchy.service'
import {
  assertCan,
  canView,
  setNodePrivate as setNodePrivateService,
  upsertGrant as upsertGrantService,
  type UpsertGrantInput,
} from '@/model/services/permission.service'
import { addStatus as addStatusService } from '@/model/services/status.service'
import {
  archiveTask as archiveTaskService,
  changeStatus as changeStatusService,
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  moveTaskToList as moveTaskToListService,
  reorderTask as reorderTaskService,
  restoreTask as restoreTaskService,
  updateTask as updateTaskService,
  type CreateTaskInput,
  type MoveTaskToListInput,
  type UpdateTaskInput,
} from '@/model/services/task.service'
import { selectStatusesForList } from './selectors'
import type { AppState, ContainerNode, Grant, Task } from '@/model/types'
import {
  defaultNetworkConfig,
  simulateNetwork,
  type NetworkConfig,
} from './simulateNetwork'

export type BoardView = 'board' | 'list'

export type PendingTaskConfirm = {
  kind: 'archive' | 'delete'
  taskId: string
}

export type UiState = {
  selectedListId: string | null
  view: BoardView
  drawerTaskId: string | null
  expandedNodeIds: string[]
  sidebarCollapsed: boolean
  network: NetworkConfig
  /** Brief shake cue after optimistic rollback. */
  shakeTaskId: string | null
  cheatsheetOpen: boolean
  /** Increment to focus the view-bar search input. */
  searchFocusNonce: number
  /** Debounced task search query for the selected list. */
  searchQuery: string
  /** Keyboard-driven destructive confirm (⌘E / ⌘⌫). */
  pendingTaskConfirm: PendingTaskConfirm | null
}

export type FlowState = AppState & UiState

function applyDomain(draft: FlowState, next: AppState): void {
  draft.nodes = next.nodes
  draft.statuses = next.statuses
  draft.users = next.users
  draft.grants = next.grants
  draft.tasks = next.tasks
  draft.currentUserId = next.currentUserId
}

function domainSnapshot(state: FlowState): AppState {
  return {
    nodes: state.nodes,
    statuses: state.statuses,
    users: state.users,
    grants: state.grants,
    tasks: state.tasks,
    currentUserId: state.currentUserId,
  }
}

function firstVisibleListId(state: AppState, userId: string): string | null {
  const lists = Object.values(state.nodes)
    .filter((node) => node.kind === 'list' && !node.archivedAt)
    .sort((a, b) => a.position - b.position)

  for (const list of lists) {
    if (canView(state, userId, list.id)) {
      return list.id
    }
  }
  return null
}

export type PlaceTaskInput = {
  taskId: string
  statusId: string
  afterId?: string | null
  beforeId?: string | null
}

export type FlowStore = FlowState & {
  setSelectedListId: (listId: string | null) => void
  setView: (view: BoardView) => void
  openDrawer: (taskId: string | null) => void
  toggleExpanded: (nodeId: string) => void
  toggleSidebar: () => void
  switchUser: (userId: string) => void
  setNetworkConfig: (patch: Partial<NetworkConfig>) => void
  setFailNext: (value?: boolean) => void
  clearShakeTask: () => void
  setCheatsheetOpen: (open: boolean) => void
  requestSearchFocus: () => void
  setSearchQuery: (query: string) => void
  requestTaskConfirm: (kind: 'archive' | 'delete', taskId: string) => void
  clearPendingTaskConfirm: () => void
  createTask: (input: CreateTaskInput) => Promise<Result<Task>>
  createDefaultTask: () => Promise<Result<Task>>
  placeTask: (input: PlaceTaskInput) => Promise<Result<Task>>
  moveTaskToList: (input: MoveTaskToListInput) => Promise<Result<Task>>
  updateTask: (
    input: UpdateTaskInput & { statusId?: string },
  ) => Promise<Result<Task>>
  duplicateTask: (taskId: string) => Promise<Result<Task>>
  archiveTask: (taskId: string) => Promise<Result<{ archivedIds: string[] }>>
  restoreTask: (taskId: string) => Promise<Result<{ restoredIds: string[] }>>
  deleteTask: (taskId: string) => Promise<Result<{ deletedIds: string[] }>>
  createContainer: (
    input: CreateNodeInput,
  ) => Promise<Result<ContainerNode>>
  renameContainer: (
    input: RenameNodeInput,
  ) => Promise<Result<ContainerNode>>
  archiveContainer: (
    nodeId: string,
  ) => Promise<Result<{ archivedIds: string[] }>>
  restoreContainer: (
    nodeId: string,
  ) => Promise<Result<{ restoredIds: string[] }>>
  reorderContainer: (
    input: ReorderNodeInput,
  ) => Promise<Result<ContainerNode>>
  upsertGrant: (
    input: UpsertGrantInput,
  ) => Promise<Result<{ grant: Grant | null }>>
  setNodePrivate: (
    nodeId: string,
    isPrivate: boolean,
  ) => Promise<Result<ContainerNode>>
}

function initialUi(seed: AppState): UiState {
  const defaultList =
    seed.nodes['list-backlog']?.id ??
    Object.values(seed.nodes).find((node) => node.kind === 'list')?.id ??
    null

  return {
    selectedListId: defaultList,
    view: 'board',
    drawerTaskId: null,
    expandedNodeIds: Object.values(seed.nodes)
      .filter((node) => node.kind !== 'list')
      .map((node) => node.id),
    sidebarCollapsed: false,
    network: defaultNetworkConfig(),
    shakeTaskId: null,
    cheatsheetOpen: false,
    searchFocusNonce: 0,
    searchQuery: '',
    pendingTaskConfirm: null,
  }
}

export function createFlowStore(
  seed: AppState = createSeed(),
): StoreApi<FlowStore> {
  return createStore<FlowStore>()(
    immer((set, get) => ({
      ...seed,
      ...initialUi(seed),

      setSelectedListId: (listId) => {
        set((state) => {
          state.selectedListId = listId
          state.searchQuery = ''
        })
      },

      setView: (view) => {
        set((state) => {
          state.view = view
        })
      },

      openDrawer: (taskId) => {
        set((state) => {
          state.drawerTaskId = taskId
        })
      },

      toggleExpanded: (nodeId) => {
        set((state) => {
          const index = state.expandedNodeIds.indexOf(nodeId)
          if (index >= 0) {
            state.expandedNodeIds.splice(index, 1)
          } else {
            state.expandedNodeIds.push(nodeId)
          }
        })
      },

      toggleSidebar: () => {
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed
        })
      },

      setNetworkConfig: (patch) => {
        set((state) => {
          state.network = { ...state.network, ...patch }
        })
      },

      setFailNext: (value = true) => {
        set((state) => {
          state.network.failNext = value
        })
      },

      clearShakeTask: () => {
        set((state) => {
          state.shakeTaskId = null
        })
      },

      setCheatsheetOpen: (open) => {
        set((state) => {
          state.cheatsheetOpen = open
        })
      },

      requestSearchFocus: () => {
        set((state) => {
          state.searchFocusNonce += 1
        })
      },

      setSearchQuery: (query) => {
        set((state) => {
          state.searchQuery = query
        })
      },

      requestTaskConfirm: (kind, taskId) => {
        set((state) => {
          state.pendingTaskConfirm = { kind, taskId }
        })
      },

      clearPendingTaskConfirm: () => {
        set((state) => {
          state.pendingTaskConfirm = null
        })
      },

      switchUser: (userId) => {
        const current = get()
        if (!current.users[userId]) {
          return
        }

        set((draft) => {
          draft.currentUserId = userId

          if (
            draft.selectedListId &&
            !canView(draft, userId, draft.selectedListId)
          ) {
            draft.selectedListId = firstVisibleListId(draft, userId)
          }

          if (draft.drawerTaskId) {
            const task = draft.tasks[draft.drawerTaskId]
            if (!task || !canView(draft, userId, task.listId)) {
              draft.drawerTaskId = null
            }
          }
        })
      },

      createTask: async (input) => {
        const snapshot = get()
        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          input.listId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const serviceResult = createTaskService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          input,
        )
        if (isErr(serviceResult)) {
          return serviceResult
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, serviceResult.data.state)
        })

        return ok(serviceResult.data.task)
      },

      createDefaultTask: async () => {
        const snapshot = get()
        const listId = snapshot.selectedListId
        if (!listId) {
          return fail('VALIDATION', 'Select a list first')
        }

        const statuses = selectStatusesForList(snapshot, listId)
        const status =
          statuses.find((item) => item.category === 'todo') ?? statuses[0]
        if (!status) {
          return fail('INVALID_STATUS', 'This list has no statuses')
        }

        return get().createTask({
          listId,
          title: 'New task',
          statusId: status.id,
        })
      },

      moveTaskToList: async (input) => {
        const snapshot = get()
        const existing = snapshot.tasks[input.taskId]
        if (!existing) {
          return fail('NOT_FOUND', `Task ${input.taskId} not found`)
        }

        const sourcePermission = assertCan(
          snapshot,
          snapshot.currentUserId,
          existing.listId,
          'edit',
        )
        if (isErr(sourcePermission)) {
          return sourcePermission
        }

        const targetPermission = assertCan(
          snapshot,
          snapshot.currentUserId,
          input.targetListId,
          'edit',
        )
        if (isErr(targetPermission)) {
          return targetPermission
        }

        const serviceResult = moveTaskToListService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          input,
        )
        if (isErr(serviceResult)) {
          return serviceResult
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, serviceResult.data.state)
          state.selectedListId = input.targetListId
        })

        return ok(serviceResult.data.task)
      },

      placeTask: async (input) => {
        const snapshot = get()
        const existing = snapshot.tasks[input.taskId]
        if (!existing) {
          return fail('NOT_FOUND', `Task ${input.taskId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          existing.listId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const rollback = domainSnapshot(snapshot)
        let domain = rollback

        if (existing.statusId !== input.statusId) {
          const statusResult = changeStatusService(
            domain,
            snapshot.currentUserId,
            { taskId: input.taskId, statusId: input.statusId },
          )
          if (isErr(statusResult)) {
            return statusResult
          }
          domain = statusResult.data.state
        }

        const reorderResult = reorderTaskService(
          domain,
          snapshot.currentUserId,
          {
            taskId: input.taskId,
            afterId: input.afterId,
            beforeId: input.beforeId,
          },
        )
        if (isErr(reorderResult)) {
          return reorderResult
        }

        // Optimistic: apply before simulated network.
        set((state) => {
          applyDomain(state, reorderResult.data.state)
        })

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          set((state) => {
            applyDomain(state, rollback)
            state.shakeTaskId = input.taskId
          })
          return network
        }

        return ok(reorderResult.data.task)
      },

      updateTask: async (input) => {
        const snapshot = get()
        const existing = snapshot.tasks[input.taskId]
        if (!existing) {
          return fail('NOT_FOUND', `Task ${input.taskId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          existing.listId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const rollback = domainSnapshot(snapshot)
        let domain = rollback

        if (input.statusId && input.statusId !== existing.statusId) {
          const statusResult = changeStatusService(
            domain,
            snapshot.currentUserId,
            { taskId: input.taskId, statusId: input.statusId },
          )
          if (isErr(statusResult)) {
            return statusResult
          }
          domain = statusResult.data.state
        }

        const fields = { ...input }
        delete fields.statusId
        const hasFieldUpdates =
          fields.title !== undefined ||
          fields.description !== undefined ||
          fields.priority !== undefined ||
          fields.assigneeIds !== undefined ||
          fields.dueDate !== undefined

        let task = domain.tasks[input.taskId]!
        if (hasFieldUpdates) {
          const updateResult = updateTaskService(
            domain,
            snapshot.currentUserId,
            fields,
          )
          if (isErr(updateResult)) {
            return updateResult
          }
          domain = updateResult.data.state
          task = updateResult.data.task
        }

        const optimistic =
          Boolean(input.statusId && input.statusId !== existing.statusId) ||
          hasFieldUpdates

        if (optimistic) {
          set((state) => {
            applyDomain(state, domain)
          })
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          if (optimistic) {
            set((state) => {
              applyDomain(state, rollback)
              state.shakeTaskId = input.taskId
            })
          }
          return network
        }

        if (!optimistic) {
          set((state) => {
            applyDomain(state, domain)
          })
        }

        return ok(task)
      },

      duplicateTask: async (taskId) => {
        const snapshot = get()
        const existing = snapshot.tasks[taskId]
        if (!existing) {
          return fail('NOT_FOUND', `Task ${taskId} not found`)
        }
        if (existing.parentTaskId) {
          return fail('VALIDATION', 'Cannot duplicate a subtask')
        }

        return get().createTask({
          listId: existing.listId,
          title: `${existing.title} (copy)`,
          statusId: existing.statusId,
          description: existing.description,
          priority: existing.priority,
          assigneeIds: [...existing.assigneeIds],
          dueDate: existing.dueDate,
        })
      },

      archiveTask: async (taskId) => {
        const snapshot = get()
        const existing = snapshot.tasks[taskId]
        if (!existing) {
          return fail('NOT_FOUND', `Task ${taskId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          existing.listId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const serviceResult = archiveTaskService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          { taskId },
        )
        if (isErr(serviceResult)) {
          return serviceResult
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, serviceResult.data.state)
          if (
            state.drawerTaskId &&
            serviceResult.data.archivedIds.includes(state.drawerTaskId)
          ) {
            state.drawerTaskId = null
          }
        })

        return ok({ archivedIds: serviceResult.data.archivedIds })
      },

      restoreTask: async (taskId) => {
        const snapshot = get()
        const existing = snapshot.tasks[taskId]
        if (!existing) {
          return fail('NOT_FOUND', `Task ${taskId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          existing.listId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const serviceResult = restoreTaskService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          { taskId },
        )
        if (isErr(serviceResult)) {
          return serviceResult
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, serviceResult.data.state)
        })

        return ok({ restoredIds: serviceResult.data.restoredIds })
      },

      deleteTask: async (taskId) => {
        const snapshot = get()
        const existing = snapshot.tasks[taskId]
        if (!existing) {
          return fail('NOT_FOUND', `Task ${taskId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          existing.listId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const serviceResult = deleteTaskService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          { taskId },
        )
        if (isErr(serviceResult)) {
          return serviceResult
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, serviceResult.data.state)
          if (
            state.drawerTaskId &&
            serviceResult.data.deletedIds.includes(state.drawerTaskId)
          ) {
            state.drawerTaskId = null
          }
        })

        return ok({ deletedIds: serviceResult.data.deletedIds })
      },

      createContainer: async (input) => {
        const snapshot = get()
        const permissionTarget = input.parentId ?? Object.values(snapshot.nodes).find(
          (node) => node.kind === 'workspace',
        )?.id
        if (!permissionTarget) {
          return fail('NOT_FOUND', 'Workspace not found')
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          permissionTarget,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const created = createNodeService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          input,
        )
        if (isErr(created)) {
          return created
        }

        let domain = created.data.state
        if (created.data.node.kind === 'list') {
          const defaults: Array<{ name: string; category: 'todo' | 'active' | 'done' }> =
            [
              { name: 'TODO', category: 'todo' },
              { name: 'In Progress', category: 'active' },
              { name: 'Done', category: 'done' },
            ]
          for (const status of defaults) {
            const added = addStatusService(domain, snapshot.currentUserId, {
              listId: created.data.node.id,
              name: status.name,
              category: status.category,
            })
            if (isErr(added)) {
              return added
            }
            domain = added.data.state
          }
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, domain)
          if (input.parentId && !state.expandedNodeIds.includes(input.parentId)) {
            state.expandedNodeIds.push(input.parentId)
          }
        })

        return ok(created.data.node)
      },

      renameContainer: async (input) => {
        const snapshot = get()
        const existing = snapshot.nodes[input.nodeId]
        if (!existing) {
          return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          input.nodeId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const renamed = renameNodeService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          input,
        )
        if (isErr(renamed)) {
          return renamed
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, renamed.data.state)
        })

        return ok(renamed.data.node)
      },

      archiveContainer: async (nodeId) => {
        const snapshot = get()
        const existing = snapshot.nodes[nodeId]
        if (!existing) {
          return fail('NOT_FOUND', `Node ${nodeId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          nodeId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const archived = archiveNodeService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          { nodeId },
        )
        if (isErr(archived)) {
          return archived
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, archived.data.state)
          if (
            state.selectedListId &&
            archived.data.archivedIds.includes(state.selectedListId)
          ) {
            state.selectedListId = firstVisibleListId(state, state.currentUserId)
          }
          if (state.drawerTaskId) {
            const task = state.tasks[state.drawerTaskId]
            if (
              !task ||
              archived.data.archivedIds.includes(task.listId)
            ) {
              state.drawerTaskId = null
            }
          }
        })

        return ok({ archivedIds: archived.data.archivedIds })
      },

      restoreContainer: async (nodeId) => {
        const snapshot = get()
        const existing = snapshot.nodes[nodeId]
        if (!existing) {
          return fail('NOT_FOUND', `Node ${nodeId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          nodeId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const restored = restoreNodeService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          { nodeId },
        )
        if (isErr(restored)) {
          return restored
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, restored.data.state)
        })

        return ok({ restoredIds: restored.data.restoredIds })
      },

      reorderContainer: async (input) => {
        const snapshot = get()
        const existing = snapshot.nodes[input.nodeId]
        if (!existing) {
          return fail('NOT_FOUND', `Node ${input.nodeId} not found`)
        }

        const permission = assertCan(
          snapshot,
          snapshot.currentUserId,
          input.nodeId,
          'edit',
        )
        if (isErr(permission)) {
          return permission
        }

        const reordered = reorderNodeService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          input,
        )
        if (isErr(reordered)) {
          return reordered
        }

        const network = await simulateNetwork(get().network)
        set((state) => {
          state.network.failNext = false
        })
        if (isErr(network)) {
          return network
        }

        set((state) => {
          applyDomain(state, reordered.data.state)
        })

        return ok(reordered.data.node)
      },

      upsertGrant: async (input) => {
        const snapshot = get()
        const result = upsertGrantService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          input,
        )
        if (isErr(result)) {
          return result
        }

        set((state) => {
          applyDomain(state, result.data.state)
          const userId = state.currentUserId
          if (
            state.selectedListId &&
            !canView(state, userId, state.selectedListId)
          ) {
            state.selectedListId = firstVisibleListId(state, userId)
            state.searchQuery = ''
          }
          if (
            state.drawerTaskId &&
            state.tasks[state.drawerTaskId] &&
            !canView(state, userId, state.tasks[state.drawerTaskId]!.listId)
          ) {
            state.drawerTaskId = null
          }
        })

        return ok({ grant: result.data.grant })
      },

      setNodePrivate: async (nodeId, isPrivate) => {
        const snapshot = get()
        const result = setNodePrivateService(
          domainSnapshot(snapshot),
          snapshot.currentUserId,
          nodeId,
          isPrivate,
        )
        if (isErr(result)) {
          return result
        }

        set((state) => {
          applyDomain(state, result.data.state)
          const userId = state.currentUserId
          if (
            state.selectedListId &&
            !canView(state, userId, state.selectedListId)
          ) {
            state.selectedListId = firstVisibleListId(state, userId)
            state.searchQuery = ''
          }
        })

        return ok(result.data.node)
      },
    })),
  )
}

const defaultStore = createFlowStore()

export function useFlowStore<T>(selector: (state: FlowStore) => T): T {
  return useStore(defaultStore, selector)
}

export function getDefaultFlowStore(): StoreApi<FlowStore> {
  return defaultStore
}
