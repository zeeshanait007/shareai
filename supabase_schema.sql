-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '2 days',
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Login Tracking Table
CREATE TABLE IF NOT EXISTS login_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_login_tracking_user_id ON login_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_login_tracking_login_time ON login_tracking(login_time DESC);

-- Analytics View
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN s.status = 'trial' THEN u.id END) as trial_users,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN u.id END) as subscribed_users,
  COUNT(DISTINCT CASE WHEN s.status = 'expired' THEN u.id END) as expired_users,
  COUNT(lt.id) as total_logins,
  COUNT(DISTINCT DATE(lt.login_time)) as active_days,
  COUNT(DISTINCT CASE WHEN lt.login_time >= NOW() - INTERVAL '7 days' THEN lt.user_id END) as weekly_active_users,
  COUNT(DISTINCT CASE WHEN lt.login_time >= NOW() - INTERVAL '30 days' THEN lt.user_id END) as monthly_active_users
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN login_tracking lt ON u.id = lt.user_id;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check and update expired trials
CREATE OR REPLACE FUNCTION check_expired_trials()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET status = 'expired'
    WHERE status = 'trial'
    AND trial_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_tracking ENABLE ROW LEVEL SECURITY;

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Disable RLS for now to ensure everything works, or use simple policies
-- For development, we will use permissive policies that don't recurse

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Enable insert for registration" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own login history" ON login_tracking;
DROP POLICY IF EXISTS "Enable insert for login tracking" ON login_tracking;
DROP POLICY IF EXISTS "Admins can view all login history" ON login_tracking;

-- SIMPLE POLICIES (No recursion)
-- Users Table
CREATE POLICY "Allow public insert for registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for login and check" ON users FOR SELECT USING (true);
CREATE POLICY "Allow users to update their own data" ON users FOR UPDATE USING (true);

-- Subscriptions Table
CREATE POLICY "Allow public insert for new subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow updates to subscriptions" ON subscriptions FOR UPDATE USING (true);

-- Login Tracking Table
CREATE POLICY "Allow public insert for login tracking" ON login_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for login tracking" ON login_tracking FOR SELECT USING (true);

-- Ensure RLS is enabled but permissive
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_tracking ENABLE ROW LEVEL SECURITY;
