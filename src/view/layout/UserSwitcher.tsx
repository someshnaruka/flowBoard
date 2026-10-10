import { useMemo } from 'react'
import { Check, ChevronsUpDown, Moon, Sun, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { selectCurrentUser } from '@/controller/selectors'
import { useFlowStore } from '@/controller/store'
import type { User } from '@/model/types'
import { useTheme } from '@/view/theme/ThemeProvider'
import type { ThemePreference } from '@/view/theme/theme'
import { Badge } from '@/view/ui/badge'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
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

const AVATAR_BG: Record<string, string> = {
  'user-alice': 'bg-brand',
  'user-bob': 'bg-status-active',
  'user-carol': 'bg-status-done',
}

function AvatarChip({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white',
        size === 'sm' ? 'size-6 text-meta' : 'size-7 text-body',
        AVATAR_BG[user.id] ?? 'bg-muted-foreground',
      )}
      aria-hidden
    >
      {initials(user.name)}
    </span>
  )
}

type UserSwitcherProps = {
  compact?: boolean
}

export function UserSwitcher({ compact = false }: UserSwitcherProps) {
  const currentUser = useFlowStore(selectCurrentUser)
  const usersById = useFlowStore((state) => state.users)
  const users = useMemo(() => Object.values(usersById), [usersById])
  const switchUser = useFlowStore((state) => state.switchUser)
  const { preference, setPreference } = useTheme()

  if (!currentUser) {
    return null
  }

  const onSelectUser = (user: User) => {
    if (user.id === currentUser.id) {
      return
    }
    switchUser(user.id)
    toast.message(`Viewing as ${user.name}`, {
      description: user.role === 'admin' ? 'Admin access' : 'Member access',
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? 'icon' : 'sm'}
          className={cn(
            'rounded-control transition-colors duration-150',
            compact ? 'size-8' : 'h-8 gap-2 px-2',
          )}
          aria-label={`Current user ${currentUser.name}`}
        >
          <AvatarChip user={currentUser} size="sm" />
          {!compact ? (
            <>
              <span className="min-w-0 max-w-[7rem] truncate text-body">
                {currentUser.name}
              </span>
              <Badge
                variant={currentUser.role === 'admin' ? 'default' : 'secondary'}
                className="rounded-badge px-1.5 py-0 text-meta font-medium"
              >
                {currentUser.role}
              </Badge>
              <ChevronsUpDown className="size-3.5 opacity-60" />
            </>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-card">
        <DropdownMenuLabel className="text-meta font-normal text-muted-foreground">
          Switch user
        </DropdownMenuLabel>
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            className="gap-2 rounded-control"
            onSelect={() => onSelectUser(user)}
          >
            <AvatarChip user={user} size="sm" />
            <span className="min-w-0 flex-1 truncate">{user.name}</span>
            <Badge
              variant={user.role === 'admin' ? 'default' : 'secondary'}
              className="rounded-badge px-1.5 py-0 text-meta font-medium"
            >
              {user.role}
            </Badge>
            {user.id === currentUser.id ? (
              <Check className="size-3.5 text-brand" />
            ) : (
              <span className="size-3.5" aria-hidden />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-meta font-normal text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => setPreference(value as ThemePreference)}
        >
          <DropdownMenuRadioItem value="light" className="gap-2 rounded-control">
            <Sun className="size-3.5" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="gap-2 rounded-control">
            <Moon className="size-3.5" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="gap-2 rounded-control">
            <Monitor className="size-3.5" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
