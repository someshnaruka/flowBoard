import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { ChevronRight, PanelLeft } from 'lucide-react'
import { selectBreadcrumb } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import { SearchInput } from '@/view/search/SearchInput'
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
  const nodesStamp = useFlowStore((state) =>
    Object.values(state.nodes)
      .map((node) => `${node.id}:${node.name}:${node.parentId}`)
      .join('\0'),
  )

  const crumbs = useMemo(() => {
    void nodesStamp
    if (!selectedListId) {
      return []
    }
    return selectBreadcrumb(
      getDefaultFlowStore().getState(),
      selectedListId,
    ).filter((node) => node.kind !== 'workspace')
  }, [selectedListId, nodesStamp])

  return (
    <header className="flex h-top-bar shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-control"
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

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden"
      >
        {crumbs.length === 0 ? (
          <span className="truncate text-meta text-muted-foreground">
            Select a list
          </span>
        ) : (
          crumbs.map((node, index) => (
            <span key={node.id} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              <span
                className={
                  index === crumbs.length - 1
                    ? 'truncate text-body font-medium text-foreground'
                    : 'truncate text-body text-slate-500 dark:text-slate-400'
                }
              >
                {node.name}
              </span>
            </span>
          ))
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <SearchInput />
        {trailing}
      </div>
    </header>
  )
}
