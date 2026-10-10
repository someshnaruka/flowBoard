import { useMemo } from 'react'
import { selectTasksForList } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import { EmptyState } from '@/view/ui/empty-state'
import { ListRow } from './ListRow'

type ListViewProps = {
  listId: string
}

export function ListView({ listId }: ListViewProps) {
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const tasksStamp = useFlowStore((state) =>
    Object.values(state.tasks)
      .filter((task) => task.listId === listId)
      .map(
        (task) =>
          `${task.id}:${task.statusId}:${task.position}:${task.title}:${task.dueDate ?? ''}:${task.priority}:${task.updatedAt}`,
      )
      .join('\0'),
  )

  const tasks = useMemo(() => {
    void currentUserId
    void tasksStamp
    return selectTasksForList(getDefaultFlowStore().getState(), listId)
  }, [currentUserId, listId, tasksStamp])

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks"
        description="Create a task to populate this list."
        className="h-full"
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="List view">
      <div className="sticky top-0 z-10 grid h-list-row shrink-0 grid-cols-[7rem_minmax(0,1fr)_6.5rem_5.5rem_5.5rem] items-center gap-3 border-b border-border bg-background px-4">
        <span className="text-meta font-medium text-muted-foreground">
          Status
        </span>
        <span className="text-meta font-medium text-muted-foreground">
          Title
        </span>
        <span className="text-meta font-medium text-muted-foreground">
          Assignees
        </span>
        <span className="text-meta font-medium text-muted-foreground">
          Priority
        </span>
        <span className="text-meta font-medium text-muted-foreground">Due</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <ListRow
            key={task.id}
            taskId={task.id}
            onOpen={() => openDrawer(task.id)}
          />
        ))}
      </div>
    </div>
  )
}
