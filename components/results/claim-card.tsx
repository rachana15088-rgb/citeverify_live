'use client'

import { useState } from 'react'
import { Check, ExternalLink, MessageSquarePlus, PenLine } from 'lucide-react'
import type { ClaimResult } from '@/lib/types'
import { REVIEW_STATUS, VERDICTS } from '@/lib/verdicts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { VerdictBadge } from '@/components/results/verdict-badge'
import { ConfidenceMeter } from '@/components/results/confidence-meter'
import { OverrideDialog } from '@/components/results/override-dialog'
import { NoteDialog } from '@/components/results/note-dialog'
import { ReviewHistory } from '@/components/results/review-history'
import type { ReviewActions } from '@/components/results/results-view'

export function ClaimCard({
  claim,
  index,
  actions,
}: {
  claim: ClaimResult
  index: number
  actions: ReviewActions
}) {
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const { citation, evidence, review } = claim
  const status = REVIEW_STATUS[review.status]
  const hasSource = Boolean(citation.url)
  const percent = Math.round(claim.confidence * 100)

  return (
    <article aria-labelledby={`claim-${claim.id}`} className="glass overflow-hidden rounded-3xl">
      <div className="flex flex-col gap-6 p-5 md:p-7">
        <div className="flex gap-4 md:gap-6">
          <span className="hidden pt-1 font-mono text-xs text-muted-foreground sm:block" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <VerdictBadge verdict={claim.verdict} />
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  status.className,
                )}
              >
                <span className="sr-only">Review status: </span>
                {status.label}
              </span>
            </div>
            <h2
              id={`claim-${claim.id}`}
              className="text-lg leading-snug font-bold text-pretty md:text-xl"
            >
              {claim.claim}{' '}
              <span className="ml-1 inline-flex -translate-y-0.5 items-center rounded-md border bg-muted/60 px-1.5 py-0.5 font-sans text-xs font-medium text-muted-foreground align-middle">
                {citation.marker}
              </span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{claim.explanation}</p>
          </div>
          <div className="hidden shrink-0 border-l pl-6 text-center sm:block" aria-hidden="true">
            <p className={cn('font-display text-3xl font-bold tabular-nums', VERDICTS[claim.verdict].textClass)}>
              {percent}%
            </p>
            <p className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Confidence
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section aria-label="Matched citation" className="rounded-2xl border bg-background/40 p-4">
            <h3 className="mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Matched citation
            </h3>
            <p className="font-semibold leading-snug">{citation.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {citation.authors}
              {citation.year ? ` (${citation.year})` : ' (year unknown)'}
            </p>
            <p className="mt-2 font-mono text-xs break-all text-muted-foreground">
              DOI: {citation.doi || '—'}
            </p>
            {hasSource ? (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Open source
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No source link available</p>
            )}
          </section>

          <section aria-label="Evidence" className="rounded-2xl border bg-background/40 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Evidence
              </h3>
              {evidence.source_access !== 'none' && (
                <span className="rounded-md border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {evidence.source_access === 'metadata_only' ? 'Metadata only' : evidence.source_access === 'abstract_only' ? 'Abstract only' : 'Full text'}
                </span>
              )}
            </div>
            {evidence.passage ? (
              <figure>
                <blockquote className="rounded-r-lg border-l-4 border-primary bg-primary/10 px-3 py-2 text-sm leading-relaxed italic">
                  {`“${evidence.passage}”`}
                </blockquote>
                {evidence.location && (
                  <figcaption className="mt-2 text-xs text-muted-foreground">{evidence.location}</figcaption>
                )}
              </figure>
            ) : (
              <p className="text-sm text-muted-foreground">
                No source text could be retrieved for this citation.
              </p>
            )}
          </section>
        </div>

        <ConfidenceMeter
          confidence={claim.confidence}
          abstractOnly={evidence.source_access === 'abstract_only'}
        />

        {claim.flags.length > 0 && (
          <ul aria-label="Flags" className="flex flex-wrap gap-1.5">
            {claim.flags.map((flag) => (
              <li
                key={flag}
                className="rounded-md border bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                {flag}
              </li>
            ))}
          </ul>
        )}

        {review.reviewer_note && (
          <div className="rounded-2xl border border-dashed p-3 text-sm">
            <span className="font-semibold">Reviewer note: </span>
            <span className="text-muted-foreground">{review.reviewer_note}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t bg-background/30 px-5 py-4 md:px-7">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="rounded-lg font-semibold"
            onClick={() => actions.accept(claim.id)}
            disabled={review.status === 'accepted'}
          >
            <Check aria-hidden="true" />
            {review.status === 'accepted' ? 'Accepted' : 'Accept'}
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setOverrideOpen(true)}>
            <PenLine aria-hidden="true" />
            Override
          </Button>
          <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setNoteOpen(true)}>
            <MessageSquarePlus aria-hidden="true" />
            Add note
          </Button>
        </div>
        <ReviewHistory history={review.history} />
      </div>

      <OverrideDialog
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        currentVerdict={claim.verdict}
        onSubmit={(verdict, reason) => actions.override(claim.id, verdict, reason)}
      />
      <NoteDialog
        open={noteOpen}
        onOpenChange={setNoteOpen}
        initialNote={review.reviewer_note}
        onSubmit={(note) => actions.addNote(claim.id, note)}
      />
    </article>
  )
}
