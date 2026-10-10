import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from './TaskCard'
import { cn } from '@/view/ui/utils'

type SortableTaskCardProps = {
  taskId: string
  onOpen?: () => void
  showInsertionLine?: boolean
}

export function SortableTaskCard({
  taskId,
  onOpen,
  showInsertionLine = false,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskId,
    data: { type: 'task' as const, taskId },
  })

  return (
    <div
      ref={setNodeRef}
      // DND-STYLE-EXCEPTION
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="relative"
      {...attributes}
      {...listeners}
    >
      {showInsertionLine ? (
        <div
          className="absolute inset-x-0 -top-1 z-10 h-0.5 rounded-full bg-brand"
          aria-hidden
        />
      ) : null}
      <TaskCard
        taskId={taskId}
        onOpen={onOpen}
        className={cn(
          isDragging && 'opacity-40 ring-2 ring-brand/30',
          'cursor-grab active:cursor-grabbing',
        )}
      />
    </div>
  )
}
