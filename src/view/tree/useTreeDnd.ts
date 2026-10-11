import { useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { selectSiblings } from '@/controller/selectors'
import { getDefaultFlowStore, useFlowStore } from '@/controller/store'
import { notifyMutationError } from '@/view/feedback/toasts'

export function useTreeDnd() {
  const reorderContainer = useFlowStore((state) => state.reorderContainer)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const onDragEnd = (event: DragEndEvent) => {
    const draggingId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
    setActiveId(null)

    if (!overId || draggingId === overId) {
      return
    }

    const state = getDefaultFlowStore().getState()
    const activeNode = state.nodes[draggingId]
    const overNode = state.nodes[overId]
    if (!activeNode || !overNode) {
      return
    }
    if (activeNode.parentId !== overNode.parentId) {
      return
    }
    if (activeNode.archivedAt != null || overNode.archivedAt != null) {
      return
    }

    const siblings = selectSiblings(state, draggingId)
    const oldIndex = siblings.findIndex((node) => node.id === draggingId)
    const newIndex = siblings.findIndex((node) => node.id === overId)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
      return
    }

    const orderedIds = arrayMove(
      siblings.map((node) => node.id),
      oldIndex,
      newIndex,
    )
    const nextIndex = orderedIds.indexOf(draggingId)
    const afterId = nextIndex > 0 ? (orderedIds[nextIndex - 1] ?? null) : null
    const beforeId =
      nextIndex < orderedIds.length - 1
        ? (orderedIds[nextIndex + 1] ?? null)
        : null

    void (async () => {
      const result = await reorderContainer({
        nodeId: draggingId,
        afterId,
        beforeId,
      })
      if ('error' in result) {
        notifyMutationError(result.error)
      }
    })()
  }

  const onDragCancel = () => {
    setActiveId(null)
  }

  return {
    sensors,
    activeId,
    onDragStart,
    onDragEnd,
    onDragCancel,
  }
}
