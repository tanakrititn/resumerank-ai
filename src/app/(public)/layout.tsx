import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply - ResumeRank AI',
  description: 'Submit your job application',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
