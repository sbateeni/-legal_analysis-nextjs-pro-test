import type { NextApiRequest, NextApiResponse } from 'next'
import { turso } from '../../utils/turso'

const schemaSql = `
CREATE TABLE IF NOT EXISTS offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  email TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'free',
  max_users INTEGER DEFAULT 5,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  office_id TEXT REFERENCES offices(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','user')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legal_cases (
  id TEXT PRIMARY KEY,
  office_id TEXT REFERENCES offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analysis_stages (
  id TEXT PRIMARY KEY,
  office_id TEXT REFERENCES offices(id) ON DELETE CASCADE,
  case_id TEXT REFERENCES legal_cases(id) ON DELETE CASCADE,
  stage_index INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legal_templates (
  id TEXT PRIMARY KEY,
  office_id TEXT REFERENCES offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    if (!turso) return res.status(500).json({ error: 'Turso client not configured' })
    await turso.execute({ sql: schemaSql })
    return res.status(200).json({ success: true })
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'init failed' })
  }
}


