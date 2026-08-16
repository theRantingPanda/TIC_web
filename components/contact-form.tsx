'use client'

import { CaptureForm } from '@/components/capture-form'
import { EmailField } from '@/components/email-field'

/**
 * Contact form.
 *
 * Rebuilt on components/capture-form.tsx (2026-08-16). The state machine, the honeypot
 * and the POST now live there and are shared with the homepage's capture points; this
 * file is just the fields. Behaviour is unchanged: the same four states, the same
 * honeypot semantics, the same webhook.
 *
 * The export name and its (absent) props are deliberately unchanged, so the documented
 * restore path in app/employee-benefits/page.tsx still works as written.
 *
 * The site is a static export with no route handlers, so there is no server to post to.
 * Submissions go straight from the browser to an n8n webhook. The URL is inlined at
 * build time, which means it is public — n8n must therefore do its own validation and
 * rate limiting; treat this endpoint as unauthenticated by design.
 *
 * NOT CURRENTLY MOUNTED. It was briefly on /employee-benefits and was disabled again on
 * 2026-08-11 because NEXT_PUBLIC_N8N_CONTACT_WEBHOOK is not configured: without it the
 * form renders, accepts input, and then tells the visitor to email instead — worse than
 * not offering a form. Kept because it works.
 *
 * When remounting it, guard the call site on `captureEnabled` from lib/capture.ts the
 * way components/lead-magnet-panel.tsx does, so the disabled state is a static fallback
 * decided at build time rather than an error the visitor discovers after typing.
 */
export function ContactForm() {
  return (
    <CaptureForm
      source="employee-benefits-contact"
      list="corporate"
      submitLabel="Send message"
      successMessage="Thanks — your message is on its way. We’ll be in touch shortly."
      className="max-w-xl space-y-5"
    >
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
          className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
        />
      </div>

      <EmailField />

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
        />
      </div>
    </CaptureForm>
  )
}
