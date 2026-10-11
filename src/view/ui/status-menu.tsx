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
  showChevron?: boolean
}

const fieldTriggerClass =
  'h-auto w-fit shrink-0 justify-start gap-0 overflow-visible rounded-badge border border-transparent p-0 !text-body font-medium shadow-none hover:border-border hover:bg-accent/40 focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/30'

/** Figma drawer — compact status badges with check on selected row. */
export function StatusMenu({
  value,
  statuses,
  onChange,
  disabled,
  className,
  showChevron = true,
}: StatusMenuProps) {
  const current = statuses.find((item) => item.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label="Change status"
          className={cn(fieldTriggerClass, className)}
        >
          {current ? (
            <StatusBadge
              status={current.category}
              color={current.color}
              label={current.name}
              showChevron={showChevron && !disabled}
            />
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
              <StatusBadge
                status={status.category}
                color={status.color}
                label={status.name}
              />
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
