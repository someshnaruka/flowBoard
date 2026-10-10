import { useMemo, useState } from 'react'
import {
  selectStatusesForList,
  selectTasksForList,
} from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import { EmptyState } from '@/view/ui/empty-state'
import { Column } from './Column'
import { TaskCard } from './TaskCard'

type KanbanBoardProps = {
  listId: string
}

export function KanbanBoard({ listId }: KanbanBoardProps) {
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const tasksStamp = useFlowStore((state) =>
    Object.values(state.tasks)
      .filter((task) => task.listId === listId)
      .map(
        (task) =>
          `${task.id}:${task.statusId}:${task.position}:${task.title}:${task.updatedAt}:${task.assigneeIds.join(',')}:${task.dueDate ?? ''}:${task.priority}`,
      )
      .join('\0'),
  )
  const statusesStamp = useFlowStore((state) =>
    Object.values(state.statuses)
      .filter((status) => status.listId === listId)
      .map((status) => `${status.id}:${status.position}:${status.name}`)
      .join('\0'),
  )

  const { statuses, tasksByStatus } = useMemo(() => {
    void currentUserId
    void tasksStamp
    void statusesStamp
    const state = getDefaultFlowStore().getState()
    const listStatuses = selectStatusesForList(state, listId)
    const listTasks = selectTasksForList(state, listId)
    const grouped = new Map<string, typeof listTasks>()

    for (const status of listStatuses) {
      grouped.set(status.id, [])
    }
    for (const task of listTasks) {
      const bucket = grouped.get(task.statusId)
      if (bucket) {
        bucket.push(task)
      }
    }

    return { statuses: listStatuses, tasksByStatus: grouped }
  }, [currentUserId, listId, statusesStamp, tasksStamp])

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set())

  const toggleCollapse = (statusId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(statusId)) {
        next.delete(statusId)
      } else {
        next.add(statusId)
      }
      return next
    })
  }

  if (statuses.length === 0) {
    return (
      <EmptyState
        title="No statuses"
        description="This list has no columns yet."
        className="h-full"
      />
    )
  }

  return (
    <div
      className="flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-hidden p-4"
      aria-label="Kanban board"
    >
      {statuses.map((status) => {
        const columnTasks = tasksByStatus.get(status.id) ?? []
        const collapsed = collapsedIds.has(status.id)

        return (
          <Column
            key={status.id}
            name={status.name}
            category={status.category}
            count={columnTasks.length}
            collapsed={collapsed}
            onToggleCollapse={() => toggleCollapse(status.id)}
          >
            {columnTasks.length === 0 ? (
              <EmptyState
                title="No tasks"
                description="Create a task to fill this column."
                className="rounded-card border border-dashed border-border py-8"
              />
            ) : (
              columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  taskId={task.id}
                  onOpen={() => openDrawer(task.id)}
                />
              ))
            )}
          </Column>
        )
      })}
    </div>
  )
}
