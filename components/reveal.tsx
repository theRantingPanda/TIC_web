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
 * Use it on section heading blocks and nothing else — eight or so on the homepage. Not
 * cards, not list items, and never staggered by index: that is what makes a page feel
 * like a product tour rather than something to read.
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
