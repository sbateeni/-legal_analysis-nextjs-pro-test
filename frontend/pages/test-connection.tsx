import { useState, useEffect } from 'react'
import { checkSupabaseConnection, getCurrentUser, getSession } from '../utils/supabase-config'
import { getAllCases, getAllTemplates } from '../utils/supabase'

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    addLog('بدء اختبار الاتصال...')
    
    try {
      // اختبار الاتصال الأساسي
      addLog('اختبار الاتصال مع قاعدة البيانات...')
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        setConnectionStatus('connected')
        addLog('✅ الاتصال مع قاعدة البيانات ناجح')
      } else {
        setConnectionStatus('failed')
        addLog('❌ فشل الاتصال مع قاعدة البيانات')
        return
      }

      // اختبار الحصول على المستخدم
      addLog('اختبار الحصول على معلومات المستخدم...')
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        addLog(`✅ المستخدم: ${currentUser.email}`)
      } else {
        addLog('ℹ️ لا يوجد مستخدم مسجل دخول')
      }

      // اختبار الحصول على الجلسة
      addLog('اختبار الحصول على الجلسة...')
      const currentSession = await getSession()
      setSession(currentSession)
      
      if (currentSession) {
        addLog('✅ الجلسة نشطة')
      } else {
        addLog('ℹ️ لا توجد جلسة نشطة')
      }

      // اختبار قراءة البيانات
      addLog('اختبار قراءة القضايا...')
      try {
        const casesData = await getAllCases()
        setCases(casesData)
        addLog(`✅ تم قراءة ${casesData.length} قضية`)
      } catch (err) {
        addLog(`❌ خطأ في قراءة القضايا: ${err}`)
      }

      addLog('اختبار قراءة القوالب...')
      try {
        const templatesData = await getAllTemplates()
        setTemplates(templatesData)
        addLog(`✅ تم قراءة ${templatesData.length} قالب`)
      } catch (err) {
        addLog(`❌ خطأ في قراءة القوالب: ${err}`)
      }

      addLog('🎉 انتهى اختبار الاتصال بنجاح!')
      
    } catch (err: any) {
      setConnectionStatus('failed')
      setError(err.message)
      addLog(`❌ خطأ في الاختبار: ${err.message}`)
    }
  }

  const testWriteOperation = async () => {
    addLog('اختبار عملية الكتابة...')
    
    try {
      // اختبار إنشاء قضية جديدة
      const testCase = {
        name: `قضية اختبار ${Date.now()}`,
        created_at: new Date().toISOString(),
        tags: ['اختبار'],
        user_id: user?.id
      }

      const { data, error } = await supabase
        .from('legal_cases')
        .insert([testCase])
        .select()
        .single()

      if (error) {
        addLog(`❌ خطأ في إنشاء قضية: ${error.message}`)
      } else {
        addLog(`✅ تم إنشاء قضية اختبار: ${data.name}`)
        
        // حذف القضية التجريبية
        await supabase
          .from('legal_cases')
          .delete()
          .eq('id', data.id)
        
        addLog('✅ تم حذف قضية الاختبار')
      }
      
    } catch (err: any) {
      addLog(`❌ خطأ في اختبار الكتابة: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          اختبار الاتصال مع Supabase
        </h1>

        {/* حالة الاتصال */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">حالة الاتصال</h2>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${
              connectionStatus === 'checking' ? 'bg-yellow-400' :
              connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className={`font-medium ${
              connectionStatus === 'checking' ? 'text-yellow-600' :
              connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus === 'checking' ? 'جاري الفحص...' :
               connectionStatus === 'connected' ? 'متصل' : 'فشل الاتصال'}
            </span>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* معلومات المستخدم والجلسة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">معلومات المستخدم</h3>
            {user ? (
              <div className="space-y-2">
                <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
                <p><strong>المعرف:</strong> {user.id}</p>
                <p><strong>تاريخ الإنشاء:</strong> {new Date(user.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
            ) : (
              <p className="text-gray-500">لا يوجد مستخدم مسجل دخول</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">معلومات الجلسة</h3>
            {session ? (
              <div className="space-y-2">
                <p><strong>نوع الجلسة:</strong> {session.type}</p>
                <p><strong>تاريخ الانتهاء:</strong> {new Date(session.expires_at).toLocaleDateString('ar-SA')}</p>
              </div>
            ) : (
              <p className="text-gray-500">لا توجد جلسة نشطة</p>
            )}
          </div>
        </div>

        {/* إحصائيات البيانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">القضايا</h3>
            <p className="text-2xl font-bold text-blue-600">{cases.length}</p>
            <p className="text-gray-500">قضية موجودة</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">القوالب</h3>
            <p className="text-2xl font-bold text-green-600">{templates.length}</p>
            <p className="text-gray-500">قالب موجود</p>
          </div>
        </div>

        {/* أزرار الاختبار */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">أدوات الاختبار</h3>
          <div className="space-x-4">
            <button
              onClick={testConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              إعادة اختبار الاتصال
            </button>
            
            <button
              onClick={testWriteOperation}
              disabled={!user}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
            >
              اختبار الكتابة
            </button>
          </div>
        </div>

        {/* سجل العمليات */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">سجل العمليات</h3>
          <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-gray-500">لا توجد عمليات مسجلة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 