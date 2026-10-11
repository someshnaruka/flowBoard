import { Check } from 'lucide-react'
import type { Status } from '@/model/types'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import { StatusBadge } from '@/view/ui/status-badge'
import { cn } from '@/view/ui/utils'

type StatusMenuProps = {
  value: string
  statuses: Status[]
  onChange: (statusId: string) => void
  disabled?: boolean
  className?: string
}

/** Figma drawer — compact status badges with check on selected row. */
export function StatusMenu({
  value,
  statuses,
  onChange,
  disabled,
  className,
}: StatusMenuProps) {
  const current = statuses.find((item) => item.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className={cn(
            'h-8 w-fit max-w-full justify-start rounded-control px-0.5 font-normal shadow-none',
            'hover:bg-accent/60 focus-visible:ring-brand/40',
            className,
          )}
        >
          {current ? (
            <StatusBadge status={current.category} label={current.name} />
          ) : (
            <span className="text-meta text-muted-foreground">Set status</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-44 rounded-card border-border p-1 shadow-panel"
      >
        {statuses.map((status) => {
          const selected = status.id === value
          return (
            <DropdownMenuItem
              key={status.id}
              className={cn(
                'cursor-pointer gap-2 rounded-control px-2 py-1.5',
                selected && 'bg-accent',
              )}
              onSelect={() => onChange(status.id)}
            >
              <StatusBadge status={status.category} label={status.name} />
              {selected ? (
                <Check
                  className="ml-auto size-3.5 shrink-0 text-foreground"
                  aria-hidden
                />
              ) : (
                <span className="ml-auto size-3.5 shrink-0" aria-hidden />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
