import { useState } from 'react'
import { useRouter } from 'next/router'
import { createOffice, createUser } from '../utils/saas-service'
import { initializeDatabase, checkDatabaseStructure } from '../utils/db-init'
import type { CreateOffice, CreateUser } from '../types/saas'

export default function RegisterOffice() {
  const router = useRouter()
  const [step, setStep] = useState<'office' | 'admin' | 'loading'>('office')
  const [officeData, setOfficeData] = useState<CreateOffice>({
    name: '',
    slug: '',
    description: '',
    email: '',
    subscription_plan: 'free',
    max_users: 5,
    is_active: true
  })
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleOfficeChange = (field: keyof CreateOffice, value: string | number) => {
    setOfficeData(prev => ({ ...prev, [field]: value }))
    
    // توليد slug تلقائياً من اسم المكتب
    if (field === 'name') {
      const slug = generateSlug(value as string)
      setOfficeData(prev => ({ ...prev, slug }))
    }
  }

  const handleOfficeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!officeData.name || !officeData.slug || !officeData.email) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    setStep('admin')
    setError('')
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adminData.password !== adminData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    if (adminData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. التحقق من هيكل قاعدة البيانات
      console.log('🔍 فحص هيكل قاعدة البيانات...')
      const dbStructure = await checkDatabaseStructure()
      
      // 2. إذا لم تكن قاعدة البيانات جاهزة، قم بتهيئتها
      if (!dbStructure.hasOfficeIdColumns || !dbStructure.hasOfficesTable) {
        console.log('🚀 قاعدة البيانات تحتاج تهيئة...')
        setMessage('جاري تهيئة قاعدة البيانات...')
        
        const initResult = await initializeDatabase()
        if (!initResult.success) {
          throw new Error(`فشل في تهيئة قاعدة البيانات: ${initResult.error}`)
        }
        
        setMessage('تم تهيئة قاعدة البيانات بنجاح!')
      }
      
      // 3. إنشاء المكتب
      setMessage('جاري إنشاء المكتب...')
      const office = await createOffice(officeData)
      
      // 4. إنشاء المستخدم الأول (admin)
      setMessage('جاري إنشاء حساب المدير...')
      const admin: CreateUser = {
        office_id: office.id,
        email: adminData.email,
        full_name: adminData.full_name,
        role: 'admin',
        is_active: true
      }
      
      await createUser(admin)
      
      setMessage('تم إنشاء المكتب بنجاح! جاري التوجيه...')
      
      // 5. توجيه المستخدم للوحة التحكم
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء المكتب')
      setLoading(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'خطة مجانية',
      price: 0,
      max_users: 5,
      features: ['5 مستخدمين', '100 قضية', 'قوالب أساسية', 'دعم أساسي']
    },
    {
      id: 'professional',
      name: 'خطة احترافية',
      price: 99,
      max_users: 20,
      features: ['20 مستخدم', 'قضايا غير محدودة', 'قوالب متقدمة', 'دعم فني', 'تقارير متقدمة']
    },
    {
      id: 'enterprise',
      name: 'خطة المؤسسات',
      price: 299,
      max_users: 100,
      features: ['100 مستخدم', 'ميزات متقدمة', 'دعم مخصص', 'API', 'تكامل مع أنظمة أخرى']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            إنشاء مكتب قانوني جديد
          </h1>
          <p className="text-xl text-gray-600">
            ابدأ رحلتك مع منصة التحليل القانوني الذكي
          </p>
        </div>

        {/* خطوات التسجيل */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'office' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-2 h-1 ${
              step === 'admin' ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {step === 'office' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">معلومات المكتب</h2>
            
            <form onSubmit={handleOfficeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المكتب *
                  </label>
                  <input
                    type="text"
                    value={officeData.name}
                    onChange={(e) => handleOfficeChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مكتب المحاماة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معرف المكتب *
                  </label>
                  <input
                    type="text"
                    value={officeData.slug}
                    onChange={(e) => handleOfficeChange('slug', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="office-name"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    سيتم استخدامه في رابط المكتب
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المكتب
                </label>
                <textarea
                  value={officeData.description}
                  onChange={(e) => handleOfficeChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="وصف مختصر عن المكتب..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={officeData.email}
                    onChange={(e) => handleOfficeChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="office@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خطة الاشتراك
                  </label>
                  <select
                    value={officeData.subscription_plan}
                    onChange={(e) => handleOfficeChange('subscription_plan', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price === 0 ? 'مجاناً' : `$${plan.price}/شهر`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-4 bg-green-100 border border-green-300 rounded text-green-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                التالي: إنشاء حساب المدير
              </button>
            </form>
          </div>
        )}

        {step === 'admin' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">حساب المدير</h2>
            
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={adminData.full_name}
                    onChange={(e) => setAdminData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="اسم المدير الكامل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@office.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="كلمة المرور"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور *
                  </label>
                  <input
                    type="password"
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="تأكيد كلمة المرور"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-4 bg-green-100 border border-green-300 rounded text-green-700">
                  {message}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep('office')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  رجوع
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء المكتب'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 