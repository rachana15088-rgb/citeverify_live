'use client'

import { useState, type FormEvent } from 'react'
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
import { Textarea } from '@/components/ui/textarea'

export function NoteDialog({
  open,
  onOpenChange,
  initialNote,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialNote: string
  onSubmit: (note: string) => void
}) {
  const [note, setNote] = useState(initialNote)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setNote(initialNote)
  }

  function handleOpenChange(next: boolean) {
    setNote(next ? initialNote : '')
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = note.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add reviewer note</DialogTitle>
            <DialogDescription>
              Notes are saved to this claim&apos;s review history and included in the export.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reviewer-note">Note</Label>
            <Textarea
              id="reviewer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Add context for other reviewers"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!note.trim()}>
              Save note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
