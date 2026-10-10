import type { Priority, Status, User } from '@/model/types'
import { AvatarStack } from '@/view/ui/avatar-stack'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/view/ui/select'
import { Input } from '@/view/ui/input'

type DrawerPropertiesProps = {
  statusId: string
  statuses: Status[]
  priority: Priority
  dueDate: string | null
  assignees: Array<{ id: string; name: string; avatarUrl?: string | null }>
  users: User[]
  disabled?: boolean
  onStatusChange: (statusId: string) => void
  onPriorityChange: (priority: Priority) => void
  onDueDateChange: (dueDate: string | null) => void
  onAssigneesChange: (assigneeIds: string[]) => void
}

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low', 'none']

export function DrawerProperties({
  statusId,
  statuses,
  priority,
  dueDate,
  assignees,
  users,
  disabled,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onAssigneesChange,
}: DrawerPropertiesProps) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-3 px-4 py-3">
      <span className="self-center text-meta text-muted-foreground">Status</span>
      <Select
        value={statusId}
        disabled={disabled}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="h-8 rounded-control text-body">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.id} value={status.id}>
              {status.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="self-center text-meta text-muted-foreground">
        Priority
      </span>
      <Select
        value={priority}
        disabled={disabled}
        onValueChange={(value) => onPriorityChange(value as Priority)}
      >
        <SelectTrigger className="h-8 rounded-control text-body">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRIORITIES.map((item) => (
            <SelectItem key={item} value={item} className="capitalize">
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="self-center text-meta text-muted-foreground">Due</span>
      <Input
        type="date"
        value={dueDate ?? ''}
        disabled={disabled}
        className="h-8 rounded-control text-body"
        onChange={(event) =>
          onDueDateChange(event.target.value ? event.target.value : null)
        }
      />

      <span className="self-center text-meta text-muted-foreground">
        Assignees
      </span>
      <Select
        disabled={disabled}
        value={assignees[0]?.id ?? 'none'}
        onValueChange={(value) => {
          if (value === 'none') {
            onAssigneesChange([])
            return
          }
          onAssigneesChange([value])
        }}
      >
        <SelectTrigger className="h-8 rounded-control text-body">
          <SelectValue placeholder="Unassigned">
            {assignees.length > 0 ? (
              <AvatarStack users={assignees} max={3} size="sm" />
            ) : (
              'Unassigned'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Unassigned</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
