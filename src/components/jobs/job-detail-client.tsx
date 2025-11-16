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
import { deleteJob } from '@/lib/actions/jobs'
import { ArrowLeft, Edit, Trash2, MapPin, DollarSign, Plus, Calendar, FileText, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import RealtimeCandidatesList from '@/components/candidates/realtime-candidates-list'
import type { Database } from '@/types/database'

// Load these components client-only to avoid hydration issues with Radix UI
const ExportCandidatesButton = dynamic(
  () => import('@/components/export-candidates-button'),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="lg" disabled>
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
      <Button variant="secondary" size="lg" disabled>
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{job.title}</h1>
            <Badge
              variant={
                job.status === 'OPEN'
                  ? 'default'
                  : job.status === 'PAUSED'
                  ? 'secondary'
                  : 'outline'
              }
              className={
                job.status === 'OPEN'
                  ? 'bg-green-500 hover:bg-green-600 text-base px-3 py-1'
                  : 'text-base px-3 py-1'
              }
            >
              {job.status}
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground gap-2">
            <Calendar className="h-4 w-4" />
            <span suppressHydrationWarning>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/jobs/${job.id}/candidates/new`} className="flex-1 sm:flex-none">
          <Button size="lg" className="w-full gradient-primary shadow-md">
            <Plus className="mr-2 h-5 w-5" />
            Add Candidate
          </Button>
        </Link>
        <ShareJobLinkButton
          jobId={job.id}
          jobTitle={job.title}
          initialCandidatesCount={candidates.length}
          variant="secondary"
          size="lg"
        />
        <ExportCandidatesButton
          candidates={candidates}
          jobTitle={job.title}
          variant="outline"
          size="lg"
        />
        <Link href={`/jobs/${job.id}/edit`}>
          <Button size="lg" variant="outline" className="border-2">
            <Edit className="mr-2 h-5 w-5" />
            Edit
          </Button>
        </Link>
        <Button
          size="lg"
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="shadow-md"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              {job.requirements && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-3 text-primary">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {job.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <RealtimeCandidatesList
            jobId={job.id}
            initialCandidates={initialCandidates}
            onCandidatesChange={setCandidates}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-2 shadow-sm gradient-card">
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.location && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
              )}

              {job.salary_range && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                  <div className="p-2 rounded-lg bg-green-50">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Salary Range</p>
                    <p className="font-medium">{job.salary_range}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Posted</p>
                  <p className="font-medium" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
    </div>
  )
}
