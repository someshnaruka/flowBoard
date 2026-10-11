import { Filter, LayoutGrid, List, Plus } from 'lucide-react'
import { useFlowStore, type BoardView } from '@/controller/store'
import { notifyMutationError, toastSuccess } from '@/view/feedback/toasts'
import { Button } from '@/view/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/view/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'

type ViewBarProps = {
  listId: string | null
}

export function ViewBar({ listId }: ViewBarProps) {
  const view = useFlowStore((state) => state.view)
  const setView = useFlowStore((state) => state.setView)
  const createDefaultTask = useFlowStore((state) => state.createDefaultTask)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const listName = useFlowStore((state) =>
    listId ? (state.nodes[listId]?.name ?? 'List') : 'List',
  )

  const onAddTask = async () => {
    if (!listId) {
      return
    }

    const result = await createDefaultTask()
    if ('error' in result) {
      notifyMutationError(result.error, {
        onRetry: () => {
          void onAddTask()
        },
      })
      return
    }

    toastSuccess('Task created')
    openDrawer(result.data.id)
  }

  return (
    <div className="flex h-view-bar shrink-0 items-center gap-3 border-b border-border px-4">
      <h1 className="min-w-0 truncate text-page-title text-foreground">
        {listName}
      </h1>

      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(value) => {
          if (value === 'board' || value === 'list') {
            setView(value as BoardView)
          }
        }}
        variant="outline"
        size="sm"
        className="shrink-0 rounded-control"
        aria-label="Board or list view"
      >
        <ToggleGroupItem
          value="board"
          aria-label="Board view"
          className="gap-1.5 rounded-control px-2.5 text-body data-[state=on]:bg-brand data-[state=on]:text-brand-foreground data-[state=on]:hover:bg-brand-600"
        >
          <LayoutGrid className="size-4" />
          Board
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="List view"
          className="gap-1.5 rounded-control px-2.5 text-body data-[state=on]:bg-brand data-[state=on]:text-brand-foreground data-[state=on]:hover:bg-brand-600"
        >
          <List className="size-4" />
          List
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="min-w-0 flex-1" />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 rounded-control text-body"
        disabled
        aria-label="Filter (coming soon)"
      >
        <Filter className="size-3.5" />
        Filter
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 rounded-control bg-brand text-brand-foreground hover:bg-brand-600"
            disabled={!listId}
            onClick={() => {
              void onAddTask()
            }}
          >
            <Plus className="size-4" />
            Task
            <kbd className="ml-0.5 rounded-badge bg-brand-foreground/15 px-1 text-[10px] leading-4 text-brand-foreground">
              C
            </kbd>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Create a task (C)</TooltipContent>
      </Tooltip>
    </div>
  )
}
