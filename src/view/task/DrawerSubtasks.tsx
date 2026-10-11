import { useState } from 'react'
import { Check, Plus, Square, Trash2 } from 'lucide-react'
import type { Status, Task } from '@/model/types'
import { Button } from '@/view/ui/button'
import { ConfirmDialog } from '@/view/ui/confirm-dialog'
import { Input } from '@/view/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/view/ui/tooltip'
import { cn } from '@/view/ui/utils'

type DrawerSubtasksProps = {
  subtasks: Task[]
  statuses: Status[]
  disabled?: boolean
  onAdd: (title: string) => Promise<void>
  onOpen: (taskId: string) => void
  onToggleDone: (taskId: string, done: boolean) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

export function DrawerSubtasks({
  subtasks,
  statuses,
  disabled,
  onAdd,
  onOpen,
  onToggleDone,
  onDelete,
}: DrawerSubtasksProps) {
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null)

  const doneCount = subtasks.filter((task) => {
    const status = statuses.find((item) => item.id === task.statusId)
    return status?.category === 'done'
  }).length

  const submit = async () => {
    const title = draft.trim()
    if (!title || busy || disabled) {
      return
    }
    setBusy(true)
    try {
      await onAdd(title)
      setDraft('')
      setAdding(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-2 px-6 py-3">
      <h3 className="text-meta font-medium text-slate-600 dark:text-slate-300">
        Subtasks · {doneCount}/{subtasks.length}
      </h3>
      <ul className="space-y-0.5">
        {subtasks.map((task) => {
          const status = statuses.find((item) => item.id === task.statusId)
          const done = status?.category === 'done'
          return (
            <li
              key={task.id}
              className="group flex h-8 items-center gap-1 rounded-control"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-control"
                aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                disabled={disabled}
                onClick={() => {
                  void onToggleDone(task.id, !done)
                }}
              >
                {done ? (
                  <Check className="size-3.5 text-status-done" aria-hidden />
                ) : (
                  <Square className="size-3.5 text-muted-foreground" aria-hidden />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpen(task.id)}
                className={cn(
                  'h-8 min-w-0 flex-1 justify-start truncate rounded-control px-1 text-left text-body font-normal shadow-none',
                  done
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground',
                )}
              >
                {task.title}
              </Button>
              {!disabled ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 rounded-control text-muted-foreground opacity-0 transition-opacity duration-150 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label={`Delete subtask ${task.title}`}
                      onClick={() => setPendingDelete(task)}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Delete subtask</TooltipContent>
                </Tooltip>
              ) : null}
            </li>
          )
        })}
      </ul>
      {!disabled ? (
        adding ? (
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              placeholder="Add subtask"
              autoFocus
              className="h-8 rounded-control text-body"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void submit()
                }
                if (event.key === 'Escape') {
                  setDraft('')
                  setAdding(false)
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 gap-1 rounded-control px-2 text-body text-brand hover:bg-brand-50 hover:text-brand"
              disabled={!draft.trim() || busy}
              onClick={() => {
                void submit()
              }}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="h-8 justify-start gap-1 rounded-control px-1 text-body text-brand shadow-none hover:bg-brand-50 hover:text-brand"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-3.5" />
            Add subtask
          </Button>
        )
      ) : null}

      <ConfirmDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
          }
        }}
        title={`Delete “${pendingDelete?.title ?? 'subtask'}”?`}
        description="This permanently deletes the subtask. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!pendingDelete) {
            return
          }
          const id = pendingDelete.id
          setPendingDelete(null)
          void onDelete(id)
        }}
      />
    </section>
  )
}
