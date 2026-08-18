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
 *
 * ⚠ AND THE BUILD STAMP WILL NOT CHANGE WHEN YOU DO, which is what makes this hard to
 * spot: /.build-stamp.json carries an identical inputHash before and after the redeploy,
 * so the usual "did my deploy land" check says yes while the form is still missing. This
 * happened on 2026-08-18 — the variable was set on the wrong service, three redeploys
 * changed nothing, and the site served the mailto fallback with a current-looking stamp.
 * Check whether a FORM was built instead:
 *
 *   curl -s "https://www.asktic.com/beyond-employer-cover?bust=1" | grep -c '<form'
 *
 * Non-zero means `captureEnabled` was true at build, which is the question being asked.
 *
 * ⚠ DO NOT GREP THE HTML FOR THE WEBHOOK URL. It is not there even when everything is
 * correct. `CAPTURE_WEBHOOK_URL` is consumed by components/capture-form.tsx, a CLIENT
 * component, so the value is bundled into a /_next/static/chunks/*.js file rather than
 * inlined into the document. That grep was written into this file on 2026-08-18, returned
 * 0 against a correctly configured site, and sent an hour of debugging in the wrong
 * direction. If you want to see the URL itself, grep the chunks the page references.
 *
 * ⚠ TWO DIFFERENT QUESTIONS, TWO DIFFERENT CHECKS. Do not use one for the other:
 *
 *   DID A BUILD RUN?        `builtAt` in /.build-stamp.json. It is
 *                           `new Date().toISOString()` per build, so two builds cannot
 *                           share a value. An unchanged builtAt means NO new build was
 *                           published, whatever the dashboard says.
 *   DID IT SEE THE VAR?     the grep above. `inputHash` cannot answer this — it hashes
 *                           source, so it is identical whether the variable was set or not.
 *
 * Both were needed on 2026-08-18. A redeploy reported as done left builtAt untouched,
 * which said the deploy never produced output — a fact no amount of grepping the HTML
 * would have explained, because the HTML was simply the old build.
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

/** The consent tickbox's field name. Owned here for the same reason as the honeypot. */
export const CONSENT_FIELD = 'consent'

/**
 * The disclaimer a visitor ticks before a form will send.
 *
 * SPLIT INTO PARTS SO THE RECORD IS EXACTLY WHAT THEY SAW. The page renders these three
 * pieces with the middle one as a link to /privacy, and `CONSENT_STATEMENT` joins the
 * same three into the string posted with the submission. One definition, so the wording
 * on screen and the wording in the record cannot drift apart — and a consent record that
 * does not say what was agreed to is not much of a record.
 *
 * ⚠ THE WORDING AGREES TO THE POLICY, NOT TO A NARROWER PURPOSE. "to respond to this
 * enquiry" was considered and rejected: content/pages/privacy.mdx also reserves the use
 * of data for direct marketing, so a tickbox promising reply-only use would authorise
 * less than the policy it points at, and the two must not disagree. If the firm wants a
 * separate marketing consent — which is the stronger practice, and which Singapore's Do
 * Not Call rules treat as its own thing — that is a SECOND tickbox, not a rewording of
 * this one.
 */
export const CONSENT = {
  before: 'I agree to The Insurance Concierge handling my personal data as described in the ',
  linkLabel: 'privacy policy',
  after: '.',
} as const

export const CONSENT_STATEMENT = `${CONSENT.before}${CONSENT.linkLabel}${CONSENT.after}`

/**
 * Where a lead came from. A string union rather than a free string, so a typo is a
 * `npm run typecheck` failure rather than an unroutable lead sitting in n8n.
 */
export type CaptureSource =
  /**
   * Every enquiry from a concern page. ONE source rather than eight, with the concern
   * carried in `fields.concern` and the path in `fields.path`.
   *
   * That split is deliberate. The source says which KIND of capture point this is, and
   * all eight are the same kind — the same form, asking the same questions, at the foot
   * of the same panel. What differs is the situation the visitor selected, and that is
   * data about the lead rather than about the form. Eight near-identical source tags
   * would have to be kept in step with the concern list by hand, and the first one that
   * drifted would route a lead nowhere.
   *
   * n8n therefore gets `source: 'concern-enquiry'` plus a concern it can branch on, and
   * an enquiry arrives already knowing "individual, planning for a family" rather than
   * as a blank form.
   */
  | 'concern-enquiry'
  | 'services-individual-timeline'
  | 'employee-benefits-corporate-numbers'
  /** Reserved for phase 2 of the indicative price component, which has no email step. */
  | 'homepage-05-indicative'
  | 'employee-benefits-contact'
  /**
   * The renewal season checklist, requested from /employee-benefits. Tagged separately
   * from the corporate magnet above because it speaks to a different reader: this one is
   * for whoever administers the renewal, that one is for whoever signs off the budget.
   *
   * There was a `maternity-timeline` source here too, for a second copy of the individual
   * magnet on /maternity-insurance. That panel was removed on 2026-08-16 when the page was
   * reduced to the standard concern shape. The document itself is unchanged and still
   * offered from /services, on the same list.
   */
  | 'employee-benefits-renewal-checklist'

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
  /** Attachments, when a form offers an upload. Empty for every other capture point. */
  files?: readonly File[]
}

/**
 * The largest attachment a form will send, per file.
 *
 * A cap belongs here rather than in a form, because the thing it protects is the webhook
 * at the other end: n8n rejects an oversized body, and the visitor sees "something went
 * wrong" for a reason nobody can act on. Refusing it in the browser gives them a message
 * they can do something about.
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export async function postCapture({
  source,
  list,
  fields,
  files = [],
}: CapturePayload): Promise<void> {
  if (!CAPTURE_WEBHOOK_URL) {
    throw new Error('Capture webhook is not configured')
  }

  const envelope = {
    source,
    list,
    page: typeof window === 'undefined' ? null : window.location.pathname,
    submittedAt: new Date().toISOString(),
    /*
      The consent record, sent on every submission rather than passed in by a caller so
      no capture point can post a lead without one. `statement` is the literal wording
      the visitor ticked; `submittedAt` above is when. Those two together are the thing
      worth having — a bare `consent: true` records that a box existed, not what it
      said, and the wording is what a question about consent would actually be about.
    */
    consent: { agreed: true, statement: CONSENT_STATEMENT },
    fields,
  }

  /*
    Two transports, ONE envelope. A form with an attachment posts multipart, with the
    identical JSON above as a `payload` part and the files beside it; everything else
    posts that JSON directly, exactly as before.
    
    The envelope is built once and stringified either way on purpose. The consent record
    is the reason: it must be identical whichever transport a form happens to use, and a
    second construction site is how the two would drift.

    ⚠ DO NOT SET Content-Type FOR THE MULTIPART CASE. The browser has to set it itself so
    it can include the boundary; setting it by hand produces a body n8n cannot parse, and
    the failure looks like a webhook problem rather than a header problem.
  */
  let response: Response
  if (files.length > 0) {
    const body = new FormData()
    body.append('payload', JSON.stringify(envelope))
    for (const file of files) body.append('files', file, file.name)
    response = await fetch(CAPTURE_WEBHOOK_URL, { method: 'POST', body })
  } else {
    response = await fetch(CAPTURE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
    })
  }

  if (!response.ok) {
    throw new Error(`Webhook responded ${response.status}`)
  }
}
