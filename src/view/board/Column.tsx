import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { StatusCategory } from '@/model/types'
import { Button } from '@/view/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { cn } from '@/view/ui/utils'

const STATUS_DOT: Record<StatusCategory, string> = {
  todo: 'bg-status-todo',
  active: 'bg-status-active',
  done: 'bg-status-done',
}

type ColumnProps = {
  statusId: string
  name: string
  category: StatusCategory
  count: number
  collapsed: boolean
  highlighted?: boolean
  onToggleCollapse: () => void
  children: ReactNode
}

export function Column({
  statusId,
  name,
  category,
  count,
  collapsed,
  highlighted = false,
  onToggleCollapse,
  children,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: statusId,
    data: { type: 'column' as const, statusId },
    disabled: collapsed,
  })

  const dropActive = highlighted || isOver

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
      ref={setNodeRef}
      className={cn(
        'flex h-full w-column shrink-0 flex-col rounded-card border bg-muted/30 transition-colors duration-150',
        dropActive
          ? 'border-brand bg-brand/5 ring-2 ring-brand/25'
          : 'border-border',
      )}
      aria-label={`${name} column`}
    >
      <header className="sticky top-0 z-10 flex h-9 shrink-0 items-center gap-2 px-3 pt-2">
        <span
          className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[category])}
          aria-hidden
        />
        <span className="min-w-0 truncate text-body font-medium text-foreground">
          {name}
        </span>
        <span className="text-meta text-muted-foreground tabular-nums">
          {count}
        </span>
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

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {children}
      </div>
    </section>
  )
}
