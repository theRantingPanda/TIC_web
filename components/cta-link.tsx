'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ctaLink } from '@/lib/site'
import { concernPaths } from '@/content/concerns'

/**
 * The header's "Talk to us", pointed at the form on THIS page where there is one.
 *
 * ---- The bug this fixes ----
 *
 * `ctaLink.href` is `/#talk-to-us`. On the homepage that is right. On a concern page it
 * was actively harmful: a reader who has just been shown a case, a premium table and an
 * argument about their own situation clicks the most prominent button on the page and is
 * thrown back to the homepage fork, to answer a question they answered two pages ago —
 * and the form they land on is the general one, so the lead arrives untagged. The page CTA
 * and the header CTA carry the same words and did opposite things.
 *
 * Every concern page renders its own `#talk-to-us` section, so on those the fragment
 * alone keeps the visitor where they are. Everywhere else it falls back to the homepage,
 * unchanged.
 *
 * ---- Why a client component ----
 *
 * The header lives in the root layout and is a server component, so it cannot know which
 * route it is rendering inside. `usePathname` is the whole reason this file exists; the
 * boundary is deliberately as small as one anchor.
 *
 * The href is decided at render, so with JavaScript disabled this still emits a real
 * link — the server render sees the same pathname the client does. It is not a runtime
 * DOM check and must not become one.
 */
export function HeaderCta({ className }: { className?: string }) {
  const pathname = usePathname()

  // `/foo/` and `/foo` are the same page. Static export can produce either shape.
  const normalised = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  const onConcernPage = concernPaths.includes(normalised)

  return (
    <Link href={onConcernPage ? '#talk-to-us' : ctaLink.href} className={className}>
      {ctaLink.label}
    </Link>
  )
}
