import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import { Button } from '@/view/ui/button'
import { Input } from '@/view/ui/input'

const SEARCH_DEBOUNCE_MS = 200

export function SearchInput() {
  const searchFocusNonce = useFlowStore((state) => state.searchFocusNonce)
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const setSearchQuery = useFlowStore((state) => state.setSearchQuery)
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const searchRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(searchQuery)

  useEffect(() => {
    setDraft(searchQuery)
  }, [searchQuery, selectedListId])

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

  const clearSearch = () => {
    setDraft('')
    setSearchQuery('')
    searchRef.current?.focus()
  }

  return (
    <div className="relative min-w-0 w-[13.75rem]">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={searchRef}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search tasks"
        aria-label="Search tasks"
        autoComplete="off"
        className="h-8 rounded-control border-border bg-background pl-8 pr-8 text-body"
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
  )
}
