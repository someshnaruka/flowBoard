import { useMemo } from 'react'
import { Check, ChevronsUpDown, Moon, Sun, Monitor } from 'lucide-react'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { User } from '@/model/types'
import { toastInfo } from '@/view/feedback/toasts'
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

export function UserSwitcher() {
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
    toastInfo(`Viewing as ${user.name}`, {
      description: user.role === 'admin' ? 'Admin access' : 'Member access',
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-2 rounded-control border-border bg-background px-2 transition-colors duration-150"
          aria-label={`Current user ${currentUser.name}`}
        >
          <UserAvatar
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            size="sm"
          />
          <span className="min-w-0 max-w-[9rem] truncate text-body">
            {currentUser.name}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              'rounded-badge px-1.5 py-0 text-meta font-medium capitalize',
              currentUser.role === 'admin' &&
                'border-transparent bg-brand-50 text-brand dark:border-brand/40 dark:bg-brand/20 dark:text-brand',
            )}
          >
            {currentUser.role}
          </Badge>
          <ChevronsUpDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-card">
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
            <span className="min-w-0 flex-1 truncate text-body">{user.name}</span>
            <Badge
              variant="secondary"
              className={cn(
                'shrink-0 rounded-badge px-1.5 py-0 text-meta font-medium capitalize',
                user.role === 'admin' &&
                  user.id === currentUser.id &&
                  'border-transparent bg-brand text-white',
                user.role === 'admin' &&
                  user.id !== currentUser.id &&
                  'border-transparent bg-brand-50 text-brand dark:border-brand/40 dark:bg-brand/20 dark:text-brand',
              )}
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
