import { useMemo, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { indentWithTab } from '@codemirror/commands'
import { EditorState, Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { blockPaste } from '../engine/tracking'

interface Props {
  value: string
  onChange?: (value: string) => void
  onPasteAttempt?: () => void
  onRun?: () => void
  readOnly?: boolean
}

export default function Editor({ value, onChange, onPasteAttempt, onRun, readOnly = false }: Props) {
  // Extensions are built once, so callbacks go through refs to always see the latest props.
  const pasteRef = useRef(onPasteAttempt)
  const runRef = useRef(onRun)
  pasteRef.current = onPasteAttempt
  runRef.current = onRun

  const extensions = useMemo(
    () => [
      javascript(),
      // Tab indents instead of leaving the editor. Esc then Tab still moves focus out, for keyboard users.
      keymap.of([indentWithTab]),
      blockPaste(() => pasteRef.current?.()),
      // Highest precedence: the default keymap binds Mod-Enter to "insert blank line".
      Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => (runRef.current?.(), true) }])),
      EditorState.readOnly.of(readOnly),
      // Read-only snippets must be fully visible on narrow phones, so wrap instead of scrolling sideways.
      ...(readOnly ? [EditorView.lineWrapping] : []),
    ],
    [readOnly],
  )
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme="dark"
      height="100%"
      className="h-full"
      editable={!readOnly}
      extensions={extensions}
      basicSetup={{ autocompletion: false, completionKeymap: false, foldGutter: false }}
    />
  )
}
