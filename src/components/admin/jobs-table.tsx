'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Trash2, Eye, Edit, MoreVertical, PlayCircle, PauseCircle, XCircle, Search, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Database } from '@/types/database'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  profiles?: {
    full_name: string | null
    email: string | null
  } | null
  candidates?: any[]
}

export default function AdminJobsTable({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<'OPEN' | 'PAUSED' | 'CLOSED'>('OPEN')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const router = useRouter()

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Paginate filtered jobs
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  async function handleDeleteJob() {
    if (!selectedJob) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/jobs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJob.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete job')
      }

      toast.success('Success', {
        description: 'Job deleted successfully',
      })

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete job',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateStatus() {
    if (!selectedJob) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/jobs/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      toast.success('Success', {
        description: `Job status updated to ${newStatus}`,
      })

      setIsStatusDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update status',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title, owner, or location..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Posted By</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Candidates</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {filteredJobs.length === 0 && jobs.length > 0
                    ? 'No jobs match your search criteria'
                    : 'No jobs found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedJobs.map((job) => {
                const candidatesCount = Array.isArray(job.candidates)
                  ? job.candidates.length
                  : 0

                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {job.profiles?.full_name || 'No name'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.profiles?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.location || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === 'OPEN'
                            ? 'default'
                            : job.status === 'PAUSED'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{candidatesCount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(job.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push(`/admin/jobs/${job.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push(`/admin/jobs/${job.id}/edit`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Job</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Change Status
                          </DropdownMenuLabel>
                          {job.status !== 'OPEN' && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedJob(job)
                                setNewStatus('OPEN')
                                setIsStatusDialogOpen(true)
                              }}
                            >
                              <PlayCircle className="mr-2 h-4 w-4 text-green-600" />
                              <span>Open</span>
                            </DropdownMenuItem>
                          )}
                          {job.status !== 'PAUSED' && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedJob(job)
                                setNewStatus('PAUSED')
                                setIsStatusDialogOpen(true)
                              }}
                            >
                              <PauseCircle className="mr-2 h-4 w-4 text-yellow-600" />
                              <span>Pause</span>
                            </DropdownMenuItem>
                          )}
                          {job.status !== 'CLOSED' && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedJob(job)
                                setNewStatus('CLOSED')
                                setIsStatusDialogOpen(true)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                              <span>Close</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => {
                              setSelectedJob(job)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Job</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredJobs.length)} of{' '}
            {filteredJobs.length} jobs
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
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)

                if (!showPage) {
                  // Show ellipsis
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

      {/* Delete Job Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{selectedJob?.title}</strong>?
              This will permanently delete the job and all associated candidates.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteJob}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>
              Change the status of <strong>{selectedJob?.title}</strong> to{' '}
              <strong>{newStatus}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge
                  variant={
                    selectedJob?.status === 'OPEN'
                      ? 'default'
                      : selectedJob?.status === 'PAUSED'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {selectedJob?.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Status:</span>
                <Badge
                  variant={
                    newStatus === 'OPEN'
                      ? 'default'
                      : newStatus === 'PAUSED'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {newStatus}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
