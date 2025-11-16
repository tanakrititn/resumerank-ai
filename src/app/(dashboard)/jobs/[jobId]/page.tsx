import { notFound } from 'next/navigation'
import { getJob } from '@/lib/actions/jobs'
import { getCandidates } from '@/lib/actions/candidates'
import JobDetailClient from '@/components/jobs/job-detail-client'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params

  const [jobResult, candidatesResult] = await Promise.all([
    getJob(jobId),
    getCandidates(jobId),
  ])

  if (jobResult.error || !jobResult.data) {
    notFound()
  }

  const initialCandidates = candidatesResult.data || []

  return (
    <JobDetailClient
      job={jobResult.data}
      initialCandidates={initialCandidates}
    />
  )
}
