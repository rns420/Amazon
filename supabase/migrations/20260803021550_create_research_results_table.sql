/*
# Create research_results table for AI-powered research

1. New Tables
- `research_results`: Stores AI-generated market research, niche analysis, and keyword research results.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, defaults to auth.uid())
  - `project_id` (uuid, nullable, references projects)
  - `research_type` (text: 'market' | 'niche' | 'keyword' | 'competition')
  - `query` (text: the search query / category / topic used)
  - `result` (jsonb: the full AI-generated research data)
  - `created_at` (timestamptz)

2. Security
- RLS enabled.
- Owner-scoped CRUD: users can only access their own research results.
*/

CREATE TABLE IF NOT EXISTS research_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  research_type text NOT NULL CHECK (research_type IN ('market', 'niche', 'keyword', 'competition')),
  query text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_results_user ON research_results(user_id);
CREATE INDEX IF NOT EXISTS idx_research_results_type ON research_results(research_type);

ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_research" ON research_results;
CREATE POLICY "select_own_research" ON research_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_research" ON research_results;
CREATE POLICY "insert_own_research" ON research_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_research" ON research_results;
CREATE POLICY "update_own_research" ON research_results FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_research" ON research_results;
CREATE POLICY "delete_own_research" ON research_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);