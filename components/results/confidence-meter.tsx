'use client'

import { AlertTriangle, Info } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ConfidenceMeter({
  confidence,
  abstractOnly,
}: {
  confidence: number
  abstractOnly: boolean
}) {
  const percent = Math.round(confidence * 100)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-medium" id="confidence-label">
            Confidence
          </span>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="About confidence"
                />
              }
            >
              <Info className="size-3.5" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>
              Confidence reflects evidence strength and uncertainty, not a guarantee.
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="tabular-nums text-muted-foreground">{percent}%</span>
      </div>
      <Progress value={percent} aria-label={`Confidence ${percent}%`} />
      {abstractOnly && (
        <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Based on the abstract only. The full text may contain different or more specific findings.
        </p>
      )}
    </div>
  )
}
