import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { contact } from '@/lib/site'
import manifest from '@/public/forms/manifest.json'

/**
 * The file library, and the redirect target for the legacy /file-access and /file paths
 * (see render.yaml). The Wix original at /file-access was an unconfigured template —
 * "William Bach Collection", "Webb Hall", a stock photo — so there is nothing to port
 * and it is deliberately not preserved.
 *
 * Forms are read from public/forms/manifest.json, validated by its own JSON schema.
 * The manifest is empty until the PDFs are added, so this page renders an empty state
 * rather than an empty list.
 */
export const metadata: Metadata = {
  title: 'Forms & Documents',
  description:
    'Claim forms, enrolment forms and policy documents for members of The Insurance Concierge.',
}

type Form = {
  id: string
  title: string
  description?: string
  file: string
  /** Internal only. Never rendered — see the note at the render site below. */
  carrier?: string
  /** The safe public label: a product line rather than an insurer. */
  productLine?: string
  category: string
  sizeBytes?: number
  updatedAt?: string
}

const forms = manifest.forms as Form[]

function byCategory(list: Form[]): Map<string, Form[]> {
  const groups = new Map<string, Form[]>()
  for (const form of list) {
    groups.set(form.category, [...(groups.get(form.category) ?? []), form])
  }
  return groups
}

function formatSize(bytes: number | undefined): string | null {
  if (!bytes) return null
  const mb = bytes / 1_048_576
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export default function Page() {
  const groups = byCategory(forms)

  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Forms &amp; Documents
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Claim forms, enrolment forms and policy documents. If you need something that is
        not here,{' '}
        <a href={`mailto:${contact.email}`} className="text-brand-blue">
          email us
        </a>
        .
      </p>

      {forms.length === 0 ? (
        <div className="mt-12 rounded-(--radius-card) border border-border bg-surface-subtle p-6">
          <p className="text-base/7 text-ink">
            The library is being assembled. In the meantime we will send you any form you
            need — just ask.
          </p>
          <p className="mt-4">
            <a href={`mailto:${contact.email}`} className="text-brand-blue">
              {contact.email}
            </a>
          </p>
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          {[...groups].map(([category, items]) => (
            <section key={category}>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {category}
              </h2>
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {items.map((form) => (
                  <li key={form.id} className="py-4">
                    <a
                      href={form.file}
                      className="text-base font-medium text-ink no-underline hover:text-brand-blue"
                    >
                      {form.title}
                    </a>
                    {form.description ? (
                      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
                        {form.description}
                      </p>
                    ) : null}
                    {/*
                      `carrier` is deliberately NOT rendered.

                      It used to be, and the manifest being empty was the only reason
                      nothing leaked: the first form anyone added would have printed an
                      insurer's name on a public page, and the site names no insurer in
                      public copy. `carrier` stays in the schema as optional internal
                      metadata for organising the library — it is no longer required, and
                      it must not reach the page. `productLine` is the safe public label.

                      The same rule applies to form titles and to filenames, since both
                      are public. `npm run verify:copy` fails the build if an insurer
                      name reaches the built output by any route.
                    */}
                    <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">
                      {[form.productLine, formatSize(form.sizeBytes), form.updatedAt]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Container>
  )
}
