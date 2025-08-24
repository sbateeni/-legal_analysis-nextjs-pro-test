-- مخطط قاعدة البيانات لنظام SaaS للمكاتب القانونية
-- نفذ هذا الكود في SQL Editor في Supabase

-- 1. جدول المكاتب
CREATE TABLE IF NOT EXISTS offices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'professional', 'enterprise')),
  max_users INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. تحديث الجداول الموجودة
ALTER TABLE legal_cases ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id) ON DELETE CASCADE;
ALTER TABLE analysis_stages ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id) ON DELETE CASCADE;
ALTER TABLE legal_templates ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id) ON DELETE CASCADE;

-- 4. إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_offices_slug ON offices(slug);
CREATE INDEX IF NOT EXISTS idx_offices_email ON offices(email);
CREATE INDEX IF NOT EXISTS idx_users_office_id ON users(office_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_cases_office_id ON legal_cases(office_id);
CREATE INDEX IF NOT EXISTS idx_stages_office_id ON analysis_stages(office_id);
CREATE INDEX IF NOT EXISTS idx_templates_office_id ON legal_templates(office_id);

-- 5. إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. إنشاء triggers
CREATE TRIGGER update_offices_updated_at 
  BEFORE UPDATE ON offices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_templates_updated_at 
  BEFORE UPDATE ON legal_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. إعداد RLS (Row Level Security)
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;

-- 8. سياسات الأمان للمكاتب
CREATE POLICY "Users can view their own office" ON offices
  FOR SELECT USING (
    id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can update their office" ON offices
  FOR UPDATE USING (
    id IN (SELECT office_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 9. سياسات الأمان للمستخدمين
CREATE POLICY "Users can view users in their office" ON users
  FOR SELECT USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can manage users" ON users
  FOR ALL USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 10. سياسات الأمان للقضايا
CREATE POLICY "Users can view cases in their office" ON legal_cases
  FOR SELECT USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert cases in their office" ON legal_cases
  FOR INSERT WITH CHECK (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update cases in their office" ON legal_cases
  FOR UPDATE USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete cases in their office" ON legal_cases
  FOR DELETE USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

-- 11. سياسات الأمان للمراحل
CREATE POLICY "Users can view stages in their office" ON analysis_stages
  FOR SELECT USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert stages in their office" ON analysis_stages
  FOR INSERT WITH CHECK (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update stages in their office" ON analysis_stages
  FOR UPDATE USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete stages in their office" ON analysis_stages
  FOR DELETE USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

-- 12. سياسات الأمان للقوالب
CREATE POLICY "Users can view templates in their office" ON legal_templates
  FOR SELECT USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert templates in their office" ON legal_templates
  FOR INSERT WITH CHECK (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update templates in their office" ON legal_templates
  FOR UPDATE USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete templates in their office" ON legal_templates
  FOR DELETE USING (
    office_id IN (SELECT office_id FROM users WHERE id = auth.uid())
  );

-- 13. إنشاء مكتب تجريبي
INSERT INTO offices (name, slug, description, email, subscription_plan) VALUES 
  ('مكتب المحاماة التجريبي', 'test-office', 'مكتب تجريبي للاختبار', 'test@office.com', 'free');

-- 14. إنشاء مستخدم تجريبي (admin)
INSERT INTO users (office_id, email, full_name, role) VALUES 
  ((SELECT id FROM offices WHERE slug = 'test-office'), 'admin@office.com', 'مدير المكتب', 'admin');

-- 15. تحديث البيانات الموجودة
UPDATE legal_cases SET office_id = (SELECT id FROM offices WHERE slug = 'test-office') WHERE office_id IS NULL;
UPDATE legal_templates SET office_id = (SELECT id FROM offices WHERE slug = 'test-office') WHERE office_id IS NULL;

-- 16. إنشاء قضايا تجريبية للمكتب
INSERT INTO legal_cases (name, tags, office_id) VALUES 
  ('قضية تجارية - مكتب تجريبي', ARRAY['تجاري', 'عقود'], (SELECT id FROM offices WHERE slug = 'test-office')),
  ('قضية عمالية - مكتب تجريبي', ARRAY['عمالي', 'أجور'], (SELECT id FROM offices WHERE slug = 'test-office'));

-- 17. إنشاء قوالب تجريبية للمكتب
INSERT INTO legal_templates (name, content, office_id) VALUES 
  ('قالب عقد عمل - مكتب تجريبي', 'عقد عمل بين {{صاحب_العمل}} و {{العامل}}', (SELECT id FROM offices WHERE slug = 'test-office')),
  ('قالب مذكرة دفاع - مكتب تجريبي', 'مذكرة دفاع في القضية رقم {{رقم_القضية}}', (SELECT id FROM offices WHERE slug = 'test-office'));

-- رسالة نجاح
SELECT 'تم إنشاء قاعدة البيانات بنجاح!' as message; 