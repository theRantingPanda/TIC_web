import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CardGrid } from '@/components/card-grid'
import { ConcernPage, metadataFor } from '@/components/concern-page'
import { FeatureCard } from '@/components/feature-card'
import { LeadMagnetPanel } from '@/components/lead-magnet-panel'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { contact } from '@/lib/site'

/**
 * Maternity and newborn, absorbed into the concern pattern on 2026-08-16.
 *
 * This is the "Planning for a family" concern. It keeps its indexed path rather than
 * getting a new one, which is the whole reason to absorb it: /maternity-insurance
 * already ranks and already carries the site's search equity for this subject, and a
 * second page competing with it on the same topic would be a cost with no benefit.
 *
 * ---- What moved, and what stayed ----
 *
 * The panel now carries the timing argument, the expat-without-subsidy point, the three
 * things to consider, and what the firm does. Those were sections on this page and are
 * NOT repeated below; they live in content/concerns/index.ts and render identically
 * here and on the homepage.
 *
 * What stayed is what the six-part panel has no slot for: where the visitor is on the
 * clock, the company-scheme question, and the newborn as a second decision. This page
 * was the best-written on the site before the rebuild and absorbing it must not cost
 * those.
 *
 * ---- TWO THINGS THIS PAGE MUST NOT DO ----
 *
 * It must not state a waiting period length, a maternity limit or a premium. None is
 * published, all vary by plan, and a number here would be checked.
 *
 * Every claim about insurer behaviour is hedged. Do not tighten one into a flat
 * assertion. The case on /beyond-employer-cover features a company scheme that DID
 * cover a newborn generously, so saying flatly that company plans leave maternity out
 * would contradict the site's own best evidence.
 */
const PATH = '/maternity-insurance'

export const metadata: Metadata = metadataFor(PATH)

const clock = [
  {
    title: 'Planning, not yet trying',
    body: 'This is the point where the timing still belongs to you. Cover arranged now has room to run its waiting period before there is anything to claim for. The cost of being early is premium paid before there is anything to claim for. The cost of being late is that this pregnancy is usually outside the cover.',
  },
  {
    title: 'Trying now',
    body: 'Worth a conversation this week rather than next. Waiting periods differ by plan, so whether there is still room depends on which one you are looking at. We can tell you plainly whether the timing still works or whether it has gone.',
  },
  {
    title: 'Already pregnant',
    body: 'A pregnancy already under way is usually excluded from a new plan, and it is worth being wary of anyone who suggests otherwise. What is still open is what your current cover does for complications, how the baby goes on cover once they are born, and what you put in place before the next one.',
  },
] as const

export default function Page() {
  return (
    <ConcernPage path={PATH}>
      <Section tone="surface" labelledBy="clock-heading">
        <SectionHeading
          id="clock-heading"
          title="Where you are on the clock"
          lede="The same question has a different answer depending on when you ask it."
        />
        <div className="mt-10">
          <CardGrid columns={3}>
            {clock.map((card) => (
              <li key={card.title}>
                <FeatureCard title={card.title} body={card.body} />
              </li>
            ))}
          </CardGrid>
        </div>

        <div className="mt-10 max-w-2xl">
          <LeadMagnetPanel
            audience="If you are working out the timing"
            intro="The one page we send people who are planning rather than already pregnant."
            magnetTitle="The maternity and newborn timeline"
            magnetBody="When to buy, what the waiting periods actually mean, and the point after which it is too late. One page, no jargon."
            buttonLabel="Send me the timeline"
            source="maternity-timeline"
            list="individual"
            contactEmail={contact.email}
          />
        </div>
      </Section>

      <Section tone="subtle" labelledBy="work-cover-heading">
        <SectionHeading
          id="work-cover-heading"
          title="If your maternity cover comes through work"
        />
        <div className="mt-8 max-w-[46rem] space-y-5">
          {/*
            Hedged deliberately. The case on /beyond-employer-cover features a company
            scheme that covered a newborn from birth to a substantial limit, and this
            page links to it three sentences later. Saying flatly that company plans
            leave maternity out would contradict the site's own best evidence.
          */}
          <p className="text-base/8 text-ink">
            Company schemes vary more here than on almost any other benefit. Some leave
            maternity out entirely. Some include it with a limit that covers a routine
            delivery and not much beyond it. Some are genuinely generous. Most people find
            out which one they are on at the moment they need to know, which is the worst
            possible time to find out.
          </p>
          <p className="text-base/8 text-ink">
            So it is worth reading your own scheme&rsquo;s maternity line before you plan
            around it, and worth checking one thing more. Does the cover follow you if you
            change jobs while pregnant, or if your partner does? Cover through work
            belongs to the job, not to you.
          </p>
          <p className="text-base/8 text-ink">
            The same mechanic catches people who already have cover and want to move to a
            plan with better maternity terms. Moving usually means fresh underwriting, and
            waiting periods usually start again from the new policy date. Some schemes let
            you continue without fresh underwriting. Many do not, and most people have
            never checked which one they are on.
          </p>
          <p className="text-base/8 text-ink">
            Where a company plan does cover maternity, sitting a personal plan alongside
            it is sometimes worth doing and sometimes not. It depends on what the scheme
            already does. We would rather tell you a second policy is not needed than sell
            you one.{' '}
            <Link href="/beyond-employer-cover" className="text-brand-blue">
              One case shows a company scheme tested at exactly that moment
            </Link>
            : a baby 9 weeks early, and what the scheme did and did not reach.
          </p>
        </div>
      </Section>

      <Section tone="surface" labelledBy="newborn-heading">
        <SectionHeading id="newborn-heading" title="The newborn is a second decision" />
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-[46rem] space-y-5">
            {/*
              "The exposure starts" rather than "cover starts". Cover from the date of
              birth is something the insurer decides, and on the case this page links to
              it was a concession in one instance. Stating it as automatic would be a
              guarantee nobody has given.
            */}
            <p className="text-base/8 text-ink">
              A baby is a separate life to insure, and the exposure starts on the day they
              are born rather than the day the paperwork catches up. Plans differ on how
              they handle it. Some cover a newborn automatically for a short window and
              then ask for an application. Some want the application straight away. The
              terms for a baby who needs care in the first days differ most of all, and
              those are the terms worth reading before you need them.
            </p>
            <p className="text-base/8 text-ink">
              Congenital conditions are the ones to look at specifically. They are the
              reason newborn cover exists, and they are also the benefit that plans word
              most carefully.
            </p>
            <p className="text-base/8 text-ink">
              The rest of it is administration, and it lands in the week you have the
              least attention to give it. Enrolling the baby, getting the dates right,
              putting the case for cover to run from the date of birth rather than from
              the date the form arrived. We do that part, and it costs you nothing extra.
            </p>
          </div>
          {/*
            Sized explicitly because images are served unoptimised, so the intrinsic
            dimensions are what prevent layout shift. Portrait original, cropped to a
            square-ish frame so it sits level with the copy beside it.
          */}
          <Image
            src="/images/nsplsh-496637654d2d6637456867-mv2-d-3712-5568-s-4-2-30ef3791.jpg"
            alt=""
            width={1333}
            height={1999}
            sizes="(min-width: 1024px) 28rem, 100vw"
            className="h-72 w-full rounded-(--radius-panel) object-cover object-top sm:h-96"
          />
        </div>
      </Section>
    </ConcernPage>
  )
}
