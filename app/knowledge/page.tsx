import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Knowledge Base',
}

export default function Page() {
  return (
    <PageShell
      title="Knowledge Base"
      lede="Articles are imported from the Freshdesk help centre in Phase 3."
    />
  )
}
