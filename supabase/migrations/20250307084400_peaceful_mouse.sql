/*
  # Chat System Database Setup

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
    - Add policies for authenticated users to manage their chat data
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  visitor_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'closed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id uuid REFERENCES chat_sessions ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'bot', 'agent')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for chat_messages
CREATE POLICY "Users can view messages from their chat sessions"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their chat sessions"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their chat sessions"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id
      AND chat_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.chat_session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_visitor_id_idx ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS chat_messages_chat_session_id_idx ON chat_messages(chat_session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);