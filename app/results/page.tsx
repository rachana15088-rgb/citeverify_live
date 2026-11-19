import type { Metadata } from 'next'
import { ResultsView } from '@/components/results/results-view'

export const metadata: Metadata = {
  title: 'Results — CiteVerify',
}

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const sample = (await searchParams).sample === "true"
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <ResultsView key={sample ? "sample" : "saved"} sample={sample} />
    </main>
  )
}
