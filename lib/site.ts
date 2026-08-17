import urlContract from '@/content/url-contract.json'

export const siteConfig = {
  name: 'The Insurance Concierge',
  shortName: 'TIC',
  /** Kept in sync with the live domain — used for canonical URLs and metadataBase. */
  url: 'https://www.asktic.com',
  /**
   * The company's UEN, which in Singapore is also its GST registration number. It is the
   * same number the privacy policy header carries, so it is held once here rather than
   * typed into JSX. Confirmed 2026-08-17 that the firm is GST-registered — do not render
   * a "GST Reg." label off this field for an entity that is not.
   */
  uen: '201415200G',
  description:
    'Insurance advisory in Singapore: international health, employee benefits, maternity and newborn, and cover for offshore and deployed teams.',
} as const

export type NavItem = {
  href: string
  label: string
}

/** A top-level nav entry, which may be a link, a dropdown, or both (Wix allows both). */
export type NavGroup = {
  label: string
  href?: string
  items?: readonly NavItem[]
}

/**
 * Navigation — restructured 2026-08-16, then again the same day for the concern flow.
 *
 * It previously mirrored the live Wix nav (Home · Services · Members · Projects), then
 * became Cover · For companies · Answers against the homepage copy deck. It now splits
 * along the same fork the homepage does, because the site's structure is that fork:
 *
 * - **Cover** is the individual path. Its dropdown is the five individual concerns, in
 *   the order the homepage grid shows them, plus the product page they all sit under.
 *   The parent still points at `/services`, which is `/blog`'s 301 destination.
 * - **For companies** is the company path, and its dropdown is the four company
 *   concerns. The parent points at `/employee-benefits`, which is the company hub.
 * - **About** is omitted entirely. `/about` does not exist, and there is no near-enough
 *   page to point it at. Build one before adding the entry, not the other way round.
 *
 * The dropdown labels are NOT the homepage's card titles. A card says "I already have a
 * medical condition" because the visitor has just been asked what is on their mind and
 * the card answers in their words. A nav entry is a signpost read out of that context,
 * so it names the subject: "Pre-existing conditions". Do not sync the two lists.
 *
 * "Home" is dropped because the header's logo already links `/`. The "Members" dropdown
 * is killed per the deck; its two destinations move to Answers and to the footer.
 *
 * `/income-preservation-1` and `/projects` are both retired and now 301 to /services.
 * Each was unlinked first and withdrawn afterwards. Do not add either back to a nav
 * array: `verify:urls` requires every nav href to be a preserved path, and neither is
 * one any more — the check will fail the build, which is the point.
 *
 * Every href here must exist in content/url-contract.json → `preserved`. That invariant
 * is asserted at build time by `npm run verify:urls`, which reads this file's source
 * text with a regex — so a single-quoted `href:` inside a *comment* is checked too.
 * Do not write one for a page that does not exist yet.
 */
export const primaryNav: readonly NavGroup[] = [
  {
    label: 'Cover',
    href: '/services',
    items: [
      { href: '/international-health-insurance', label: 'International health insurance' },
      { href: '/maternity-insurance', label: 'Planning for a family' },
      { href: '/relocating-to-singapore', label: 'Relocating to Singapore' },
      { href: '/beyond-employer-cover', label: 'Beyond your employer’s cover' },
      { href: '/pre-existing-conditions', label: 'Pre-existing conditions' },
      { href: '/leaving-singapore', label: 'Leaving Singapore' },
    ],
  },
  {
    label: 'For companies',
    href: '/employee-benefits',
    items: [
      { href: '/renewal-premium-increase', label: 'A renewal that has increased' },
      { href: '/cover-for-senior-hires', label: 'Cover for senior hires' },
      { href: '/offshore-and-energy', label: 'Offshore and deployed teams' },
      { href: '/first-company-scheme', label: 'Setting up a first scheme' },
    ],
  },
  { label: 'Answers', href: '/knowledge' },
] as const

/**
 * The header's primary call to action.
 *
 * Deliberately NOT a member of `primaryNav`. It is a button rather than a nav entry, and
 * it targets an in-page anchor.
 *
 * `#talk-to-us` used to name the enquiry form on the old homepage. The form has since
 * moved to the concern pages, where the question being answered is known and the lead can
 * be tagged with it, so the anchor now lands on the homepage FORK — which is the site's
 * actual ask: tell us which situation is yours. The id was kept rather than renamed so
 * this link and the two others pointing at it keep working.
 *
 * `verify:urls` strips the fragment before checking, so this validates against `/`.
 */
export const ctaLink = { href: '/#talk-to-us', label: 'Talk to us' } as const

/** Flattened primary nav, for the small-screen disclosure. */
export const flatNav: readonly NavItem[] = primaryNav.flatMap((group) => [
  ...(group.href ? [{ href: group.href, label: group.label }] : []),
  ...(group.items ?? []),
])

/*
 * THERE IS NO `footerNav`, AND THAT IS THE DECISION, NOT AN OVERSIGHT.
 *
 * A four-column sitemap stood here until 2026-08-17: "For you and your family", "For
 * companies", "Answers" and "Company", 15 links, on every page. It was removed after
 * being measured rather than admired.
 *
 * 12 OF THE 15 WERE EXACT DUPLICATES of `primaryNav` above — same hrefs, same labels —
 * and components/site-header.tsx is `sticky top-0`. A visitor standing at the footer
 * already had every one of those links 64px above them, and the small-screen <details>
 * menu in components/site-nav.tsx carries the same set in full. The conventional case
 * for a comprehensive footer assumes a header you must scroll back up to reach. This
 * site does not have one, so the sitemap was answering a question nobody was asking.
 *
 * The three links that were NOT duplicates each had a better home:
 *
 *   /privacy   -> two places. components/capture-form.tsx, at the point of collection,
 *                 which is where a privacy link belongs and where it gets read; AND the
 *                 footer's legal line, because `captureEnabled` is false until
 *                 NEXT_PUBLIC_N8N_CONTACT_WEBHOOK is set and no form renders today, so
 *                 the form link alone would have meant no privacy link anywhere.
 *   /forms     -> sent to members directly by email or WhatsApp when they need a
 *                 specific document. Nobody hunts for a claim form on a marketing site.
 *   /projects  -> nowhere. It was redundant — its page content was derived from
 *                 `primaryNav`, so the footer linked to a page that re-listed the nav.
 *                 Retired entirely on 2026-08-17 and now 301s to /services.
 *
 * /privacy and /forms still build and are still preserved paths; only their links moved.
 *
 * ⚠ IF YOU ARE ABOUT TO ADD A FOOTER SITEMAP BACK, count first. The test is not whether
 * a footer conventionally has one, it is how many of its links the sticky header already
 * carries. A genuinely new destination belongs in `primaryNav`, where every page gets it.
 */

/**
 * Contact and social links, as they appear in the live Wix footer (captured 2026-08-11).
 *
 * The live footer's brand link points at `/home-1`, which is a redirect source here, so
 * it is not reproduced — the header already links home.
 */
/**
 * The footer's about block, verbatim from the live Wix footer — captured 2026-08-12 by
 * rendering the site in a browser, which is the only way it is visible: the footer is
 * client-rendered and absent from the server HTML the earlier capture archived.
 *
 * One change: the original reads "since 2003". Corrected to 2014, the UEN registration
 * year, on Steven's instruction — the same correction applied to /income-preservation-1,
 * which said 2023. The live site carries both numbers for the same claim.
 */
export const about =
  'People often find insurance complex and finding the right one arduous. We agree it ' +
  'should be easier and have taken up the challenge to simplify it for our client. We ' +
  'have been at it since 2014; Listening, Understanding, ensuring their Peace of Mind.'

/**
 * Regulatory disclosure — the live footer's, tightened on 2026-08-17.
 *
 * This is a licensing statement for a MAS-regulated firm and appears on every page of
 * the current site. It was missing from the rebuild entirely until 2026-08-12 — not a
 * styling choice but an omission, since the earlier capture never saw the footer.
 *
 * The live wording, kept here so the edit is auditable:
 *
 *   "We are a general insurance agency incorporated in Singapore complying with the
 *    regulations and guidelines set out by the General Insurance Association (GIA), and
 *    the Monetary Authority of Singapore (MAS)."
 *
 * 33 words to 27. Same disclosure, same two bodies named, no claim added or dropped.
 *
 * ⚠ "REGULATIONS AND" IS LOAD-BEARING. A review proposed "complying with guidelines set
 * by the GIA and MAS", which is shorter and wrong: MAS is the statutory regulator and
 * issues regulations, GIA is a trade association and issues guidelines. Collapsing both
 * to "guidelines" understates the MAS relationship in the one sentence on this site whose
 * job is to state it. Shorten this further if you like; do not lose that word.
 *
 * It must also not drift into contradicting `homeCopy.trust.line`, which deliberately
 * asserts only that the INSURERS are MAS-regulated and says nothing about what this firm
 * is registered as. This sentence claims compliance, not brokerage, so the two hold.
 */
export const regulatory =
  'A Singapore-incorporated general insurance agency, complying with the regulations ' +
  'and guidelines of the General Insurance Association (GIA) and the Monetary ' +
  'Authority of Singapore (MAS).'

/**
 * Contact.
 *
 * **There is deliberately no phone number here.** `+65 6681 6455` was published in the
 * live footer sitewide and on /employee-benefits, and it is out of service. Removing the
 * field rather than blanking it is intentional: it breaks every call site at compile
 * time, which is the sweep. Do not reintroduce one without checking it answers.
 *
 * The sweep does not end at this repo. The dead number is also on the Google Business
 * listing, in the Freshdesk help centre, in PDFs in the file library and in email
 * signatures. A dead number in a Google listing is worse than none, because it is often
 * the first thing someone finds and they never reach the site at all.
 *
 * **There are deliberately no social links either**, for the same reason and by the same
 * method. YouTube went on 2026-08-16 with the channel. Facebook and LinkedIn followed on
 * 2026-08-17: both profiles are thin, and a link that lands a considering visitor on an
 * inactive page spends exactly the trust the rest of the footer is built to earn. Better
 * no link than a weak one. The `social` field is gone rather than emptied so that
 * anything still reading it fails to compile — there were two consumers, the footer's
 * brand block and the homepage's Organization JSON-LD, and both were removed with it.
 *
 * Revisit when either account has something on it worth a visitor's click. Restoring the
 * field means restoring `sameAs` in app/page.tsx too; an empty `sameAs: []` is a worse
 * signal to a search engine than an absent one, so it was deleted, not blanked.
 */
export const contact = {
  email: 'hello@asktic.com',
} as const

/** Every path this build is contractually required to emit. */
export const preservedPaths: readonly string[] = urlContract.preserved.map((p) => p.path)

/**
 * Blog-post paths the contract requires.
 *
 * These are no longer the params source — `generateStaticParams` reads content/blog,
 * so the files decide what exists and this stays a pure assertion, checked against the
 * real build output by `npm run verify:urls`.
 */
export const blogPostPaths: readonly string[] = urlContract.preserved
  .map((p) => p.path)
  .filter((path) => path.startsWith('/single-post/'))

/** Paths that must NOT emit a page — they are redirect sources handled by render.yaml. */
export const redirectOnlyPaths: readonly string[] = urlContract.redirectOnly.map(
  (r) => r.path,
)
