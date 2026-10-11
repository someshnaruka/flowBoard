import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Priority } from '@/model/types'
import { cn } from '@/view/ui/utils'

const priorityBadgeVariants = cva(
  'inline-flex max-w-full items-center rounded-badge border border-transparent px-1.5 py-0.5 text-meta font-medium transition-colors duration-150',
  {
    variants: {
      priority: {
        urgent:
          'border-priority-urgent/20 bg-priority-urgent-muted text-priority-urgent dark:bg-red-950/45',
        high: 'border-priority-high/20 bg-priority-high-muted text-priority-high dark:bg-orange-950/45',
        normal:
          'border-priority-normal/20 bg-priority-normal-muted text-priority-normal dark:bg-blue-950/45',
        low: 'border-priority-low/20 bg-priority-low-muted text-priority-low dark:bg-slate-800/80',
        none: 'border-border bg-priority-none-muted text-priority-none dark:bg-slate-800/80 dark:text-slate-400',
      },
    },
    defaultVariants: {
      priority: 'none',
    },
  },
)

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
  }

export function PriorityBadge({
  priority,
  label,
  className,
  ...props
}: PriorityBadgeProps) {
  return (
    <span
      className={cn(priorityBadgeVariants({ priority }), className)}
      {...props}
    >
      {label ?? PRIORITY_LABEL[priority]}
    </span>
  )
}

export { priorityBadgeVariants }
