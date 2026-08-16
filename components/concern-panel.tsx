import Image from 'next/image'
import Link from 'next/link'
import { CtaButton } from '@/components/cta-button'
import type { Concern } from '@/content/concerns'

/**
 * The drill-down panel: one concern, in the fixed six-part structure.
 *
 * Rendered in two places from one source — inline on the homepage once the visitor
 * selects a concern, and as the body of that concern's own route. Both get identical
 * markup, which is the point: the URL is a real page, not a consolation prize for
 * arriving without JavaScript.
 *
 * THE LEAD IMAGE APPEARS HERE AND NOWHERE EARLIER IN THE FLOW. Photographs were tried on
 * the fork buttons and on the concern cards and reverted both times. The principle that
 * survived is that selection steps stay lean and feeling is earned at the drill-down, so
 * a picture only earns its place once the visitor has committed to a specific situation.
 * Do not add thumbnails to the cards.
 *
 * Where a real photograph does not exist yet the brief renders in its place, visibly
 * unfinished. That is deliberate: a grey box with a brief in it is honest about what is
 * missing, and real photography beats stock here. Do not fill these with stock — the
 * generic "Team Meeting" shot was flagged as a weakness on the page this replaces.
 *
 * `headingLevel` exists because the same panel is an <h2> under the homepage's flow and
 * an <h1> on its own page. Everything below it steps down accordingly.
 */
export function ConcernPanel({
  concern,
  headingLevel = 'h2',
  ctaHref,
}: {
  concern: Concern
  headingLevel?: 'h1' | 'h2'
  /** Where the closing call to action goes. The routes point it at their own form. */
  ctaHref: string
}) {
  const Heading = headingLevel
  const SubHeading = headingLevel === 'h1' ? 'h2' : 'h3'
  const company = concern.audience === 'company'

  // Path identity is carried by tint and rule, never by colouring body copy: the logo's
  // green fails text contrast until its 800 step, so green text would be a different
  // green from the mark. Green is the individual path, blue is the company path.
  const rule = company ? 'border-brand-blue-600' : 'border-brand-green-600'
  const tint = company ? 'bg-brand-blue-50' : 'bg-brand-green-50'

  return (
    /*
      Narrower than the 72rem container it sits in. The copy inside is set to a 42rem
      measure for readability, and a card stretched to the full container leaves a third
      of itself empty beside every paragraph, which reads as a layout fault rather than
      as white space. 56rem holds the measure with a margin either side.
    */
    <article className="mx-auto max-w-[56rem] overflow-hidden rounded-(--radius-inset) border border-border bg-surface">
      {concern.image.kind === 'photo' ? (
        <Image
          src={concern.image.src}
          alt={concern.image.alt}
          width={concern.image.width}
          height={concern.image.height}
          sizes="(min-width: 1024px) 56rem, 100vw"
          className="aspect-16/7 w-full object-cover"
        />
      ) : (
        /*
          Deliberately NOT the 16:7 the real photograph gets. Reserving a photo's height
          for a note leaves half a screen of empty tint above copy that is finished and
          ready to read, which makes the panel look broken rather than unfinished. A
          brief is a line of production instruction, so it takes a line's worth of room.
          The real image takes the full ratio when it arrives.
        */
        <p className={`border-b border-border px-6 py-3 text-eyebrow text-ink-muted ${tint}`}>
          {concern.image.brief}
        </p>
      )}

      <div className="p-6 sm:p-10 lg:p-12">
        <p className="text-eyebrow uppercase text-ink-muted">Their situation</p>
        <Heading className="mt-2 text-display-sm sm:text-display-md text-ink">
          {concern.panelTitle}
        </Heading>

        <div className="mt-5 max-w-[42rem] space-y-4">
          {concern.situation.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-base/8 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {/* 2. The case. Always present, even while it is a placeholder. */}
        <p className="mt-10 text-eyebrow uppercase text-ink-muted">A real case</p>
        <blockquote className={`mt-3 max-w-[42rem] border-l-2 py-1 pl-5 ${rule}`}>
          {concern.case.kind === 'real' ? (
            <>
              {concern.case.paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className={`text-base/8 text-ink ${index > 0 ? 'mt-4' : ''}`}
                >
                  {paragraph}
                </p>
              ))}
              {/* The verdict, set apart because it is not more narrative. */}
              <p className="mt-4 font-medium text-ink">{concern.case.footer}</p>
            </>
          ) : (
            /*
              Italic and muted because it is unfinished, not because it is a quotation.
              When a real case replaces it, it renders in the branch above: full ink, no
              italics, reading as the strongest thing on the panel, which it will be.
            */
            <p className="text-base/7 italic text-ink-muted">{concern.case.brief}</p>
          )}
        </blockquote>

        {/* 3. Numbers, only where a real on-topic figure exists. */}
        {concern.numbers ? (
          <div className="mt-10">
            <SubHeading className="text-display-xs text-ink">
              {concern.numbers.heading}
            </SubHeading>
            {concern.numbers.intro ? (
              <p className="mt-3 max-w-[42rem] text-base/8 text-ink-muted">
                {concern.numbers.intro}
              </p>
            ) : null}

            {concern.numbers.table ? (
              <table className="mt-4 w-full max-w-sm border-collapse text-left">
                <thead>
                  <tr>
                    {concern.numbers.table.columns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="border-b border-border py-2 text-eyebrow font-medium uppercase text-ink-muted"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {concern.numbers.table.rows.map((row) => (
                    <tr key={row[0]}>
                      <th
                        scope="row"
                        className="border-b border-border py-2.5 font-normal text-ink-muted"
                      >
                        {row[0]}
                      </th>
                      <td className="border-b border-border py-2.5 font-medium text-ink">
                        {row[1]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {/*
              The configuration disclosure. Load-bearing wherever a figure appears: these
              numbers are what they are because the cover is narrow, and a reader who
              sees the figure without the configuration has been misled. Never trim it to
              balance the layout.
            */}
            <p className="mt-4 max-w-[42rem] text-eyebrow text-ink-muted">
              {concern.numbers.footnote}
            </p>
          </div>
        ) : null}

        {/* 4. Three things to consider. */}
        <div className="mt-10">
          <SubHeading className="text-display-xs text-ink">
            Three things to consider
          </SubHeading>
          <dl className="mt-4 max-w-[42rem] space-y-4">
            {concern.considerations.map((item) => (
              <div key={item.term}>
                <dt className="font-medium text-ink">{item.term}</dt>
                <dd className="mt-1 text-base/7 text-ink-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 5. What we do. Administration and comparison only. */}
        <div className="mt-10">
          <SubHeading className="text-display-xs text-ink">What we do</SubHeading>
          <ul className="mt-4 max-w-[42rem] space-y-3">
            {concern.whatWeDo.map((item) => (
              <li key={item.slice(0, 40)} className="flex gap-3 text-base/7 text-ink-muted">
                <span
                  aria-hidden="true"
                  className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    company ? 'bg-brand-blue-600' : 'bg-brand-green-600'
                  }`}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 6. One call to action. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaButton href={ctaHref}>{concern.ctaLabel}</CtaButton>
          {concern.furtherReading ? (
            <Link
              href={concern.furtherReading.href}
              className="text-sm font-medium text-brand-blue no-underline hover:text-brand-blue-700"
            >
              {concern.furtherReading.label}
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
