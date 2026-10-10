import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/view/ui/utils'

const saveIndicatorVariants = cva(
  'inline-flex items-center gap-1.5 text-meta transition-colors duration-150',
  {
    variants: {
      status: {
        idle: 'text-muted-foreground',
        saving: 'text-muted-foreground',
        saved: 'text-status-done',
        error: 'text-priority-urgent',
      },
    },
    defaultVariants: {
      status: 'idle',
    },
  },
)

export type SaveStatus = NonNullable<
  VariantProps<typeof saveIndicatorVariants>['status']
>

const LABELS: Record<SaveStatus, string> = {
  idle: 'All changes saved',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
}

type SaveIndicatorProps = {
  status: SaveStatus
  className?: string
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  return (
    <span
      className={cn(saveIndicatorVariants({ status }), className)}
      role="status"
      aria-live="polite"
    >
      {status === 'saving' ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : null}
      {status === 'saved' ? (
        <Check className="size-3.5" aria-hidden />
      ) : null}
      {status === 'error' ? (
        <AlertCircle className="size-3.5" aria-hidden />
      ) : null}
      {LABELS[status]}
    </span>
  )
}

export { saveIndicatorVariants }
