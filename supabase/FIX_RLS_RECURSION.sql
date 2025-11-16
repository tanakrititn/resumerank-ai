-- =====================================================
-- FIX FOR INFINITE RECURSION IN RLS POLICIES
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste this script > Run
--
-- This fixes the infinite recursion error by using a SECURITY DEFINER
-- function to check admin status without triggering RLS loops
-- =====================================================

-- Step 1: Drop existing admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can read all candidates" ON candidates;
DROP POLICY IF EXISTS "Admins can read all activity" ON activity_log;
DROP POLICY IF EXISTS "Admins can read all quotas" ON user_quotas;
DROP POLICY IF EXISTS "Admins can read all resumes" ON storage.objects;

-- Step 2: Create a helper function that checks admin status without triggering RLS
-- SECURITY DEFINER runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate admin policies using the SECURITY DEFINER function
-- This prevents infinite recursion

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

-- Verification: Check that all policies are created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
