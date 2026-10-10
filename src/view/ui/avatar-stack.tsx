import { cn } from '@/view/ui/utils'

export type AvatarUser = {
  id: string
  name: string
  colorClass?: string
}

const FALLBACK_COLORS = [
  'bg-brand',
  'bg-status-active',
  'bg-status-done',
  'bg-priority-high',
  'bg-muted-foreground',
] as const

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
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
      {visible.map((user, index) => (
        <span
          key={user.id}
          title={user.name}
          className={cn(
            'inline-flex items-center justify-center rounded-full border-2 border-background font-medium text-white',
            size === 'sm' ? 'size-6 text-meta' : 'size-7 text-body',
            user.colorClass ??
              FALLBACK_COLORS[index % FALLBACK_COLORS.length],
          )}
        >
          {initials(user.name)}
        </span>
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
