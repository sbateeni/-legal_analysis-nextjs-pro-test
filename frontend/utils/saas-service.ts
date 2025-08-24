import { supabase } from './supabase-config'
import type { 
  Office, User, LegalCase, AnalysisStage, LegalTemplate,
  CreateOffice, CreateUser, CreateLegalCase, CreateAnalysisStage, CreateLegalTemplate,
  UpdateOffice, UpdateUser, UpdateLegalCase, UpdateAnalysisStage, UpdateLegalTemplate,
  OfficeStats, UserWithOffice, LegalCaseWithStages
} from '../types/saas'

// ===== خدمات المكاتب =====

export async function createOffice(officeData: CreateOffice): Promise<Office> {
  const { data, error } = await supabase
    .from('offices')
    .insert([officeData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getOfficeBySlug(slug: string): Promise<Office | null> {
  const { data, error } = await supabase
    .from('offices')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

export async function getOfficeById(id: string): Promise<Office | null> {
  const { data, error } = await supabase
    .from('offices')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function updateOffice(id: string, updates: UpdateOffice): Promise<Office> {
  const { data, error } = await supabase
    .from('offices')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getOfficeStats(officeId: string): Promise<OfficeStats> {
  const { data, error } = await supabase
    .rpc('get_office_stats', { office_id: officeId })
  
  if (error) throw error
  return data
}

// ===== خدمات المستخدمين =====

export async function createUser(userData: CreateUser): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUsersByOffice(officeId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('office_id', officeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUser(id: string, updates: UpdateUser): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deactivateUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', id)
  
  if (error) throw error
}

export async function getUserWithOffice(id: string): Promise<UserWithOffice | null> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      office:offices(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// ===== خدمات القضايا =====

export async function createCase(caseData: CreateLegalCase): Promise<LegalCase> {
  const { data, error } = await supabase
    .from('legal_cases')
    .insert([caseData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getCasesByOffice(officeId: string): Promise<LegalCase[]> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('office_id', officeId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getCaseWithStages(caseId: string): Promise<LegalCaseWithStages | null> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select(`
      *,
      stages:analysis_stages(*)
    `)
    .eq('id', caseId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateCase(id: string, updates: UpdateLegalCase): Promise<LegalCase> {
  const { data, error } = await supabase
    .from('legal_cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabase
    .from('legal_cases')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ===== خدمات المراحل =====

export async function createStage(stageData: CreateAnalysisStage): Promise<AnalysisStage> {
  const { data, error } = await supabase
    .from('analysis_stages')
    .insert([stageData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getStagesByCase(caseId: string): Promise<AnalysisStage[]> {
  const { data, error } = await supabase
    .from('analysis_stages')
    .select('*')
    .eq('case_id', caseId)
    .order('stage_index', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function updateStage(id: string, updates: UpdateAnalysisStage): Promise<AnalysisStage> {
  const { data, error } = await supabase
    .from('analysis_stages')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteStage(id: string): Promise<void> {
  const { error } = await supabase
    .from('analysis_stages')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ===== خدمات القوالب =====

export async function createTemplate(templateData: CreateLegalTemplate): Promise<LegalTemplate> {
  const { data, error } = await supabase
    .from('legal_templates')
    .insert([templateData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTemplatesByOffice(officeId: string): Promise<LegalTemplate[]> {
  const { data, error } = await supabase
    .from('legal_templates')
    .select('*')
    .eq('office_id', officeId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function updateTemplate(id: string, updates: UpdateLegalTemplate): Promise<LegalTemplate> {
  const { data, error } = await supabase
    .from('legal_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('legal_templates')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ===== خدمات البحث =====

export async function searchCases(officeId: string, query: string): Promise<LegalCase[]> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('office_id', officeId)
    .or(`name.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function searchTemplates(officeId: string, query: string): Promise<LegalTemplate[]> {
  const { data, error } = await supabase
    .from('legal_templates')
    .select('*')
    .eq('office_id', officeId)
    .or(`name.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// ===== خدمات الإحصائيات =====

export async function getOfficeAnalytics(officeId: string): Promise<{
  totalCases: number
  totalTemplates: number
  totalUsers: number
  casesThisMonth: number
  recentActivity: any[]
}> {
  // إجمالي القضايا
  const { count: totalCases } = await supabase
    .from('legal_cases')
    .select('*', { count: 'exact', head: true })
    .eq('office_id', officeId)
  
  // إجمالي القوالب
  const { count: totalTemplates } = await supabase
    .from('legal_templates')
    .select('*', { count: 'exact', head: true })
    .eq('office_id', officeId)
  
  // إجمالي المستخدمين
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('office_id', officeId)
    .eq('is_active', true)
  
  // القضايا هذا الشهر
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  
  const { count: casesThisMonth } = await supabase
    .from('legal_cases')
    .select('*', { count: 'exact', head: true })
    .eq('office_id', officeId)
    .gte('created_at', thisMonth.toISOString())
  
  // النشاط الأخير
  const { data: recentActivity } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('office_id', officeId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return {
    totalCases: totalCases || 0,
    totalTemplates: totalTemplates || 0,
    totalUsers: totalUsers || 0,
    casesThisMonth: casesThisMonth || 0,
    recentActivity: recentActivity || []
  }
} 