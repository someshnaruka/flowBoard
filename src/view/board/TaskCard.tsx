import { useEffect, useMemo, type KeyboardEvent } from 'react'
import { ListTree } from 'lucide-react'
import { selectSubtaskCount } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Task, User } from '@/model/types'
import { cn } from '@/view/ui/utils'
import { TaskCardMenu } from './TaskCardMenu'
import {
  AssigneePopover,
  DueDatePopover,
  PriorityPopover,
} from './TaskFieldPopovers'

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
  const shakeTaskId = useFlowStore((state) => state.shakeTaskId)
  const clearShakeTask = useFlowStore((state) => state.clearShakeTask)
  const isShaking = shakeTaskId === taskId

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

  const { task, assignees, users, subtaskCount } = useMemo(() => {
    void taskStamp
    void usersStamp
    const state = getDefaultFlowStore().getState()
    const found = state.tasks[taskId] ?? null
    if (!found) {
      return { task: null, assignees: [], users: [], subtaskCount: 0 }
    }
    return {
      task: found,
      assignees: assigneesForTask(found, state.users),
      users: Object.values(state.users),
      subtaskCount: selectSubtaskCount(state, taskId),
    }
  }, [taskId, taskStamp, usersStamp])

  useEffect(() => {
    if (!isShaking) {
      return
    }
    const timer = window.setTimeout(() => {
      clearShakeTask()
    }, 400)
    return () => {
      window.clearTimeout(timer)
    }
  }, [isShaking, clearShakeTask])

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
        'group relative flex w-full flex-col gap-2 rounded-card border border-border bg-card p-3 text-left shadow-card',
        'transition-colors duration-150 hover:border-brand/40 hover:bg-accent/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        'active:bg-accent/60',
        isShaking && 'animate-shake',
        className,
      )}
    >
      <div className="absolute right-2 top-2 z-10">
        <TaskCardMenu
          taskId={taskId}
          taskTitle={task.title}
          onOpen={onOpen}
        />
      </div>

      <p className="line-clamp-2 min-w-0 pr-7 text-card-title text-foreground">
        {task.title}
      </p>

      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <PriorityPopover taskId={taskId} priority={task.priority} />
        <DueDatePopover taskId={taskId} dueDate={task.dueDate} />
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <AssigneePopover
          taskId={taskId}
          assignees={assignees}
          users={users}
        />
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
    </div>
  )
}
