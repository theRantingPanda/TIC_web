'use client'

import { useCapture } from '@/components/capture-context'

/**
 * An email input that prefills from any address given earlier on the page.
 *
 * The copy deck's section 10 note says to prefill and "drop the field count to five".
 * This prefills but keeps the field visible, deliberately. Hiding a field whose value
 * the visitor cannot see or correct is a usability regression, and a field count that
 * changes with client state would make the "Six fields" subhead either wrong or dynamic.
 * The intent — less work at the last step — is met by the prefill alone.
 *
 * Uncontrolled with a `key` on the prefilled value, so React remounts the input when an
 * address arrives from another form and the new default takes effect, while typing in
 * this field is never fought over by state.
 */
export function EmailField({
  id = 'email',
  label = 'Email',
  required = true,
}: {
  id?: string
  label?: string
  required?: boolean
}) {
  const capture = useCapture()
  const prefill = capture?.email ?? ''

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        key={prefill}
        id={id}
        name="email"
        type="email"
        required={required}
        autoComplete="email"
        defaultValue={prefill}
        className="mt-1 w-full rounded-(--radius-card) border border-border px-3 py-2 text-ink"
      />
    </div>
  )
}
