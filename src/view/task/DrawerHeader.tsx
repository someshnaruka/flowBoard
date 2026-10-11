import { useState } from 'react'
import { Archive, Copy, Lock, MoreHorizontal, Trash2, X } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import {
  notifyMutationError,
  toastInfo,
  toastSuccess,
} from '@/view/feedback/toasts'
import { ConfirmDialog } from '@/view/ui/confirm-dialog'
import { SaveIndicator, type SaveStatus } from '@/view/ui/save-indicator'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'

type DrawerHeaderProps = {
  breadcrumb: string
  taskId: string
  taskTitle: string
  saveStatus: SaveStatus
  readOnly: boolean
  onClose: () => void
}

export function DrawerHeader({
  breadcrumb,
  taskId,
  taskTitle,
  saveStatus,
  readOnly,
  onClose,
}: DrawerHeaderProps) {
  const duplicateTask = useFlowStore((state) => state.duplicateTask)
  const archiveTask = useFlowStore((state) => state.archiveTask)
  const restoreTask = useFlowStore((state) => state.restoreTask)
  const deleteTask = useFlowStore((state) => state.deleteTask)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <header className="flex shrink-0 flex-col gap-2 border-b border-border/70 px-6 pb-3 pt-4">
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-meta text-slate-500 dark:text-slate-400">
            {breadcrumb}
          </p>
        </div>
        {!readOnly ? (
          <SaveIndicator
            status={saveStatus}
            className="h-8 shrink-0 items-center px-1"
          />
        ) : null}
        {!readOnly ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-control"
                aria-label="Task menu"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-control">
              <DropdownMenuItem
                onClick={() => {
                  void navigator.clipboard.writeText(taskId)
                  toastSuccess('Task ID copied')
                }}
              >
                <Copy className="size-3.5" />
                Copy task ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  void (async () => {
                    const result = await duplicateTask(taskId)
                    if ('error' in result) {
                      notifyMutationError(result.error)
                      return
                    }
                    toastSuccess('Task duplicated')
                    openDrawer(result.data.id)
                  })()
                }}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-control"
              aria-label="Close drawer"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Close (Esc)</TooltipContent>
        </Tooltip>
      </div>

      {readOnly ? (
        <div className="flex items-start gap-2 rounded-control border border-amber-300/50 bg-amber-50 px-3 py-2 text-meta text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            <span className="font-medium">Read-only</span>
            {' — '}
            You can view this task, but you don’t have permission to edit it.
          </span>
        </div>
      ) : null}

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={`Archive “${taskTitle}”?`}
        description="This archives the task and any subtasks. You can restore from Archived."
        confirmLabel="Archive"
        confirmIcon={<Archive className="size-3.5" aria-hidden />}
        onConfirm={() => {
          void (async () => {
            const result = await archiveTask(taskId)
            if ('error' in result) {
              notifyMutationError(result.error)
              return
            }
            toastInfo(`Archived “${taskTitle}”`, {
              description: 'You can restore from Archived.',
              action: {
                label: 'Undo',
                onClick: () => {
                  void (async () => {
                    const restored = await restoreTask(taskId)
                    if ('error' in restored) {
                      notifyMutationError(restored.error)
                      return
                    }
                    toastSuccess(`Restored “${taskTitle}”`)
                  })()
                },
              },
            })
            onClose()
          })()
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete “${taskTitle}”?`}
        description="This permanently deletes the task and any subtasks. This cannot be undone."
        confirmLabel="Delete"
        confirmIcon={<Trash2 className="size-3.5" aria-hidden />}
        onConfirm={() => {
          void (async () => {
            const result = await deleteTask(taskId)
            if ('error' in result) {
              notifyMutationError(result.error)
              return
            }
            toastSuccess('Task deleted')
            onClose()
          })()
        }}
      />
    </header>
  )
}
