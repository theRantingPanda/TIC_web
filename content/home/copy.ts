/**
 * Homepage copy.
 *
 * The page is five moves and nothing else, so this file is short on purpose. It was
 * rewritten on 2026-08-16 when the ten-section copy-deck homepage was replaced by the
 * concern flow; the sections that survived moved to the pages that own them rather than
 * being deleted:
 *
 *   - the case study         -> content/concerns, on `beyond-employer`
 *   - the two lead magnets   -> content/magnets.ts, shown on /services and
 *                               /employee-benefits
 *   - the questions band     -> each concern's own route, from its `questionSlugs`
 *   - the company-cover copy -> content/concerns, on `beyond-employer`
 *
 * Everything the concern panels say lives in content/concerns/index.ts. Do not start
 * a second copy of it here.
 *
 * VOICE, which governs every string on the page and not only the ones rewritten for
 * tone: no em-dashes, British spelling, plain English, active voice, short sentences.
 * Lead with the reader's situation, not the firm's expertise.
 */

export const homeCopy = {
  /**
   * Move 1. Name and headline. There is no call to action in the hero and that is the
   * design: the fork below is the call to action, and a button here would ask the
   * visitor to commit before they have been told anything.
   */
  hero: {
    headline: 'Cover, explained by someone who is actually looking at your situation.',
    subhead: 'International health insurance for people and companies in Singapore.',
  },

  /**
   * Move 2. Trust proof.
   *
   * ⚠ THE FIGURES ARE PUBLISHED ON THE LIVE SITE and are carried forward here on that
   * basis. They were originally queried from Rainmaker against `tic_crm_dev` rather than
   * production, and that check is still outstanding:
   *
   *   1. Re-run against production.
   *   2. Fix what a "member" is and hold that definition. `persons` returns 1,727 and
   *      `member_listing` returns 1,871. Pick one and write it down.
   *   3. Check whether lapsed members are counted. If the number includes people no
   *      longer covered, the label has to become "members we have looked after".
   *   4. Set a refresh cadence. Quarterly. A number that has not moved in two years is
   *      worse than no number.
   *
   * Order is deliberate: reach and diversity lead, volume supports. 1,700 lives is
   * modest next to a large broker, so volume is not the argument. 39 countries and 62
   * nationalities say the book is genuinely cross-border, which is the exact complexity
   * an expat or a regional HR director is worried about.
   *
   * Round down, never up. Labels stay factual, because a factual label is checkable.
   */
  trust: {
    stats: [
      { figure: '1,700+', label: 'members under our care' },
      { figure: '39', label: 'countries our members live in' },
      { figure: '62', label: 'nationalities on our books' },
      { figure: '50+', label: 'corporate schemes serviced' },
    ],
    /**
     * The objection-handler, promoted 2026-08-16.
     *
     * This and `regulatory` below were one line at footnote weight until a design review
     * pointed out that the strongest commercial argument on the page was set as legal
     * fine print. They are two fields now because they are two different claims doing two
     * different jobs, and only one of them is safe to say loudly.
     *
     * THIS one is safe. The firm is paid by commission built into the premium, so the
     * price genuinely is the same either way. The site already says so on
     * /employee-benefits and in the `how-does-the-insurance-concierge-get-paid` answer
     * that several concerns link to, so promoting it here contradicts nothing.
     *
     * It is still not a section. The homepage is five moves and adding a sixth is how the
     * ten-section homepage happened the first time. Weight, not real estate.
     */
    promise: {
      lead: 'Advice does not mean paying more.',
      body: 'The premium is the same whether you come to us or go direct to the insurer. What changes is who does the running around afterwards.',
    },
    /**
     * The regulatory half. Stays quiet, and stays exactly this cautious.
     *
     * DO NOT STRENGTHEN THIS WORDING without confirming the firm's own registration
     * category first. It deliberately asserts only that the insurers are regulated, and
     * says nothing about what the firm itself is registered as. The reasons:
     *
     *   - GIA is a trade association, not a regulator. It says so on its own site.
     *   - MAS is the actual regulator.
     *   - The registered entity is "The Insurance Concierge Agency Pte. Ltd." and is
     *     externally categorised as an insurance agent. Agent and broker are legally
     *     distinct registrations in Singapore, so "independent brokerage" is a claim
     *     nobody here has verified.
     *
     * The footer separately carries the live site's own regulatory disclosure verbatim.
     * This line does not replace it and must not contradict it.
     */
    regulatory: 'Partners with MAS-regulated insurers.',
  },

  /**
   * Move 3. The binary choice.
   *
   * NO SUBTEXT UNDER THE TWO BUTTONS. It was tried twice and removed twice: it
   * consistently read as re-introducing the clutter this page exists to remove. The
   * labels live in content/concerns/index.ts with the paths they open.
   */
  fork: {
    heading: 'How can we help you today?',
  },

  /** Move 4. One line above the cards, and nothing else. */
  concerns: {
    intro: 'What is on your mind?',
  },

  /** Page metadata. The title is 69 characters. */
  meta: {
    title: 'International health insurance in Singapore | The Insurance Concierge',
    description:
      'Independent advice on international health insurance in Singapore, for people and for companies. Tell us your situation and we will tell you what it costs.',
  },
} as const
