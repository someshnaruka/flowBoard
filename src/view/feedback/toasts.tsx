import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, Lock } from 'lucide-react'
import { toast } from 'sonner'
import type { AppError } from '@/model/errors'

type RetryOptions = {
  onRetry?: () => void
}

/** Figma 04 — white card, left accent, circular icon, title + meta. */
const toastShell =
  '!rounded-card !border !border-border !bg-background !text-foreground !shadow-panel !gap-3 !items-start'

/** Only three toast kinds: Success, Error, Info. */
export function toastSuccess(message: string, description?: string): void {
  toast.success(message, {
    description: description ?? undefined,
    icon: (
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-status-done/15 text-status-done">
        <CheckCircle2 className="size-3.5" aria-hidden />
      </span>
    ),
    classNames: {
      toast: `${toastShell} !border-l-[3px] !border-l-status-done`,
      title: '!text-body !font-medium !text-foreground',
      description: '!text-meta !text-muted-foreground',
    },
  })
}

export function toastError(
  message: string,
  options?: RetryOptions & { description?: string },
): void {
  toast.error(message, {
    description: options?.description,
    icon: (
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-priority-urgent/15 text-priority-urgent">
        <AlertCircle className="size-3.5" aria-hidden />
      </span>
    ),
    classNames: {
      toast: `${toastShell} !border-l-[3px] !border-l-priority-urgent`,
      title: '!text-body !font-medium !text-foreground',
      description: '!text-meta !text-muted-foreground',
      actionButton:
        '!bg-transparent !text-brand !shadow-none !font-medium hover:!bg-brand-50',
    },
    action: options?.onRetry
      ? {
          label: 'Retry',
          onClick: () => options.onRetry?.(),
        }
      : undefined,
  })
}

export function toastInfo(
  message: string,
  options?: {
    description?: string
    action?: { label: string; onClick: () => void }
    icon?: ReactNode
  },
): void {
  toast(message, {
    description: options?.description,
    icon: options?.icon ?? (
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Info className="size-3.5" aria-hidden />
      </span>
    ),
    classNames: {
      toast: `${toastShell} !border-l-[3px] !border-l-border`,
      title: '!text-body !font-medium !text-foreground',
      description: '!text-meta !text-muted-foreground',
      actionButton:
        '!bg-transparent !text-brand !shadow-none !font-medium hover:!bg-brand-50',
    },
    action: options?.action,
  })
}

/** FORBIDDEN is an Info toast with a lock icon. */
export function toastForbidden(message: string, description?: string): void {
  toastInfo(message, {
    description,
    icon: (
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-priority-high/15 text-priority-high">
        <Lock className="size-3.5" aria-hidden />
      </span>
    ),
  })
}

export function notifyMutationError(
  error: AppError,
  options?: RetryOptions,
): void {
  if (error.code === 'FORBIDDEN') {
    toastForbidden('Forbidden', error.message)
    return
  }

  if (error.code === 'NETWORK_ERROR') {
    toastError("Couldn't complete action", {
      description: `${error.code}. Changes restored.`,
      onRetry: options?.onRetry,
    })
    return
  }

  toastError(error.message)
}
