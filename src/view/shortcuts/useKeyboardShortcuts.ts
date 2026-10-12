import { useEffect } from 'react'
import { getDefaultFlowStore } from '@/controller/store'
import { notifyMutationError, toastSuccess } from '@/view/feedback/toasts'
import { useTheme } from '@/view/theme/ThemeProvider'
import type { ThemePreference } from '@/view/theme/theme'
import {
  isDialogTarget,
  isTypingTarget,
  resolveFocusedTaskId,
} from './shortcut-bindings'

const THEME_CYCLE: ThemePreference[] = ['light', 'dark', 'system']

function isMod(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey
}

export function useKeyboardShortcuts(): void {
  const { preference, setPreference } = useTheme()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = getDefaultFlowStore().getState()
      const typing = isTypingTarget(event.target)

      if (event.key === 'Escape') {
        if (store.pendingTaskConfirm) {
          store.clearPendingTaskConfirm()
          event.preventDefault()
          return
        }
        if (store.cheatsheetOpen) {
          store.setCheatsheetOpen(false)
          event.preventDefault()
          return
        }
        if (store.drawerTaskId) {
          store.openDrawer(null)
          event.preventDefault()
        }
        return
      }

      if (event.key === '?' && !typing && !isMod(event)) {
        event.preventDefault()
        store.setCheatsheetOpen(true)
        return
      }

      if (isMod(event) && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault()
        const index = THEME_CYCLE.indexOf(preference)
        const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length] ?? 'system'
        setPreference(next)
        return
      }

      const taskId =
        resolveFocusedTaskId() ?? store.drawerTaskId

      if (isMod(event) && event.key.toLowerCase() === 'd' && taskId) {
        if (typing) {
          return
        }
        event.preventDefault()
        void (async () => {
          const result = await store.duplicateTask(taskId)
          if ('error' in result) {
            notifyMutationError(result.error)
            return
          }
          toastSuccess('Task duplicated')
          store.openDrawer(result.data.id)
        })()
        return
      }

      if (isMod(event) && event.key.toLowerCase() === 'e' && taskId) {
        if (typing) {
          return
        }
        event.preventDefault()
        store.requestTaskConfirm('archive', taskId)
        return
      }

      if (
        isMod(event) &&
        (event.key === 'Backspace' || event.key === 'Delete') &&
        taskId
      ) {
        if (typing) {
          return
        }
        event.preventDefault()
        store.requestTaskConfirm('delete', taskId)
        return
      }

      if (typing || isMod(event) || event.altKey) {
        return
      }

      // Let dialogs own keyboard (Enter confirms, letters type, etc.).
      if (
        store.pendingTaskConfirm ||
        isDialogTarget(event.target) ||
        isDialogTarget(document.activeElement)
      ) {
        return
      }

      if (event.key === '/') {
        event.preventDefault()
        store.requestSearchFocus()
        return
      }

      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault()
        void (async () => {
          const result = await store.createDefaultTask()
          if ('error' in result) {
            notifyMutationError(result.error)
            return
          }
          toastSuccess('Task created')
          store.openDrawer(result.data.id)
        })()
        return
      }

      if (event.key === '1') {
        event.preventDefault()
        store.setView('board')
        return
      }

      if (event.key === '2') {
        event.preventDefault()
        store.setView('list')
        return
      }

      if (event.key === '[') {
        event.preventDefault()
        store.toggleSidebar()
        return
      }

      if (event.key === 'Enter') {
        const focused = resolveFocusedTaskId()
        if (focused) {
          event.preventDefault()
          store.openDrawer(focused)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [preference, setPreference])
}
