import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/container'
import { Prose } from '@/components/prose'

/**
 * Ported from the Wix capture (content/_inventory/pages/income-preservation-1.json).
 *
 * One deliberate change to the copy: the original read "with years of experience since
 * 2023", which post-dates the firm. Corrected to 2014, the UEN registration year, on
 * Steven's instruction 2026-08-11. This is advertising copy for a licensed firm, so the
 * claim needs to be one the entity can stand behind.
 *
 * The rest is verbatim, including the odd `-1` in the URL, which is indexed.
 */
export const metadata: Metadata = {
  title: 'Income Preservation',
  description:
    'Protect your lifestyle with an individual insurance package matched to your needs — advised, arranged and reviewed by The Insurance Concierge.',
}

export default function Page() {
  return (
    <Container className="py-(--spacing-section)">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-green-700">
        Income Preservation
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Protect Your Lifestyle
      </h1>

      <Prose className="mt-8">
        <p>
          We guarantee our customers purchase only the best quality Individual Insurance
          Package suited to their needs and requirements. With years of experience since
          2014, we&rsquo;ve come to understand each of our clients&rsquo; unique insurance
          needs. With The Insurance Concierge representing you, your insurance process
          will be hassle-free and easy to understand.
        </p>
      </Prose>

      <Image
        src="/images/119c11-a185f003673549a5881b676025f08755-mv2-d-4191-2794-s-4--336e3895.jpg"
        /*
         * Empty rather than the original's alt, which was the filename
         * ("Online bill payment concept.jpg"). A screen reader announcing a filename is
         * worse than silence for what is a decorative stock image. Real alt text — or a
         * decision that it stays decorative — is on the port worklist.
         */
        alt=""
        width={2000}
        height={1333}
        sizes="(min-width: 1024px) 64rem, 100vw"
        className="mt-12 h-auto w-full rounded-(--radius-card) object-cover"
      />
    </Container>
  )
}
