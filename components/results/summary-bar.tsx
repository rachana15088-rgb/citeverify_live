import type { ClaimResult, Verdict } from '@/lib/types'
import { VERDICTS } from '@/lib/verdicts'
import { cn } from '@/lib/utils'

const SUMMARY_VERDICTS: Verdict[] = [
  'supported',
  'partly_supported',
  'unsupported',
  'contradictory',
  'possibly_outdated',
  'reference_not_found',
  'needs_human_review',
]

export function matchesVerdictFilter(claim: ClaimResult, verdict: Verdict) {
  if (verdict === 'needs_human_review') {
    return claim.verdict === 'needs_human_review' || claim.flags.includes('needs_human_review')
  }
  return claim.verdict === verdict
}

export function SummaryBar({
  results,
  activeVerdict,
  onSelect,
}: {
  results: ClaimResult[]
  activeVerdict: Verdict | null
  onSelect: (verdict: Verdict | null) => void
}) {
  const counts = Object.fromEntries(
    SUMMARY_VERDICTS.map((v) => [v, results.filter((c) => matchesVerdictFilter(c, v)).length]),
  ) as Record<Verdict, number>

  return (
    <section aria-labelledby="verdict-summary-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2
          id="verdict-summary-heading"
          className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase"
        >
          Filter by verdict
        </h2>
        {activeVerdict && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Show all {results.length} claims
          </button>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {SUMMARY_VERDICTS.map((verdict) => {
          const meta = VERDICTS[verdict]
          const count = counts[verdict] ?? 0
          const isActive = activeVerdict === verdict
          return (
            <li key={verdict}>
              <button
                type="button"
                aria-pressed={isActive}
                aria-label={`${meta.label}: ${count} ${count === 1 ? 'claim' : 'claims'}`}
                onClick={() => onSelect(isActive ? null : verdict)}
                className={cn(
                  'glass flex h-full w-full flex-col items-start gap-1 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  isActive && 'border-primary ring-2 ring-primary/60',
                  activeVerdict && !isActive && 'opacity-60',
                )}
              >
                <span className={cn('font-display text-3xl font-bold tabular-nums', meta.textClass)}>
                  {count}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn('size-1.5 rounded-full', meta.dotClass)} aria-hidden="true" />
                  {meta.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
