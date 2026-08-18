import type { Metadata } from 'next'
import Link from 'next/link'
import { CaptureForm } from '@/components/capture-form'
import { ConcernCard } from '@/components/concern-card'
import { ConcernPanel } from '@/components/concern-panel'
import { Container } from '@/components/container'
import { EmailField } from '@/components/email-field'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { concernByPath, concernsFor, type Concern } from '@/content/concerns'
import { TopUpQuoteFields } from '@/components/enquiry/top-up-quote'
import { captureEnabled } from '@/lib/capture'
import { contact } from '@/lib/site'

/**
 * A concern's own page: the same panel the homepage reveals, plus the one thing the
 * homepage deliberately does not carry — an enquiry form tagged with the path and
 * concern the visitor arrived on.
 *
 * That tagging is the whole argument for these being real pages rather than in-page
 * state. An enquiry from here reaches n8n already knowing "individual, planning for a
 * family", so the reply can open on the situation rather than on a blank form.
 *
 * ---- There is no questions band here, and there should not be ----
 *
 * One was built and removed on 2026-08-16. It sat between the panel's call to action and
 * the form, and it was wrong in three ways at once:
 *
 *   1. It WIDENED a flow whose every other step narrows. The visitor has just chosen a
 *      path, chosen a situation, and read an answer to it. Following that with three more
 *      things they might be worried about puts them back into the scanning-and-doubt mode
 *      this whole design exists to remove.
 *   2. The questions were NOT ABOUT THE CONCERN. Offshore and deployed teams got "how do
 *      I make a claim" and "what is the difference between international and local
 *      cover", because no article about a multi-country workforce exists. It was padding
 *      dressed as helpfulness.
 *   3. It sat AFTER the call to action, so it diluted the ask it was meant to support.
 *
 * Where a genuinely on-topic article exists it belongs in the panel's `furtherReading`:
 * one link, in context, before the CTA rather than a band of three after it. Nothing is
 * orphaned by the removal — every article is linked from /knowledge and /services.
 *
 * If concern-specific articles ever get written, the answer is still `furtherReading`,
 * not a band.
 *
 * ---- And there is no slot for per-concern sections ----
 *
 * There was one, used by /maternity-insurance to keep four sections it had before it was
 * absorbed. Those were cut on 2026-08-16 for the same reason as the questions band: they
 * sat between the panel's call to action and the form. With no callers left the slot went
 * too, because a dead extension point is an invitation to reopen the fault.
 *
 * All nine routes are now four lines and render exactly this. A concern that needs
 * something the others do not gets an OPTIONAL FIELD in content/concerns/index.ts, so the
 * addition is visible to all nine and the shape the flow promises holds.
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

export function ConcernPage({ path }: { path: string }) {
  const concern = concernByPath(path)
  const company = concern.audience === 'company'



  return (
    <>
      <section className="bg-surface-subtle">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          {/*
            The way back to the DECISION, not to the leaf.

            This pointed at `/#${concern.key}` until 2026-08-16, which reopened the panel
            the visitor was trying to leave while the label promised them all the
            situations. A visitor who has landed on the wrong concern needs one step back
            up the tree, not the same answer again and not a flat list of alternatives to
            re-scan.

            `/#individual` and `/#company` are ids on the fork options themselves, so this
            works with no JavaScript; home-flow.tsx additionally ticks the radio so their
            half of the choice is already answered.
          */}
          <p className="mb-6 text-sm">
            <Link
              href={`/#${concern.audience}`}
              className="text-ink-muted no-underline hover:text-brand-blue"
            >
              <span aria-hidden="true">&larr; </span>
              {company ? 'All company situations' : 'All individual situations'}
            </Link>
          </p>

          {/*
            The panel is an <h1> here and an <h2> on the homepage. Same markup otherwise.

            `priority` because on this route the lead image is above the fold and is the
            LCP element. The homepage passes no priority for the same component, because
            there the panel starts hidden. See the prop's note in concern-panel.tsx.
          */}
          <ConcernPanel
            concern={concern}
            headingLevel="h1"
            ctaHref="#talk-to-us"
            priority
          />
        </Container>
      </section>



      <Section id="talk-to-us" tone="subtle" labelledBy="enquiry-heading">
        {/*
          The lede counts the fields, so it has to follow the form. /beyond-employer-cover
          swapped to the quote question set on 2026-08-18 and this line went on promising
          "Four fields" above a form asking for dates of birth, nationality, residency and
          an upload — the one place on the page where understating the ask is a broken
          promise rather than a nicety, because the visitor has already committed by the
          time they find out.

          Keyed off the same `enquiryFields` value that chooses the fields below, so the
          two cannot drift apart. The second half of the sentence is unchanged and is a
          real commitment: see the note on `successMessage` below.
        */}
        <SectionHeading
          id="enquiry-heading"
          title="Tell us the situation"
          lede={
            concern.enquiryFields === 'top-up-quote'
              ? 'A few details so we can price it properly, no obligation, and a reply the same working day.'
              : 'Four fields, no obligation, and a reply the same working day.'
          }
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

              {/*
                The concern chooses its questions. Absent `enquiryFields` means the four
                below, which is right for a visitor who has read one panel and wants to
                start a conversation. A concern that names a set gets that instead — see
                ConcernEnquiryKey in the content module for when that is warranted.
              */}
              {concern.enquiryFields === 'top-up-quote' ? (
                <TopUpQuoteFields />
              ) : (
                <>
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
                </>
              )}
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
              <ConcernCard concern={item} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
