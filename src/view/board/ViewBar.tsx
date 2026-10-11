import { LayoutGrid, List, Plus } from 'lucide-react'
import {
  selectStatusesForList,
} from '@/controller/selectors'
import {
  getDefaultFlowStore,
  useFlowStore,
  type BoardView,
} from '@/controller/store'
import { notifyMutationError, toastError, toastSuccess } from '@/view/feedback/toasts'
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
  const createTask = useFlowStore((state) => state.createTask)

  const onAddTask = async () => {
    if (!listId) {
      return
    }

    const state = getDefaultFlowStore().getState()
    const statuses = selectStatusesForList(state, listId)
    const status =
      statuses.find((item) => item.category === 'todo') ?? statuses[0]

    if (!status) {
      toastError('This list has no statuses')
      return
    }

    const result = await createTask({
      listId,
      title: 'New task',
      statusId: status.id,
    })

    if ('error' in result) {
      notifyMutationError(result.error, {
        onRetry: () => {
          void onAddTask()
        },
      })
      return
    }

    toastSuccess('Task created')
  }

  return (
    <div className="flex h-view-bar shrink-0 items-center gap-3 border-b border-border px-4">
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
        className="rounded-control"
        aria-label="Board or list view"
      >
        <ToggleGroupItem
          value="board"
          aria-label="Board view"
          className="gap-1.5 rounded-control px-2.5 text-body data-[state=on]:bg-brand data-[state=on]:text-brand-foreground"
        >
          <LayoutGrid className="size-4" />
          Board
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="List view"
          className="gap-1.5 rounded-control px-2.5 text-body data-[state=on]:bg-brand data-[state=on]:text-brand-foreground"
        >
          <List className="size-4" />
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
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Create a task (C)</TooltipContent>
      </Tooltip>
    </div>
  )
}
