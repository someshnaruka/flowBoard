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
    <section className="space-y-2 border-t border-border px-4 py-3">
      <h3 className="text-meta font-medium text-muted-foreground">
        Description
      </h3>
      <Textarea
        value={value}
        disabled={disabled}
        rows={5}
        placeholder="Add a description…"
        className="min-h-[7.5rem] rounded-control text-body"
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}
