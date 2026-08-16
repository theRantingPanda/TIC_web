'use client'

import { useState, type ReactNode } from 'react'
import { useCapture } from '@/components/capture-context'
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
  deriveList,
  className = '',
}: {
  source: CaptureSource
  /** Fixed list for this form. Ignored when `deriveList` is given. */
  list: CaptureList
  children: ReactNode
  submitLabel: string
  successMessage: string
  /** For forms where the answer decides the list, such as "who needs cover". */
  deriveList?: (data: FormData) => CaptureList
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
      await postCapture({
        source,
        list: deriveList ? deriveList(data) : list,
        fields,
      })
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
        className="mt-4 rounded-md bg-brand-green px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-green-700 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : submitLabel}
      </button>
    </form>
  )
}
