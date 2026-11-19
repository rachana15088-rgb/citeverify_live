import { FileSearch, Library, Scale, ClipboardCheck } from 'lucide-react'

const STEPS = [
  { icon: FileSearch, title: 'Extract', text: 'Find every cited claim and its citation marker.' },
  { icon: Library, title: 'Retrieve', text: 'Locate the cited works and their abstract or full text.' },
  { icon: Scale, title: 'Compare', text: 'Weigh the claim against the passage it relies on.' },
  { icon: ClipboardCheck, title: 'Report', text: 'Get verdicts you can accept, override, or annotate.' },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 pb-24">
      <h2 id="how-heading" className="sr-only">
        How it works
      </h2>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">{`0${i + 1}`}</span>
            </div>
            <h3 className="mt-5 font-bold">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
