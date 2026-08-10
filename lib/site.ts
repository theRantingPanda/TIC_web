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

/**
 * Navigation.
 *
 * IMPORTANT: this grouping is a PLACEHOLDER. The live Wix nav — including which items
 * sit behind the "More" menu — could not be read while building the scaffold, because
 * www.asktic.com is blocked by this environment's egress policy. Reconcile against the
 * real nav after `npm run capture:site` succeeds, then delete this notice.
 *
 * Every href here must exist in content/url-contract.json → `preserved`. That
 * invariant is asserted at build time by `npm run verify:urls`.
 */
export const primaryNav: readonly NavItem[] = [
  { href: '/international-health-insurance', label: 'International Health' },
  { href: '/employee-benefits', label: 'Employee Benefits' },
  { href: '/maternity-insurance', label: 'Maternity' },
  { href: '/speciality-insurance', label: 'Speciality' },
] as const

/** The "More" overflow menu. */
export const moreNav: readonly NavItem[] = [
  { href: '/income-preservation-1', label: 'Income Preservation' },
  { href: '/knowledge', label: 'Knowledge Base' },
  { href: '/forms', label: 'Forms' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
] as const

export const footerNav: readonly { heading: string; items: readonly NavItem[] }[] = [
  {
    heading: 'Cover',
    items: [
      { href: '/international-health-insurance', label: 'International Health' },
      { href: '/employee-benefits', label: 'Employee Benefits' },
      { href: '/maternity-insurance', label: 'Maternity' },
      { href: '/speciality-insurance', label: 'Speciality' },
      { href: '/income-preservation-1', label: 'Income Preservation' },
    ],
  },
  {
    heading: 'Resources',
    items: [
      { href: '/knowledge', label: 'Knowledge Base' },
      { href: '/forms', label: 'Forms' },
      { href: '/blog', label: 'Blog' },
      { href: '/projects', label: 'Projects' },
    ],
  },
  {
    heading: 'Company',
    items: [{ href: '/privacy', label: 'Privacy' }],
  },
] as const

/** Every path this build is contractually required to emit. */
export const preservedPaths: readonly string[] = urlContract.preserved.map((p) => p.path)

/** Paths that must NOT emit a page — they are redirect sources handled by render.yaml. */
export const redirectOnlyPaths: readonly string[] = urlContract.redirectOnly.map(
  (r) => r.path,
)
