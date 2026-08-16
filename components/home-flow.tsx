'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * The homepage flow's one piece of JavaScript.
 *
 * It renders NOTHING of its own. Everything inside it is server-rendered markup passed
 * through as a slot, and this component only attaches behaviour to it after mount. That
 * shape is deliberate and it is why the page works with scripting off:
 *
 *   - The FORK is pure CSS. Two radio inputs and `:has()` in app/globals.css decide
 *     which concern grid is visible. No JavaScript is involved, so there is no flash of
 *     both grids on hydration and no dependency on this file.
 *   - The CONCERN CARDS are real links to real pages. With scripting off, clicking one
 *     navigates to that concern's own route, which renders the identical panel. The
 *     inline reveal below is an enhancement over a working link, never a replacement
 *     for one.
 *
 * WHAT THIS ADDS, and nothing more:
 *
 *   1. Clicking a card reveals that concern's panel in place instead of navigating.
 *   2. The location hash follows the selection, so the state survives a copied link.
 *   3. A hash on arrival opens the matching panel.
 *   4. Reveals scroll into view ONLY if the newly revealed content is not already
 *      visible. Forcing a scroll on every click reads as the page taking control away
 *      from the visitor, particularly on mobile.
 *
 * The hash is used rather than pushState onto the real concern path. Rewriting the
 * pathname underneath the App Router desynchronises its history from the browser's, and
 * the real URLs do not need the help: they are linked from the cards themselves, from
 * each panel's call to action, and from the footer.
 *
 * Modified clicks are left alone, so cmd-click and middle-click still open the concern's
 * own page in a new tab. That is a real use and intercepting it would be a regression.
 */
export function HomeFlow({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    function panelFor(key: string): HTMLElement | null {
      return el!.querySelector<HTMLElement>(`[data-concern-panel="${key}"]`)
    }

    /**
     * Scroll only when the target is not already in front of the visitor. The 0.75
     * threshold treats "just below the fold" as not visible, which is the case that
     * actually needs the scroll.
     */
    function scrollIfNeeded(target: HTMLElement) {
      const rect = target.getBoundingClientRect()
      const visible = rect.top >= 0 && rect.top < window.innerHeight * 0.75
      if (!visible) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    function open(key: string, { scroll }: { scroll: boolean }) {
      let opened: HTMLElement | null = null

      for (const panel of el!.querySelectorAll<HTMLElement>('[data-concern-panel]')) {
        const match = panel.dataset.concernPanel === key
        panel.hidden = !match
        if (match) opened = panel
      }

      for (const card of el!.querySelectorAll<HTMLElement>('[data-concern-card]')) {
        // aria-current rather than a class alone: the selected card is genuinely the
        // current item in the set, and a screen reader should hear that.
        if (card.dataset.concernCard === key) card.setAttribute('aria-current', 'true')
        else card.removeAttribute('aria-current')
      }

      if (opened && scroll) window.setTimeout(() => scrollIfNeeded(opened), 50)
    }

    function close() {
      for (const panel of el!.querySelectorAll<HTMLElement>('[data-concern-panel]')) {
        panel.hidden = true
      }
      for (const card of el!.querySelectorAll<HTMLElement>('[data-concern-card]')) {
        card.removeAttribute('aria-current')
      }
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      const card = target?.closest<HTMLElement>('[data-concern-card]')
      if (!card) return

      // Let the browser do its normal thing for new-tab and new-window clicks.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const key = card.dataset.concernCard
      if (!key || !panelFor(key)) return

      event.preventDefault()
      open(key, { scroll: true })
      // replaceState, not pushState: the fork and the concern are one selection step,
      // and stacking a history entry per card click would make Back mean "undo my last
      // click" eight times over before it means "leave this page".
      history.replaceState(null, '', `#${key}`)
    }

    /**
     * Changing path clears any open panel. The panel belongs to the other audience now,
     * and leaving it open under a freshly revealed grid is the one state that reads as
     * broken.
     */
    function handlePathChange(event: Event) {
      const input = event.target as HTMLInputElement | null
      if (!input || input.name !== 'tic-path') return

      close()
      history.replaceState(null, '', window.location.pathname)

      const group = el!.querySelector<HTMLElement>(
        `[data-concern-group="${input.value}"]`,
      )
      if (group) window.setTimeout(() => scrollIfNeeded(group), 50)
    }

    /**
     * Open whatever the hash names. Ticks the right fork radio first, so the grid the
     * card sits in is actually open behind the panel rather than the panel floating
     * under an unanswered question.
     */
    function openFromHash() {
      const key = window.location.hash.slice(1)
      if (!key || !panelFor(key)) return

      const card = el!.querySelector<HTMLElement>(`[data-concern-card="${key}"]`)
      const audience = card?.closest<HTMLElement>('[data-concern-group]')?.dataset
        .concernGroup
      if (audience) {
        const radio = el!.querySelector<HTMLInputElement>(
          `input[name="tic-path"][value="${audience}"]`,
        )
        if (radio) radio.checked = true
      }

      open(key, { scroll: true })
    }

    el.addEventListener('click', handleClick)
    el.addEventListener('change', handlePathChange)
    // A hash can arrive after mount as well as with the document: an anchor elsewhere on
    // the page, or the Back button returning to an earlier selection. Without this the
    // deep link only works on a cold load, which is the half that gets tested.
    window.addEventListener('hashchange', openFromHash)

    openFromHash()

    return () => {
      el.removeEventListener('click', handleClick)
      el.removeEventListener('change', handlePathChange)
      window.removeEventListener('hashchange', openFromHash)
    }
  }, [])

  return <div ref={root}>{children}</div>
}
