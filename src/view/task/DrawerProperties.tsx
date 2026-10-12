import {
  Calendar as CalendarIcon,
  Circle,
  List,
  SignalHigh,
  Users,
} from 'lucide-react'
import { DropdownCaret } from '@/view/ui/dropdown-caret'
import type { ContainerNode, Priority, Status, User } from '@/model/types'
import { AssigneeMenu } from '@/view/ui/assignee-menu'
import { AvatarStack } from '@/view/ui/avatar-stack'
import { Button } from '@/view/ui/button'
import { DueDate } from '@/view/ui/due-date'
import { DueDatePicker } from '@/view/ui/due-date-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import { PriorityMenu } from '@/view/ui/priority-menu'
import { StatusMenu } from '@/view/ui/status-menu'
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
    <span className="flex items-center gap-1.5 self-center text-meta text-muted-foreground">
      <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
      {children}
    </span>
  )
}

const triggerClass = cn(
  'h-8 w-fit max-w-full justify-start gap-1 rounded-control border border-transparent px-1.5 text-body font-normal shadow-none',
  'hover:border-border hover:bg-accent/40',
  'focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/30',
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
        <AssigneeMenu
          assignees={assignees}
          users={users}
          disabled={disabled}
          className={triggerClass}
          onChange={onAssigneesChange}
          trigger={
            <>
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
            </>
          }
        />

        <PropertyLabel icon={CalendarIcon}>Due date</PropertyLabel>
        <DueDatePicker
          dueDate={dueDate}
          disabled={disabled}
          showChevron={!disabled}
          className="!text-body [&_svg]:!size-3.5"
          onChange={onDueDateChange}
          trigger={
            <DueDate dueDate={dueDate} variant="detail" showIcon={false} />
          }
        />

        <PropertyLabel icon={SignalHigh}>Priority</PropertyLabel>
        <PriorityMenu
          value={priority}
          disabled={disabled}
          showChevron={!disabled}
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
              {!disabled ? (
                <DropdownCaret className="text-muted-foreground" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-48 rounded-card border-border p-1 shadow-panel"
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-meta font-medium uppercase tracking-wide text-muted-foreground">
              List
            </DropdownMenuLabel>
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
