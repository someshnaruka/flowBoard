import { toast } from 'sonner'
import { Badge } from '@/view/ui/badge'
import { Button } from '@/view/ui/button'
import { Toaster } from '@/view/ui/sonner'
import { TooltipProvider } from '@/view/ui/tooltip'

function App() {
  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col gap-6 bg-background p-6 font-sans text-body text-foreground">
        <header className="min-w-0">
          <h1 className="text-page-title">Flowboard UI</h1>
          <p className="mt-1 text-meta text-muted-foreground">
            shadcn primitives smoke check (T01)
          </p>
        </header>

        <section className="flex min-w-0 flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => toast.success('Theme tokens are wired')}
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

        <Toaster />
      </div>
    </TooltipProvider>
  )
}

export default App
