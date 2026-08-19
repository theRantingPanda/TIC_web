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
/**
 * Following an in-page link settles every reveal at once.
 *
 * WHY THIS EXISTS. The reveal budget widened on 2026-08-18 from heading blocks to the
 * major bands, and that turned the concern pages' own call to action into a bad
 * experience: clicking "Find out what you could buy today" scrolls about 680px, and on
 * the way it passes five blocks that have never been on screen. Each one starts a 500ms
 * fade and lift as the page flies past it, and the form the visitor was actually sent to
 * is still mid-animation when they arrive. Steven reported it as the form not flowing
 * smoothly, and he was right — the scroll was fine, the contents of the scroll were not.
 *
 * A visitor who has ASKED to be taken somewhere has stopped browsing. Reveal is there to
 * pace reading, and there is no reading happening during a 400ms jump. So an in-page
 * click flushes every outstanding reveal before the scroll starts, and the whole journey
 * is over settled content.
 *
 * Blunt on purpose: it settles the whole page, not just the destination. Anything the
 * visitor scrolls back up to afterwards would have been revealed on the way down
 * regardless, so there is nothing left to stage.
 *
 * ONE listener for the page, installed by whichever Reveal mounts first, in capture phase
 * so it runs before any framework handler that might preventDefault. Also flushes on
 * `hashchange` and on arriving with a hash already in the URL, which is the same
 * situation reached from a different page.
 */
let flushInstalled = false

function settleAll() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')) {
    // `settled` before `revealed`: it kills the transition, so the element arrives
    // finished instead of starting a 500ms fade the visitor scrolls straight past.
    el.dataset.settled = ''
    el.dataset.revealed = ''
  }
}

function installSettleOnAnchor() {
  if (flushInstalled) return
  flushInstalled = true

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      // Same-document links only. An href of "#" alone is a placeholder, not a
      // destination, so it is left to whatever handler owns it.
      const link = target.closest('a[href^="#"]')
      if (!link || link.getAttribute('href') === '#') return
      settleAll()
    },
    true,
  )

  window.addEventListener('hashchange', settleAll)

  /*
    Arriving with a hash already in the URL is the same situation reached from another
    page, so it settles too — but a frame later. This installer runs inside the FIRST
    Reveal's effect, and the ones further down the page have not armed themselves yet, so
    settling synchronously here would miss exactly the blocks the visitor is being scrolled
    towards.
  */
  if (window.location.hash.length > 1) requestAnimationFrame(settleAll)
}

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
    installSettleOnAnchor()

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
