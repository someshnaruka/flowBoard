import { useMemo } from 'react'
import { ListTree } from 'lucide-react'
import { selectSubtaskCount } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Task, User } from '@/model/types'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { DueDate } from '@/view/ui/due-date'
import { PriorityBadge } from '@/view/ui/priority-badge'
import { cn } from '@/view/ui/utils'

type TaskCardProps = {
  taskId: string
  onOpen?: () => void
  className?: string
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

export function TaskCard({ taskId, onOpen, className }: TaskCardProps) {
  const taskStamp = useFlowStore((state) => {
    const task = state.tasks[taskId]
    if (!task) {
      return ''
    }
    return `${task.title}:${task.priority}:${task.dueDate ?? ''}:${task.assigneeIds.join(',')}:${task.updatedAt}`
  })
  const usersStamp = useFlowStore((state) =>
    Object.values(state.users)
      .map((user) => `${user.id}:${user.name}:${user.avatarUrl}`)
      .join('\0'),
  )

  const { task, assignees, subtaskCount } = useMemo(() => {
    void taskStamp
    void usersStamp
    const state = getDefaultFlowStore().getState()
    const found = state.tasks[taskId] ?? null
    if (!found) {
      return { task: null, assignees: [], subtaskCount: 0 }
    }
    return {
      task: found,
      assignees: assigneesForTask(found, state.users),
      subtaskCount: selectSubtaskCount(state, taskId),
    }
  }, [taskId, taskStamp, usersStamp])

  if (!task) {
    return null
  }

  return (
    <button
      type="button"
      data-task-id={taskId}
      onClick={onOpen}
      className={cn(
        'flex w-full flex-col gap-2 rounded-card border border-border bg-card p-3 text-left shadow-card',
        'transition-colors duration-150 hover:border-brand/40 hover:bg-accent/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        'active:bg-accent/60',
        className,
      )}
    >
      <p className="line-clamp-2 min-w-0 text-card-title text-foreground">
        {task.title}
      </p>

      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        <DueDate dueDate={task.dueDate} />
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <AvatarStack users={assignees} max={3} size="sm" />
        {subtaskCount > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-meta text-muted-foreground"
            aria-label={`${subtaskCount} subtasks`}
          >
            <ListTree className="size-3.5" aria-hidden />
            {subtaskCount}
          </span>
        ) : null}
      </div>
    </button>
  )
}
