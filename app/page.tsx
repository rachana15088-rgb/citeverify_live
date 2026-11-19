import { Hero } from '@/components/home/hero'
import { HowItWorks } from '@/components/home/how-it-works'
import { UploadFlow } from '@/components/upload/upload-flow'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <section id="upload" aria-labelledby="upload-heading" className="mx-auto max-w-3xl scroll-mt-28 px-4 pb-24">
        <div className="mb-8 text-center">
          <h2 id="upload-heading" className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Verify your manuscript
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            Drop in a PDF and CiteVerify checks each cited claim against its source.
          </p>
        </div>
        <UploadFlow />
      </section>
    </main>
  )
}
