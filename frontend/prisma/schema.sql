-- إنشاء جدول القضايا القانونية
CREATE TABLE IF NOT EXISTS legal_cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  stages TEXT NOT NULL, -- JSON string
  tags TEXT -- JSON string
);

-- إنشاء جدول القوالب القانونية
CREATE TABLE IF NOT EXISTS legal_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- إنشاء فهارس للبحث
CREATE INDEX IF NOT EXISTS idx_cases_name ON legal_cases(name);
CREATE INDEX IF NOT EXISTS idx_templates_name ON legal_templates(name);