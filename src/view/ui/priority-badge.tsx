import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Priority } from '@/model/types'
import { BADGE_CHROME } from '@/view/ui/badge-chrome'
import { DropdownCaret } from '@/view/ui/dropdown-caret'
import { cn } from '@/view/ui/utils'

const priorityBadgeVariants = cva(BADGE_CHROME, {
  variants: {
    priority: {
      urgent:
        'bg-priority-urgent-muted text-priority-urgent dark:bg-red-950/45 dark:text-priority-urgent',
      high: 'bg-priority-high-muted text-priority-high dark:bg-orange-950/45 dark:text-orange-300',
      normal:
        'bg-priority-normal-muted text-priority-normal dark:bg-blue-950/45 dark:text-blue-300',
      low: 'bg-priority-low-muted text-priority-low dark:bg-slate-700/70 dark:text-slate-200',
      none: 'bg-priority-none-muted text-priority-none dark:bg-transparent dark:text-slate-500',
    },
  },
  defaultVariants: {
    priority: 'none',
  },
})

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
  none: 'None',
}

export type PriorityBadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof priorityBadgeVariants> & {
    priority: Priority
    label?: string
    showChevron?: boolean
  }

export function PriorityBadge({
  priority,
  label,
  showChevron = false,
  className,
  ...props
}: PriorityBadgeProps) {
  return (
    <span
      className={cn(priorityBadgeVariants({ priority }), className)}
      {...props}
    >
      <span className="min-w-0">{label ?? PRIORITY_LABEL[priority]}</span>
      {showChevron ? <DropdownCaret /> : null}
    </span>
  )
}

export { priorityBadgeVariants }
