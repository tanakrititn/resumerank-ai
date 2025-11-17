'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, FileText, CheckCircle2, Send } from 'lucide-react'
import type { Database } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Job = Database['public']['Tables']['jobs']['Row']

interface PublicJobApplicationFormProps {
  job: Job
}

export default function PublicJobApplicationForm({ job }: PublicJobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)

      // Validate resume file
      if (!resumeFile) {
        toast.error('Resume Required', {
          description: 'Please upload your resume to continue.',
        })
        setIsSubmitting(false)
        return
      }

      // Create candidate via API
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      })

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        toast.error('Connection Error', {
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
        })
        setIsSubmitting(false)
        return
      }

      // Handle specific error cases with friendly messages
      if (!response.ok) {
        const errorMessage = result.error || 'Something went wrong'

        // Duplicate application - show as warning instead of error
        if (errorMessage.includes('already applied')) {
          toast.warning('Already Applied', {
            description: 'You have already submitted an application for this position. We have your information on file.',
            duration: 5000,
          })
          setIsSubmitting(false)
          return
        }

        // Job closed
        if (errorMessage.includes('no longer accepting')) {
          toast.error('Position Closed', {
            description: 'This position is no longer accepting applications. Please check back for other opportunities.',
            duration: 5000,
          })
          setIsSubmitting(false)
          return
        }

        // Job not found
        if (errorMessage.includes('not found')) {
          toast.error('Position Not Found', {
            description: 'This job position could not be found. It may have been removed.',
            duration: 5000,
          })
          setIsSubmitting(false)
          return
        }

        // Generic error with friendly message
        toast.error('Unable to Submit Application', {
          description: 'We encountered an issue processing your application. Please try again in a few moments.',
          duration: 5000,
        })
        setIsSubmitting(false)
        return
      }

      // Success - show success dialog
      setIsSuccess(true)
    } catch (error) {
      // Network or unexpected errors
      toast.error('Submission Error', {
        description: 'An unexpected error occurred. Please check your internet connection and try again.',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid File Type', {
          description: 'Please upload a PDF or Word document.',
        })
        e.target.value = ''
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Too Large', {
          description: 'Resume must be less than 5MB.',
        })
        e.target.value = ''
        return
      }

      setResumeFile(file)
    }
  }

  return (
    <>
      <Card className="border-2 shadow-lg overflow-hidden bg-white p-0">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b p-4 sm:p-5 md:p-6 space-y-1 sm:space-y-1.5">
          <div className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-semibold leading-none tracking-tight text-foreground">
            <Send className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            Submit Your Application
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Fill in your details and upload your resume. Our AI will analyze your application automatically.
          </p>
        </div>
        <CardContent className="pt-4 sm:pt-5 md:pt-6 p-4 sm:p-5 md:p-6 bg-white">
          <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
            <input type="hidden" name="jobId" value={job.id} />

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2" suppressHydrationWarning>
              <div className="space-y-2" suppressHydrationWarning>
                <Label htmlFor="name" className="text-sm sm:text-base text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                  suppressHydrationWarning
                />
              </div>

              <div className="space-y-2" suppressHydrationWarning>
                <Label htmlFor="email" className="text-sm sm:text-base text-foreground">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  disabled={isSubmitting}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-2" suppressHydrationWarning>
              <Label htmlFor="phone" className="text-sm sm:text-base text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                disabled={isSubmitting}
                className="h-10 sm:h-11 text-sm sm:text-base"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume" className="text-sm sm:text-base text-foreground">
                Resume <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  disabled={isSubmitting}
                  className="h-11 sm:h-12 pt-[0.3rem] text-sm sm:text-base file:mr-3 sm:file:mr-4 file:h-8 sm:file:h-9 file:leading-8 sm:file:leading-9 file:py-0 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-blue-500 file:text-white hover:file:from-purple-600 hover:file:to-blue-600 cursor-pointer"
                />
              </div>
              {resumeFile && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 mt-2">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate flex-1">{resumeFile.name}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Accepted formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>

            <div className="pt-3 sm:pt-4 border-t">
              <Button
                type="submit"
                disabled={isSubmitting || !resumeFile}
                size="lg"
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground pb-2 sm:pb-5">
              By submitting this application, you agree that your resume will be analyzed by our AI system.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="sm:max-w-md mx-3 sm:mx-0">
          <DialogHeader>
            <div className="mx-auto mb-3 sm:mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <DialogTitle className="text-center text-xl sm:text-2xl text-foreground">Application Submitted!</DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base pt-2 text-muted-foreground">
              Thank you for applying to <strong className="text-foreground">{job.title}</strong>.
              <br />
              <br />
              Your application has been received and our AI is currently analyzing your resume.
              The recruiter will review your application and get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-3 sm:pt-4">
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-10 sm:h-11 text-sm sm:text-base px-6"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
