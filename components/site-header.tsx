import Link from 'next/link'
import { Info, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { MainNav } from '@/components/main-nav'

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-40">
      <div
        role="note"
        className="flex items-center justify-center gap-2 border-b bg-primary/15 px-4 py-1.5 text-center text-xs text-foreground/90 backdrop-blur text-pretty"
      >
        <Info className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Automated results are indicators, not final academic judgments. Every finding is open to
          human review.
        </span>
      </div>
      <header className="border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="CiteVerify home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
              <Search className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="hidden sm:block font-display text-lg font-bold tracking-tight">
              Cite<span className="text-primary">Verify</span>
            </span>
          </Link>
          <MainNav />
          <ThemeToggle />
        </div>
      </header>
    </div>
  )
}
