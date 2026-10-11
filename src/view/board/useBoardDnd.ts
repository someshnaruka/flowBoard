import { useEffect, useMemo, useRef, useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useFlowStore } from '@/controller/store'
import type { Status, Task } from '@/model/types'
import { notifyMutationError } from '@/view/feedback/toasts'
import {
  buildColumnItems,
  createBoardCollisionDetection,
  findContainer,
  neighborsForIndex,
  type ColumnItems,
} from './board-dnd'

function moveAcrossContainers(
  items: ColumnItems,
  activeId: string,
  overId: string,
  activeRectTop: number | undefined,
  overRect: { top: number; height: number } | undefined,
): ColumnItems {
  const activeContainer = findContainer(items, activeId)
  const overContainer = findContainer(items, overId)
  if (!activeContainer || !overContainer || activeContainer === overContainer) {
    return items
  }

  const activeItems = items[activeContainer] ?? []
  const overItems = items[overContainer] ?? []
  const activeIndex = activeItems.indexOf(activeId)
  if (activeIndex < 0) {
    return items
  }

  let newIndex: number
  if (overId in items) {
    newIndex = overItems.length
  } else {
    const overIndex = overItems.indexOf(overId)
    const isBelowOverItem =
      activeRectTop != null &&
      overRect != null &&
      activeRectTop > overRect.top + overRect.height
    newIndex =
      overIndex >= 0 ? overIndex + (isBelowOverItem ? 1 : 0) : overItems.length
  }

  return {
    ...items,
    [activeContainer]: activeItems.filter((id) => id !== activeId),
    [overContainer]: [
      ...overItems.slice(0, newIndex),
      activeId,
      ...overItems.slice(newIndex),
    ],
  }
}

function reorderWithinContainer(
  items: ColumnItems,
  containerId: string,
  activeId: string,
  overId: string,
): ColumnItems {
  const list = items[containerId] ?? []
  const oldIndex = list.indexOf(activeId)
  const newIndex = overId in items ? list.length - 1 : list.indexOf(overId)
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
    return items
  }
  return {
    ...items,
    [containerId]: arrayMove(list, oldIndex, newIndex),
  }
}

export function useBoardDnd(
  statuses: Status[],
  tasksByStatus: Map<string, Task[]>,
) {
  const placeTask = useFlowStore((state) => state.placeTask)
  const [columns, setColumns] = useState<ColumnItems>(() =>
    buildColumnItems(statuses, tasksByStatus),
  )
  const columnsRef = useRef(columns)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  useEffect(() => {
    if (activeId) {
      return
    }
    const next = buildColumnItems(statuses, tasksByStatus)
    columnsRef.current = next
    setColumns(next)
  }, [activeId, statuses, tasksByStatus])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const syncColumns = (next: ColumnItems) => {
    columnsRef.current = next
    setColumns(next)
  }

  const resetColumnsFromStore = () => {
    syncColumns(buildColumnItems(statuses, tasksByStatus))
  }

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
    setOverId(String(event.active.id))
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      setOverId(null)
      return
    }

    const activeTaskId = String(active.id)
    const overKey = String(over.id)
    setOverId(overKey)

    const next = moveAcrossContainers(
      columnsRef.current,
      activeTaskId,
      overKey,
      active.rect.current.translated?.top,
      over.rect,
    )
    if (next !== columnsRef.current) {
      syncColumns(next)
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const draggedId = String(active.id)

    if (!over) {
      setActiveId(null)
      setOverId(null)
      resetColumnsFromStore()
      return
    }

    const overKey = String(over.id)
    let next = columnsRef.current
    const activeContainer = findContainer(next, draggedId)
    const overContainer = findContainer(next, overKey)

    if (!activeContainer || !overContainer) {
      setActiveId(null)
      setOverId(null)
      resetColumnsFromStore()
      return
    }

    if (activeContainer === overContainer) {
      next = reorderWithinContainer(next, activeContainer, draggedId, overKey)
      syncColumns(next)
    }

    const statusId = findContainer(next, draggedId)
    const ordered = statusId ? (next[statusId] ?? []) : []
    const index = ordered.indexOf(draggedId)

    setActiveId(null)
    setOverId(null)

    if (!statusId || index < 0) {
      resetColumnsFromStore()
      return
    }

    const { afterId, beforeId } = neighborsForIndex(ordered, index)
    const input = {
      taskId: draggedId,
      statusId,
      afterId,
      beforeId,
    }

    const persistPlace = async () => {
      const result = await placeTask(input)
      if ('error' in result) {
        resetColumnsFromStore()
        notifyMutationError(result.error, {
          onRetry: () => {
            void persistPlace()
          },
        })
      }
    }

    await persistPlace()
  }

  const onDragCancel = () => {
    setActiveId(null)
    setOverId(null)
    resetColumnsFromStore()
  }

  const collisionDetection = useMemo(
    () => createBoardCollisionDetection(columns),
    [columns],
  )

  return {
    columns,
    activeId,
    overId,
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    highlightedContainer: overId ? findContainer(columns, overId) : null,
  }
}
