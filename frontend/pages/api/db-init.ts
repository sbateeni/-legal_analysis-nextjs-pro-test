import type { NextApiRequest, NextApiResponse } from 'next'
import { readFileSync } from 'fs'
import path from 'path'

// نستخدم اتصال Postgres المباشر لتنفيذ سكربت تهيئة قاعدة البيانات مرة واحدة
// المتغيرات المطلوبة على الخادم (Vercel): POSTGRES_URL_NON_POOLING

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
    if (!databaseUrl) {
      return res.status(500).json({ error: 'Database URL is missing (POSTGRES_URL_NON_POOLING)' })
    }

    // تحميل ملف السكربت SQL من الريبو
    const schemaFilePath = path.join(process.cwd(), 'supabase-schema.sql')
    const sql = readFileSync(schemaFilePath, 'utf8')

    // استدعاء قاعدة البيانات مباشرة عبر pg
    const { Client } = await import('pg')
    const client = new Client({ connectionString: databaseUrl })

    await client.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      await client.end()
    }

    return res.status(200).json({ success: true, message: 'Database initialized successfully' })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Init failed' })
  }
}


