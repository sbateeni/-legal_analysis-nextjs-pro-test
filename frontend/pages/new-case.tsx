import { useState } from 'react'
import { useRouter } from 'next/router'
import { createCase } from '../utils/saas-service'
import type { CreateLegalCase } from '../types/saas'

export default function NewCase() {
  const router = useRouter()
  const [caseData, setCaseData] = useState<CreateLegalCase>({
    office_id: '',
    name: '',
    tags: [],
    user_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newTag, setNewTag] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!caseData.name.trim()) {
      setError('يرجى إدخال اسم القضية')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // في الوقت الحالي، نستخدم office_id ثابت للاختبار
      const officeId = 'test-office-id'
      const caseToCreate = { ...caseData, office_id: officeId }
      
      await createCase(caseToCreate)
      
      // توجيه المستخدم للوحة التحكم
      router.push('/dashboard')
      
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إنشاء القضية')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !caseData.tags?.includes(newTag.trim())) {
      setCaseData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCaseData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إنشاء قضية جديدة</h1>
              <p className="text-gray-600">أضف قضية قانونية جديدة للمكتب</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم القضية */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                اسم القضية *
              </label>
              <input
                id="name"
                type="text"
                required
                value={caseData.name}
                onChange={(e) => setCaseData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسم القضية"
              />
            </div>

            {/* العلامات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العلامات
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أضف علامة جديدة"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  إضافة
                </button>
              </div>
              
              {/* عرض العلامات المضافة */}
              {caseData.tags && caseData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {caseData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-1">
                اضغط Enter أو زر الإضافة لإضافة علامة جديدة
              </p>
            </div>

            {/* وصف القضية */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                وصف القضية
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="وصف مختصر عن القضية..."
              />
            </div>

            {/* نوع القضية */}
            <div>
              <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-2">
                نوع القضية
              </label>
              <select
                id="caseType"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">اختر نوع القضية</option>
                <option value="civil">مدني</option>
                <option value="criminal">جنائي</option>
                <option value="commercial">تجاري</option>
                <option value="labor">عمالي</option>
                <option value="family">أحوال شخصية</option>
                <option value="administrative">إداري</option>
                <option value="constitutional">دستوري</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            {/* أولوية القضية */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                أولوية القضية
              </label>
              <select
                id="priority"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">منخفضة</option>
                <option value="medium" selected>متوسطة</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>

            {/* تاريخ الجلسة الأولى */}
            <div>
              <label htmlFor="firstHearing" className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الجلسة الأولى
              </label>
              <input
                id="firstHearing"
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* المحكمة */}
            <div>
              <label htmlFor="court" className="block text-sm font-medium text-gray-700 mb-2">
                المحكمة
              </label>
              <input
                id="court"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اسم المحكمة"
              />
            </div>

            {/* رقم القضية */}
            <div>
              <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                رقم القضية
              </label>
              <input
                id="caseNumber"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="رقم القضية في المحكمة"
              />
            </div>

            {/* ملاحظات إضافية */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700">
                {error}
              </div>
            )}

            {/* أزرار الإجراءات */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                إلغاء
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء القضية'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 