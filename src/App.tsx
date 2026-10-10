import { toast } from 'sonner'
import { Badge } from '@/view/ui/badge'
import { Button } from '@/view/ui/button'
import { Toaster } from '@/view/ui/sonner'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/view/ui/toggle-group'
import { TooltipProvider } from '@/view/ui/tooltip'
import { ThemeProvider, useTheme } from '@/view/theme/ThemeProvider'
import type { ThemePreference } from '@/view/theme/theme'

function ThemeSmokePage() {
  const { preference, resolved, setPreference } = useTheme()

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background p-6 font-sans text-body text-foreground">
      <header className="min-w-0">
        <h1 className="text-page-title">Flowboard UI</h1>
        <p className="mt-1 text-meta text-muted-foreground">
          Theme tokens + shadcn smoke check (T01). Resolved:{' '}
          <span className="font-medium text-foreground">{resolved}</span>
        </p>
      </header>

      <section className="flex min-w-0 flex-col gap-2">
        <h2 className="text-drawer-title">Theme preference</h2>
        <ToggleGroup
          type="single"
          value={preference}
          onValueChange={(value) => {
            if (value) {
              setPreference(value as ThemePreference)
            }
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="light" aria-label="Light theme">
            Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark theme">
            Dark
          </ToggleGroupItem>
          <ToggleGroupItem value="system" aria-label="System theme">
            System
          </ToggleGroupItem>
        </ToggleGroup>
      </section>

      <section className="flex min-w-0 flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() =>
            toast.success(`Toast using ${resolved} theme surfaces`)
          }
        >
          Show toast
        </Button>
        <Badge>brand primary</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="outline">outline</Badge>
        <span className="rounded-badge bg-status-active-muted px-2 py-1 text-meta text-status-active">
          status.active
        </span>
        <span className="rounded-badge bg-priority-urgent-muted px-2 py-1 text-meta text-priority-urgent">
          priority.urgent
        </span>
      </section>

      <div className="rounded-card border bg-card p-4 text-card-foreground shadow-card">
        Card surface follows theme tokens.
      </div>

      <Toaster theme={resolved} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <ThemeSmokePage />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
