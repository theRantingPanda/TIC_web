import type { ReactNode } from 'react'

/**
 * Long-form body copy — the container for compiled MDX.
 *
 * The styles are written out rather than pulled from @tailwindcss/typography: the
 * plugin brings its own colour scale, and app/globals.css is meant to be the only place
 * colour is defined. This keeps prose on the same tokens as everything else.
 *
 * Element selectors are the point here. MDX compiles to bare <h2>/<p>/<ul>, so there is
 * nowhere to hang a class.
 */
export function Prose({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'max-w-2xl text-base/7 text-ink',
        '[&>*+*]:mt-6',
        '[&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink',
        '[&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-ink',
        '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6',
        '[&_li]:mt-2 [&_li]:pl-1',
        '[&_a]:text-brand-blue [&_a:hover]:text-brand-blue-700',
        '[&_strong]:font-semibold [&_strong]:text-ink',
        '[&_img]:rounded-(--radius-card)',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-brand-green-200 [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
