import { useStore } from 'zustand'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { immer } from 'zustand/middleware/immer'
import { isErr, ok, type Result } from '@/model/errors'
import { createSeed } from '@/model/seed'
import { assertCan, canView } from '@/model/services/permission.service'
import {
  createTask as createTaskService,
  type CreateTaskInput,
} from '@/model/services/task.service'
import type { AppState, Task } from '@/model/types'
import {
  defaultNetworkConfig,
  simulateNetwork,
  type NetworkConfig,
} from './simulateNetwork'

export type BoardView = 'board' | 'list'

export type UiState = {
  selectedListId: string | null
  view: BoardView
  drawerTaskId: string | null
  expandedNodeIds: string[]
  sidebarCollapsed: boolean
  network: NetworkConfig
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

export type FlowStore = FlowState & {
  setSelectedListId: (listId: string | null) => void
  setView: (view: BoardView) => void
  openDrawer: (taskId: string | null) => void
  toggleExpanded: (nodeId: string) => void
  toggleSidebar: () => void
  switchUser: (userId: string) => void
  setNetworkConfig: (patch: Partial<NetworkConfig>) => void
  setFailNext: (value?: boolean) => void
  createTask: (input: CreateTaskInput) => Promise<Result<Task>>
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
