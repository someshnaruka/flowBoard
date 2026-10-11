import { LayoutGrid, List, Plus } from 'lucide-react'
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
    <div className="flex h-view-bar shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <h1 className="min-w-0 truncate text-page-title tracking-tight text-foreground">
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
        size="sm"
        className="h-7 shrink-0 gap-0 rounded-control bg-muted p-0.5"
        aria-label="Board or list view"
      >
        <ToggleGroupItem
          value="board"
          aria-label="Board view"
          className="h-6 gap-1.5 rounded-badge px-2.5 text-body text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:hover:bg-background"
        >
          <LayoutGrid className="size-3.5" />
          Board
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="List view"
          className="h-6 gap-1.5 rounded-badge px-2.5 text-body text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:hover:bg-background"
        >
          <List className="size-3.5" />
          List
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="min-w-0 flex-1" />

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
