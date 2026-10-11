import { Textarea } from '@/view/ui/textarea'

type DrawerDescriptionProps = {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function DrawerDescription({
  value,
  disabled,
  onChange,
}: DrawerDescriptionProps) {
  return (
    <section className="space-y-2 px-6 py-3">
      <h3 className="text-meta font-medium text-slate-600 dark:text-slate-300">
        Description
      </h3>
      <Textarea
        value={value}
        disabled={disabled}
        rows={4}
        placeholder="Add a description…"
        className="min-h-[5.5rem] rounded-control border-border bg-background p-3 text-body disabled:cursor-default disabled:opacity-100"
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}
