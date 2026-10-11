import { useEffect, useMemo, type KeyboardEvent } from 'react'
import { ListTree } from 'lucide-react'
import { selectSubtaskProgress } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { Task, User } from '@/model/types'
import { HighlightText } from '@/view/search/HighlightText'
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
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const isOpen = useFlowStore((state) => state.drawerTaskId === taskId)
  const isShaking = shakeTaskId === taskId

  const taskStamp = useFlowStore((state) => {
    const task = state.tasks[taskId]
    if (!task) {
      return ''
    }
    return `${task.title}:${task.priority}:${task.dueDate ?? ''}:${task.assigneeIds.join(',')}:${task.updatedAt}`
  })
  const subtasksStamp = useFlowStore((state) =>
    Object.values(state.tasks)
      .filter((task) => task.parentTaskId === taskId)
      .map(
        (task) =>
          `${task.id}:${task.statusId}:${task.archivedAt ?? ''}:${task.updatedAt}`,
      )
      .sort()
      .join('\0'),
  )
  const usersStamp = useFlowStore((state) =>
    Object.values(state.users)
      .map((user) => `${user.id}:${user.name}:${user.avatarUrl}`)
      .join('\0'),
  )

  const { task, assignees, users, subtaskProgress } = useMemo(() => {
    void taskStamp
    void subtasksStamp
    void usersStamp
    const state = getDefaultFlowStore().getState()
    const found = state.tasks[taskId] ?? null
    if (!found) {
      return {
        task: null,
        assignees: [],
        users: [],
        subtaskProgress: { done: 0, total: 0 },
      }
    }
    return {
      task: found,
      assignees: assigneesForTask(found, state.users),
      users: Object.values(state.users),
      subtaskProgress: selectSubtaskProgress(state, taskId),
    }
  }, [taskId, taskStamp, subtasksStamp, usersStamp])

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
        'group relative flex w-full flex-col gap-2 rounded-card border border-border/80 bg-card p-3 text-left shadow-card',
        'transition-colors duration-150 hover:border-border hover:bg-accent/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35',
        'active:bg-accent/60',
        isOpen && 'border-brand/60 bg-brand-50/50 ring-2 ring-brand/20 dark:bg-brand/10',
        isShaking && 'animate-shake',
        className,
      )}
    >
      <div className="absolute right-1.5 top-1.5 z-10">
        <TaskCardMenu
          taskId={taskId}
          taskTitle={task.title}
          onOpen={onOpen}
        />
      </div>

      <p className="line-clamp-2 min-w-0 pr-6 text-card-title text-foreground">
        <HighlightText text={task.title} query={searchQuery} />
      </p>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <PriorityPopover
            taskId={taskId}
            priority={task.priority}
            showChevron={false}
          />
          <DueDatePopover taskId={taskId} dueDate={task.dueDate} />
          {subtaskProgress.total > 0 ? (
            <span
              className="inline-flex items-center gap-1 text-meta text-muted-foreground"
              aria-label={`${subtaskProgress.done} of ${subtaskProgress.total} subtasks done`}
            >
              <ListTree className="size-3.5" aria-hidden />
              {subtaskProgress.done}/{subtaskProgress.total}
            </span>
          ) : null}
        </div>
        <AssigneePopover
          taskId={taskId}
          assignees={assignees}
          users={users}
        />
      </div>
    </div>
  )
}
