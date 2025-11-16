import { notFound } from 'next/navigation'
import { getJob } from '@/lib/actions/jobs'
import EditJobForm from '@/components/jobs/edit-job-form'

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const result = await getJob(jobId)

  if (result.error || !result.data) {
    notFound()
  }

  return <EditJobForm job={result.data} />
}
