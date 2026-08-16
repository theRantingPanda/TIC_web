import urlContract from '@/content/url-contract.json'

export const siteConfig = {
  name: 'The Insurance Concierge',
  shortName: 'TIC',
  /** Kept in sync with the live domain — used for canonical URLs and metadataBase. */
  url: 'https://www.asktic.com',
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
 * - **Cover** is the individual path. Its dropdown is the four individual concerns, in
 *   the order the homepage grid shows them, plus the product page they all sit under.
 *   The parent still points at `/services`, which is `/blog`'s 301 destination.
 * - **For companies** is the company path, and its dropdown is the four company
 *   concerns. The parent points at `/employee-benefits`, which is the company hub.
 * - **About** is omitted entirely. `/about` does not exist, and pointing it at
 *   `/projects` would be worse than leaving it out.
 *
 * The dropdown labels are NOT the homepage's card titles. A card says "I already have a
 * medical condition" because the visitor has just been asked what is on their mind and
 * the card answers in their words. A nav entry is a signpost read out of that context,
 * so it names the subject: "Pre-existing conditions". Do not sync the two lists.
 *
 * "Home" is dropped because the header's logo already links `/`. The "Members" dropdown
 * is killed per the deck; its two destinations move to Answers and to the footer.
 * "Projects" moves to the footer's Company column so `/projects` is not orphaned.
 *
 * `/income-preservation-1` is retired. It was unlinked first, then withdrawn entirely
 * on 2026-08-16 and now 301s to /services. Do not add it back to either nav array:
 * `verify:urls` requires every nav href to be a preserved path, and it is no longer one.
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
 * it targets an in-page anchor: the enquiry form is section 10 of the homepage, since
 * `/contact` does not exist yet. `verify:urls` strips the fragment before checking, so
 * this validates against `/`.
 */
export const ctaLink = { href: '/#talk-to-us', label: 'Talk to us' } as const

/** Flattened primary nav, for the small-screen disclosure. */
export const flatNav: readonly NavItem[] = primaryNav.flatMap((group) => [
  ...(group.href ? [{ href: group.href, label: group.label }] : []),
  ...(group.items ?? []),
])

/**
 * Footer columns, per the copy deck: Cover · Answers · Company · Contact.
 *
 * Only three are here — the fourth, Contact, is the footer's brand block, which already
 * carries the email address and the social links.
 *
 * "About" and "Contact" are absent from Company because those pages do not exist yet.
 * Add them here when they do; the layout already has the room.
 */
export const footerNav: readonly { heading: string; items: readonly NavItem[] }[] = [
  {
    heading: 'For you and your family',
    items: [
      { href: '/international-health-insurance', label: 'International health insurance' },
      { href: '/maternity-insurance', label: 'Planning for a family' },
      { href: '/relocating-to-singapore', label: 'Relocating to Singapore' },
      { href: '/beyond-employer-cover', label: 'Beyond your employer’s cover' },
      { href: '/pre-existing-conditions', label: 'Pre-existing conditions' },
    ],
  },
  {
    heading: 'For companies',
    items: [
      { href: '/employee-benefits', label: 'Employee benefits' },
      { href: '/renewal-premium-increase', label: 'A renewal that has increased' },
      { href: '/cover-for-senior-hires', label: 'Cover for senior hires' },
      { href: '/offshore-and-energy', label: 'Offshore and deployed teams' },
      { href: '/first-company-scheme', label: 'Setting up a first scheme' },
    ],
  },
  {
    heading: 'Answers',
    items: [
      { href: '/knowledge', label: 'Knowledge base' },
      { href: '/forms', label: 'Forms and documents' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { href: '/projects', label: 'Projects' },
      { href: '/privacy', label: 'Privacy' },
    ],
  },
] as const

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
 * Regulatory disclosure, verbatim from the live footer.
 *
 * This is a licensing statement for a MAS-regulated firm and appears on every page of
 * the current site. It was missing from the rebuild entirely until 2026-08-12 — not a
 * styling choice but an omission, since the earlier capture never saw the footer.
 */
export const regulatory =
  'We are a general insurance agency incorporated in Singapore complying with the ' +
  'regulations and guidelines set out by the General Insurance Association (GIA), and ' +
  'the Monetary Authority of Singapore (MAS).'

/**
 * Contact and social links.
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
 * YouTube was removed at the same time — the channel is being dropped, so the link goes
 * rather than being repointed.
 */
export const contact = {
  email: 'hello@asktic.com',
  social: [
    { href: 'https://www.facebook.com/InsuranceConcierge', label: 'Facebook' },
    { href: 'https://sg.linkedin.com/in/dstevenneo', label: 'LinkedIn' },
  ],
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
