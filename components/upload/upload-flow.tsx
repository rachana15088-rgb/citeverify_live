'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/upload/upload-zone'
import { AnalysisStepper, ANALYSIS_STEPS } from '@/components/upload/analysis-stepper'
import { Button } from '@/components/ui/button'
import { analyzeFile, saveResults } from '@/lib/api'

const STEP_DURATION_MS = 1500
const SAMPLE_NAME = 'nano-coatings-durability.pdf'

type Job = { file: File | null; name: string }

export function UploadFlow() {
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!job) return
    let cancelled = false
    let redirect: ReturnType<typeof setTimeout> | undefined
    setCurrentStep(0)
    setError(null)
    router.prefetch('/results')

    // Animate all steps except the last; the last completes when real work is done
    const timers = ANALYSIS_STEPS.slice(0, -1).map((_, i) =>
      setTimeout(() => {
        if (!cancelled) setCurrentStep(i + 1)
      }, STEP_DURATION_MS * (i + 1)),
    )

    // Real PDF -> real analysis. Sample -> fake delay, then mock data.
    const work = job.file
      ? analyzeFile(job.file)
      : new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), STEP_DURATION_MS * ANALYSIS_STEPS.length),
        )

    work
      .then((data) => {
        if (cancelled) return
        if (!saveResults(data, !job.file)) throw new Error("Could not save analysis results. Please enable session storage and try again.")
        setCurrentStep(ANALYSIS_STEPS.length)
        redirect = setTimeout(() => router.push(job.file ? '/results' : '/results?sample=true'), 400)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || 'Something went wrong.')
      })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      if (redirect) clearTimeout(redirect)
    }
  }, [job, router])

  if (error) {
    return (
      <div
        role="alert"
        className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center"
      >
        <p className="text-lg font-semibold">Analysis failed</p>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <Button
          onClick={() => {
            setJob(null)
            setError(null)
          }}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (job) {
    return <AnalysisStepper fileName={job.name} currentStep={currentStep} />
  }

  return (
    <UploadZone
      onSelect={(file) => setJob({ file, name: file ? file.name : SAMPLE_NAME })}
    />
  )
}