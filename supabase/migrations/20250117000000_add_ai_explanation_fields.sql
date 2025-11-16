-- Add AI explanation fields to candidates table
-- This migration adds detailed AI analysis fields: strengths, weaknesses, and recommendation

-- Add new columns
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS ai_strengths JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_weaknesses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_recommendation TEXT CHECK (
  ai_recommendation IS NULL OR
  ai_recommendation IN ('HIRE', 'INTERVIEW', 'REJECT')
);

-- Add comments for documentation
COMMENT ON COLUMN candidates.ai_strengths IS 'Array of candidate strengths identified by AI (JSONB array)';
COMMENT ON COLUMN candidates.ai_weaknesses IS 'Array of candidate weaknesses identified by AI (JSONB array)';
COMMENT ON COLUMN candidates.ai_recommendation IS 'AI hiring recommendation: HIRE, INTERVIEW, or REJECT';

-- Create index for recommendation field (useful for filtering)
CREATE INDEX IF NOT EXISTS idx_candidates_ai_recommendation ON candidates(ai_recommendation);
