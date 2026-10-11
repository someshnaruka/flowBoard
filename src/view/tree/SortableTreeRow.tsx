import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/view/ui/utils'
import { TreeRow, type TreeRowProps } from './TreeRow'

type SortableTreeRowProps = TreeRowProps & {
  disabled?: boolean
}

export function SortableTreeRow({
  disabled = false,
  ...props
}: SortableTreeRowProps) {
  const sortableDisabled =
    disabled || props.isShell || Boolean(props.collapsedRail)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
    disabled: sortableDisabled,
  })

  return (
    <div
      ref={setNodeRef}
      // DND-STYLE-EXCEPTION
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'group/tree-row relative',
        isDragging && 'z-10 opacity-50',
      )}
    >
      {!sortableDisabled ? (
        <button
          type="button"
          className={cn(
            'absolute left-0 top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center rounded-badge',
            'cursor-grab text-muted-foreground opacity-0 transition-opacity duration-150',
            'hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            'group-hover/tree-row:opacity-100 active:cursor-grabbing',
          )}
          aria-label={`Reorder ${props.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
      ) : null}
      <TreeRow {...props} />
    </div>
  )
}
