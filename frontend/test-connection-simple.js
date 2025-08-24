// اختبار سريع للاتصال مع Supabase
// انسخ هذا الكود في Console المتصفح

console.log('🚀 اختبار الاتصال مع Supabase...');

// فحص المتغيرات البيئية
console.log('🔍 فحص المتغيرات البيئية:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ موجود' : '❌ مفقود');

// اختبار الاتصال
async function testConnection() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ المتغيرات البيئية غير موجودة!');
      console.log('📝 أنشئ ملف .env.local مع:');
      console.log('NEXT_PUBLIC_SUPABASE_URL=https://edwzbiaqarojxtdzraxz.supabase.co');
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here');
      return;
    }

    console.log('📡 محاولة الاتصال...');
    
    // استيراد Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // اختبار قراءة البيانات
    const { data, error } = await supabase
      .from('legal_cases')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ خطأ في الاتصال:', error.message);
      
      if (error.message.includes('relation "legal_cases" does not exist')) {
        console.log('💡 الحل: نفذ ملف simple-schema.sql في Supabase');
      }
      
      return;
    }
    
    console.log('✅ الاتصال ناجح!');
    console.log('📊 البيانات:', data);
    console.log(`📋 عدد القضايا: ${data.length}`);
    
    // اختبار إنشاء بيانات جديدة
    console.log('🧪 اختبار إنشاء بيانات...');
    
    const { data: newCase, error: insertError } = await supabase
      .from('legal_cases')
      .insert([{
        name: 'قضية اختبار',
        tags: ['اختبار']
      }])
      .select()
      .single();
    
    if (insertError) {
      console.log('⚠️ لا يمكن إنشاء بيانات جديدة:', insertError.message);
    } else {
      console.log('✅ تم إنشاء قضية جديدة:', newCase.name);
      
      // حذف القضية التجريبية
      await supabase
        .from('legal_cases')
        .delete()
        .eq('id', newCase.id);
      
      console.log('✅ تم حذف قضية الاختبار');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testConnection();

console.log('💡 استخدم testConnection() لإعادة الاختبار'); 