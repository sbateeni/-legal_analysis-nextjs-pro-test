# 🚨 حل سريع لمشكلة Supabase

## المشكلة الحالية
```
Error: supabaseUrl is required.
```

## السبب
المتغيرات البيئية لـ Supabase غير موجودة في ملف `.env.local`

## الحل السريع

### 1. إنشاء ملف .env.local
في مجلد `frontend`، أنشئ ملف جديد باسم `.env.local` وأضف:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google AI API Key (اختياري)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. الحصول على قيم Supabase

#### أ. إنشاء مشروع Supabase:
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. انقر على "New Project"
4. اختر اسم للمشروع
5. اختر كلمة مرور قوية
6. اختر المنطقة الأقرب لك

#### ب. الحصول على المفاتيح:
1. في لوحة تحكم Supabase، اذهب إلى **Settings > API**
2. انسخ `Project URL` (مثال: `https://abc123.supabase.co`)
3. انسخ `anon public` key (مفتاح طويل)

#### ج. تحديث .env.local:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. إنشاء قاعدة البيانات
1. في Supabase، اذهب إلى **SQL Editor**
2. انسخ محتوى ملف `supabase-schema.sql`
3. اضغط على **Run**

### 4. إعادة تشغيل التطبيق
```bash
# أوقف التطبيق (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

## اختبار الحل

### 1. فتح Console المتصفح
- اضغط `F12`
- اذهب إلى تبويب `Console`

### 2. تشغيل الاختبار
```javascript
// نسخ والصق هذا الكود
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ موجود' : '❌ مفقود');
```

### 3. فحص مؤشر الاتصال
- يجب أن يظهر مؤشر أخضر في Header
- أو انقر على "إعداد" للذهاب لصفحة الاختبار

## إذا استمرت المشكلة

### 1. تحقق من اسم الملف
- يجب أن يكون `.env.local` (وليس `.env.local.txt`)

### 2. تحقق من الموقع
- يجب أن يكون في مجلد `frontend` (نفس مستوى `package.json`)

### 3. تحقق من التنسيق
- لا تضع مسافات حول `=`
- لا تضع علامات اقتباس حول القيم
- تأكد من عدم وجود أسطر فارغة في النهاية

### 4. إعادة بناء التطبيق
```bash
# حذف مجلد .next
rm -rf .next

# إعادة تثبيت الحزم
npm install

# إعادة تشغيل
npm run dev
```

## مثال ملف .env.local صحيح

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM5MjQ5NjAwLCJleHAiOjE5NTQ4MjU2MDB9.example
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyC...example
```

## مساعدة إضافية

- صفحة الاختبار: `/test-connection`
- دليل الإعداد الكامل: `SUPABASE_SETUP.md`
- دليل الاختبار السريع: `QUICK_TEST_GUIDE.md` 