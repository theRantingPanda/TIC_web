import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/container'
import { contact } from '@/lib/site'

/**
 * Ported from the Wix capture (content/_inventory/pages/employee-benefits.json).
 *
 * Copy is verbatim. Note EXPERIENCED / EXPERT ADVICE / CONFIDENTIALITY are three
 * headings with no supporting copy underneath — on Wix and here. They read as three
 * value propositions someone never finished writing. Kept because they are real claims
 * the firm makes, flagged in the port worklist because they say nothing yet.
 *
 * THE CONTACT FORM IS DISABLED (2026-08-11, on instruction). The Wix original carried
 * one here, and `components/contact-form.tsx` is built and working, but it posts to an
 * n8n webhook that is not configured yet — so a visitor filling it in would be told to
 * email instead, which is worse than not offering the form. The email address and phone
 * number below are the live route in the meantime.
 *
 * To re-enable: set NEXT_PUBLIC_N8N_CONTACT_WEBHOOK on the Render service, then restore
 *
 *   import { ContactForm } from '@/components/contact-form'
 *   <div className="mt-8 max-w-xl"><ContactForm /></div>
 *
 * at the foot of the "Get in touch" section. Do not restore it before the webhook is
 * set — that is the state this change exists to avoid.
 */
export const metadata: Metadata = {
  title: 'Employee Benefits',
  description:
    'Healthcare benefits that attract and retain talent — because turnover and a wrong hire always cost more.',
}

const claims = ['Experienced', 'Expert advice', 'Confidentiality'] as const

export default function Page() {
  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Employee Benefits
      </h1>
      <p className="mt-4 text-2xl font-medium tracking-tight text-brand-green-700">
        Attract &amp; Retain
      </p>
      <p className="mt-2 max-w-2xl text-lg text-ink-muted">
        because turnovers and wrong hire always cost more
      </p>

      <Image
        src="/images/b4ab2e3cb4704a6b8d16f28e49bd2b01-73f5f5c0.jpg"
        alt="Team Meeting"
        width={2000}
        height={1333}
        sizes="(min-width: 1024px) 64rem, 100vw"
        className="mt-10 h-auto w-full rounded-(--radius-card) object-cover"
        priority
      />

      <div className="mt-(--spacing-section) max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Better Results!</h2>
        <p className="mt-4 text-base/7 text-ink">
          Your employees&rsquo; perception of their benefits is paramount because it
          affects your ability to attract and retain top talent. The healthcare benefit
          offer is a significant part of your employer brand. It affects employee
          satisfaction and loyalty, not to mention their health and productivity.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-3">
        {claims.map((claim) => (
          <li
            key={claim}
            className="rounded-(--radius-card) border border-border bg-surface-subtle px-6 py-5 text-base font-medium text-ink"
          >
            {claim}
          </li>
        ))}
      </ul>

      <section className="mt-(--spacing-section) border-t border-border pt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Get in touch</h2>
        <p className="mt-3 text-base/7 text-ink-muted">
          <a href={`mailto:${contact.email}`} className="text-brand-blue no-underline">
            {contact.email}
          </a>
        </p>

      </section>
    </Container>
  )
}
