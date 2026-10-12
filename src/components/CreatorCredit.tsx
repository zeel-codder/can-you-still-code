export const CREATOR = { name: 'ModuleZP', url: 'https://modulezp.com/' }

/** Small footer credit linking to the creator's site. */
export default function CreatorCredit({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-zinc-500 ${className}`}>
      Made with ☕ by{' '}
      <a
        href={CREATOR.url}
        target="_blank"
        rel="noopener"
        className="font-bold text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline"
      >
        {CREATOR.name}
      </a>
    </p>
  )
}
