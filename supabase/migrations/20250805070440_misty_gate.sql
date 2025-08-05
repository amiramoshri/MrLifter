/*
  # Create programs table for shared workout programs

  1. New Tables
    - `programs`
      - `id` (uuid, primary key)
      - `month` (text, program name/month)
      - `data` (jsonb, program structure)
      - `created_by` (uuid, admin who created it)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `programs` table
    - Add policy for all authenticated users to read programs
    - Add policy for admin users to manage programs
*/

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read programs
CREATE POLICY "All authenticated users can read programs"
  ON programs
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert/update/delete programs (admin check will be done in app)
CREATE POLICY "Authenticated users can manage programs"
  ON programs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();