import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'libsql://database-fuchsia-river-vercel-icfg-84tyci2xonbfgcsm7a2gtkss.aws-us-east-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTYyOTY0MTIsImlkIjoiYzU3MWZjYzctOWM3NS00ZDY4LWFlZWQtODdiODc4MjgyYWQyIiwicmlkIjoiYjlmY2VmZTUtNGYzNC00MmMwLTk3MmEtMTcyNWYzNmJmMTgxIn0.Sy71bMWOP_kzf3t_aZzl5aVWNIVGA_k-obDf_cQQ0lJ47eEgCsTJzyr8ebPE6Ol5ep-5mBIj1e7c-ftHm3yQAw';

export const tursoClient = createClient({
  url,
  authToken
});

// أنواع البيانات
export interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

export interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  tags?: string[];
}

export interface LegalTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// دوال CRUD للقضايا
export async function getAllCases(): Promise<LegalCase[]> {
  const result = await tursoClient.execute('SELECT * FROM legal_cases');
  return result.rows.map(row => ({
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    stages: JSON.parse(row.stages as string) as AnalysisStage[],
    tags: row.tags ? JSON.parse(row.tags as string) as string[] : undefined
  }));
}

export async function saveCase(legalCase: LegalCase) {
  await tursoClient.execute({
    sql: 'INSERT INTO legal_cases (id, name, created_at, stages, tags) VALUES (?, ?, ?, ?, ?)',
    args: [legalCase.id, legalCase.name, legalCase.createdAt, JSON.stringify(legalCase.stages), JSON.stringify(legalCase.tags)]
  });
}

export async function updateCase(legalCase: LegalCase) {
  await tursoClient.execute({
    sql: 'UPDATE legal_cases SET name = ?, stages = ?, tags = ? WHERE id = ?',
    args: [legalCase.name, JSON.stringify(legalCase.stages), JSON.stringify(legalCase.tags), legalCase.id]
  });
}

export async function deleteCase(id: string) {
  await tursoClient.execute({
    sql: 'DELETE FROM legal_cases WHERE id = ?',
    args: [id]
  });
}

// دوال CRUD للقوالب
export async function getAllTemplates(): Promise<LegalTemplate[]> {
  const result = await tursoClient.execute('SELECT * FROM legal_templates');
  return result.rows.map(row => ({
    id: row.id as string,
    name: row.name as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  }));
}

export async function saveTemplate(template: LegalTemplate) {
  await tursoClient.execute({
    sql: 'INSERT INTO legal_templates (id, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    args: [template.id, template.name, template.content, template.createdAt, template.updatedAt]
  });
}

export async function updateTemplate(template: LegalTemplate) {
  await tursoClient.execute({
    sql: 'UPDATE legal_templates SET name = ?, content = ?, updated_at = ? WHERE id = ?',
    args: [template.name, template.content, template.updatedAt, template.id]
  });
}

export async function deleteTemplate(id: string) {
  await tursoClient.execute({
    sql: 'DELETE FROM legal_templates WHERE id = ?',
    args: [id]
  });
}