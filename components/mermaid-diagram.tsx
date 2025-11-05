'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

type MermaidModule = typeof import('mermaid')
type MermaidConfig = Parameters<MermaidModule['initialize']>[0]

interface MermaidDiagramProps {
  chart: string
  config?: MermaidConfig
  className?: string
  caption?: string
  title?: string
}

const baseConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
} satisfies MermaidConfig

export function MermaidDiagram({
  chart,
  config,
  className,
  caption,
  title,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const uniqueId = useId()
  const mermaidId = useMemo(() => `mermaid-${uniqueId.replace(/:/g, '-')}`, [uniqueId])
  const mergedConfig = useMemo(() => ({ ...baseConfig, ...config }), [config])

  useEffect(() => {
    let isActive = true

    const renderDiagram = async () => {
      if (!chart.trim()) {
        containerRef.current?.replaceChildren()
        return
      }

      setIsRendering(true)
      setError(null)

      try {
        const [{ default: mermaid }] = await Promise.all([import('mermaid')])
        mermaid.initialize(mergedConfig)

        const { svg } = await mermaid.render(mermaidId, chart.trim())

        if (!isActive || !containerRef.current) return

        containerRef.current.innerHTML = svg
      } catch (err) {
        if (!isActive) return
        const message = err instanceof Error ? err.message : 'Failed to render diagram'
        setError(message)
        console.error('Mermaid render error:', err)
        containerRef.current?.replaceChildren()
      } finally {
        if (isActive) {
          setIsRendering(false)
        }
      }
    }

    renderDiagram()

    return () => {
      isActive = false
    }
  }, [chart, mergedConfig, mermaidId])

  const composedClassName = [
    'rounded-xl border border-emerald-100 bg-white/70 p-4 shadow-sm backdrop-blur-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <figure className={composedClassName} aria-busy={isRendering} aria-live="polite">
      {title ? (
        <div className="mb-3 text-sm font-semibold text-emerald-700">{title}</div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="overflow-auto"
          aria-label={title ?? caption ?? 'Mermaid flowchart'}
        />
      )}

      {caption ? (
        <figcaption className="mt-3 text-xs text-slate-500">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
