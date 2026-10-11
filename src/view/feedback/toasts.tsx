import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import type { AppError } from '@/model/errors'

type RetryOptions = {
  onRetry?: () => void
}

export function toastSuccess(message: string, description?: string): void {
  toast.success(message, { description })
}

export function toastError(message: string, options?: RetryOptions): void {
  toast.error(message, {
    action: options?.onRetry
      ? {
          label: 'Retry',
          onClick: () => options.onRetry?.(),
        }
      : undefined,
  })
}

export function toastForbidden(message: string): void {
  toast(message, {
    icon: <Lock className="size-4 text-priority-high" aria-hidden />,
    classNames: {
      toast:
        'border-priority-high/40 bg-priority-high-muted text-priority-high',
      title: 'text-priority-high',
      description: 'text-priority-high/80',
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
