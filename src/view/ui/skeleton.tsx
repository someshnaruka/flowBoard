import { cn } from '@/view/ui/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-control bg-muted dark:bg-muted/80',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
