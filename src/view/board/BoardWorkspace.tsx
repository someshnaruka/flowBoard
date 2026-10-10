import { LayoutList } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import { EmptyState } from '@/view/ui/empty-state'
import { KanbanBoard } from './KanbanBoard'
import { ViewBar } from './ViewBar'

export function BoardWorkspace() {
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const view = useFlowStore((state) => state.view)

  if (!selectedListId) {
    return (
      <EmptyState
        title="Select a list"
        description="Choose a list in the sidebar to open its board."
        className="h-full"
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ViewBar listId={selectedListId} />
      {view === 'list' ? (
        <EmptyState
          title="List view"
          description="List view arrives in T12."
          icon={<LayoutList className="size-5" aria-hidden />}
          className="h-full"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden">
          <KanbanBoard listId={selectedListId} />
        </div>
      )}
    </div>
  )
}
