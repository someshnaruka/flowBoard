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
        <div className="flex size-10 items-center justify-center rounded-card bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 space-y-1">
        <h3 className="text-drawer-title text-foreground">{title}</h3>
        {description ? (
          <p className="max-w-sm text-body text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
