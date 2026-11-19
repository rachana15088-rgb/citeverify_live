'use client'

import { useRef, useState, type DragEvent } from 'react'
import { FileText, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function UploadZone({ onSelect }: { onSelect: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setError('Please choose a PDF file.')
      return
    }
    setError(null)
    onSelect(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'glass flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/10' : 'border-foreground/15',
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <Upload className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium">Drag and drop a PDF here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Research papers, theses, or manuscripts
          </p>
        </div>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          aria-label="Upload a PDF document"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px w-10 bg-border" aria-hidden="true" />
        or
        <span className="h-px w-10 bg-border" aria-hidden="true" />
      </div>

      <Button size="lg" className="h-12 rounded-xl px-6 font-semibold" onClick={() => onSelect(null)}>
        <FileText aria-hidden="true" />
        Use sample document
      </Button>
    </div>
  )
}