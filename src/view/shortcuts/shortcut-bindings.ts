export type ShortcutBinding = {
  keys: string
  action: string
}

export const SHORTCUT_BINDINGS: ShortcutBinding[] = [
  { keys: '/', action: 'Focus search' },
  { keys: 'C', action: 'Create task' },
  { keys: '?', action: 'Open keyboard shortcuts' },
  { keys: 'Esc', action: 'Close drawer / overlay' },
  { keys: '1', action: 'Board view' },
  { keys: '2', action: 'List view' },
  { keys: '[', action: 'Toggle sidebar' },
  { keys: 'Enter', action: 'Open focused card' },
  { keys: '⌘D', action: 'Duplicate task' },
  { keys: '⌘E', action: 'Archive task' },
  { keys: '⌘⌫', action: 'Delete task' },
  { keys: '⌘⇧L', action: 'Cycle theme' },
]

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/** True when focus / event target is inside a modal dialog (confirm, grants, etc.). */
export function isDialogTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return Boolean(target.closest('[role="dialog"]'))
}

export function resolveFocusedTaskId(): string | null {
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) {
    return null
  }
  // Dialog portals to body — never treat modal focus as a focused card.
  if (isDialogTarget(active)) {
    return null
  }
  const host = active.closest('[data-task-id]')
  return host?.getAttribute('data-task-id') ?? null
}
