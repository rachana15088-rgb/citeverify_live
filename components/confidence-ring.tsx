const RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ConfidenceRing({ value }: { value: number }) {
  const offset = CIRCUMFERENCE * (1 - value / 100)
  return (
    <div className="relative size-20 shrink-0" role="img" aria-label={`Confidence ${value}%`}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={RADIUS} fill="none" strokeWidth="6" className="stroke-foreground/10" />
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-brand-teal"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold tabular-nums">
        {value}%
      </span>
    </div>
  )
}
