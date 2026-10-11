import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { StatusCategory } from '@/model/types'
import { cn } from '@/view/ui/utils'

const statusBadgeVariants = cva(
  'inline-flex h-[18px] max-w-full items-center gap-1 rounded-badge border border-transparent py-0 pl-1 pr-1.5 text-[11px] font-medium leading-none transition-colors duration-150',
  {
    variants: {
      status: {
        todo: 'border-status-todo/25 bg-status-todo-muted text-status-todo dark:border-slate-600/40 dark:bg-slate-800/80 dark:text-slate-300',
        active:
          'border-status-active/25 bg-status-active-muted text-status-active dark:border-blue-400/30 dark:bg-blue-950/50 dark:text-blue-300',
        done: 'border-status-done/25 bg-status-done-muted text-status-done dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-[#4ADE80]',
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
    showIcon?: boolean
  }

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {showIcon ? (
        <span
          className="size-1 shrink-0 rounded-full bg-current"
          aria-hidden
        />
      ) : null}
      {label ?? STATUS_LABEL[status]}
    </span>
  )
}

export { statusBadgeVariants }
