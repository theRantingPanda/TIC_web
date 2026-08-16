'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Carries an email address between capture points on one page.
 *
 * The copy deck asks that someone who has already given their address at an earlier
 * capture point does not have to type it again at the closing form.
 *
 * In memory, deliberately — not sessionStorage. Three reasons:
 *
 *   1. Scope. Every capture point is in one render tree on one page. Context is exactly
 *      the size of the problem; sessionStorage solves cross-page persistence nobody
 *      asked for.
 *   2. Hydration. Reading storage during render mismatches between server and client
 *      under static export, so it would have to happen in an effect — meaning the field
 *      renders empty and then fills. Context starts empty on both sides and only changes
 *      through user interaction, so there is nothing to mismatch.
 *   3. Privacy. Persisting a visitor's email address in browser storage is a decision
 *      with a privacy policy attached to it. Holding it for the length of one page view
 *      is not. That is not a call to make incidentally inside a homepage build.
 *
 * The cost is that the value is lost on reload. That is the right trade.
 *
 * The provider is a client component but its children are not: app/page.tsx passes
 * server-rendered sections through as a slot, so only the fields that read the context
 * ship JavaScript.
 */
type CaptureContextValue = {
  email: string
  setEmail: (email: string) => void
}

const CaptureContext = createContext<CaptureContextValue | null>(null)

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('')
  const value = useMemo(() => ({ email, setEmail }), [email])

  return <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>
}

/**
 * Returns null outside a provider rather than throwing, so a capture form can be used
 * on a page that has no reason to share state (for example /employee-benefits).
 */
export function useCapture(): CaptureContextValue | null {
  return useContext(CaptureContext)
}
