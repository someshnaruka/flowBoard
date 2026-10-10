import { useFlowStore } from '@/controller/store'
import { AppShell } from '@/view/layout/AppShell'
import { UserSwitcher } from '@/view/layout/UserSwitcher'
import { ThemeProvider, useTheme } from '@/view/theme/ThemeProvider'
import { SidebarTree } from '@/view/tree/SidebarTree'
import { Skeleton } from '@/view/ui/skeleton'
import { Toaster } from '@/view/ui/sonner'
import { TooltipProvider } from '@/view/ui/tooltip'

function MainPlaceholder() {
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const listName = useFlowStore((state) =>
    selectedListId ? (state.nodes[selectedListId]?.name ?? null) : null,
  )

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <p className="text-meta text-muted-foreground">
        {listName
          ? `Selected list: ${listName}. Board UI arrives in T10.`
          : 'Select a list in the sidebar.'}
      </p>
      <Skeleton className="h-view-bar w-64 rounded-control" />
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        <Skeleton className="h-full rounded-card" />
        <Skeleton className="h-full rounded-card" />
        <Skeleton className="h-full rounded-card" />
      </div>
    </div>
  )
}

function FlowboardApp() {
  const { resolved } = useTheme()
  const sidebarCollapsed = useFlowStore((state) => state.sidebarCollapsed)

  return (
    <>
      <AppShell
        tree={<SidebarTree />}
        topBarTrailing={<UserSwitcher />}
        sidebarFooter={<UserSwitcher compact={sidebarCollapsed} />}
      >
        <MainPlaceholder />
      </AppShell>
      <Toaster theme={resolved} />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <FlowboardApp />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
