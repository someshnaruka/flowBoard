import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/view/ui/alert-dialog'
import { buttonVariants } from '@/view/ui/button'
import { cn } from '@/view/ui/utils'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
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
  variant = 'destructive',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-drawer">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-drawer-title">{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-body text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-control">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              'rounded-control',
              buttonVariants({
                variant: variant === 'destructive' ? 'destructive' : 'default',
              }),
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
