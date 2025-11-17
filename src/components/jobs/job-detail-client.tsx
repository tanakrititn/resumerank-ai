'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { deleteJob, duplicateJob } from '@/lib/actions/jobs'
import { ArrowLeft, Edit, Trash2, MapPin, DollarSign, Plus, Calendar, FileText, Loader2, Copy, Users, Share2, FileDown, Clock, Briefcase, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import RealtimeCandidatesList from '@/components/candidates/realtime-candidates-list'
import type { Database } from '@/types/database'
import { Separator } from '@/components/ui/separator'

// Load these components client-only to avoid hydration issues with Radix UI
const ExportCandidatesButton = dynamic(
  () => import('@/components/export-candidates-button'),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="lg" className="w-full" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    ),
  }
)

const ShareJobLinkButton = dynamic(
  () => import('@/components/jobs/share-job-link-button'),
  {
    ssr: false,
    loading: () => (
      <Button variant="secondary" size="lg" className="w-full" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    ),
  }
)

type Job = Database['public']['Tables']['jobs']['Row']
type Candidate = Database['public']['Tables']['candidates']['Row']

export default function JobDetailClient({
  job,
  initialCandidates,
}: {
  job: Job
  initialCandidates: Candidate[]
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)

    const result = await deleteJob(job.id)

    setIsDeleting(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      toast.success('Success', {
        description: 'Job deleted successfully',
      })
      router.push('/jobs')
    }
  }

  async function handleDuplicate() {
    setIsDuplicating(true)

    const result = await duplicateJob(job.id)

    setIsDuplicating(false)
    setIsDuplicateDialogOpen(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      toast.success('Success', {
        description: `Job duplicated successfully as "${result.data?.title}"`,
      })
      // Navigate to the new duplicated job
      if (result.data?.id) {
        router.push(`/jobs/${result.data.id}`)
      } else {
        router.refresh()
      }
    }
  }

  // Calculate stats
  const totalCandidates = candidates.length
  const pendingReview = candidates.filter(c => c.status === 'PENDING_REVIEW').length
  const shortlisted = candidates.filter(c => c.status === 'SHORTLISTED').length
  const hired = candidates.filter(c => c.status === 'HIRED').length

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
        <Link href="/jobs" className="hover:text-primary transition-colors flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Jobs</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
      </div>

      {/* Hero Section with Gradient Background */}
      <Card className="border-2 shadow-xl overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 md:p-8 text-white">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                  <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </div>
                  <Badge
                    className={
                      job.status === 'OPEN'
                        ? 'bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm md:text-base px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5'
                        : 'bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm md:text-base px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 break-words">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-white/90">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span suppressHydrationWarning className="text-xs sm:text-sm">Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>
                  {job.location && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{job.location}</span>
                      </div>
                    </>
                  )}
                  {job.salary_range && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{job.salary_range}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Link href="/jobs" className="flex-shrink-0">
                <Button variant="secondary" size="icon" className="bg-white/20 hover:bg-white/30 text-white border-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-5 md:mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/80 truncate">Total Candidates</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">{totalCandidates}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/80 truncate">Pending Review</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">{pendingReview}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/80 truncate">Shortlisted</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">{shortlisted}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/80 truncate">Hired</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-200">{hired}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </Card>

      {/* Action Buttons - Organized in Categories */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Primary Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 sm:p-5 md:p-6 pt-0">
            <Link href={`/jobs/${job.id}/candidates/new`} className="block">
              <Button size="lg" className="w-full gradient-primary text-white shadow-md h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add Candidate
              </Button>
            </Link>
            <div className="w-full">
              <ShareJobLinkButton
                jobId={job.id}
                jobTitle={job.title}
                initialCandidatesCount={candidates.length}
                variant="secondary"
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Manage Job
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 p-4 sm:p-5 md:p-6 pt-0">
            <div>
              <ExportCandidatesButton
                candidates={candidates}
                jobTitle={job.title}
                variant="outline"
                size="default"
              />
            </div>
            <Link href={`/jobs/${job.id}/edit`}>
              <Button size="default" variant="outline" className="w-full border-2 h-9 sm:h-10 text-xs sm:text-sm">
                <Edit className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Edit
              </Button>
            </Link>
            <Button
              size="default"
              variant="outline"
              onClick={() => setIsDuplicateDialogOpen(true)}
              className="w-full border-2 h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Copy className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Duplicate
            </Button>
            <Button
              size="default"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Trash2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Delete
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <h3 className="font-bold text-xl text-slate-800">Description</h3>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">
                  {job.description}
                </p>
              </div>

              {job.requirements && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                      <h3 className="font-bold text-xl text-slate-800">Requirements</h3>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">
                      {job.requirements}
                    </p>
                  </div>
                </>
              )}

              {(job.location || job.salary_range) && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full"></div>
                      <h3 className="font-bold text-xl text-slate-800">Additional Information</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {job.location && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                          <div className="p-2.5 rounded-lg bg-blue-500 shadow-sm">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-700 mb-1">Location</p>
                            <p className="font-semibold text-blue-900">{job.location}</p>
                          </div>
                        </div>
                      )}

                      {job.salary_range && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                          <div className="p-2.5 rounded-lg bg-green-500 shadow-sm">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-green-700 mb-1">Salary Range</p>
                            <p className="font-semibold text-green-900">{job.salary_range}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <RealtimeCandidatesList
            jobId={job.id}
            initialCandidates={initialCandidates}
            onCandidatesChange={setCandidates}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be
              undone and will also delete all associated candidates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirmation Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Job</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{job.title}&quot;? The duplicated job will be created with &quot;(Copy)&quot; appended to the title and no candidates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDuplicateDialogOpen(false)}
              disabled={isDuplicating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="gradient-primary"
            >
              {isDuplicating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
