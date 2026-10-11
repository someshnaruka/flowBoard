import { useMemo } from 'react'
import { Lock, Shield } from 'lucide-react'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { GrantEffect } from '@/model/types'
import { notifyMutationError, toastSuccess } from '@/view/feedback/toasts'
import { Button } from '@/view/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/view/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/view/ui/select'
import { cn } from '@/view/ui/utils'

const GRANT_NODES = [
  { id: 'list-backlog', label: 'Backlog' },
  { id: 'list-sprint', label: 'Sprint' },
  { id: 'space-leadership', label: 'Leadership (space)' },
  { id: 'list-okrs', label: 'OKRs' },
] as const

const EFFECTS: Array<{ value: 'none' | GrantEffect; label: string }> = [
  { value: 'none', label: 'None (inherit)' },
  { value: 'view', label: 'View (read-only)' },
  { value: 'allow', label: 'Allow (edit)' },
  { value: 'deny', label: 'Deny (hidden)' },
]

type GrantsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GrantsDialog({ open, onOpenChange }: GrantsDialogProps) {
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const isAdmin = useFlowStore(
    (state) => state.users[state.currentUserId]?.role === 'admin',
  )
  const upsertGrant = useFlowStore((state) => state.upsertGrant)
  const setNodePrivate = useFlowStore((state) => state.setNodePrivate)
  const createTask = useFlowStore((state) => state.createTask)

  const grantsStamp = useFlowStore((state) =>
    Object.values(state.grants)
      .map((grant) => `${grant.id}:${grant.userId}:${grant.nodeId}:${grant.effect}`)
      .sort()
      .join('\0'),
  )
  const leadershipPrivate = useFlowStore(
    (state) => state.nodes['space-leadership']?.isPrivate ?? false,
  )

  const { members, effectFor } = useMemo(() => {
    void grantsStamp
    const state = getDefaultFlowStore().getState()
    const members = Object.values(state.users)
      .filter((user) => user.role === 'member')
      .sort((a, b) => a.name.localeCompare(b.name))

    const effectFor = (userId: string, nodeId: string): 'none' | GrantEffect => {
      const grant = Object.values(state.grants).find(
        (item) => item.userId === userId && item.nodeId === nodeId,
      )
      return grant?.effect ?? 'none'
    }

    return { members, effectFor }
  }, [grantsStamp])

  const onEffectChange = async (
    userId: string,
    nodeId: string,
    value: string,
  ) => {
    const effect =
      value === 'none' ? null : (value as GrantEffect)
    const result = await upsertGrant({ userId, nodeId, effect })
    if ('error' in result) {
      notifyMutationError(result.error)
      return
    }
    toastSuccess('Grant updated')
  }

  const onTryForbidden = async () => {
    const result = await createTask({
      listId: 'list-sprint',
      title: 'Should be forbidden',
      statusId: 'status-sprint-todo',
    })
    if ('error' in result) {
      notifyMutationError(result.error)
      return
    }
    toastSuccess('Unexpected success — grant may allow Sprint')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-drawer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-page-title">
            <Shield className="size-5 text-brand" aria-hidden />
            Permissions
          </DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Nearest grant wins. Public nodes are visible unless denied; private
            nodes need allow/view. Admins bypass grants.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 rounded-control border border-border px-3 py-2">
          <div className="min-w-0">
            <p className="text-body font-medium text-foreground">
              Leadership is private
            </p>
            <p className="text-meta text-muted-foreground">
              Without allow/view, members cannot see this space.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant={leadershipPrivate ? 'default' : 'outline'}
            className="shrink-0 rounded-control"
            disabled={!isAdmin}
            onClick={() => {
              void (async () => {
                const result = await setNodePrivate(
                  'space-leadership',
                  !leadershipPrivate,
                )
                if ('error' in result) {
                  notifyMutationError(result.error)
                  return
                }
                toastSuccess(
                  leadershipPrivate
                    ? 'Leadership is public'
                    : 'Leadership is private',
                )
              })()
            }}
          >
            <Lock className="size-3.5" aria-hidden />
            {leadershipPrivate ? 'Private' : 'Public'}
          </Button>
        </div>

        <div className="space-y-4">
          {members.map((user) => (
            <section key={user.id} className="space-y-2">
              <h3 className="text-meta font-medium uppercase tracking-wide text-slate-500">
                {user.name}
              </h3>
              <ul className="space-y-1.5">
                {GRANT_NODES.map((node) => {
                  const value = effectFor(user.id, node.id)
                  return (
                    <li
                      key={`${user.id}-${node.id}`}
                      className="grid grid-cols-[1fr_10rem] items-center gap-2"
                    >
                      <span className="min-w-0 truncate text-body text-foreground">
                        {node.label}
                      </span>
                      <Select
                        value={value}
                        onValueChange={(next) => {
                          void onEffectChange(user.id, node.id, next)
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            'h-8 rounded-control text-meta',
                            value === 'deny' && 'text-priority-urgent',
                            value === 'view' && 'text-priority-high',
                            value === 'allow' && 'text-status-done',
                          )}
                          aria-label={`Grant for ${user.name} on ${node.label}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-control">
                          {EFFECTS.map((effect) => (
                            <SelectItem
                              key={effect.value}
                              value={effect.value}
                              className="rounded-control text-meta"
                            >
                              {effect.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-control"
            onClick={() => {
              void onTryForbidden()
            }}
          >
            Try forbidden create on Sprint
          </Button>
          <p className="text-meta text-muted-foreground">
            As {currentUserId === 'user-bob' ? 'Bob' : 'current user'} — expects
            403 if Sprint is denied.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
