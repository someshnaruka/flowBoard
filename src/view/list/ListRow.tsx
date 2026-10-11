import { useMemo, type KeyboardEvent } from 'react'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Status, Task, User } from '@/model/types'
import { TaskCardMenu } from '@/view/board/TaskCardMenu'
import {
  AssigneePopover,
  DueDatePopover,
  PriorityPopover,
} from '@/view/board/TaskFieldPopovers'
import { HighlightText } from '@/view/search/HighlightText'
import { StatusBadge } from '@/view/ui/status-badge'
import { cn } from '@/view/ui/utils'

type ListRowProps = {
  taskId: string
  onOpen?: () => void
}

function assigneesForTask(task: Task, users: Record<string, User>) {
  return task.assigneeIds
    .map((id) => users[id])
    .filter((user): user is User => Boolean(user))
    .map((user) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    }))
}

export function ListRow({ taskId, onOpen }: ListRowProps) {
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const taskStamp = useFlowStore((state) => {
    const task = state.tasks[taskId]
    if (!task) {
      return ''
    }
    return `${task.title}:${task.statusId}:${task.priority}:${task.dueDate ?? ''}:${task.assigneeIds.join(',')}:${task.updatedAt}`
  })
  const usersStamp = useFlowStore((state) =>
    Object.values(state.users)
      .map((user) => `${user.id}:${user.name}:${user.avatarUrl}`)
      .join('\0'),
  )
  const statusesStamp = useFlowStore((state) =>
    Object.values(state.statuses)
      .map((status) => `${status.id}:${status.name}:${status.category}`)
      .join('\0'),
  )

  const { task, status, assignees, users } = useMemo(() => {
    void taskStamp
    void usersStamp
    void statusesStamp
    const state = getDefaultFlowStore().getState()
    const found = state.tasks[taskId] ?? null
    if (!found) {
      return {
        task: null,
        status: null as Status | null,
        assignees: [],
        users: [] as User[],
      }
    }
    return {
      task: found,
      status: state.statuses[found.statusId] ?? null,
      assignees: assigneesForTask(found, state.users),
      users: Object.values(state.users),
    }
  }, [taskId, taskStamp, usersStamp, statusesStamp])

  if (!task) {
    return null
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen?.()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-task-id={taskId}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className={cn(
        'group grid h-list-row w-full grid-cols-[7.5rem_minmax(0,1fr)_6.5rem_6rem_5.5rem_2rem] items-center gap-3 border-b border-border px-4 text-left',
        'transition-colors duration-150 hover:bg-accent/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
        'active:bg-accent/70',
      )}
    >
      <div className="min-w-0">
        {status ? (
          <StatusBadge
            status={status.category}
            label={status.name}
            className="max-w-full truncate"
          />
        ) : (
          <span className="text-meta text-muted-foreground">—</span>
        )}
      </div>
      <p className="min-w-0 truncate text-body text-foreground">
        <HighlightText text={task.title} query={searchQuery} />
      </p>
      <div className="min-w-0">
        <AssigneePopover
          taskId={taskId}
          assignees={assignees}
          users={users}
        />
      </div>
      <div className="min-w-0">
        <PriorityPopover
          taskId={taskId}
          priority={task.priority}
          className="max-w-full"
        />
      </div>
      <div className="min-w-0">
        <DueDatePopover taskId={taskId} dueDate={task.dueDate} />
      </div>
      <div className="flex justify-end">
        <TaskCardMenu
          taskId={taskId}
          taskTitle={task.title}
          onOpen={onOpen}
        />
      </div>
    </div>
  )
}
