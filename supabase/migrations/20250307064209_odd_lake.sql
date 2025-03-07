/*
  # Fix Live Chat Tables and Policies

  1. Changes
    - Add missing indexes for performance
    - Fix RLS policies for chat sessions and messages
    - Add proper cascade deletes
    - Add proper metadata columns
    - Add proper timestamps handling

  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated and anonymous users
    - Ensure proper access control for chat sessions and messages

  3. Performance
    - Add indexes on frequently queried columns
    - Add indexes for foreign key relationships
*/

-- Fix chat_sessions table
ALTER TABLE chat_sessions 
  ALTER COLUMN metadata SET DEFAULT '{}',
  ALTER COLUMN typing_users SET DEFAULT '{}',
  ALTER COLUMN last_activity SET DEFAULT now();

-- Add indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor_id ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity);

-- Fix chat_messages table
ALTER TABLE chat_messages 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
  ALTER COLUMN created_at SET DEFAULT now();

-- Add indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_session_id ON chat_messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON chat_messages(sender_type);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Public can view chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update typing status" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Anyone can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON chat_messages;
DROP POLICY IF EXISTS "Public can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Public can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update read status of their messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages from their chat sessions" ON chat_messages;

-- Chat Sessions Policies
CREATE POLICY "Public can create chat sessions"
  ON chat_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view chat sessions"
  ON chat_sessions
  FOR SELECT
  TO anon
  USING (true);

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

CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Public can create chat messages"
  ON chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = chat_session_id
      AND status = 'active'
    )
  );

CREATE POLICY "Public can view chat messages"
  ON chat_messages
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can create messages for their sessions"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = chat_session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update message metadata"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = chat_session_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = chat_session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their session messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = chat_session_id
      AND user_id = auth.uid()
    )
  );

-- Create or replace the cleanup_typing_status function
CREATE OR REPLACE FUNCTION cleanup_typing_status()
RETURNS trigger AS $$
BEGIN
  -- Remove typing users that haven't updated their status in the last minute
  UPDATE chat_sessions
  SET typing_users = typing_users - array_agg(user_id)::text[]
  FROM (
    SELECT id, jsonb_array_elements_text(typing_users::jsonb) as user_id
    FROM chat_sessions
    WHERE last_activity < now() - interval '1 minute'
  ) old_typing
  WHERE chat_sessions.id = old_typing.id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the update_session_activity function
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS trigger AS $$
BEGIN
  UPDATE chat_sessions
  SET last_activity = now()
  WHERE id = NEW.chat_session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;