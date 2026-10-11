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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md gap-4 rounded-drawer p-6 shadow-panel">
        <AlertDialogHeader className="gap-2 space-y-0 text-left">
          <AlertDialogTitle className="text-drawer-title font-semibold text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-body text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:space-x-2">
          <AlertDialogCancel className="rounded-control border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              'gap-1.5 rounded-control',
              buttonVariants({
                variant: variant === 'destructive' ? 'destructive' : 'default',
              }),
            )}
            onClick={onConfirm}
          >
            {confirmIcon}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
