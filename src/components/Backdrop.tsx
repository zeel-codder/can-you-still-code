const FLOATERS = ['🤖', '💀', '🧠', '⌨️', '🗿', '🫠', '☕', '🐛']

/** Fixed animated background: panning grid plus a few slow-floating emoji. */
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(16_185_129/0.12),transparent_60%)]" />
      {FLOATERS.map((emoji, i) => (
        <span
          key={i}
          className="animate-float absolute text-2xl opacity-[0.07] sm:text-4xl"
          style={{ left: `${(i * 13 + 5) % 95}%`, animationDelay: `${-i * 1.9}s`, animationDuration: `${14 + (i % 4) * 4}s` }}
        >
          {emoji}
        </span>
      ))}
    </div>
  )
}
