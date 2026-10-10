import { useMemo } from 'react'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Status, Task, User } from '@/model/types'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { DueDate } from '@/view/ui/due-date'
import { PriorityBadge } from '@/view/ui/priority-badge'
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

  const { task, status, assignees } = useMemo(() => {
    void taskStamp
    void usersStamp
    void statusesStamp
    const state = getDefaultFlowStore().getState()
    const found = state.tasks[taskId] ?? null
    if (!found) {
      return { task: null, status: null as Status | null, assignees: [] }
    }
    return {
      task: found,
      status: state.statuses[found.statusId] ?? null,
      assignees: assigneesForTask(found, state.users),
    }
  }, [taskId, taskStamp, usersStamp, statusesStamp])

  if (!task) {
    return null
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'grid h-list-row w-full grid-cols-[7.5rem_minmax(0,1fr)_6.5rem_6rem_5.5rem] items-center gap-3 border-b border-border px-4 text-left',
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
      <p className="min-w-0 truncate text-body text-foreground">{task.title}</p>
      <div className="min-w-0">
        <AvatarStack users={assignees} max={3} size="sm" />
      </div>
      <div className="min-w-0">
        <PriorityBadge priority={task.priority} className="max-w-full truncate" />
      </div>
      <div className="min-w-0">
        <DueDate dueDate={task.dueDate} />
      </div>
    </button>
  )
}
