import type { ReactNode, SyntheticEvent } from 'react'
import type { User } from '@/model/types'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import {
  FIELD_TRIGGER_INTERACTIVE,
  FIELD_TRIGGER_SHELL,
} from '@/view/ui/field-trigger'
import { UserAvatar } from '@/view/ui/user-avatar'
import { cn } from '@/view/ui/utils'

type Assignee = { id: string; name: string; avatarUrl?: string | null }

const fieldTriggerClass = cn(FIELD_TRIGGER_SHELL, FIELD_TRIGGER_INTERACTIVE)

type AssigneeMenuProps = {
  assignees: Assignee[]
  users: User[]
  onChange: (assigneeIds: string[]) => void
  disabled?: boolean
  className?: string
  stopPropagation?: boolean
  /** Override trigger content (drawer uses + Add). */
  trigger?: ReactNode
  emptyLabel?: string
  contentClassName?: string
}

/** Shared shadcn assignees menu — users first, Remove all last. */
export function AssigneeMenu({
  assignees,
  users,
  onChange,
  disabled,
  className,
  stopPropagation = false,
  trigger,
  emptyLabel = 'Unassigned',
  contentClassName,
}: AssigneeMenuProps) {
  const stop = stopPropagation
    ? (event: SyntheticEvent) => event.stopPropagation()
    : undefined
  const assigneeIds = assignees.map((item) => item.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label="Change assignees"
          className={cn(fieldTriggerClass, className)}
          onClick={stop}
          onPointerDown={stop}
        >
          {trigger ??
            (assignees.length > 0 ? (
              <AvatarStack users={assignees} max={3} size="sm" />
            ) : (
              <span className="px-1.5 text-meta leading-none text-muted-foreground">
                {emptyLabel}
              </span>
            ))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          'w-52 rounded-card border-border p-1 shadow-panel',
          contentClassName,
        )}
        onClick={stop}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-meta font-medium uppercase tracking-wide text-muted-foreground">
          Assignees
        </DropdownMenuLabel>
        {users.map((user) => {
          const checked = assigneeIds.includes(user.id)
          return (
            <DropdownMenuCheckboxItem
              key={user.id}
              checked={checked}
              className="rounded-control gap-2 text-body"
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(next) => {
                const nextIds = next
                  ? [...assigneeIds, user.id]
                  : assigneeIds.filter((id) => id !== user.id)
                onChange(nextIds)
              }}
            >
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="sm"
                className="size-5 text-tiny"
              />
              <span className="min-w-0 truncate">{user.name}</span>
            </DropdownMenuCheckboxItem>
          )
        })}
        {assigneeIds.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-control text-body text-muted-foreground focus:text-foreground"
              onSelect={() => onChange([])}
            >
              Remove all
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
