'use client'

import { useState } from 'react'
import { ctaClassName } from '@/components/cta-button'
import { indicativePrice, type AgeBand } from '@/content/home/price-bands'

/**
 * The two-field indicative price check (copy deck section 05).
 *
 * Two fields cost a visitor nothing, return something genuinely useful, and earn an
 * email address rather than asking for one. Phase 1 has no email step at all, which is
 * how the deck's rule — show a real range before asking for anything — is satisfied
 * structurally rather than by discipline.
 *
 * No network. The bands are compiled in, so this works under static export with nothing
 * behind it.
 *
 * The out-of-range state is a hard requirement, not defensive coding. The deck says age
 * 60 is deliberately absent because the underlying work priced 30, 40 and 50 only, and
 * that a fourth figure must not be extrapolated. A component that interpolated past the
 * priced ceiling would breach that in a way nobody would catch in review, so above
 * `maxAge` it shows no figure at all and routes to the form.
 *
 * Do not add scrollIntoView({ behavior: 'smooth' }) to the result. app/globals.css sets
 * scroll-behavior on html and turns it off under prefers-reduced-motion; a JS smooth
 * scroll bypasses that media query entirely.
 */
type State =
  | { kind: 'idle' }
  | { kind: 'invalid'; message: string }
  | { kind: 'result'; band: AgeBand; residenceLabel: string }
  | { kind: 'outOfRange' }
  | { kind: 'unpriced' }

function formatAmount(amount: number, currency: 'SGD' | 'USD'): string {
  // en-SG + SGD gives "S$4,200", which is the deck's notation exactly. It gives
  // "US$4,200" for USD, which does not match section 04's "USD 95" style — so USD is
  // formatted by hand rather than letting two currency notations sit on one page.
  if (currency === 'USD') {
    return `USD ${new Intl.NumberFormat('en-SG', { maximumFractionDigits: 0 }).format(amount)}`
  }
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function IndicativePrice({ enquiryHref }: { enquiryHref: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const { bands, residences, currency, footnote, pricedAt, minAge, maxAge } =
    indicativePrice

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const rawAge = String(data.get('age') ?? '').trim()
    const residenceValue = String(data.get('residence') ?? '')

    const age = Number(rawAge)
    if (!rawAge || !Number.isInteger(age) || age < 0 || age > 120) {
      setState({ kind: 'invalid', message: 'Please enter your age in whole years.' })
      return
    }

    const residence = residences.find((option) => option.value === residenceValue)
    if (!residence) {
      setState({ kind: 'invalid', message: 'Please choose where you live.' })
      return
    }
    if (!residence.priced) {
      setState({ kind: 'unpriced' })
      return
    }

    if (age < minAge || age > maxAge) {
      setState({ kind: 'outOfRange' })
      return
    }

    const band = bands.find((b) => age >= b.minAge && age <= b.maxAge)
    if (!band) {
      setState({ kind: 'outOfRange' })
      return
    }

    setState({ kind: 'result', band, residenceLabel: residence.label })
  }

  return (
    <div className="rounded-(--radius-panel) border border-border bg-surface p-6 sm:p-8">
      <h3 className="text-display-xs text-ink">What would this cost you?</h3>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="sm:w-32">
            <label htmlFor="age" className="block text-sm font-medium text-ink">
              Your age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              required
              className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
            />
          </div>

          <div className="sm:flex-1">
            <label htmlFor="residence" className="block text-sm font-medium text-ink">
              Where you live
            </label>
            <select
              id="residence"
              name="residence"
              defaultValue={residences[0]?.value}
              className="mt-1 w-full rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink"
            >
              {residences.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={ctaClassName()}
          >
            Show me
          </button>
        </div>
      </form>

      <div role="status" className="mt-6 empty:mt-0">
        {state.kind === 'invalid' ? (
          <p className="text-sm text-red-700">{state.message}</p>
        ) : null}

        {state.kind === 'result' ? (
          <div>
            <p className="text-base/7 text-ink">
              A single adult your age in {state.residenceLabel} is typically looking at{' '}
              <strong className="font-semibold">
                {formatAmount(state.band.low, currency)}
              </strong>{' '}
              to{' '}
              <strong className="font-semibold">
                {formatAmount(state.band.high, currency)}
              </strong>{' '}
              a year.
            </p>
            {/* Never rendered without its disclosure. See content/home/price-bands.ts. */}
            <p className="text-eyebrow mt-3 text-ink-muted">
              {footnote} Priced {pricedAt}.
            </p>
          </div>
        ) : null}

        {state.kind === 'outOfRange' ? (
          <p className="text-base/7 text-ink">
            We price this one individually rather than from a table.{' '}
            <a href={enquiryHref} className="text-brand-blue">
              Tell us the situation
            </a>{' '}
            and we will come back with a real figure.
          </p>
        ) : null}

        {state.kind === 'unpriced' ? (
          <p className="text-base/7 text-ink">
            Premiums vary a lot by where you live, and we would rather quote you properly
            than guess.{' '}
            <a href={enquiryHref} className="text-brand-blue">
              Tell us where you are
            </a>{' '}
            and we will price it.
          </p>
        ) : null}
      </div>
    </div>
  )
}
