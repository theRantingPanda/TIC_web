import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function Page() {
  return (
    <PageShell
      title="Privacy Policy"
      lede="Content for this page is ported in Phase 3. The route exists now so the URL contract holds."
    />
  )
}
