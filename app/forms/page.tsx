import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Forms & Documents',
}

/**
 * Redirect target for the legacy /file-access path (see render.yaml).
 * The file library reads public/forms/manifest.json, which is intentionally empty.
 */
export default function Page() {
  return (
    <PageShell
      title="Forms & Documents"
      lede="The file library is scaffolded but not yet populated. See public/forms/manifest.json."
    />
  )
}
