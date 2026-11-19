import type { ReviewStatus, Verdict } from '@/lib/types'

export interface VerdictMeta {
  label: string
  badgeClass: string
  dotClass: string
  textClass: string
}

export const VERDICTS: Record<Verdict, VerdictMeta> = {
  supported: {
    label: 'Supported',
    badgeClass:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  partly_supported: {
    label: 'Partly supported',
    badgeClass:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300',
    dotClass: 'bg-amber-500 dark:bg-amber-400',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  unsupported: {
    label: 'Unsupported',
    badgeClass:
      'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300',
    dotClass: 'bg-orange-500 dark:bg-orange-400',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
  contradictory: {
    label: 'Contradictory',
    badgeClass:
      'border-red-500/30 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300',
    dotClass: 'bg-red-500 dark:bg-red-400',
    textClass: 'text-red-600 dark:text-red-400',
  },
  possibly_outdated: {
    label: 'Possibly outdated',
    badgeClass:
      'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:border-purple-400/30 dark:bg-purple-400/10 dark:text-purple-300',
    dotClass: 'bg-purple-500 dark:bg-purple-400',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
  reference_not_found: {
    label: 'Reference not found',
    badgeClass:
      'border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:border-zinc-400/30 dark:bg-zinc-400/10 dark:text-zinc-300',
    dotClass: 'bg-zinc-500 dark:bg-zinc-400',
    textClass: 'text-zinc-600 dark:text-zinc-400',
  },
  needs_human_review: {
    label: 'Needs human review',
    badgeClass:
      'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300',
    dotClass: 'bg-blue-500 dark:bg-blue-400',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
}

export const VERDICT_ORDER = Object.keys(VERDICTS) as Verdict[]

export const REVIEW_STATUS: Record<ReviewStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'border-border bg-muted/60 text-muted-foreground',
  },
  accepted: {
    label: 'Accepted',
    className: VERDICTS.supported.badgeClass,
  },
  overridden: {
    label: 'Overridden',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
}
