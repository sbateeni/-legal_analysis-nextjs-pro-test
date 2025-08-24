// ملف اختبار سريع لـ Supabase
// انسخ هذا الملف في Console المتصفح

console.log('🚀 بدء اختبار Supabase...');

// دالة اختبار الاتصال
async function testSupabaseConnection() {
  try {
    // فحص المتغيرات البيئية
    console.log('🔍 فحص المتغيرات البيئية...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ موجود' : '❌ مفقود');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('المتغيرات البيئية غير موجودة');
    }
    
    // محاولة الاتصال
    console.log('📡 محاولة الاتصال...');
    
    // استيراد Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // اختبار الاتصال
    const { data, error } = await supabase
      .from('legal_cases')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ الاتصال ناجح!');
    console.log('📊 البيانات:', data);
    
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
    return { success: false, error: error.message };
  }
}

// دالة اختبار شامل
async function comprehensiveTest() {
  console.group('🧪 اختبار شامل لـ Supabase');
  
  try {
    // اختبار 1: الاتصال
    console.log('1️⃣ اختبار الاتصال...');
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.log('❌ فشل اختبار الاتصال');
      return;
    }
    
    // اختبار 2: المصادقة
    console.log('2️⃣ اختبار المصادقة...');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('⚠️ خطأ في المصادقة:', userError.message);
    } else if (user) {
      console.log('✅ المستخدم:', user.email);
    } else {
      console.log('ℹ️ لا يوجد مستخدم مسجل دخول');
    }
    
    // اختبار 3: الجداول
    console.log('3️⃣ اختبار الجداول...');
    
    const tables = ['legal_cases', 'analysis_stages', 'legal_templates'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`❌ جدول ${table}:`, error.message);
        } else {
          console.log(`✅ جدول ${table}: متاح`);
        }
      } catch (err) {
        console.log(`❌ جدول ${table}:`, err.message);
      }
    }
    
    console.log('🎉 انتهى الاختبار الشامل!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار الشامل:', error);
  }
  
  console.groupEnd();
}

// إضافة الدوال إلى window
window.testSupabase = testSupabaseConnection;
window.testSupabaseComprehensive = comprehensiveTest;

console.log('✅ تم تحميل دوال الاختبار');
console.log('استخدم: testSupabase() للاختبار السريع');
console.log('استخدم: testSupabaseComprehensive() للاختبار الشامل'); 