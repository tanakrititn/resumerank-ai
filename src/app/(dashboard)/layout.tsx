import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import DashboardNav from '@/components/dashboard/nav'
import NotificationBanner from '@/components/notification-banner'

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
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
      <NotificationBanner />
    </div>
  )
}
