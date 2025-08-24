-- مخطط مبسط لقاعدة البيانات القانونية
-- انسخ هذا الكود في SQL Editor في Supabase

-- جدول القضايا
CREATE TABLE IF NOT EXISTS legal_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  user_id UUID
);

-- جدول مراحل التحليل
CREATE TABLE IF NOT EXISTS analysis_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  stage_index INTEGER NOT NULL,
  stage TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول القوالب
CREATE TABLE IF NOT EXISTS legal_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_cases_created ON legal_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_stages_case ON analysis_stages(case_id);
CREATE INDEX IF NOT EXISTS idx_templates_updated ON legal_templates(updated_at);

-- إضافة بيانات تجريبية
INSERT INTO legal_cases (name, tags) VALUES 
  ('قضية تجارية', ARRAY['تجاري', 'عقود']),
  ('قضية عمالية', ARRAY['عمالي', 'أجور']);

INSERT INTO legal_templates (name, content) VALUES 
  ('قالب عقد عمل', 'عقد عمل بين {{صاحب_العمل}} و {{العامل}}'),
  ('قالب مذكرة دفاع', 'مذكرة دفاع في القضية رقم {{رقم_القضية}}'); 