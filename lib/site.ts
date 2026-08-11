import urlContract from '@/content/url-contract.json'

export const siteConfig = {
  name: 'The Insurance Concierge',
  shortName: 'TIC',
  /** Kept in sync with the live domain — used for canonical URLs and metadataBase. */
  url: 'https://www.asktic.com',
  description:
    'Independent insurance advisory in Singapore — international health, employee benefits, maternity and speciality cover.',
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
 * Navigation — reconciled against the live Wix nav captured on 2026-08-11
 * (`content/_inventory/pages/index.html`, `<nav aria-label="Site">`).
 *
 * The live structure is: Home · Services · Members · Projects · More, where Services
 * and Members are dropdowns. Two labels are worth not "tidying":
 *
 * - **Services links to `/blog`.** That path serves the services landing page, not a
 *   blog index — hence the live `<title>` "Resource | The Insurance Concierge". The
 *   slug is indexed, so it stays; the label follows the live site rather than the slug.
 * - **Members** has no page of its own on Wix; it is a dropdown label only.
 *
 * Two destinations are remapped because their Wix targets do not exist on this site:
 * "File Access" pointed at `/file-access` (redirect-only here → `/forms`) and
 * "Knowledge Base" pointed at `help.asktic.com` (→ `/knowledge`).
 *
 * Wix's "More" entry is not reproduced: it is Wix's own responsive overflow control and
 * was empty in the capture.
 *
 * Every href here must exist in content/url-contract.json → `preserved`. That
 * invariant is asserted at build time by `npm run verify:urls`.
 */
export const primaryNav: readonly NavGroup[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/blog',
    items: [
      { href: '/international-health-insurance', label: 'International Health Insurance' },
      { href: '/maternity-insurance', label: 'Maternity Insurance' },
      { href: '/employee-benefits', label: 'Employee Benefits' },
      { href: '/speciality-insurance', label: 'Speciality Insurance' },
      { href: '/income-preservation-1', label: 'Income Preservation' },
    ],
  },
  {
    label: 'Members',
    items: [
      { href: '/forms', label: 'File Access' },
      { href: '/knowledge', label: 'Knowledge Base' },
    ],
  },
  { label: 'Projects', href: '/projects' },
] as const

/** Flattened primary nav, for the small-screen disclosure. */
export const flatNav: readonly NavItem[] = primaryNav.flatMap((group) => [
  ...(group.href ? [{ href: group.href, label: group.label }] : []),
  ...(group.items ?? []),
])

export const footerNav: readonly { heading: string; items: readonly NavItem[] }[] = [
  {
    heading: 'Services',
    items: [
      { href: '/international-health-insurance', label: 'International Health Insurance' },
      { href: '/maternity-insurance', label: 'Maternity Insurance' },
      { href: '/employee-benefits', label: 'Employee Benefits' },
      { href: '/speciality-insurance', label: 'Speciality Insurance' },
      { href: '/income-preservation-1', label: 'Income Preservation' },
    ],
  },
  {
    heading: 'Members',
    items: [
      { href: '/forms', label: 'File Access' },
      { href: '/knowledge', label: 'Knowledge Base' },
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
export const contact = {
  email: 'hello@asktic.com',
  /** From the /employee-benefits capture, the only page that publishes a number. */
  phone: '+65 6681 6455',
  social: [
    { href: 'https://www.facebook.com/InsuranceConcierge', label: 'Facebook' },
    { href: 'https://sg.linkedin.com/in/dstevenneo', label: 'LinkedIn' },
    {
      href: 'https://www.youtube.com/channel/UC37r-aLP8nNnRn-StYGQrwQ',
      label: 'YouTube',
    },
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
