-- Function to increment used credits
CREATE OR REPLACE FUNCTION increment_used_credits(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_quotas
  SET used_credits = used_credits + 1
  WHERE user_quotas.user_id = increment_used_credits.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
