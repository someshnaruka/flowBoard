import { useEffect, useMemo, useState } from 'react'
import { Box, Folder, LayoutList, Lock, Shield } from 'lucide-react'
import { selectEffectiveAccess } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { ContainerNode, GrantEffect, NodeKind } from '@/model/types'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { UserAvatar } from '@/view/ui/user-avatar'
import { cn } from '@/view/ui/utils'

const EFFECTS: Array<{
  value: GrantEffect
  label: string
  className: string
}> = [
  {
    value: 'allow',
    label: 'Read write',
    className: 'text-status-done',
  },
  {
    value: 'view',
    label: 'Read only',
    className: 'text-priority-high',
  },
  {
    value: 'deny',
    label: 'Hidden',
    className: 'text-priority-urgent',
  },
]

const KIND_ICON: Record<Exclude<NodeKind, 'workspace'>, typeof Folder> = {
  space: Box,
  folder: Folder,
  list: LayoutList,
}

const DEPTH_PAD = [
  'pl-0',
  'pl-3',
  'pl-6',
  'pl-9',
  'pl-12',
] as const

type FlatGrantNode = {
  id: string
  name: string
  kind: Exclude<NodeKind, 'workspace'>
  depth: number
  isPrivate: boolean
  parentId: string | null
}

function flattenGrantNodes(
  nodes: Record<string, ContainerNode>,
): FlatGrantNode[] {
  const roots = Object.values(nodes)
    .filter((node) => node.kind === 'workspace' && node.archivedAt == null)
    .sort((a, b) => a.position - b.position)

  const out: FlatGrantNode[] = []

  const walk = (parentId: string, depth: number) => {
    const children = Object.values(nodes)
      .filter(
        (node) =>
          node.parentId === parentId &&
          node.archivedAt == null &&
          node.kind !== 'workspace',
      )
      .sort((a, b) => a.position - b.position)

    for (const child of children) {
      out.push({
        id: child.id,
        name: child.name,
        kind: child.kind as Exclude<NodeKind, 'workspace'>,
        depth,
        isPrivate: child.isPrivate,
        parentId: child.parentId,
      })
      walk(child.id, depth + 1)
    }
  }

  for (const root of roots) {
    walk(root.id, 0)
  }
  return out
}

/** Read only / Hidden on a parent locks all descendants to the same access. */
function isRestricting(effect: GrantEffect | undefined): effect is 'view' | 'deny' {
  return effect === 'view' || effect === 'deny'
}

function cascadeDrafts(
  nodes: FlatGrantNode[],
  drafts: Record<string, GrantEffect>,
  nodeId: string,
  effect: GrantEffect,
): Record<string, GrantEffect> {
  const next = { ...drafts, [nodeId]: effect }
  const byParent = new Map<string, string[]>()
  for (const node of nodes) {
    if (!node.parentId) {
      continue
    }
    const list = byParent.get(node.parentId) ?? []
    list.push(node.id)
    byParent.set(node.parentId, list)
  }

  const queue = [nodeId]
  while (queue.length > 0) {
    const id = queue.shift()!
    for (const childId of byParent.get(id) ?? []) {
      // RO/Hidden locks children; unlocking parent resets children to read write.
      next[childId] = isRestricting(effect) ? effect : 'allow'
      queue.push(childId)
    }
  }

  return next
}

/** Nearest ancestor draft that is read only or hidden. */
function restrictingAncestor(
  nodes: FlatGrantNode[],
  drafts: Record<string, GrantEffect>,
  nodeId: string,
): 'view' | 'deny' | null {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  let current = byId.get(nodeId)?.parentId ?? null
  while (current) {
    const effect = drafts[current]
    if (isRestricting(effect)) {
      return effect
    }
    current = byId.get(current)?.parentId ?? null
  }
  return null
}

type GrantsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GrantsDialog({ open, onOpenChange }: GrantsDialogProps) {
  const isAdmin = useFlowStore(
    (state) => state.users[state.currentUserId]?.role === 'admin',
  )
  const upsertGrant = useFlowStore((state) => state.upsertGrant)
  const setNodePrivate = useFlowStore((state) => state.setNodePrivate)

  const grantsStamp = useFlowStore((state) =>
    Object.values(state.grants)
      .map((grant) => `${grant.id}:${grant.userId}:${grant.nodeId}:${grant.effect}`)
      .sort()
      .join('\0'),
  )
  const nodesStamp = useFlowStore((state) =>
    Object.values(state.nodes)
      .map(
        (node) =>
          `${node.id}:${node.name}:${node.kind}:${node.isPrivate}:${node.archivedAt ?? ''}:${node.parentId ?? ''}:${node.position}`,
      )
      .sort()
      .join('\0'),
  )

  const { members, grantNodes, spaces, accessFor, hasDirectGrant } = useMemo(() => {
    void grantsStamp
    void nodesStamp
    const state = getDefaultFlowStore().getState()
    const members = Object.values(state.users)
      .filter((user) => user.role === 'member')
      .sort((a, b) => a.name.localeCompare(b.name))

    const spaces = Object.values(state.nodes)
      .filter((node) => node.kind === 'space' && node.archivedAt == null)
      .sort((a, b) => a.position - b.position)

    const accessFor = (userId: string, nodeId: string): GrantEffect =>
      selectEffectiveAccess(state, userId, nodeId)

    const hasDirectGrant = (userId: string, nodeId: string): boolean =>
      Object.values(state.grants).some(
        (grant) => grant.userId === userId && grant.nodeId === nodeId,
      )

    return {
      members,
      grantNodes: flattenGrantNodes(state.nodes),
      spaces,
      accessFor,
      hasDirectGrant,
    }
  }, [grantsStamp, nodesStamp])

  const [userId, setUserId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, GrantEffect>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setUserId(null)
      setDrafts({})
      setSaving(false)
    }
  }, [open])

  useEffect(() => {
    if (userId && !members.some((member) => member.id === userId)) {
      setUserId(null)
      setDrafts({})
    }
  }, [members, userId])

  useEffect(() => {
    if (!userId) {
      setDrafts({})
      return
    }
    // Seed from effective access, then cascade parent RO/Hidden onto children.
    let next: Record<string, GrantEffect> = {}
    for (const node of grantNodes) {
      next[node.id] = accessFor(userId, node.id)
    }
    for (const node of grantNodes) {
      if (isRestricting(next[node.id])) {
        next = cascadeDrafts(grantNodes, next, node.id, next[node.id])
      }
    }
    setDrafts(next)
  }, [userId, grantNodes, accessFor, grantsStamp])

  const selectedUser = members.find((member) => member.id === userId) ?? null

  const dirty = useMemo(() => {
    if (!userId) {
      return false
    }
    return grantNodes.some((node) => {
      const locked = restrictingAncestor(grantNodes, drafts, node.id)
      if (locked) {
        // Child grants must be cleared so parent RO/Hidden actually inherits.
        return hasDirectGrant(userId, node.id)
      }
      return drafts[node.id] !== accessFor(userId, node.id)
    })
  }, [userId, grantNodes, drafts, accessFor, hasDirectGrant])

  const onDraftChange = (nodeId: string, effect: GrantEffect) => {
    setDrafts((current) => cascadeDrafts(grantNodes, current, nodeId, effect))
  }

  const onUpdate = async () => {
    if (!userId || !dirty || !isAdmin) {
      return
    }
    setSaving(true)
    for (const node of grantNodes) {
      const locked = restrictingAncestor(grantNodes, drafts, node.id)
      if (locked) {
        if (hasDirectGrant(userId, node.id)) {
          const result = await upsertGrant({
            userId,
            nodeId: node.id,
            effect: null,
          })
          if ('error' in result) {
            setSaving(false)
            notifyMutationError(result.error)
            return
          }
        }
        continue
      }

      const desired = drafts[node.id] ?? 'allow'
      if (desired === accessFor(userId, node.id)) {
        continue
      }
      const result = await upsertGrant({
        userId,
        nodeId: node.id,
        effect: desired,
      })
      if ('error' in result) {
        setSaving(false)
        notifyMutationError(result.error)
        return
      }
    }
    setSaving(false)
    toastSuccess('Access updated')
  }

  const toggleSpacePrivate = async (space: ContainerNode) => {
    const result = await setNodePrivate(space.id, !space.isPrivate)
    if ('error' in result) {
      notifyMutationError(result.error)
      return
    }
    toastSuccess(
      space.isPrivate
        ? `${space.name} is public`
        : `${space.name} is private`,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden rounded-drawer p-0">
        <DialogHeader className="space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-page-title">
            <Shield className="size-5 text-brand" aria-hidden />
            Access Management
          </DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Choose a member, set access, then update. Read only or Hidden on a
            parent applies to all children. Public defaults to read write.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-6 py-4">
          <section className="space-y-2">
            <h3 className="text-meta font-medium uppercase tracking-wide text-muted-foreground">
              Space privacy
            </h3>
            <ul className="space-y-1.5">
              {spaces.map((space) => (
                <li
                  key={space.id}
                  className="flex items-center justify-between gap-3 rounded-control border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-body font-medium text-foreground">
                      {space.name}
                    </p>
                    <p className="text-meta text-muted-foreground">
                      {space.isPrivate
                        ? 'Private — members need read access'
                        : 'Public — visible unless hidden by a grant'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={space.isPrivate ? 'default' : 'outline'}
                    className="shrink-0 rounded-control"
                    disabled={!isAdmin}
                    onClick={() => {
                      void toggleSpacePrivate(space)
                    }}
                  >
                    <Lock className="size-3.5" aria-hidden />
                    {space.isPrivate ? 'Private' : 'Public'}
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <label
              htmlFor="access-member"
              className="text-meta font-medium uppercase tracking-wide text-muted-foreground"
            >
              Member
            </label>
            <Select
              value={userId ?? undefined}
              onValueChange={(next) => setUserId(next)}
            >
              <SelectTrigger
                id="access-member"
                className="h-9 rounded-control text-body"
              >
                <SelectValue placeholder="Select a member…" />
              </SelectTrigger>
              <SelectContent className="rounded-control">
                {members.map((member) => (
                  <SelectItem
                    key={member.id}
                    value={member.id}
                    className="rounded-control"
                  >
                    <span className="flex items-center gap-2">
                      <UserAvatar
                        name={member.name}
                        avatarUrl={member.avatarUrl}
                        size="sm"
                        className="size-5 text-tiny"
                      />
                      <span>{member.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {selectedUser ? (
            <section className="space-y-2">
              <h3 className="text-meta font-medium uppercase tracking-wide text-muted-foreground">
                Access for {selectedUser.name}
              </h3>
              <ul className="space-y-1.5">
                {grantNodes.map((node) => {
                  const Icon = KIND_ICON[node.kind]
                  const lockedBy = restrictingAncestor(
                    grantNodes,
                    drafts,
                    node.id,
                  )
                  const value = lockedBy ?? drafts[node.id] ?? 'allow'
                  const locked = lockedBy != null

                  const select = (
                    <Select
                      value={value}
                      disabled={locked}
                      onValueChange={(next) => {
                        onDraftChange(node.id, next as GrantEffect)
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-8 rounded-control text-meta',
                          value === 'deny' && 'text-priority-urgent',
                          value === 'view' && 'text-priority-high',
                          value === 'allow' && 'text-status-done',
                          locked && 'opacity-70',
                        )}
                        aria-label={`Access for ${selectedUser.name} on ${node.name}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-control">
                        {EFFECTS.map((effect) => (
                          <SelectItem
                            key={effect.value}
                            value={effect.value}
                            className={cn(
                              'rounded-control text-meta',
                              effect.className,
                            )}
                          >
                            {effect.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )

                  return (
                    <li
                      key={node.id}
                      className={cn(
                        'grid grid-cols-[minmax(0,1fr)_9.5rem] items-center gap-2',
                        DEPTH_PAD[Math.min(node.depth, DEPTH_PAD.length - 1)],
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5 text-body text-foreground">
                        <Icon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="min-w-0 truncate">{node.name}</span>
                        {node.isPrivate ? (
                          <Lock
                            className="size-3 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        ) : null}
                      </span>
                      {locked ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>{select}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Inherited from parent (
                            {lockedBy === 'view' ? 'Read only' : 'Hidden'})
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        select
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-control"
                  disabled={!dirty || saving}
                  onClick={() => {
                    if (!userId) {
                      return
                    }
                    let next: Record<string, GrantEffect> = {}
                    for (const node of grantNodes) {
                      next[node.id] = accessFor(userId, node.id)
                    }
                    for (const node of grantNodes) {
                      if (isRestricting(next[node.id])) {
                        next = cascadeDrafts(
                          grantNodes,
                          next,
                          node.id,
                          next[node.id],
                        )
                      }
                    }
                    setDrafts(next)
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  className="rounded-control"
                  disabled={!dirty || saving || !isAdmin}
                  onClick={() => {
                    void onUpdate()
                  }}
                >
                  {saving ? 'Updating…' : 'Update access'}
                </Button>
              </div>
            </section>
          ) : (
            <p className="rounded-control border border-dashed border-border px-3 py-6 text-center text-meta text-muted-foreground">
              Select a member to manage their access.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
