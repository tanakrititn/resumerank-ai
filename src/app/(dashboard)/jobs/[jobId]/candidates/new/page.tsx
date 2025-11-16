import { notFound } from 'next/navigation'
import { getJob } from '@/lib/actions/jobs'
import AddCandidateForm from '@/components/candidates/add-candidate-form'

export default async function AddCandidatePage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const result = await getJob(jobId)

  if (result.error || !result.data) {
    notFound()
  }

  return <AddCandidateForm job={result.data} />
}
