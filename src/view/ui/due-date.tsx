import { Calendar } from 'lucide-react'
import { DropdownCaret } from '@/view/ui/dropdown-caret'
import { cn } from '@/view/ui/utils'

export type DueDateTone = 'default' | 'overdue' | 'today' | 'none'

function resolveTone(dueDate: string | null, today = '2026-10-10'): DueDateTone {
  if (!dueDate) {
    return 'none'
  }
  if (dueDate < today) {
    return 'overdue'
  }
  if (dueDate === today) {
    return 'today'
  }
  return 'default'
}

/** Short date format, e.g. "Oct 12". */
function formatLabel(dueDate: string): string {
  const date = new Date(`${dueDate}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function overdueDays(dueDate: string, today: string): number {
  const due = new Date(`${dueDate}T00:00:00`).getTime()
  const now = new Date(`${today}T00:00:00`).getTime()
  return Math.max(1, Math.round((now - due) / 86_400_000))
}

type DueDateProps = {
  dueDate: string | null
  today?: string
  /**
   * `compact` (board/list): "Oct 8" with tone color only
   * `detail` (drawer): "Oct 8 (2 days overdue)"
   */
  variant?: 'compact' | 'detail'
  showIcon?: boolean
  showChevron?: boolean
  className?: string
  /** @deprecated use variant="detail" */
  detail?: boolean
}

/** Spec: normal #6B7280/#9CA3AF, today #D97706/#FBBF24, overdue #DC2626/#F87171 */
const TONE_CLASS: Record<DueDateTone, string> = {
  none: 'text-[#6B7280] dark:text-[#9CA3AF]',
  default: 'text-[#6B7280] dark:text-[#9CA3AF]',
  today: 'text-[#D97706] dark:text-[#FBBF24]',
  overdue: 'text-[#DC2626] dark:text-[#F87171]',
}

/** Match PriorityBadge / BADGE_CHROME box + type in board & list. */
const COMPACT_TEXT =
  'inline-flex h-auto min-h-badge w-fit max-w-full shrink-0 items-center gap-1 whitespace-nowrap rounded-badge px-1.5 py-0.5 !text-body font-medium leading-none'

export function DueDate({
  dueDate,
  today = new Date().toISOString().slice(0, 10),
  variant,
  detail = false,
  showIcon = true,
  showChevron = false,
  className,
}: DueDateProps) {
  const mode = variant ?? (detail ? 'detail' : 'compact')
  const tone = resolveTone(dueDate, today)
  const sizeClass =
    mode === 'detail'
      ? 'inline-flex items-center gap-1 text-body font-medium leading-none'
      : COMPACT_TEXT

  if (!dueDate) {
    return (
      <span
        className={cn(sizeClass, TONE_CLASS.none, className)}
        data-tone="none"
      >
        {showIcon ? (
          <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
        ) : null}
        <span>No date</span>
        {showChevron ? <DropdownCaret /> : null}
      </span>
    )
  }

  let label = formatLabel(dueDate)
  if (tone === 'overdue' && mode === 'detail') {
    label = `${formatLabel(dueDate)} (${overdueDays(dueDate, today)} days overdue)`
  }

  return (
    <span
      className={cn(sizeClass, TONE_CLASS[tone], className)}
      data-tone={tone}
    >
      {showIcon ? (
        <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
      ) : null}
      <span>{label}</span>
      {showChevron ? <DropdownCaret /> : null}
    </span>
  )
}

export { resolveTone, formatLabel }
