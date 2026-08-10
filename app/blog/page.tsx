import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Blog',
}

export default function Page() {
  return (
    <PageShell
      title="Blog"
      lede="Content for this page is ported in Phase 3. The route exists now so the URL contract holds."
    />
  )
}
