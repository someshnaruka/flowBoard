import { Skeleton } from '@/view/ui/skeleton'

function CardSkeleton({ lines }: { lines: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-card p-3 shadow-card">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={
            index === 0
              ? 'h-3.5 w-11/12 rounded-badge'
              : index === lines - 1
                ? 'h-3 w-1/2 rounded-badge'
                : 'h-3 w-4/5 rounded-badge'
          }
        />
      ))}
    </div>
  )
}

export function BoardSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-col"
      aria-busy="true"
      aria-label="Loading board"
    >
      <div className="flex h-view-bar shrink-0 items-center gap-3 border-b border-border bg-background px-4">
        <Skeleton className="h-7 w-28 rounded-control" />
        <Skeleton className="h-7 w-36 rounded-control" />
        <div className="min-w-0 flex-1" />
        <Skeleton className="h-8 w-20 rounded-control" />
      </div>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden bg-muted/35 p-4 dark:bg-background">
        {[
          [3, 2],
          [2],
          [1],
        ].map((lineCounts, column) => (
          <div
            key={column}
            className="flex h-full w-column shrink-0 flex-col gap-2 rounded-card bg-board-column p-2 dark:bg-board-column-dark"
          >
            <div className="flex items-center gap-2 px-1 py-1">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3.5 w-16 rounded-badge" />
              <Skeleton className="h-4 w-5 rounded-badge" />
            </div>
            {lineCounts.map((lines, cardIndex) => (
              <CardSkeleton key={cardIndex} lines={lines} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
