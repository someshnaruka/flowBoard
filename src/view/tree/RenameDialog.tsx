import { useEffect, useState } from 'react'
import { Button } from '@/view/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/view/ui/dialog'
import { Input } from '@/view/ui/input'

type RenameDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initialName: string
  onSubmit: (name: string) => void
}

export function RenameDialog({
  open,
  onOpenChange,
  title,
  initialName,
  onSubmit,
}: RenameDialogProps) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) {
      setName(initialName)
    }
  }, [open, initialName])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-drawer sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-drawer-title">{title}</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Enter a new name (max 200 characters).
          </DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          maxLength={200}
          autoFocus
          className="rounded-control"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && name.trim()) {
              onSubmit(name.trim())
              onOpenChange(false)
            }
          }}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-control"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-control bg-brand text-brand-foreground hover:bg-brand-600"
            disabled={!name.trim()}
            onClick={() => {
              onSubmit(name.trim())
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
