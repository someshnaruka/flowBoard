import { useEffect, useRef, useState } from 'react'
import type { SaveStatus } from '@/view/ui/save-indicator'

type AutosaveOptions<T> = {
  value: T
  enabled: boolean
  debounceMs?: number
  save: (value: T) => Promise<boolean>
}

export function useDebouncedAutosave<T>({
  value,
  enabled,
  debounceMs = 400,
  save,
}: AutosaveOptions<T>): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const firstRender = useRef(true)
  const latestSave = useRef(save)
  latestSave.current = save

  useEffect(() => {
    if (!enabled) {
      return
    }
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    setStatus('saving')
    const timer = window.setTimeout(() => {
      void (async () => {
        const ok = await latestSave.current(value)
        setStatus(ok ? 'saved' : 'error')
        if (ok) {
          window.setTimeout(() => setStatus('idle'), 1200)
        }
      })()
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [value, enabled, debounceMs])

  return status
}
