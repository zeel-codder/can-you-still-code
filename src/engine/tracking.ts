import { useEffect, useRef } from 'react'
import { EditorView } from '@codemirror/view'

/** Calls `onLeave` each time the window loses focus (switching tabs or apps). */
export function useWindowLeave(active: boolean, onLeave: () => void) {
  const cb = useRef(onLeave)
  cb.current = onLeave
  useEffect(() => {
    if (!active) return
    const handler = () => cb.current()
    window.addEventListener('blur', handler)
    return () => window.removeEventListener('blur', handler)
  }, [active])
}

/** Calls `onTick` once a second while `active` and the page is visible. */
export function useTicker(active: boolean, onTick: () => void) {
  const cb = useRef(onTick)
  cb.current = onTick
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') cb.current()
    }, 1000)
    return () => clearInterval(id)
  }, [active])
}

/** CodeMirror extension that blocks paste and drag-drop, reporting each attempt. */
export function blockPaste(onAttempt: () => void) {
  return EditorView.domEventHandlers({
    paste: (e) => {
      e.preventDefault()
      onAttempt()
      return true
    },
    drop: (e) => {
      e.preventDefault()
      onAttempt()
      return true
    },
  })
}
