import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CardGrid } from '@/components/card-grid'
import { Container } from '@/components/container'
import { CtaButton } from '@/components/cta-button'
import { FeatureCard } from '@/components/feature-card'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'

/**
 * International health insurance.
 *
 * Rewritten 2026-08-16. The previous version was Wix copy ported verbatim, defects
 * included, and the owner has since said that content is obsolete. Nothing from it
 * survives except the subject. The old copy is archived at
 * content/_inventory/pages/international-health-insurance.json.
 *
 * The argument is PORTABILITY, per the copy deck: cover that follows you when you move,
 * and pays the hospital directly instead of leaving you to claim it back. The deck says
 * this deserves its own treatment here, with the practical detail on what actually
 * carries across and what does not, written for the expat.
 *
 * On the US illustration in section 2: the deck is emphatic that it is an illustration
 * and NEVER audience targeting. A US national going home has to be covered by a
 * US-domiciled insurer and the firm holds no licence to advise on those, so copy written
 * to attract that reader generates enquiries that have to be declined. The paragraph
 * therefore closes the door and stops; it does not invite them to make contact. The case
 * the firm can serve follows immediately, which is the deck's other rule for this hook.
 * Do not shorten any of it to "your cover is cancelled if you move to the US" — that is
 * wrong for the larger of the two groups.
 *
 * Every claim about insurer behaviour is hedged on purpose ("usually", "most plans",
 * "generally"). Insurers vary by contract, and this is the page most likely to be
 * checked line by line by a reader who has already moved once. Do not tighten a hedge
 * into a flat assertion to make a sentence read better.
 */
export const metadata: Metadata = {
  title: 'International health insurance for expats in Singapore',
  description:
    'What carries across when you move country, how the insurer pays the hospital directly, and what we do with your policy after it is placed.',
}

const portability = [
  {
    title: 'The history you have already disclosed',
    body: 'Keep the same policy through a move and your underwriting terms usually travel with it. What an insurer accepted at the outset generally stays accepted. Start again with a new insurer and you are underwritten on the health you have now, not the health you had when you first bought.',
  },
  {
    title: 'Waiting periods you have already served',
    body: 'Most plans count waiting periods from the date cover started, not from the date you arrived in the new country. A new policy usually restarts those clocks. Maternity is where that hurts most, because the wait is long and the deadline is not negotiable.',
  },
  {
    title: 'Where you are covered is a setting',
    body: 'Area of cover is usually something you change on the policy rather than a reason to change insurer. Move from Asia to Europe and often it is the region and the premium that move while the plan carries on. The United States is handled separately on most plans.',
  },
] as const

const settlement = [
  {
    title: 'Before planned treatment',
    body: 'Pre-authorisation is the step that turns a covered treatment into a settled bill. What it involves, and when it is worth doing even where the plan does not demand it.',
  },
  {
    title: 'When you have paid up front',
    body: 'Direct settlement is not available everywhere. What to keep, what to send, and how long you have to send it.',
  },
] as const

const afterPlacement = [
  {
    title: 'When something changes',
    body: 'A move, a new address, a baby, a change of employer, a country added to the plan. Handled while the policy is running, most of these are a form and an endorsement. Handled after a bill has been incurred somewhere the plan did not reach, they are a much harder conversation. Tell us before, not after.',
  },
  {
    title: 'When the renewal arrives',
    body: 'Premiums climb, and some years the increase is harder to justify than others. When that happens we look at what else is open to you and tell you plainly whether moving is worth it. Often it is not, because starting again means fresh underwriting, anything diagnosed since you bought may be excluded or loaded, and waiting periods run from scratch. You get the comparison either way.',
  },
  {
    title: 'The same person, and no extra cost',
    body: 'Enrolments, additions, a change of country, a document an insurer says it never received. We handle that side of it, and you are not starting again with someone new each time. The premium is the same whether you come to us or go direct to the insurer, because we are paid by commission built into it.',
  },
] as const

/*
  The "What people ask us" section stood here until 2026-08-17. It was three questions
  drawn from blog articles, each linking to the article and then out to /knowledge.

  It went with the articles rather than instead of them: the knowledge base and every
  /single-post/… path were retired from the public site the same day, so both of the
  things this section pointed at ceased to exist. Answers were the articles' own summary
  frontmatter, so there was nothing here to keep once the articles went — rewriting them
  as standalone copy would have been new content wearing an old section's clothes.

  If questions come back, they need answers written to live on this page and no link out.
*/

export default function Page() {
  return (
    <>
      <section className="border-b border-border bg-surface-subtle">
        <Container className="py-16 md:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h1 className="text-display-lg sm:text-display-xl text-ink">
                Cover that moves when you do
              </h1>
              <p className="mt-6 text-lg/8 text-ink-muted">
                Most people choose an international plan for the country they are in. It
                gets tested later, when you move, or when you are standing at a hospital
                counter and someone asks who is settling the bill.
              </p>
            </div>
            {/*
              The one image on the page. It carries the argument literally: what decides
              the answer here is the passport, not the destination. Sized explicitly
              because images are served unoptimised.
            */}
            <Image
              src="/images/e5c3769b69fb4c25a48a0c0c8cd15aa3-d1874e47.webp"
              alt=""
              width={1200}
              height={945}
              sizes="(min-width: 1024px) 32rem, 100vw"
              priority
              className="h-64 w-full rounded-(--radius-panel) object-cover sm:h-80 lg:h-96"
            />
          </div>
        </Container>
      </section>

      <Section labelledBy="portability-heading">
        <SectionHeading
          id="portability-heading"
          title="What portability actually means"
          lede="Worldwide cover tells you where you can be treated. Portability tells you what happens to your terms when your life changes country. They are not the same feature, and only one of them is tested by a move."
        />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            Anyone who has already moved once knows the handover is where things go wrong.
            New job, new address, new plan, and somewhere in the middle a form nobody
            chased. The cover itself is rarely the problem. The join is.
          </p>
          <p className="text-base/8 text-ink">
            So the question worth asking of any plan is not only what it pays for. It is
            what would still be true if you were living somewhere else in 18 months.
          </p>
        </div>

        <div className="mt-10">
          <CardGrid columns={3}>
            {portability.map((card) => (
              <li key={card.title}>
                <FeatureCard title={card.title} body={card.body} />
              </li>
            ))}
          </CardGrid>
        </div>

        <p className="mt-10 max-w-[46rem] text-base/8 text-ink">
          What does not carry across is anything tied to the country you are leaving.
          Local hospital networks, the settlement arrangements behind them, and any
          benefit written around the Singapore system all change when you do. And nothing
          carries at all if the policy lapses. A gap of even a few weeks is usually
          treated as a new application, which means fresh underwriting and waiting periods
          starting again.
        </p>
      </Section>

      <Section tone="subtle" labelledBy="passport-heading">
        <SectionHeading
          id="passport-heading"
          title="Two people, one city, opposite answers"
          lede="The rules here are less obvious than most people assume, and the thing that decides them is not the one you would guess."
        />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            Two people move to New York on the same day. One extends the plan they already
            hold to include the United States. The other cannot buy that cover at all. The
            difference is not the destination. It is the passport.
          </p>
          {/*
            This paragraph closes the door and stops. It deliberately does NOT invite a
            US national going home to make contact: the firm holds no licence to advise
            on US-domiciled cover, so such an enquiry has to be declined, which wastes
            their time and gives them a poor experience. The deck is explicit that this
            hook is an illustration and never audience targeting.
          */}
          <p className="text-base/8 text-ink">
            These plans are built around living outside your country of nationality. An
            expat relocating to the US can usually add a United States module to an
            international plan they already hold. A US national going home usually cannot,
            because at that point they are not living outside their own country and the
            answer is a domestic insurer. We hold no licence to advise on those.
          </p>
          <p className="text-base/8 text-ink">
            The live case is the first one, and it is the more common one. If you hold an
            international plan and a US posting is on the table, including the States is
            usually a change to the policy you already have rather than a reason to start
            again. It will usually cost more, because the United States is the most
            expensive geography on most plans. It also keeps the medical history you have
            built up, which is the part you cannot buy back. Worth asking before you
            accept the posting rather than after you land.
          </p>
          <p className="text-base/8 text-ink">
            The rule underneath this travels further than New York. A destination on its
            own tells you very little until you know whether the person is an expat
            relocating or a national going home. Same country, opposite answer.
          </p>
        </div>
      </Section>

      <Section labelledBy="settlement-heading">
        <SectionHeading
          id="settlement-heading"
          title="Who pays the hospital"
          lede="On a small bill it barely matters. On a large one it is the difference between a form and a deposit you have to find that day."
        />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            There are two ways a hospital bill gets paid. Either the insurer settles it
            directly with the hospital, or you pay it and claim it back afterwards.
            International plans are usually built around the first, and that is most of
            what people mean when they say the cover works.
          </p>
          <p className="text-base/8 text-ink">
            It is not automatic. Direct settlement depends on the plan, on the hospital,
            and on the insurer having been told in advance. For planned treatment that
            advance step is pre-authorisation, where the insurer confirms what it will
            cover before you are admitted and the hospital then bills them instead of you.
            Skip it and you may be asked to settle at discharge and claim it back, even
            where the treatment itself was covered.
          </p>
          {/*
            The assistance-line sentence is hedged because it describes a third party's
            service level across every insurer, which the firm cannot warrant. The
            firm-side half is deliberately blunt: it is not a 24 hour operation and a
            reader should learn that here rather than at 2am.
          */}
          <p className="text-base/8 text-ink">
            Outpatient visits are more often paid and reclaimed than in-patient stays, and
            reimbursement usually runs to a deadline counted in months from the date of
            treatment, so keep the receipts. In a genuine emergency the number to call is
            usually the insurer&rsquo;s own assistance line, printed on your membership
            card. Those lines are usually staffed around the clock. We are not, and it is
            better you know which is which now than at 2am.
          </p>
        </div>

        <div className="mt-10">
          <CardGrid columns={2}>
            {settlement.map((card) => (
              <li key={card.title}>
                {/* No `link` since 2026-08-17: both cards linked to retired articles. */}
                <FeatureCard title={card.title} body={card.body} />
              </li>
            ))}
          </CardGrid>
        </div>
      </Section>

      <Section tone="subtle" labelledBy="after-heading">
        <SectionHeading
          id="after-heading"
          title="What happens after it is placed"
          lede="Arranging the policy is the short part. The rest of it is the years afterwards, and that is the part we are actually for."
        />
        <div className="mt-10">
          <CardGrid columns={3}>
            {afterPlacement.map((card) => (
              <li key={card.title}>
                <FeatureCard title={card.title} body={card.body} />
              </li>
            ))}
          </CardGrid>
        </div>
      </Section>

      <Section tone="subtle" labelledBy="start-heading">
        <SectionHeading id="start-heading" title="Where to start" />
        <div className="mt-8 max-w-[46rem] space-y-5">
          <p className="text-base/8 text-ink">
            If you already hold a plan, the two useful things to know are what it would do
            on the day you move and what it would do at a hospital counter. Both are
            answerable from the wording. Send it over and we will read it with you.
          </p>
          <p className="text-base/8 text-ink">
            If you are buying for the first time, the questions that decide most of it are
            where you expect to be living in 3 years, whether anyone to be covered has a
            history that has to be disclosed, and whether maternity is anywhere on the
            horizon. Those matter more than the name on the plan.
          </p>
        </div>
        <p className="mt-8">
          <CtaButton href="/#talk-to-us">Ask us what would carry across</CtaButton>
        </p>
      </Section>
    </>
  )
}
