/*
  # Create videos table

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `url` (text)
      - `thumbnail` (text, optional)
      - `category` (text with check constraint)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `videos` table
    - Add policy for all authenticated users to read videos
    - Add policy for admin users to manage videos (you'll need to implement admin role)
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  thumbnail text,
  category text NOT NULL CHECK (category IN ('exercise', 'tutorial', 'motivation', 'nutrition')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage videos"
  ON videos
  FOR ALL
  TO authenticated
  USING (true); -- You can modify this later to check for admin role