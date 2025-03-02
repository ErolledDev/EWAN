/*
  # Create initial schema for chat widget system

  1. New Tables
    - `widget_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `business_name` (text)
      - `primary_color` (text)
      - `welcome_message` (text)
      - `sales_representative` (text)
      - `fallback_message` (text)
      - `ai_mode_enabled` (boolean)
      - `ai_api_key` (text, nullable)
      - `ai_model` (text, nullable)
      - `ai_context` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `auto_replies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `keywords` (text array)
      - `matching_type` (text)
      - `response` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `advanced_replies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `keywords` (text array)
      - `matching_type` (text)
      - `response` (text)
      - `response_type` (text)
      - `button_text` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `visitor_id` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `chat_session_id` (uuid, references chat_sessions)
      - `sender_type` (text)
      - `message` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create widget_settings table
CREATE TABLE IF NOT EXISTS widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  business_name text NOT NULL DEFAULT 'My Business',
  primary_color text NOT NULL DEFAULT '#4f46e5',
  welcome_message text NOT NULL DEFAULT 'Welcome to our chat! How can we help you today?',
  sales_representative text NOT NULL DEFAULT 'Customer Support',
  fallback_message text NOT NULL DEFAULT 'We''ll get back to you soon. Please leave a message.',
  ai_mode_enabled boolean NOT NULL DEFAULT false,
  ai_api_key text,
  ai_model text,
  ai_context text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create auto_replies table
CREATE TABLE IF NOT EXISTS auto_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  keywords text[] NOT NULL,
  matching_type text NOT NULL DEFAULT 'word_match',
  response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create advanced_replies table
CREATE TABLE IF NOT EXISTS advanced_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  keywords text[] NOT NULL,
  matching_type text NOT NULL DEFAULT 'word_match',
  response text NOT NULL,
  response_type text NOT NULL DEFAULT 'text',
  button_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  visitor_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id uuid REFERENCES chat_sessions NOT NULL,
  sender_type text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE advanced_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for widget_settings
CREATE POLICY "Users can view their own widget settings"
  ON widget_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own widget settings"
  ON widget_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget settings"
  ON widget_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for auto_replies
CREATE POLICY "Users can view their own auto replies"
  ON auto_replies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own auto replies"
  ON auto_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto replies"
  ON auto_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auto replies"
  ON auto_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for advanced_replies
CREATE POLICY "Users can view their own advanced replies"
  ON advanced_replies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advanced replies"
  ON advanced_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advanced replies"
  ON advanced_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advanced replies"
  ON advanced_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for chat_sessions
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
  USING (auth.uid() = user_id);

-- Create policies for chat_messages
CREATE POLICY "Users can view messages from their chat sessions"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    chat_session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    chat_session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Create public access policies for widget data
CREATE POLICY "Public can view widget settings"
  ON widget_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view auto replies"
  ON auto_replies
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view advanced replies"
  ON advanced_replies
  FOR SELECT
  TO anon
  USING (true);

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

CREATE POLICY "Public can create chat messages"
  ON chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view chat messages"
  ON chat_messages
  FOR SELECT
  TO anon
  USING (true);