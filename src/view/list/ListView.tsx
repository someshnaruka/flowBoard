import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { selectTasksForList } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import { Button } from '@/view/ui/button'
import { EmptyState } from '@/view/ui/empty-state'
import { cn } from '@/view/ui/utils'
import { ListRow } from './ListRow'
import {
  LIST_PAGE_SIZE,
  sortTasks,
  type ListSortDir,
  type ListSortKey,
} from './list-sort'

type ListViewProps = {
  listId: string
}

type SortHeaderProps = {
  label: string
  sortKey: ListSortKey
  activeKey: ListSortKey | null
  dir: ListSortDir
  onSort: (key: ListSortKey) => void
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: SortHeaderProps) {
  const active = activeKey === sortKey
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 rounded-control text-meta font-medium text-muted-foreground',
        'transition-colors duration-150 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        active && 'text-foreground',
      )}
      aria-label={`Sort by ${label}${active ? `, ${dir}ending` : ''}`}
    >
      {label}
      <Icon className="size-3.5" aria-hidden />
    </button>
  )
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

  const [sortKey, setSortKey] = useState<ListSortKey | null>(null)
  const [sortDir, setSortDir] = useState<ListSortDir>('asc')
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(LIST_PAGE_SIZE)
  }, [listId, sortKey, sortDir])

  const sorted = useMemo(
    () => sortTasks(tasks, sortKey, sortDir),
    [tasks, sortKey, sortDir],
  )

  const visible = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  const onSort = (key: ListSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'priority' ? 'desc' : 'asc')
  }

  if (sorted.length === 0) {
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
        <SortHeader
          label="Priority"
          sortKey="priority"
          activeKey={sortKey}
          dir={sortDir}
          onSort={onSort}
        />
        <SortHeader
          label="Due"
          sortKey="dueDate"
          activeKey={sortKey}
          dir={sortDir}
          onSort={onSort}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.map((task) => (
          <ListRow
            key={task.id}
            taskId={task.id}
            onOpen={() => openDrawer(task.id)}
          />
        ))}
      </div>

      <footer className="flex h-11 shrink-0 items-center justify-between gap-3 border-t border-border px-4">
        <p className="text-meta text-muted-foreground">
          Showing {visible.length} of {sorted.length}
        </p>
        {hasMore ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-control"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + LIST_PAGE_SIZE, sorted.length),
              )
            }
          >
            Load more
          </Button>
        ) : null}
      </footer>
    </div>
  )
}
