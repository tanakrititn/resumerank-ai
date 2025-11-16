-- Add tags column to candidates table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance on tags
CREATE INDEX IF NOT EXISTS idx_candidates_tags ON candidates USING GIN (tags);

-- Add comment
COMMENT ON COLUMN candidates.tags IS 'Array of tag objects with name and color';

-- Example tag structure: [{"name": "Senior", "color": "#3b82f6"}, {"name": "Remote", "color": "#10b981"}]
