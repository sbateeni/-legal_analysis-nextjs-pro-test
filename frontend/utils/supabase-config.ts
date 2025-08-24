import { createClient } from '@supabase/supabase-js'

// تكوين Supabase مع إعدادات متقدمة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// التحقق من وجود المتغيرات البيئية
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ متغيرات Supabase البيئية غير موجودة!')
  console.warn('يرجى إنشاء ملف .env.local مع:')
  console.warn('NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
}

// إنشاء عميل Supabase مع إعدادات مخصصة
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'legal-analysis-app'
    }
  }
})

// دالة للتحقق من حالة الاتصال
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('legal_cases')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}

// دالة للحصول على معلومات المستخدم الحالي
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

// دالة لتسجيل الدخول
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// دالة لتسجيل الخروج
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// دالة للتسجيل
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

// دالة لإعادة تعيين كلمة المرور
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  } catch (error) {
    console.error('Password reset error:', error)
    throw error
  }
}

// دالة لتحديث كلمة المرور
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
  } catch (error) {
    console.error('Password update error:', error)
    throw error
  }
}

// دالة لمراقبة حالة المصادقة
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// دالة للحصول على الجلسة الحالية
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
} 