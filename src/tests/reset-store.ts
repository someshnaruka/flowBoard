import { defaultNetworkConfig } from '@/controller/simulateNetwork'
import { getDefaultFlowStore } from '@/controller/store'
import { createSeed } from '@/model/seed'

/** Reset the singleton store so component tests start from seed. */
export function resetDefaultFlowStore(): void {
  const seed = createSeed()
  getDefaultFlowStore().setState({
    ...seed,
    selectedListId: 'list-backlog',
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
  })
}
