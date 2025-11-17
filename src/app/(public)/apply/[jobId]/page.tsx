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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
                Apply for {job.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {(job.profiles as any)?.company_name || 'Company'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Job Details Card */}
        <Card className="border-2 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-5 md:pt-6 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{job.title}</h2>
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm">
                  Open Position
                </Badge>
              </div>

              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
                {(job.profiles as any)?.company_name && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{(job.profiles as any).company_name}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{job.salary_range}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4 sm:pt-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-foreground">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div className="border-t pt-4 sm:pt-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-foreground">Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {job.requirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <PublicJobApplicationForm job={job} />

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground pt-6 sm:pt-8 border-t">
          <p>Powered by ResumeRank AI</p>
        </div>
      </div>
    </div>
  )
}
