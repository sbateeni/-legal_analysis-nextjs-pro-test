import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور قصيرة جداً')
});

// تعريف نوع الاستجابة لضمان إرجاع JSON صحيح دائمًا
type ApiResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  details?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  // التأكد من أن نوع المحتوى هو JSON
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'طريقة غير مسموح بها' });
  }

  try {
    // التحقق من صحة البيانات المدخلة
    const { name, email, password } = signupSchema.parse(req.body);

    // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ 
        error: 'email_in_use', 
        message: 'البريد الإلكتروني مستخدم بالفعل' 
      });
    }

    // تشفير كلمة المرور
    const hash = await bcrypt.hash(password, 10);

    // إنشاء اسم مختصر للمؤسسة
    const slugBase = (name || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'org';
    const slug = slugBase.substring(0, 24);

    // إنشاء المستخدم والمؤسسة في معاملة واحدة
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ 
          data: { 
            email, 
            name: name || null, 
            passwordHash: hash 
          } 
        });

        const existsOrg = await tx.organization.findUnique({ where: { slug } });
        const finalSlug = existsOrg ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

        await tx.organization.create({ 
          data: { 
            name: name || 'مؤسستي', 
            slug: finalSlug, 
            memberships: { 
              create: { 
                userId: user.id, 
                role: 'OWNER' 
              } 
            } 
          } 
        });
      });

      return res.status(201).json({ 
        ok: true, 
        message: 'تم إنشاء الحساب بنجاح' 
      });
    } catch (error) {
      console.error('Database transaction error:', error);
      return res.status(500).json({ 
        error: 'server_error', 
        message: 'حدث خطأ أثناء إنشاء الحساب' 
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'validation_error',
        message: error.errors[0].message || 'بيانات غير صالحة',
        details: error.errors
      });
    }
    
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'server_error',
      message: 'حدث خطأ أثناء إنشاء الحساب'
    });
  }
}


