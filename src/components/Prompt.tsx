/** Renders text with `backtick` spans as inline code. */
export default function Prompt({ text }: { text: string }) {
  return (
    <p className="leading-relaxed text-zinc-300">
      {text.split('`').map((part, i) =>
        i % 2 ? (
          <code key={i} className="rounded bg-zinc-800 px-1 py-0.5 text-emerald-300">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </p>
  )
}
