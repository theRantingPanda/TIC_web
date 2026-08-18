'use client'

import { useState } from 'react'
import { MAX_UPLOAD_BYTES } from '@/lib/capture'

/**
 * The question set behind the `beyond-employer` call to action, in two screens.
 *
 * `TopUpQuoteContact` is step one and `TopUpQuoteDetails` is step two; CaptureForm owns
 * the stepping, the state machine, the honeypot, the consent tickbox and the submit.
 * Everything here is fields and the conditional logic between them — nothing about how a
 * submission is sent, and nothing about which screen is showing.
 *
 * ⚠ THE SPLIT IS PRESENTATION ONLY. Both halves stay mounted, so the submission is the
 * same single POST with the same envelope and the same attachment as when this was one
 * screen. If you ever make step two conditional on `step === 2`, you have moved step
 * one's answers out of the form and into React state, and the upload with them.
 *
 * ⚠ IT IS A CLIENT COMPONENT BECAUSE THE CONDITIONS ARE, not because it wants to be. Two
 * answers change what is on screen: a country of residence outside the licensed set
 * raises a warning, and "portable" reveals where to. Both have to react as someone types,
 * and `concern-page.tsx` is a server component, so this cannot be inlined there.
 *
 * ⚠ NO HEALTH DETAIL IS COLLECTED, AND THAT IS DELIBERATE. The pre-existing question is
 * yes / no / not sure and stops there, with a line saying the detail is discussed
 * directly. The endpoint is baked into public HTML and unauthenticated by design, and a
 * diagnosis is the most sensitive thing a person could type into it. Steven chose this
 * shape; do not "improve" it into a free-text box for conditions.
 */

/** Where the firm can advise. Residence outside these raises the warning below. */
const LICENSED_RESIDENCE = ['Singapore', 'Malaysia', 'Indonesia'] as const

const RELATIONSHIPS = ['Spouse', 'Child', 'Partner', 'Parent', 'Other'] as const

const fieldClass =
  'mt-1 w-full rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink'
const labelClass = 'block text-sm font-medium text-ink'
const optional = <span className="font-normal text-ink-muted">(optional)</span>

type Applicant = { id: number; relationship: string }

/**
 * Step one: how to reach them. Three fields, and nothing that needs thinking about.
 *
 * Deliberately the short screen. The point of the split is that the first thing a
 * visitor sees after deciding to enquire is answerable from memory — putting dates of
 * birth and an upload here would defeat it.
 *
 * No state, so this stays a plain function. CaptureForm keeps it mounted when it moves
 * to step two, which is what lets one FormData see these three alongside everything else.
 */
export function TopUpQuoteContact() {
  return (
    <>
      <div>
        <label htmlFor="name" className={labelClass}>
          Your name
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={fieldClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="mobile" className={labelClass}>
            Mobile
          </label>
          <input id="mobile" name="mobile" type="tel" required autoComplete="tel" className={fieldClass} />
        </div>
      </div>
    </>
  )
}

/**
 * Step two: what is actually needed to price it.
 *
 * Everything conditional lives here, which is why this half is the client component and
 * step one is not.
 */
export function TopUpQuoteDetails() {
  // The first applicant is the enquirer and carries no relationship. The rest do.
  const [dependants, setDependants] = useState<Applicant[]>([])
  const [nextId, setNextId] = useState(1)
  const [residence, setResidence] = useState('')
  const [portable, setPortable] = useState('')

  /*
    Trimmed and case-insensitive, because "singapore " with a trailing space is a real
    thing people type and showing them a licensing warning for it would be wrong.
  */
  const normalised = residence.trim().toLowerCase()
  const outsideLicence =
    normalised.length > 0 &&
    !LICENSED_RESIDENCE.some((country) => country.toLowerCase() === normalised)

  return (
    <>
      {/*
        Date of birth rather than age: age is what a rate table needs, but it goes stale
        between the enquiry and the quote, and someone reading the lead a fortnight later
        cannot tell which birthday has passed.
      */}
      <fieldset>
        <legend className={labelClass}>Who needs cover</legend>
        <p className="mt-1 text-sm text-ink-muted">
          Dates of birth, because premiums are priced on age.
        </p>

        <div className="mt-3">
          <label htmlFor="dob" className="text-sm text-ink-muted">
            Your date of birth
          </label>
          <input id="dob" name="dob" type="date" required className={fieldClass} />
        </div>

        {dependants.map((applicant, index) => (
          <div key={applicant.id} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`dob-${applicant.id}`} className="text-sm text-ink-muted">
                Date of birth
              </label>
              <input
                id={`dob-${applicant.id}`}
                name={`applicant-${index + 1}-dob`}
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={`rel-${applicant.id}`} className="text-sm text-ink-muted">
                Relationship to you
              </label>
              <div className="flex gap-2">
                <select
                  id={`rel-${applicant.id}`}
                  name={`applicant-${index + 1}-relationship`}
                  required
                  className={fieldClass}
                >
                  {RELATIONSHIPS.map((relationship) => (
                    <option key={relationship}>{relationship}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setDependants((all) => all.filter((a) => a.id !== applicant.id))}
                  className="mt-1 shrink-0 rounded-(--radius-card) border border-border px-3 text-sm text-ink-muted hover:text-ink"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            setDependants((all) => [...all, { id: nextId, relationship: 'Spouse' }])
            setNextId((id) => id + 1)
          }}
          className="mt-3 rounded-(--radius-card) border border-border px-3 py-2 text-sm font-medium text-ink hover:border-brand-green-300 hover:bg-brand-green-50"
        >
          Add someone else
        </button>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nationality" className={labelClass}>
            Nationality
          </label>
          <input id="nationality" name="nationality" type="text" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="residence" className={labelClass}>
            Country of residence
          </label>
          <input
            id="residence"
            name="residence"
            type="text"
            required
            value={residence}
            onChange={(event) => setResidence(event.target.value)}
            aria-describedby={outsideLicence ? 'residence-warning' : undefined}
            className={fieldClass}
          />
        </div>
      </div>

      {/*
        Shown before submitting, not after. Someone resident outside the licensed set can
        still send this and we will still reply — but they learn what we can and cannot do
        while they are deciding whether to bother, which is the honest moment for it.
      */}
      {outsideLicence ? (
        <p
          id="residence-warning"
          role="status"
          className="rounded-(--radius-card) border border-brand-blue-200 bg-brand-blue-50 p-3 text-sm text-ink"
        >
          We are licensed to advise on policies issued in Singapore. If you live elsewhere we
          may not be able to arrange cover for you, though we are happy to tell you where you
          would stand.
        </p>
      ) : null}

      <fieldset>
        <legend className={labelClass}>
          Do you expect this cover to move with you out of Singapore?
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {['Yes', 'No', 'Not sure'].map((answer) => (
            <label key={answer} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="portable"
                value={answer}
                required
                checked={portable === answer}
                onChange={() => setPortable(answer)}
              />
              {answer}
            </label>
          ))}
        </div>
      </fieldset>

      {portable === 'Yes' ? (
        <div>
          <label htmlFor="portable-where" className={labelClass}>
            Where to, as best you know {optional}
          </label>
          <input id="portable-where" name="portable-where" type="text" className={fieldClass} />
        </div>
      ) : null}

      <fieldset>
        <legend className={labelClass}>
          Does anyone to be covered have a pre-existing medical condition?
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {['Yes', 'No', 'Not sure'].map((answer) => (
            <label key={answer} className="flex items-center gap-2 text-sm text-ink">
              <input type="radio" name="pre-existing" value={answer} required />
              {answer}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Yes or no is enough here. We will go through the detail with you directly, rather
          than on a form.
        </p>
      </fieldset>

      <div>
        <label htmlFor="existing-cover" className={labelClass}>
          Your existing cover {optional}
        </label>
        <p className="mt-1 text-sm text-ink-muted">
          A schedule or benefits summary, if you have one to hand. PDF or image, up to{' '}
          {Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.
        </p>
        <input
          id="existing-cover"
          name="existing-cover"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          className="mt-2 block w-full text-sm text-ink-muted file:mr-3 file:rounded-(--radius-card) file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Anything else we should know {optional}
        </label>
        <textarea id="notes" name="notes" rows={4} className={fieldClass} />
      </div>
    </>
  )
}
