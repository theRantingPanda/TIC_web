import type { ReactNode } from 'react'
import { Container } from '@/components/container'

/**
 * Titled shell used by the route stubs.
 *
 * Phase 2 deliberately ships every preserved URL as an empty page so the URL contract
 * is real and testable at build time. Porting the Wix copy into these routes is Phase 3
 * — drop the content in as `children` and remove the placeholder note.
 */
export function PageShell({
  title,
  lede,
  children,
}: {
  title: string
  lede?: string
  children?: ReactNode
}) {
  return (
    <Container className="py-(--spacing-section)">
      <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {title}
      </h1>
      {lede ? <p className="mt-4 max-w-2xl text-lg text-ink-muted">{lede}</p> : null}
      {children ? <div className="mt-10">{children}</div> : null}
    </Container>
  )
}
