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

function formatLabel(dueDate: string): string {
  const date = new Date(`${dueDate}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

type DueDateProps = {
  dueDate: string | null
  /** Override “today” for tests; defaults to a stable seed-era date in app usage via prop from callers later. */
  today?: string
  className?: string
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
  className,
}: DueDateProps) {
  const tone = resolveTone(dueDate, today)

  if (!dueDate) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-meta',
          TONE_CLASS.none,
          className,
        )}
      >
        <Calendar className="size-3.5 opacity-60" aria-hidden />
        No date
      </span>
    )
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
      <Calendar className="size-3.5 opacity-70" aria-hidden />
      {formatLabel(dueDate)}
    </span>
  )
}

export { resolveTone }
