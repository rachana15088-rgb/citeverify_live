'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Search } from 'lucide-react'
import { analysisCacheKey, getResults, saveResults } from '@/lib/api'
import type { AnalysisResponse, ClaimResult, ReviewHistoryEntry, Verdict } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SummaryBar, matchesVerdictFilter } from '@/components/results/summary-bar'
import { ClaimCard } from '@/components/results/claim-card'
import { ResultsSkeleton } from '@/components/results/results-skeleton'
import { EmptyState } from '@/components/results/empty-state'

export interface ReviewActions {
  accept: (id: string) => void
  override: (id: string, verdict: Verdict, reason: string) => void
  addNote: (id: string, note: string) => void
}

export function ResultsView({ sample = false }: { sample?: boolean }) {
  const [storageError, setStorageError] = useState(false)
  const [cacheKey, setCacheKey] = useState<string | null>(null)
  useEffect(() => {
    try { setCacheKey(analysisCacheKey(sample)) }
    catch { setCacheKey(sample ? 'analysis:sample' : 'analysis:unavailable') }
  }, [sample])
  const { data, error, isLoading, mutate } = useSWR(
    cacheKey, () => getResults(sample), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const [activeVerdict, setActiveVerdict] = useState<Verdict | null>(null)
  const [query, setQuery] = useState('')

  function updateClaim(id: string, update: (claim: ClaimResult) => ClaimResult) {
    void mutate((current) => {
      if (!current) return current
      const next = { ...current, results: current.results.map((c) => c.id === id ? update(c) : c) }
      setStorageError(!saveResults(next, sample))
      return next
    }, { revalidate: false })
  }

  function withHistory(claim: ClaimResult, entry: ReviewHistoryEntry): ClaimResult['review'] {
    return { ...claim.review, history: [...claim.review.history, entry] }
  }

  const actions: ReviewActions = {
    accept: (id) =>
      updateClaim(id, (c) => ({
        ...c,
        review: {
          ...withHistory(c, { action: 'accepted', timestamp: new Date().toISOString(), verdict: c.verdict }),
          status: 'accepted',
        },
      })),
    override: (id, verdict, reason) =>
      updateClaim(id, (c) => ({
        ...c,
        verdict,
        review: {
          ...withHistory(c, {
            action: 'overridden',
            timestamp: new Date().toISOString(),
            from_verdict: c.verdict,
            to_verdict: verdict,
            reason,
          }),
          status: 'overridden',
        },
      })),
    addNote: (id, note) =>
      updateClaim(id, (c) => ({
        ...c,
        review: {
          ...withHistory(c, { action: 'note', timestamp: new Date().toISOString(), note }),
          reviewer_note: note,
        },
      })),
  }

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.results.filter((c) => {
      if (activeVerdict && !matchesVerdictFilter(c, activeVerdict)) return false
      if (!q) return true
      return [c.claim, c.citation.title, c.citation.authors, c.citation.doi, c.explanation, ...c.flags]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [data, activeVerdict, query])

  if (!cacheKey || isLoading) return <ResultsSkeleton />

  if (error || !data) {
    return (
      <EmptyState
        title="Could not load results"
        description="The analysis results are unavailable right now. Please try again."
        action={<Button onClick={() => mutate()}>Retry</Button>}
      />
    )
  }

  const reviewedCount = data.results.filter((c) => c.review.status !== 'pending').length

  return (
    <div className="flex flex-col gap-6">
      {storageError && <p role="alert">Review changes could not be saved for reload.</p>}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/verify"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            New document
          </Link>
          <p className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">Verification report</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
            {data.document.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.document.claims_total} claims analyzed · {reviewedCount} reviewed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            className="h-11 rounded-xl px-5 font-semibold"
            onClick={() => exportJsonReport(data)}
            disabled={data.results.length === 0}
          >
            <Download aria-hidden="true" />
            Export JSON
          </Button>
          <Button
            size="lg"
            className="h-11 rounded-xl px-5 font-semibold"
            onClick={() => exportHumanReport(data)}
            disabled={data.results.length === 0}
          >
            <FileText aria-hidden="true" />
            Printable report
          </Button>
        </div>
      </div>

      {data.results.length === 0 ? (
        <EmptyState
          title="No claims found"
          description="We couldn't identify any cited claims in this document."
          action={
            <Button render={<Link href="/" />} nativeButton={false}>
              Upload another document
            </Button>
          }
        />
      ) : (
        <>
          <SummaryBar
            results={data.results}
            activeVerdict={activeVerdict}
            onSelect={setActiveVerdict}
          />

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search claims, sources, authors, DOIs or flags"
              aria-label="Search claims"
              className="glass h-11 rounded-xl pl-9"
            />
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {filtered.length} of {data.results.length} claims
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              title="No matching claims"
              description="Try a different search term or clear the verdict filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setActiveVerdict(null)
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {filtered.map((claim) => (
                <li key={claim.id}>
                  <ClaimCard
                    claim={claim}
                    index={data.results.findIndex((c) => c.id === claim.id)}
                    actions={actions}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function escapeHtml(str: string) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function exportJsonReport(data: AnalysisResponse) {
  const report = { exported_at: new Date().toISOString(), ...data }
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `citeverify-audit-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function exportHumanReport(data: AnalysisResponse) {
  const counts = data.results.reduce<Record<string, number>>((acc, r) => {
    if (r.verdict !== 'needs_human_review') acc[r.verdict] = (acc[r.verdict] || 0) + 1
    if (matchesVerdictFilter(r, 'needs_human_review')) acc.needs_human_review = (acc.needs_human_review || 0) + 1
    return acc
  }, {})

  const badgeColor: Record<string, string> = {
    supported: '#15803d',
    partly_supported: '#b45309',
    unsupported: '#b91c1c',
    contradictory: '#991b1b',
    possibly_outdated: '#6d28d9',
    reference_not_found: '#475569',
    needs_human_review: '#0369a1',
  }

  const rows = data.results
    .map((r, i) => {
      const label = r.verdict.replace(/_/g, ' ').toUpperCase()
      const color = badgeColor[r.verdict] || '#334155'
      const pct = Math.round((r.confidence || 0) * 100)
      return `
        <div class="card">
          <div class="card-head">
            <span class="num">#${String(i + 1).padStart(2, '0')}</span>
            <span class="badge" style="background:${color}">${escapeHtml(label)}</span>
            <span class="meta">Confidence: ${pct}% · Review: ${escapeHtml((r.review?.status || 'pending').toUpperCase())}</span>
          </div>
          <p class="claim">“${escapeHtml(r.claim)}” <strong>${escapeHtml(r.citation.marker)}</strong></p>
          <p class="explanation"><strong>Assessment:</strong> ${escapeHtml(r.explanation)}</p>
          <p class="citation">
            <strong>Cited Source:</strong> ${escapeHtml(r.citation.title)}
            ${r.citation.authors ? ` — ${escapeHtml(r.citation.authors)}` : ''}
            ${r.citation.year ? ` (${r.citation.year})` : ''}
            ${r.citation.url ? ` · <a href="${escapeHtml(r.citation.url)}" target="_blank" rel="noopener">View Source</a>` : ''}
          </p>
          ${r.evidence?.passage ? `<blockquote class="evidence"><strong>Retrieved Evidence:</strong> ${escapeHtml(r.evidence.passage)}</blockquote>` : ''}
          ${r.review?.reviewer_note ? `<p class="note"><strong>Reviewer Note:</strong> ${escapeHtml(r.review.reviewer_note)}</p>` : ''}
        </div>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CiteVerify Report — ${escapeHtml(data.document.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; max-width: 860px; margin: 32px auto; padding: 0 24px; line-height: 1.55; }
    header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    .sub { color: #475569; font-size: 13px; }
    .summary { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
    .pill { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; font-size: 13px; font-weight: 600; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 14px; page-break-inside: avoid; }
    .card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .num { font-weight: 700; color: #64748b; }
    .badge { color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.04em; }
    .meta { margin-left: auto; font-size: 12px; color: #475569; }
    .claim { font-size: 15px; font-weight: 600; margin: 6px 0; }
    .explanation, .citation, .note { font-size: 13.5px; margin: 6px 0; color: #1e293b; }
    .evidence { margin: 8px 0 0; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #64748b; font-size: 13px; color: #334155; }
    footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <header>
    <div class="sub">CITEVERIFY · ACADEMIC CITATION AUDIT REPORT</div>
    <h1>${escapeHtml(data.document.title)}</h1>
    <div class="sub">Generated on ${escapeHtml(new Date().toLocaleString())} · ${data.document.claims_total} claims analyzed</div>
  </header>
  <div class="summary">
    <div class="pill">Supported: ${counts.supported || 0}</div>
    <div class="pill">Partly Supported: ${counts.partly_supported || 0}</div>
    <div class="pill">Unsupported: ${counts.unsupported || 0}</div>
    <div class="pill">Contradictory: ${counts.contradictory || 0}</div>
    <div class="pill">Needs Review: ${counts.needs_human_review || 0}</div>
  </div>
  ${rows}
  <footer>Automated results are indicators, not final academic judgments. Every finding is open to human review.</footer>
  <script>window.onload = () => window.print();</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}