import type { ReactNode, SyntheticEvent } from 'react'
import { selectCanEditTask } from '@/controller/selectors'
import { useFlowStore } from '@/controller/store'
import type { Priority, User } from '@/model/types'
import { notifyMutationError } from '@/view/feedback/toasts'
import { AssigneeMenu } from '@/view/ui/assignee-menu'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { DueDate } from '@/view/ui/due-date'
import { DueDatePicker } from '@/view/ui/due-date-picker'
import { FIELD_TRIGGER_SHELL } from '@/view/ui/field-trigger'
import { PriorityBadge } from '@/view/ui/priority-badge'
import { PriorityMenu } from '@/view/ui/priority-menu'
import { cn } from '@/view/ui/utils'

type Assignee = { id: string; name: string; avatarUrl?: string | null }

function stop(event: SyntheticEvent) {
  event.stopPropagation()
}

/** Non-interactive shell matching editable field triggers (same border/box). */
function FieldShell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <span className={cn(FIELD_TRIGGER_SHELL, className)}>{children}</span>
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
    return (
      <FieldShell className={className}>
        <PriorityBadge priority={priority} />
      </FieldShell>
    )
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
  showChevron?: boolean
}

export function DueDatePopover({
  taskId,
  dueDate,
  className,
  showChevron = true,
}: DueDatePopoverProps) {
  const canEdit = useFlowStore((state) => selectCanEditTask(state, taskId))
  const updateTask = useFlowStore((state) => state.updateTask)

  if (!canEdit) {
    return (
      <FieldShell className={className}>
        <DueDate dueDate={dueDate} />
      </FieldShell>
    )
  }

  return (
    <DueDatePicker
      dueDate={dueDate}
      className={className}
      onTriggerClick={stop}
      contentClassName="z-[60]"
      showChevron={showChevron}
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
    return (
      <FieldShell className={className}>
        {assignees.length > 0 ? (
          <AvatarStack users={assignees} max={3} size="sm" />
        ) : (
          <span className="px-1.5 text-meta leading-none text-muted-foreground">
            Unassigned
          </span>
        )}
      </FieldShell>
    )
  }

  return (
    <AssigneeMenu
      assignees={assignees}
      users={users}
      className={className}
      stopPropagation
      contentClassName="z-[60]"
      onChange={(assigneeIds) => {
        void (async () => {
          const result = await updateTask({ taskId, assigneeIds })
          if ('error' in result) {
            notifyMutationError(result.error)
          }
        })()
      }}
    />
  )
}
