import { AppShell } from '@/view/layout/AppShell'
import { ThemeProvider, useTheme } from '@/view/theme/ThemeProvider'
import { Skeleton } from '@/view/ui/skeleton'
import { Toaster } from '@/view/ui/sonner'
import { TooltipProvider } from '@/view/ui/tooltip'

function ShellPlaceholder() {
  const { resolved } = useTheme()

  return (
    <>
      <AppShell
        tree={
          <div className="flex flex-col gap-2 p-1">
            <Skeleton className="h-tree-row w-full rounded-control" />
            <Skeleton className="h-tree-row w-5/6 rounded-control" />
            <Skeleton className="h-tree-row w-4/5 rounded-control" />
            <Skeleton className="h-tree-row w-3/4 rounded-control" />
          </div>
        }
        topBarTrailing={
          <Skeleton className="h-8 w-28 rounded-control" />
        }
      >
        <div className="flex h-full flex-col gap-3 p-4">
          <Skeleton className="h-view-bar w-64 rounded-control" />
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
            <Skeleton className="h-full rounded-card" />
            <Skeleton className="h-full rounded-card" />
            <Skeleton className="h-full rounded-card" />
          </div>
        </div>
      </AppShell>
      <Toaster theme={resolved} />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <ShellPlaceholder />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
