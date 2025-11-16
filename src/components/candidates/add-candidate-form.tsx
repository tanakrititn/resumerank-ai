'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createCandidate } from '@/lib/actions/candidates'
import { Loader2, ArrowLeft, FileText } from 'lucide-react'
import type { Database } from '@/types/database'

type Job = Database['public']['Tables']['jobs']['Row']

export default function AddCandidateForm({ job }: { job: Job }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    const result = await createCandidate(job.id, formData)

    setIsLoading(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      toast.success('Success', {
        description: 'Candidate added successfully! AI analysis will begin shortly.',
      })
      router.push(`/jobs/${job.id}`)
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href={`/jobs/${job.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Candidate</h1>
          <p className="text-muted-foreground">for {job.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume *</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.docx"
                  required
                  disabled={isLoading}
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              {selectedFile && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOCX (Max 10MB)
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Uploading & Analyzing...' : 'Add Candidate'}
              </Button>
              <Link href={`/jobs/${job.id}`}>
                <Button type="button" variant="outline" disabled={isLoading}>
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
