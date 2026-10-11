import { useEffect, useMemo, useState } from 'react'
import { selectVisibleTree } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import type { VisibleTreeNode } from '@/model/services/permission.service'
import { Skeleton } from '@/view/ui/skeleton'
import { ArchivedSection } from './ArchivedSection'
import { TreeRow } from './TreeRow'

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

  return (
    <>
      {nodes.map((item) => {
        const isExpanded = expandedIds.has(item.id)
        const showChildren = isExpanded && item.children.length > 0

        return (
          <div key={item.id}>
            <TreeRow
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
    </>
  )
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
        <p className="px-2 pb-1 pt-1 text-meta font-medium uppercase tracking-wide text-muted-foreground">
          Spaces
        </p>
      ) : null}
      <TreeNodes
        nodes={tree}
        depth={0}
        collapsedRail={collapsedRail}
        expandedIds={expandedIds}
        selectedListId={selectedListId}
      />
      <ArchivedSection collapsedRail={collapsedRail} />
    </nav>
  )
}
