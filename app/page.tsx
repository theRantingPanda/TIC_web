import type { Metadata } from 'next'
import Link from 'next/link'
import { CaptureForm } from '@/components/capture-form'
import { CaptureProvider } from '@/components/capture-context'
import { CardGrid } from '@/components/card-grid'
import { Container } from '@/components/container'
import { EmailField } from '@/components/email-field'
import { Faq, type FaqItem } from '@/components/faq'
import { FeatureCard } from '@/components/feature-card'
import { BuildingIcon, GlobeIcon, HardHatIcon, HourglassIcon } from '@/components/icons'
import { IndicativePrice } from '@/components/indicative-price'
import { LeadMagnetPanel } from '@/components/lead-magnet-panel'
import { QuoteBlock } from '@/components/quote-block'
import { Reveal } from '@/components/reveal'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { StatBand } from '@/components/stat-band'
import { hasIndicativePricing } from '@/content/home/price-bands'
import {
  meta,
  s01Hero,
  s02Numbers,
  s03Arrange,
  s04CompanyCover,
  s05AfterYouBuy,
  s06Case,
  s08TwoWaysIn,
  s09Questions,
  s10Closing,
} from '@/content/home/copy'
import { readPost } from '@/lib/content'
import { captureEnabled } from '@/lib/capture'
import { contact, siteConfig } from '@/lib/site'

/**
 * The homepage.
 *
 * Structure and copy come from asktic-homepage-copy-deck.md. Every string is in
 * content/home/copy.ts so it diffs against the deck; this file is layout only.
 *
 * Section 07 ("What it actually costs") is cut, on the deck's own recommendation in its
 * section 04 note: it read as a fourth unlabelled pricing configuration and overlapped
 * the two-field ask. That leaves three posting capture points rather than four.
 *
 * The anchors are load-bearing. #indicative-price is the hero's first CTA and
 * #talk-to-us is the header button, the section 04 CTA and the price component's
 * fallback route. components/section.tsx carries the scroll-mt that keeps them clear of
 * the sticky header.
 */
export const metadata: Metadata = {
  // `absolute` because app/layout.tsx templates titles as "%s | TIC", which would render
  // the deck's tag as "... | The Insurance Concierge | TIC".
  title: { absolute: meta.title },
  description: meta.description,
}

const cardIcons = [GlobeIcon, HourglassIcon, BuildingIcon, HardHatIcon] as const

/**
 * Organisation schema. Kept minimal and factual: no aggregate rating, no invented
 * founding date, no address the site does not otherwise publish.
 *
 * There is deliberately no `telephone` — the published number is out of service and was
 * swept from the site on 2026-08-16. Do not add one back without checking it answers.
 */
const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  email: contact.email,
  description: meta.description,
  areaServed: 'SG',
  sameAs: contact.social.map((item) => item.href),
}

function questions(): FaqItem[] {
  return s09Questions.slugs.map((slug) => {
    const post = readPost(slug)
    return {
      question: post.frontmatter.title,
      answer: post.frontmatter.summary,
      href: `/single-post/${post.frontmatter.slug}`,
    }
  })
}

export default function Page() {
  const faqItems = questions()

  return (
    <CaptureProvider>
      <script
        type="application/ld+json"
        // Serialised from the literal above. No user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />

      {/* 01. Hero */}
      <section className="border-b border-border bg-surface-subtle">
        <Container className="py-16 md:py-24 lg:py-28">
          <div className="max-w-[46rem]">
            <h1 className="text-display-lg sm:text-display-xl text-ink">
              {s01Hero.headline}
            </h1>
            {/*
              The tagline is retained, so the subhead does all the explanatory work: it
              has to say plainly what the firm does and for whom, because the headline
              does not. Do not shorten it.
            */}
            <p className="mt-6 text-lg/8 text-ink-muted">{s01Hero.subhead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/*
                Two doors, equal weight. Two audiences arrive here with different jobs to
                do, and one button forces one of them to translate.
              */}
              <Link
                href={s01Hero.primaryCta.href}
                className="rounded-md bg-brand-green px-5 py-3 text-center text-sm font-medium text-white no-underline hover:bg-brand-green-700"
              >
                {s01Hero.primaryCta.label}
              </Link>
              <Link
                href={s01Hero.secondaryCta.href}
                className="rounded-md border border-border bg-surface px-5 py-3 text-center text-sm font-medium text-ink no-underline hover:border-brand-green-300 hover:text-brand-green-700"
              >
                {s01Hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 02. The numbers */}
      <Section labelledBy="numbers-heading">
        <SectionHeading id="numbers-heading" title={s02Numbers.heading} />
        <div className="mt-10">
          <StatBand stats={s02Numbers.stats} />
        </div>
      </Section>

      {/* 03. What we arrange */}
      <Section tone="subtle" labelledBy="arrange-heading">
        <SectionHeading id="arrange-heading" title={s03Arrange.heading} />
        <div className="mt-10">
          {/* Four cards, so 2x2 on desktop and a single stack on mobile. */}
          <CardGrid columns={2}>
            {s03Arrange.cards.map((card, index) => (
              <li key={card.title}>
                <FeatureCard
                  icon={cardIcons[index]}
                  title={card.title}
                  body={card.body}
                  link={card.link}
                />
              </li>
            ))}
          </CardGrid>
        </div>
      </Section>

      {/* 04. If your only cover is through work */}
      <Section labelledBy="company-cover-heading">
        <SectionHeading id="company-cover-heading" title={s04CompanyCover.heading} />
        <div className="mt-8 max-w-[46rem] space-y-5">
          {s04CompanyCover.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-base/8 text-ink">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12">
          {/*
            Same visual treatment as section 02, which is why it is the same component.
            The footnote is a disclosure, not decoration: these figures are low because
            the configuration is narrow. Never trim it to balance the layout.
          */}
          <StatBand
            stats={s04CompanyCover.band.stats}
            intro={s04CompanyCover.band.intro}
            footnote={s04CompanyCover.band.footnote}
            figureSize="compact"
          />
        </div>

        <p className="mt-10">
          <Link
            href={s04CompanyCover.cta.href}
            className="inline-block rounded-md bg-brand-green px-5 py-3 text-sm font-medium text-white no-underline hover:bg-brand-green-700"
          >
            {s04CompanyCover.cta.label}
          </Link>
        </p>
      </Section>

      {/* 05. What you get after you've bought */}
      <Section tone="subtle" labelledBy="after-you-buy-heading">
        <SectionHeading id="after-you-buy-heading" title={s05AfterYouBuy.heading} />
        <div className="mt-10">
          <CardGrid columns={3}>
            {s05AfterYouBuy.points.map((point) => (
              <li key={point.title}>
                <FeatureCard title={point.title} body={point.body} />
              </li>
            ))}
          </CardGrid>
        </div>

        {/*
          Omitted entirely when there are no bands, rather than rendered empty. See
          content/home/price-bands.ts — the deck supplies no figures for this
          configuration and none are invented.
        */}
        {hasIndicativePricing ? (
          <div id="indicative-price" className="mt-12 scroll-mt-20">
            <IndicativePrice enquiryHref="#talk-to-us" />
          </div>
        ) : null}
      </Section>

      {/* 06. One case */}
      <Section labelledBy="case-heading">
        <SectionHeading id="case-heading" title={s06Case.heading} align="center" />
        <div className="mt-10">
          <QuoteBlock paragraphs={s06Case.paragraphs} footer={s06Case.footer} />
        </div>
      </Section>

      {/* 08. Two ways in. (07 is cut — see the file header.) */}
      <Section tone="subtle" labelledBy="two-ways-heading">
        <SectionHeading id="two-ways-heading" title={s08TwoWaysIn.heading} />
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/*
            Two segments, two magnets, two follow-up sequences. The list each panel
            writes to is fixed here and carried to n8n explicitly; do not merge them.
          */}
          <LeadMagnetPanel
            {...s08TwoWaysIn.panels[0]}
            source="homepage-08-individual-timeline"
            list="individual"
            contactEmail={contact.email}
          />
          <LeadMagnetPanel
            {...s08TwoWaysIn.panels[1]}
            source="homepage-08-corporate-numbers"
            list="corporate"
            contactEmail={contact.email}
          />
        </div>
      </Section>

      {/* 09. What people ask us */}
      <Section labelledBy="questions-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading id="questions-heading" title={s09Questions.heading} />
          </div>
          <div className="lg:col-span-7">
            <Faq
              items={faqItems}
              allAnswersHref={s09Questions.allAnswers.href}
              allAnswersLabel={s09Questions.allAnswers.label}
            />
          </div>
        </div>
      </Section>

      {/* 10. Closing ask */}
      <Section id="talk-to-us" tone="subtle" labelledBy="closing-heading">
        <Reveal className="max-w-[46rem]">
          <h2 id="closing-heading" className="text-display-sm sm:text-display-md text-ink">
            {s10Closing.headline}
          </h2>
          <p className="mt-3 text-lg/8 text-ink-muted">{s10Closing.subhead}</p>
        </Reveal>

        <div className="mt-8 max-w-xl">
          {captureEnabled ? (
            <CaptureForm
              source="homepage-10-enquiry"
              list="individual"
              // The answer to "who needs cover" decides the list, so a company enquiry
              // never lands in the individual follow-up sequence. A descriptor rather
              // than a callback: this is a server component, and a function prop cannot
              // cross into a client one.
              listRule={{ field: 'who', corporateWhen: ['My company'] }}
              submitLabel={s10Closing.buttonLabel}
              successMessage={s10Closing.confirmation}
              className="space-y-5"
            >
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
                  className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
                />
              </div>

              <EmailField id="enquiry-email" />

              <div>
                <label htmlFor="who" className="block text-sm font-medium text-ink">
                  Who needs cover
                </label>
                <select
                  id="who"
                  name="who"
                  required
                  defaultValue=""
                  className="mt-1 w-full rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink"
                >
                  <option value="" disabled>
                    Choose one
                  </option>
                  {s10Closing.whoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ages" className="block text-sm font-medium text-ink">
                  Ages of everyone to be covered
                </label>
                <input
                  id="ages"
                  name="ages"
                  type="text"
                  required
                  className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
                />
              </div>

              <div>
                <label htmlFor="where" className="block text-sm font-medium text-ink">
                  Where you live now
                </label>
                <input
                  id="where"
                  name="where"
                  type="text"
                  required
                  autoComplete="country-name"
                  className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
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
                  placeholder={s10Closing.freeTextPlaceholder}
                  className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
                />
              </div>
            </CaptureForm>
          ) : (
            /*
              No webhook configured, so no form is rendered at all — decided here at
              build time. A form that accepts what someone typed and then tells them to
              email instead is worse than not offering one.
            */
            <p className="text-base/7 text-ink">
              {s10Closing.fallbackLine}{' '}
              <a href={`mailto:${contact.email}`} className="text-brand-blue">
                {contact.email}
              </a>
              .
            </p>
          )}

          {captureEnabled ? (
            <p className="mt-6 text-sm text-ink-muted">
              {s10Closing.fallbackLine}{' '}
              <a href={`mailto:${contact.email}`} className="text-brand-blue">
                {contact.email}
              </a>
              .
            </p>
          ) : null}
        </div>
      </Section>
    </CaptureProvider>
  )
}
