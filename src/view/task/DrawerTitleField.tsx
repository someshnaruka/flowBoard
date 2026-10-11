import { Textarea } from '@/view/ui/textarea'
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
    <div className="space-y-1 px-6 pt-3">
      <Textarea
        value={value}
        disabled={disabled}
        rows={2}
        maxLength={MAX_TITLE}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Task title"
        placeholder="Task title"
        className={cn(
          'min-h-0 resize-none rounded-control border-transparent bg-transparent px-0 py-1.5 text-drawer-title shadow-none',
          'placeholder:text-muted-foreground',
          'focus-visible:border-brand/40 focus-visible:bg-brand-50/40 focus-visible:px-2 focus-visible:ring-brand/30',
          'dark:focus-visible:bg-brand/10',
          'disabled:cursor-not-allowed disabled:opacity-70',
        )}
      />
      {value.length > 450 || over ? (
        <p
          className={cn(
            'text-right text-meta tabular-nums',
            over ? 'text-priority-urgent' : 'text-muted-foreground',
          )}
        >
          {value.length}/{MAX_TITLE}
        </p>
      ) : null}
    </div>
  )
}
