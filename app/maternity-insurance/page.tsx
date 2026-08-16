import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CardGrid } from '@/components/card-grid'
import { Container } from '@/components/container'
import { Faq, type FaqItem } from '@/components/faq'
import { FeatureCard } from '@/components/feature-card'
import { LeadMagnetPanel } from '@/components/lead-magnet-panel'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { readPost } from '@/lib/content'
import { contact } from '@/lib/site'

/**
 * Maternity and newborn.
 *
 * Rewritten 2026-08-16, replacing content the owner has said is obsolete.
 *
 * TIMING is the whole argument, per the copy deck: waiting periods mean the cover has to
 * be in place long before it is needed, so the page's job is to make someone who is
 * planning act now rather than later.
 *
 * TWO THINGS THIS PAGE MUST NOT DO.
 *
 * It must not state a waiting period length, a maternity limit or a premium. None is
 * published, all vary by plan, and a number here would be checked.
 *
 * And it must not restate the homepage's case study. That case is permission-cleared and
 * carries most of the site's persuasive weight where it is; repeating it here dilutes it.
 * This page points at it instead. Note the case features a company scheme that DID cover
 * a newborn generously, so the copy about company plans is hedged accordingly — saying
 * flatly that company plans leave maternity out would contradict the homepage four
 * sentences before linking to it.
 *
 * Every claim about insurer behaviour is hedged. Do not tighten one into a flat
 * assertion: the homepage itself says some schemes let you continue without fresh
 * underwriting while many do not, and this page must not contradict that.
 */
export const metadata: Metadata = {
  title: 'Maternity and newborn cover in Singapore',
  description:
    'Maternity benefits usually carry a waiting period, so timing decides this one. Where you are on the clock, and what we do once the cover is in place.',
}

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

const afterCover = [
  {
    title: 'Before the admission',
    body: 'Most plans want a pre-authorisation before a planned admission. We tell you what your plan needs and when it needs it, and we deal with the form. Approval is the insurer’s decision, not ours, but the paperwork should never be the reason it is late.',
  },
  {
    title: 'When the baby arrives',
    body: 'A new dependant means forms, dates and evidence, usually inside a window. Enrolments, additions, a change of country, a document an insurer says it never received. That is where cover quietly goes wrong, so we handle that side of it rather than leaving it to land on you at the worst possible time.',
  },
  {
    title: 'At the next renewal',
    body: 'Premiums climb, and some years the increase is harder to justify than others. When that happens we look at what else is open to you and say plainly whether moving is worth it. Often it is not, because moving usually restarts waiting periods and means fresh underwriting of a history that now has a pregnancy and a child in it.',
  },
] as const

const questionSlugs = [
  'does-my-plan-cover-maternity-and-newborn-care',
  'will-my-pre-existing-conditions-be-covered',
  'how-do-i-get-pre-authorisation-for-a-planned-procedure',
] as const

export default function Page() {
  const faqItems: FaqItem[] = questionSlugs.map((slug) => {
    const post = readPost(slug)
    return {
      question: post.frontmatter.title,
      answer: post.frontmatter.summary,
      href: `/single-post/${post.frontmatter.slug}`,
    }
  })

  return (
    <>
      <section className="border-b border-border bg-surface-subtle">
        <Container className="py-16 md:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h1 className="text-display-lg sm:text-display-xl text-ink">
                Maternity cover runs on a clock
              </h1>
              <p className="mt-6 text-lg/8 text-ink-muted">
                Plans usually make you wait before maternity benefits begin, so the cover
                has to be in place long before there is anything to claim for. And once a
                pregnancy has started it is usually excluded from a new plan. That is the
                whole argument on this page, and it is why this is a conversation worth
                having early.
              </p>
            </div>
            <Image
              src="/images/50b90fb3dac547b58b92ffce7e9c2e6a-2e95b71a.jpg"
              alt=""
              width={2000}
              height={1333}
              sizes="(min-width: 1024px) 32rem, 100vw"
              priority
              className="h-64 w-full rounded-(--radius-panel) object-cover sm:h-80 lg:h-96"
            />
          </div>
        </Container>
      </section>

      <Section labelledBy="clock-heading">
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

      <Section tone="subtle" labelledBy="timing-heading">
        <SectionHeading id="timing-heading" title="Why the timing is the whole of it" />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            A waiting period is the gap between the day your cover starts and the day
            maternity benefits become available on it. How long it runs depends on the
            plan. What it means in practice does not change: buy after the pregnancy has
            begun and you are usually buying cover that will not pay for this one.
          </p>
          <p className="text-base/8 text-ink">
            The same mechanic catches people who already have cover and want to move to a
            plan with better maternity terms. Moving usually means fresh underwriting, so
            anything diagnosed since you last applied may be excluded or loaded, and
            waiting periods usually start again from the new policy date. Some schemes let
            you continue without fresh underwriting. Many do not, and most people have
            never checked which one they are on. Sometimes moving is still the right call.
            Often it is not, and we will say so.
          </p>
          <p className="text-base/8 text-ink">
            There is a second reason timing matters more here than almost anywhere else.
            As an expat you sit outside the subsidised system Singapore residents fall
            back on, so a maternity bill arrives with nothing taken off it. A
            straightforward delivery is manageable. An emergency caesarean and a stay in
            neonatal intensive care is a different number altogether, and it arrives with
            no notice.
          </p>
        </div>
      </Section>

      <Section labelledBy="work-cover-heading">
        <SectionHeading
          id="work-cover-heading"
          title="If your maternity cover comes through work"
        />
        <div className="mt-8 max-w-[46rem] space-y-5">
          {/*
            Hedged deliberately. The homepage's case study features a company scheme that
            covered a newborn from birth to a substantial limit, and this page links to it
            three sentences later. Saying flatly that company plans leave maternity out
            would contradict the site's own best evidence.
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
            Where a company plan does cover maternity, sitting a personal plan alongside
            it is sometimes worth doing and sometimes not. It depends on what the scheme
            already does. We would rather tell you a second policy is not needed than sell
            you one.
          </p>
          <p className="text-base/8 text-ink">
            One case on our homepage is a company scheme tested at exactly that moment: a
            baby 9 weeks early, and what the scheme did and did not reach.{' '}
            <Link href="/#case-heading" className="text-brand-blue">
              Read what happened
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section tone="subtle" labelledBy="newborn-heading">
        <SectionHeading id="newborn-heading" title="The newborn is a second decision" />
        <div className="mt-8 max-w-[46rem] space-y-5">
          {/*
            "The exposure starts" rather than "cover starts". Cover from the date of birth
            is something the insurer decides, and on the homepage case it was a
            concession in one instance. Stating it as automatic would be a guarantee.
          */}
          <p className="text-base/8 text-ink">
            A baby is a separate life to insure, and the exposure starts on the day they
            are born rather than the day the paperwork catches up. Plans differ on how
            they handle it. Some cover a newborn automatically for a short window and then
            ask for an application. Some want the application straight away. The terms for
            a baby who needs care in the first days differ most of all, and those are the
            terms worth reading before you need them.
          </p>
          <p className="text-base/8 text-ink">
            Congenital conditions are the ones to look at specifically. They are the
            reason newborn cover exists, and they are also the benefit that plans word
            most carefully.
          </p>
          <p className="text-base/8 text-ink">
            The rest of it is administration, and it lands in the week you have the least
            attention to give it. Enrolling the baby, getting the dates right, putting the
            case for cover to run from the date of birth rather than from the date the
            form arrived. We do that part, and it costs you nothing extra.
          </p>
        </div>
      </Section>

      <Section labelledBy="after-heading">
        <SectionHeading
          id="after-heading"
          title="What happens once the cover is in place"
          lede="The premium is the same whether you come to us or go direct to the insurer. What changes is who does the running around afterwards."
        />
        <div className="mt-10">
          <CardGrid columns={3}>
            {afterCover.map((card) => (
              <li key={card.title}>
                <FeatureCard title={card.title} body={card.body} />
              </li>
            ))}
          </CardGrid>
        </div>
      </Section>

      <Section tone="subtle" labelledBy="questions-heading">
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

      <Section labelledBy="start-heading">
        <SectionHeading id="start-heading" title="Tell us where you are on the clock" />
        <p className="mt-8 max-w-[46rem] text-base/8 text-ink">
          Planning, trying, or already pregnant, the useful answer depends on which. Tell
          us that much and we will tell you plainly whether the timing still works.
        </p>
        <p className="mt-8">
          <Link
            href="/#talk-to-us"
            className="inline-block rounded-md bg-brand-green px-5 py-3 text-sm font-medium text-white no-underline hover:bg-brand-green-700"
          >
            Tell us your timing
          </Link>
        </p>
      </Section>
    </>
  )
}
