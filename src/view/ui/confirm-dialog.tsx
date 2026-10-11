import type { ReactNode } from 'react'
import { Button } from '@/view/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/view/ui/dialog'
import { cn } from '@/view/ui/utils'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Optional leading icon inside the confirm button (Figma archive/delete). */
  confirmIcon?: ReactNode
  /** Visual tone for the confirm action. */
  variant?: 'default' | 'destructive'
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmIcon,
  variant = 'destructive',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'z-[100] max-w-md gap-4 rounded-drawer border-border p-6 shadow-panel',
          // Hide the default Dialog X — Cancel / Esc / overlay cover dismiss.
          '[&>button.absolute]:hidden',
        )}
        onOpenAutoFocus={(event) => {
          // Prefer Cancel so destructive confirm isn't accidentally activated.
          event.preventDefault()
          const root = event.currentTarget
          if (!(root instanceof HTMLElement)) {
            return
          }
          root
            .querySelector<HTMLButtonElement>('[data-confirm-cancel]')
            ?.focus()
        }}
      >
        <DialogHeader className="gap-2 space-y-0 text-left">
          <DialogTitle className="text-drawer-title font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-body text-muted-foreground">{description}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-2">
          <Button
            type="button"
            variant="ghost"
            data-confirm-cancel
            className="rounded-control border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className="gap-1.5 rounded-control"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmIcon}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
