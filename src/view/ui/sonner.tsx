import type { ComponentProps } from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = ComponentProps<typeof Sonner>

const Toaster = ({ theme = 'system', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      expand
      visibleToasts={4}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group toast group-[.toaster]:flex group-[.toaster]:w-[356px] group-[.toaster]:items-start',
          description: 'group-[.toast]:text-meta',
          title: 'group-[.toast]:text-body',
          actionButton: 'group-[.toast]:rounded-control',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
