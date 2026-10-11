import { useState, type SyntheticEvent } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { selectCanEditTask } from '@/controller/selectors'
import { useFlowStore } from '@/controller/store'
import {
  notifyMutationError,
  toastSuccess,
} from '@/view/feedback/toasts'
import { ConfirmDialog } from '@/view/ui/confirm-dialog'
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

type TaskCardMenuProps = {
  taskId: string
  taskTitle: string
  onOpen?: () => void
}

export function TaskCardMenu({
  taskId,
  taskTitle,
  onOpen,
}: TaskCardMenuProps) {
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const duplicateTask = useFlowStore((state) => state.duplicateTask)
  const archiveTask = useFlowStore((state) => state.archiveTask)
  const restoreTask = useFlowStore((state) => state.restoreTask)
  const deleteTask = useFlowStore((state) => state.deleteTask)
  const canEdit = useFlowStore((state) => selectCanEditTask(state, taskId))
  const [deleteOpen, setDeleteOpen] = useState(false)

  const stop = (event: SyntheticEvent) => {
    event.stopPropagation()
  }

  const onDuplicate = async () => {
    const result = await duplicateTask(taskId)
    if ('error' in result) {
      notifyMutationError(result.error)
      return
    }
    toastSuccess('Task duplicated')
    openDrawer(result.data.id)
  }

  const onArchive = async () => {
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
  }

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 rounded-control opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100"
                aria-label={`Menu for ${taskTitle}`}
                onClick={stop}
                onPointerDown={stop}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">More</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="end"
          className="rounded-control"
          onClick={stop}
        >
          <DropdownMenuItem
            onClick={() => {
              if (onOpen) {
                onOpen()
              } else {
                openDrawer(taskId)
              }
            }}
          >
            Open
          </DropdownMenuItem>
          {canEdit ? (
            <>
              <DropdownMenuItem
                onClick={() => {
                  void onDuplicate()
                }}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  void onArchive()
                }}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

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
          })()
        }}
      />
    </>
  )
}
