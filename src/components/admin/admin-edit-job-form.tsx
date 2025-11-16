'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { updateJob } from '@/lib/actions/jobs'
import { Loader2, ArrowLeft, Briefcase } from 'lucide-react'
import type { Database } from '@/types/database'

type Job = Database['public']['Tables']['jobs']['Row']

export default function AdminEditJobForm({ job }: { job: Job }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      requirements: formData.get('requirements') as string,
      location: formData.get('location') as string,
      salary_range: formData.get('salary_range') as string,
      status: formData.get('status') as 'OPEN' | 'CLOSED' | 'PAUSED',
    }

    const result = await updateJob(job.id, data)

    setIsLoading(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      toast.success('Success', {
        description: 'Job updated successfully!',
      })
      router.push(`/admin/jobs/${job.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      <div className="flex items-center gap-4">
        <Link href={`/admin/jobs/${job.id}`}>
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Edit Job
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Update job posting details
          </p>
        </div>
      </div>

      <Card className="border-2 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="h-6 w-6 text-purple-600" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Software Engineer"
                defaultValue={job.title}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                rows={6}
                defaultValue={job.description || ''}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="List the skills, experience, and qualifications required..."
                rows={6}
                defaultValue={job.requirements || ''}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. San Francisco, CA (Remote)"
                  defaultValue={job.location || ''}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  name="salary_range"
                  placeholder="e.g. $120k - $180k"
                  defaultValue={job.salary_range || ''}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={job.status} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Job
              </Button>
              <Link href={`/admin/jobs/${job.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="border-2"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
