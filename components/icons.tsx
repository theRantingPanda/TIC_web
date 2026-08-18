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

/**
 * Maternity and newborn.
 *
 * An hourglass rather than a baby, and that is the better icon for what this card
 * actually argues: "waiting periods mean timing decides this one". The clock is the
 * point, and a pram or a baby would say only "this card is about babies", which the
 * heading already says.
 */
export function HourglassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 2h14" />
      <path d="M5 22h14" />
      <path d="M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2" />
      <path d="M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22" />
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

/**
 * The individual door on the homepage fork.
 *
 * A single figure, not a family group: the door covers "myself or my family" and drawing
 * two adults and a child would quietly exclude the visitor buying for one person, who is
 * a large share of this path.
 *
 * This pair replaced the emoji 👤 and 🏢 that were tried on the fork buttons. Emoji
 * undermine the restrained visual language and render inconsistently across platforms.
 */
export function PersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </Icon>
  )
}

/* ---- Concern card marks ----
 *
 * One per concern, resolved from the concern's `icon` key in
 * components/concern-card.tsx. Added 2026-08-16 after a design review found the card
 * grid read as "five identical white rectangles": everything on the homepage carried the
 * same visual weight, so nothing invited the visitor to continue.
 *
 * These break that up at the cheapest possible cost. They are marks, NOT illustrations,
 * and NOT photographs — the handoff established that selection steps stay lean and
 * imagery is earned at the drill-down, and the review that asked for these agreed.
 *
 * The file's standing bans hold: no heart, no shield, no umbrella, no handshake. That
 * quartet is the insurance-website signature the whole design is trying not to resemble.
 * Note in particular that `pre-existing` gets a pulse line rather than a heart.
 */

/** Relocating to Singapore. Arriving, so the arrow points in. */
export function ArriveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 3v18" />
      <path d="M9 12h11" />
      <path d="m15 7 5 5-5 5" />
    </Icon>
  )
}

/** Leaving Singapore. The mirror of ArriveIcon, so the pair reads as a pair. */
export function DepartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 3v18" />
      <path d="M4 12h11" />
      <path d="m10 7 5 5-5 5" />
    </Icon>
  )
}

/**
 * Looking beyond your employer's cover. A ceiling with something arriving at it, which
 * is the panel's entire argument: the plan has a limit and a bill can reach it.
 */
export function CeilingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 5h18" />
      <path d="M12 21V10" />
      <path d="m7 15 5-5 5 5" />
    </Icon>
  )
}

/** Pre-existing conditions. A pulse line, deliberately not a heart. */
export function PulseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 12h4l2.5-7 5 14 2.5-7h6" />
    </Icon>
  )
}

/** A renewal that has come back higher. */
export function TrendUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 20h18" />
      <path d="m4 15 5-5 4 4 6-7" />
      <path d="M15 7h4v4" />
    </Icon>
  )
}

/** Cover for senior hires. The package, not the person. */
export function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M2 13h20" />
    </Icon>
  )
}

/**
 * Setting up a first scheme. A sprout, which echoes the two leaves in the logo mark and
 * says "starting something" without reaching for a generic plus sign.
 */
export function SproutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 21v-8" />
      <path d="M12 13C12 9 9 6 5 6c0 4 3 7 7 7Z" />
      <path d="M12 13c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6Z" />
    </Icon>
  )
}

/**
 * The mark on a drill-down's photography placeholder.
 *
 * Only ever appears where a real photograph has not been shot yet. When the last brief is
 * replaced this icon has no call sites left, and that is the signal to delete it rather
 * than to find it a new job.
 */
export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m21 15-4.5-4.5L7 21" />
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

/* ---- Trust band marks ----
 *
 * The four figures under the hero, resolved from each stat's `icon` key in app/page.tsx.
 * Added 2026-08-18: the band was four numbers in a row on a plain rule and read as a
 * table of contents rather than as proof.
 *
 * Only two are new. The marks supplied for "countries" and "corporate schemes" were, on
 * inspection, the globe and the briefcase this file already draws — same circle and
 * meridian, same case with a handle and a divider, at a slightly different scale. They
 * are reused rather than added a second time under a second name, which is the whole
 * reason this file exists in one piece.
 */

/**
 * Members under our care. A group, not a single figure.
 *
 * Note this is the deliberate opposite of PersonIcon above, and the reasoning there does
 * not transfer: the fork asks the visitor which door is theirs, so a crowd would exclude
 * the person buying for one. This is a count of everyone on the book, where a lone
 * figure would undersell the only stat on the band that is about volume.
 */
export function MembersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="7.5" r="3" />
      <path d="M3.5 20c0-3.6 2.46-6.2 5.5-6.2s5.5 2.6 5.5 6.2" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M15 20c0-2.9 1.53-5.3 3.6-6" />
    </Icon>
  )
}

/**
 * Nationalities on our books. One flag, and one is the point.
 *
 * Not a cluster of flags and not a flag of anywhere: the glyph is blank on purpose, so
 * it reads as "nationality" rather than as any particular nationality. A recognisable
 * flag on a band that claims 62 of them would pick a favourite.
 */
export function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 21V3" />
      <path d="M6 4.2c2-1.3 4-1.3 6 0s4 1.3 6 0v8.4c-2 1.3-4 1.3-6 0s-4-1.3-6 0V4.2z" />
    </Icon>
  )
}
