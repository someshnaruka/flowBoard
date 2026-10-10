import type { ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { StatusCategory } from '@/model/types'
import { Button } from '@/view/ui/button'
import { StatusBadge } from '@/view/ui/status-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { cn } from '@/view/ui/utils'

type ColumnProps = {
  name: string
  category: StatusCategory
  count: number
  collapsed: boolean
  onToggleCollapse: () => void
  children: ReactNode
}

export function Column({
  name,
  category,
  count,
  collapsed,
  onToggleCollapse,
  children,
}: ColumnProps) {
  if (collapsed) {
    return (
      <section
        className="flex h-full w-10 shrink-0 flex-col items-center gap-2 rounded-card border border-border bg-muted/40 py-2"
        aria-label={`${name} column (collapsed)`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-control"
              aria-label={`Expand ${name}`}
              onClick={onToggleCollapse}
            >
              <ChevronRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand column</TooltipContent>
        </Tooltip>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="rotate-180 truncate text-meta font-medium text-foreground [writing-mode:vertical-rl]">
            {name}
            <span className="ml-1 text-muted-foreground">({count})</span>
          </span>
        </div>
      </section>
    )
  }

  return (
    <section
      className="flex h-full w-column shrink-0 flex-col rounded-card border border-border bg-muted/30"
      aria-label={`${name} column`}
    >
      <header className="sticky top-0 z-10 flex h-10 shrink-0 items-center gap-2 border-b border-border bg-muted/80 px-2 backdrop-blur-sm">
        <StatusBadge status={category} label={name} className="min-w-0 truncate" />
        <span className="text-meta text-muted-foreground tabular-nums">{count}</span>
        <div className="min-w-0 flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-control"
              aria-label={`Collapse ${name}`}
              onClick={onToggleCollapse}
            >
              <ChevronDown className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Collapse column</TooltipContent>
        </Tooltip>
      </header>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2',
        )}
      >
        {children}
      </div>
    </section>
  )
}
