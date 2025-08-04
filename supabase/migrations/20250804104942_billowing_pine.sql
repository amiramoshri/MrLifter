/*
  # Create goals table

  1. New Tables
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text, optional)
      - `target_value` (numeric)
      - `current_value` (numeric, default 0)
      - `unit` (text)
      - `category` (text with check constraint)
      - `target_date` (date)
      - `is_completed` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `goals` table
    - Add policy for authenticated users to manage their own goals
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric(10,2) NOT NULL,
  current_value numeric(10,2) DEFAULT 0 NOT NULL,
  unit text NOT NULL DEFAULT 'ק"ג',
  category text NOT NULL CHECK (category IN ('weight', 'strength', 'endurance', 'body', 'custom')),
  target_date date NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);