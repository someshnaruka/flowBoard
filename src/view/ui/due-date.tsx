import { Calendar } from 'lucide-react'
import { cn } from '@/view/ui/utils'

export type DueDateTone = 'default' | 'overdue' | 'soon' | 'none'

function resolveTone(dueDate: string | null, today = '2026-10-10'): DueDateTone {
  if (!dueDate) {
    return 'none'
  }
  if (dueDate < today) {
    return 'overdue'
  }
  const soonLimit = new Date(today)
  soonLimit.setDate(soonLimit.getDate() + 3)
  const soonIso = soonLimit.toISOString().slice(0, 10)
  if (dueDate <= soonIso) {
    return 'soon'
  }
  return 'default'
}

/** Figma 05: "Oct 12" */
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
   * `compact` (cards): "Oct 8 · overdue"
   * `detail` (drawer): "Oct 8 (2 days overdue)"
   */
  variant?: 'compact' | 'detail'
  showIcon?: boolean
  className?: string
  /** @deprecated use variant="detail" */
  detail?: boolean
}

const TONE_CLASS: Record<DueDateTone, string> = {
  none: 'text-muted-foreground',
  default: 'text-foreground',
  soon: 'text-priority-high',
  overdue: 'text-priority-urgent',
}

export function DueDate({
  dueDate,
  today = new Date().toISOString().slice(0, 10),
  variant,
  detail = false,
  showIcon = true,
  className,
}: DueDateProps) {
  const mode = variant ?? (detail ? 'detail' : 'compact')
  const tone = resolveTone(dueDate, today)

  if (!dueDate) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-meta',
          TONE_CLASS.none,
          className,
        )}
        data-tone="none"
      >
        {showIcon ? (
          <Calendar className="size-3.5 shrink-0 opacity-60" aria-hidden />
        ) : null}
        No date
      </span>
    )
  }

  let label = formatLabel(dueDate)
  if (tone === 'overdue') {
    label =
      mode === 'detail'
        ? `${formatLabel(dueDate)} (${overdueDays(dueDate, today)} days overdue)`
        : `${formatLabel(dueDate)} · overdue`
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-meta font-medium',
        TONE_CLASS[tone],
        className,
      )}
      data-tone={tone}
    >
      {showIcon ? (
        <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
      ) : null}
      {label}
    </span>
  )
}

export { resolveTone, formatLabel }
