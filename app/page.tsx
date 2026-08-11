import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/container'

/**
 * Ported from the Wix capture (content/_inventory/pages/index.json).
 *
 * Copy is verbatim with one exception: the hero heading is captured as
 * "peace of mind |" — that trailing pipe is the cursor of a Wix typewriter animation,
 * not part of the sentence, so it is not reproduced.
 *
 * The five cards had dead "Read More" links on Wix — only Contiguous cover worked.
 * Each now points at the page it describes. Those destinations already exist; nothing
 * about the cards' copy has changed.
 */
export const metadata: Metadata = {
  title: 'Expat & Singapore Medical Insurance',
  description:
    'The Insurance Concierge helps expatriates in Singapore find and compare international medical insurance — maternity, employee benefits, speciality cover and more.',
}

const cards = [
  {
    title: 'Maternity',
    body: 'Unexpected cesarean, complications and congenital issues. We hope not but money should be the last concern then.',
    href: '/maternity-insurance',
    image: '/images/50b90fb3dac547b58b92ffce7e9c2e6a-2e95b71a.jpg',
    alt: 'Pregnant Belly',
    width: 2000,
    height: 1333,
  },
  {
    title: 'Employee Benefits',
    body: 'Enhance the perceived value of your remuneration package. Attract & Retain your key talents',
    href: '/employee-benefits',
    image: '/images/f84f9edff22c4f77a4be1f9898b2f8d6-64ced674.jpg',
    alt: 'Business Meeting',
    width: 1920,
    height: 1280,
  },
  {
    title: 'Contiguous cover',
    body: 'Continuous cover offering access to medical facility of excellence no matter where you relocate',
    href: '/international-health-insurance',
    image: '/images/e5c3769b69fb4c25a48a0c0c8cd15aa3-d1874e47.jpg',
    alt: 'Passport Covers',
    width: 2000,
    height: 1575,
  },
  {
    title: 'Marine, Oil & Gas',
    body: 'Having the means to assure your employees that you have thought to through when you have to deploy them harsh remote worksites',
    href: '/speciality-insurance',
    image: '/images/1a2db263adbd45d4b3df37a3fd15c5a8-c2cabe1d.jpg',
    alt: 'Oil-Platform',
    width: 2000,
    height: 1123,
  },
  {
    title: 'Newborns',
    body: 'Vaccinations and Direct access to Pediatricians. Least we can do while you undertake sleepless nights and dirty diapers.',
    href: '/maternity-insurance',
    image: '/images/nsplsh-496637654d2d6637456867-mv2-d-3712-5568-s-4-2-30ef3791.jpg',
    alt: 'Image by Kelly Sikkema',
    width: 1333,
    height: 1999,
  },
] as const

export default function Page() {
  return (
    <>
      <section className="relative">
        <Image
          src="/images/119c11-762a50137ef54f1a87cd514a6be28f59-mv2-042f129b.jpg"
          alt=""
          width={2000}
          height={1333}
          sizes="100vw"
          priority
          className="h-[26rem] w-full object-cover sm:h-[32rem]"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <Container className="absolute inset-0 flex flex-col justify-center">
          <h1 className="text-4xl font-semibold tracking-tight text-surface sm:text-6xl">
            peace of mind
          </h1>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-surface sm:text-5xl">
            Simplified !
          </p>
          <p className="mt-6 text-base font-medium text-surface/90">
            #askTheInsuranceConcierge
          </p>
        </Container>
      </section>

      <Container className="py-(--spacing-section)">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.title}>
              <Link
                href={card.href}
                className="group block h-full rounded-(--radius-card) border border-border bg-surface no-underline transition-colors hover:border-brand-green-300"
              >
                <Image
                  src={card.image}
                  alt={card.alt}
                  width={card.width}
                  height={card.height}
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                  className="h-52 w-full rounded-t-(--radius-card) object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold tracking-tight text-ink group-hover:text-brand-green-700">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-base/7 text-ink-muted">{card.body}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
