import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { StatusCategory } from '@/model/types'
import { cn } from '@/view/ui/utils'

const statusBadgeVariants = cva(
  'inline-flex max-w-full items-center rounded-badge border border-transparent px-1.5 py-0.5 text-meta font-medium transition-colors duration-150',
  {
    variants: {
      status: {
        todo: 'border-status-todo/20 bg-status-todo-muted text-status-todo',
        active:
          'border-status-active/20 bg-status-active-muted text-status-active',
        done: 'border-status-done/20 bg-status-done-muted text-status-done',
      },
    },
    defaultVariants: {
      status: 'todo',
    },
  },
)

const STATUS_LABEL: Record<StatusCategory, string> = {
  todo: 'To do',
  active: 'Active',
  done: 'Done',
}

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusBadgeVariants> & {
    status: StatusCategory
    label?: string
  }

export function StatusBadge({
  status,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {label ?? STATUS_LABEL[status]}
    </span>
  )
}

export { statusBadgeVariants }
