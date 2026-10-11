import { useMemo, useState } from 'react'
import { Archive, ArrowDown, ArrowUp, MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { selectSiblings } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { NodeKind } from '@/model/types'
import { ConfirmDialog } from '@/view/ui/confirm-dialog'
import { Button } from '@/view/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/view/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { RenameDialog } from './RenameDialog'

const CHILD_KIND: Partial<Record<NodeKind, NodeKind>> = {
  workspace: 'space',
  space: 'folder',
  folder: 'list',
}

const CHILD_LABEL: Record<NodeKind, string> = {
  workspace: 'Workspace',
  space: 'Space',
  folder: 'Folder',
  list: 'List',
}

type TreeNodeMenuProps = {
  id: string
  name: string
  kind: NodeKind
  isShell?: boolean
}

export function TreeNodeMenu({
  id,
  name,
  kind,
  isShell = false,
}: TreeNodeMenuProps) {
  const createContainer = useFlowStore((state) => state.createContainer)
  const renameContainer = useFlowStore((state) => state.renameContainer)
  const archiveContainer = useFlowStore((state) => state.archiveContainer)
  const restoreContainer = useFlowStore((state) => state.restoreContainer)
  const reorderContainer = useFlowStore((state) => state.reorderContainer)
  const createTask = useFlowStore((state) => state.createTask)
  const nodesStamp = useFlowStore((state) =>
    Object.values(state.nodes)
      .map((node) => `${node.id}:${node.position}:${node.parentId}`)
      .join('\0'),
  )

  const siblings = useMemo(() => {
    void nodesStamp
    return selectSiblings(getDefaultFlowStore().getState(), id)
  }, [id, nodesStamp])

  const index = siblings.findIndex((node) => node.id === id)
  const childKind = CHILD_KIND[kind]
  const [renameOpen, setRenameOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  if (isShell) {
    return null
  }

  const onCreateChild = async () => {
    if (childKind) {
      const result = await createContainer({
        kind: childKind,
        name: `New ${CHILD_LABEL[childKind].toLowerCase()}`,
        parentId: id,
      })
      if ('error' in result) {
        toast.error(result.error.message)
        return
      }
      toast.success(`${CHILD_LABEL[childKind]} created`)
      return
    }

    if (kind === 'list') {
      const state = getDefaultFlowStore().getState()
      const status = Object.values(state.statuses)
        .filter((item) => item.listId === id)
        .sort((a, b) => a.position - b.position)[0]
      if (!status) {
        toast.error('This list has no statuses')
        return
      }
      const result = await createTask({
        listId: id,
        title: 'New task',
        statusId: status.id,
      })
      if ('error' in result) {
        toast.error(result.error.message)
        return
      }
      toast.success('Task created')
    }
  }

  const onMove = async (direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (index <= 0) {
        return
      }
      const result = await reorderContainer({
        nodeId: id,
        afterId: siblings[index - 2]?.id ?? null,
        beforeId: siblings[index - 1]?.id ?? null,
      })
      if ('error' in result) {
        toast.error(result.error.message)
      }
      return
    }

    if (index < 0 || index >= siblings.length - 1) {
      return
    }
    const result = await reorderContainer({
      nodeId: id,
      afterId: siblings[index + 1]?.id ?? null,
      beforeId: siblings[index + 2]?.id ?? null,
    })
    if ('error' in result) {
      toast.error(result.error.message)
    }
  }

  const onArchive = async () => {
    const result = await archiveContainer(id)
    if ('error' in result) {
      toast.error(result.error.message)
      return
    }

    toast.message(`Archived “${name}”`, {
      description: 'Descendants were archived too.',
      action: {
        label: 'Undo',
        onClick: () => {
          void (async () => {
            const restored = await restoreContainer(id)
            if ('error' in restored) {
              toast.error(restored.error.message)
              return
            }
            toast.success(`Restored “${name}”`)
          })()
        },
      },
    })
  }

  return (
    <>
      <div className="flex shrink-0 items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {(childKind || kind === 'list') && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 rounded-badge p-0"
                aria-label={`Add under ${name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  void onCreateChild()
                }}
              >
                <Plus className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {childKind
                ? `Add ${CHILD_LABEL[childKind].toLowerCase()}`
                : 'Add task'}
            </TooltipContent>
          </Tooltip>
        )}

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-5 rounded-badge p-0"
                  aria-label={`Menu for ${name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="rounded-control">
            {kind !== 'workspace' ? (
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                Rename
              </DropdownMenuItem>
            ) : null}
            {childKind ? (
              <DropdownMenuItem
                onClick={() => {
                  void onCreateChild()
                }}
              >
                Add {CHILD_LABEL[childKind].toLowerCase()}
              </DropdownMenuItem>
            ) : null}
            {kind !== 'workspace' ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={index <= 0}
                  onClick={() => {
                    void onMove('up')
                  }}
                >
                  <ArrowUp className="size-3.5" />
                  Move up
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={index < 0 || index >= siblings.length - 1}
                  onClick={() => {
                    void onMove('down')
                  }}
                >
                  <ArrowDown className="size-3.5" />
                  Move down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setArchiveOpen(true)}
                >
                  Archive
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title={`Rename ${CHILD_LABEL[kind].toLowerCase()}`}
        initialName={name}
        onSubmit={(nextName) => {
          void (async () => {
            const result = await renameContainer({ nodeId: id, name: nextName })
            if ('error' in result) {
              toast.error(result.error.message)
              return
            }
            toast.success('Renamed')
          })()
        }}
      />

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={`Archive “${name}”?`}
        description={
          <>
            This archives the {CHILD_LABEL[kind].toLowerCase()} and all nested
            spaces, folders, lists, and their tasks. You can restore it from
            Archived.
          </>
        }
        confirmLabel="Archive"
        confirmIcon={<Archive className="size-3.5" aria-hidden />}
        onConfirm={() => {
          void onArchive()
        }}
      />
    </>
  )
}
