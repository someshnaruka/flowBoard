import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { StatusCategory } from '@/model/types'
import { BADGE_CHROME } from '@/view/ui/badge-chrome'
import { DropdownCaret } from '@/view/ui/dropdown-caret'
import { cn } from '@/view/ui/utils'

const statusBadgeVariants = cva(BADGE_CHROME, {
  variants: {
    status: {
      todo: 'bg-status-todo-muted text-status-todo dark:bg-slate-800/80 dark:text-slate-300',
      active:
        'bg-status-active-muted text-status-active dark:bg-blue-950/50 dark:text-blue-300',
      done: 'bg-status-done-muted text-status-done dark:bg-emerald-950/40 dark:text-status-done',
    },
  },
  defaultVariants: {
    status: 'todo',
  },
})

const STATUS_LABEL: Record<StatusCategory, string> = {
  todo: 'TODO',
  active: 'In Progress',
  done: 'Done',
}

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusBadgeVariants> & {
    status: StatusCategory
    label?: string
    showIcon?: boolean
    showChevron?: boolean
  }

export function StatusBadge({
  status,
  label,
  showIcon = false,
  showChevron = false,
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
          className="size-2 shrink-0 rounded-full bg-current"
          aria-hidden
        />
      ) : null}
      <span className="min-w-0">{label ?? STATUS_LABEL[status]}</span>
      {showChevron ? <DropdownCaret /> : null}
    </span>
  )
}

export { statusBadgeVariants }
