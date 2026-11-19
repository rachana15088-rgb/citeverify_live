'use client'

import { useState, type FormEvent } from 'react'
import type { Verdict } from '@/lib/types'
import { VERDICTS, VERDICT_ORDER } from '@/lib/verdicts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

export function OverrideDialog({
  open,
  onOpenChange,
  currentVerdict,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentVerdict: Verdict
  onSubmit: (verdict: Verdict, reason: string) => void
}) {
  const [verdict, setVerdict] = useState<Verdict | ''>('')
  const [reason, setReason] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const options = VERDICT_ORDER.filter((v) => v !== currentVerdict)
  const verdictMissing = !verdict
  const reasonMissing = reason.trim().length === 0

  function handleOpenChange(next: boolean) {
    if (!next) {
      setVerdict('')
      setReason('')
      setShowErrors(false)
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (verdictMissing || reasonMissing) {
      setShowErrors(true)
      return
    }
    onSubmit(verdict as Verdict, reason.trim())
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>Override verdict</DialogTitle>
            <DialogDescription>
              Current verdict: {VERDICTS[currentVerdict].label}. Choose a new verdict and
              explain your reasoning for the review record.
            </DialogDescription>
          </DialogHeader>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">New verdict</legend>
            <RadioGroup
              value={verdict}
              onValueChange={(v) => setVerdict(v as Verdict)}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              aria-invalid={showErrors && verdictMissing}
            >
              {options.map((v) => (
                <Label
                  key={v}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-normal',
                    verdict === v && 'border-primary bg-accent',
                  )}
                >
                  <RadioGroupItem value={v} />
                  <span className={cn('size-1.5 rounded-full', VERDICTS[v].dotClass)} aria-hidden="true" />
                  {VERDICTS[v].label}
                </Label>
              ))}
            </RadioGroup>
            {showErrors && verdictMissing && (
              <p className="text-xs text-destructive" role="alert">
                Select a new verdict.
              </p>
            )}
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="override-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="override-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. The full text (Section 4) reports 35% under field conditions."
              rows={3}
              required
              aria-invalid={showErrors && reasonMissing}
              aria-describedby={showErrors && reasonMissing ? 'override-reason-error' : undefined}
            />
            {showErrors && reasonMissing && (
              <p id="override-reason-error" className="text-xs text-destructive" role="alert">
                A reason is required to override a verdict.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save override</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
