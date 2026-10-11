import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  selectStatusesForList,
  selectTasksForListQuery,
} from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import { EmptyState } from '@/view/ui/empty-state'
import { Button } from '@/view/ui/button'
import { Column } from './Column'
import { SortableTaskCard } from './SortableTaskCard'
import { TaskDragOverlay } from './TaskDragOverlay'
import { useBoardDnd } from './useBoardDnd'

type KanbanBoardProps = {
  listId: string
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
}

export function KanbanBoard({ listId }: KanbanBoardProps) {
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const setSearchQuery = useFlowStore((state) => state.setSearchQuery)
  const tasksStamp = useFlowStore((state) =>
    Object.values(state.tasks)
      .filter((task) => task.listId === listId)
      .map(
        (task) =>
          `${task.id}:${task.statusId}:${task.position}:${task.title}:${task.description}:${task.updatedAt}:${task.assigneeIds.join(',')}:${task.dueDate ?? ''}:${task.priority}`,
      )
      .join('\0'),
  )
  const statusesStamp = useFlowStore((state) =>
    Object.values(state.statuses)
      .filter((status) => status.listId === listId)
      .map((status) => `${status.id}:${status.position}:${status.name}`)
      .join('\0'),
  )

  const { statuses, tasksByStatus, matchCount } = useMemo(() => {
    void currentUserId
    void tasksStamp
    void statusesStamp
    const state = getDefaultFlowStore().getState()
    const listStatuses = selectStatusesForList(state, listId)
    const listTasks = selectTasksForListQuery(state, listId, searchQuery)
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

    return {
      statuses: listStatuses,
      tasksByStatus: grouped,
      matchCount: listTasks.length,
    }
  }, [currentUserId, listId, searchQuery, statusesStamp, tasksStamp])

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set())
  const dnd = useBoardDnd(statuses, tasksByStatus)

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

  const searching = searchQuery.trim().length > 0
  if (searching && matchCount === 0) {
    return (
      <EmptyState
        title="No matching tasks"
        description={`Nothing matches “${searchQuery.trim()}” in this list.`}
        className="h-full"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-control"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </Button>
        }
      />
    )
  }

  return (
    <DndContext
      sensors={dnd.sensors}
      collisionDetection={closestCorners}
      onDragStart={dnd.onDragStart}
      onDragOver={dnd.onDragOver}
      onDragEnd={(event) => {
        void dnd.onDragEnd(event)
      }}
      onDragCancel={dnd.onDragCancel}
    >
      <div
        className="flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-hidden p-4"
        aria-label="Kanban board"
      >
        {statuses.map((status) => {
          const columnTaskIds = dnd.columns[status.id] ?? []
          const collapsed = collapsedIds.has(status.id)

          return (
            <Column
              key={status.id}
              statusId={status.id}
              name={status.name}
              category={status.category}
              count={columnTaskIds.length}
              collapsed={collapsed}
              highlighted={
                dnd.highlightedContainer === status.id && Boolean(dnd.activeId)
              }
              onToggleCollapse={() => toggleCollapse(status.id)}
            >
              <SortableContext
                id={status.id}
                items={columnTaskIds}
                strategy={verticalListSortingStrategy}
              >
                {columnTaskIds.length === 0 ? (
                  <EmptyState
                    title={searching ? 'No matches' : 'No tasks'}
                    description={
                      searching
                        ? 'Try another column or clear search.'
                        : 'Drop or create a task here.'
                    }
                    className="pointer-events-none rounded-card border border-dashed border-border py-8"
                  />
                ) : (
                  columnTaskIds.map((taskId) => (
                    <SortableTaskCard
                      key={taskId}
                      taskId={taskId}
                      onOpen={() => openDrawer(taskId)}
                      showInsertionLine={
                        Boolean(dnd.activeId) &&
                        dnd.overId === taskId &&
                        dnd.activeId !== taskId
                      }
                    />
                  ))
                )}
              </SortableContext>
            </Column>
          )
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {dnd.activeId ? <TaskDragOverlay taskId={dnd.activeId} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
