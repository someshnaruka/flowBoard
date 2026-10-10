import { useEffect, useRef } from 'react'
import { useFlowStore } from '@/controller/store'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/view/ui/sheet'
import { DrawerPanel } from './DrawerPanel'
import { useMediaQuery } from './useMediaQuery'

export function TaskDrawer() {
  const taskId = useFlowStore((state) => state.drawerTaskId)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const isXl = useMediaQuery('(min-width: 1280px)')
  const lastTaskIdRef = useRef<string | null>(taskId)

  useEffect(() => {
    if (taskId) {
      lastTaskIdRef.current = taskId
    }
  }, [taskId])

  const open = Boolean(taskId)

  const close = () => {
    const focusId = lastTaskIdRef.current
    openDrawer(null)
    window.requestAnimationFrame(() => {
      if (!focusId) {
        return
      }
      document
        .querySelector<HTMLElement>(`[data-task-id="${focusId}"]`)
        ?.focus()
    })
  }

  if (isXl) {
    if (!open || !taskId) {
      return null
    }

    return (
      <aside
        className="flex h-full w-drawer shrink-0 flex-col border-l border-border bg-background shadow-drawer"
        aria-label="Task details"
      >
        <DrawerPanel taskId={taskId} onClose={close} />
      </aside>
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          close()
        }
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full max-w-[520px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px] [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Task details</SheetTitle>
        <SheetDescription className="sr-only">
          Edit task properties, description, and subtasks.
        </SheetDescription>
        {taskId ? <DrawerPanel taskId={taskId} onClose={close} /> : null}
      </SheetContent>
    </Sheet>
  )
}
