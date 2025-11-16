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

export default function EditJobForm({ job }: { job: Job }) {
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
      router.push(`/jobs/${job.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href={`/jobs/${job.id}`}>
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold">Edit Job</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Update your job posting details
          </p>
        </div>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="gradient-card border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="h-6 w-6 text-primary" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={job.title}
                required
                disabled={isLoading}
                className="h-12 text-base border-2 focus-visible:border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Choose a clear, specific job title
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={job.description}
                rows={6}
                required
                disabled={isLoading}
                className="text-base border-2 focus-visible:border-primary resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Provide a detailed description of the role and key responsibilities
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-base font-semibold">
                Requirements
              </Label>
              <Textarea
                id="requirements"
                name="requirements"
                defaultValue={job.requirements || ''}
                rows={5}
                disabled={isLoading}
                className="text-base border-2 focus-visible:border-primary resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Specify required skills, experience level, and qualifications
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-semibold">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={job.location || ''}
                  disabled={isLoading}
                  className="h-12 text-base border-2 focus-visible:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range" className="text-base font-semibold">
                  Salary Range
                </Label>
                <Input
                  id="salary_range"
                  name="salary_range"
                  defaultValue={job.salary_range || ''}
                  disabled={isLoading}
                  className="h-12 text-base border-2 focus-visible:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-base font-semibold">
                Status
              </Label>
              <Select
                name="status"
                defaultValue={job.status}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Control whether the job accepts new applications
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="flex-1 gradient-primary shadow-md text-base"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Update Job
              </Button>
              <Link href={`/jobs/${job.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  size="lg"
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
