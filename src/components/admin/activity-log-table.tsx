'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  FileText,
  User,
  Briefcase,
  Shield,
  Trash2,
  Edit,
  Plus,
  Sparkles,
  Clock,
  MapPin,
  Eye,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { Database } from '@/types/database'

type ActivityLog = Database['public']['Tables']['activity_log']['Row'] & {
  profiles?: {
    full_name: string | null
    email: string | null
  } | null
}

const actionConfig = {
  CREATE_JOB: {
    label: 'Created Job',
    icon: Plus,
    color: 'bg-green-100 text-green-700 border-green-200',
    badgeVariant: 'default' as const,
  },
  UPDATE_JOB: {
    label: 'Updated Job',
    icon: Edit,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeVariant: 'secondary' as const,
  },
  DELETE_JOB: {
    label: 'Deleted Job',
    icon: Trash2,
    color: 'bg-red-100 text-red-700 border-red-200',
    badgeVariant: 'destructive' as const,
  },
  CREATE_CANDIDATE: {
    label: 'Added Candidate',
    icon: Plus,
    color: 'bg-green-100 text-green-700 border-green-200',
    badgeVariant: 'default' as const,
  },
  UPDATE_CANDIDATE: {
    label: 'Updated Candidate',
    icon: Edit,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeVariant: 'secondary' as const,
  },
  DELETE_CANDIDATE: {
    label: 'Deleted Candidate',
    icon: Trash2,
    color: 'bg-red-100 text-red-700 border-red-200',
    badgeVariant: 'destructive' as const,
  },
  AI_ANALYSIS_COMPLETED: {
    label: 'AI Analysis',
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    badgeVariant: 'default' as const,
  },
  ADMIN_DELETE_USER: {
    label: 'Deleted User',
    icon: Trash2,
    color: 'bg-red-100 text-red-700 border-red-200',
    badgeVariant: 'destructive' as const,
  },
  ADMIN_GRANT_ADMIN: {
    label: 'Granted Admin',
    icon: Shield,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    badgeVariant: 'default' as const,
  },
  ADMIN_REVOKE_ADMIN: {
    label: 'Revoked Admin',
    icon: Shield,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    badgeVariant: 'secondary' as const,
  },
  ADMIN_UPDATE_QUOTA: {
    label: 'Updated Quota',
    icon: Edit,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeVariant: 'secondary' as const,
  },
  ADMIN_RESET_CREDITS: {
    label: 'Reset Credits',
    icon: Edit,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeVariant: 'secondary' as const,
  },
  ADMIN_DELETE_JOB: {
    label: 'Deleted Job (Admin)',
    icon: Trash2,
    color: 'bg-red-100 text-red-700 border-red-200',
    badgeVariant: 'destructive' as const,
  },
  ADMIN_UPDATE_JOB: {
    label: 'Updated Job (Admin)',
    icon: Edit,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeVariant: 'secondary' as const,
  },
  ADMIN_UPDATE_JOB_STATUS: {
    label: 'Changed Job Status',
    icon: Edit,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeVariant: 'secondary' as const,
  },
}

const resourceIcons = {
  job: Briefcase,
  user: User,
  candidate: FileText,
}

export default function ActivityLogTable({ activities }: { activities: ActivityLog[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null)
  const itemsPerPage = 20

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const profile = activity.profiles as any
    const matchesSearch =
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase())

    // Enhanced action filter - support both exact match and category match
    let matchesAction = actionFilter === 'all'
    if (!matchesAction) {
      if (actionFilter === 'admin_all') {
        matchesAction = activity.action.startsWith('ADMIN_')
      } else if (actionFilter === 'user_all') {
        matchesAction = !activity.action.startsWith('ADMIN_')
      } else {
        matchesAction = activity.action === actionFilter
      }
    }

    const matchesResource =
      resourceFilter === 'all' || activity.resource_type === resourceFilter

    return matchesSearch && matchesAction && matchesResource
  })

  // Paginate
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null

    const entries = Object.entries(metadata)
    return entries.map(([key, value]) => ({
      key: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
    }))
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, action..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={actionFilter} onValueChange={(value) => { setActionFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="admin_all">🛡️ All Admin Actions</SelectItem>
              <SelectItem value="user_all">👤 All User Actions</SelectItem>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Job Actions</div>
              <SelectItem value="CREATE_JOB">Create Job</SelectItem>
              <SelectItem value="UPDATE_JOB">Update Job</SelectItem>
              <SelectItem value="DELETE_JOB">Delete Job</SelectItem>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Candidate Actions</div>
              <SelectItem value="CREATE_CANDIDATE">Create Candidate</SelectItem>
              <SelectItem value="UPDATE_CANDIDATE">Update Candidate</SelectItem>
              <SelectItem value="DELETE_CANDIDATE">Delete Candidate</SelectItem>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">AI Actions</div>
              <SelectItem value="AI_ANALYSIS_COMPLETED">AI Analysis</SelectItem>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Admin Actions</div>
              <SelectItem value="ADMIN_DELETE_USER">Delete User</SelectItem>
              <SelectItem value="ADMIN_GRANT_ADMIN">Grant Admin</SelectItem>
              <SelectItem value="ADMIN_REVOKE_ADMIN">Revoke Admin</SelectItem>
              <SelectItem value="ADMIN_UPDATE_QUOTA">Update Quota</SelectItem>
              <SelectItem value="ADMIN_RESET_CREDITS">Reset Credits</SelectItem>
              <SelectItem value="ADMIN_DELETE_JOB">Delete Job</SelectItem>
              <SelectItem value="ADMIN_UPDATE_JOB">Update Job</SelectItem>
              <SelectItem value="ADMIN_UPDATE_JOB_STATUS">Change Job Status</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={(value) => { setResourceFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="job">Jobs</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="candidate">Candidates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-3">
        {paginatedActivities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filteredActivities.length === 0 && activities.length > 0
                ? 'No activities match your filters'
                : 'No activities found'}
            </p>
          </div>
        ) : (
          paginatedActivities.map((activity) => {
            const profile = activity.profiles as any
            const config = actionConfig[activity.action as keyof typeof actionConfig] || {
              label: activity.action.replace(/_/g, ' '),
              icon: FileText,
              color: 'bg-gray-100 text-gray-700 border-gray-200',
              badgeVariant: 'secondary' as const,
            }
            const ActionIcon = config.icon
            const ResourceIcon = resourceIcons[activity.resource_type as keyof typeof resourceIcons] || FileText

            return (
              <div
                key={activity.id}
                className="bg-white rounded-lg border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-200 p-4 cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${config.color} border-2 flex-shrink-0`}>
                    <ActionIcon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={config.badgeVariant} className="font-semibold">
                            {config.label}
                          </Badge>
                          {activity.resource_type && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ResourceIcon className="h-3 w-3" />
                              <span className="capitalize">{activity.resource_type}</span>
                            </div>
                          )}
                        </div>

                        {/* Metadata Preview */}
                        {activity.metadata && typeof activity.metadata === 'object' && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {(activity.metadata as any).title && (
                              <span className="font-medium text-gray-700">
                                {(activity.metadata as any).title}
                              </span>
                            )}
                            {(activity.metadata as any).old_status && (activity.metadata as any).new_status && (
                              <span>
                                {(activity.metadata as any).old_status} → {(activity.metadata as any).new_status}
                              </span>
                            )}
                            {(activity.metadata as any).ai_credits !== undefined && (
                              <span>Credits: {(activity.metadata as any).ai_credits}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {profile?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profile?.email || 'No email'}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {getInitials(profile?.full_name)}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                      </div>
                      {activity.ip_address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{activity.ip_address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 ml-auto text-purple-600 hover:text-purple-700">
                        <Eye className="h-3 w-3" />
                        <span>View details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of{' '}
            {filteredActivities.length} activities
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)

                if (!showPage) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Activity Detail Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Activity Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this activity
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xl">
                  {getInitials((selectedActivity.profiles as any)?.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {(selectedActivity.profiles as any)?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedActivity.profiles as any)?.email || 'No email'}
                  </p>
                </div>
              </div>

              {/* Action & Resource */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <Badge className="text-base px-3 py-1">
                    {actionConfig[selectedActivity.action as keyof typeof actionConfig]?.label ||
                      selectedActivity.action.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Resource Type</p>
                  <p className="text-base font-medium capitalize">
                    {selectedActivity.resource_type || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="text-sm">
                    {format(new Date(selectedActivity.created_at), 'PPpp')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="text-sm">{selectedActivity.ip_address || 'Not recorded'}</p>
                </div>
              </div>

              {/* Metadata */}
              {selectedActivity.metadata && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Additional Details</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {formatMetadata(selectedActivity.metadata)?.map(({ key, value }) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-medium text-sm min-w-[120px]">{key}:</span>
                        <span className="text-sm text-muted-foreground break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resource ID */}
              {selectedActivity.resource_id && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Resource ID</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {selectedActivity.resource_id}
                  </code>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
