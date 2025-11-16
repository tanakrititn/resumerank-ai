'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreVertical,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Activity,
  Award,
  Edit,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateCandidate, deleteCandidate } from '@/lib/actions/candidates'

const statusOptions = [
  { value: 'PENDING_REVIEW', label: 'Pending Review', icon: Clock },
  { value: 'REVIEWED', label: 'Reviewed', icon: CheckCircle2 },
  { value: 'SHORTLISTED', label: 'Shortlisted', icon: Target },
  { value: 'INTERVIEWED', label: 'Interviewed', icon: Activity },
  { value: 'REJECTED', label: 'Rejected', icon: XCircle },
  { value: 'HIRED', label: 'Hired', icon: Award },
]

interface CandidateActionsProps {
  candidateId: string
  jobId: string
  currentStatus: string
}

export default function CandidateActions({
  candidateId,
  jobId,
  currentStatus,
}: CandidateActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true)

    try {
      const result = await updateCandidate(candidateId, {
        status: newStatus as 'PENDING_REVIEW' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Status Updated', {
        description: `Status changed to ${statusOptions.find(s => s.value === newStatus)?.label}`,
      })

      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update status',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const result = await deleteCandidate(candidateId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Candidate Deleted', {
        description: 'The candidate has been removed.',
      })

      // Redirect to job page
      router.push(`/jobs/${jobId}`)
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete candidate',
      })
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isUpdating}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Change Status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => {
            const Icon = option.icon
            const isCurrent = option.value === currentStatus

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={isCurrent || isUpdating}
                className={isCurrent ? 'bg-slate-100 dark:bg-slate-800' : ''}
              >
                <Icon className="mr-2 h-4 w-4" />
                {option.label}
                {isCurrent && (
                  <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
                )}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Candidate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the candidate
              and their associated data, including the resume file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
