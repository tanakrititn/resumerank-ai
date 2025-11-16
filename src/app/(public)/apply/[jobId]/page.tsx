import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PublicJobApplicationForm from '@/components/apply/public-job-application-form'
import { Briefcase, MapPin, DollarSign, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default async function PublicJobApplicationPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createClient()

  // Fetch job details without authentication
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, profiles(company_name)')
    .eq('id', jobId)
    .single()

  if (error || !job || job.status !== 'OPEN') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Apply for {job.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {(job.profiles as any)?.company_name || 'Company'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Job Details Card */}
        <Card className="border-2 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">{job.title}</h2>
                <Badge className="bg-green-500 hover:bg-green-600">
                  Open Position
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mb-6">
                {(job.profiles as any)?.company_name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{(job.profiles as any).company_name}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <PublicJobApplicationForm job={job} />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>Powered by ResumeRank AI</p>
        </div>
      </div>
    </div>
  )
}
