/**
 * Homepage copy, verbatim from asktic-homepage-copy-deck.md.
 *
 * ONE RULE: this file diffs against the deck. Every string here is the deck's string.
 * If a line needs to change, change it in the deck first and bring it across, so the
 * two never disagree about what the page says.
 *
 * It lives in content/ rather than inline in app/page.tsx for three reasons. Ten
 * sections of prose inline would push that file past 700 lines and mix copy edits with
 * layout edits. A `.ts` string is not JSX text, so no entity escape can silently alter
 * verbatim copy the way hand-written &rsquo; in markup can. And content/ is already
 * hashed as a build input by scripts/lib/build-stamp.ts, so a copy edit correctly
 * invalidates the URL-contract check.
 *
 * THINGS THAT MUST NOT BE TRIMMED FOR LAYOUT:
 *
 * - `s04.band.footnote`. The cost-band figures are low because the configuration is
 *   narrow. A reader who sees the number without "in-patient cover only" and the
 *   deductible floor will either think the firm is cheap or think they were misled, and
 *   the second costs the relationship. It is not boilerplate.
 * - `s04.paragraphs`, on accuracy. It says cover "may be excluded or loaded", never
 *   "will be", and it says some schemes offer continuation and many do not. The honest
 *   version is more persuasive than the frightening version, and the frightening version
 *   is the one that gets challenged.
 * - `s06`, on figures. Every SGD amount is written `S$` explicitly so no reader assumes
 *   USD. "at least" on the daily rate is deliberate: it is a floor, not a ceiling.
 *
 * DEVIATIONS FROM THE DECK, all recorded and all deliberate:
 *
 * 1. Section 07 ("What it actually costs") is cut, as the deck's own section 04 note
 *    recommends: it read as a fourth unlabelled pricing configuration and overlapped
 *    the two-field ask. Pricing lives in the section 04 band.
 * 2. Section 05's third point uses the deck's proposed administration replacement. The
 *    deck marks the point OPEN. This copy claims administration only, which the section
 *    06 case already evidences, and implies no clinical judgement.
 * 3. Section 09's first question in the deck is "What happens to my cover when I leave
 *    the company?", which has no article — content/kb/ is empty and it is not among the
 *    12 ported posts. Substituted with an existing one that stays in register. Write the
 *    real article and swap it back; the deck names it as a knowledge base priority.
 * 4. Section 06's "Read what happened next" link is omitted. Its target /answers/[slug]
 *    does not exist, and the deck itself complains about the current homepage's broken
 *    card links.
 * 5. Hero CTA 1 anchors to the two-field ask, which is in section 05. The deck's hero
 *    note says "section 04 mini-form"; its own conversion table says after section 05.
 *
 * UNVERIFIED, must not go live as-is: `s02.stats`. See the note on that field.
 */

export const s01Hero = {
  headline: 'Peace of Mind, Simplified!',
  subhead:
    'We arrange international health insurance for people and companies in Singapore, and then we run it. Renewals, pre-authorisations, claims, appeals. The same person every time, and it costs you nothing extra.',
  primaryCta: { label: 'Get an indicative price', href: '#indicative-price' },
  secondaryCta: { label: 'Cover my team', href: '/employee-benefits' },
} as const

/**
 * Section 02.
 *
 * ⚠ THESE FIGURES ARE NOT CLEARED FOR PRODUCTION.
 *
 * Source: Rainmaker, queried 14 August 2026 — but against `tic_crm_dev`, not
 * production. Before this ships, per the deck's own checklist:
 *
 *   1. Re-run against production.
 *   2. Fix what a "member" is and hold that definition. `persons` returns 1,727 and
 *      `member_listing` returns 1,871. Pick one and write it down.
 *   3. Check whether lapsed members are counted. 34 of 279 policies are lapsed. If the
 *      number includes people no longer covered, the label has to become "members we
 *      have looked after" rather than "members under our care".
 *   4. Set a refresh cadence. Quarterly. A number that has not moved in two years is
 *      worse than no number.
 *
 * Order is deliberate: reach and diversity lead, volume supports. 1,700 lives is modest
 * next to a large broker, so volume is not the argument. 39 countries and 62
 * nationalities say the book is genuinely cross-border, which is the exact complexity an
 * expat or a regional HR director is worried about.
 *
 * Round down, never up. Labels stay factual — "countries our members live in" is
 * stronger than any "global reach you can rely on" framing, because it is checkable.
 */
export const s02Numbers = {
  heading: 'Where our members are',
  stats: [
    { figure: '1,700+', label: 'members under our care' },
    { figure: '39', label: 'countries our members live in' },
    { figure: '62', label: 'nationalities on our books' },
    { figure: '50+', label: 'corporate schemes serviced' },
  ],
} as const

export const s03Arrange = {
  heading: 'What we arrange',
  cards: [
    {
      title: 'International health',
      body: 'Cover that follows you when you move, and pays the hospital directly instead of leaving you to claim it back.',
      link: { label: 'How this works', href: '/international-health-insurance' },
    },
    {
      title: 'Maternity and newborn',
      body: 'Waiting periods mean timing decides this one. If you are planning, talk to us before you start trying, not after.',
      link: { label: 'The maternity timeline', href: '/maternity-insurance' },
    },
    {
      title: 'Employee benefits',
      body: 'The cheapest retention you can buy for senior and regional hires. Cover answers the question salary cannot, which is what happens if something goes wrong out here.',
      link: { label: 'What it involves', href: '/employee-benefits' },
    },
    {
      /**
       * NOT a marine or specialty product. The specialty line was dropped and this card
       * does not reinstate it. The need is a flexibility requirement on ordinary
       * international cover: onboard a hire wherever they sit, cover treatment wherever
       * they end up, and have an evacuation work when it is the only option. The copy
       * must never imply a separate marine policy.
       */
      title: 'Offshore and deployed teams',
      body: 'Hire in Kuala Lumpur, deploy offshore, treat in Singapore. Cover that onboards anywhere and holds up when an evacuation is the only option.',
      link: { label: 'How this works', href: '/offshore-and-energy' },
    },
  ],
} as const

/**
 * Section 04, aimed at people who do not think they are in the market.
 *
 * Everything else on this page speaks to someone already shopping. This speaks to
 * someone who believes they are covered, which is a much larger audience. It sits
 * straight after the services grid because a reader who thinks "I have cover through
 * work" is otherwise gone by section 05.
 *
 * Relocation and leaving employment are deliberately one paragraph, not two. They are
 * the same mechanism, re-underwriting, triggered by different events. The opening line
 * does the organising work: the cover belongs to the job, not to you.
 *
 * Two clocks run here and they are different. Insurability closes when a diagnosis
 * lands. Maternity closes when the waiting period no longer fits the plan. Both argue
 * for acting now, so do not merge them.
 *
 * No condition is named anywhere. "If something is diagnosed" carries the weight without
 * turning the section into a health scare.
 */
export const s04CompanyCover = {
  heading: 'If your only cover is through work',
  paragraphs: [
    'Cover through work belongs to the job, not to you. Three things follow from that, and they tend to go unnoticed until the moment they matter.',
    'The first is the ceiling. A company plan is built to a budget, and that budget was not set with your family in mind. A serious illness in a private hospital here can run past the limit faster than most people expect.',
    'The second is that it does not travel. Your cover ends when the job does, and it does not follow you to the next one. If something is diagnosed along the way, it may be excluded or loaded when you come to buy your own, or when the next employer’s plan underwrites you. Relocate two or three times and you are betting each move that the next scheme is as good as the last and will take your history as it stands. Some schemes let you continue without fresh underwriting. Many do not. Most people have never checked which one they are on.',
    'The third is maternity. Plenty of company plans leave it out entirely or cap it low, and as an expat you are outside the subsidised system that residents fall back on. A straightforward delivery is manageable. An emergency caesarean and a stay in neonatal intensive care is a different number altogether, and it arrives with no notice. Maternity also runs on its own clock, because waiting periods mean the cover has to be in place long before you need it.',
    'You are insurable today. That is the part people miss.',
  ],
  band: {
    intro:
      'Sitting a plan above your company cover costs less than most people assume, because the company plan absorbs the first layer and the deductible can be set high.',
    stats: [
      { figure: 'from USD 95 a month', label: 'age 30' },
      { figure: 'from USD 115 a month', label: 'age 40' },
      { figure: 'from USD 160 a month', label: 'age 50' },
    ],
    /**
     * Load-bearing. Do not shorten. See the file header.
     *
     * Age 60 is deliberately absent — the underlying work priced 30, 40 and 50 only.
     * Do not extrapolate a fourth card; price age 60 properly or run the band with three.
     *
     * "From" is doing real work: it is a floor, not a quote, so a higher figure at
     * underwriting is not a broken promise. Round UP to reach the stated floor, never
     * down. A from-figure that cannot actually be delivered is the one version of this
     * that would hurt.
     */
    footnote:
      'Indicative and subject to underwriting. Single adult resident in Singapore, in-patient cover only, worldwide excluding the United States, on a deductible of USD 8,500 or more. Monthly payment carries a small loading on most plans, so paying annually usually works out cheaper over the year. Priced August 2026.',
  },
  /**
   * The strongest offer on the site: a check on what someone could buy while they still
   * can. Free, low commitment, and genuinely useful.
   *
   * The deck points this at /contact, which does not exist yet. It anchors to the
   * enquiry form on this page instead. Repoint when /contact is built.
   */
  cta: { label: 'Find out what you could buy today', href: '#talk-to-us' },
} as const

/**
 * Section 05. The argument the page rests on, which is why it sits this high.
 *
 * Nothing here may imply round-the-clock availability or clinical judgement. The firm is
 * not a 24 hour operation and is not medically trained. An earlier draft had a hospital
 * wanting a deposit at midnight and a stalled pre-authorisation being chased; both were
 * promises the firm had not agreed to make, and the second was outside its competence.
 *
 * Point 1 is the real differentiator. Anyone can say they shop the renewal. Saying the
 * answer is often "stay put, because your medical history is worth more than the saving"
 * is the line a reader remembers, because it is the opposite of what they expect a
 * broker to say. It also makes no coverage claim: "what else is open to you" is accurate
 * and does not imply a market survey.
 */
export const s05AfterYouBuy = {
  heading: 'What you get after you’ve bought',
  points: [
    {
      title: 'When the renewal price does not stand up',
      body: 'Premiums climb, and some years the increase is harder to justify than others. When that happens we look at what else is open to you and tell you plainly whether moving is worth it. Often it is not, because what you would give up on your medical history costs more than the premium you would save. You get the comparison either way.',
    },
    {
      title: 'The price is the same',
      body: 'Buying through us costs you nothing extra. The premium is the same whether you come to us or go direct to the insurer.',
    },
    {
      /**
       * The deck marks this point OPEN. This is its proposed replacement, adopted.
       *
       * The original claims-advocacy point was removed as an overclaim: it described
       * chasing pre-authorisations and overturning declines, which is a clinical review
       * between the treating doctor and the insurer's medical team. This version is
       * built only on administration, which is genuinely the firm's and is evidenced by
       * the case in section 06. If any part of it is also an overclaim, cut it and run
       * the section on two points — two honest points beat three where one is soft.
       */
      title: 'The paperwork is ours',
      body: 'Getting on cover, and staying on it, is mostly paperwork, and paperwork is where things quietly go wrong. Enrolments, additions, a new baby, a change of country, a document an insurer says it never received. We handle that side of it so it does not land on you at the worst possible time.',
    },
  ],
} as const

/**
 * Section 06. Anonymised, permission cleared.
 *
 * The shortfall stays in. The S$53,000 the family still paid is the single most credible
 * line in the story. A case study where insurance covered everything reads like
 * advertising; one that names what it did not cover reads like someone telling you the
 * truth, and that is the whole positioning.
 *
 * The clause about the scheme including newborn cover is deliberate. Section 04 says
 * many company plans leave maternity out; this case features a company scheme that
 * covered a newborn from birth. Both are true, and this is the more fortunate outcome —
 * stating it makes the point sharper rather than softer.
 *
 * The HR manager is deliberately ungendered. Keep it that way: the detail adds nothing
 * and narrows identifiability. No names, no employer, no hospital, no dates.
 *
 * TWO permissions are required here, not one — the family's and the employer's, since
 * the story opens on their HR function and describes their scheme's limits.
 */
export const s06Case = {
  heading: 'One case',
  paragraphs: [
    'An HR manager called us about one of the team. His son had arrived 9 weeks early and was in neonatal intensive care at a private hospital in Singapore. The unit was running at S$4,000 a day at least, and nobody could say how many days there would be. We were put straight on the phone with him. He wanted to know one thing, which was whether the insurer would stand behind it.',
    'We had the newborn enrolled by the next working day. The administration landed about a week after he was born, but the insurer agreed to guarantee the bills from birth rather than from the date the paperwork caught up. The company scheme the family were on covers a newborn from birth up to S$207,000. The final bill came to S$260,000, so they still paid a share of it. The emergency caesarean was a separate bill, and that one was covered in full.',
  ],
  footer:
    'Nobody would call that a perfect outcome. It was a very different one from the alternative.',
} as const

/**
 * Section 08. Two segments, two magnets, two follow-up sequences. Do not merge the lists.
 *
 * Panel B is aimed at whoever signs off the reward budget, not at whoever administers
 * it. The renewal season checklist was the earlier magnet here; it is a good document
 * but it speaks to an administrator, so it belongs further down /employee-benefits or in
 * the follow-up sequence.
 *
 * These are the highest-intent visitors on the page. Maternity has a deadline and a
 * reward budget has a renewal date, which is why both convert on a document.
 */
export const s08TwoWaysIn = {
  heading: 'Whichever side of this you are on',
  panels: [
    {
      audience: 'For individuals and families',
      intro:
        'Moving here, having a baby, coming off a company scheme, or just tired of not understanding what you bought.',
      magnetTitle: 'The maternity and newborn timeline',
      magnetBody:
        'When to buy, what the waiting periods actually mean, and the point after which it is too late. One page, no jargon.',
      buttonLabel: 'Send me the timeline',
    },
    {
      audience: 'For HR directors and CFOs',
      intro:
        'Building a package that holds onto senior and regional people, renewing one that is costing more than it should, or covering a workforce that does not sit in one country.',
      magnetTitle: 'What cover is worth on a senior package',
      magnetBody:
        'Why thirty thousand of medical cover and fifty thousand of salary are not the same offer to someone deciding whether to move their family. With the numbers worked through.',
      buttonLabel: 'Send me the numbers',
    },
  ],
} as const

/**
 * Section 09.
 *
 * The deck's first question is "What happens to my cover when I leave the company?",
 * which has no article anywhere — content/kb/ is empty and it is not among the 12 ported
 * posts. Linking a question to nothing is exactly the defect the deck complains about on
 * the current homepage, so it is substituted here with an existing article that stays in
 * register: the other two are worries, and a renewal increase is a worry. It also
 * reinforces section 05's lead point.
 *
 * Write the leaving-a-company-scheme article and swap it back. The deck names it as one
 * of three knowledge base pieces section 04 feeds directly.
 *
 * Answers are each article's own `summary` frontmatter, never a rewrite.
 */
export const s09Questions = {
  heading: 'What people ask us',
  slugs: [
    'why-has-my-renewal-premium-increased',
    'will-my-pre-existing-conditions-be-covered',
    'what-happens-if-my-claim-is-rejected',
  ],
  allAnswers: { label: 'All answers', href: '/knowledge' },
} as const

export const s10Closing = {
  headline: 'Tell us the situation. We’ll tell you what it costs.',
  subhead: 'Six fields, no obligation, and a reply the same working day.',
  whoOptions: ['Just me', 'Me and my partner', 'My family', 'My company'],
  /** Field 6 is where the useful information arrives. Keep it optional. */
  freeTextPlaceholder: 'Pregnant, moving to Jakarta in March, that kind of thing.',
  buttonLabel: 'Send this',
  confirmation: 'Got it. We’ll come back to you today or tomorrow morning.',
  fallbackLine: 'Or email us at',
} as const

/** Page metadata. The title is the deck's, at 57 characters. */
export const meta = {
  title: 'International health insurance in Singapore | The Insurance Concierge',
  description:
    'Independent advice on international health insurance in Singapore. We arrange your cover and then we run it, from pre-authorisations to claims to renewal.',
} as const
