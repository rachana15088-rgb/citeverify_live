import Link from 'next/link'
import { ArrowRight, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VerdictBadge } from '@/components/results/verdict-badge'
import { ConfidenceRing } from '@/components/confidence-ring'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 md:pt-24 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="glass mb-8 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground/90">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          Scientific verification, reimagined
        </p>
        <h1 className="text-5xl leading-[0.95] font-extrabold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
          Trust the claim.
          <br />
          <span className="text-gradient-brand">Verify the science.</span>
        </h1>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
          CiteVerify traces scientific claims to original research, reads the evidence in context,
          and gives you a verdict you can understand.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-12 rounded-xl px-6 text-base font-semibold"
            render={<Link href="/verify" />}
            nativeButton={false}
          >
            Verify a claim
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="glass h-12 rounded-xl px-6 text-base font-semibold"
            render={<Link href="/results?sample=true" />}
            nativeButton={false}
          >
            View example report
          </Button>
        </div>
      </div>

      <EvidencePreview />
    </section>
  )
}

function EvidencePreview() {
  return (
    <div className="glass rounded-3xl p-6 md:p-7" aria-label="Example evidence analysis">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <p className="font-display font-bold">Evidence analysis</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-teal">
          <span className="size-1.5 rounded-full bg-brand-teal" aria-hidden="true" />
          Complete
        </span>
      </div>

      <p className="mt-8 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        Claim
      </p>
      <p className="mt-2 font-display text-lg leading-snug font-semibold text-pretty">
        {'"The model achieved an exact match score of 87.2% on the benchmark."'}
      </p>

      <div className="mt-6 rounded-2xl border bg-primary/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Verdict
            </p>
            <VerdictBadge verdict="supported" />
          </div>
          <ConfidenceRing value={93} />
        </div>
        <p className="mt-5 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
          The reported figure and scope match Lee &amp; Kumar (2022), Results, Table 2.
        </p>
      </div>
    </div>
  )
}
