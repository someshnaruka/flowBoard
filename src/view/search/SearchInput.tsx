import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import { Input } from '@/view/ui/input'
import { cn } from '@/view/ui/utils'

const SEARCH_DEBOUNCE_MS = 200

export function SearchInput() {
  const searchFocusNonce = useFlowStore((state) => state.searchFocusNonce)
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const setSearchQuery = useFlowStore((state) => state.setSearchQuery)
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const searchRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(searchQuery)
  const [focused, setFocused] = useState(false)

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

  const hint = draft || focused ? 'esc' : '/'

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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            if (draft) {
              clearSearch()
            } else {
              searchRef.current?.blur()
            }
          }
        }}
        placeholder="Search tasks"
        aria-label="Search tasks"
        autoComplete="off"
        className={cn(
          'h-8 rounded-control border-border bg-background pl-8 pr-10 text-body',
          'focus-visible:border-brand focus-visible:ring-brand/30',
        )}
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-badge border border-border bg-muted px-1 text-[10px] leading-4 text-muted-foreground">
        {hint}
      </kbd>
    </div>
  )
}
