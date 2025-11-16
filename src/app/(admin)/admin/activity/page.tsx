import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Activity as ActivityIcon } from 'lucide-react'
import ActivityLogTable from '@/components/admin/activity-log-table'

export default async function AdminActivityPage() {
  const supabase = await createClient()

  const { data: activities, error } = await supabase
    .from('activity_log')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30">
        <Card className="p-12 max-w-md text-center border-2 border-red-200 bg-red-50/50">
          <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
            <ActivityIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Activity Log</h2>
          <p className="text-red-600">{error.message}</p>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const last24h = activities?.filter(
    (a) => new Date(a.created_at) > yesterday
  ).length || 0

  const adminActions = activities?.filter((a) =>
    a.action.startsWith('ADMIN_')
  ).length || 0

  const userActions = (activities?.length || 0) - adminActions

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl -z-10" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Activity Log
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              System-wide audit trail and activity monitoring
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Card className="px-6 py-3 border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {last24h}
                </div>
                <div className="text-xs text-muted-foreground">Last 24 Hours</div>
              </div>
            </Card>
            <Card className="px-6 py-3 border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {userActions}
                </div>
                <div className="text-xs text-muted-foreground">User Actions</div>
              </div>
            </Card>
            <Card className="px-6 py-3 border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {adminActions}
                </div>
                <div className="text-xs text-muted-foreground">Admin Actions</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ActivityLogTable activities={activities || []} />
    </div>
  )
}
