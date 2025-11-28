import { useEffect, useRef } from 'react'

import { useEditor } from '@/contexts/EditorContext'

export function useAutoSave(delay = 2000) {
  const { isDirty, save } = useEditor()
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isDirty) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      save()
    }, delay)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [delay, isDirty, save])
}




