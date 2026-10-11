import type { ComponentProps } from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = ComponentProps<typeof Sonner>

const Toaster = ({ theme = 'system', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:rounded-card group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-panel',
          description: 'group-[.toast]:text-meta group-[.toast]:text-muted-foreground',
          title: 'group-[.toast]:text-body group-[.toast]:font-medium',
          actionButton:
            'group-[.toast]:rounded-control group-[.toast]:bg-transparent group-[.toast]:text-brand group-[.toast]:shadow-none',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
