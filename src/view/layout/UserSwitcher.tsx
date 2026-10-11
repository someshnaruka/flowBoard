import { useMemo } from 'react'
import { Check, ChevronsUpDown, Moon, Sun, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
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
import { UserAvatar } from '@/view/ui/user-avatar'
import { cn } from '@/view/ui/utils'

type UserSwitcherProps = {
  compact?: boolean
}

export function UserSwitcher({ compact = false }: UserSwitcherProps) {
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const switchUser = useFlowStore((state) => state.switchUser)
  const { preference, setPreference } = useTheme()

  const { currentUser, users } = useMemo(() => {
    const state = getDefaultFlowStore().getState()
    return {
      currentUser: state.users[currentUserId] ?? null,
      users: Object.values(state.users),
    }
  }, [currentUserId])

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
          <UserAvatar
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            size="sm"
          />
          {!compact ? (
            <>
              <span className="min-w-0 max-w-[7rem] truncate text-body">
                {currentUser.name}
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-badge px-1.5 py-0 text-meta font-medium',
                  currentUser.role === 'admin' &&
                    'border-transparent bg-brand-50 text-brand dark:bg-brand/25 dark:text-brand-foreground',
                )}
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
            <UserAvatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              size="sm"
            />
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
