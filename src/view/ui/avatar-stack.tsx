import { UserAvatar } from '@/view/ui/user-avatar'
import { cn } from '@/view/ui/utils'

export type AvatarUser = {
  id: string
  name: string
  avatarUrl?: string | null
  colorClass?: string
}

type AvatarStackProps = {
  users: AvatarUser[]
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function AvatarStack({
  users,
  max = 3,
  size = 'sm',
  className,
}: AvatarStackProps) {
  if (users.length === 0) {
    return (
      <span className="text-meta text-muted-foreground" aria-label="Unassigned">
        —
      </span>
    )
  }

  const visible = users.slice(0, max)
  const overflow = users.length - visible.length

  return (
    <div
      className={cn('flex items-center -space-x-1.5', className)}
      aria-label={users.map((user) => user.name).join(', ')}
    >
      {visible.map((user) => (
        <UserAvatar
          key={user.id}
          name={user.name}
          avatarUrl={user.avatarUrl}
          fallbackClassName={user.colorClass}
          size={size}
          className="border-2 border-background"
        />
      ))}
      {overflow > 0 ? (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-meta font-medium text-muted-foreground',
            size === 'sm' ? 'size-6' : 'size-7',
          )}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}
