import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import AdminNav from '@/components/admin/admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!user.profile?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
