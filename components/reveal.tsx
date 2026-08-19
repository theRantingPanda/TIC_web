'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/**
 * The one quiet reveal. Deliberately the only motion on the site.
 *
 * Inverted relative to the usual scroll-reveal pattern. The child is fully visible in
 * the server-rendered HTML and stays visible if JavaScript never runs; the effect only
 * arms itself (`data-reveal`) once the observer is attached, then plays on intersection
 * (`data-revealed`). This is a static export served from a CDN, so a hydration failure
 * or a blocked script has to cost an animation, not the content. The conventional
 * `opacity: 0` default renders a blank page in that case.
 *
 * Reduced motion is handled by returning before arming, so the element is never hidden
 * at all. The rules live in app/globals.css.
 *
 * ---- The budget widened on 2026-08-18, and here is exactly how far ----
 *
 * It used to say "section heading blocks and nothing else". Steven asked for the concern
 * pages to be paced rather than arriving as one block, so the major BANDS now reveal
 * too: the case, the numbers, the considerations, what we do, the call to action, the
 * bridge, the form, and the sibling grid as a single unit.
 *
 * WHAT DID NOT CHANGE, and is the part that was actually load-bearing: not cards, not
 * list items, and NEVER staggered by index. Nine things arriving one after another is
 * what makes a page feel like a product tour rather than something to read. The sibling
 * grid gets ONE Reveal around the whole grid for exactly this reason — see the note at
 * its call site in components/concern-page.tsx.
 *
 * Two things are deliberately still at rest. The panel's title and opening paragraphs,
 * because on a concern page that is the <h1> and the LCP element, and fading in the
 * thing the visitor came for is a cost with no benefit. And the trust band's figures,
 * which have their own motion from components/count-up.tsx and do not need two.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  /** Milliseconds. Keep it small, and keep it off lists. */
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Arm only now. Before this line the element has no [data-reveal] and is at rest.
    el.dataset.reveal = ''

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.dataset.revealed = ''
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
