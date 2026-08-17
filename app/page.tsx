import type { Metadata } from 'next'
import Image from 'next/image'
import { ConcernCard } from '@/components/concern-card'
import { ConcernPanel } from '@/components/concern-panel'
import { Container } from '@/components/container'
import { HomeFlow } from '@/components/home-flow'
import { BuildingIcon, PersonIcon } from '@/components/icons'
import { concerns, concernsFor, paths, spansFullWidth } from '@/content/concerns'
import { homeCopy } from '@/content/home/copy'
import { contact, siteConfig } from '@/lib/site'

/**
 * The homepage. Five moves, in order, each one earned by the visitor's previous action.
 *
 *   1. Sparse hero            name and headline only
 *   2. Trust proof            four real stats and one quiet regulatory line
 *   3. One binary choice      myself/family, or my company
 *   4. Concern selection      four cards per path, revealed after the choice
 *   5. Drill-down             the six-part panel, revealed after a card
 *
 * ---- STOP ADDING THINGS TO THIS PAGE ----
 *
 * This replaced a ten-section homepage on 2026-08-16 and the deletions were the point.
 * No About section, no insurer logo wall, no testimonial carousel, no extra proof
 * points, no second call to action. The homepage's entire job is three moves: say what
 * the firm does, show that other people trust it, and ask what brought the visitor here.
 * Everything past that is earned by a click into a specific concern.
 *
 * Where the old sections went, so nobody re-adds them here looking for them:
 *   - the enquiry form and the FAQ now sit on each concern's own page, where the
 *     question being answered is known and the lead can be tagged with it
 *   - the two lead magnets moved to /services and /employee-benefits
 *   - the "what we arrange" grid is replaced by the concern grid, which does the same
 *     job with the visitor's words instead of the firm's
 *   - the case study is on /beyond-employer-cover, which is the claim it proves
 *
 * ---- No subtext under the fork buttons ----
 *
 * It was tried twice and removed twice. The subtext consistently read as re-introducing
 * the clutter this page exists to remove. The two labels are enough.
 *
 * ---- No photographs on the fork or the cards ----
 *
 * Also tried and reverted. Selection steps stay lean; feeling is earned at the
 * drill-down, where the lead image finally appears. See components/concern-panel.tsx.
 */
export const metadata: Metadata = {
  // `absolute` because app/layout.tsx templates titles as "%s | TIC", which would render
  // this as "... | The Insurance Concierge | TIC".
  title: { absolute: homeCopy.meta.title },
  description: homeCopy.meta.description,
}

const forkIcons = { individual: PersonIcon, company: BuildingIcon } as const

/**
 * Organisation schema. Kept minimal and factual: no aggregate rating, no invented
 * founding date, no address the site does not otherwise publish.
 *
 * There is deliberately no `telephone` — the published number is out of service and was
 * swept from the site on 2026-08-16. Do not add one back without checking it answers.
 *
 * There is deliberately no `sameAs` either. It listed the Facebook and LinkedIn profiles
 * until 2026-08-17, when both were dropped sitewide for being thin (see `contact` in
 * lib/site.ts). The field was removed rather than left as an empty array: `sameAs: []`
 * tells a search engine the firm has no profiles, which is a claim, where an absent field
 * simply says nothing. Bring it back with the links, not before.
 */
const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo-mark.png`,
  email: contact.email,
  description: homeCopy.meta.description,
  areaServed: 'SG',
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from the literal above. No user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />

      {/*
        1. Hero. Name and headline over the photograph. Nothing else belongs here.

        THE PHOTOGRAPH IS THE OLD SITE'S OWN HERO, restored on 2026-08-17 on the owner's
        instruction. It was pulled from Wix during Phase 1, dropped from the tree, and
        recovered from git history at c22e5f27. The Wix markup had it as a column-strip
        `bgImage` with `displayMode: fill` behind a `colorUnderlay`, which is the same
        treatment rebuilt below — full bleed, with a wash over it so the ink still reads.

        ⚠ TWO THINGS THAT WERE FLAGGED AND OVERRULED, recorded so they are not rediscovered
        as if they were oversights:

          1. The homepage deliberately had no photograph. The rule that stands is the one
             below about the FORK AND THE CARDS: selection steps stay lean and imagery is
             earned at the drill-down. A hero is not a selection step, so the two can
             coexist — but do not read this as licence to put photographs back on the
             cards.
          2. LICENSING IS UNCONFIRMED. This came off Wix as stock, and a sibling file in
             the same capture was Unsplash-sourced through Wix's integration. A licence
             covering the Wix site does not automatically cover this one. Confirm the
             provenance; if it does not hold, this is the file to pull.

        `object-left` on the image, not the default centre: the subject sits in the left
        third and the right two-thirds is bright curtain. Cropping from the centre on a
        narrow viewport would cut her out and leave an empty wash.

        Sized by `fill` rather than intrinsic dimensions because it is a background that
        has to cover an arbitrary box. The section carries its own min-height so there is
        nothing to shift: the image never decides the layout. `priority` because this is
        the largest element above the fold and lazy-loading it would delay LCP.
      */}
      <section className="relative isolate flex min-h-[26rem] items-center overflow-hidden bg-surface-subtle md:min-h-[32rem]">
        <Image
          src="/images/home-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[38%_center] md:object-left"
        />
        {/*
          The wash, and it is DELIBERATELY LIGHT. Wix used a flat colour underlay; the
          first attempt here rebuilt that at full strength and erased the photograph
          completely — a 14.05:1 headline over what may as well have been a plain stone
          background. Contrast was never the constraint: the photograph is high-key, the
          bright curtain reads at 0.85 luminance and even the chair sits near 0.55, so ink
          clears large-text contrast against the whole frame without help.

          What the wash is actually for is knocking the photograph back far enough that it
          reads as ground rather than as subject, and unifying its warm cast with the
          page's stone. It is the page's own colour rather than black or white, so the
          hero belongs to the site instead of looking like a photo with a filter on it.

          Slightly stronger on the left, where the woman and the chair are the only
          mid-tones in the frame, and lighter to the right where there is nothing but
          curtain to protect. Every figure above was measured off the rendered pixels
          rather than judged by eye.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-surface-subtle/65 via-surface-subtle/45 to-surface-subtle/35"
        />
        <Container className="relative w-full py-16 text-center md:py-24">
          <p className="text-eyebrow uppercase text-ink-muted">{siteConfig.name}</p>
          <h1 className="mx-auto mt-4 max-w-[38rem] text-display-md sm:text-display-lg text-ink">
            {homeCopy.hero.headline}
          </h1>
          {/*
            `text-balance` because at 390px the line breaks after "in" and orphans
            "Singapore" on a line of its own, which is conspicuous set over a photograph.
          */}
          <p className="mx-auto mt-5 max-w-[30rem] text-balance text-lg/8 text-ink-muted">
            {homeCopy.hero.subhead}
          </p>
        </Container>
      </section>

      {/* 2. Trust proof. Four real stats, then one footnote-weight line. */}
      <section className="border-y border-border bg-surface">
        <Container className="py-10">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 text-center md:grid-cols-4">
            {homeCopy.trust.stats.map((stat) => (
              /*
               * flex-col-reverse so the figure reads above its label while the DOM keeps
               * <dt> before <dd>, which is what a description list requires.
               */
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-ink-muted">{stat.label}</dt>
                <dd className="text-display-sm font-medium text-ink">{stat.figure}</dd>
              </div>
            ))}
          </dl>
          {/*
            Footnote weight, deliberately, not a fifth stat.

            This was promoted to body size on 2026-08-16 on the strength of a design
            review, then reverted the same day: at that weight the claim dominated the
            band and started arguing with the visitor before they had been asked anything.
            The homepage's job is to ask one question, and a paragraph defending the
            firm's pricing sits in front of it. The claim is not lost — /employee-benefits
            makes it, and the `how-does-the-insurance-concierge-get-paid` answer linked
            from several concern pages makes it at length.

            The wording is the safest true claim available and is not to be strengthened
            without checking the firm's own registration category first. It asserts only
            that the insurers are regulated. "Agent" and "broker" are distinct
            registrations in Singapore, and the firm is externally categorised as an
            insurance agent, so any wording that implies brokerage is a claim nobody has
            verified. Note the footer separately carries the live site's own regulatory
            disclosure verbatim; this line does not replace it.
          */}
          <p className="mt-8 text-center text-eyebrow text-ink-muted">
            {homeCopy.trust.line}
          </p>
        </Container>
      </section>

      <HomeFlow>
        <div data-concern-flow>
          {/*
            3. One binary choice.

            `id="talk-to-us"` is inherited, not invented. It named the enquiry form on the
            old homepage and is linked from the header's CTA button, from
            /international-health-insurance and from /employee-benefits. The form has
            moved to the concern pages, where the question being answered is known — so
            the anchor now lands on the fork, which is the site's actual ask: tell us
            which situation is yours. Every existing link keeps working and keeps meaning
            what it meant. Do not remove it without sweeping those call sites.

            scroll-mt-20 clears the sticky header, which components/section.tsx bakes in
            for the sections that use it and this hand-rolled one does not get for free.
          */}
          <section
            id="talk-to-us"
            aria-labelledby="fork-heading"
            className="scroll-mt-20 bg-surface-subtle"
          >
            <Container className="pt-14 pb-2 md:pt-20">
              <fieldset className="text-center">
                <legend
                  id="fork-heading"
                  // A <legend>, so the base layer's heading rules do not reach it and
                  // the display face has to be asked for explicitly.
                  className="mx-auto font-serif text-display-xs sm:text-display-sm text-ink"
                >
                  {homeCopy.fork.heading}
                </legend>

                <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
                  {paths.map((path) => {
                    const Icon = forkIcons[path.audience]
                    return (
                      /*
                        The id makes each fork option a real anchor target. Concern pages
                        link back here as `/#individual` or `/#company`, so with no
                        JavaScript the browser scrolls to the fork and the visitor picks
                        again by hand; components/home-flow.tsx enhances that into having
                        the choice already made. The link is not dependent on the script.
                      */
                      <div key={path.audience} id={path.audience} className="scroll-mt-24">
                        {/*
                          A real radio, visually hidden. The fork is a genuine choice
                          between two options, so a radio group is what it is — and it
                          means app/globals.css can drive the whole reveal with :has()
                          and no JavaScript. The label is the next sibling so Tailwind's
                          `peer-checked` can style the selected state.
                        */}
                        <input
                          type="radio"
                          name="tic-path"
                          id={`tic-path-${path.audience}`}
                          value={path.audience}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`tic-path-${path.audience}`}
                          className={`flex cursor-pointer flex-col items-center gap-2 rounded-(--radius-panel) border border-border bg-surface px-4 py-7 text-center hover:border-ink-muted peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-blue ${
                            path.audience === 'company'
                              ? 'peer-checked:border-brand-blue-600 peer-checked:bg-brand-blue-50'
                              : 'peer-checked:border-brand-green-600 peer-checked:bg-brand-green-50'
                          }`}
                        >
                          {/*
                            Line-style SVG, not emoji. 👤 and 🏢 were tried on these two
                            buttons and replaced: they undermine the restrained visual
                            language and render inconsistently across platforms. Do not
                            reintroduce emoji anywhere in this flow.
                          */}
                          <Icon className="h-6 w-6 text-ink-muted" />
                          <span className="font-serif text-lg text-ink">{path.label}</span>
                        </label>
                      </div>
                    )
                  })}
                </div>
              </fieldset>
            </Container>
          </section>

          {/* 4. Concern selection, revealed by the choice above. */}
          <section aria-label="Choose your situation" className="bg-surface-subtle">
            <Container className="pb-14 md:pb-20">
              {paths.map((path) => (
                <div
                  key={path.audience}
                  data-concern-group={path.audience}
                  className="pt-10"
                >
                  {/*
                    For the no-:has() fallback only. There both grids render at once and
                    each needs saying whose it is; where :has() is supported the fork
                    above already answers the question and app/globals.css hides these.
                  */}
                  <h2
                    data-concern-group-heading
                    className="text-display-xs text-ink sm:text-center"
                  >
                    {path.label}
                  </h2>

                  <p className="mt-2 text-sm text-ink-muted sm:text-center">
                    {homeCopy.concerns.intro}
                  </p>

                  {/*
                    56rem, not the 72rem container, so the grid shares an edge with the
                    panel that opens beneath it — ConcernPanel is `mx-auto max-w-[56rem]`
                    and the two were 108px out on each side at 1280.

                    The cards moved rather than the panel because the panel's width is
                    load-bearing: its copy is set to a 42rem measure, and stretching it to
                    the full container would leave roughly 220px of empty space beside
                    every paragraph. Card labels are two or three words and lose nothing by
                    being narrower. If one of these two numbers changes, change both.
                  */}
                  <ul className="mx-auto mt-6 grid max-w-[56rem] gap-4 sm:grid-cols-2">
                    {concernsFor(path.audience).map((concern, index, all) => (
                      <li
                        key={concern.key}
                        /*
                          An odd-numbered grid leaves one card alone on the last row
                          whatever the order, so the last one spans both columns and reads
                          as a deliberate closer rather than a leftover. The rule lives in
                          the content module so the next odd grid is not solved a
                          different way. See spansFullWidth.
                        */
                        className={
                          spansFullWidth(index, all.length) ? 'sm:col-span-2' : undefined
                        }
                      >
                        {/*
                          A real link to a real page, enhanced into an inline reveal by
                          components/home-flow.tsx. With scripting off it simply
                          navigates, and the destination renders the identical panel.
                        */}
                        <ConcernCard concern={concern} interactive />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Container>
          </section>

          {/*
            5. The drill-downs.

            All eight are server-rendered and hidden, rather than fetched on demand. The
            reveal is then instant and needs no network, and every panel is in the HTML
            for anything that does not run scripts. The cost is roughly 25KB of markup on
            a page with no other weight, which is the right trade for a static export on
            a CDN. Each concern's own route is canonical for its content.
          */}
          <section aria-label="Details" className="bg-surface-subtle">
            <Container className="pb-20">
              {concerns.map((concern) => (
                <div key={concern.key} data-concern-panel={concern.key} hidden>
                  <ConcernPanel concern={concern} ctaHref={`${concern.path}#talk-to-us`} />
                </div>
              ))}
            </Container>
          </section>
        </div>
      </HomeFlow>
    </>
  )
}
