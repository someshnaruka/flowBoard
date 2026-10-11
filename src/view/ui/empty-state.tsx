import type { ReactNode } from 'react'
import { cn } from '@/view/ui/utils'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-10 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="flex size-9 items-center justify-center text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 space-y-1">
        <h3 className="text-body font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="max-w-sm text-meta text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
