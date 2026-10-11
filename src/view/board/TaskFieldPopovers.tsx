import type { MouseEvent, SyntheticEvent } from 'react'
import { selectCanEditTask } from '@/controller/selectors'
import { useFlowStore } from '@/controller/store'
import type { Priority, User } from '@/model/types'
import { notifyMutationError } from '@/view/feedback/toasts'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { DueDate } from '@/view/ui/due-date'
import { PriorityBadge } from '@/view/ui/priority-badge'
import { Button } from '@/view/ui/button'
import { Input } from '@/view/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/view/ui/popover'
import { cn } from '@/view/ui/utils'

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low', 'none']

type Assignee = { id: string; name: string; avatarUrl?: string | null }

function stop(event: SyntheticEvent) {
  event.stopPropagation()
}

type PriorityPopoverProps = {
  taskId: string
  priority: Priority
  className?: string
}

export function PriorityPopover({
  taskId,
  priority,
  className,
}: PriorityPopoverProps) {
  const canEdit = useFlowStore((state) => selectCanEditTask(state, taskId))
  const updateTask = useFlowStore((state) => state.updateTask)

  if (!canEdit) {
    return <PriorityBadge priority={priority} className={className} />
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-badge transition-colors duration-150',
            'hover:ring-2 hover:ring-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            className,
          )}
          aria-label="Change priority"
          onClick={stop}
          onPointerDown={stop}
        >
          <PriorityBadge priority={priority} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-40 rounded-card p-1"
        onClick={stop}
      >
        {PRIORITIES.map((item) => (
          <Button
            key={item}
            type="button"
            variant="ghost"
            className="h-8 w-full justify-start rounded-control px-2"
            onClick={(event: MouseEvent) => {
              stop(event)
              void (async () => {
                const result = await updateTask({ taskId, priority: item })
                if ('error' in result) {
                  notifyMutationError(result.error)
                }
              })()
            }}
          >
            <PriorityBadge priority={item} />
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

type DueDatePopoverProps = {
  taskId: string
  dueDate: string | null
  className?: string
}

export function DueDatePopover({
  taskId,
  dueDate,
  className,
}: DueDatePopoverProps) {
  const canEdit = useFlowStore((state) => selectCanEditTask(state, taskId))
  const updateTask = useFlowStore((state) => state.updateTask)

  if (!canEdit) {
    return <DueDate dueDate={dueDate} className={className} />
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-control transition-colors duration-150',
            'hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            className,
          )}
          aria-label="Change due date"
          onClick={stop}
          onPointerDown={stop}
        >
          <DueDate dueDate={dueDate} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 rounded-card p-3"
        onClick={stop}
      >
        <label className="flex flex-col gap-1.5 text-meta text-muted-foreground">
          Due date
          <Input
            type="date"
            value={dueDate ?? ''}
            className="h-8 rounded-control text-body"
            onChange={(event) => {
              void (async () => {
                const result = await updateTask({
                  taskId,
                  dueDate: event.target.value ? event.target.value : null,
                })
                if ('error' in result) {
                  notifyMutationError(result.error)
                }
              })()
            }}
          />
        </label>
        {dueDate ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 w-full rounded-control text-meta"
            onClick={() => {
              void (async () => {
                const result = await updateTask({ taskId, dueDate: null })
                if ('error' in result) {
                  notifyMutationError(result.error)
                }
              })()
            }}
          >
            Clear date
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

type AssigneePopoverProps = {
  taskId: string
  assignees: Assignee[]
  users: User[]
  className?: string
}

export function AssigneePopover({
  taskId,
  assignees,
  users,
  className,
}: AssigneePopoverProps) {
  const canEdit = useFlowStore((state) => selectCanEditTask(state, taskId))
  const updateTask = useFlowStore((state) => state.updateTask)

  if (!canEdit) {
    return assignees.length > 0 ? (
      <AvatarStack users={assignees} max={3} size="sm" className={className} />
    ) : (
      <span className={cn('text-meta text-muted-foreground', className)}>
        Unassigned
      </span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-control transition-colors duration-150',
            'hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            className,
          )}
          aria-label="Change assignees"
          onClick={stop}
          onPointerDown={stop}
        >
          {assignees.length > 0 ? (
            <AvatarStack users={assignees} max={3} size="sm" />
          ) : (
            <span className="text-meta text-muted-foreground">Unassigned</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-48 rounded-card p-1"
        onClick={stop}
      >
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-full justify-start rounded-control px-2 text-body"
          onClick={() => {
            void (async () => {
              const result = await updateTask({ taskId, assigneeIds: [] })
              if ('error' in result) {
                notifyMutationError(result.error)
              }
            })()
          }}
        >
          Unassigned
        </Button>
        {users.map((user) => (
          <Button
            key={user.id}
            type="button"
            variant="ghost"
            className="h-8 w-full justify-start gap-2 rounded-control px-2 text-body"
            onClick={() => {
              void (async () => {
                const result = await updateTask({
                  taskId,
                  assigneeIds: [user.id],
                })
                if ('error' in result) {
                  notifyMutationError(result.error)
                }
              })()
            }}
          >
            <AvatarStack
              users={[
                {
                  id: user.id,
                  name: user.name,
                  avatarUrl: user.avatarUrl,
                },
              ]}
              max={1}
              size="sm"
            />
            <span className="min-w-0 truncate">{user.name}</span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
