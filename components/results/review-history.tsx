'use client'

import { ChevronDown, History } from 'lucide-react'
import type { ReviewHistoryEntry } from '@/lib/types'
import { VERDICTS } from '@/lib/verdicts'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function describe(entry: ReviewHistoryEntry) {
  switch (entry.action) {
    case 'accepted':
      return { title: `Accepted as ${VERDICTS[entry.verdict].label}`, detail: null }
    case 'overridden':
      return {
        title: `Overridden: ${VERDICTS[entry.from_verdict].label} → ${VERDICTS[entry.to_verdict].label}`,
        detail: entry.reason,
      }
    case 'note':
      return { title: 'Note added', detail: entry.note }
  }
}

export function ReviewHistory({ history }: { history: ReviewHistoryEntry[] }) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <History className="size-3.5" aria-hidden="true" />
        Review history ({history.length})
        <ChevronDown
          className="size-3.5 transition-transform group-data-[panel-open]:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {history.length === 0 ? (
          <p className="pt-3 text-sm text-muted-foreground">No review actions yet.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-3 border-l pl-4">
            {[...history].reverse().map((entry, index) => {
              const { title, detail } = describe(entry)
              return (
                <li key={`${entry.timestamp}-${index}`} className="relative text-sm">
                  <span
                    className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <p className="font-medium">{title}</p>
                  {detail && <p className="text-muted-foreground">{detail}</p>}
                  <time dateTime={entry.timestamp} className="text-xs text-muted-foreground">
                    {formatter.format(new Date(entry.timestamp))}
                  </time>
                </li>
              )
            })}
          </ol>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
