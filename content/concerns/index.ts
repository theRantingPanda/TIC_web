/**
 * The nine concerns.
 *
 * ONE SOURCE, TWO SURFACES. The homepage reveals a concern's panel inline once the
 * visitor selects it; the concern's own route renders exactly the same panel with its
 * own metadata and canonical. Both read this module, which is what stops the two
 * drifting — a copy edit here changes both or neither.
 *
 * The panel has a FIXED six-part structure and the order is load-bearing:
 *
 *   1. their situation   — reflect back what they told you, in their words
 *   2. a real TIC case   — the specific story, not a testimonial
 *   3. useful numbers    — only where a real, on-topic figure exists
 *   4. three things to consider
 *   5. what we do
 *   6. one call to action
 *
 * ---- Standing copy rules, all of which came out of catching bad framing ----
 *
 * CUSTOMER LANGUAGE ON THE CARD, TECHNICAL LANGUAGE AFTER THE CLICK. The card says
 * "I already have a medical condition"; the panel introduces "pre-existing condition"
 * once the visitor's own words have been reflected back. Do not tidy the card titles
 * into product names.
 *
 * NEVER FRAME A CONCERN AS BLAMING A THIRD PARTY. "Looking beyond my employer's cover",
 * not "low coverage from work" — a corporate HR visitor can reach that exact wording
 * from the other path.
 *
 * NEVER PRESUPPOSE A CONCLUSION NOBODY HAS REACHED. "My renewal premium has increased",
 * not "a renewal costing more than it should". Nobody knows yet whether it should.
 *
 * NO UNSUBSTANTIATED SUPERLATIVES. "The cheapest retention you can buy" and "most
 * insurers are less dismissive than people expect" were both cut for this reason. The
 * register is an experienced adviser pointing something out, not a copywriter finding a
 * pain point.
 *
 * NO INSURER NAMES, AND NOTHING THAT EXPOSES THE PANEL. Enforced by
 * `npm run verify:copy` against the built output, so this is a check rather than a
 * hazard — but write it right the first time. It is why the relocating table below
 * carries its configuration without naming the carrier the rates came from.
 *
 * NO CLINICAL CLAIMS AND NO ROUND-THE-CLOCK PROMISE. Every `whatWeDo` item is
 * administration, comparison or paperwork. The firm is not a 24 hour operation and is
 * not medically trained. Do not let one of these grow into chasing a pre-authorisation
 * decision or overturning a decline; that is a clinical review between a treating doctor
 * and an insurer's medical team.
 *
 * VOICE. No em-dashes. British spelling. Plain English, active voice, short sentences.
 * Lead with the reader's situation, not the firm's expertise.
 *
 * ---- Content integrity: the hard constraint ----
 *
 * EIGHT OF THE NINE CASE STUDIES ARE PLACEHOLDERS and each says so in its own text.
 * Each carries a brief describing what a real one needs: concrete ages, a timeline, what
 * the existing cover was missing, what was actually done, the real outcome. A case does
 * NOT need to end in a win. "We recommended staying with the current plan" is a
 * legitimate and often more credible case, because it says the job is advice rather than
 * moving policies. Do not let these fill up with generic testimonial language.
 *
 * The one real case is on `beyond-employer`. See the note there for why it sits on that
 * concern rather than on maternity, and why it must not be restated on a second page.
 *
 * NEVER SHOW A NUMBER THAT DOES NOT ANSWER THE QUESTION ASKED. Only `relocating` carries
 * figures, because "what does cover cost" is the question that page is actually
 * answering. The maternity panel deliberately shows no premium: a table of base
 * in-patient rates on a page about maternity would be a real mismatch, not an imprecise
 * caveat. If a number cannot be both accurate and on-topic, show no number.
 *
 * EVERY PREMIUM FIGURE TRACES TO A RATE LOOKUP, NEVER AN ESTIMATE. The relocating table
 * came from a live rate lookup, not from guessing at plausible figures. Anything added
 * later must come from the same kind of source.
 */

export type ConcernAudience = 'individual' | 'company'

/**
 * Which mark a concern's card carries.
 *
 * A KEY, NOT A COMPONENT, because this module is `.ts` and cannot hold JSX. The mapping
 * to real components lives in components/concern-card.tsx, which is the same shape as
 * `forkIcons` in app/page.tsx.
 */
export type ConcernIconKey =
  | 'hourglass'
  | 'arrive'
  | 'ceiling'
  | 'pulse'
  | 'depart'
  | 'trend-up'
  | 'briefcase'
  | 'hard-hat'
  | 'sprout'

/** A lead image. Either a real photograph, or the brief for the one still to be shot. */
export type ConcernImage =
  | { kind: 'photo'; src: string; alt: string; width: number; height: number }
  | { kind: 'brief'; brief: string }

/**
 * The case.
 *
 * `placeholder` renders bracketed and visibly unfinished on the page as well as in the
 * source, so nobody mistakes it for copy. Replace it with a `real` case; never delete
 * the section, and never quietly fill it with generic testimonial language.
 *
 * Exactly one `real` case exists at the time of writing. It is anonymised and
 * permission-cleared, and BOTH permissions were needed rather than one: the family's,
 * and the employer's, since the story opens on their HR function and describes their
 * scheme's limits. Do not add a second `real` case without the same clearance.
 */
export type ConcernCase =
  | { kind: 'placeholder'; brief: string }
  | {
      kind: 'real'
      paragraphs: readonly string[]
      footer: string
      /**
       * An optional chart of the case's own figures: what the scheme covered, what the
       * bill came to, and the gap between them.
       *
       * EVERY NUMBER HERE MUST ALREADY APPEAR IN `paragraphs`. This visualises the case,
       * it does not add to it — so the chart cannot say something the prose does not, and
       * a correction to one is a correction to both. Both are checked by `verify:copy`
       * because both are text.
       *
       * That constraint is the reason this is markup rather than an image. A supplied
       * graphic carried an employer ceiling of S$40,000 against a S$125,000 bill, which
       * contradicted the case sitting directly beneath it and could not be footnoted,
       * corrected or scanned, because it was pixels. Do not put figures in a photograph.
       */
      chart?: {
        heading: string
        total: { label: string; display: string; amount: number }
        covered: { label: string; display: string; amount: number }
        gap: { label: string; display: string }
        footnote: string
      }
    }

export type Concern = {
  key: string
  /** A real, indexable route. Also the anchor the homepage reveal writes to the hash. */
  path: string
  audience: ConcernAudience
  /** Customer language. What the visitor would say, not what the product is called. */
  cardTitle: string
  /** One line. Never two. */
  hook: string
  /** The card's mark. See ConcernIconKey. */
  icon: ConcernIconKey
  /** Technical language is allowed from here on. */
  panelTitle: string
  image: ConcernImage
  situation: readonly string[]
  case: ConcernCase
  numbers?: {
    heading: string
    intro?: string
    table?: {
      columns: readonly [string, string]
      rows: readonly (readonly [string, string])[]
    }
    /** Configuration disclosure. Load-bearing wherever a figure appears. */
    footnote: string
  }
  considerations: readonly { term: string; body: string }[]
  whatWeDo: readonly string[]
  ctaLabel: string
  /**
   * One link out, when a genuinely on-topic page or article exists.
   *
   * This is the ONLY route from a concern to further reading, by design. A three-question
   * band used to sit on each concern page and was removed on 2026-08-16: it widened a
   * flow whose every other step narrows, and its questions were not about the concern
   * because the matching articles do not exist. See the note in
   * components/concern-page.tsx.
   *
   * Leave it undefined rather than reaching for a loosely related article. Five of the
   * nine concerns have no genuinely on-topic piece written yet, and no link is better
   * than a link that answers a different question.
   */
  furtherReading?: { href: string; label: string }
  meta: { title: string; description: string }
}

export const concerns: readonly Concern[] = [
  {
    key: 'maternity',
    // Absorbs an existing indexed path rather than competing with it. This page was
    // already the best-written on the site; the drill-down structure is built around
    // its copy rather than over the top of it.
    path: '/maternity-insurance',
    audience: 'individual',
    cardTitle: 'Planning for a family',
    hook: 'Waiting periods mean timing decides this one.',
    icon: 'hourglass',
    panelTitle: 'Maternity cover runs on a clock',
    image: {
      kind: 'photo',
      src: '/images/50b90fb3dac547b58b92ffce7e9c2e6a-2e95b71a.webp',
      alt: '',
      width: 1800,
      height: 1200,
    },
    situation: [
      'Plans usually make you wait before maternity benefits begin, so the cover has to be in place long before there is anything to claim for. Once a pregnancy has started it is usually excluded from a new plan. That is the whole argument here, and it is why this is worth a conversation early rather than late.',
      'There is a second reason timing matters more here than almost anywhere else. As an expat you sit outside the subsidised system Singapore residents fall back on, so a maternity bill arrives with nothing taken off it. A straightforward delivery is manageable. An emergency caesarean and a stay in neonatal intensive care is a different number altogether, and it arrives with no notice.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed. Be concrete: ages, timeline, what their existing cover was missing, what we actually did, the real outcome. It does not need to be a win. "We recommended staying put" is often the more credible case.]',
    },
    considerations: [
      {
        term: 'Waiting period',
        body: 'How long the cover has to run before maternity benefits start. It varies by plan, and if cover is not active long enough before the birth, the claim can be refused entirely.',
      },
      {
        term: 'Maternity limit',
        body: 'A cap on what the benefit pays for delivery and complications. Some plans set it low enough that a straightforward birth is fine and a caesarean is not.',
      },
      {
        term: 'Newborn provisions',
        body: 'How the baby is covered from birth, and the terms for a congenital condition specifically. Usually the most carefully worded part of any plan.',
      },
    ],
    whatWeDo: [
      'Compare real waiting periods and maternity limits across what is open to you, not just the headline premium.',
      'Time the start date so the waiting period clears comfortably before you need it to.',
      'Check the newborn’s own terms before recommending anything, since that is the part people usually forget to ask about.',
      'Handle the enrolment when the baby arrives, including putting the case for cover to run from the date of birth rather than from the date the form landed.',
    ],
    ctaLabel: 'Tell us where you are on the clock',
    furtherReading: {
      href: '/single-post/does-my-plan-cover-maternity-and-newborn-care',
      label: 'Does my plan cover maternity and newborn care?',
    },
    meta: {
      title: 'Maternity and newborn cover in Singapore',
      description:
        'Maternity benefits usually carry a waiting period, so timing decides this one. Where you are on the clock, and what we do once the cover is in place.',
    },
  },

  {
    key: 'relocating',
    path: '/relocating-to-singapore',
    audience: 'individual',
    cardTitle: 'Relocating to Singapore',
    hook: 'Cover that is active from the day you land.',
    icon: 'arrive',
    panelTitle: 'Moving to Singapore',
    image: {
      kind: 'photo',
      src: '/images/relocating-to-singapore.webp',
      alt: '',
      width: 1800,
      height: 969,
    },
    situation: [
      'Cover through a previous employer usually ends when the job does. Moving countries can mean fresh underwriting on the new plan, and anything diagnosed since you last applied may be excluded or loaded.',
      'The useful thing to settle before you land is which of those applies to you, because the answer decides whether you are shopping on price or protecting a history you have already built.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed. Be concrete: what their previous cover was, what changed on the move, what we did, the real outcome.]',
    },
    numbers: {
      heading: 'What cover typically costs',
      table: {
        columns: ['Age', 'Monthly, from'],
        rows: [
          ['25', 'USD 116'],
          ['30', 'USD 138'],
          ['35', 'USD 155'],
          ['40', 'USD 201'],
        ],
      },
      /**
       * The carrier is deliberately not named. These came from a live rate lookup on the
       * current rate table, which is what makes them publishable at all — but naming the
       * insurer breaks the standing public-copy rule and would fail `verify:copy`.
       *
       * The configuration is not decoration. These figures are what they are because the
       * cover is narrow: in-patient only, excluding the United States, on the top
       * deductible tier. A reader who sees the number without those three facts has been
       * misled. Never trim this to balance the layout.
       */
      footnote:
        'In-patient cover only, for a single adult resident in Singapore, worldwide excluding the United States, on a deductible of USD 8,500. Real rates from our current rate table, priced August 2026. Indicative and subject to underwriting.',
    },
    considerations: [
      {
        term: 'Continuity',
        body: 'Whether your history travels with you or the new plan underwrites you from scratch. Some schemes let you continue without fresh underwriting. Many do not, and most people have never checked which one they are on.',
      },
      {
        term: 'Visa status',
        body: 'An Employment Pass and permanent residency are not always treated the same way, so it is worth checking rather than assuming yours does not matter.',
      },
      {
        term: 'Where you would actually be treated',
        body: 'A stay in a private hospital here costs meaningfully more than a subsidised stay in a public one. That gap is exactly what the cover is for.',
      },
    ],
    whatWeDo: [
      'Work out what your current cover would carry across before you cancel anything.',
      'Set the start date so there is no gap between the old plan ending and the new one beginning.',
      'Put the disclosure together properly, because a history declared badly is the thing that comes back at claim time.',
    ],
    ctaLabel: 'Check your cover before you land',
    furtherReading: {
      href: '/international-health-insurance',
      label: 'How international cover works',
    },
    meta: {
      title: 'Relocating to Singapore: health cover from the day you land',
      description:
        'Cover through a previous employer usually ends when the job does. What carries across, what gets underwritten again, and what cover costs here.',
    },
  },

  {
    key: 'beyond-employer',
    path: '/beyond-employer-cover',
    audience: 'individual',
    cardTitle: 'Looking beyond my employer’s cover',
    hook: 'Most group plans have a ceiling, worth knowing where yours sits.',
    icon: 'ceiling',
    panelTitle: 'Looking beyond your employer’s cover',
    image: {
      kind: 'brief',
      brief:
        'Photography brief: a quiet, considered moment. Someone at a desk or a kitchen table. Not a hospital, and not a worried expression.',
    },
    situation: [
      'A company plan is built to a budget, and that budget was not set with your family in mind. A serious illness in a private hospital here can run past the limit faster than most people expect.',
      'The other half of it is that the cover belongs to the job rather than to you. It ends when the job does, and if something is diagnosed along the way it may be excluded or loaded when you come to buy your own. You are insurable today, and that is the part people miss.',
    ],
    /**
     * The one real case on the site, moved here from the old homepage on 2026-08-16.
     *
     * It sits on THIS concern rather than on maternity, where it also fits, because this
     * panel's whole argument is that a company plan has a ceiling and you can run past
     * it — and the case is that ceiling being exceeded by S$53,000. It is the site's
     * strongest evidence placed against the claim it actually proves. Use it once: a
     * case restated on a second page dilutes on both.
     *
     * THE SHORTFALL STAYS IN. The S$53,000 the family still paid is the single most
     * credible line in the story. A case where insurance covered everything reads like
     * advertising; one that names what it did not cover reads like someone telling you
     * the truth, and that is the whole positioning.
     *
     * Every S$ is written explicitly so no reader assumes USD. The HR manager is
     * deliberately ungendered — the detail adds nothing and narrows identifiability. No
     * names, no employer, no hospital, no dates.
     */
    case: {
      kind: 'real',
      paragraphs: [
        'An HR manager called us about one of the team. His son had arrived 9 weeks early and was in neonatal intensive care at a private hospital in Singapore. The unit was running at S$4,000 a day at least, and nobody could say how many days there would be. We were put straight on the phone with him. He wanted to know one thing, which was whether the insurer would stand behind it.',
        'We had the newborn enrolled by the next working day. The administration landed about a week after he was born, but the insurer agreed to guarantee the bills from birth rather than from the date the paperwork caught up. The company scheme the family were on covers a newborn from birth up to S$207,000. The final bill came to S$260,000, so they still paid a share of it. The emergency caesarean was a separate bill, and that one was covered in full.',
      ],
      footer:
        'Nobody would call that a perfect outcome. It was a very different one from the alternative.',
      /**
       * Every figure below is lifted from the paragraph above, not calculated for effect.
       * S$260,000 less S$207,000 is the S$53,000 the family paid, which is the single
       * most credible line on the site and the reason this concern gets a chart at all.
       *
       * The gap is shown, not implied. A chart of this that stopped at "covered" would be
       * the advertising version of the same story.
       */
      chart: {
        heading: 'What the scheme reached, and what it did not',
        total: { label: 'Final bill', display: 'S$260,000', amount: 260_000 },
        covered: {
          label: 'Covered by the company scheme',
          display: 'S$207,000',
          amount: 207_000,
        },
        gap: { label: 'The family paid', display: 'S$53,000' },
        footnote:
          'One real case, anonymised and permission-cleared. A newborn limit of S$207,000 is that scheme’s, not a market figure, and yours will differ. It is here to show that a ceiling is a real number with a real edge, not to predict where yours sits.',
      },
    },
    numbers: {
      heading: 'What a top-up costs',
      /**
       * DELIBERATELY NO FIGURES. There is a real, traceable in-patient rate table on the
       * relocating panel, and a second set of "from" figures was previously published for
       * this configuration. The two do not agree at the same ages, and publishing both
       * would put two different floors for the same cover on one site.
       *
       * Rather than pick one and hope, this shows the mechanism and no number. The
       * handoff's rule governs: if a number cannot be both accurate and on-topic, show
       * no number. Price this properly against the current rate table and it can come
       * back.
       */
      footnote:
        'Because the company plan absorbs the first layer, a top-up sitting above it is usually priced on a high deductible, which keeps the added premium modest. We will size it once we can see what your existing scheme actually covers.',
    },
    considerations: [
      {
        term: 'The ceiling',
        body: 'What your company plan actually caps out at, which most people have never checked.',
      },
      {
        term: 'Portability',
        body: 'What happens to the cover if you change jobs, and whether your medical history goes with you when it ends.',
      },
      {
        term: 'Overlap',
        body: 'Making sure a top-up genuinely fills the gap rather than duplicating what you already have.',
      },
    ],
    whatWeDo: [
      'Read your scheme’s actual limits with you, rather than working from what the benefits summary implies.',
      'Size a plan that sits above it instead of alongside it, so you are not paying twice for the first layer.',
      'Tell you when the scheme is already enough. That answer costs us the sale and it is still the right one.',
    ],
    ctaLabel: 'Find out what you could buy today',
    meta: {
      title: 'Cover beyond your employer’s scheme',
      description:
        'A company plan is built to a budget, and it ends when the job does. Where the ceiling sits, what a top-up involves, and when you do not need one.',
    },
  },

  {
    key: 'pre-existing',
    path: '/pre-existing-conditions',
    audience: 'individual',
    cardTitle: 'I already have a medical condition',
    hook: 'The answer usually depends on the specific condition.',
    icon: 'pulse',
    // The card uses the visitor's words. The panel is where the industry term is
    // introduced, once, having reflected their own back at them first.
    panelTitle: 'Pre-existing conditions',
    /**
     * A licensed photograph, supplied 2026-08-16: a prescription pad and loose
     * medication. Converted from a 1.7 MB PNG to a 0.14 MB JPEG by
     * `npm run resize:image`, because a photograph committed as a PNG is served as a PNG.
     *
     * It cuts against the brief originally written for this panel, which asked for a
     * person going about an ordinary day and explicitly not a clinical setting. It is
     * defensible on the copy's own terms — the panel is about something you already
     * manage day to day rather than about being ill — and it is a real licensed image
     * rather than stock-cheerful. But it is the only medication image on the site, so if
     * it ever reads as cold next to the other panels, that is why.
     */
    image: {
      kind: 'photo',
      src: '/images/pre-existing-conditions.webp',
      alt: '',
      width: 1548,
      height: 1016,
    },
    situation: [
      'You already manage something. In insurance terms that is usually called a pre-existing condition, and how it is treated differs a great deal by insurer and by how it is disclosed.',
      'Some conditions are loaded, some are excluded for a period, and some are covered outright depending on severity and how long they have been stable. The honest answer is that it depends on the specific condition, which is why this is a conversation rather than a form.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed. Be concrete: the condition, which underwriting route applied, the real outcome. A declined or loaded outcome is still a credible case if that is what happened.]',
    },
    considerations: [
      {
        term: 'Full medical underwriting',
        body: 'You disclose everything upfront and the insurer decides case by case, sometimes covering the condition outright and sometimes with a loading.',
      },
      {
        term: 'Moratorium underwriting',
        body: 'No forms to fill in, but anything treated in a set number of years before the policy starts stays excluded until you go a set number of years claim-free.',
      },
      {
        term: 'Standard exclusion',
        body: 'Some insurers exclude the specific condition by name and cover everything else as normal.',
      },
    ],
    whatWeDo: [
      'Talk it through before anything is submitted, so you know which underwriting route suits your situation.',
      'Help you disclose it properly, because an incomplete disclosure is what causes a claim to fail years later.',
      'Tell you plainly if moving would cost you more in lost history than it saves in premium.',
    ],
    ctaLabel: 'Ask about your condition, confidentially',
    furtherReading: {
      href: '/single-post/will-my-pre-existing-conditions-be-covered',
      label: 'Will my pre-existing conditions be covered?',
    },
    meta: {
      title: 'Pre-existing conditions and international health cover',
      description:
        'How a condition you already manage is treated differs by insurer and by how it is disclosed. The three underwriting routes, and what each one means.',
    },
  },

  {
    /**
     * Added by addendum 1 to the handoff, after the other four were built.
     *
     * DELIBERATELY NOT FOLDED INTO `relocating`. Arriving and leaving are different
     * anxieties with different answers: "will my cover be active in time" against "does
     * my cover survive the move". Bundling them into one card would make the visitor read
     * further just to find out which half applies, which is the exact scanning problem
     * this flow exists to remove.
     *
     * It is also a genuine differentiator worth surfacing on its own. Because these are
     * worldwide plans rather than Singapore-tied ones, cover surviving a departure is a
     * real and specific answer rather than reassurance copy.
     *
     * It sits LAST in the individual grid, which makes that grid odd-numbered. See the
     * note on `spansFullWidth` below for how the layout handles the orphan.
     */
    key: 'leaving-singapore',
    path: '/leaving-singapore',
    audience: 'individual',
    cardTitle: 'Leaving Singapore',
    // The addendum writes this with a contraction. Expanded to match the other eight,
    // which are contraction-free throughout. That is a house consistency choice, not a
    // rewrite of the line.
    hook: 'Worldwide cover does not have to end when your posting does.',
    icon: 'depart',
    panelTitle: 'Leaving Singapore',
    image: {
      kind: 'brief',
      brief:
        'Packing up, or a departure moment. Warm rather than stressful, and not an empty apartment framed as loss.',
    },
    situation: [
      'A posting ends, or a contract does, and the question is whether the cover goes with you or starts again in the next country. It is worth asking early, because the answer changes what you should do before you leave rather than after.',
      // Hedged on purpose. Portability is a property of the plan, not a promise the firm
      // can make on behalf of every plan a reader might be holding.
      'Cover arranged as a worldwide plan is usually built to travel, which is the whole reason it is worth having one rather than a policy tied to living here. What is worth checking is whether yours actually is, and what changes when your country of residence does.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed, anonymised. Be concrete: the destination country, whether the plan carried over or had to be rewritten, what we did, the real outcome.]',
    },
    /**
     * DELIBERATELY NO FIGURE, and not for want of looking. What cover costs after a move
     * depends on the destination country, so a number here would answer a question the
     * reader did not ask — the same mismatch that was caught on the maternity panel and
     * fixed by moving the figures to relocating, where "what does this cost" is the
     * actual question.
     */
    considerations: [
      {
        term: 'Portability',
        body: 'Whether the plan is genuinely worldwide or built around living in Singapore. That is the difference between a change of address and a new application.',
      },
      {
        term: 'Continuity',
        body: 'The same underwriting question as arriving, in reverse. A plan that carries over carries your history with it; one that has to be replaced usually underwrites you again.',
      },
      {
        term: 'Timing',
        body: 'No gap between the old cover ending and the new cover starting. A few uncovered weeks in the middle of a move is the version of this that goes wrong.',
      },
    ],
    whatWeDo: [
      'Read your existing plan and tell you whether it travels, before you cancel anything.',
      'Change the country of residence properly where the plan allows it, rather than letting it lapse and starting again.',
      'Line the dates up so there is no uncovered gap in the middle of the move.',
    ],
    ctaLabel: 'Check what happens to your cover',
    meta: {
      title: 'Leaving Singapore: what happens to your health cover',
      description:
        'A posting ending does not have to mean the cover does. What travels, what gets underwritten again, and how to avoid a gap in the middle of a move.',
    },
  },

  {
    key: 'renewal',
    path: '/renewal-premium-increase',
    audience: 'company',
    cardTitle: 'My renewal premium has increased',
    hook: 'Worth understanding what is driving it before deciding what to change.',
    icon: 'trend-up',
    panelTitle: 'When the renewal comes back higher',
    image: {
      kind: 'brief',
      brief:
        'Photography brief: someone genuinely focused on figures, an HR director or a founder. Not a generic stock team meeting, which is the exact weakness on the page this replaces.',
    },
    situation: [
      'Premiums climb every year, and some years the increase is harder to justify than others. Before you accept it or start shopping the market, it is worth knowing what is driving the number and what you would give up by moving.',
      'A scheme’s claims history follows the people on it rather than the policy, so a cheaper quote can arrive with fresh underwriting attached. Sometimes moving is still the right call. Often it is not, and we will say so.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed, anonymised. Be concrete: the size of the increase, what was actually driving it, what we did, what changed. Entirely fine if the outcome was staying with the incumbent.]',
    },
    considerations: [
      {
        term: 'What is driving the increase',
        body: 'Claims experience on your own scheme, market-wide medical inflation, or both. The answer changes what is worth doing about it.',
      },
      {
        term: 'Re-underwriting risk',
        body: 'Whether anyone on the scheme would lose continuity by moving carriers. That cost lands on individuals, not on the budget line.',
      },
      {
        term: 'The deductible lever',
        body: 'The lever most companies never touch. Setting it higher, and letting senior staff top up privately, often buys more real cover for the same total spend than raising every limit across the board.',
      },
    ],
    whatWeDo: [
      'Tell you what is behind the number before the deadline forces a decision.',
      'Run the comparison against what else is open to you, and show you the working.',
      'Say plainly whether moving is worth it, including when the answer is that it is not.',
    ],
    ctaLabel: 'Tell us about your renewal',
    furtherReading: {
      href: '/single-post/why-has-my-renewal-premium-increased',
      label: 'Why has my renewal premium increased?',
    },
    meta: {
      title: 'Group medical renewal: why the premium increased',
      description:
        'What drives a renewal increase on a company scheme, what you would give up by moving, and the deductible lever most companies never touch.',
    },
  },

  {
    key: 'retention',
    path: '/cover-for-senior-hires',
    audience: 'company',
    cardTitle: 'Retaining senior and regional hires',
    hook: 'Benefits matter more when someone is relocating their family.',
    icon: 'briefcase',
    panelTitle: 'Cover as part of a senior package',
    image: {
      kind: 'brief',
      brief:
        'Photography brief: a senior hire settling in, arriving at an office or meeting a new team. Not a stock handshake.',
    },
    situation: [
      'Thirty thousand dollars of medical cover and fifty thousand dollars of salary are not the same offer to someone deciding whether to relocate their family. Cover answers the question salary cannot, which is what happens if something goes wrong out here.',
      'For a senior or regional hire weighing up a move, that question sits somewhere behind every other line in the offer. Turnover and a wrong hire cost more than the premium ever will.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed, anonymised. Be concrete: the role, what the package needed to include and why, the real outcome.]',
    },
    considerations: [
      {
        term: 'What candidates are comparing it to',
        body: 'A package only reads as generous next to whatever else is on the table.',
      },
      {
        term: 'Family cover',
        body: 'Whether dependants are included, which is usually the deciding factor for someone relocating with a family.',
      },
      {
        term: 'Consistency',
        body: 'Whether senior hires in different countries are actually on comparable cover, or only look as though they are.',
      },
    ],
    whatWeDo: [
      'Build the package against what the candidate is actually comparing it to, not against last year’s scheme.',
      'Price the dependant question properly, since that is usually where the decision is made.',
      'Keep the scheme consistent as people are hired into different countries.',
    ],
    ctaLabel: 'Build a package that holds up',
    meta: {
      title: 'Medical cover for senior and regional hires',
      description:
        'Cover answers the question salary cannot for someone relocating their family. How to build the benefit into a senior package that holds up.',
    },
  },

  {
    key: 'multi-country',
    // Absorbs an existing indexed path. This is the 301 destination for the retired
    // /speciality-insurance, so the equity that followed the audience stays put.
    path: '/offshore-and-energy',
    audience: 'company',
    cardTitle: 'A workforce that does not sit in one country',
    hook: 'Cover that onboards anywhere and travels with them.',
    icon: 'hard-hat',
    panelTitle: 'Offshore and deployed teams',
    image: {
      kind: 'photo',
      src: '/images/1a2db263adbd45d4b3df37a3fd15c5a8-c2cabe1d.webp',
      alt: '',
      width: 1800,
      height: 1011,
    },
    situation: [
      'Hire in Kuala Lumpur, deploy offshore, treat in Singapore. If your team moves around more than most, the cover needs to as well, including evacuation terms that are worth reading before anyone needs them.',
      // This sentence is not optional. The marine and oil and gas specialty product was
      // dropped; what survived is the audience. Nothing on this page may imply there is
      // a separate offshore policy to buy.
      'This is ordinary international health cover, configured for a workforce that does not sit in one country. There is no separate offshore policy to buy.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed, anonymised. Be concrete: which countries, what the gap was, what we did, the real outcome.]',
    },
    considerations: [
      {
        term: 'Onboarding anywhere',
        body: 'Whether a hire who sits outside Singapore can go on cover the same way as one who sits here. Where the scheme allows it, that is how we set it up.',
      },
      {
        term: 'Treatment location',
        body: 'Where people actually end up seeking care, which is not always where they are based.',
      },
      {
        term: 'Evacuation terms',
        body: 'What they cover and from where. From a remote worksite, getting someone to a hospital is the first problem and paying for it is the second.',
      },
    ],
    whatWeDo: [
      'Set the scheme up so a hire outside Singapore is not a special case every time.',
      'Check the evacuation terms against where your people are actually deployed.',
      'Handle the movement, since a workforce like this generates more changes than most.',
    ],
    ctaLabel: 'Tell us how your team is deployed',
    meta: {
      title: 'Offshore and deployed teams',
      description:
        'Medical cover for teams who are hired in one country, deployed to another and treated in a third, including when an evacuation is the only option.',
    },
  },

  {
    key: 'first-scheme',
    path: '/first-company-scheme',
    audience: 'company',
    cardTitle: 'Setting up benefits for the first time',
    hook: 'No existing scheme to compare against, just a decision to make.',
    icon: 'sprout',
    panelTitle: 'Setting up a scheme from nothing',
    image: {
      kind: 'brief',
      brief:
        'Photography brief: a founder or a small leadership team, early stage and genuine. Not a corporate boardroom stock shot.',
    },
    situation: [
      'No existing scheme to compare against, just a decision about what to offer. We will ask a handful of questions about the roles and where people are based, and come back with what is typical for a company your size and what it would cost to go further.',
    ],
    case: {
      kind: 'placeholder',
      brief:
        '[Real case needed, anonymised. Be concrete: company size, what they chose to prioritise and why, the real outcome.]',
    },
    considerations: [
      {
        term: 'What is typical',
        body: 'What companies your size usually offer, as a starting benchmark rather than a recommendation.',
      },
      {
        term: 'Where to spend',
        body: 'Whether the budget does more on the core plan or on dependant cover. For a team with families, it is usually not close.',
      },
      {
        term: 'Room to grow',
        body: 'Setting the scheme up so it scales with headcount without a rebuild in two years.',
      },
    ],
    whatWeDo: [
      'Ask about the roles and where people sit, then come back with what is typical and what going further would cost.',
      'Set the scheme up so adding people later is administration rather than a new decision.',
      'Run it once it is in place, including the renewal and the adds and leavers.',
    ],
    ctaLabel: 'Start with a few questions',
    meta: {
      title: 'Setting up employee medical benefits for the first time',
      description:
        'No existing scheme to compare against. What companies your size usually offer, where the budget does the most, and how to leave room to grow.',
    },
  },
] as const

/** The fork's two doors, in the order they appear. */
export const paths = [
  {
    audience: 'individual' as const,
    label: 'Myself or my family',
    /** Which capture list an enquiry from this path writes to. */
    list: 'individual' as const,
  },
  {
    audience: 'company' as const,
    label: 'My company or employees',
    list: 'corporate' as const,
  },
] as const

export function concernsFor(audience: ConcernAudience): readonly Concern[] {
  return concerns.filter((concern) => concern.audience === audience)
}

/**
 * Whether a card is the odd one out at the end of a two-column grid.
 *
 * An odd-numbered set in two columns always leaves one card alone on the last row,
 * whatever the order. Rather than reordering to hide it, the last card spans both
 * columns so it reads as a deliberate full-width closer instead of a leftover.
 *
 * The individual path went odd when "Leaving Singapore" was added. This is written as a
 * rule rather than a flag on that one concern precisely so the next odd-numbered grid is
 * not solved a different way: pass the set's length and the index, and the layout follows.
 */
export function spansFullWidth(index: number, total: number): boolean {
  return total % 2 === 1 && index === total - 1
}

export function concernByPath(path: string): Concern {
  const found = concerns.find((concern) => concern.path === path)
  if (!found) throw new Error(`No concern registered at ${path}`)
  return found
}

/** Every concern route, for the URL contract assertion and for the footer. */
export const concernPaths: readonly string[] = concerns.map((concern) => concern.path)
