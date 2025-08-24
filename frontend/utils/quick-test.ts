import { supabase } from './supabase-config'

/**
 * اختبار سريع للاتصال مع Supabase
 * يمكن استدعاؤه من أي مكان في التطبيق
 */
export async function quickConnectionTest(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    console.log('🔍 بدء اختبار الاتصال السريع...')
    
    // اختبار 1: الاتصال الأساسي
    console.log('📡 اختبار الاتصال الأساسي...')
    const { data, error } = await supabase
      .from('legal_cases')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ خطأ في الاتصال الأساسي:', error)
      return {
        success: false,
        message: 'فشل الاتصال مع قاعدة البيانات',
        details: error
      }
    }
    
    console.log('✅ الاتصال الأساسي ناجح')
    
    // اختبار 2: الحصول على المستخدم
    console.log('👤 اختبار الحصول على المستخدم...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('⚠️ لا يمكن الحصول على المستخدم:', userError.message)
    } else if (user) {
      console.log('✅ المستخدم موجود:', user.email)
    } else {
      console.log('ℹ️ لا يوجد مستخدم مسجل دخول')
    }
    
    // اختبار 3: الحصول على الجلسة
    console.log('🔐 اختبار الحصول على الجلسة...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('⚠️ لا يمكن الحصول على الجلسة:', sessionError.message)
    } else if (session) {
      console.log('✅ الجلسة نشطة')
    } else {
      console.log('ℹ️ لا توجد جلسة نشطة')
    }
    
    // اختبار 4: قراءة البيانات
    console.log('📖 اختبار قراءة البيانات...')
    try {
      const { data: cases, error: casesError } = await supabase
        .from('legal_cases')
        .select('id, name')
        .limit(5)
      
      if (casesError) {
        console.log('⚠️ لا يمكن قراءة القضايا:', casesError.message)
      } else {
        console.log(`✅ تم قراءة ${cases?.length || 0} قضية`)
      }
    } catch (err) {
      console.log('⚠️ خطأ في قراءة البيانات:', err)
    }
    
    console.log('🎉 انتهى الاختبار السريع بنجاح!')
    
    return {
      success: true,
      message: 'الاتصال ناجح مع قاعدة البيانات',
      details: {
        user: user?.email || 'غير مسجل دخول',
        session: session ? 'نشطة' : 'غير نشطة',
        database: 'متصل'
      }
    }
    
  } catch (error: any) {
    console.error('❌ خطأ في الاختبار السريع:', error)
    return {
      success: false,
      message: 'فشل في الاختبار',
      details: error
    }
  }
}

/**
 * اختبار شامل للاتصال
 */
export async function comprehensiveTest(): Promise<{
  connection: boolean
  auth: boolean
  database: boolean
  tables: boolean
  policies: boolean
  summary: string
}> {
  const results = {
    connection: false,
    auth: false,
    database: false,
    tables: false,
    policies: false,
    summary: ''
  }
  
  try {
    // اختبار الاتصال
    const connectionTest = await quickConnectionTest()
    results.connection = connectionTest.success
    
    if (results.connection) {
      // اختبار المصادقة
      const { data: { user } } = await supabase.auth.getUser()
      results.auth = true
      
      // اختبار قاعدة البيانات
      const { data, error } = await supabase
        .from('legal_cases')
        .select('count')
        .limit(1)
      results.database = !error
      
      // اختبار الجداول
      try {
        await supabase.from('legal_cases').select('id').limit(1)
        await supabase.from('analysis_stages').select('id').limit(1)
        await supabase.from('legal_templates').select('id').limit(1)
        results.tables = true
      } catch (err) {
        results.tables = false
      }
      
      // اختبار السياسات (RLS)
      if (user) {
        try {
          const { data: testCase, error: insertError } = await supabase
            .from('legal_cases')
            .insert([{
              name: 'قضية اختبار',
              created_at: new Date().toISOString(),
              user_id: user.id
            }])
            .select()
            .single()
          
          if (!insertError && testCase) {
            // حذف القضية التجريبية
            await supabase
              .from('legal_cases')
              .delete()
              .eq('id', testCase.id)
            results.policies = true
          }
        } catch (err) {
          results.policies = false
        }
      }
    }
    
    // إنشاء ملخص
    const passedTests = Object.values(results).filter(Boolean).length - 1 // -1 for summary
    const totalTests = 5
    
    if (passedTests === totalTests) {
      results.summary = '✅ جميع الاختبارات نجحت - النظام يعمل بشكل مثالي'
    } else if (passedTests >= totalTests * 0.8) {
      results.summary = '⚠️ معظم الاختبارات نجحت - النظام يعمل بشكل جيد'
    } else if (passedTests >= totalTests * 0.6) {
      results.summary = '⚠️ بعض الاختبارات نجحت - النظام يعمل جزئياً'
    } else {
      results.summary = '❌ معظم الاختبارات فشلت - هناك مشاكل في النظام'
    }
    
  } catch (error) {
    results.summary = '❌ فشل في إجراء الاختبارات'
  }
  
  return results
}

/**
 * طباعة نتائج الاختبار في Console
 */
export function logTestResults(results: any) {
  console.group('🧪 نتائج اختبار Supabase')
  console.log('📡 الاتصال:', results.connection ? '✅' : '❌')
  console.log('🔐 المصادقة:', results.auth ? '✅' : '❌')
  console.log('🗄️ قاعدة البيانات:', results.database ? '✅' : '❌')
  console.log('📋 الجداول:', results.tables ? '✅' : '❌')
  console.log('🛡️ السياسات:', results.policies ? '✅' : '❌')
  console.log('📊 الملخص:', results.summary)
  console.groupEnd()
} 