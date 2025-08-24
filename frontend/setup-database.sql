-- =====================================================
-- ملف تهيئة قاعدة البيانات للمكاتب القانونية
-- =====================================================

-- 1. إنشاء جدول المكاتب
CREATE TABLE IF NOT EXISTS offices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  email TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'professional', 'enterprise')),
  max_users INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول القضايا القانونية
CREATE TABLE IF NOT EXISTS legal_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء جدول مراحل التحليل
CREATE TABLE IF NOT EXISTS analysis_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  stage_index INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إنشاء جدول القوالب القانونية
CREATE TABLE IF NOT EXISTS legal_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_offices_slug ON offices(slug);
CREATE INDEX IF NOT EXISTS idx_users_office_id ON users(office_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_legal_cases_office_id ON legal_cases(office_id);
CREATE INDEX IF NOT EXISTS idx_legal_cases_user_id ON legal_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_stages_office_id ON analysis_stages(office_id);
CREATE INDEX IF NOT EXISTS idx_analysis_stages_case_id ON analysis_stages(case_id);
CREATE INDEX IF NOT EXISTS idx_legal_templates_office_id ON legal_templates(office_id);
CREATE INDEX IF NOT EXISTS idx_legal_templates_category ON legal_templates(category);

-- 7. إنشاء دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. إنشاء المشغلات
DROP TRIGGER IF EXISTS update_offices_updated_at ON offices;
CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON offices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legal_cases_updated_at ON legal_cases;
CREATE TRIGGER update_legal_cases_updated_at
  BEFORE UPDATE ON legal_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_stages_updated_at ON analysis_stages;
CREATE TRIGGER update_analysis_stages_updated_at
  BEFORE UPDATE ON analysis_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legal_templates_updated_at ON legal_templates;
CREATE TRIGGER update_legal_templates_updated_at
  BEFORE UPDATE ON legal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. تفعيل Row Level Security
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;

-- 10. إنشاء السياسات الأمنية
-- سياسات المكاتب
DROP POLICY IF EXISTS "Users can view their own office" ON offices;
CREATE POLICY "Users can view their own office" ON offices
FOR SELECT USING (auth.uid() IN (
  SELECT user_id FROM users WHERE office_id = id
));

DROP POLICY IF EXISTS "Office admins can manage their office" ON offices;
CREATE POLICY "Office admins can manage their office" ON offices
FOR ALL USING (auth.uid() IN (
  SELECT user_id FROM users WHERE office_id = id AND role = 'admin'
));

-- سياسات المستخدمين
DROP POLICY IF EXISTS "Users can view office users" ON users;
CREATE POLICY "Users can view office users" ON users
FOR SELECT USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Office admins can manage users" ON users;
CREATE POLICY "Office admins can manage users" ON users
FOR ALL USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid() AND role = 'admin'
));

-- سياسات القضايا
DROP POLICY IF EXISTS "Users can view office cases" ON legal_cases;
CREATE POLICY "Users can view office cases" ON legal_cases
FOR SELECT USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can manage office cases" ON legal_cases;
CREATE POLICY "Users can manage office cases" ON legal_cases
FOR ALL USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid()
));

-- سياسات مراحل التحليل
DROP POLICY IF EXISTS "Users can view office analysis stages" ON analysis_stages;
CREATE POLICY "Users can view office analysis stages" ON analysis_stages
FOR SELECT USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can manage office analysis stages" ON analysis_stages;
CREATE POLICY "Users can manage office analysis stages" ON analysis_stages
FOR ALL USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid()
));

-- سياسات القوالب
DROP POLICY IF EXISTS "Users can view office templates" ON legal_templates;
CREATE POLICY "Users can view office templates" ON legal_templates
FOR SELECT USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can manage office templates" ON legal_templates;
CREATE POLICY "Users can manage office templates" ON legal_templates
FOR ALL USING (office_id IN (
  SELECT office_id FROM users WHERE user_id = auth.uid()
));

-- 11. إنشاء بيانات تجريبية
INSERT INTO offices (name, slug, description, email, subscription_plan, max_users)
VALUES ('مكتب تجريبي', 'demo-office', 'مكتب تجريبي للاختبار', 'demo@office.com', 'free', 5)
ON CONFLICT (slug) DO NOTHING;

-- الحصول على معرف المكتب التجريبي
DO $$
DECLARE
  demo_office_id UUID;
BEGIN
  SELECT id INTO demo_office_id FROM offices WHERE slug = 'demo-office';
  
  IF demo_office_id IS NOT NULL THEN
    -- إنشاء مستخدم تجريبي
    INSERT INTO users (office_id, email, full_name, role)
    VALUES (demo_office_id, 'demo@office.com', 'مدير تجريبي', 'admin')
    ON CONFLICT (email) DO NOTHING;
    
    -- إنشاء قضية تجريبية
    INSERT INTO legal_cases (office_id, name, description, tags)
    VALUES (demo_office_id, 'قضية تجريبية', 'قضية تجريبية للاختبار', ARRAY['تجريبي', 'اختبار'])
    ON CONFLICT DO NOTHING;
    
    -- إنشاء قالب تجريبي
    INSERT INTO legal_templates (office_id, name, content, category)
    VALUES (demo_office_id, 'قالب تجريبي', 'محتوى تجريبي للقالب', 'عام')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 12. رسالة نجاح
SELECT 'تم تهيئة قاعدة البيانات بنجاح!' as message; 