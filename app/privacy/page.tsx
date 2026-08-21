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
 *
 * ⚠ FLAGGED FOR LEGAL REVIEW, NOT FOR A COPY PASS. The page is dated 5 MAY 2018, so it
 * predates the PDPA amendments in force from 2021 — mandatory data-breach notification
 * among them — and this firm handles health and claims data, which is the category where
 * that matters most. What needs checking is currency and accuracy against how the firm
 * actually operates: breach notification, retention periods, and the claims-data flows.
 * A lawyer's job.
 *
 * It is NOT flagged for naming the wrong statute. A 2026-08-17 review claimed the page
 * cites Australia's Privacy Act; it does not. content/pages/privacy.mdx says "Under the
 * Personal Data Protection Act 2012 of Singapore", which is correct, and the phrase
 * "Privacy Act" appears nowhere in the file. Recorded here so the same wrong correction
 * is not made twice.
 *
 * The footer keeps linking this page throughout. An out-of-date privacy policy on a firm
 * handling health data is a problem; no privacy policy at all is a bigger one.
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
