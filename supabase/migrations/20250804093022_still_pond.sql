/*
  # Create workout logs table

  1. New Tables
    - `workout_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `date` (date)
      - `exercise` (text)
      - `weight` (decimal)
      - `sets` (integer)
      - `reps` (integer)
      - `notes` (text, optional)
      - `duration` (integer, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `workout_logs` table
    - Add policy for users to manage their own workout logs
*/

CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  exercise text NOT NULL,
  weight decimal(6,2) NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  notes text,
  duration integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout logs"
  ON workout_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);