import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import DashboardNav from '@/components/dashboard/nav'
import NotificationBanner from '@/components/notification-banner'
import { ErrorBoundary } from '@/components/error-boundary'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} />
      <ErrorBoundary>
        <main className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
          {children}
        </main>
      </ErrorBoundary>
      <NotificationBanner />
    </div>
  )
}
