import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { Prose } from '@/components/prose'
import { readProsePage, renderMdx } from '@/lib/content'
import { siteConfig } from '@/lib/site'

/**
 * Ported from the Wix capture. The text lives in content/pages/privacy.mdx rather than
 * in this file: it is a 9,500-character legal document, and it needs to be readable and
 * amendable by whoever maintains the policy, not buried in JSX.
 *
 * The copy is verbatim. Nothing in a privacy policy gets tidied, reworded or trimmed
 * as part of a migration — it is a legal statement about how data is handled, and
 * changing it is a decision for the firm, not a porting task.
 */
const SLUG = 'privacy'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} collects, uses and protects your personal data.`,
  alternates: { canonical: `/${SLUG}` },
}

export default async function Page() {
  const page = readProsePage(SLUG)
  const Content = await renderMdx(page.body)

  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {page.title}
      </h1>
      <Prose className="mt-10">
        <Content />
      </Prose>
    </Container>
  )
}
