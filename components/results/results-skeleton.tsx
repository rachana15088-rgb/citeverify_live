import { Skeleton } from '@/components/ui/skeleton'

export function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading results">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-wrap gap-2 glass rounded-2xl p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-28 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 glass rounded-2xl p-6">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
      <span className="sr-only" role="status">
        Loading results
      </span>
    </div>
  )
}
