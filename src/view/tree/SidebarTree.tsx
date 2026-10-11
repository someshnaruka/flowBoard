import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { selectVisibleTree } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { VisibleTreeNode } from '@/model/services/permission.service'
import { Skeleton } from '@/view/ui/skeleton'
import { ArchivedSection } from './ArchivedSection'
import { SortableTreeRow } from './SortableTreeRow'
import { TreeRow } from './TreeRow'
import { useTreeDnd } from './useTreeDnd'

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
}

function TreeNodes({
  nodes,
  depth,
  collapsedRail,
  expandedIds,
  selectedListId,
}: {
  nodes: VisibleTreeNode[]
  depth: number
  collapsedRail: boolean
  expandedIds: Set<string>
  selectedListId: string | null
}) {
  const toggleExpanded = useFlowStore((state) => state.toggleExpanded)
  const setSelectedListId = useFlowStore((state) => state.setSelectedListId)
  const sortableIds = nodes.map((item) => item.id)

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      {nodes.map((item) => {
        const isExpanded = expandedIds.has(item.id)
        const showChildren = isExpanded && item.children.length > 0

        return (
          <div key={item.id}>
            <SortableTreeRow
              id={item.id}
              name={item.node.name}
              kind={item.node.kind}
              depth={depth}
              isPrivate={item.node.isPrivate}
              isShell={item.isShell}
              isExpanded={isExpanded}
              isSelected={selectedListId === item.id}
              hasChildren={item.children.length > 0}
              collapsedRail={collapsedRail}
              onToggle={() => toggleExpanded(item.id)}
              onSelect={() => {
                if (item.node.kind === 'list') {
                  setSelectedListId(item.id)
                  return
                }
                if (item.children.length > 0) {
                  toggleExpanded(item.id)
                }
              }}
            />
            {showChildren && !collapsedRail ? (
              <TreeNodes
                nodes={item.children}
                depth={depth + 1}
                collapsedRail={collapsedRail}
                expandedIds={expandedIds}
                selectedListId={selectedListId}
              />
            ) : null}
          </div>
        )
      })}
    </SortableContext>
  )
}

function findTreeNode(
  nodes: VisibleTreeNode[],
  id: string,
): VisibleTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    const nested = findTreeNode(node.children, id)
    if (nested) {
      return nested
    }
  }
  return null
}

export function SidebarTree() {
  // Subscribe only to primitives / stable action refs. Reading immer object
  // slices (nodes, users, …) via useFlowStore can fail Object.is and loop.
  const currentUserId = useFlowStore((state) => state.currentUserId)
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const collapsedRail = useFlowStore((state) => state.sidebarCollapsed)
  const expandedKey = useFlowStore((state) => state.expandedNodeIds.join('\0'))
  const nodesStamp = useFlowStore((state) =>
    Object.values(state.nodes)
      .map(
        (node) =>
          `${node.id}:${node.name}:${node.position}:${node.parentId}:${node.archivedAt ?? ''}`,
      )
      .sort()
      .join('\0'),
  )

  const tree = useMemo(() => {
    void currentUserId
    void nodesStamp
    return selectVisibleTree(getDefaultFlowStore().getState())
  }, [currentUserId, nodesStamp])

  const expandedIds = useMemo(
    () => new Set(expandedKey.length > 0 ? expandedKey.split('\0') : []),
    [expandedKey],
  )

  const { sensors, activeId, onDragStart, onDragEnd, onDragCancel } =
    useTreeDnd()
  const activeNode = activeId ? findTreeNode(tree, activeId) : null

  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 280)
    return () => window.clearTimeout(timer)
  }, [])

  if (!ready) {
    return (
      <div
        className="flex flex-col gap-1"
        aria-busy="true"
        aria-label="Loading tree"
      >
        <Skeleton className="h-tree-row w-full rounded-control" />
        <Skeleton className="h-tree-row w-5/6 rounded-control" />
        <Skeleton className="h-tree-row w-4/5 rounded-control" />
        <Skeleton className="h-tree-row w-3/4 rounded-control" />
        <Skeleton className="h-tree-row w-2/3 rounded-control" />
      </div>
    )
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col">
        <p className="px-2 py-3 text-meta text-muted-foreground">
          No spaces visible for this user.
        </p>
        <ArchivedSection collapsedRail={collapsedRail} />
      </div>
    )
  }

  return (
    <nav aria-label="Workspace tree" className="flex flex-col gap-0.5">
      {!collapsedRail ? (
        <p className="px-2 pb-1 pt-1 text-meta font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Spaces
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <TreeNodes
          nodes={tree}
          depth={0}
          collapsedRail={collapsedRail}
          expandedIds={expandedIds}
          selectedListId={selectedListId}
        />
        <DragOverlay dropAnimation={dropAnimation}>
          {activeNode ? (
            <div className="rounded-control bg-background shadow-panel">
              <TreeRow
                id={activeNode.id}
                name={activeNode.node.name}
                kind={activeNode.node.kind}
                depth={0}
                isPrivate={activeNode.node.isPrivate}
                isShell={activeNode.isShell}
                isExpanded={false}
                isSelected={false}
                hasChildren={activeNode.children.length > 0}
                onToggle={() => undefined}
                onSelect={() => undefined}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <ArchivedSection collapsedRail={collapsedRail} />
    </nav>
  )
}
