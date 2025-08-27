import { createClient, Client } from '@libsql/client'

const tursoUrl = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL
const tursoToken = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN

if (!tursoUrl || !tursoToken) {
  // لا نرمي خطأً وقت الاستيراد لتجنّب كسر الواجهة
  console.warn('⚠️ متغيرات Turso غير موجودة. أضف TURSO_DATABASE_URL و TURSO_AUTH_TOKEN')
}

let turso: Client | null = null
try {
  if (tursoUrl && tursoToken) {
    turso = createClient({ url: tursoUrl, authToken: tursoToken })
  }
} catch (e) {
  console.warn('⚠️ فشل إنشاء عميل Turso:', (e as Error).message)
  turso = null
}

export { turso }

