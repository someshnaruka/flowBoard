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
import {
  selectArchivedRoots,
  selectArchivedTaskRoots,
  selectNodeOriginPath,
  selectTaskOriginPath,
} from '@/controller/selectors'
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

function formatOrigin(path: string[]): string | null {
  if (path.length === 0) {
    return null
  }
  return path.join(' › ')
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

  const { archivedNodes, archivedTasks, nodeOrigins, taskOrigins } = useMemo(() => {
    void currentUserId
    void nodesStamp
    void tasksStamp
    const state = getDefaultFlowStore().getState()
    const nodes = selectArchivedRoots(state)
    const tasks = selectArchivedTaskRoots(state)
    const nodeOrigins: Record<string, string | null> = {}
    const taskOrigins: Record<string, string | null> = {}
    for (const node of nodes) {
      nodeOrigins[node.id] = formatOrigin(selectNodeOriginPath(state, node.id))
    }
    for (const task of tasks) {
      taskOrigins[task.id] = formatOrigin(selectTaskOriginPath(state, task.id))
    }
    return {
      archivedNodes: nodes,
      archivedTasks: tasks,
      nodeOrigins,
      taskOrigins,
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
            const origin = nodeOrigins[node.id]
            const restoreHint = origin
              ? `Restore to ${origin}`
              : `Restore ${label}`

            return (
              <li
                key={node.id}
                className="group flex min-h-tree-row items-center gap-1 rounded-control px-1 py-0.5 text-body text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate">
                    <span className="text-body text-foreground">{node.name}</span>
                    <span className="text-meta text-muted-foreground">
                      {' '}
                      · {label}
                    </span>
                  </div>
                  {origin ? (
                    <p
                      className="truncate text-tiny text-muted-foreground"
                      title={origin}
                    >
                      From {origin}
                    </p>
                  ) : null}
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
                          toastSuccess(
                            origin
                              ? `Restored “${node.name}” to ${origin}`
                              : `Restored “${node.name}”`,
                          )
                        })()
                      }}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{restoreHint}</TooltipContent>
                </Tooltip>
              </li>
            )
          })}

          {archivedTasks.map((task) => {
            const origin = taskOrigins[task.id]
            const restoreHint = origin
              ? `Restore to ${origin}`
              : 'Restore task'

            return (
              <li
                key={task.id}
                className="group flex min-h-tree-row items-center gap-1 rounded-control px-1 py-0.5 text-body text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              >
                <CheckSquare className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate">
                    <span className="text-body text-foreground">{task.title}</span>
                    <span className="text-meta text-muted-foreground">
                      {' '}
                      · Task
                    </span>
                  </div>
                  {origin ? (
                    <p
                      className="truncate text-tiny text-muted-foreground"
                      title={origin}
                    >
                      From {origin}
                    </p>
                  ) : null}
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
                          toastSuccess(
                            origin
                              ? `Restored “${task.title}” to ${origin}`
                              : `Restored “${task.title}”`,
                          )
                        })()
                      }}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{restoreHint}</TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
