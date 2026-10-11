import { ShortcutsCheatsheet } from './ShortcutsCheatsheet'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

export function KeyboardShortcuts() {
  useKeyboardShortcuts()
  return <ShortcutsCheatsheet />
}
