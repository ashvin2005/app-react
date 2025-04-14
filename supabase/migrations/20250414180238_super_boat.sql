/*
  # Shift Booking Schema

  1. New Tables
    - `cities`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `shifts`
      - `id` (uuid, primary key) 
      - `city_id` (uuid, foreign key)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `booked_by` (uuid, nullable)
      - `created_at` (timestamp)
      - `status` (text) - 'available' or 'booked'

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all cities
      - Read all shifts
      - Book/cancel shifts (update booked_by and status)
*/

-- Create cities table
CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create shifts table
CREATE TABLE shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES cities(id) NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  booked_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Policies for cities
CREATE POLICY "Cities are viewable by everyone"
  ON cities
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for shifts
CREATE POLICY "Shifts are viewable by everyone"
  ON shifts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can book available shifts"
  ON shifts
  FOR UPDATE
  TO authenticated
  USING (
    status = 'available' OR 
    (status = 'booked' AND booked_by = auth.uid())
  )
  WITH CHECK (
    (status = 'booked' AND booked_by = auth.uid()) OR
    (status = 'available' AND booked_by IS NULL)
  );