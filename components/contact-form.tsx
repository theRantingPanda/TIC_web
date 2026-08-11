'use client'

import { useState } from 'react'

/**
 * Contact form.
 *
 * The site is a static export with no route handlers, so there is no server to post to.
 * Submissions go straight from the browser to an n8n webhook. The URL is inlined at
 * build time, which means it is public — n8n must therefore do its own validation and
 * rate limiting; treat this endpoint as unauthenticated by design.
 *
 * NOT CURRENTLY MOUNTED. It was briefly on /employee-benefits and was disabled again on
 * 2026-08-11 because NEXT_PUBLIC_N8N_CONTACT_WEBHOOK is not configured: without it the
 * form renders, accepts input, and then tells the visitor to email instead — worse than
 * not offering a form. Kept because it works; see the note in app/employee-benefits for
 * how to put it back once the webhook is set.
 */

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!WEBHOOK_URL) {
      setStatus('error')
      setError('The contact form is not configured. Please email us directly.')
      return
    }

    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot — real users never fill this in.
    if (data.get('company_website')) {
      setStatus('success')
      form.reset()
      return
    }

    setStatus('submitting')
    setError(null)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          submittedAt: new Date().toISOString(),
          source: 'asktic.com/contact',
        }),
      })

      if (!response.ok) {
        throw new Error(`Webhook responded ${response.status}`)
      }

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
      setError('Something went wrong sending your message. Please try again or email us.')
    }
  }

  if (status === 'success') {
    return (
      <p
        role="status"
        className="rounded-(--radius-card) border border-brand-green-200 bg-brand-green-50 p-4 text-brand-green-800"
      >
        Thanks — your message is on its way. We&rsquo;ll be in touch shortly.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5" noValidate={false}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-ink"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-ink"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-ink"
        />
      </div>

      {/* Honeypot: visually and programmatically hidden from real users. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-md bg-brand-green px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-green-700 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
