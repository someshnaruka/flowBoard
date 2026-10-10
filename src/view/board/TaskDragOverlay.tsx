import { TaskCard } from './TaskCard'

type TaskDragOverlayProps = {
  taskId: string
}

export function TaskDragOverlay({ taskId }: TaskDragOverlayProps) {
  return (
    <div className="w-column rotate-1 scale-[1.02] shadow-drawer">
      <TaskCard taskId={taskId} className="pointer-events-none cursor-grabbing" />
    </div>
  )
}
