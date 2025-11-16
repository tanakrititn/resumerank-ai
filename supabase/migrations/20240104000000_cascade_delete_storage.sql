-- =====================================================
-- CASCADE DELETE FOR STORAGE FILES
-- This migration adds triggers to delete resume files
-- from storage when candidates or users are deleted
-- =====================================================

-- Function to delete resume file from storage when candidate is deleted
CREATE OR REPLACE FUNCTION delete_candidate_resume()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete resume file from storage if it exists
  IF OLD.resume_url IS NOT NULL THEN
    -- Extract file path from URL
    -- Format: https://xxx.supabase.co/storage/v1/object/public/resumes/user_id/filename
    DECLARE
      file_path TEXT;
    BEGIN
      -- Get the path after 'resumes/' in the URL
      file_path := substring(OLD.resume_url from 'resumes/(.+)$');

      IF file_path IS NOT NULL THEN
        -- Delete from storage
        DELETE FROM storage.objects
        WHERE bucket_id = 'resumes'
        AND name = file_path;
      END IF;
    END;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for candidate deletion
CREATE TRIGGER on_candidate_deleted
  BEFORE DELETE ON candidates
  FOR EACH ROW EXECUTE FUNCTION delete_candidate_resume();

-- Function to delete all user's resume files when user is deleted
CREATE OR REPLACE FUNCTION delete_user_resumes()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all resume files for this user from storage
  DELETE FROM storage.objects
  WHERE bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = OLD.id::text;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user/profile deletion
CREATE TRIGGER on_profile_deleted
  BEFORE DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION delete_user_resumes();

-- =====================================================
-- ADMIN POLICIES FOR CASCADE OPERATIONS
-- =====================================================

-- Allow service role to delete from storage (needed for cascade operations)
CREATE POLICY "Service role can delete all storage objects"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'resumes');

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Add index on resume_url for faster lookups during cascade delete
CREATE INDEX IF NOT EXISTS idx_candidates_resume_url ON candidates(resume_url) WHERE resume_url IS NOT NULL;
