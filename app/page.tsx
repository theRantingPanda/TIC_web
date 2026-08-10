import { PageShell } from '@/components/page-shell'

/**
 * Homepage. Also the redirect target for the legacy /home-1 path (see render.yaml).
 * Wix copy is ported here in Phase 3.
 */
export default function HomePage() {
  return (
    <PageShell
      title="The Insurance Concierge"
      lede="Content for this page is ported in Phase 3. The route exists now so the URL contract holds."
    />
  )
}
