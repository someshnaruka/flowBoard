import type { ReactNode } from 'react'
import { PanelLeft } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import { Button } from '@/view/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'

type TopBarProps = {
  trailing?: ReactNode
}

export function TopBar({ trailing }: TopBarProps) {
  const toggleSidebar = useFlowStore((state) => state.toggleSidebar)
  const sidebarCollapsed = useFlowStore((state) => state.sidebarCollapsed)
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const listName = useFlowStore((state) =>
    selectedListId ? (state.nodes[selectedListId]?.name ?? 'Flowboard') : 'Flowboard',
  )

  return (
    <header className="flex h-top-bar shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-control"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleSidebar}
          >
            <PanelLeft className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </TooltipContent>
      </Tooltip>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-page-title text-foreground">{listName}</h1>
      </div>

      {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
    </header>
  )
}
