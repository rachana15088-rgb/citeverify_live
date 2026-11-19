import type { Verdict } from '@/lib/types'
import { VERDICTS } from '@/lib/verdicts'
import { cn } from '@/lib/utils'

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const meta = VERDICTS[verdict]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        meta.badgeClass,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dotClass)} aria-hidden="true" />
      <span className="sr-only">Verdict: </span>
      {meta.label}
    </span>
  )
}
