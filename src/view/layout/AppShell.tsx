import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'

type AppShellProps = {
  tree: ReactNode
  sidebarFooter?: ReactNode
  topBarTrailing?: ReactNode
  children: ReactNode
}

export function AppShell({
  tree,
  sidebarFooter,
  topBarTrailing,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-svh min-h-0 w-full overflow-hidden bg-background text-foreground">
      <Sidebar tree={tree} footer={sidebarFooter} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar trailing={topBarTrailing} />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
