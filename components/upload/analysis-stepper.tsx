import { Check, FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ANALYSIS_STEPS = [
  { title: 'Extract', description: 'Identifying claims and citation markers' },
  { title: 'Retrieve', description: 'Locating cited works and their text' },
  { title: 'Compare', description: 'Matching claims against source evidence' },
  { title: 'Report', description: 'Assembling findings for review' },
] as const

export function AnalysisStepper({
  fileName,
  currentStep,
}: {
  fileName: string
  currentStep: number
}) {
  return (
    <section
      aria-label="Analysis progress"
      className="glass rounded-3xl p-6 md:p-8"
    >
      <div className="mb-8 flex items-center gap-3">
        <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="truncate font-medium">{fileName}</p>
      </div>

      <ol className="flex flex-col gap-0">
        {ANALYSIS_STEPS.map((step, index) => {
          const status =
            index < currentStep ? 'done' : index === currentStep ? 'active' : 'upcoming'
          const isLast = index === ANALYSIS_STEPS.length - 1
          return (
            <li
              key={step.title}
              className="flex gap-4"
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                    status === 'done' && 'border-primary bg-primary text-primary-foreground',
                    status === 'active' && 'border-primary text-primary',
                    status === 'upcoming' && 'text-muted-foreground',
                  )}
                >
                  {status === 'done' ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : status === 'active' ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      'my-1 w-px flex-1 min-h-6 transition-colors',
                      status === 'done' ? 'bg-primary' : 'bg-border',
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'font-medium leading-8',
                    status === 'upcoming' && 'text-muted-foreground',
                  )}
                >
                  {step.title}
                  <span className="sr-only">
                    {status === 'done' ? ' (complete)' : status === 'active' ? ' (in progress)' : ''}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {currentStep >= ANALYSIS_STEPS.length
          ? 'Analysis complete. Opening results.'
          : `Step ${currentStep + 1} of ${ANALYSIS_STEPS.length}: ${ANALYSIS_STEPS[currentStep].title}`}
      </p>
    </section>
  )
}
