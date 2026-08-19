"use client";

import { useState } from "react";
import { COUNTRIES, LICENSED_FIRST } from "@/content/countries";
import { MAX_UPLOAD_BYTES } from "@/lib/capture";

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
 * ---- Rebalanced 2026-08-19, and the reasoning is the important part ----
 *
 * Step one used to be name, email and mobile, and step two everything else. The review
 * that followed put it plainly: the page convinces someone they need advice, then hands
 * them a form built for operational completeness rather than for starting a conversation.
 * Step one looked like three easy fields and step two was a fact-find.
 *
 * So the line moved. STEP ONE IS NOW EVERYTHING NEEDED TO GIVE A MEANINGFUL ANSWER —
 * who you are, one way to reach you, your age and where you live. STEP TWO IS ENTIRELY
 * OPTIONAL and says so: family, nationality, portability, pre-existing, a schedule, a
 * note. Someone who fills in step one and clicks straight through has sent us a real
 * enquiry, and that is the point.
 *
 * ⚠ NOTHING IN STEP TWO IS `required`, AND THAT IS NOT AN OVERSIGHT. Portability and
 * pre-existing were both required radios. They are useful and they are not worth losing a
 * lead over; we ask them properly in the reply. Do not put `required` back without
 * deciding, on purpose, that the answer is worth more than the enquiry.
 *
 * ⚠ MOBILE IS OPTIONAL, EMAIL IS NOT. One contact method is the requirement; email is the
 * one every reply goes to. Asking for a phone number as a condition of enquiring costs
 * more leads than it gains calls.
 *
 * ⚠ NO HEALTH DETAIL IS COLLECTED, AND THAT IS DELIBERATE. The pre-existing question is
 * yes / no / not sure and stops there, with a line saying the detail is discussed
 * directly. The endpoint is baked into public HTML and unauthenticated by design, and a
 * diagnosis is the most sensitive thing a person could type into it. Steven chose this
 * shape; do not "improve" it into a free-text box for conditions.
 */

/** Where the firm can advise. Residence outside these raises the warning below. */
const LICENSED_RESIDENCE = LICENSED_FIRST;

const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Partner",
  "Parent",
  "Other",
] as const;

/**
 * Date of birth is three controls with a NAMED MONTH, not an `<input type="date">`.
 *
 * A native date input renders in the BROWSER's locale and cannot be told otherwise. On a
 * US-configured machine it shows mm/dd/yyyy, so a Singapore reader typing 01/02 for the
 * first of February silently records the second of January, and the page has no way to
 * warn them — a "day / month / year" hint beside a field displaying mm/dd/yyyy is worse
 * than no hint, because it is confidently wrong. That exact mismatch was on screen when
 * this was reviewed.
 *
 * Naming the month removes the ambiguity rather than describing it. "Feb" cannot be read
 * as a day in any locale. The three values are composed into an ISO string in a hidden
 * `dob` field, so what n8n receives is unchanged and nothing downstream knew about this.
 *
 * The cost is the native date picker, which is a fair trade for a field where being
 * wrong is silent and the value is priced on.
 */
const DAYS = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/*
  1925 to 2026, newest first. The list is fixed rather than derived from the current year:
  a static export is built once and `new Date()` at module scope would bake in the build
  date, which is a subtler version of the same bug this field exists to avoid. Extend the
  end when it starts to look short.
*/
const YEARS = Array.from({ length: 102 }, (_, index) => String(2026 - index));

const fieldClass =
  "mt-1 w-full rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink";
const labelClass = "block text-sm font-medium text-ink";
/*
  No `w-full`, unlike fieldClass. The three date controls are flex children and
  `width: 100%` fights `flex-1` — it collapsed the month select to a bare chevron, which
  is exactly the sliver a review would have caught later rather than sooner.
*/
const dateSelectClass =
  "mt-1 rounded-(--radius-card) border border-border bg-surface px-3 py-2 text-ink";
const optional = <span className="font-normal text-ink-muted">(optional)</span>;

/** One datalist, referenced by both country fields. Rendered once, in step one. */
const COUNTRY_LIST_ID = "tic-countries";

function CountryOptions() {
  return (
    <datalist id={COUNTRY_LIST_ID}>
      {COUNTRIES.map((country) => (
        <option key={country} value={country} />
      ))}
    </datalist>
  );
}

type Applicant = { id: number; relationship: string };

export function TopUpQuoteContact() {
  const [residence, setResidence] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  /** ISO, or empty until all three are chosen. The hidden `dob` field posts this. */
  const dob = day && month && year ? `${year}-${month}-${day}` : "";

  /*
    Trimmed and case-insensitive, because "singapore " with a trailing space is a real
    thing people type — one arrived that way in a live submission on 2026-08-19 — and
    showing them a licensing warning for it would be wrong.
  */
  const normalised = residence.trim().toLowerCase();
  const outsideLicence =
    normalised.length > 0 &&
    !LICENSED_RESIDENCE.some((country) => country.toLowerCase() === normalised);

  return (
    <>
      <CountryOptions />

      <div>
        <label htmlFor="name" className={labelClass}>
          Your name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="mobile" className={labelClass}>
            Mobile {optional}
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
          />
        </div>
      </div>

      {/*
        Date of birth rather than age: age is what a rate table needs, but it goes stale
          between the enquiry and the quote, and someone reading the lead a fortnight later
          cannot tell which birthday has passed.

          The format hint is not decoration. A native date input renders in the BROWSER's
          locale, so a Singapore reader on a US-configured machine sees mm/dd/yyyy and has
          no way to know it — which is how 01/02 becomes January rather than February. The
          value posted is always ISO, so this only ever affects what the person types.
        */}
      <fieldset>
        <legend className={labelClass}>Your date of birth</legend>
        <p className="mt-1 text-sm text-ink-muted">
          Premiums are priced on age.
        </p>
        <div className="mt-1 flex gap-2">
          <select
            aria-label="Day of birth"
            required
            value={day}
            onChange={(event) => setDay(event.target.value)}
            className={`${dateSelectClass} w-24`}
          >
            <option value="">Day</option>
            {DAYS.map((value) => (
              <option key={value} value={value}>
                {Number(value)}
              </option>
            ))}
          </select>
          <select
            aria-label="Month of birth"
            required
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className={`${dateSelectClass} min-w-0 flex-1`}
          >
            <option value="">Month</option>
            {MONTHS.map((name, index) => (
              <option key={name} value={String(index + 1).padStart(2, "0")}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Year of birth"
            required
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className={`${dateSelectClass} w-28`}
          >
            <option value="">Year</option>
            {YEARS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        {/*
            The composed value is what gets posted, so n8n still receives one `dob` field
            in ISO and nothing downstream had to change.
          */}
        <input type="hidden" name="dob" value={dob} />
      </fieldset>

      <div className="sm:max-w-[calc(50%-0.625rem)]">
        <label htmlFor="residence" className={labelClass}>
          Country of residence
        </label>
        <input
          id="residence"
          name="residence"
          type="text"
          required
          list={COUNTRY_LIST_ID}
          autoComplete="country-name"
          value={residence}
          onChange={(event) => setResidence(event.target.value)}
          aria-describedby={outsideLicence ? "residence-warning" : undefined}
          className={fieldClass}
        />
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
          We are licensed to advise on policies issued in Singapore. If you live
          elsewhere we may not be able to arrange cover for you, though we are
          happy to tell you where you would stand.
        </p>
      ) : null}
    </>
  );
}

export function TopUpQuoteDetails() {
  // The first applicant is the enquirer, asked for in step one. These are the others.
  const [dependants, setDependants] = useState<Applicant[]>([]);
  const [nextId, setNextId] = useState(1);
  const [portable, setPortable] = useState("");

  return (
    <>
      <p className="text-base/7 text-ink-muted">
        All optional. Anything you add here means our reply can be specific
        rather than general, but you can send it as it is.
      </p>

      <fieldset>
        <legend className={labelClass}>
          Anyone else to be covered {optional}
        </legend>

        {dependants.map((applicant, index) => (
          <div key={applicant.id} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`dob-${applicant.id}`}
                className="text-sm text-ink-muted"
              >
                Date of birth
              </label>
              <input
                id={`dob-${applicant.id}`}
                name={`applicant-${index + 1}-dob`}
                type="date"
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor={`rel-${applicant.id}`}
                className="text-sm text-ink-muted"
              >
                Relationship to you
              </label>
              <div className="flex gap-2">
                <select
                  id={`rel-${applicant.id}`}
                  name={`applicant-${index + 1}-relationship`}
                  className={fieldClass}
                >
                  {RELATIONSHIPS.map((relationship) => (
                    <option key={relationship}>{relationship}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setDependants((all) =>
                      all.filter((a) => a.id !== applicant.id),
                    )
                  }
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
            setDependants((all) => [
              ...all,
              { id: nextId, relationship: "Spouse" },
            ]);
            setNextId((id) => id + 1);
          }}
          className="mt-3 rounded-(--radius-card) border border-border px-3 py-2 text-sm font-medium text-ink hover:border-brand-green-300 hover:bg-brand-green-50"
        >
          Add someone else
        </button>
      </fieldset>

      <div>
        <label htmlFor="nationality" className={labelClass}>
          Nationality {optional}
        </label>
        <input
          id="nationality"
          name="nationality"
          type="text"
          list={COUNTRY_LIST_ID}
          className={fieldClass}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>
          Do you expect this cover to move with you out of Singapore? {optional}
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {["Yes", "No", "Not sure"].map((answer) => (
            <label
              key={answer}
              className="flex items-center gap-2 text-sm text-ink"
            >
              <input
                type="radio"
                name="portable"
                value={answer}
                checked={portable === answer}
                onChange={() => setPortable(answer)}
              />
              {answer}
            </label>
          ))}
        </div>
      </fieldset>

      {portable === "Yes" ? (
        <div>
          <label htmlFor="portable-where" className={labelClass}>
            Where to, as best you know {optional}
          </label>
          <input
            id="portable-where"
            name="portable-where"
            type="text"
            className={fieldClass}
          />
        </div>
      ) : null}

      <fieldset>
        <legend className={labelClass}>
          Does anyone to be covered have a pre-existing medical condition?{" "}
          {optional}
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {["Yes", "No", "Not sure"].map((answer) => (
            <label
              key={answer}
              className="flex items-center gap-2 text-sm text-ink"
            >
              <input type="radio" name="pre-existing" value={answer} />
              {answer}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Yes or no is enough here. We will go through the detail with you
          directly, rather than on a form.
        </p>
      </fieldset>

      <div>
        <label htmlFor="existing-cover" className={labelClass}>
          Your existing cover {optional}
        </label>
        <p className="mt-1 text-sm text-ink-muted">
          A schedule or benefits summary, if you have one to hand. PDF or image,
          up to {Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.
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
  );
}
