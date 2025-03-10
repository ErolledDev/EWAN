/*
  # Chat System Schema

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `visitor_id` (text)
      - `status` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `chat_session_id` (uuid, references chat_sessions)
      - `sender_type` (text)
      - `message` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users and anonymous access
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  visitor_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id uuid REFERENCES chat_sessions ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions

-- Allow authenticated users to view their own sessions
CREATE POLICY "Users can view their sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous users to view and create sessions
CREATE POLICY "Visitors can view their sessions"
  ON chat_sessions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Visitors can create sessions"
  ON chat_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for chat_messages

-- Allow authenticated users to view and manage their messages
CREATE POLICY "Users can view their messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    chat_session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Allow anonymous users to view and create messages
CREATE POLICY "Visitors can view messages"
  ON chat_messages
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Visitors can create messages"
  ON chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor_id ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);