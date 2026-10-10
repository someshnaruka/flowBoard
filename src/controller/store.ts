import { useStore } from 'zustand'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { immer } from 'zustand/middleware/immer'
import { createSeed } from '@/model/seed'
import type { AppState } from '@/model/types'

export type BoardView = 'board' | 'list'

export type UiState = {
  selectedListId: string | null
  view: BoardView
  drawerTaskId: string | null
  expandedNodeIds: string[]
}

export type FlowState = AppState & UiState

export type FlowStore = FlowState & {
  setSelectedListId: (listId: string | null) => void
  setView: (view: BoardView) => void
  openDrawer: (taskId: string | null) => void
  toggleExpanded: (nodeId: string) => void
  switchUser: (userId: string) => void
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

      switchUser: (userId) => {
        const state = get()
        if (!state.users[userId]) {
          return
        }

        set((draft) => {
          draft.currentUserId = userId
        })

        // Selection reset when the new user cannot see the current list/drawer
        // is applied in a follow-up commit with permission helpers.
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
