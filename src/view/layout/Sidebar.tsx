import type { ReactNode } from 'react'
import { useFlowStore } from '@/controller/store'
import { cn } from '@/view/ui/utils'

type SidebarProps = {
  tree: ReactNode
  footer?: ReactNode
}

export function Sidebar({ tree, footer }: SidebarProps) {
  const collapsed = useFlowStore((state) => state.sidebarCollapsed)

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-border bg-background transition-[width] duration-150',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
      )}
    >
      <div
        className={cn(
          'flex h-top-bar shrink-0 items-center gap-2 border-b border-border px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        <div className="flex size-6 items-center justify-center rounded-control bg-brand text-meta font-medium text-brand-foreground">
          F
        </div>
        {!collapsed ? (
          <p className="min-w-0 truncate text-card-title text-foreground">
            Flowboard HQ
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">{tree}</div>

      {footer ? (
        <div
          className={cn(
            'shrink-0 border-t border-border p-2',
            collapsed && 'flex justify-center',
          )}
        >
          {footer}
        </div>
      ) : null}
    </aside>
  )
}
