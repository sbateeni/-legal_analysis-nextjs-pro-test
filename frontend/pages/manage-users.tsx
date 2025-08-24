import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getUsersByOffice, createUser, updateUser, deactivateUser } from '../utils/saas-service'
import type { User, CreateUser } from '../types/saas'

export default function ManageUsers() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [newUser, setNewUser] = useState<CreateUser>({
    office_id: '',
    email: '',
    full_name: '',
    role: 'user',
    is_active: true
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // في الوقت الحالي، نستخدم office_id ثابت للاختبار
      const officeId = 'test-office-id'
      const usersData = await getUsersByOffice(officeId)
      setUsers(usersData)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // في الوقت الحالي، نستخدم office_id ثابت للاختبار
      const officeId = 'test-office-id'
      const userData = { ...newUser, office_id: officeId }
      
      await createUser(userData)
      setMessage('تم إضافة المستخدم بنجاح')
      setShowAddForm(false)
      setNewUser({
        office_id: '',
        email: '',
        full_name: '',
        role: 'user',
        is_active: true
      })
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إضافة المستخدم')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await updateUser(editingUser.id, {
        full_name: editingUser.full_name,
        role: editingUser.role,
        is_active: editingUser.is_active
      })
      
      setMessage('تم تحديث المستخدم بنجاح')
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تحديث المستخدم')
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟')) return

    try {
      await deactivateUser(userId)
      setMessage('تم إلغاء تفعيل المستخدم بنجاح')
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إلغاء تفعيل المستخدم')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير'
      case 'manager': return 'مشرف'
      case 'user': return 'مستخدم'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المستخدمين...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
              <p className="text-gray-600">إدارة مستخدمي المكتب</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                العودة للوحة التحكم
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                إضافة مستخدم جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded text-green-700">
            {message}
          </div>
        )}

        {/* نموذج إضافة مستخدم جديد */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة مستخدم جديد</h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.full_name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="اسم المستخدم الكامل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">مستخدم</option>
                  <option value="manager">مشرف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  إضافة المستخدم
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* قائمة المستخدمين */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              المستخدمين ({users.length})
            </h3>
          </div>
          
          <div className="p-6">
            {users.length > 0 ? (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.full_name.charAt(0)}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                            {getRoleText(user.role)}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        تعديل
                      </button>
                      
                      {user.is_active && user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          إلغاء التفعيل
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <p className="text-gray-600">لا يوجد مستخدمين بعد</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  إضافة أول مستخدم
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal تعديل المستخدم */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تعديل المستخدم</h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">مستخدم</option>
                  <option value="manager">مشرف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  نشط
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  حفظ التغييرات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 