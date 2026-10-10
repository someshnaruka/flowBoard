import { AppShell } from '@/view/layout/AppShell'
import { ThemeProvider, useTheme } from '@/view/theme/ThemeProvider'
import { SidebarTree } from '@/view/tree/SidebarTree'
import { Skeleton } from '@/view/ui/skeleton'
import { Toaster } from '@/view/ui/sonner'
import { TooltipProvider } from '@/view/ui/tooltip'

function MainPlaceholder() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
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

  return (
    <>
      <AppShell tree={<SidebarTree />}>
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
