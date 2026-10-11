import { useEffect, useRef, useState } from 'react'
import { LayoutGrid, List, Plus, Search, X } from 'lucide-react'
import { useFlowStore, type BoardView } from '@/controller/store'
import { notifyMutationError, toastSuccess } from '@/view/feedback/toasts'
import { Button } from '@/view/ui/button'
import { Input } from '@/view/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/view/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'

type ViewBarProps = {
  listId: string | null
}

const SEARCH_DEBOUNCE_MS = 200

export function ViewBar({ listId }: ViewBarProps) {
  const view = useFlowStore((state) => state.view)
  const setView = useFlowStore((state) => state.setView)
  const createDefaultTask = useFlowStore((state) => state.createDefaultTask)
  const openDrawer = useFlowStore((state) => state.openDrawer)
  const searchFocusNonce = useFlowStore((state) => state.searchFocusNonce)
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const setSearchQuery = useFlowStore((state) => state.setSearchQuery)
  const searchRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(searchQuery)

  useEffect(() => {
    setDraft(searchQuery)
  }, [searchQuery, listId])

  useEffect(() => {
    if (searchFocusNonce > 0) {
      searchRef.current?.focus()
    }
  }, [searchFocusNonce])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draft !== searchQuery) {
        setSearchQuery(draft)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [draft, searchQuery, setSearchQuery])

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

  const clearSearch = () => {
    setDraft('')
    setSearchQuery('')
    searchRef.current?.focus()
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

      <div className="relative min-w-0 max-w-xs flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={searchRef}
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="h-8 rounded-control pl-8 pr-8 text-body"
        />
        {draft ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2 rounded-control"
            aria-label="Clear search"
            onClick={clearSearch}
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </div>

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
