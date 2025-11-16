import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminEditJobForm from '@/components/admin/admin-edit-job-form'

export default async function AdminEditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createClient()

  // Get the job details
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    notFound()
  }

  return <AdminEditJobForm job={job} />
}
