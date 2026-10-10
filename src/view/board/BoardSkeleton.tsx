import { Skeleton } from '@/view/ui/skeleton'

export function BoardSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-col"
      aria-busy="true"
      aria-label="Loading board"
    >
      <div className="flex h-view-bar shrink-0 items-center gap-3 border-b border-border px-4">
        <Skeleton className="h-8 w-40 rounded-control" />
        <div className="min-w-0 flex-1" />
        <Skeleton className="h-8 w-20 rounded-control" />
      </div>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-4">
        {[0, 1, 2].map((column) => (
          <div
            key={column}
            className="flex h-full w-column shrink-0 flex-col gap-2 rounded-card border border-border bg-muted/30 p-2"
          >
            <Skeleton className="h-8 w-full rounded-control" />
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-20 w-full rounded-card" />
            <Skeleton className="h-16 w-5/6 rounded-card" />
          </div>
        ))}
      </div>
    </div>
  )
}
