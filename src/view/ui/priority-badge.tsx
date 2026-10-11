import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Priority } from '@/model/types'
import { cn } from '@/view/ui/utils'

const priorityBadgeVariants = cva(
  'inline-flex h-[18px] max-w-full items-center rounded-badge border border-transparent px-1.5 text-[11px] font-medium leading-none transition-colors duration-150',
  {
    variants: {
      priority: {
        urgent:
          'border-priority-urgent/25 bg-priority-urgent-muted text-priority-urgent dark:border-red-400/30 dark:bg-red-950/45 dark:text-[#F87171]',
        high: 'border-priority-high/25 bg-priority-high-muted text-priority-high dark:border-orange-400/30 dark:bg-orange-950/45 dark:text-orange-300',
        normal:
          'border-priority-normal/25 bg-priority-normal-muted text-priority-normal dark:border-blue-400/30 dark:bg-blue-950/45 dark:text-blue-300',
        low: 'border-priority-low/30 bg-priority-low-muted text-priority-low dark:border-slate-500/40 dark:bg-slate-700/70 dark:text-slate-200',
        none: 'border-border/80 bg-transparent text-priority-none dark:border-slate-600/50 dark:bg-transparent dark:text-slate-500',
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
