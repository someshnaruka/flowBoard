import { useState } from 'react'
import { Copy, Lock, MoreHorizontal, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useFlowStore } from '@/controller/store'
import { notifyMutationError, toastSuccess } from '@/view/feedback/toasts'
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
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <header className="flex shrink-0 flex-col gap-2 border-b border-border p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-meta text-muted-foreground">{breadcrumb}</p>
          <p className="font-mono text-meta text-muted-foreground">{taskId}</p>
        </div>
        <SaveIndicator status={saveStatus} className="shrink-0" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-control"
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
            {!readOnly ? (
              <>
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
                <DropdownMenuItem
                  onClick={() => {
                    void (async () => {
                      const result = await archiveTask(taskId)
                      if ('error' in result) {
                        notifyMutationError(result.error)
                        return
                      }
                      toast.message(`Archived “${taskTitle}”`, {
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
                >
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
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-control"
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
        <div className="flex items-center gap-2 rounded-control border border-priority-high/30 bg-priority-high-muted px-3 py-2 text-meta text-priority-high">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          <span>Read-only — you don’t have edit access on this list.</span>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete “${taskTitle}”?`}
        description="This permanently deletes the task and any subtasks. This cannot be undone."
        confirmLabel="Delete"
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
