import { cn } from '@/view/ui/utils'

const MAX_TITLE = 500

type DrawerTitleFieldProps = {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function DrawerTitleField({
  value,
  disabled,
  onChange,
}: DrawerTitleFieldProps) {
  const remaining = MAX_TITLE - value.length
  const over = remaining < 0

  return (
    <div className="space-y-1 px-4 pt-4">
      <textarea
        value={value}
        disabled={disabled}
        rows={2}
        maxLength={MAX_TITLE}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Task title"
        className={cn(
          'w-full resize-none rounded-control border-0 bg-transparent p-0 text-drawer-title text-foreground',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          'disabled:cursor-not-allowed disabled:opacity-70',
        )}
        placeholder="Task title"
      />
      <p
        className={cn(
          'text-right text-meta tabular-nums',
          over ? 'text-priority-urgent' : 'text-muted-foreground',
        )}
      >
        {value.length}/{MAX_TITLE}
      </p>
    </div>
  )
}
