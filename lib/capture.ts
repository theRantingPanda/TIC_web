/**
 * Lead capture.
 *
 * The site is a static export with no route handlers, so there is no server to post to.
 * Submissions go straight from the browser to an n8n webhook, which relays to Rainmaker.
 * The URL is inlined at build time, which means it is public — n8n must therefore do its
 * own validation and rate limiting; treat this endpoint as unauthenticated by design.
 *
 * ⚠ NEXT_PUBLIC_N8N_CONTACT_WEBHOOK is the ONLY environment variable this service may
 * ever hold, and it must be set individually on the Render service. Never attach an
 * environment group — specifically never `tic-crm-shared`, which holds ~93 Rainmaker
 * variables including database credentials and carrier API keys. This is a static build:
 * any variable it can read is baked into published HTML and served to the public.
 *
 * ⚠ Setting the variable does NOT trigger a deploy. scripts/lib/build-stamp.ts hashes
 * source files, not environment, so an unchanged repo produces an identical hash and
 * Render's auto-deploy will not fire. Trigger a manual redeploy after setting it.
 */

export const CAPTURE_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK

/**
 * Resolved at build time in server components, so a page can branch on it and ship a
 * static fallback rather than a form that accepts input and then fails. That failure
 * mode is why the contact form was disabled on 2026-08-11: a form that takes what
 * someone typed and then tells them to email instead is worse than no form.
 */
export const captureEnabled = Boolean(CAPTURE_WEBHOOK_URL)

/** Real users never fill this in. Owned by CaptureForm so no caller can forget it. */
export const HONEYPOT_FIELD = 'company_website'

/**
 * Where a lead came from. A string union rather than a free string, so a typo is a
 * `npm run typecheck` failure rather than an unroutable lead sitting in n8n.
 */
export type CaptureSource =
  | 'homepage-08-individual-timeline'
  | 'homepage-08-corporate-numbers'
  | 'homepage-10-enquiry'
  /** Reserved for phase 2 of the indicative price component, which has no email step. */
  | 'homepage-05-indicative'
  | 'employee-benefits-contact'

/**
 * Which list the lead belongs on.
 *
 * Carried explicitly rather than parsed out of the source tag in n8n. The copy deck is
 * emphatic that individual and corporate lists stay separate with different follow-up
 * sequences, and a rule that depends on string-matching a tag breaks silently the first
 * time a tag is renamed.
 */
export type CaptureList = 'individual' | 'corporate'

export type CaptureStatus = 'idle' | 'submitting' | 'success' | 'error'

export type CapturePayload = {
  source: CaptureSource
  list: CaptureList
  /** Arbitrary per-form fields. Nested so one envelope serves every capture point. */
  fields: Record<string, string>
}

export async function postCapture({
  source,
  list,
  fields,
}: CapturePayload): Promise<void> {
  if (!CAPTURE_WEBHOOK_URL) {
    throw new Error('Capture webhook is not configured')
  }

  const response = await fetch(CAPTURE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source,
      list,
      page: typeof window === 'undefined' ? null : window.location.pathname,
      submittedAt: new Date().toISOString(),
      fields,
    }),
  })

  if (!response.ok) {
    throw new Error(`Webhook responded ${response.status}`)
  }
}
