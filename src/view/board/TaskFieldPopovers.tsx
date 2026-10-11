import type { SyntheticEvent } from 'react'
import { selectCanEditTask } from '@/controller/selectors'
import { useFlowStore } from '@/controller/store'
import type { Priority, User } from '@/model/types'
import { notifyMutationError } from '@/view/feedback/toasts'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { Button } from '@/view/ui/button'
import { DueDate } from '@/view/ui/due-date'
import { DueDatePicker } from '@/view/ui/due-date-picker'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import { PriorityBadge } from '@/view/ui/priority-badge'
import { PriorityMenu } from '@/view/ui/priority-menu'
import { UserAvatar } from '@/view/ui/user-avatar'
import { cn } from '@/view/ui/utils'

type Assignee = { id: string; name: string; avatarUrl?: string | null }

function stop(event: SyntheticEvent) {
  event.stopPropagation()
}

type PriorityPopoverProps = {
  taskId: string
  priority: Priority
  className?: string
  showChevron?: boolean
}

export function PriorityPopover({
  taskId,
  priority,
  className,
  showChevron = true,
}: PriorityPopoverProps) {
  const canEdit = useFlowStore((state) => selectCanEditTask(state, taskId))
  const updateTask = useFlowStore((state) => state.updateTask)

  if (!canEdit) {
    return <PriorityBadge priority={priority} className={className} />
  }

  return (
    <PriorityMenu
      value={priority}
      className={className}
      stopPropagation
      showChevron={showChevron}
      onChange={(next) => {
        void (async () => {
          const result = await updateTask({ taskId, priority: next })
          if ('error' in result) {
            notifyMutationError(result.error)
          }
        })()
      }}
    />
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
    <DueDatePicker
      dueDate={dueDate}
      className={className}
      onTriggerClick={stop}
      contentClassName="z-[60]"
      onChange={(next) => {
        void (async () => {
          const result = await updateTask({ taskId, dueDate: next })
          if ('error' in result) {
            notifyMutationError(result.error)
          }
        })()
      }}
      trigger={<DueDate dueDate={dueDate} />}
    />
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

  const assigneeIds = assignees.map((item) => item.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="Change assignees"
          className={cn(
            'h-auto rounded-control p-0.5 shadow-none hover:bg-accent/60',
            className,
          )}
          onClick={stop}
          onPointerDown={stop}
        >
          {assignees.length > 0 ? (
            <AvatarStack users={assignees} max={3} size="sm" />
          ) : (
            <span className="text-meta text-muted-foreground">Unassigned</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-52 rounded-card border-border p-1 shadow-panel"
        onClick={stop}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem
          className="rounded-control text-body"
          onSelect={() => {
            void (async () => {
              const result = await updateTask({ taskId, assigneeIds: [] })
              if ('error' in result) {
                notifyMutationError(result.error)
              }
            })()
          }}
        >
          Clear assignees
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {users.map((user) => {
          const checked = assigneeIds.includes(user.id)
          return (
            <DropdownMenuCheckboxItem
              key={user.id}
              checked={checked}
              className="rounded-control gap-2 text-body"
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(next) => {
                void (async () => {
                  const nextIds = next
                    ? [...assigneeIds, user.id]
                    : assigneeIds.filter((id) => id !== user.id)
                  const result = await updateTask({
                    taskId,
                    assigneeIds: nextIds,
                  })
                  if ('error' in result) {
                    notifyMutationError(result.error)
                  }
                })()
              }}
            >
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="sm"
                className="size-5 text-[10px]"
              />
              <span className="min-w-0 truncate">{user.name}</span>
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
