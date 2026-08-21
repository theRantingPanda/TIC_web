'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A figure that counts up to itself once, when it is scrolled into view.
 *
 * Added 2026-08-18 for the trust band under the hero, which is this component's only
 * consumer. The band was four numbers on a plain rule and read as inert; Steven asked
 * for the page to be "a little more energetic", and for the motion to be slower than the
 * 600ms first proposed.
 *
 * ---- The safety properties, which matter more than the effect ----
 *
 * 1. THE SERVER RENDERS THE FINAL FIGURE. The component only takes over after it has
 *    mounted, so a blocked or failed script costs the animation and never the number.
 *    Same posture as components/reveal.tsx: enhance, never render. A count-up that ships
 *    `0` in the HTML and fills it in with JavaScript publishes a false figure to anything
 *    that does not run scripts, which on this site includes every crawler that matters.
 *
 * 2. ANYTHING THAT DOES NOT PARSE RENDERS STATIC. `1,700+`, `39`, `62` and `50+` all
 *    split cleanly, but if a later figure is `~40k` or `1 in 3` it simply does not roll.
 *    It must never render `NaN` on the homepage, so the regex failing is a normal path,
 *    not an error path.
 *
 * 3. THE FINAL FRAME HANDS BACK THE SOURCE STRING rather than a formatted number, so
 *    what settles on screen is character-for-character the copy in content/home/copy.ts.
 *    The digits are grouped here by regex rather than by `toLocaleString`, which would
 *    put full stops in the thousands separator under a German locale.
 *
 * 4. THE SCREEN READER IS TOLD THE NUMBER ONCE. While animating, the rolling text is
 *    aria-hidden and an sr-only span carries the final figure; both revert when it
 *    settles, so the band is not left with a duplicate that would come out twice in a
 *    copy-paste of the page.
 *
 * Note this overrides the "No count-up animation" note in components/stat-band.tsx, and
 * that note is worth reading before touching this: its three objections were to an
 * odometer that stacks each digit as its own element. This is one text node, so text
 * selection is intact, and points 3 and 4 above answer the rest.
 */

/**
 * Milliseconds. Slowed from the 600 first proposed, on Steven's note, and slow enough
 * that the last few hundred milliseconds of the ease are legible rather than a blur.
 */
const DURATION_MS = 1600

/** Prefix, grouped digits, suffix. `1,700+` splits to ``, `1,700`, `+`. */
const FIGURE = /^(\D*)([\d,]+)(\D*)$/

/**
 * How late the script may arrive and still be allowed to animate, in milliseconds since
 * navigation started.
 *
 * The band sits directly under the hero, so on a desktop load it is usually already in
 * view when the observer arms — which means the visitor sees the real figure first and
 * then watches it reset to zero and climb back. That backwards flash is the one way this
 * component can look broken, and it is worst on exactly the slow connection where the
 * figure has been on screen longest.
 *
 * So the animation is only allowed to claim a number the visitor has not had time to
 * read. Past the deadline it stands still, which is the correct outcome and not a
 * degraded one.
 */
const ARM_DEADLINE_MS = 1500

/** Grouped by regex, not by locale: `1700` to `1,700` on every browser. */
function group(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  /** `null` means "render the source string" — the state before and after the roll. */
  const [rolling, setRolling] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const match = FIGURE.exec(value)
    if (!match) return
    const [, prefix, digits, suffix] = match
    const target = Number(digits.replace(/,/g, ''))
    if (!Number.isFinite(target)) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (performance.now() > ARM_DEADLINE_MS) return

    let frame = 0
    let started = 0

    const step = (now: number) => {
      if (!started) started = now
      const t = Math.min((now - started) / DURATION_MS, 1)
      // Ease-out cubic, so it decelerates into the figure rather than snapping to it.
      const eased = 1 - (1 - t) ** 3
      if (t < 1) {
        setRolling(prefix + group(Math.round(target * eased)) + suffix)
        frame = requestAnimationFrame(step)
      } else {
        // Hand back to the source string. See point 3 above.
        setRolling(null)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setRolling(prefix + group(0) + suffix)
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
    // `value` only. The regex match is recomputed inside, deliberately: a dependency on
    // the match array would be a fresh object every render and restart the roll forever.
  }, [value])

  return (
    <>
      <span ref={ref} className={className} aria-hidden={rolling !== null}>
        {rolling ?? value}
      </span>
      {rolling !== null ? <span className="sr-only">{value}</span> : null}
    </>
  )
}
