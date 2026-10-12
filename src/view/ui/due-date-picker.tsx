import {
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import { format, parseISO, startOfDay } from 'date-fns'
import { Calendar } from '@/view/ui/calendar'
import { Button } from '@/view/ui/button'
import { DropdownCaret } from '@/view/ui/dropdown-caret'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/view/ui/popover'
import {
  FIELD_TRIGGER_INTERACTIVE,
  FIELD_TRIGGER_SHELL,
} from '@/view/ui/field-trigger'
import { cn } from '@/view/ui/utils'

type DueDatePickerProps = {
  dueDate: string | null
  disabled?: boolean
  onChange: (dueDate: string | null) => void
  trigger: ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
  contentClassName?: string
  onTriggerClick?: (event: MouseEvent | PointerEvent) => void
  showChevron?: boolean
}

function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function DueDatePicker({
  dueDate,
  disabled,
  onChange,
  trigger,
  align = 'start',
  className,
  contentClassName,
  onTriggerClick,
  showChevron = true,
}: DueDatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = dueDate ? parseISO(`${dueDate}T00:00:00`) : undefined
  const today = startOfDay(new Date())

  const pick = (date: Date | undefined) => {
    if (!date) {
      onChange(null)
      return
    }
    onChange(toIsoDate(date))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className={cn(
            FIELD_TRIGGER_SHELL,
            FIELD_TRIGGER_INTERACTIVE,
            'gap-1',
            className,
          )}
          onClick={onTriggerClick}
          onPointerDown={onTriggerClick}
        >
          {trigger}
          {showChevron && !disabled ? (
            <DropdownCaret className="text-muted-foreground" />
          ) : null}
        </Button>
      </PopoverTrigger>
      {!disabled ? (
        <PopoverContent
          align={align}
          sideOffset={6}
          className={cn(
            'w-auto rounded-card border-border p-0 shadow-panel',
            contentClassName,
          )}
          onClick={(event: SyntheticEvent) => event.stopPropagation()}
        >
          <div className="flex gap-1 border-b border-border px-2 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-control px-2 text-meta"
              onClick={() => pick(today)}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-control px-2 text-meta"
              onClick={() => {
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                pick(tomorrow)
              }}
            >
              Tomorrow
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-7 rounded-control px-2 text-meta text-muted-foreground"
              disabled={!dueDate}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Clear
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? today}
            onSelect={pick}
            className="p-2 [--cell-size:2rem]"
          />
        </PopoverContent>
      ) : null}
    </Popover>
  )
}
