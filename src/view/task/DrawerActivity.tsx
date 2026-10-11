import { format, formatDistanceToNow } from 'date-fns'
import type { TaskActivityItem, User } from '@/model/types'
import { UserAvatar } from '@/view/ui/user-avatar'

type DrawerActivityProps = {
  activity: TaskActivityItem[]
  users: User[]
  createdAt: string
  createdById: string
}

export function DrawerActivity({
  activity,
  users,
  createdAt,
  createdById,
}: DrawerActivityProps) {
  const entries =
    activity.length > 0
      ? activity
      : [
          {
            id: 'fallback-created',
            actorId: createdById,
            summary: 'created this task',
            createdAt,
          },
        ]

  return (
    <section className="space-y-2 px-6 py-3">
      <h3 className="text-meta font-medium text-slate-600 dark:text-slate-300">
        Activity
      </h3>
      <ul className="space-y-2.5">
        {entries.map((item) => {
          const actor = users.find((user) => user.id === item.actorId)
          const name = actor?.name.split(' ')[0] ?? 'Someone'
          const when = new Date(item.createdAt)
          return (
            <li key={item.id} className="flex items-start gap-2">
              {actor ? (
                <UserAvatar
                  name={actor.name}
                  avatarUrl={actor.avatarUrl}
                  size="sm"
                  className="mt-0.5 size-5 text-tiny"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-body text-foreground">
                  <span className="font-medium">{name}</span>{' '}
                  <span className="text-muted-foreground">{item.summary}</span>
                </p>
                <p className="text-meta text-muted-foreground">
                  {formatDistanceToNow(when, { addSuffix: true })} ·{' '}
                  {format(when, 'MMM d · h:mm a')}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
