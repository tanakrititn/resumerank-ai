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
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in p-3 sm:p-4 md:p-6">
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
        <Link href={`/jobs/${job.id}`}>
          <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Add Candidate</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg truncate">for {job.title}</p>
        </div>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="gradient-card border-b p-4 sm:p-5 md:p-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-5 md:pt-6 p-4 sm:p-5 md:p-6">
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base font-semibold">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                disabled={isLoading}
                className="h-10 sm:h-11 md:h-12 text-sm sm:text-base border-2 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base font-semibold">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                disabled={isLoading}
                className="h-10 sm:h-11 md:h-12 text-sm sm:text-base border-2 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm sm:text-base font-semibold">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                disabled={isLoading}
                className="h-10 sm:h-11 md:h-12 text-sm sm:text-base border-2 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume" className="text-sm sm:text-base font-semibold">
                Resume <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center">
                <Input
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.docx"
                  required
                  disabled={isLoading}
                  onChange={handleFileChange}
                  className="cursor-pointer h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base border-2 focus-visible:border-primary file:mr-2 sm:file:mr-3 md:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-3 md:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>
              {selectedFile && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground bg-secondary/50 p-2 sm:p-3 rounded-lg">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="font-medium truncate">{selectedFile.name}</span>
                  <span className="flex-shrink-0">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground">
                Accepted formats: PDF, DOCX (Max 10MB)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
              <Button type="submit" disabled={isLoading} className="w-full sm:flex-1 h-10 sm:h-11 md:h-12 gradient-primary shadow-md text-sm sm:text-base">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 animate-spin" />}
                {isLoading ? 'Uploading & Analyzing...' : 'Add Candidate'}
              </Button>
              <Link href={`/jobs/${job.id}`} className="w-full sm:w-auto">
                <Button type="button" variant="outline" disabled={isLoading} className="w-full h-10 sm:h-11 md:h-12 border-2 text-sm sm:text-base">
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
