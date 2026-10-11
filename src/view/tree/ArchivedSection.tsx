import { useMemo, useState } from 'react'
import {
  Archive,
  Box,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Folder,
  LayoutList,
  RotateCcw,
} from 'lucide-react'
import { selectArchivedRoots, selectArchivedTaskRoots } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { NodeKind } from '@/model/types'
import {
  notifyMutationError,
  toastSuccess,
} from '@/view/feedback/toasts'
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
  const restoreTask = useFlowStore((state) => state.restoreTask)
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
  const tasksStamp = useFlowStore((state) =>
    Object.values(state.tasks)
      .map(
        (task) =>
          `${task.id}:${task.title}:${task.archivedAt ?? ''}:${task.listId}`,
      )
      .sort()
      .join('\0'),
  )

  const { archivedNodes, archivedTasks, listNames } = useMemo(() => {
    void currentUserId
    void nodesStamp
    void tasksStamp
    const state = getDefaultFlowStore().getState()
    const names: Record<string, string> = {}
    for (const node of Object.values(state.nodes)) {
      if (node.kind === 'list') {
        names[node.id] = node.name
      }
    }
    return {
      archivedNodes: selectArchivedRoots(state),
      archivedTasks: selectArchivedTaskRoots(state),
      listNames: names,
    }
  }, [currentUserId, nodesStamp, tasksStamp])

  const [open, setOpen] = useState(true)
  const total = archivedNodes.length + archivedTasks.length

  if (total === 0) {
    return null
  }

  if (collapsedRail) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label={`Archived (${total})`}
            className="mt-2 h-tree-row w-full rounded-control p-0 text-muted-foreground shadow-none hover:bg-accent hover:text-foreground focus-visible:ring-brand"
          >
            <Archive className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {total} archived — expand sidebar to restore
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <section className="mt-3 border-t border-border pt-3" aria-label="Archived">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        className="mb-1 h-tree-row w-full justify-start gap-1 rounded-control px-1 text-left text-meta font-medium uppercase tracking-wide text-muted-foreground shadow-none hover:bg-accent hover:text-foreground focus-visible:ring-brand"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0" aria-hidden />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
        )}
        <Archive className="size-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate">Archived</span>
        <span className="tabular-nums">{total}</span>
      </Button>

      {open ? (
        <ul className="flex flex-col gap-0.5">
          {archivedNodes.map((node) => {
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
                            notifyMutationError(result.error)
                            return
                          }
                          toastSuccess(`Restored “${node.name}”`)
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

          {archivedTasks.map((task) => {
            const listName = listNames[task.listId] ?? 'List'
            return (
              <li
                key={task.id}
                className="group flex h-tree-row items-center gap-1 rounded-control px-1 text-body text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              >
                <CheckSquare className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-body text-foreground">{task.title}</span>
                  <span className="text-meta text-muted-foreground">
                    {' '}
                    · {listName}
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
                      aria-label={`Restore ${task.title}`}
                      onClick={() => {
                        void (async () => {
                          const result = await restoreTask(task.id)
                          if ('error' in result) {
                            notifyMutationError(result.error)
                            return
                          }
                          toastSuccess(`Restored “${task.title}”`)
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
