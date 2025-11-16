-- Fix infinite recursion in RLS policies by creating a helper function
-- This function bypasses RLS to check if the current user is an admin

-- Drop existing admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can read all candidates" ON candidates;
DROP POLICY IF EXISTS "Admins can read all activity" ON activity_log;
DROP POLICY IF EXISTS "Admins can read all quotas" ON user_quotas;
DROP POLICY IF EXISTS "Admins can read all resumes" ON storage.objects;

-- Create a helper function that checks admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the SECURITY DEFINER function
-- This prevents infinite recursion because SECURITY DEFINER runs with elevated privileges
-- and bypasses RLS

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all jobs"
  ON jobs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all candidates"
  ON candidates FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all activity"
  ON activity_log FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all quotas"
  ON user_quotas FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND public.is_admin()
  );
