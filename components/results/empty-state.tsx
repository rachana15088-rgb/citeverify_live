import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 glass rounded-3xl border-dashed px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-5" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
