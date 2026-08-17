'use client'

import { useState, type ReactNode } from 'react'
import { useCapture } from '@/components/capture-context'
import { ctaClassName } from '@/components/cta-button'
import {
  CAPTURE_WEBHOOK_URL,
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

    const fields: Record<string, string> = {}
    for (const [key, value] of data.entries()) {
      if (key === HONEYPOT_FIELD) continue
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

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`mt-4 ${ctaClassName()}`}
      >
        {status === 'submitting' ? 'Sending…' : submitLabel}
      </button>

      {/*
        THE PRIVACY POLICY'S ONLY LINK ON THIS SITE, and it lives here on purpose.

        It sat in the footer's sitemap until 2026-08-17. When that sitemap came out, this
        was the reason it could: a privacy link at the point of collection is where it
        actually belongs, and one buried under a column of nav duplicates is where nobody
        reads it. Because it lives in CaptureForm rather than in a caller, every capture
        point on the site gets it — the contact form, the lead magnets, the concern pages
        — including the fourth one somebody adds later. DO NOT MOVE IT INTO A CALLER.

        The wording deliberately makes no promise. "We will only use this to reply to
        you" was considered and rejected: content/pages/privacy.mdx reserves the right to
        use data for direct marketing, so that sentence would put the form and the policy
        in disagreement. This points at the policy; it does not summarise it.

        This form posts a name, an email address and free text straight to an n8n webhook
        — see lib/capture.ts. That is personal data leaving the browser, which is what
        makes the link load-bearing rather than decorative.
      */}
      <p className="mt-3 text-xs text-ink-muted">
        We handle your details as described in our{' '}
        <a href="/privacy" className="text-brand-blue">
          privacy policy
        </a>
        .
      </p>
    </form>
  )
}
