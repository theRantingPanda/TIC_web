'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useCapture } from '@/components/capture-context'
import { ctaClassName } from '@/components/cta-button'
import {
  CAPTURE_WEBHOOK_URL,
  CONSENT,
  MAX_UPLOAD_BYTES,
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
/**
 * Lift `required` off the step that is not on screen, and put it back when it returns.
 *
 * `data-was-required` is the memory. Without it, restoring would have to guess, and every
 * optional field on the form would come back required the second time a visitor stepped
 * forward and back.
 */
function syncRequired(container: HTMLElement | null, active: boolean) {
  if (!container) return
  const controls = container.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('input, select, textarea')
  for (const control of controls) {
    if (active) {
      if (control.dataset.wasRequired !== undefined) {
        control.required = true
        delete control.dataset.wasRequired
      }
    } else if (control.required) {
      control.required = false
      control.dataset.wasRequired = ''
    }
  }
}

export function CaptureForm({
  source,
  list,
  children,
  submitLabel,
  successMessage,
  listRule,
  secondStep,
  continueLabel = 'Continue',
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
  /**
   * A second screen of fields, for a form long enough that showing it all at once reads
   * as a wall. `children` becomes step one; this becomes step two.
   *
   * ⚠ BOTH STEPS STAY MOUNTED. Only their visibility changes, so one `FormData(form)` at
   * submit still sees every field including the file input, and the submission path is
   * byte-for-byte the one-step path. Unmounting the inactive step would have meant
   * carrying its values in React state and re-emitting them as hidden inputs, which is a
   * second copy of the truth and a new way for a field to go missing.
   *
   * The cost of keeping both mounted is that the hidden step's `required` controls would
   * block submission — the browser refuses to validate a control it cannot focus, and
   * does it silently. `syncRequired` below is the answer, and is the only reason this
   * component touches the DOM directly.
   */
  secondStep?: ReactNode
  /** Step one's button. Ignored without `secondStep`. */
  continueLabel?: string
  className?: string
}) {
  const [status, setStatus] = useState<CaptureStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const stepOneRef = useRef<HTMLDivElement>(null)
  const stepTwoRef = useRef<HTMLDivElement>(null)
  const capture = useCapture()
  const stepped = Boolean(secondStep)
  const onFinalStep = !stepped || step === 2

  /*
    Native validation, minus the trap.

    A `required` control inside a hidden container cannot be focused, so the browser
    refuses the submit and reports nothing the visitor can see. Rather than hand-rolling
    validation for the whole site — which would lose the browser's own messages, in the
    visitor's own language — the inactive step's controls have `required` lifted and
    restored with the step. `data-was-required` remembers which ones to put back, so a
    control that was never required does not acquire it on the way through.

    Runs on every step change and after the dependants repeater adds a row, which is why
    it reads the DOM rather than a list of field names.
  */
  useEffect(() => {
    if (!stepped) return
    syncRequired(stepOneRef.current, step === 1)
    syncRequired(stepTwoRef.current, step === 2)
  }, [step, stepped, secondStep])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    /*
      On step one this handler is a "next", not a send. It is reached by the Continue
      button and by Enter in a text field, and both should do the same thing. Native
      validation has already passed by the time a submit event fires, so step one's own
      required fields are filled before this advances.
    */
    if (stepped && step === 1) {
      setStep(2)
      return
    }

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
      setStep(1)
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
    const files: File[] = []
    for (const [key, value] of data.entries()) {
      // Both are carried in the envelope rather than as lead data: the honeypot is
      // discarded outright, and consent is posted as a structured record by postCapture.
      if (key === HONEYPOT_FIELD || key === CONSENT_FIELD) continue
      if (typeof value === 'string') {
        if (value.length > 0) fields[key] = value
        continue
      }
      /*
        An untouched file input still yields a File — empty, unnamed — so size is the
        test, not presence. Without this every form with an optional upload would post an
        empty attachment on every submission.
      */
      if (value instanceof File && value.size > 0) files.push(value)
    }

    /*
      Refused here rather than at the webhook. n8n rejects an oversized body with a
      status the visitor sees as "something went wrong", which tells them nothing they
      can act on; this tells them which file and how big it may be.
    */
    const tooBig = files.find((file) => file.size > MAX_UPLOAD_BYTES)
    if (tooBig) {
      setStatus('error')
      setError(
        `${tooBig.name} is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB. ` +
          'Please attach a smaller file, or send it to us by email instead.',
      )
      return
    }

    setStatus('submitting')
    setError(null)

    try {
      const resolvedList: CaptureList = listRule
        ? listRule.corporateWhen.includes(String(data.get(listRule.field) ?? ''))
          ? 'corporate'
          : 'individual'
        : list

      await postCapture({ source, list: resolvedList, fields, files })
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
      {stepped ? (
        <>
          <p className="text-eyebrow uppercase text-ink-muted">
            Step {step} of 2
          </p>
          {/*
            `hidden` rather than a class, so the inactive step leaves the accessibility
            tree as well as the layout. It stays in the DOM: see the note on `secondStep`.
          */}
          <div ref={stepOneRef} hidden={step === 2} className={className}>
            {children}
          </div>
          <div ref={stepTwoRef} hidden={step === 1} className={className}>
            {secondStep}
          </div>
        </>
      ) : (
        children
      )}

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
      <div className="mt-6 flex items-start gap-3" hidden={!onFinalStep}>
        {/*
          `required={onFinalStep}`, not a bare `required`.

          This control sits outside both step containers, so `syncRequired` never sees
          it — and on step one it is hidden and empty, which is the exact combination the
          browser refuses to validate and refuses to explain: "an invalid form control
          with name='consent' is not focusable", in the console, and nothing at all on
          screen. The Continue button simply stopped working.

          Declarative here because this one is rendered by this component, so it does not
          need the DOM walk the step containers do. handleSubmit still checks consent
          independently before posting, so lifting the attribute cannot let an unconsented
          submission through.
        */}
        <input
          id={`${source}-${CONSENT_FIELD}`}
          name={CONSENT_FIELD}
          type="checkbox"
          required={onFinalStep}
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

      {/*
        ONE submit button, relabelled, rather than a Continue button beside a hidden one.
        A second submit control in the same form is the classic way an incomplete lead
        gets posted, and Enter in a text field would have had to pick between them.
      */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`mt-4 ${ctaClassName()}`}
      >
        {onFinalStep
          ? status === 'submitting'
            ? 'Sending…'
            : submitLabel
          : continueLabel}
      </button>

      {/*
        Back is a button, not a link, and it never validates: someone who mistyped their
        email on step one has to be able to get back to it without first satisfying step
        two. Step one's values are all still in the DOM, so nothing is restored — it was
        never lost.
      */}
      {stepped && step === 2 ? (
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mt-4 ml-4 text-sm font-medium text-ink-muted underline hover:text-ink"
        >
          Back
        </button>
      ) : null}
    </form>
  )
}
