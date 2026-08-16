import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CaptureForm } from '@/components/capture-form'
import { ConcernPanel } from '@/components/concern-panel'
import { Container } from '@/components/container'
import { EmailField } from '@/components/email-field'
import { Faq, type FaqItem } from '@/components/faq'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { concernByPath, concernsFor, type Concern } from '@/content/concerns'
import { captureEnabled } from '@/lib/capture'
import { readPost } from '@/lib/content'
import { contact } from '@/lib/site'

/**
 * A concern's own page: the same panel the homepage reveals, plus the two things the
 * homepage deliberately does not carry.
 *
 *   - the questions band, from this concern's own `questionSlugs`
 *   - the enquiry form, tagged with the path and concern the visitor arrived on
 *
 * That second one is the whole argument for these being real pages rather than in-page
 * state. An enquiry from here reaches n8n already knowing "individual, planning for a
 * family", so the reply can open on the situation rather than on a blank form.
 *
 * `metadataFor` lives here too, so a route file is four lines and cannot forget the
 * canonical or the description.
 */
export function metadataFor(path: string): Metadata {
  const concern = concernByPath(path)
  return {
    title: concern.meta.title,
    description: concern.meta.description,
  }
}

/** The sibling concerns on the same path, minus this one. */
function siblings(concern: Concern): readonly Concern[] {
  return concernsFor(concern.audience).filter((item) => item.key !== concern.key)
}

export function ConcernPage({
  path,
  children,
}: {
  path: string
  /**
   * Extra sections, rendered between the panel and the questions band.
   *
   * Only two concerns use this, and both for the same reason: they absorbed pages that
   * already existed and already carried material the six-part panel has no slot for.
   * `/maternity-insurance` in particular was the best-written page on the site before
   * this rebuild, and absorbing it into the pattern must not cost the parts of it the
   * panel cannot hold. Everything that DID fit the panel was moved into the content
   * module rather than left duplicated here.
   *
   * This is not an extension point for new concerns. A concern that needs a section the
   * others do not have needs an optional field in the content module instead, so all
   * eight pages keep the shape the flow promises.
   */
  children?: ReactNode
}) {
  const concern = concernByPath(path)
  const company = concern.audience === 'company'

  const faqItems: FaqItem[] = concern.questionSlugs.map((slug) => {
    const post = readPost(slug)
    return {
      question: post.frontmatter.title,
      // The article's own summary, never a rewrite of it.
      answer: post.frontmatter.summary,
      href: `/single-post/${post.frontmatter.slug}`,
    }
  })

  return (
    <>
      <section className="bg-surface-subtle">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          {/*
            A breadcrumb back to the fork, pointed at this concern's own hash so the
            homepage reopens on the panel the visitor just left rather than resetting
            them to "How can we help you today?".
          */}
          <p className="mb-6 text-sm">
            <Link
              href={`/#${concern.key}`}
              className="text-ink-muted no-underline hover:text-brand-blue"
            >
              <span aria-hidden="true">&larr; </span>
              {company ? 'All company situations' : 'All individual situations'}
            </Link>
          </p>

          {/* The panel is an <h1> here and an <h2> on the homepage. Same markup. */}
          <ConcernPanel concern={concern} headingLevel="h1" ctaHref="#talk-to-us" />
        </Container>
      </section>

      {children}

      {faqItems.length > 0 ? (
        <Section tone="surface" labelledBy="questions-heading">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading id="questions-heading" title="What people ask us" />
            </div>
            <div className="lg:col-span-7">
              <Faq
                items={faqItems}
                allAnswersHref="/knowledge"
                allAnswersLabel="All answers"
              />
            </div>
          </div>
        </Section>
      ) : null}

      <Section id="talk-to-us" tone="subtle" labelledBy="enquiry-heading">
        <SectionHeading
          id="enquiry-heading"
          title="Tell us the situation"
          lede="Four fields, no obligation, and a reply the same working day."
        />

        <div className="mt-8 max-w-xl">
          {captureEnabled ? (
            <CaptureForm
              source="concern-enquiry"
              // Derived from the concern rather than passed in, so an individual concern
              // cannot be wired to the corporate follow-up sequence by a typo in a route
              // file. The two lists stay separate.
              list={company ? 'corporate' : 'individual'}
              submitLabel="Send this"
              successMessage="Got it. We will come back to you today or tomorrow morning."
              className="space-y-5"
            >
              {/*
                The lead tagging. Hidden fields rather than a query string, so the tag
                survives the visitor wandering around the page, and so it is submitted
                data rather than something n8n has to parse out of a referrer.
              */}
              <input type="hidden" name="concern" value={concern.key} />
              <input type="hidden" name="path" value={concern.audience} />
              <input type="hidden" name="situation" value={concern.cardTitle} />

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink">
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="mt-1 w-full rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink"
                />
              </div>

              <EmailField id={`${concern.key}-email`} />

              <div>
                <label htmlFor="where" className="block text-sm font-medium text-ink">
                  {company ? 'Where your people are based' : 'Where you live now'}
                </label>
                <input
                  id="where"
                  name="where"
                  type="text"
                  required
                  className="mt-1 w-full rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink"
                />
              </div>

              {/* Optional on purpose. This is where the useful information arrives. */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-ink">
                  Anything we should know{' '}
                  <span className="font-normal text-ink-muted">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="mt-1 w-full rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink"
                />
              </div>
            </CaptureForm>
          ) : (
            /*
              No webhook configured, so no form is rendered at all — decided here at
              build time. A form that accepts what someone typed and then tells them to
              email instead is worse than not offering one.

              The subject line carries the concern, so a mailto lead arrives tagged the
              same way a posted one would.
            */
            <p className="text-base/7 text-ink">
              Email us at{' '}
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(concern.cardTitle)}`}
                className="text-brand-blue"
              >
                {contact.email}
              </a>{' '}
              and tell us where you are with it.
            </p>
          )}

          {captureEnabled ? (
            <p className="mt-6 text-sm text-ink-muted">
              Or email us at{' '}
              <a href={`mailto:${contact.email}`} className="text-brand-blue">
                {contact.email}
              </a>
              .
            </p>
          ) : null}
        </div>
      </Section>

      {/*
        The other three situations on the same path. This is the one place the site
        offers sideways movement: someone who clicked "relocating" and finds it is not
        quite their situation should not have to go back to the fork to say so.
      */}
      <Section tone="surface" labelledBy="siblings-heading">
        <SectionHeading
          id="siblings-heading"
          title={company ? 'Or something else entirely' : 'Or is it more like one of these'}
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {siblings(concern).map((item) => (
            <li key={item.key}>
              <Link
                href={item.path}
                className="block h-full rounded-(--radius-panel) border border-border bg-surface p-5 no-underline hover:border-ink-muted"
              >
                <span className="block font-serif text-lg text-ink">{item.cardTitle}</span>
                <span className="mt-1 block text-sm text-ink-muted">{item.hook}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
