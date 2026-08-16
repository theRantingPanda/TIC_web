import type { SVGProps } from 'react'

/**
 * Card and UI icons, inlined.
 *
 * Geometry is from Lucide (ISC licence — commercial use permitted, no in-UI attribution
 * required). Four card icons do not justify a runtime dependency, and inlining keeps
 * them in the static HTML with no extra request.
 *
 * Stroke, not fill, and drawn at 1.5px on a 24px box. A filled or duotone glyph at card
 * size reads as illustration and competes with the heading; a thin stroke reads as a
 * wayfinding mark, which is what a card icon is for.
 *
 * Deliberately NOT used: heart, shield, umbrella, handshake. That quartet is the
 * insurance-website signature the copy deck is explicitly trying not to resemble. Also
 * no anchor or ship for the offshore card — the icon would imply the separate marine
 * policy the copy is careful never to imply.
 *
 * Every icon is aria-hidden: the card heading beside it already names the thing, so
 * announcing it twice is noise.
 */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

/** International health: cover that follows you across borders. */
export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </Icon>
  )
}

/** Maternity and newborn. */
export function BabyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
      <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 18 0 9 9 0 0 0-9-9Z" />
    </Icon>
  )
}

/** Employee benefits: the company, not the individual. */
export function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </Icon>
  )
}

/** Offshore and deployed teams. A worksite, not a vessel. */
export function HardHatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1Z" />
      <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
      <path d="M4 15v-3a6 6 0 0 1 6-6" />
      <path d="M14 6a6 6 0 0 1 6 6v3" />
    </Icon>
  )
}

/** Disclosure affordance for the FAQ. Rotated by CSS on [open]. */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  )
}
