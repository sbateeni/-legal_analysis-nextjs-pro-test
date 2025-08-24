-- إنشاء جدول القضايا القانونية
CREATE TABLE legal_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- إنشاء جدول مراحل التحليل
CREATE TABLE analysis_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  stage_index INTEGER NOT NULL,
  stage TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول القوالب القانونية
CREATE TABLE legal_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_legal_cases_user_id ON legal_cases(user_id);
CREATE INDEX idx_legal_cases_created_at ON legal_cases(created_at);
CREATE INDEX idx_analysis_stages_case_id ON analysis_stages(case_id);
CREATE INDEX idx_analysis_stages_stage_index ON analysis_stages(stage_index);
CREATE INDEX idx_legal_templates_user_id ON legal_templates(user_id);
CREATE INDEX idx_legal_templates_updated_at ON legal_templates(updated_at);

-- إنشاء RLS (Row Level Security) للتحكم في الوصول
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للقضايا
CREATE POLICY "Users can view their own cases" ON legal_cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" ON legal_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" ON legal_cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases" ON legal_cases
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات الأمان للمراحل
CREATE POLICY "Users can view stages of their cases" ON analysis_stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM legal_cases 
      WHERE legal_cases.id = analysis_stages.case_id 
      AND legal_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stages to their cases" ON analysis_stages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_cases 
      WHERE legal_cases.id = analysis_stages.case_id 
      AND legal_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stages of their cases" ON analysis_stages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM legal_cases 
      WHERE legal_cases.id = analysis_stages.case_id 
      AND legal_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stages of their cases" ON analysis_stages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM legal_cases 
      WHERE legal_cases.id = analysis_stages.case_id 
      AND legal_cases.user_id = auth.uid()
    )
  );

-- سياسات الأمان للقوالب
CREATE POLICY "Users can view their own templates" ON legal_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON legal_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON legal_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON legal_templates
  FOR DELETE USING (auth.uid() = user_id);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_legal_templates_updated_at 
  BEFORE UPDATE ON legal_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 