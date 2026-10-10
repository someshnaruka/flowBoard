import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Priority } from '@/model/types'
import { cn } from '@/view/ui/utils'

const priorityBadgeVariants = cva(
  'inline-flex items-center rounded-badge px-1.5 py-0.5 text-meta font-medium transition-colors duration-150',
  {
    variants: {
      priority: {
        urgent: 'bg-priority-urgent-muted text-priority-urgent',
        high: 'bg-priority-high-muted text-priority-high',
        normal: 'bg-priority-normal-muted text-priority-normal',
        low: 'bg-priority-low-muted text-priority-low',
        none: 'bg-priority-none-muted text-priority-none',
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
