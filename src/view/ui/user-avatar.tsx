import { Avatar, AvatarFallback, AvatarImage } from '@/view/ui/avatar'
import { cn } from '@/view/ui/utils'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const FALLBACK_BG = [
  'bg-brand',
  'bg-status-active',
  'bg-status-done',
  'bg-priority-high',
  'bg-muted-foreground',
] as const

export type UserAvatarProps = {
  name: string
  avatarUrl?: string | null
  /** Optional stable class when no image (e.g. bg-brand). */
  fallbackClassName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  alt?: string
}

const SIZE_CLASS = {
  sm: 'size-6 text-meta',
  md: 'size-7 text-body',
  lg: 'size-8 text-body',
} as const

export function UserAvatar({
  name,
  avatarUrl,
  fallbackClassName,
  size = 'sm',
  className,
  alt,
}: UserAvatarProps) {
  const fallbackTone =
    fallbackClassName ??
    FALLBACK_BG[Math.abs(hashName(name)) % FALLBACK_BG.length]

  return (
    <Avatar className={cn(SIZE_CLASS[size], 'border border-border', className)}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={alt ?? name} className="object-cover" />
      ) : null}
      <AvatarFallback
        className={cn('font-medium text-white', fallbackTone)}
        delayMs={avatarUrl ? 400 : 0}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

function hashName(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return hash
}
