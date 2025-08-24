// أنواع البيانات لنظام SaaS للمكاتب القانونية

export interface Office {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  address?: string
  phone?: string
  email: string
  subscription_plan: 'free' | 'professional' | 'enterprise'
  max_users: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  office_id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'user'
  avatar_url?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface LegalCase {
  id: string
  office_id: string
  name: string
  created_at: string
  tags?: string[]
  user_id?: string
}

export interface AnalysisStage {
  id: string
  office_id: string
  case_id: string
  stage_index: number
  stage: string
  input: string
  output: string
  date: string
}

export interface LegalTemplate {
  id: string
  office_id: string
  name: string
  content: string
  created_at: string
  updated_at: string
  user_id?: string
}

// أنواع للإنشاء (بدون ID)
export type CreateOffice = Omit<Office, 'id' | 'created_at' | 'updated_at'>
export type CreateUser = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type CreateLegalCase = Omit<LegalCase, 'id' | 'created_at'>
export type CreateAnalysisStage = Omit<AnalysisStage, 'id' | 'date'>
export type CreateLegalTemplate = Omit<LegalTemplate, 'id' | 'created_at' | 'updated_at'>

// أنواع للتحديث
export type UpdateOffice = Partial<Omit<Office, 'id' | 'created_at' | 'updated_at'>>
export type UpdateUser = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
export type UpdateLegalCase = Partial<Omit<LegalCase, 'id' | 'created_at'>>
export type UpdateAnalysisStage = Partial<Omit<AnalysisStage, 'id' | 'date'>>
export type UpdateLegalTemplate = Partial<Omit<LegalTemplate, 'id' | 'created_at' | 'updated_at'>>

// أنواع للاستعلامات
export interface OfficeStats {
  total_users: number
  total_cases: number
  total_templates: number
  active_users: number
}

export interface UserWithOffice extends User {
  office: Office
}

export interface LegalCaseWithStages extends LegalCase {
  stages: AnalysisStage[]
  user?: User
}

// أنواع للمصادقة
export interface AuthUser {
  id: string
  email: string
  office_id: string
  role: 'admin' | 'manager' | 'user'
  full_name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterOfficeData {
  office: CreateOffice
  admin: {
    email: string
    password: string
    full_name: string
  }
}

export interface InviteUserData {
  email: string
  full_name: string
  role: 'manager' | 'user'
}

// أنواع للخطط
export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  max_users: number
  max_cases: number
  features: string[]
  is_popular?: boolean
}

// أنواع للإشعارات
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
}

// أنواع للتقارير
export interface CaseReport {
  total_cases: number
  cases_by_month: Array<{
    month: string
    count: number
  }>
  cases_by_type: Array<{
    type: string
    count: number
  }>
  recent_cases: LegalCase[]
}

export interface UserReport {
  total_users: number
  active_users: number
  users_by_role: Array<{
    role: string
    count: number
  }>
  recent_users: User[]
} 