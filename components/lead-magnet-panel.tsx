import { CaptureForm } from '@/components/capture-form'
import { EmailField } from '@/components/email-field'
import { captureEnabled } from '@/lib/capture'
import type { CaptureList, CaptureSource } from '@/lib/capture'

/**
 * One of the two panels in "Whichever side of this you are on".
 *
 * A server component that decides, at build time, whether the visitor gets a form or a
 * mailto. When the webhook is unset the form is not rendered at all — no JavaScript, no
 * flash, no input accepted and then refused. The magnets are documents someone sends by
 * hand anyway, so the mailto is a real route rather than a consolation.
 */
export function LeadMagnetPanel({
  audience,
  intro,
  magnetTitle,
  magnetBody,
  buttonLabel,
  source,
  list,
  contactEmail,
}: {
  audience: string
  intro: string
  magnetTitle: string
  magnetBody: string
  buttonLabel: string
  source: CaptureSource
  list: CaptureList
  contactEmail: string
}) {
  return (
    <div className="flex h-full flex-col rounded-(--radius-panel) border border-border bg-surface-subtle p-8 lg:p-10">
      <h3 className="text-display-xs text-ink">{audience}</h3>
      <p className="mt-2 text-base/7 text-ink-muted">{intro}</p>

      <div className="mt-8 border-t border-border pt-6">
        <p className="font-medium text-ink">{magnetTitle}</p>
        <p className="mt-2 text-base/7 text-ink-muted">{magnetBody}</p>

        <div className="mt-6">
          {captureEnabled ? (
            <CaptureForm
              source={source}
              list={list}
              submitLabel={buttonLabel}
              successMessage="On its way. Check your inbox in the next few minutes."
            >
              <EmailField id={`${source}-email`} label="Your email" />
            </CaptureForm>
          ) : (
            <p className="text-base/7 text-ink-muted">
              Email us at{' '}
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(magnetTitle)}`}
                className="text-brand-blue"
              >
                {contactEmail}
              </a>{' '}
              and we will send it over.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
