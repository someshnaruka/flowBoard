import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import {
  List,
  useListRef,
  type RowComponentProps,
} from 'react-window'
import { selectTasksForListQuery } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Task } from '@/model/types'
import { EmptyState } from '@/view/ui/empty-state'
import { Button } from '@/view/ui/button'
import { cn } from '@/view/ui/utils'
import { ListRow } from './ListRow'
import {
  sortTasks,
  type ListSortDir,
  type ListSortKey,
} from './list-sort'

const ROW_HEIGHT = 36

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

type RowProps = {
  tasks: Task[]
  onOpen: (taskId: string) => void
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

function VirtualRow({
  index,
  style,
  tasks,
  onOpen,
}: RowComponentProps<RowProps>) {
  const task = tasks[index]
  if (!task) {
    return null
  }

  return (
    // VIRTUALIZE-STYLE-EXCEPTION — react-window absolute positioning
    <div style={style}>
      <ListRow taskId={task.id} onOpen={() => onOpen(task.id)} />
    </div>
  )
}

export function ListView({ listId }: ListViewProps) {
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const setSearchQuery = useFlowStore((state) => state.setSearchQuery)
  const taskCount = useFlowStore(
    (state) =>
      Object.values(state.tasks).filter((task) => task.listId === listId)
        .length,
  )
  const tasksStamp = useFlowStore((state) =>
    Object.values(state.tasks)
      .filter((task) => task.listId === listId)
      .map(
        (task) =>
          `${task.id}:${task.statusId}:${task.position}:${task.title}:${task.description}:${task.dueDate ?? ''}:${task.priority}:${task.updatedAt}`,
      )
      .sort()
      .join('\0'),
  )

  const tasks = useMemo(() => {
    void currentUserId
    void taskCount
    void tasksStamp
    return selectTasksForListQuery(
      getDefaultFlowStore().getState(),
      listId,
      searchQuery,
    )
  }, [currentUserId, listId, searchQuery, taskCount, tasksStamp])

  const [sortKey, setSortKey] = useState<ListSortKey | null>(null)
  const [sortDir, setSortDir] = useState<ListSortDir>('asc')

  const sorted = useMemo(
    () => sortTasks(tasks, sortKey, sortDir),
    [tasks, sortKey, sortDir],
  )

  const listRef = useListRef(null)
  const prevLengthRef = useRef(sorted.length)

  useEffect(() => {
    if (sorted.length > prevLengthRef.current) {
      listRef.current?.scrollToRow({
        index: sorted.length - 1,
        align: 'smart',
      })
    }
    prevLengthRef.current = sorted.length
  }, [listRef, sorted.length])

  const onSort = (key: ListSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'priority' ? 'desc' : 'asc')
  }

  const rowProps = useMemo<RowProps>(
    () => ({
      tasks: sorted,
      onOpen: openDrawer,
    }),
    [sorted, openDrawer],
  )

  const rowKey = useCallback(
    (index: number, data: RowProps) => data.tasks[index]?.id ?? index,
    [],
  )

  const searching = searchQuery.trim().length > 0
  if (sorted.length === 0) {
    return (
      <EmptyState
        title={searching ? 'No matching tasks' : 'No tasks'}
        description={
          searching
            ? `Nothing matches “${searchQuery.trim()}” in this list.`
            : 'Create a task to populate this list.'
        }
        className="h-full"
        action={
          searching ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-control"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="List view">
      <div className="sticky top-0 z-10 grid h-list-row shrink-0 grid-cols-[7.5rem_minmax(0,1fr)_6.5rem_6rem_5.5rem_2rem] items-center gap-3 border-b border-border bg-background px-4">
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
          label="Due date"
          sortKey="dueDate"
          activeKey={sortKey}
          dir={sortDir}
          onSort={onSort}
        />
        <span className="sr-only">Actions</span>
      </div>

      <div className="min-h-0 flex-1">
        <List
          listRef={listRef}
          className="h-full outline-none"
          style={{ height: '100%' }}
          rowCount={sorted.length}
          rowHeight={ROW_HEIGHT}
          rowComponent={VirtualRow}
          rowProps={rowProps}
          rowKey={rowKey}
        />
      </div>

      <footer className="flex h-10 shrink-0 items-center border-t border-border px-4">
        <p className="text-meta text-muted-foreground">
          {sorted.length} task{sorted.length === 1 ? '' : 's'}
        </p>
      </footer>
    </div>
  )
}
