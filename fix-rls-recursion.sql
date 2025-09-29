-- Fix RLS recursion issue
-- Execute this in Supabase SQL Editor

-- 1. Create a simple function to get companies without RLS issues
CREATE OR REPLACE FUNCTION get_companies_simple()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.created_at,
    c.updated_at
  FROM companies c
  ORDER BY c.name;
END;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_companies_simple() TO authenticated;

-- 3. Temporarily disable RLS on companies table to fix the issue
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- 4. Re-enable RLS with a simple policy
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 5. Create a simple policy for companies
DROP POLICY IF EXISTS "Allow authenticated users to view companies" ON companies;
CREATE POLICY "Allow authenticated users to view companies" ON companies
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Fix the users table RLS policies to prevent recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Create simple policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage users" ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Test the function
SELECT * FROM get_companies_simple();






















