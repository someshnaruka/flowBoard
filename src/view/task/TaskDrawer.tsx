import { useEffect, useRef, useState } from 'react'
import { useFlowStore } from '@/controller/store'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/view/ui/sheet'
import { cn } from '@/view/ui/utils'
import { DrawerPanel } from './DrawerPanel'
import { useMediaQuery } from './useMediaQuery'

function isInsidePortaledUi(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  return Boolean(
    target.closest(
      [
        '[data-radix-popper-content-wrapper]',
        '[data-radix-select-content]',
        '[data-radix-menu-content]',
        '[data-flowboard-modal-overlay]',
        '[role="dialog"]',
        '[role="alertdialog"]',
        '[data-sonner-toaster]',
      ].join(', '),
    ),
  )
}

export function TaskDrawer() {
  const taskId = useFlowStore((state) => state.drawerTaskId)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const isXl = useMediaQuery('(min-width: 1280px)')
  const [lastTaskId, setLastTaskId] = useState(taskId)
  const panelRef = useRef<HTMLElement | null>(null)

  // Adjust state during render so the panel stays mounted through close.
  if (taskId && taskId !== lastTaskId) {
    setLastTaskId(taskId)
  }

  const open = Boolean(taskId)
  const panelTaskId = taskId ?? lastTaskId

  const close = () => {
    const focusId = lastTaskId
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

  // Push layout has no overlay — close when clicking outside the drawer.
  useEffect(() => {
    if (!open || !isXl) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (panelRef.current?.contains(target)) {
        return
      }
      if (isInsidePortaledUi(target)) {
        return
      }
      // Opening another task card should switch the drawer, not close-only.
      if (
        target instanceof Element &&
        target.closest('[data-task-id]')
      ) {
        return
      }
      close()
    }

    // Skip the same click that opened the drawer.
    const timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown, true)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open, isXl, taskId])

  if (isXl) {
    return (
      <aside
        ref={panelRef}
        aria-hidden={!open}
        aria-label="Task details"
        className={cn(
          'flex h-full shrink-0 flex-col overflow-hidden bg-background shadow-panel',
          'transition-[width] duration-300 ease-in-out',
          open
            ? 'w-drawer border-l border-border'
            : 'pointer-events-none w-0 border-l-0',
        )}
      >
        {panelTaskId ? (
          <div className="flex h-full w-drawer min-w-drawer flex-col">
            <DrawerPanel taskId={panelTaskId} onClose={close} />
          </div>
        ) : null}
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
        onPointerDownOutside={() => {
          close()
        }}
        onInteractOutside={() => {
          close()
        }}
      >
        <SheetTitle className="sr-only">Task details</SheetTitle>
        <SheetDescription className="sr-only">
          Edit task properties, description, and subtasks.
        </SheetDescription>
        {panelTaskId ? (
          <DrawerPanel taskId={panelTaskId} onClose={close} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
