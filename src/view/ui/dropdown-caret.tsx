import { cn } from '@/view/ui/utils'

/** Solid downward caret used on actionable field triggers (ClickUp-style ▾). */
export function DropdownCaret({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-0 shrink-0 border-x-[3.5px] border-x-transparent border-t-[4px] border-t-current opacity-75',
        className,
      )}
      aria-hidden
    />
  )
}
