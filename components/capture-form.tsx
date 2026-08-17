'use client'

import { useState, type ReactNode } from 'react'
import { useCapture } from '@/components/capture-context'
import { ctaClassName } from '@/components/cta-button'
import {
  CAPTURE_WEBHOOK_URL,
  CONSENT,
  CONSENT_FIELD,
  HONEYPOT_FIELD,
  postCapture,
  type CaptureList,
  type CaptureSource,
  type CaptureStatus,
} from '@/lib/capture'

/**
 * The form state machine, written once.
 *
 * Every capture point on the site goes through this: it owns the four states, the
 * honeypot and the submit. Fields are passed as children, so a caller decides what to
 * ask and nothing else.
 *
 * The honeypot living here rather than in each caller is the whole point — it is exactly
 * the thing that gets forgotten when a fourth capture point is added six months from now.
 *
 * Callers should not render this at all when `captureEnabled` is false. Pages branch on
 * that in a server component so the fallback is static HTML rather than a form that
 * accepts input and then apologises. The runtime guard below is a second line of
 * defence for any future client-side mount.
 */
export function CaptureForm({
  source,
  list,
  children,
  submitLabel,
  successMessage,
  listRule,
  className = '',
}: {
  source: CaptureSource
  /** The list this form writes to, unless `listRule` overrides it per submission. */
  list: CaptureList
  children: ReactNode
  submitLabel: string
  successMessage: string
  /**
   * For a form where an answer decides the list, such as "who needs cover".
   *
   * A serializable descriptor rather than a callback, deliberately: this is a client
   * component and its callers are server components, so a function prop crosses the
   * boundary and React rejects it at render time. That failure only surfaces when the
   * form actually renders, which is only when the webhook is configured — so a callback
   * here would have passed every check on a machine with no env var set and broken in
   * production.
   */
  listRule?: { field: string; corporateWhen: readonly string[] }
  className?: string
}) {
  const [status, setStatus] = useState<CaptureStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const capture = useCapture()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!CAPTURE_WEBHOOK_URL) {
      setStatus('error')
      setError('This form is not configured. Please email us directly.')
      return
    }

    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot. Report success and post nothing, so a bot learns nothing from the reply.
    if (data.get(HONEYPOT_FIELD)) {
      setStatus('success')
      form.reset()
      return
    }

    /*
      The tickbox is `required`, so a browser blocks submit without it. This is the second
      line of defence, in the same spirit as the honeypot above: a submission that arrives
      by any other route must not reach n8n without consent, because the record is the
      entire reason for asking.
    */
    if (!data.get(CONSENT_FIELD)) {
      setStatus('error')
      setError('Please tick the box so we know we may use your details.')
      return
    }

    const fields: Record<string, string> = {}
    for (const [key, value] of data.entries()) {
      // Both are carried in the envelope rather than as lead data: the honeypot is
      // discarded outright, and consent is posted as a structured record by postCapture.
      if (key === HONEYPOT_FIELD || key === CONSENT_FIELD) continue
      if (typeof value === 'string' && value.length > 0) fields[key] = value
    }

    setStatus('submitting')
    setError(null)

    try {
      const resolvedList: CaptureList = listRule
        ? listRule.corporateWhen.includes(String(data.get(listRule.field) ?? ''))
          ? 'corporate'
          : 'individual'
        : list

      await postCapture({ source, list: resolvedList, fields })
      // Carry the address to any later capture point on this page.
      if (capture && typeof fields.email === 'string') capture.setEmail(fields.email)
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
      setError('Something went wrong sending that. Please try again or email us.')
    }
  }

  if (status === 'success') {
    return (
      <p
        role="status"
        className="rounded-(--radius-card) border border-brand-green-200 bg-brand-green-50 p-4 text-brand-green-800"
      >
        {successMessage}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}

      {/* Visually and programmatically hidden from real users. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${source}-${HONEYPOT_FIELD}`}>Company website</label>
        <input
          id={`${source}-${HONEYPOT_FIELD}`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {/*
        THE CONSENT DISCLAIMER, and the site's point-of-collection privacy link.

        It stands ABOVE the submit button, not below it, because a disclaimer you agree to
        has to be read before the action, not after it. It is `required`, so the browser
        will not send the form until it is ticked, and handleSubmit checks it again.

        Because it lives in CaptureForm rather than in a caller, EVERY capture point on
        the site gets it — the contact form, the lead magnets, the concern pages, and the
        fourth one somebody adds in six months. DO NOT MOVE IT INTO A CALLER; that is
        exactly how a capture point ends up collecting personal data without a consent
        record, and this form posts a name, an email address and free text straight to an
        n8n webhook.

        The wording lives in lib/capture.ts, split into three parts so the string posted
        with the submission is character-for-character what is rendered here. See the note
        there for why it agrees to the policy rather than to a narrower purpose, and why a
        marketing consent would be a second tickbox rather than a rewrite of this one.
      */}
      <div className="mt-6 flex items-start gap-3">
        <input
          id={`${source}-${CONSENT_FIELD}`}
          name={CONSENT_FIELD}
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
        />
        <label htmlFor={`${source}-${CONSENT_FIELD}`} className="text-xs/5 text-ink-muted">
          {CONSENT.before}
          <a href="/privacy" className="text-brand-blue">
            {CONSENT.linkLabel}
          </a>
          {CONSENT.after}
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`mt-4 ${ctaClassName()}`}
      >
        {status === 'submitting' ? 'Sending…' : submitLabel}
      </button>
    </form>
  )
}
