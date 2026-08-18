import { Reveal } from '@/components/reveal'
import { enquiryBridge, type ConcernAudience } from '@/content/concerns'

/**
 * The three lines between the panel's call to action and the form.
 *
 * Added 2026-08-18. The concern pages went straight from "here is what we would do" to a
 * form, and on /beyond-employer-cover that form is now long enough to read as a wall.
 * This sets the expectation before the visitor reaches it: what they are being asked
 * for, when they hear back, and what it costs to ask.
 *
 * ---- Why this is not a card grid ----
 *
 * It renders as three numbered lines on one rule, not three bordered cards. Cards would
 * make this compete with the concern cards further down the same page, which are the
 * only thing on a concern page a visitor is meant to click sideways to. A step sequence
 * that looks clickable and is not is a worse problem than a plain one.
 *
 * There is NO call to action here. The panel above already made the ask and the form is
 * immediately below; a third button between them would be the visitor's second identical
 * decision in one screen. The handoff that proposed this section included one. It is
 * left out on purpose.
 *
 * Copy lives in content/concerns/index.ts, keyed by audience, with a standing warning
 * against putting a field count or a duration in it.
 */
export function EnquiryBridge({ audience }: { audience: ConcernAudience }) {
  return (
    <Reveal>
      <ol className="grid gap-6 border-t border-border pt-8 sm:grid-cols-3 sm:gap-8">
        {enquiryBridge[audience].map((item) => (
          <li key={item.step}>
            {/*
              aria-hidden because the <ol> already conveys the order to a screen reader,
              and "01" read aloud before each line is the list index announced twice.
            */}
            <span
              aria-hidden="true"
              className="text-eyebrow font-medium text-brand-green-700"
            >
              {item.step}
            </span>
            <p className="mt-2 text-base/7 text-ink-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
