import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useFlowStore } from '@/controller/store'
import { Input } from '@/view/ui/input'
import { cn } from '@/view/ui/utils'

const SEARCH_DEBOUNCE_MS = 200

type SearchInputProps = {
  disabled?: boolean
}

export function SearchInput({ disabled = false }: SearchInputProps) {
  const searchFocusNonce = useFlowStore((state) => state.searchFocusNonce)
  const searchQuery = useFlowStore((state) => state.searchQuery)
  const setSearchQuery = useFlowStore((state) => state.setSearchQuery)
  const selectedListId = useFlowStore((state) => state.selectedListId)
  const searchRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(searchQuery)
  const [focused, setFocused] = useState(false)
  const [synced, setSynced] = useState({
    searchQuery,
    selectedListId,
  })

  if (
    searchQuery !== synced.searchQuery ||
    selectedListId !== synced.selectedListId
  ) {
    setSynced({ searchQuery, selectedListId })
    setDraft(searchQuery)
  }

  useEffect(() => {
    if (searchFocusNonce > 0 && !disabled) {
      searchRef.current?.focus()
    }
  }, [searchFocusNonce, disabled])

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
    <div
      className={cn(
        'relative min-w-0 w-[13.75rem]',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={searchRef}
        type="text"
        value={draft}
        disabled={disabled}
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
        placeholder="Search this list"
        aria-label="Search tasks in current list"
        autoComplete="off"
        className={cn(
          'h-8 rounded-control border-border bg-muted/60 pl-8 pr-10 text-body shadow-none',
          'placeholder:text-muted-foreground/80',
          'focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/30',
        )}
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-badge border border-border bg-muted px-1 text-tiny text-muted-foreground">
        {hint}
      </kbd>
    </div>
  )
}
