import type { ReactNode, SyntheticEvent } from 'react'
import { Check } from 'lucide-react'
import type { Priority } from '@/model/types'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import {
  FIELD_TRIGGER_INTERACTIVE,
  FIELD_TRIGGER_SHELL,
} from '@/view/ui/field-trigger'
import { PriorityBadge } from '@/view/ui/priority-badge'
import { cn } from '@/view/ui/utils'

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low', 'none']

const fieldTriggerClass = cn(FIELD_TRIGGER_SHELL, FIELD_TRIGGER_INTERACTIVE)

type PriorityMenuProps = {
  value: Priority
  onChange: (priority: Priority) => void
  disabled?: boolean
  className?: string
  showChevron?: boolean
  stopPropagation?: boolean
  trigger?: ReactNode
}

/** Figma 05 / card menu — PRIORITY header, badge rows, check on selected. */
export function PriorityMenu({
  value,
  onChange,
  disabled,
  className,
  showChevron = true,
  stopPropagation = false,
  trigger,
}: PriorityMenuProps) {
  const stop = stopPropagation
    ? (event: SyntheticEvent) => event.stopPropagation()
    : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label="Change priority"
          className={cn(fieldTriggerClass, className)}
          onClick={stop}
          onPointerDown={stop}
        >
          {trigger ?? (
            <PriorityBadge
              priority={value}
              showChevron={showChevron && !disabled}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-[9.5rem] rounded-card border-border p-1 shadow-panel"
        onClick={stop}
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-meta font-medium uppercase tracking-wide text-muted-foreground">
          Priority
        </DropdownMenuLabel>
        {PRIORITIES.map((item) => {
          const selected = item === value
          return (
            <DropdownMenuItem
              key={item}
              className={cn(
                'cursor-pointer gap-2 rounded-control px-2 py-1.5',
                selected && 'bg-accent',
              )}
              onSelect={() => onChange(item)}
            >
              <PriorityBadge priority={item} />
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
