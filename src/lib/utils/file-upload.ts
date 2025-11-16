import { createClient } from '@/lib/supabase/server'

export async function uploadResume(
  file: File,
  userId: string,
  jobId: string,
  candidateId: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${jobId}/${candidateId}.${fileExt}`

    // Upload file with metadata
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      })

    if (error) {
      console.error('Upload error:', error)
      return { error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('resumes').getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: 'Failed to upload file' }
  }
}

export async function deleteResume(url: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    // Extract path from URL
    const urlObj = new URL(url)
    const path = urlObj.pathname.split('/resumes/')[1]

    if (!path) {
      return { error: 'Invalid resume URL' }
    }

    const { error } = await supabase.storage.from('resumes').remove([path])

    if (error) {
      console.error('Delete error:', error)
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Delete error:', error)
    return { error: 'Failed to delete file' }
  }
}
