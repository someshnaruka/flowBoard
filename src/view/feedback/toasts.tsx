import { AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import type { AppError } from '@/model/errors'

type RetryOptions = {
  onRetry?: () => void
}

const toastBase =
  'rounded-card border border-border bg-background text-foreground shadow-panel'

export function toastSuccess(message: string, description?: string): void {
  toast.success(message, {
    description,
    icon: <CheckCircle2 className="size-4 text-status-done" aria-hidden />,
    classNames: {
      toast: `${toastBase} border-l-4 border-l-status-done`,
    },
  })
}

export function toastError(message: string, options?: RetryOptions): void {
  toast.error(message, {
    icon: <AlertCircle className="size-4 text-priority-urgent" aria-hidden />,
    classNames: {
      toast: `${toastBase} border-l-4 border-l-priority-urgent`,
      actionButton:
        'bg-transparent text-brand shadow-none hover:bg-brand-50 hover:text-brand',
    },
    action: options?.onRetry
      ? {
          label: 'Retry',
          onClick: () => options.onRetry?.(),
        }
      : undefined,
  })
}

export function toastForbidden(message: string, description?: string): void {
  toast(message, {
    description,
    icon: <Lock className="size-4 text-priority-high" aria-hidden />,
    classNames: {
      toast: `${toastBase} border-l-4 border-l-priority-high`,
      title: 'text-foreground',
      description: 'text-muted-foreground',
    },
  })
}

export function notifyMutationError(
  error: AppError,
  options?: RetryOptions,
): void {
  if (error.code === 'FORBIDDEN') {
    toastForbidden(error.message)
    return
  }

  if (error.code === 'NETWORK_ERROR') {
    toastError(error.message, options)
    return
  }

  toastError(error.message)
}
