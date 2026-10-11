import {
  Box,
  Building2,
  ChevronDown,
  ChevronRight,
  Folder,
  LayoutList,
  Lock,
} from 'lucide-react'
import type { NodeKind } from '@/model/types'
import { Button } from '@/view/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { cn } from '@/view/ui/utils'
import { TreeNodeMenu } from './TreeNodeMenu'

const KIND_ICON: Record<NodeKind, typeof Folder> = {
  workspace: Building2,
  space: Box,
  folder: Folder,
  list: LayoutList,
}

const DEPTH_PAD = ['pl-0', 'pl-3', 'pl-6', 'pl-9', 'pl-12'] as const

type TreeRowProps = {
  id: string
  name: string
  kind: NodeKind
  depth: number
  isPrivate: boolean
  isShell: boolean
  isExpanded: boolean
  isSelected: boolean
  hasChildren: boolean
  collapsedRail?: boolean
  onToggle: () => void
  onSelect: () => void
}

export function TreeRow({
  id,
  name,
  kind,
  depth,
  isPrivate,
  isShell,
  isExpanded,
  isSelected,
  hasChildren,
  collapsedRail = false,
  onToggle,
  onSelect,
}: TreeRowProps) {
  const Icon = KIND_ICON[kind]
  const padClass = DEPTH_PAD[Math.min(depth, DEPTH_PAD.length - 1)]

  if (collapsedRail) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={name}
            onClick={onSelect}
            className={cn(
              'flex h-tree-row w-full items-center justify-center rounded-control transition-colors duration-150',
              'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:bg-accent/80',
              isSelected && 'bg-brand-50 text-brand dark:bg-brand/20',
              isShell && 'opacity-70',
            )}
          >
            <Icon className="size-4 shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{name}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div
      className={cn(
        'group flex h-tree-row items-center gap-1 rounded-control pr-1 text-body transition-colors duration-150',
        'hover:bg-accent focus-within:bg-accent',
        isSelected &&
          'bg-brand-50 text-brand hover:bg-brand-50 dark:bg-brand/20 dark:hover:bg-brand/25',
        isShell && 'text-muted-foreground',
      )}
    >
      <div className={cn('flex min-w-0 flex-1 items-center gap-0.5', padClass)}>
        {hasChildren ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-5 shrink-0 rounded-badge p-0"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        ) : (
          <span className="inline-flex size-5 shrink-0" aria-hidden />
        )}

        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-control px-1 py-0.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Icon className="size-4 shrink-0 opacity-80" />
          <span className="min-w-0 truncate">{name}</span>
          {isPrivate ? (
            <Lock
              className="size-3 shrink-0 text-muted-foreground"
              aria-label="Private"
            />
          ) : null}
        </button>
      </div>

      <TreeNodeMenu id={id} name={name} kind={kind} isShell={isShell} />
    </div>
  )
}
