import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getOfficeAnalytics, getCasesByOffice, getTemplatesByOffice } from '../utils/saas-service'
import type { LegalCase, LegalTemplate } from '../types/saas'

export default function Dashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<{
    totalCases: number
    totalTemplates: number
    totalUsers: number
    casesThisMonth: number
    recentActivity: unknown[]
  }>({
    totalCases: 0,
    totalTemplates: 0,
    totalUsers: 0,
    casesThisMonth: 0,
    recentActivity: []
  })
  const [cases, setCases] = useState<LegalCase[]>([])
  const [templates, setTemplates] = useState<LegalTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // في الوقت الحالي، نستخدم office_id ثابت للاختبار
      const officeId = 'test-office-id' // سيتم تحديثه لاحقاً
      
      const [analyticsData, casesData, templatesData] = await Promise.all([
        getOfficeAnalytics(officeId),
        getCasesByOffice(officeId),
        getTemplatesByOffice(officeId)
      ])
      
      setAnalytics(analyticsData)
      setCases(casesData)
      setTemplates(templatesData)
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600">مرحباً بك في مكتبك القانوني</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/register-office')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                إنشاء مكتب جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">إجمالي القضايا</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">القوالب</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">المستخدمين</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">هذا الشهر</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.casesThisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* القضايا الأخيرة */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">القضايا الأخيرة</h3>
          </div>
          <div className="p-6">
            {cases.length > 0 ? (
              <div className="space-y-4">
                {cases.slice(0, 5).map(case_ => (
                  <div key={case_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{case_.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(case_.created_at).toLocaleDateString('ar-SA')}
                      </p>
                      {case_.tags && case_.tags.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                          {case_.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/case/${case_.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-600">لا توجد قضايا بعد</p>
                <button
                  onClick={() => router.push('/new-case')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  إنشاء قضية جديدة
                </button>
              </div>
            )}
          </div>
        </div>

        {/* القوالب */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">القوالب القانونية</h3>
          </div>
          <div className="p-6">
            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.content}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(template.updated_at).toLocaleDateString('ar-SA')}
                      </span>
                      <button
                        onClick={() => router.push(`/template/${template.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        استخدام
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-600">لا توجد قوالب بعد</p>
                <button
                  onClick={() => router.push('/new-template')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  إنشاء قالب جديد
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 