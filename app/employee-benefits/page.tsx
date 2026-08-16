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
 * Employee benefits.
 *
 * Rewritten 2026-08-16, replacing content the owner has said is obsolete.
 *
 * Written for an HR DIRECTOR OR A CFO, not an HR administrator. The copy deck is
 * explicit about why: administration load is a problem a company can solve by hiring
 * someone junior, so leading on it pitches a reader a problem they have already dealt
 * with. Retention of senior and regional staff cannot be solved that way, which is why
 * it leads. The mechanics ("from 3 staff up", one policy, one renewal date) are further
 * down on purpose. They reassure. They do not persuade.
 *
 * This page is also the corporate door for the whole site: the homepage's second hero
 * CTA and the nav's "For companies" both land here until /business exists.
 *
 * ONE THING TO BE CAREFUL OF. Maternity has a deadline attached, and it is tempting to
 * tell a hiring manager to find out whether a candidate is planning a family before the
 * offer goes out. Do not. That points a hiring decision at an individual's family plans,
 * which is a discrimination problem before it is anything else. The deadline is pointed
 * at the SCHEME'S design instead: get the maternity terms right for everyone, in
 * advance, and no one has to ask anybody anything.
 */
export const metadata: Metadata = {
  title: 'Employee benefits for companies in Singapore',
  description:
    'Medical cover for companies in Singapore, from 3 staff up. We arrange the scheme and then we run it: enrolments, leavers, joiners, renewals.',
}

const mechanics = [
  {
    title: 'From 3 staff up',
    body: 'You do not need a large headcount to have a scheme. We arrange them from 3 staff upward, which is usually where the argument starts anyway, with the first few people you cannot afford to lose.',
  },
  {
    title: 'One policy, one renewal date',
    body: 'Instead of separate plans bought at different times on different terms, the company holds one policy with one renewal date. Joiners go on it, leavers come off it, and nobody is tracking a separate anniversary for every hire.',
  },
  {
    title: 'The paperwork is ours',
    body: 'Enrolments, additions, a leaver, a new baby, a change of country, a document an insurer says it never received. That is where a scheme quietly goes wrong. We handle that side of it, and it is the same person every time, so you are not explaining your scheme again to whoever picks up.',
  },
  {
    title: 'It costs you nothing extra',
    body: 'We are paid by commission built into the premium. The price is the same whether you come to us or go direct to the insurer, and what differs is who does the work afterwards.',
    link: {
      label: 'How we are paid',
      href: '/single-post/how-does-the-insurance-concierge-get-paid',
    },
  },
] as const

const questionSlugs = [
  'what-is-the-difference-between-international-and-local-health-insurance-in-singapore',
  'will-my-pre-existing-conditions-be-covered',
  'when-should-i-start-my-policy-renewal-process',
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
              <h1 className="text-display-md sm:text-display-lg lg:text-display-xl text-ink">
                The hire you want is deciding whether to move their family
              </h1>
              <p className="mt-6 text-lg/8 text-ink-muted">
                Another 50,000 on the package is appreciated. Cover answers the question
                salary cannot, which is what happens to us if something goes wrong out
                here. It is the cheapest retention you can buy for senior and regional
                hires.
              </p>
            </div>
            <Image
              src="/images/f84f9edff22c4f77a4be1f9898b2f8d6-64ced674.jpg"
              alt=""
              width={1920}
              height={1280}
              sizes="(min-width: 1024px) 32rem, 100vw"
              priority
              className="h-64 w-full rounded-(--radius-panel) object-cover sm:h-80 lg:h-96"
            />
          </div>
        </Container>
      </section>

      <Section labelledBy="offer-heading">
        <SectionHeading
          id="offer-heading"
          title="What the offer looks like from their side"
        />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            Salary is the part of an offer a candidate can compare. They have another
            number from somewhere else and they know roughly what the market pays. Cover
            is the part they cannot compare, because they have never had to use it here
            and have no idea what it is worth until they do.
          </p>
          {/*
            Careful with the subsidy point. Nobody is subsidised in a private hospital,
            resident or not: the subsidised tier is the public one. What an expat family
            lacks is the fallback, not a discount.
          */}
          <p className="text-base/8 text-ink">
            Most senior hires are not moving alone. There is usually a partner who will
            not be working for a while, and often children. Residents here have a
            subsidised public tier to fall back on. An expatriate family does not, so the
            bill arrives in full whichever hospital they end up in. That is the number a
            candidate cannot see from the outside, and it is the one their partner asks
            about.
          </p>
          <p className="text-base/8 text-ink">
            Salary is also the easiest line for another employer to beat, and it is the
            one your hire re-benchmarks every year. Cover is quieter. It gets noticed at
            the moment someone is working out whether this company looks after its people,
            and that moment usually arrives at the worst possible time.
          </p>
          {/*
            Pointed at the scheme's design, never at a candidate. Telling a hiring manager
            to find out whether someone is planning a family before an offer goes out is
            a discrimination problem, and the earlier draft did exactly that.
          */}
          <p className="text-base/8 text-ink">
            One part of this has a deadline built into it, and it is a reason to get the
            scheme right rather than to ask anyone anything. Maternity runs on its own
            clock, because waiting periods mean cover has to be in place long before it is
            needed, and plenty of company schemes cap it low or leave it out. Settle that
            line when the scheme is designed and it is never a conversation with an
            individual.
          </p>
        </div>
      </Section>

      <Section tone="subtle" labelledBy="regional-heading">
        <SectionHeading
          id="regional-heading"
          title="Your Jakarta hire and your Singapore hire"
        />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            A regional business ends up with people in several countries and, usually,
            several different standards of cover. The person in Singapore is fine. The
            person in Jakarta or Ho Chi Minh City is on whatever was available locally,
            and finds out what that means the first time they need a hospital.
          </p>
          <p className="text-base/8 text-ink">
            An international scheme is written around the person rather than the country.
            Where the plan allows it, your Jakarta hire and your Singapore hire go on the
            same terms, and treatment outside their base country is usually part of it.
            The detail differs by plan, so the terms are worth reading before anyone needs
            them.
          </p>
          {/*
            The caveat is not optional. This section proposes moving people off cover they
            already hold, which has real consequences for anyone mid-treatment.
          */}
          <p className="text-base/8 text-ink">
            Moving someone off cover they already hold is the part to plan carefully. A
            new insurer usually underwrites them again, so a condition covered on the old
            plan may come across excluded or loaded, and waiting periods can start again.
            For anyone already in treatment that matters a great deal. It is workable, but
            it is worth knowing before you commit rather than after.
          </p>
          <p className="text-base/8 text-ink">
            If your people deploy to worksites rather than offices, evacuation is the part
            that decides everything else, and it comes with its own set of questions.{' '}
            <Link href="/offshore-and-energy" className="text-brand-blue">
              Offshore and deployed teams
            </Link>
            .
          </p>
          <p className="text-base/8 text-ink">
            What changes when everyone is on the same scheme is not really the
            administration. It is that a regional move stops being the one your leadership
            treats as a risk.
          </p>
        </div>
      </Section>

      <Section labelledBy="scheme-heading">
        <SectionHeading
          id="scheme-heading"
          title="What a scheme looks like"
          lede="The mechanics, for whoever has to run this once the decision is made."
        />
        <div className="mt-10">
          <CardGrid columns={2}>
            {mechanics.map((card) => (
              <li key={card.title}>
                <FeatureCard
                  title={card.title}
                  body={card.body}
                  link={'link' in card ? card.link : undefined}
                />
              </li>
            ))}
          </CardGrid>
        </div>
      </Section>

      <Section tone="subtle" labelledBy="renewal-heading">
        <SectionHeading id="renewal-heading" title="When the renewal comes back higher" />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            Premiums climb, and some years the increase is harder to justify than others.
            When that happens we look at what else is open to you and put the options in
            front of you with the trade-offs stated rather than buried.
          </p>
          <p className="text-base/8 text-ink">
            Moving a scheme is not free, and the cost is not on the invoice. A new insurer
            usually underwrites the group again. Conditions that were covered on the old
            plan may come across excluded or loaded, and waiting periods can start again
            for everyone on it, including the person who is already in treatment.
            Sometimes the saving still justifies that. Often it does not, and we will say
            so.
          </p>
          <p className="text-base/8 text-ink">
            You get the comparison either way, and early enough for it to be a decision
            rather than a deadline.
          </p>
        </div>

        <div className="mt-10 max-w-2xl">
          {/*
            The one thing on this page written for an administrator rather than a
            decision maker, which is why it sits here rather than at the top.
          */}
          <LeadMagnetPanel
            audience="For whoever runs your renewal"
            intro="The renewal lands, someone asks for a census, and nobody can remember what was agreed last year."
            magnetTitle="The renewal season checklist"
            magnetBody="What to have ready, when to start, and the questions worth asking before you accept an increase. One page, written for the person who actually does it."
            buttonLabel="Send me the checklist"
            source="employee-benefits-renewal-checklist"
            list="corporate"
            contactEmail={contact.email}
          />
        </div>
      </Section>

      <Section labelledBy="questions-heading">
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

      <Section tone="subtle" labelledBy="cost-heading">
        <SectionHeading
          id="cost-heading"
          title="What this costs"
          lede="Headcount, ages and how the scheme is built decide the price, so we quote it rather than publish it."
        />
        <p className="mt-8 max-w-[46rem] text-base/8 text-ink">
          Tell us how many people, roughly what ages, and which countries they sit in, and
          we will come back with what it looks like. If you already have a scheme, the
          useful moment is about 60 days before it renews, so send us the date and we will
          start there.
        </p>
        <p className="mt-8">
          <Link
            href="/#talk-to-us"
            className="inline-block rounded-md bg-brand-green px-5 py-3 text-sm font-medium text-white no-underline hover:bg-brand-green-700"
          >
            Tell us about your team
          </Link>
        </p>
      </Section>
    </>
  )
}
