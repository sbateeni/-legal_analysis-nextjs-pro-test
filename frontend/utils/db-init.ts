import { supabase } from './supabase-config'

export interface DatabaseInitResult {
  success: boolean
  message: string
  error?: string
}

/**
 * تهيئة قاعدة البيانات تلقائياً
 */
export async function initializeDatabase(): Promise<DatabaseInitResult> {
  try {
    console.log('🚀 بدء تهيئة قاعدة البيانات...')

    // 1. إنشاء جدول المكاتب
    await createOfficesTable()
    
    // 2. إنشاء جدول المستخدمين
    await createUsersTable()
    
    // 3. إنشاء جدول القضايا القانونية
    await createLegalCasesTable()
    
    // 4. إنشاء جدول مراحل التحليل
    await createAnalysisStagesTable()
    
    // 5. إنشاء جدول القوالب القانونية
    await createLegalTemplatesTable()
    
    // 6. إنشاء الفهارس
    await createIndexes()
    
    // 7. إنشاء الدوال والمشغلات
    await createFunctionsAndTriggers()
    
    // 8. تفعيل Row Level Security
    await enableRLS()
    
    // 9. إنشاء السياسات الأمنية
    await createSecurityPolicies()
    
    // 10. إنشاء بيانات تجريبية
    await createSampleData()

    console.log('✅ تم تهيئة قاعدة البيانات بنجاح!')
    
    return {
      success: true,
      message: 'تم تهيئة قاعدة البيانات بنجاح!'
    }

  } catch (error: any) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error)
    
    return {
      success: false,
      message: 'حدث خطأ في تهيئة قاعدة البيانات',
      error: error.message
    }
  }
}

/**
 * إنشاء جدول المكاتب
 */
async function createOfficesTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  })

  if (error) {
    console.log('ℹ️ جدول المكاتب موجود بالفعل أو حدث خطأ:', error.message)
  } else {
    console.log('✅ تم إنشاء جدول المكاتب')
  }
}

/**
 * إنشاء جدول المستخدمين
 */
async function createUsersTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  })

  if (error) {
    console.log('ℹ️ جدول المستخدمين موجود بالفعل أو حدث خطأ:', error.message)
  } else {
    console.log('✅ تم إنشاء جدول المستخدمين')
  }
}

/**
 * إنشاء جدول القضايا القانونية
 */
async function createLegalCasesTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  })

  if (error) {
    console.log('ℹ️ جدول القضايا موجود بالفعل أو حدث خطأ:', error.message)
  } else {
    console.log('✅ تم إنشاء جدول القضايا')
  }
}

/**
 * إنشاء جدول مراحل التحليل
 */
async function createAnalysisStagesTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  })

  if (error) {
    console.log('ℹ️ جدول مراحل التحليل موجود بالفعل أو حدث خطأ:', error.message)
  } else {
    console.log('✅ تم إنشاء جدول مراحل التحليل')
  }
}

/**
 * إنشاء جدول القوالب القانونية
 */
async function createLegalTemplatesTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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
    `
  })

  if (error) {
    console.log('ℹ️ جدول القوالب موجود بالفعل أو حدث خطأ:', error.message)
  } else {
    console.log('✅ تم إنشاء جدول القوالب')
  }
}

/**
 * إنشاء الفهارس
 */
async function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_offices_slug ON offices(slug);',
    'CREATE INDEX IF NOT EXISTS idx_users_office_id ON users(office_id);',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
    'CREATE INDEX IF NOT EXISTS idx_legal_cases_office_id ON legal_cases(office_id);',
    'CREATE INDEX IF NOT EXISTS idx_legal_cases_user_id ON legal_cases(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_analysis_stages_office_id ON analysis_stages(office_id);',
    'CREATE INDEX IF NOT EXISTS idx_analysis_stages_case_id ON analysis_stages(case_id);',
    'CREATE INDEX IF NOT EXISTS idx_legal_templates_office_id ON legal_templates(office_id);',
    'CREATE INDEX IF NOT EXISTS idx_legal_templates_category ON legal_templates(category);'
  ]

  for (const index of indexes) {
    try {
      await supabase.rpc('exec_sql', { sql: index })
    } catch (error) {
      console.log('ℹ️ فهرس موجود بالفعل:', index)
    }
  }

  console.log('✅ تم إنشاء الفهارس')
}

/**
 * إنشاء الدوال والمشغلات
 */
async function createFunctionsAndTriggers() {
  try {
    // دالة تحديث updated_at
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    })

    // مشغلات تحديث updated_at
    const tables = ['offices', 'users', 'legal_cases', 'analysis_stages', 'legal_templates']
    
    for (const table of tables) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `
            DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
            CREATE TRIGGER update_${table}_updated_at
              BEFORE UPDATE ON ${table}
              FOR EACH ROW
              EXECUTE FUNCTION update_updated_at_column();
          `
        })
      } catch (error) {
        console.log(`ℹ️ مشغل ${table} موجود بالفعل`)
      }
    }

    console.log('✅ تم إنشاء الدوال والمشغلات')
  } catch (error) {
    console.log('ℹ️ الدوال والمشغلات موجودة بالفعل')
  }
}

/**
 * تفعيل Row Level Security
 */
async function enableRLS() {
  const tables = ['offices', 'users', 'legal_cases', 'analysis_stages', 'legal_templates']
  
  for (const table of tables) {
    try {
      await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      })
    } catch (error) {
      console.log(`ℹ️ RLS مفعل بالفعل في ${table}`)
    }
  }

  console.log('✅ تم تفعيل Row Level Security')
}

/**
 * إنشاء السياسات الأمنية
 */
async function createSecurityPolicies() {
  try {
    // سياسات المكاتب
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    // سياسات المستخدمين
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    // سياسات القضايا
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    // سياسات مراحل التحليل
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    // سياسات القوالب
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    console.log('✅ تم إنشاء السياسات الأمنية')
  } catch (error) {
    console.log('ℹ️ السياسات موجودة بالفعل أو حدث خطأ:', error)
  }
}

/**
 * إنشاء بيانات تجريبية
 */
async function createSampleData() {
  try {
    // إنشاء مكتب تجريبي
    const { data: office, error: officeError } = await supabase
      .from('offices')
      .insert({
        name: 'مكتب تجريبي',
        slug: 'demo-office',
        description: 'مكتب تجريبي للاختبار',
        email: 'demo@office.com',
        subscription_plan: 'free',
        max_users: 5
      })
      .select()
      .single()

    if (officeError) {
      console.log('ℹ️ المكتب التجريبي موجود بالفعل')
      return
    }

    // إنشاء مستخدم تجريبي
    await supabase
      .from('users')
      .insert({
        office_id: office.id,
        email: 'demo@office.com',
        full_name: 'مدير تجريبي',
        role: 'admin'
      })

    // إنشاء قضية تجريبية
    const { data: case_, error: caseError } = await supabase
      .from('legal_cases')
      .insert({
        office_id: office.id,
        name: 'قضية تجريبية',
        description: 'قضية تجريبية للاختبار',
        tags: ['تجريبي', 'اختبار']
      })
      .select()
      .single()

    if (!caseError && case_) {
      // إنشاء مرحلة تحليل تجريبية
      await supabase
        .from('analysis_stages')
        .insert({
          office_id: office.id,
          case_id: case_.id,
          stage_index: 0,
          stage_name: 'المرحلة الأولى: تحديد المشكلة القانونية',
          input_text: 'نص تجريبي للاختبار',
          output_text: 'نتيجة تجريبية للاختبار'
        })

      // إنشاء قالب تجريبي
      await supabase
        .from('legal_templates')
        .insert({
          office_id: office.id,
          name: 'قالب تجريبي',
          content: 'محتوى تجريبي للقالب',
          category: 'عام'
        })
    }

    console.log('✅ تم إنشاء البيانات التجريبية')
  } catch (error) {
    console.log('ℹ️ البيانات التجريبية موجودة بالفعل أو حدث خطأ:', error)
  }
}

/**
 * التحقق من وجود العمود office_id في الجداول
 */
export async function checkDatabaseStructure(): Promise<{
  hasOfficesTable: boolean
  hasUsersTable: boolean
  hasLegalCasesTable: boolean
  hasAnalysisStagesTable: boolean
  hasLegalTemplatesTable: boolean
  hasOfficeIdColumns: boolean
}> {
  try {
    // التحقق من وجود الجداول
    const { data: tables } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('offices', 'users', 'legal_cases', 'analysis_stages', 'legal_templates')
        ORDER BY table_name;
      `
    })

    // التحقق من وجود عمود office_id
    const { data: columns } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, table_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'office_id'
        AND table_name IN ('legal_cases', 'analysis_stages', 'legal_templates');
      `
    })

    const hasOfficesTable = tables?.some((t: any) => t.table_name === 'offices') || false
    const hasUsersTable = tables?.some((t: any) => t.table_name === 'users') || false
    const hasLegalCasesTable = tables?.some((t: any) => t.table_name === 'legal_cases') || false
    const hasAnalysisStagesTable = tables?.some((t: any) => t.table_name === 'analysis_stages') || false
    const hasLegalTemplatesTable = tables?.some((t: any) => t.table_name === 'legal_templates') || false
    
    const hasOfficeIdColumns = columns?.length === 3 || false

    return {
      hasOfficesTable,
      hasUsersTable,
      hasLegalCasesTable,
      hasAnalysisStagesTable,
      hasLegalTemplatesTable,
      hasOfficeIdColumns
    }

  } catch (error) {
    console.error('❌ خطأ في فحص هيكل قاعدة البيانات:', error)
    return {
      hasOfficesTable: false,
      hasUsersTable: false,
      hasLegalCasesTable: false,
      hasAnalysisStagesTable: false,
      hasLegalTemplatesTable: false,
      hasOfficeIdColumns: false
    }
  }
} 