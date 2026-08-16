import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CardGrid } from '@/components/card-grid'
import { Container } from '@/components/container'
import { CtaButton } from '@/components/cta-button'
import { Faq, type FaqItem } from '@/components/faq'
import { FeatureCard } from '@/components/feature-card'
import { LeadMagnetPanel } from '@/components/lead-magnet-panel'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { concernsFor, spansFullWidth } from '@/content/concerns'
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
              {/*
                "The cheapest retention you can buy" was cut from the end of this
                paragraph on 2026-08-16. It is an unsubstantiated superlative and nobody
                has costed it against the alternatives, which is exactly the kind of claim
                an HR director or a CFO notices. The sentence is stronger without it: what
                remains is a statement about what cover does, which is checkable.

                Do not put it back, here or anywhere. The standing rule and the rest of
                the cut list are in content/concerns/index.ts.
              */}
              <p className="mt-6 text-lg/8 text-ink-muted">
                Another 50,000 on the package is appreciated. Cover answers the question
                salary cannot, which is what happens to us if something goes wrong out
                here. For a senior or regional hire deciding whether to move their family,
                that question sits somewhere behind every other line in the offer.
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

      <Section tone="surface" labelledBy="senior-package-heading">
        <SectionHeading
          id="senior-package-heading"
          title="What cover is worth on a senior package"
        />
        <div className="mt-10 max-w-2xl">
          {/*
            Rehomed from the old homepage on 2026-08-16. It belongs on the page whose
            stated reader is an HR director or a CFO rather than on a homepage whose job
            is now to ask one question and get out of the way.

            Aimed at whoever signs off the reward budget, not at whoever administers it.
            The renewal season checklist further down is the administrator's document and
            the two must not be merged: they are different readers on different lists.
          */}
          <LeadMagnetPanel
            audience="For HR directors and CFOs"
            intro="Building a package that holds onto senior and regional people, or working out what the medical line is actually worth in it."
            magnetTitle="What cover is worth on a senior package"
            magnetBody="Why thirty thousand of medical cover and fifty thousand of salary are not the same offer to someone deciding whether to move their family. With the numbers worked through."
            buttonLabel="Send me the numbers"
            source="employee-benefits-corporate-numbers"
            list="corporate"
            contactEmail={contact.email}
          />
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

      {/*
        The company hub.

        Four situations, each its own page. This is the "Where you are with it" structure
        from the corporate copy draft, folded in here rather than shipped as a separate
        page: the draft and the concern flow were written at different times and describe
        the same four conversations, so the draft became the concern copy and this section
        became the way into it.

        The right conversation depends on which one the reader is actually in, which is
        why the four are a choice rather than four more sections of this page.
      */}
      <Section tone="subtle" labelledBy="where-heading">
        <SectionHeading
          id="where-heading"
          title="Where you are with it"
          lede="The right conversation depends on which one of these you are actually in."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {concernsFor('company').map((concern, index, all) => (
            <li
              key={concern.key}
              className={
                spansFullWidth(index, all.length) ? 'sm:col-span-2' : undefined
              }
            >
              <Link
                href={concern.path}
                className="block h-full rounded-(--radius-panel) border border-border bg-surface p-6 no-underline hover:border-ink-muted"
              >
                <span className="block font-serif text-lg text-ink">
                  {concern.cardTitle}
                </span>
                <span className="mt-1 block text-base/7 text-ink-muted">
                  {concern.hook}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 max-w-2xl">
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
          {/*
            Points at this page's own "Where you are with it" section rather than at a
            generic contact anchor. Every one of those four routes ends in a form that
            arrives tagged with the situation, which is a better lead than an untagged
            enquiry and a shorter path for the reader than working out which box to tick.
          */}
          <CtaButton href="#where-heading">Tell us where you are with it</CtaButton>
        </p>
      </Section>
    </>
  )
}
