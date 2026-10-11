import {
  Calendar as CalendarIcon,
  ChevronDown,
  Circle,
  List,
  SignalHigh,
  Users,
} from 'lucide-react'
import type { ContainerNode, Priority, Status, User } from '@/model/types'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { Button } from '@/view/ui/button'
import { DueDate } from '@/view/ui/due-date'
import { DueDatePicker } from '@/view/ui/due-date-picker'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import { PriorityMenu } from '@/view/ui/priority-menu'
import { StatusMenu } from '@/view/ui/status-menu'
import { UserAvatar } from '@/view/ui/user-avatar'
import { cn } from '@/view/ui/utils'

type DrawerPropertiesProps = {
  statusId: string
  statuses: Status[]
  priority: Priority
  dueDate: string | null
  listId: string
  listName: string
  lists: ContainerNode[]
  assignees: Array<{ id: string; name: string; avatarUrl?: string | null }>
  users: User[]
  disabled?: boolean
  onStatusChange: (statusId: string) => void
  onPriorityChange: (priority: Priority) => void
  onDueDateChange: (dueDate: string | null) => void
  onAssigneesChange: (assigneeIds: string[]) => void
  onListChange: (listId: string) => void
}

function PropertyLabel({
  icon: Icon,
  children,
}: {
  icon: typeof Circle
  children: string
}) {
  return (
    <span className="flex items-center gap-1.5 self-center text-meta text-slate-600 dark:text-slate-300">
      <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
      {children}
    </span>
  )
}

const triggerClass = cn(
  'h-8 w-fit max-w-full justify-start gap-1 rounded-control px-1.5 text-body font-normal shadow-none',
  'hover:bg-accent/60 focus-visible:ring-brand/40',
)

export function DrawerProperties({
  statusId,
  statuses,
  priority,
  dueDate,
  listId,
  listName,
  lists,
  assignees,
  users,
  disabled,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onAssigneesChange,
  onListChange,
}: DrawerPropertiesProps) {
  const assigneeIds = assignees.map((user) => user.id)

  return (
    <section className="space-y-1 border-b border-border/70 px-6 py-3">
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5">
        <PropertyLabel icon={Circle}>Status</PropertyLabel>
        <StatusMenu
          value={statusId}
          statuses={statuses}
          disabled={disabled}
          onChange={onStatusChange}
        />

        <PropertyLabel icon={Users}>Assignees</PropertyLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className={triggerClass}
            >
              {assignees.length > 0 ? (
                <AvatarStack users={assignees} max={3} size="sm" />
              ) : null}
              {!disabled ? (
                <span className="text-meta text-muted-foreground">+ Add</span>
              ) : assignees.length === 0 ? (
                <span className="text-meta text-muted-foreground">
                  Unassigned
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-52 rounded-card border-border p-1 shadow-panel"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuLabel className="text-meta font-medium text-muted-foreground">
              Assignees
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="rounded-control text-body"
              onSelect={() => onAssigneesChange([])}
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
                  onCheckedChange={(next) => {
                    if (next) {
                      onAssigneesChange([...assigneeIds, user.id])
                      return
                    }
                    onAssigneesChange(
                      assigneeIds.filter((id) => id !== user.id),
                    )
                  }}
                  onSelect={(event) => event.preventDefault()}
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

        <PropertyLabel icon={CalendarIcon}>Due date</PropertyLabel>
        <DueDatePicker
          dueDate={dueDate}
          disabled={disabled}
          onChange={onDueDateChange}
          trigger={
            <DueDate dueDate={dueDate} variant="detail" showIcon={false} />
          }
        />

        <PropertyLabel icon={SignalHigh}>Priority</PropertyLabel>
        <PriorityMenu
          value={priority}
          disabled={disabled}
          className={triggerClass}
          onChange={onPriorityChange}
        />

        <PropertyLabel icon={List}>List</PropertyLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className={triggerClass}
            >
              <span className="text-body text-foreground">{listName}</span>
              <ChevronDown
                className="size-3.5 text-muted-foreground"
                aria-hidden
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 rounded-card border-border p-1 shadow-panel"
          >
            <DropdownMenuRadioGroup
              value={listId}
              onValueChange={onListChange}
            >
              {lists.map((list) => (
                <DropdownMenuRadioItem
                  key={list.id}
                  value={list.id}
                  className="rounded-control text-body"
                >
                  {list.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}
