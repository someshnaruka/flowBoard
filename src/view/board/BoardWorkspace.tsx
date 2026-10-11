import { lazy, Suspense, useEffect, useState } from 'react'
import { useFlowStore, type BoardView } from '@/controller/store'
import { EmptyState } from '@/view/ui/empty-state'
import { BoardSkeleton } from './BoardSkeleton'
import { ViewBar } from './ViewBar'

const KanbanBoard = lazy(() =>
  import('./KanbanBoard').then((module) => ({ default: module.KanbanBoard })),
)
const ListView = lazy(() =>
  import('@/view/list/ListView').then((module) => ({
    default: module.ListView,
  })),
)
const TaskDrawer = lazy(() =>
  import('@/view/task/TaskDrawer').then((module) => ({
    default: module.TaskDrawer,
  })),
)

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
    <BoardWorkspaceBody
      key={selectedListId}
      listId={selectedListId}
      view={view}
    />
  )
}

function BoardWorkspaceBody({
  listId,
  view,
}: {
  listId: string
  view: BoardView
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true)
    }, 280)
    return () => window.clearTimeout(timer)
  }, [listId])

  return (
    <div className="flex h-full min-h-0 bg-muted/35 dark:bg-background">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!ready ? (
          <BoardSkeleton />
        ) : (
          <>
            <ViewBar listId={listId} />
            <div className="min-h-0 flex-1 overflow-hidden">
              <Suspense fallback={<BoardSkeleton />}>
                {view === 'list' ? (
                  <ListView listId={listId} />
                ) : (
                  <KanbanBoard listId={listId} />
                )}
              </Suspense>
            </div>
          </>
        )}
      </div>
      <Suspense fallback={null}>
        <TaskDrawer />
      </Suspense>
    </div>
  )
}
