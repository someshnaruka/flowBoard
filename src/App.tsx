import { useFlowStore } from '@/controller/store'
import { BoardWorkspace } from '@/view/board/BoardWorkspace'
import { AppShell } from '@/view/layout/AppShell'
import { DevMenu } from '@/view/layout/DevMenu'
import { UserSwitcher } from '@/view/layout/UserSwitcher'
import { ThemeProvider, useTheme } from '@/view/theme/ThemeProvider'
import { SidebarTree } from '@/view/tree/SidebarTree'
import { Toaster } from '@/view/ui/sonner'
import { TooltipProvider } from '@/view/ui/tooltip'

function FlowboardApp() {
  const { resolved } = useTheme()
  const sidebarCollapsed = useFlowStore((state) => state.sidebarCollapsed)

  return (
    <>
      <AppShell
        tree={<SidebarTree />}
        topBarTrailing={
          <>
            <DevMenu />
            <UserSwitcher />
          </>
        }
        sidebarFooter={<UserSwitcher compact={sidebarCollapsed} />}
      >
        <BoardWorkspace />
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
