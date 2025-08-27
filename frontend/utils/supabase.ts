import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// التحقق من وجود المتغيرات البيئية
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ متغيرات Supabase البيئية غير موجودة!')
  console.warn('يرجى إنشاء ملف .env.local مع:')
  console.warn('NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
}

let supabase: any
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    const msg = 'Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    const fail = () => { throw new Error(msg) }
    supabase = {
      from: fail,
      rpc: fail,
      auth: { signInWithPassword: fail, signUp: fail, getUser: fail }
    }
  }
} catch {
  const msg = 'Supabase client initialization failed. Check your env vars.'
  const fail = () => { throw new Error(msg) }
  supabase = { from: fail, rpc: fail }
}

export { supabase }

// أنواع البيانات المتوافقة مع Supabase
export interface AnalysisStage {
  id: string
  stage_index: number
  stage: string
  input: string
  output: string
  date: string
  case_id: string
}

export interface LegalCase {
  id: string
  name: string
  created_at: string
  tags?: string[]
  user_id?: string
}

export interface LegalTemplate {
  id: string
  name: string
  content: string
  created_at: string
  updated_at: string
  user_id?: string
}

// دوال CRUD للقضايا
export async function getAllCases(): Promise<LegalCase[]> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addCase(newCase: Omit<LegalCase, 'id'>): Promise<LegalCase> {
  const { data, error } = await supabase
    .from('legal_cases')
    .insert([newCase])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCase(updatedCase: LegalCase): Promise<LegalCase> {
  const { data, error } = await supabase
    .from('legal_cases')
    .update(updatedCase)
    .eq('id', updatedCase.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCase(caseId: string): Promise<void> {
  const { error } = await supabase
    .from('legal_cases')
    .delete()
    .eq('id', caseId)
  
  if (error) throw error
}

export async function getCaseById(caseId: string): Promise<LegalCase | null> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('id', caseId)
    .single()
  
  if (error) throw error
  return data
}

// دوال إدارة المراحل
export async function getStagesByCaseId(caseId: string): Promise<AnalysisStage[]> {
  const { data, error } = await supabase
    .from('analysis_stages')
    .select('*')
    .eq('case_id', caseId)
    .order('stage_index', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function addStage(stage: Omit<AnalysisStage, 'id'>): Promise<AnalysisStage> {
  const { data, error } = await supabase
    .from('analysis_stages')
    .insert([stage])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateStage(stage: AnalysisStage): Promise<AnalysisStage> {
  const { data, error } = await supabase
    .from('analysis_stages')
    .update(stage)
    .eq('id', stage.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteStage(stageId: string): Promise<void> {
  const { error } = await supabase
    .from('analysis_stages')
    .delete()
    .eq('id', stageId)
  
  if (error) throw error
}

// دوال القوالب
export async function getAllTemplates(): Promise<LegalTemplate[]> {
  const { data, error } = await supabase
    .from('legal_templates')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addTemplate(template: Omit<LegalTemplate, 'id'>): Promise<LegalTemplate> {
  const { data, error } = await supabase
    .from('legal_templates')
    .insert([template])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTemplate(template: LegalTemplate): Promise<LegalTemplate> {
  const { data, error } = await supabase
    .from('legal_templates')
    .update(template)
    .eq('id', template.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('legal_templates')
    .delete()
    .eq('id', templateId)
  
  if (error) throw error
} 