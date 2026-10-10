function App() {
  return (
    <div className="flex min-h-svh flex-col gap-6 bg-white p-6 font-sans text-body text-slate-700">
      <header className="min-w-0">
        <h1 className="text-page-title text-slate-900">Flowboard tokens</h1>
        <p className="mt-1 text-meta text-slate-500">
          Tailwind theme smoke check (T01)
        </p>
      </header>

      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-drawer-title text-slate-900">Brand</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-badge bg-brand px-2 py-1 text-meta text-brand-foreground">
            brand
          </span>
          <span className="rounded-badge bg-brand-100 px-2 py-1 text-meta text-brand-700">
            brand-100
          </span>
          <button
            type="button"
            className="rounded-control bg-brand px-3 py-1.5 text-body font-medium text-brand-foreground transition-colors duration-150 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:bg-brand-800"
          >
            Primary
          </button>
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-drawer-title text-slate-900">Status</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-badge bg-status-todo-muted px-2 py-1 text-meta text-status-todo">
            todo
          </span>
          <span className="rounded-badge bg-status-active-muted px-2 py-1 text-meta text-status-active">
            active
          </span>
          <span className="rounded-badge bg-status-done-muted px-2 py-1 text-meta text-status-done">
            done
          </span>
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-drawer-title text-slate-900">Priority</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-badge bg-priority-urgent-muted px-2 py-1 text-meta text-priority-urgent">
            urgent
          </span>
          <span className="rounded-badge bg-priority-high-muted px-2 py-1 text-meta text-priority-high">
            high
          </span>
          <span className="rounded-badge bg-priority-normal-muted px-2 py-1 text-meta text-priority-normal">
            normal
          </span>
          <span className="rounded-badge bg-priority-low-muted px-2 py-1 text-meta text-priority-low">
            low
          </span>
          <span className="rounded-badge bg-priority-none-muted px-2 py-1 text-meta text-priority-none">
            none
          </span>
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-drawer-title text-slate-900">Surfaces</h2>
        <div className="h-list-row rounded-card border border-slate-200 bg-white p-3 shadow-card">
          <p className="truncate text-card-title text-slate-900">
            Card radius + shadow
          </p>
        </div>
        <div className="h-top-bar rounded-drawer border border-slate-200 bg-slate-50 px-4 shadow-panel">
          <p className="flex h-full items-center text-body">
            Top bar height token
          </p>
        </div>
      </section>
    </div>
  )
}

export default App
