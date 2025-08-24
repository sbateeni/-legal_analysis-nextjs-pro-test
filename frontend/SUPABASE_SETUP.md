# دليل إعداد Supabase مع Vercel

## الخطوات المطلوبة لربط التطبيق مع Supabase

### 1. إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. انقر على "New Project"
4. اختر اسم للمشروع (مثال: `legal-analysis-app`)
5. اختر كلمة مرور قوية لقاعدة البيانات
6. اختر المنطقة الأقرب لك
7. انتظر حتى يتم إنشاء المشروع

### 2. الحصول على مفاتيح API

1. في لوحة تحكم Supabase، اذهب إلى Settings > API
2. انسخ `Project URL` و `anon public` key
3. احفظ هذه المفاتيح في مكان آمن

### 3. إنشاء قاعدة البيانات

1. في لوحة تحكم Supabase، اذهب إلى SQL Editor
2. انسخ محتوى ملف `supabase-schema.sql`
3. اضغط على "Run" لتنفيذ الأوامر
4. تأكد من إنشاء الجداول والسياسات بنجاح

### 4. إعداد متغيرات البيئة

#### في التطوير المحلي:
1. انسخ ملف `env.example` إلى `.env.local`
2. أضف مفاتيح Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### في Vercel:
1. اذهب إلى مشروعك في [vercel.com](https://vercel.com)
2. اذهب إلى Settings > Environment Variables
3. أضف المتغيرات التالية:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
```

### 5. اختبار الاتصال

1. شغل التطبيق محلياً: `npm run dev`
2. تأكد من عدم وجود أخطاء في Console
3. جرب إنشاء قضية جديدة
4. تحقق من حفظ البيانات في Supabase

### 6. نشر التطبيق على Vercel

1. اربط مشروعك بـ GitHub
2. تأكد من إعداد متغيرات البيئة في Vercel
3. اضغط على "Deploy"
4. انتظر حتى يكتمل النشر

## هيكل قاعدة البيانات

### جدول `legal_cases`
- `id`: معرف فريد للقضية
- `name`: اسم القضية
- `created_at`: تاريخ الإنشاء
- `tags`: مصفوفة من العلامات
- `user_id`: معرف المستخدم (مرتبط بـ auth.users)

### جدول `analysis_stages`
- `id`: معرف فريد للمرحلة
- `case_id`: معرف القضية (مرتبط بـ legal_cases)
- `stage_index`: ترتيب المرحلة
- `stage`: نوع المرحلة
- `input`: المدخلات
- `output`: المخرجات
- `date`: تاريخ المرحلة

### جدول `legal_templates`
- `id`: معرف فريد للقالب
- `name`: اسم القالب
- `content`: محتوى القالب
- `created_at`: تاريخ الإنشاء
- `updated_at`: تاريخ التحديث
- `user_id`: معرف المستخدم

## ميزات الأمان

### Row Level Security (RLS)
- كل مستخدم يمكنه الوصول فقط لبياناته
- البيانات محمية على مستوى الصف
- لا يمكن للمستخدمين الوصول لبيانات الآخرين

### سياسات الوصول
- `SELECT`: عرض البيانات الخاصة بالمستخدم
- `INSERT`: إضافة بيانات جديدة للمستخدم
- `UPDATE`: تحديث البيانات الخاصة بالمستخدم
- `DELETE`: حذف البيانات الخاصة بالمستخدم

## استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال**: تأكد من صحة URL و API Key
2. **خطأ في RLS**: تأكد من تسجيل دخول المستخدم
3. **خطأ في الجداول**: تأكد من تنفيذ schema.sql بنجاح

### نصائح للتطوير:

1. استخدم Supabase Dashboard لمراقبة الطلبات
2. تحقق من Console في المتصفح للأخطاء
3. استخدم Network tab لمراقبة API calls

## روابط مفيدة

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs) 