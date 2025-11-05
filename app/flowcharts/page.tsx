import type { Metadata } from 'next'
import Link from 'next/link'
import { MermaidDiagram } from '@/components/mermaid-diagram'

const recipeLifecycle = `flowchart TD
  A[Visitor arrives] --> B{Authenticated?}
  B -- Yes --> C[Dashboard]
  B -- No --> D[Landing]
  C --> E[Discover Recipes]
  C --> F[Create Recipe]
  F --> G[Upload Photo]
  G --> H[Publish Recipe]
  H --> I{Community Feedback}
  I -- Positive --> J[Add to Favorites]
  I -- Needs Work --> K[Update Recipe]
`

const reviewFeedback = `sequenceDiagram
  participant U as User
  participant R as Recipe
  participant M as Moderation

  U->>R: Submit review
  R-->>M: Trigger moderation
  M-->>R: Flag issues?
  alt Approved
    M-->>U: Publish review
  else Requires changes
    M-->>U: Request clarification
  end
`

export const metadata: Metadata = {
  title: 'RecipeShare • Flowcharts',
  description: 'Mermaid flowcharts that illustrate key RecipeShare user journeys.',
}

export default function FlowchartsPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-12 p-6">
      <header className="space-y-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <span aria-hidden="true" className="mr-2">←</span>
          Back to home
        </Link>
        <h1 className="text-3xl font-semibold text-slate-900">Product Flowcharts</h1>
        <p className="max-w-2xl text-base text-slate-600">
          These Mermaid diagrams highlight the primary user flows within RecipeShare. Share this page with
          teammates to align on the product experience and keep diagrams synchronized with the live build.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <MermaidDiagram
          title="Recipe lifecycle"
          caption="High-level overview of how authenticated users contribute recipes and gather feedback."
          chart={recipeLifecycle}
          config={{ theme: 'neutral', themeVariables: { primaryColor: '#10b981' } }}
        />

        <MermaidDiagram
          title="Review moderation sequence"
          caption="Sequence diagram outlining the moderation workflow before a review is published."
          chart={reviewFeedback}
          config={{ theme: 'neutral', sequence: { actorFontSize: '14px' } }}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">How to add more diagrams</h2>
        <p className="mt-3 text-sm text-slate-600">
          Import the <code className="rounded bg-slate-100 px-1.5 py-0.5">MermaidDiagram</code> component into any page or component and
          pass the Mermaid syntax string via the <code className="rounded bg-slate-100 px-1.5 py-0.5">chart</code> prop. Optional
          configuration can be supplied through the <code className="rounded bg-slate-100 px-1.5 py-0.5">config</code> prop to customize themes
          or diagram-specific settings.
        </p>
      </section>
    </div>
  )
}
