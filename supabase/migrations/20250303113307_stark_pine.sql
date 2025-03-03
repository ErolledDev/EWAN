/*
  # Add metadata column to chat_sessions table

  1. Changes
    - Add `metadata` JSONB column to `chat_sessions` table with default empty object
    - Update RLS policies to include the new column
  
  2. Purpose
    - Support storing visitor information, notes, labels, and pinned status
    - Fix errors in the Live Chat feature
*/

-- Add metadata column to chat_sessions table
ALTER TABLE IF EXISTS chat_sessions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing rows to have the default metadata value
UPDATE chat_sessions 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;