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
 *   4. things to consider — three on eight of the nine, two on `beyond-employer`
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
 * Two real cases, one on `maternity` and one on `beyond-employer`. The maternity one ran on
 * `beyond-employer` until 2026-08-17, described as a company scheme it never was; the
 * beyond-employer one is a genuine company plan whose ceiling was run past, and replaced it
 * there. See the notes on both concerns for what was wrong, and why neither may be restated
 * on a second page.
 *
 * NEVER SHOW A NUMBER THAT DOES NOT ANSWER THE QUESTION ASKED. Two panels carry premium
 * figures and both are answering "what does this cost": `relocating`, and — from
 * 2026-08-18 — `beyond-employer`, which held none until its figures could be reconciled
 * against the relocating table. See the long note at its `numbers` block; the rule that
 * kept them out was satisfied, not waived. The maternity panel still shows no premium: a
 * table of base in-patient rates on a page about maternity would be a real mismatch, not
 * an imprecise caveat. If a number cannot be both accurate and on-topic, show no number.
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
 * The case. Three kinds, and THE DIFFERENCE BETWEEN TWO OF THEM IS THE POINT.
 *
 * `placeholder` renders bracketed and visibly unfinished on the page as well as in the
 * source, so nobody mistakes it for copy. Replace it with a `real` case or a `scenario`;
 * never delete the section, and never quietly fill it with generic testimonial language.
 *
 * `real` means a real client. Two exist at the time of writing, each anonymised and each
 * cleared by the family whose case it is. An earlier version of this note claimed an
 * employer's clearance was needed for the first, because it was then written as a company
 * scheme — it is an individual policy and no employer was ever involved. Do not add a
 * third `real` case without that same clearance from the family in it, and note that
 * clearance is needed from everyone whose medical history appears, not only the person who
 * happened to call us.
 *
 * `scenario` is written to illustrate a situation the firm sees, and nobody's permission
 * is involved because nobody real is in it. It exists as a separate variant rather than
 * as a `real` case with a caveat because the two must not render alike: this site's
 * argument rests on a reader being able to believe the real one, and an illustration in
 * the identical frame quietly spends that credit. The panel labels it in plain words on
 * the page. NEVER PROMOTE A SCENARIO TO `real` to make it read better — the only thing
 * that changes a scenario into a case is it having happened, to someone who agreed.
 */
export type ConcernCase =
  | { kind: 'placeholder'; brief: string }
  | {
      kind: 'scenario'
      paragraphs: readonly string[]
      /** Optional. Absent when the supplied text ends where it ends. */
      footer?: string
    }
  | {
      kind: 'real'
      paragraphs: readonly string[]
      footer: string
      /**
       * An optional chart of the case's own figures: what the policy covered, what the
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
    /**
     * Any number of columns. Fixed 2-tuples until 2026-08-18, when the beyond-employer
     * comparison arrived with four. The first cell of each row is the row header.
     *
     * Every row must have as many cells as there are columns. Not enforced by the type —
     * a tuple-per-width union would be worse to read than the thing it guards.
     */
    table?: {
      columns: readonly string[]
      rows: readonly (readonly string[])[]
      /** Row labels that are plan attributes rather than prices, styled apart from them. */
      attributeRows?: readonly string[]
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
    /**
     * The one real case on the site. It sits here from 2026-08-17; before that it ran on
     * `beyond-employer`, described as a company scheme.
     *
     * ⚠ IT WAS PUBLISHED WRONG, AND THE CORRECTION IS THE REASON IT MOVED. This is an
     * INDIVIDUAL policy. There was no employer, no HR function and no company scheme in
     * it. The earlier version opened "An HR manager called us about one of the team" and
     * attributed the S$207,000 newborn limit to "the company scheme the family were on",
     * none of which happened — and it was the sole evidence under a panel arguing that a
     * company plan has a ceiling you can run past. Do not reintroduce an employer here,
     * and do not move this back to make that panel's argument land; that panel needs a
     * real company-scheme case of its own.
     *
     * THE SHORTFALL STAYS IN. The S$53,000 the family still paid is the single most
     * credible line in the story. A case where insurance covered everything reads like
     * advertising; one that names what it did not cover reads like someone telling you
     * the truth, and that is the whole positioning.
     *
     * It belongs on this concern because the panel's own situation copy already ends on
     * "an emergency caesarean and a stay in neonatal intensive care", which is this case.
     * Use it once — a case restated on a second page dilutes on both.
     *
     * Every S$ is written explicitly so no reader assumes USD. No names, no employer, no
     * hospital, no dates.
     */
    case: {
      kind: 'real',
      paragraphs: [
        'A client’s son arrived 9 weeks early and needed neonatal intensive care at around S$4,000 a day.',
        'We arranged the newborn’s enrolment by the next working day and worked with the insurer to have cover recognised from birth, despite the paperwork being completed later. The final hospital bill reached S$260,000; the cover we recommended provided up to S$207,000 for the newborn, while the emergency caesarean was covered separately in full.',
      ],
      footer:
        'It wasn’t a perfect outcome, but without the cover in place, the family could have faced a very different financial outcome.',
      /**
       * Every figure below is lifted from the paragraph above, not calculated for effect.
       * S$260,000 less S$207,000 is the S$53,000 the family paid, which is the single
       * most credible line on the site and the reason this concern gets a chart at all.
       *
       * The gap is shown, not implied. A chart of this that stopped at "covered" would be
       * the advertising version of the same story.
       *
       * ⚠ THE CHART IS NOW THE ONLY PLACE THE SHORTFALL IS STATED. The prose was
       * rewritten on 2026-08-18 to Steven's supplied wording, which gives the bill and the
       * limit but no longer says in words that the family paid the difference — the older
       * copy ended that sentence "so the family still paid a share of it". The arithmetic
       * is still there for a reader who does it, and this chart still names the S$53,000
       * outright.
       *
       * That makes the chart load-bearing rather than decorative. Removing it would leave
       * the case reading as though the cover met the whole bill, which is the advertising
       * version of a story whose credibility rests on it not having. If the chart ever
       * goes, the shortfall has to go back into the prose in the same commit.
       *
       * The same rewrite dropped the caesarean's figures — it was billed at S$19,000
       * against a S$26,000 benefit — for "covered separately in full". Both numbers are
       * accurate and were supplied by Steven a day earlier; they are recorded here in case
       * the "Maternity limit" consideration ever wants them back.
       */
      chart: {
        heading: 'What the policy reached, and what it did not',
        total: { label: 'Final bill', display: 'S$260,000', amount: 260_000 },
        covered: {
          label: 'Covered by his policy',
          display: 'S$207,000',
          amount: 207_000,
        },
        gap: { label: 'The family paid', display: 'S$53,000' },
        footnote:
          'One real case, anonymised and permission-cleared. A newborn limit of S$207,000 is that policy’s, not a market figure, and yours will differ. It is here to show that a ceiling is a real number with a real edge, not to predict where yours sits.',
      },
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
    // furtherReading removed 2026-08-17 with the article it pointed at. See the note on
    // the field's declaration: no link beats a link to a page that no longer exists.
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
    /*
      On brief: a desk, and an expression that is considered rather than worried. The
      brief ruled out both a hospital and a look of distress, because this panel is about
      someone working out where a ceiling sits, not about being frightened by it.
    */
    image: {
      kind: 'photo',
      src: '/images/beyond-employer-cover.webp',
      alt: '',
      width: 1800,
      height: 949,
    },
    situation: [
      'A company plan is built to a budget, and that budget was not set with your family in mind. A serious illness in a private hospital here can run past the limit faster than most people expect.',
      'The other half of it is that the cover belongs to the job rather than to you. It ends when the job does, and if something is diagnosed along the way it may be excluded or loaded when you come to buy your own. You are insurable today, and that is the part people miss.',
    ],
    /**
     * The second real case, added 2026-08-17. Anonymised and cleared by the family.
     *
     * It replaced a placeholder that stood here for a few hours, after the neonatal case
     * left for `maternity` — that one is an individual policy that had been written as a
     * company scheme, and this panel was left arguing a company plan's ceiling with no
     * case under it. This is the case that argument was always waiting for: the ceiling is
     * the whole story, and it was genuinely run past.
     *
     * ⚠ DO NOT BRING THE NEONATAL CASE BACK, here or as a second case alongside this one.
     * It belongs to maternity, and it would have to be mis-described again to fit.
     *
     * FOUR PARAGRAPHS, NOT TWO, and the fourth is the one that earns the panel. The other
     * eight concerns run two. This one runs the problem, what we built, what happened, and
     * what it means now — because the `considerations` on this concern are "The ceiling"
     * AND "Portability", and the situation copy above ends on "you are insurable today,
     * and that is the part people miss". Nothing on this site demonstrated that sentence
     * until now. The renewal paragraph is not an epilogue. Do not trim it as one.
     *
     * ⚠ THE RENEWAL IS THIS POLICY'S TERMS, NOT THE MARKET'S. "It goes on renewing even if
     * they move to another country" is true of what he holds and is the most valuable
     * sentence here, which is exactly why it must never drift into a general promise about
     * what plans do. It is a sentence a reader could act on. If it is ever generalised,
     * cut it instead.
     *
     * ⚠ THE 70% IS A COMPARISON, NOT A PRICE, and it is deliberately allowed to stand on
     * the one panel whose `numbers` block below publishes no figures at all. That rule is
     * about the cost of a top-up, where two sources disagree; this is one client's own
     * quote against itself. The rule has not lapsed — do not read this as licence to put a
     * premium figure in `numbers`.
     *
     * Written in plain words on Steven's instruction: no "scoped", no "deductible
     * liability", nothing "sitting underneath" anything. The excess is explained as money
     * — whose it is and who actually pays it — because a reader who thinks a high excess
     * means a free one has been misled by the very sentence meant to reassure them.
     *
     * No names, no employer, no insurer, no hospital, no dates. The industry he works in
     * was in the source and is deliberately out: seniority explains the cover level, and
     * naming the sector alongside a spouse's diagnosis narrows him to a small community.
     */
    case: {
      kind: 'real',
      paragraphs: [
        'An expat in a top corporate role came to us about a number he had gone and checked. His company plan paid up to S$100,000 for a stay in hospital. For a serious illness in a private hospital here that does not go far, and it was the only cover his family had.',
        'We built a top-up to sit above it. Two decisions kept it affordable: it pays only for treatment in hospital, and it only starts once a bill passes S$10,000. Without those two it would have cost about 70% more. He never has to find that first S$10,000 himself, because his company plan pays that part. Between them, his family went from S$100,000 of cover to S$3.8 million.',
        'A few years in, his wife was diagnosed with stage 3 cancer. The first year of treatment came to over S$200,000.',
        'No new insurer would take her on now. This plan renews anyway, and it goes on renewing even if they move to another country.',
      ],
      footer:
        'The company plan alone would have run out inside the first year. The rest was bought while she was still insurable, which is the part nobody can buy back later.',
      /**
       * Both figures are lifted from the paragraphs above. The gap is S$200,000 less
       * S$100,000, and it inherits the "over" from the treatment figure rather than
       * claiming a precision the case does not have.
       *
       * ⚠ THE GAP MEANS THE OPPOSITE OF THE ONE ON MATERNITY. There it is what the family
       * paid, and it is credible because it admits a shortfall. Here nobody paid it — the
       * top-up did — and the bar is what the company plan did NOT reach. Same three bars,
       * reversed meaning. Do not copy that label across, in either direction.
       */
      chart: {
        heading: 'Where the company plan stopped',
        total: {
          label: 'First year of treatment',
          display: 'Over S$200,000',
          amount: 200_000,
        },
        covered: { label: 'The company plan’s cap', display: 'S$100,000', amount: 100_000 },
        gap: { label: 'Past the cap, met by the top-up', display: 'Over S$100,000' },
        footnote:
          'One real case, anonymised and permission-cleared. A cap of S$100,000 is that employer’s, and the terms of the top-up are that policy’s — including its renewal. Both will differ from yours. It is here to show that a ceiling is a real number with a real edge, not to predict where yours sits.',
      },
    },
    numbers: {
      heading: 'What a top-up costs',
      intro:
        'Three insurers, priced for the same person on the same narrow cover. The premium is modest because the deductible is high, and the deductible is affordable because the company plan pays that layer first.',
      /**
       * FIGURES CAME BACK HERE ON 2026-08-18, AND THE RULE THAT KEPT THEM OUT WAS
       * SATISFIED RATHER THAN OVERRULED. Read this before changing anything below.
       *
       * This block deliberately carried NO figures until now. The reason was a conflict:
       * a live rate table on `relocating`, and a separate set of "from" figures once
       * published for this configuration, which did not agree at the same ages. Two
       * different floors for the same cover on one site is worse than no floor at all,
       * so it showed the mechanism and no number, and said: price this properly against
       * the current rate table and it can come back.
       *
       * It was priced properly, and the two now agree. The INSURER B column here — second
       * since the columns were reordered on 2026-08-18 — is the same insurer and the same
       * USD 8,500 deductible as the relocating table, which quotes monthly. Annualised,
       * they land within 0.3%:
       *
       *   age 30   relocating 138/month -> 1,656     here 1,661.52
       *   age 40   relocating 201/month -> 2,412     here 2,409.52
       *
       * and relocating's "from" sits just below the age-30 figure, exactly as a floor
       * should. That agreement is the licence for this table. IF EITHER TABLE IS REPRICED,
       * RE-RUN THAT COMPARISON. If they ever diverge again, one of them comes down — the
       * old failure was publishing both and hoping nobody checked.
       *
       * ⚠ A, B AND P ARE THE REAL INSURERS' INITIALS, AND THAT IS STEVEN'S CALL, made
       * 2026-08-18 after being told they decode instantly to anyone in the market. His
       * reasoning: it eases internal reference, insiders guessing is not a concern, and
       * competitors name insurers outright. Do not "fix" this to neutral labels, and do
       * not read it as an oversight. `verify:copy` passes because no name appears.
       *
       * The cents are kept. They come from a real lookup, and rounding them to the dollar
       * would quietly turn a quoted premium into an estimate.
       */
      table: {
        columns: ['', 'Insurer A, USD 8,100', 'Insurer B, USD 8,500', 'Insurer P, SGD 10,000'],
        rows: [
          ['Annual limit', 'USD 2,250,000', 'USD 2,890,000', 'USD 1,562,500'],
          ['Age 30', 'USD 1,874.80', 'USD 1,661.52', 'USD 1,398.27'],
          ['Age 40', 'USD 2,234.50', 'USD 2,409.52', 'USD 1,789.98'],
          ['Age 50', 'USD 3,059.63', 'USD 4,273.90', 'USD 2,662.84'],
        ],
        /*
          The annual limit is a plan attribute, not a price, and reads as one block with
          the premiums when both are bold. Named here rather than inferred from position,
          so reordering the rows cannot silently restyle the wrong one.
        */
        attributeRows: ['Annual limit'],
      },
      /**
       * Kept short on Steven's instruction — the detail gets explained when a query comes
       * in rather than drafted into the page. What survives that trim is only what makes
       * the figures mean anything at all.
       *
       * ⚠ INSURER P'S COLUMN IS CONVERTED, AND THE PAGE NO LONGER SAYS SO. It prices in
       * SGD only and those figures are converted at 1.28. That sentence was in the footnote
       * and Steven removed it on 2026-08-18, to be explained when a query comes in rather
       * than carried on the page.
       *
       * Recorded rather than quietly dropped, because I argued the other way: a converted
       * premium sitting in a USD row invites a comparison the reader cannot know is
       * rate-dependent. It is his call and the rate is his to stand behind. What matters
       * for anyone editing this later is that the conversion is REAL — if the rate moves
       * materially, these figures move with it, footnote or no footnote.
       */
      footnote:
        'In-patient cover only, for a single adult resident in Singapore, worldwide excluding the United States, on the deductible shown in each column. Real rates from our current rate table, priced August 2026. Indicative and subject to underwriting.',
    },
    considerations: [
      {
        term: 'The ceiling',
        body: 'The number your plan stops at. Most people have never checked it.',
      },
      {
        term: 'Portability',
        body: 'What happens when the job ends, and whether your medical history goes with you.',
      },
      /*
        "Overlap" stood here until 2026-08-18, and went on Steven's instruction: making sure
        a top-up fills the gap rather than duplicating cover is something WE do when we size
        it, not something the reader is being asked to weigh. It belongs to `whatWeDo` in
        spirit, and the list is stronger at two real considerations than three where one is
        our own process wearing the reader's hat.

        This is the only concern of the nine with fewer than three. The panel heading counts
        the list rather than asserting a number, so nothing has to be invented to fill it.
      */
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
    // furtherReading removed 2026-08-17 with the article it pointed at.
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
      kind: 'photo',
      src: '/images/leaving-singapore.webp',
      alt: '',
      width: 1800,
      height: 1200,
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
    /*
      On brief: a notebook, a calculator and someone actually working a number, rather
      than the generic team meeting the brief ruled out. The rising stacks read wryly
      against a panel about a premium going up, which is the right register for it.
    */
    image: {
      kind: 'photo',
      src: '/images/renewal-premium-increase.webp',
      alt: '',
      width: 1800,
      height: 1200,
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
    // furtherReading removed 2026-08-17 with the article it pointed at.
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
    cardTitle: 'Retaining talent',
    hook: 'Benefits matter more when someone is relocating their family.',
    icon: 'briefcase',
    /*
      Addendum 5, 2026-08-17. Was "Cover as part of a senior package", which listed
      "cover" and "senior package" as two nouns beside each other and left the reader to
      infer the connection. This states the thesis: cover is a retention lever.

      THE CLAIM IS DELIBERATELY BOUNDED. "Starts with" is a real factor, not a magic
      bullet. "The cheapest way to retain people" or "the best retention you can buy"
      would be the overclaim this project already cut once — see the superlatives rule at
      the top of this file. Keep any rewrite on this side of that line.

      The cardTitle followed on 2026-08-17, from "Retaining senior and regional hires" to
      "Retaining talent" — sentence case, matching the other eight, and "talent" uncountable
      in this sense, so never "Retaining Talents".

      ⚠ THE NAV LABEL AND META TITLE STILL DO NOT FOLLOW, and that is the decision, not an
      oversight anyone should tidy up. The nav stays "Cover for senior hires" and the meta
      title stays "Medical cover for senior and regional hires", because those two fields
      have a different job: they have to match what a buyer types, and "cover" language
      reaches the right person where "talent retention" would not. A heading's job starts
      after the click, which is why it can afford to make the argument instead. Renaming
      them to match is an SEO trade, not a consistency fix — make it deliberately or not at
      all.

      ⚠ It is the only panelTitle of the nine ending in a full stop, and used as supplied.
      "Maternity cover runs on a clock" is the other sentence-shaped one and carries none.
      Dropping the stop is a one-character change if the mismatch ever reads as an error.
    */
    panelTitle: 'Retaining talent starts with the cover you offer.',
    /*
      Wooden letter cubes on white, swapped in on 2026-08-16 for a brighter version of the
      same concept shot on a saturated green background. That green was not the logo's
      leaf green and fought the stone paper; this one is neutral wood and white and sits
      on it. The swap was the palette fix, made by choosing a different photograph rather
      than by grading one, which keeps the standing decision to leave images as licensed.

      STILL OFF BRIEF, and used on instruction. Recorded so nobody rediscovers it: the
      brief asked for a senior hire settling in and ruled out a stock handshake, and a
      word spelled in blocks is a more conceptual stock image than the one it banned. It
      also reads as SELECTION, where this concern is about retention and about what cover
      is worth inside a package. A photograph of a person would still be better.
    */
    image: {
      kind: 'photo',
      src: '/images/cover-for-senior-hires.webp',
      alt: '',
      width: 1800,
      height: 1201,
    },
    situation: [
      'Thirty thousand dollars of medical cover and fifty thousand dollars of salary are not the same offer to someone deciding whether to relocate their family. Cover answers the question salary cannot, which is what happens if something goes wrong out here.',
      'For a senior or regional hire weighing up a move, that question sits somewhere behind every other line in the offer. Turnover and a wrong hire cost more than the premium ever will.',
    ],
    /**
     * A SCENARIO, NOT A CLIENT CASE, and typed as one so the panel says so on the page.
     * Supplied 2026-08-17 to show cover working as a retention lever and to put the
     * thought in an HR reader's head. Nobody real is in it, so no clearance applies.
     *
     * Told from the candidate's side on a page written for the employer, which is the
     * whole trick: the HR director is reading the moment their own benefit either holds
     * someone or fails to.
     *
     * ⚠ USED VERBATIM AS SUPPLIED, on instruction. Two things were queried and left
     * alone, recorded here so nobody "corrects" them in a later tidy-up:
     *
     *   - the semicolon before "turning", where the structure wants a comma;
     *   - "asked TIC", third person and abbreviated, where the rest of the site says
     *     "us" and never shortens the firm's name in public copy.
     *
     * Two things were queried and settled on the facts:
     *
     *   - The 30% is of TOTAL REMUNERATION. An earlier draft said "remuneration uplift",
     *     which means 30% of the pay rise instead, and confirmed as total.
     *   - It says NOTHING about whether a private plan could have covered a pregnancy
     *     already underway. It must not: /maternity-insurance tells readers "once a
     *     pregnancy has started it is usually excluded from a new plan", and a claim to
     *     the contrary here would put two answers on one site. Leave that alone unless
     *     the mechanism is stated on both pages.
     *
     * No chart. One percentage needs no visualising, and the chart exists for a case
     * where a covered amount meets a bill.
     */
    case: {
      kind: 'scenario',
      paragraphs: [
        'A senior executive considering a move asked TIC if his existing international medical cover could follow him. His prospective employer offered only domestic cover with no maternity benefit, while his wife was already pregnant. Replacing the cover privately would absorb almost 30% of his remuneration; turning an attractive offer into a much less compelling move.',
      ],
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
    /*
      Also off brief, also on instruction. The brief ruled out a corporate boardroom stock
      shot and this is the hands-in gesture, which is the same genre. It is at least about
      a group starting something together, which is what the panel is about.
    */
    image: {
      kind: 'photo',
      src: '/images/first-company-scheme.webp',
      alt: '',
      width: 1800,
      height: 895,
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
