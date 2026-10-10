import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Task } from '@/model/types'
import { Button } from '@/view/ui/button'
import { Input } from '@/view/ui/input'

type DrawerSubtasksProps = {
  subtasks: Task[]
  disabled?: boolean
  onAdd: (title: string) => Promise<void>
  onOpen: (taskId: string) => void
}

export function DrawerSubtasks({
  subtasks,
  disabled,
  onAdd,
  onOpen,
}: DrawerSubtasksProps) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const title = draft.trim()
    if (!title || busy || disabled) {
      return
    }
    setBusy(true)
    try {
      await onAdd(title)
      setDraft('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-2 border-t border-border px-4 py-3">
      <h3 className="text-meta font-medium text-muted-foreground">
        Subtasks ({subtasks.length})
      </h3>
      <ul className="space-y-1">
        {subtasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onOpen(task.id)}
              className="flex h-8 w-full items-center rounded-control px-2 text-left text-body transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <span className="min-w-0 truncate">{task.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {!disabled ? (
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            placeholder="Add subtask"
            className="h-8 rounded-control text-body"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void submit()
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8 shrink-0 rounded-control"
            aria-label="Add subtask"
            disabled={!draft.trim() || busy}
            onClick={() => {
              void submit()
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      ) : null}
    </section>
  )
}
