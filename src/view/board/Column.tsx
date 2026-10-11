import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import type { StatusCategory } from '@/model/types'
import { Button } from '@/view/ui/button'
import { statusDotClass } from '@/view/ui/status-color'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { cn } from '@/view/ui/utils'

type ColumnProps = {
  statusId: string
  name: string
  category: StatusCategory
  color: string
  count: number
  collapsed: boolean
  highlighted?: boolean
  onToggleCollapse: () => void
  onAddTask?: () => void
  children: ReactNode
}

export function Column({
  statusId,
  name,
  category,
  color,
  count,
  collapsed,
  highlighted = false,
  onToggleCollapse,
  onAddTask,
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
        className="flex h-full w-10 shrink-0 flex-col items-center gap-2 rounded-card bg-board-column py-2 dark:bg-board-column-dark"
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
      className={cn(
        'flex h-full w-column shrink-0 flex-col rounded-card bg-board-column transition-colors duration-150 dark:bg-board-column-dark',
        dropActive &&
          'bg-brand-50 ring-2 ring-brand/25 ring-offset-2 ring-offset-background dark:bg-brand/10',
      )}
      aria-label={`${name} column`}
    >
      <header className="sticky top-0 z-10 flex h-10 shrink-0 items-center gap-2 px-3">
        <span
          className={cn(
            'size-2 shrink-0 rounded-full',
            statusDotClass(color, category),
          )}
          aria-hidden
        />
        <span className="min-w-0 truncate text-body font-medium text-foreground">
          {name}
        </span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-badge bg-background px-1.5 text-meta tabular-nums text-muted-foreground shadow-sm dark:bg-background/80">
          {count}
        </span>
        <div className="min-w-0 flex-1" />
        {onAddTask ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-control"
                aria-label={`Add task to ${name}`}
                onClick={onAddTask}
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Add task</TooltipContent>
          </Tooltip>
        ) : null}
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
        ref={setNodeRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2"
      >
        {children}
      </div>

      {onAddTask ? (
        <div className="shrink-0 p-2 pt-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-1.5 rounded-control text-meta text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={onAddTask}
          >
            <Plus className="size-3.5" />
            Add task
          </Button>
        </div>
      ) : null}
    </section>
  )
}
