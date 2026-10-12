import type { HTMLAttributes } from 'react'
import type { StatusCategory } from '@/model/types'
import { BADGE_CHROME } from '@/view/ui/badge-chrome'
import { DropdownCaret } from '@/view/ui/dropdown-caret'
import { statusBadgeClass } from '@/view/ui/status-color'
import { cn } from '@/view/ui/utils'

const STATUS_LABEL: Record<StatusCategory, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: StatusCategory
  /** Status.color hex — drives badge chrome when mapped. */
  color?: string
  label?: string
  showIcon?: boolean
  showChevron?: boolean
}

export function StatusBadge({
  status,
  color,
  label,
  showIcon = false,
  showChevron = false,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(BADGE_CHROME, statusBadgeClass(color, status), className)}
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
