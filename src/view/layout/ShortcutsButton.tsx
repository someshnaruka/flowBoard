import { Keyboard } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import { Button } from '@/view/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'

export function ShortcutsButton() {
  const setCheatsheetOpen = useFlowStore((state) => state.setCheatsheetOpen)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-control px-2.5 text-body"
          aria-label="Keyboard shortcuts"
          onClick={() => setCheatsheetOpen(true)}
        >
          <Keyboard className="size-3.5" />
          <span className="hidden sm:inline">Shortcuts</span>
          <kbd className="rounded-badge border border-border bg-muted px-1 text-[10px] leading-4 text-muted-foreground">
            ?
          </kbd>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Keyboard shortcuts (?)</TooltipContent>
    </Tooltip>
  )
}
