import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { readFormLibrary } from '@/lib/content'
import { contact } from '@/lib/site'

/**
 * The file library, and the redirect target for the legacy /file-access and /file paths
 * (see render.yaml). The Wix original at /file-access was an unconfigured template —
 * "William Bach Collection", "Webb Hall", a stock photo — so there is nothing to port
 * and it is deliberately not preserved.
 *
 * What this page is for: a member who needs a claim form, an enrolment form or a product
 * guide gets it themselves instead of emailing to ask. That is the whole job, and it is
 * why the page is a list and not an argument.
 *
 * ⚠ THIS IS THE ONE ROUTE ON THIS SITE THAT NAMES INSURERS, and it does so on purpose.
 *
 * The rule everywhere else is absolute and enforced: `npm run verify:copy` fails the
 * build if an insurer name reaches `out/` by any route — body copy, a metadata
 * description, an image alt, a served JSON file. Until 2026-08-17 that included here, and
 * this file carried a comment saying `carrier` must never be rendered.
 *
 * It is rendered now because the library is grouped by insurer, and it is grouped by
 * insurer because that is how a member holds the problem. They do not think "outpatient
 * guide"; they think "the plan I'm on", and the name of that plan's insurer is printed on
 * their schedule. A page that refuses to say it is a page they cannot navigate.
 *
 * The guard was SCOPED, not switched off. It exempts the `insurer name` check on this
 * path only, prints what it allowed on every build, and still enforces everything else
 * here — nothing on this page may describe the firm's panel or imply it covers the
 * market. See scripts/verify-copy.ts. Naming the insurer whose form you are hosting is a
 * service fact; "all major insurers" is a claim, and it still fails on this page.
 *
 * Content and validation live in lib/forms-schema.ts and `readFormLibrary` in
 * lib/content.ts. The manifest is checked at build time and a missing PDF throws, so a
 * member cannot click a form and get a 404.
 */
export const metadata: Metadata = {
  title: 'Forms & Documents',
  description:
    'Claim forms, enrolment forms, policy documents and product guides for members of The Insurance Concierge, organised by insurer.',
}

function formatSize(bytes: number): string {
  const mb = bytes / 1_048_576
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** '2026-08-17' -> 'August 2026'. Day precision means nothing for a document revision. */
function formatMonth(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** The extension, uppercased, so a member knows what they are about to open. */
function formatKind(file: string): string {
  return (file.split('.').pop() ?? '').toUpperCase()
}

export default function Page() {
  const groups = readFormLibrary()

  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Forms &amp; Documents
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Claim forms, enrolment forms, policy documents and guides, as your insurer issues
        them. If you need something that is not here,{' '}
        <a href={`mailto:${contact.email}`} className="text-brand-blue">
          email us
        </a>
        .
      </p>

      {groups.length === 0 ? (
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
          {groups.map((group) => (
            <section key={group.carrier}>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {group.carrier}
              </h2>
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {group.documents.map((document) => (
                  <li key={document.id} className="py-4">
                    <a
                      href={document.file}
                      className="text-base font-medium text-ink no-underline hover:text-brand-blue"
                    >
                      {document.title}
                    </a>
                    {document.description ? (
                      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
                        {document.description}
                      </p>
                    ) : null}
                    {/*
                      Category first, because it is what tells a member whether this is the
                      thing they came for. `updatedAt` is often absent and that is
                      deliberate: the insurer does not always print a revision date, and a
                      guessed one would tell someone their claim form is current when it
                      may not be. An absent date says nothing; a wrong one misleads.
                    */}
                    <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">
                      {[
                        document.category,
                        document.productLine,
                        formatKind(document.file),
                        formatSize(document.sizeBytes),
                        document.updatedAt ? formatMonth(document.updatedAt) : null,
                      ]
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
