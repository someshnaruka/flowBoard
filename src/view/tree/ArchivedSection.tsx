import { useMemo, useState } from 'react'
import {
  Archive,
  Box,
  ChevronDown,
  ChevronRight,
  Folder,
  LayoutList,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { selectArchivedRoots } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { NodeKind } from '@/model/types'
import { Button } from '@/view/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { cn } from '@/view/ui/utils'

const KIND_ICON: Record<Exclude<NodeKind, 'workspace'>, typeof Folder> = {
  space: Box,
  folder: Folder,
  list: LayoutList,
}

const KIND_LABEL: Record<Exclude<NodeKind, 'workspace'>, string> = {
  space: 'Space',
  folder: 'Folder',
  list: 'List',
}

type ArchivedSectionProps = {
  collapsedRail?: boolean
}

export function ArchivedSection({ collapsedRail = false }: ArchivedSectionProps) {
  const restoreContainer = useFlowStore((state) => state.restoreContainer)
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const nodesStamp = useFlowStore((state) =>
    Object.values(state.nodes)
      .map(
        (node) =>
          `${node.id}:${node.name}:${node.archivedAt ?? ''}:${node.parentId}`,
      )
      .sort()
      .join('\0'),
  )

  const archived = useMemo(() => {
    void currentUserId
    void nodesStamp
    return selectArchivedRoots(getDefaultFlowStore().getState())
  }, [currentUserId, nodesStamp])

  const [open, setOpen] = useState(true)

  if (archived.length === 0) {
    return null
  }

  if (collapsedRail) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Archived (${archived.length})`}
            className="mt-2 flex h-tree-row w-full items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Archive className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {archived.length} archived — expand sidebar to restore
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <section className="mt-3 border-t border-border pt-3" aria-label="Archived">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-1 flex h-tree-row w-full items-center gap-1 rounded-control px-1 text-left text-meta font-medium uppercase tracking-wide text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0" aria-hidden />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
        )}
        <Archive className="size-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate">Archived</span>
        <span className="tabular-nums">{archived.length}</span>
      </button>

      {open ? (
        <ul className="flex flex-col gap-0.5">
          {archived.map((node) => {
            const Icon = KIND_ICON[node.kind as Exclude<NodeKind, 'workspace'>]
            const label = KIND_LABEL[node.kind as Exclude<NodeKind, 'workspace'>]

            return (
              <li
                key={node.id}
                className="group flex h-tree-row items-center gap-1 rounded-control px-1 text-body text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-body text-foreground">{node.name}</span>
                  <span className="text-meta text-muted-foreground">
                    {' '}
                    · {label}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'size-7 shrink-0 rounded-control opacity-0 transition-opacity duration-150',
                        'group-hover:opacity-100 group-focus-within:opacity-100',
                      )}
                      aria-label={`Restore ${node.name}`}
                      onClick={() => {
                        void (async () => {
                          const result = await restoreContainer(node.id)
                          if ('error' in result) {
                            toast.error(result.error.message)
                            return
                          }
                          toast.success(`Restored “${node.name}”`)
                        })()
                      }}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Restore</TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
