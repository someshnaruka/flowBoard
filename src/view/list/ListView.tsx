import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import {
  List,
  useListRef,
  type RowComponentProps,
} from 'react-window'
import { Search } from 'lucide-react'
import { selectTasksForListQuery } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Task } from '@/model/types'
import { EmptyState } from '@/view/ui/empty-state'
import { Button } from '@/view/ui/button'
import { cn } from '@/view/ui/utils'
import { ListRow } from './ListRow'
import {
  LIST_PAGE_SIZE,
  hasMore,
  nextVisibleCount,
  pageSlice,
} from './list-pagination'
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
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSort(sortKey)}
      className={cn(
        'h-auto w-fit justify-start gap-1 rounded-control px-0 py-0.5 text-meta font-medium text-slate-500 shadow-none dark:text-slate-400',
        'hover:bg-transparent hover:text-foreground focus-visible:ring-brand/40',
        active && 'text-foreground',
      )}
      aria-label={`Sort by ${label}${active ? `, ${dir}ending` : ''}`}
    >
      {label}
      <Icon className="size-3.5" aria-hidden />
    </Button>
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
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE)

  const sorted = useMemo(
    () => sortTasks(tasks, sortKey, sortDir),
    [tasks, sortKey, sortDir],
  )

  // Reset offset window when the list query changes.
  useEffect(() => {
    setVisibleCount(LIST_PAGE_SIZE)
  }, [listId, searchQuery, sortKey, sortDir])

  const prevTotalRef = useRef(sorted.length)
  // If the user was already at the end, include newly created tasks.
  useEffect(() => {
    const previousTotal = prevTotalRef.current
    if (sorted.length > previousTotal && visibleCount >= previousTotal) {
      setVisibleCount(sorted.length)
    }
    prevTotalRef.current = sorted.length
  }, [sorted.length, visibleCount])

  const page = useMemo(
    () => pageSlice(sorted, visibleCount),
    [sorted, visibleCount],
  )
  const canLoadMore = hasMore(visibleCount, sorted.length)

  const listRef = useListRef(null)
  const prevLengthRef = useRef(page.length)

  useEffect(() => {
    if (page.length > prevLengthRef.current) {
      listRef.current?.scrollToRow({
        index: page.length - 1,
        align: 'smart',
      })
    }
    prevLengthRef.current = page.length
  }, [listRef, page.length])

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
      tasks: page,
      onOpen: openDrawer,
    }),
    [page, openDrawer],
  )

  const rowKey = useCallback(
    (index: number, data: RowProps) => data.tasks[index]?.id ?? index,
    [],
  )

  const searching = searchQuery.trim().length > 0
  if (page.length === 0 && sorted.length === 0) {
    return (
      <EmptyState
        icon={searching ? <Search className="size-5" aria-hidden /> : undefined}
        title={
          searching
            ? `No tasks match “${searchQuery.trim()}”`
            : 'No tasks here'
        }
        description={
          searching
            ? 'Try another title or description keyword. Search is scoped to the current list.'
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
    <div
      className="flex h-full min-h-0 flex-col bg-background"
      aria-label="List view"
    >
      <div className="sticky top-0 z-10 grid h-list-row shrink-0 grid-cols-[7.5rem_minmax(0,1fr)_6.5rem_7.5rem_6.5rem_2rem] items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
        <span className="text-meta font-medium text-slate-500 dark:text-slate-400">
          Status
        </span>
        <span className="text-meta font-medium text-slate-500 dark:text-slate-400">
          Title
        </span>
        <span className="text-meta font-medium text-slate-500 dark:text-slate-400">
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
          rowCount={page.length}
          rowHeight={ROW_HEIGHT}
          rowComponent={VirtualRow}
          rowProps={rowProps}
          rowKey={rowKey}
        />
      </div>

      <footer className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-border px-4">
        <p className="text-meta text-muted-foreground">
          Showing {page.length} of {sorted.length} task
          {sorted.length === 1 ? '' : 's'}
        </p>
        {canLoadMore ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-control text-meta"
            onClick={() =>
              setVisibleCount((current) =>
                nextVisibleCount(current, sorted.length),
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
