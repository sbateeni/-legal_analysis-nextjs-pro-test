import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase-config'

export default function TestSimple() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
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
      
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .limit(5)
      
      if (error) {
        setConnectionStatus('failed')
        setError(error.message)
        addLog(`❌ خطأ في الاتصال: ${error.message}`)
        return
      }
      
      setConnectionStatus('connected')
      setCases(data || [])
      addLog(`✅ الاتصال ناجح! تم قراءة ${data?.length || 0} قضية`)

      // اختبار قراءة القوالب
      addLog('اختبار قراءة القوالب...')
      try {
        const { data: templatesData, error: templatesError } = await supabase
          .from('legal_templates')
          .select('*')
          .limit(5)
        
        if (templatesError) {
          addLog(`⚠️ خطأ في قراءة القوالب: ${templatesError.message}`)
        } else {
          setTemplates(templatesData || [])
          addLog(`✅ تم قراءة ${templatesData?.length || 0} قالب`)
        }
      } catch (err: any) {
        addLog(`⚠️ خطأ في قراءة القوالب: ${err?.message || 'خطأ غير معروف'}`)
      }

      addLog('🎉 انتهى اختبار الاتصال بنجاح!')
      
    } catch (err: any) {
      setConnectionStatus('failed')
      setError(err?.message || 'خطأ غير معروف')
      addLog(`❌ خطأ في الاختبار: ${err?.message || 'خطأ غير معروف'}`)
    }
  }

  const testWriteOperation = async () => {
    addLog('اختبار عملية الكتابة...')
    
    try {
      // اختبار إنشاء قضية جديدة
      const testCase = {
        name: `قضية اختبار ${Date.now()}`,
        tags: ['اختبار']
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
      addLog(`❌ خطأ في اختبار الكتابة: ${err?.message || 'خطأ غير معروف'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          اختبار الاتصال المبسط مع Supabase
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

        {/* إحصائيات البيانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">القضايا</h3>
            <p className="text-2xl font-bold text-blue-600">{cases.length}</p>
            <p className="text-gray-500">قضية موجودة</p>
            {cases.length > 0 && (
              <div className="mt-3 text-sm">
                {cases.map(case_ => (
                  <div key={case_.id} className="p-2 bg-blue-50 rounded mb-2">
                    <strong>{case_.name}</strong>
                    <div className="text-gray-600">
                      {case_.tags?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">القوالب</h3>
            <p className="text-2xl font-bold text-green-600">{templates.length}</p>
            <p className="text-gray-500">قالب موجود</p>
            {templates.length > 0 && (
              <div className="mt-3 text-sm">
                {templates.map(template => (
                  <div key={template.id} className="p-2 bg-green-50 rounded mb-2">
                    <strong>{template.name}</strong>
                  </div>
                ))}
              </div>
            )}
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
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
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