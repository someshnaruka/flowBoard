import { Lock, MoreHorizontal, X } from 'lucide-react'
import { SaveIndicator, type SaveStatus } from '@/view/ui/save-indicator'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  saveStatus: SaveStatus
  readOnly: boolean
  onClose: () => void
}

export function DrawerHeader({
  breadcrumb,
  taskId,
  saveStatus,
  readOnly,
  onClose,
}: DrawerHeaderProps) {
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
              }}
            >
              Copy task ID
            </DropdownMenuItem>
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
    </header>
  )
}
