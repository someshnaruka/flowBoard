import { lazy, Suspense } from 'react'
import { PendingTaskConfirmDialog } from '@/view/feedback/PendingTaskConfirmDialog'
import { AppShell } from '@/view/layout/AppShell'
import { DevMenu } from '@/view/layout/DevMenu'
import { ShortcutsButton } from '@/view/layout/ShortcutsButton'
import { UserSwitcher } from '@/view/layout/UserSwitcher'
import { KeyboardShortcuts } from '@/view/shortcuts/KeyboardShortcuts'
import { ThemeProvider, useTheme } from '@/view/theme/ThemeProvider'
import { SidebarTree } from '@/view/tree/SidebarTree'
import { BoardSkeleton } from '@/view/board/BoardSkeleton'
import { Toaster } from '@/view/ui/sonner'
import { TooltipProvider } from '@/view/ui/tooltip'

const BoardWorkspace = lazy(() =>
  import('@/view/board/BoardWorkspace').then((module) => ({
    default: module.BoardWorkspace,
  })),
)

function FlowboardApp() {
  const { resolved } = useTheme()

  return (
    <>
      <AppShell
        tree={<SidebarTree />}
        topBarTrailing={
          <>
            <ShortcutsButton />
            <DevMenu />
            <UserSwitcher />
          </>
        }
      >
        <Suspense fallback={<BoardSkeleton />}>
          <BoardWorkspace />
        </Suspense>
      </AppShell>
      <KeyboardShortcuts />
      <PendingTaskConfirmDialog />
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
