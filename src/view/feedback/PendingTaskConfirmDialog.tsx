import { Archive, Trash2 } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import {
  notifyMutationError,
  toastInfo,
  toastSuccess,
} from '@/view/feedback/toasts'
import { ConfirmDialog } from '@/view/ui/confirm-dialog'

/** Hosts archive/delete confirms opened from keyboard shortcuts (⌘E / ⌘⌫). */
export function PendingTaskConfirmDialog() {
  const pending = useFlowStore((state) => state.pendingTaskConfirm)
  const clearPendingTaskConfirm = useFlowStore(
    (state) => state.clearPendingTaskConfirm,
  )
  const archiveTask = useFlowStore((state) => state.archiveTask)
  const restoreTask = useFlowStore((state) => state.restoreTask)
  const deleteTask = useFlowStore((state) => state.deleteTask)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const drawerTaskId = useFlowStore((state) => state.drawerTaskId)
  const taskTitle = useFlowStore((state) =>
    pending ? (state.tasks[pending.taskId]?.title ?? 'Task') : '',
  )

  const open = pending !== null
  const kind = pending?.kind ?? 'archive'
  const taskId = pending?.taskId ?? ''

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          clearPendingTaskConfirm()
        }
      }}
      title={
        kind === 'archive'
          ? `Archive “${taskTitle}”?`
          : `Delete “${taskTitle}”?`
      }
      description={
        kind === 'archive'
          ? 'This archives the task and any subtasks. You can restore from Archived.'
          : 'This permanently deletes the task and any subtasks. This cannot be undone.'
      }
      confirmLabel={kind === 'archive' ? 'Archive' : 'Delete'}
      confirmIcon={
        kind === 'archive' ? (
          <Archive className="size-3.5" aria-hidden />
        ) : (
          <Trash2 className="size-3.5" aria-hidden />
        )
      }
      onConfirm={() => {
        if (!taskId) {
          return
        }
        const title = taskTitle
        const confirmKind = kind
        clearPendingTaskConfirm()
        void (async () => {
          if (confirmKind === 'archive') {
            const result = await archiveTask(taskId)
            if ('error' in result) {
              notifyMutationError(result.error)
              return
            }
            if (drawerTaskId === taskId) {
              openDrawer(null)
            }
            toastInfo(`Archived “${title}”`, {
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
                    toastSuccess(`Restored “${title}”`)
                  })()
                },
              },
            })
            return
          }

          const result = await deleteTask(taskId)
          if ('error' in result) {
            notifyMutationError(result.error)
            return
          }
          toastSuccess('Task deleted')
          if (drawerTaskId === taskId) {
            openDrawer(null)
          }
        })()
      }}
    />
  )
}
