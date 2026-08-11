import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/container'

/**
 * Ported from the Wix capture (content/_inventory/pages/speciality-insurance.json).
 *
 * Copy is verbatim, including "Specialty Covers" with the American spelling in the
 * heading while the URL and nav say "Speciality". That inconsistency is inherited; the
 * slug is indexed so it cannot change, and picking a spelling is an editorial call
 * recorded in the port worklist rather than made here.
 *
 * The original page had no h1 at all — its top heading was an h2. Promoted, since a
 * page with no h1 is a real accessibility and SEO defect and this is a rebuild.
 */
export const metadata: Metadata = {
  title: 'Speciality Insurance',
  description:
    'Medical cover for people deployed away from home or into hazardous conditions — marine, oil and gas, and international schools.',
}

const covers = [
  {
    title: 'Marine',
    description: 'Seamless & continuous medical cover as they sail the seven seas',
    image: '/images/dac2e15b388a4baea4cef341f7290058-944f9483.jpg',
    alt: 'Container Ship',
  },
  {
    title: 'Oil & Gas',
    description:
      'Peace of mind even if they have to be at hazardous and remote locations',
    image: '/images/00988d69bc02430b968d7bb4e509ec3f-bfd5b9a9.jpg',
    alt: 'Rig Maintenance',
  },
  {
    title: 'International School',
    description:
      'Healthcare should not be a concern as they inspire the next generation',
    image: '/images/1661609dfbb7407faf327ab9613c59e1-0ae01f95.jpg',
    alt: 'Teacher and Kids in Library',
  },
] as const

export default function Page() {
  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Specialty Covers
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        When you have to deploy your talents away from home or even in hazardous
        conditions
      </p>

      <Image
        src="/images/119c11-8614486cdcfa493a9db32ba56b280413-mv2-c0ce76a4.jpg"
        /* The Wix original had no alt text on this image. */
        alt=""
        width={2000}
        height={1125}
        sizes="(min-width: 1024px) 64rem, 100vw"
        className="mt-10 h-auto w-full rounded-(--radius-card) object-cover"
        priority
      />

      <ul className="mt-(--spacing-section) grid gap-8 md:grid-cols-3">
        {covers.map((cover) => (
          <li key={cover.title}>
            <Image
              src={cover.image}
              alt={cover.alt}
              width={2000}
              height={1322}
              sizes="(min-width: 768px) 20rem, 100vw"
              className="h-48 w-full rounded-(--radius-card) object-cover"
            />
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">
              {cover.title}
            </h2>
            <p className="mt-2 text-base/7 text-ink-muted">{cover.description}</p>
          </li>
        ))}
      </ul>
    </Container>
  )
}
