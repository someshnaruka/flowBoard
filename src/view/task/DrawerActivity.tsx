import { format, formatDistanceToNow } from 'date-fns'

type DrawerActivityProps = {
  createdAt: string
  updatedAt: string
}

export function DrawerActivity({ createdAt, updatedAt }: DrawerActivityProps) {
  const created = new Date(createdAt)
  const updated = new Date(updatedAt)
  const sameMoment = createdAt === updatedAt

  return (
    <section className="space-y-2 border-t border-border px-4 py-3">
      <h3 className="text-meta font-medium text-muted-foreground">Activity</h3>
      <ul className="space-y-2">
        <li className="text-body text-foreground">
          Created{' '}
          <span className="text-muted-foreground">
            {formatDistanceToNow(created, { addSuffix: true })} ·{' '}
            {format(created, 'MMM d, yyyy')}
          </span>
        </li>
        {!sameMoment ? (
          <li className="text-body text-foreground">
            Updated{' '}
            <span className="text-muted-foreground">
              {formatDistanceToNow(updated, { addSuffix: true })} ·{' '}
              {format(updated, 'MMM d, yyyy')}
            </span>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
