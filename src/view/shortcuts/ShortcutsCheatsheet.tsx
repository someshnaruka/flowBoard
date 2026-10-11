import { useFlowStore } from '@/controller/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/view/ui/dialog'
import { SHORTCUT_BINDINGS } from './shortcut-bindings'

export function ShortcutsCheatsheet() {
  const open = useFlowStore((state) => state.cheatsheetOpen)
  const setCheatsheetOpen = useFlowStore((state) => state.setCheatsheetOpen)

  return (
    <Dialog open={open} onOpenChange={setCheatsheetOpen}>
      <DialogContent className="max-w-md rounded-drawer">
        <DialogHeader>
          <DialogTitle className="text-page-title">Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ul className="mt-2 max-h-[60vh] space-y-1 overflow-y-auto">
          {SHORTCUT_BINDINGS.map((binding) => (
            <li
              key={binding.keys}
              className="flex items-center justify-between gap-3 rounded-control px-2 py-1.5 text-body"
            >
              <span className="min-w-0 text-foreground">{binding.action}</span>
              <kbd className="shrink-0 rounded-badge border border-border bg-muted px-1.5 py-0.5 text-meta text-muted-foreground">
                {binding.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
