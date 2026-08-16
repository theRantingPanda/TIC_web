import type { ReactNode } from 'react'

/**
 * The card grid.
 *
 * `columns` is the widest layout, not a fixed count. Cards always stack on small screens
 * and break to two at `md`; four cards go 2x2 and stay there, which is what the copy
 * deck asks for — four across one row squeezes them. Three cards go to three at `lg`.
 */
export function CardGrid({
  children,
  columns = 2,
}: {
  children: ReactNode
  columns?: 2 | 3
}) {
  return (
    <ul
      className={`grid gap-6 md:grid-cols-2 md:gap-8 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}
    >
      {children}
    </ul>
  )
}
