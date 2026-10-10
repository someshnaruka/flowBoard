import { useEffect, useState } from 'react'
import { useFlowStore } from '@/controller/store'
import { ListView } from '@/view/list/ListView'
import { TaskDrawer } from '@/view/task/TaskDrawer'
import { EmptyState } from '@/view/ui/empty-state'
import { BoardSkeleton } from './BoardSkeleton'
import { KanbanBoard } from './KanbanBoard'
import { ViewBar } from './ViewBar'

export function BoardWorkspace() {
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const view = useFlowStore((state) => state.view)
  const [loadingListId, setLoadingListId] = useState<string | null>(
    selectedListId,
  )

  useEffect(() => {
    if (!selectedListId) {
      setLoadingListId(null)
      return
    }

    setLoadingListId(selectedListId)
    const timer = window.setTimeout(() => {
      setLoadingListId((current) =>
        current === selectedListId ? null : current,
      )
    }, 280)

    return () => window.clearTimeout(timer)
  }, [selectedListId])

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
    <div className="flex h-full min-h-0">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {loadingListId === selectedListId ? (
          <BoardSkeleton />
        ) : (
          <>
            <ViewBar listId={selectedListId} />
            <div className="min-h-0 flex-1 overflow-hidden">
              {view === 'list' ? (
                <ListView listId={selectedListId} />
              ) : (
                <KanbanBoard listId={selectedListId} />
              )}
            </div>
          </>
        )}
      </div>
      <TaskDrawer />
    </div>
  )
}
