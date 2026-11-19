import type { Metadata } from 'next'
import { UploadFlow } from '@/components/upload/upload-flow'

export const metadata: Metadata = {
  title: 'Verify a document — CiteVerify',
}

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <div className="mb-10">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Verify</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
          Check every claim against <span className="text-gradient-brand">its source.</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground text-pretty">
          Upload a manuscript. CiteVerify extracts claims, retrieves the cited works, compares the
          evidence, and prepares a report for your review.
        </p>
      </div>
      <UploadFlow />
    </main>
  )
}
