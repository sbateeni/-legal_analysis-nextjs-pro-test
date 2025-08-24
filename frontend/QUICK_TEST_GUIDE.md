# دليل اختبار الاتصال السريع مع Supabase

## 🚀 اختبار سريع من Console

### 1. فتح Console المتصفح
- اضغط `F12` أو `Ctrl+Shift+I`
- اذهب إلى تبويب `Console`

### 2. استيراد دوال الاختبار
```javascript
// نسخ والصق هذا الكود في Console
import('./utils/quick-test.js').then(module => {
  window.quickTest = module.quickConnectionTest;
  window.comprehensiveTest = module.comprehensiveTest;
  window.logResults = module.logTestResults;
  console.log('✅ تم تحميل دوال الاختبار');
});
```

### 3. تشغيل الاختبار السريع
```javascript
// اختبار سريع
quickTest().then(result => {
  console.log('نتيجة الاختبار:', result);
});

// اختبار شامل
comprehensiveTest().then(results => {
  logResults(results);
});
```

## 🔍 اختبار من الصفحة

### 1. صفحة الاختبار
- اذهب إلى `/test-connection`
- ستجد صفحة اختبار شاملة

### 2. مكون حالة الاتصال
- أضف `<ConnectionStatus />` في أي صفحة
- يعرض حالة الاتصال في الوقت الفعلي

## 📊 مؤشرات النجاح

### ✅ الاتصال ناجح
```
✅ الاتصال الأساسي ناجح
✅ المستخدم موجود: user@example.com
✅ الجلسة نشطة
✅ تم قراءة 0 قضية
🎉 انتهى الاختبار السريع بنجاح!
```

### ❌ مشاكل شائعة

#### 1. خطأ في المتغيرات البيئية
```
❌ خطأ في الاتصال الأساسي: {
  message: "JWT secret is required"
}
```
**الحل**: تأكد من إعداد `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 2. خطأ في RLS
```
❌ خطأ في إنشاء قضية: {
  message: "new row violates row-level security policy"
}
```
**الحل**: تأكد من تنفيذ `supabase-schema.sql` في Supabase

#### 3. خطأ في الجداول
```
❌ خطأ في قراءة القضايا: {
  message: "relation \"legal_cases\" does not exist"
}
```
**الحل**: أنشئ الجداول باستخدام `supabase-schema.sql`

## 🛠️ أدوات إضافية

### 1. فحص المتغيرات البيئية
```javascript
// في Console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### 2. فحص عميل Supabase
```javascript
// في Console
import('./utils/supabase-config.js').then(module => {
  console.log('Supabase Client:', module.supabase);
});
```

### 3. اختبار الاتصال المباشر
```javascript
// في Console
import('./utils/supabase-config.js').then(module => {
  module.supabase
    .from('legal_cases')
    .select('*')
    .limit(1)
    .then(({data, error}) => {
      if (error) {
        console.error('خطأ:', error);
      } else {
        console.log('بيانات:', data);
      }
    });
});
```

## 📱 اختبار من الهاتف

### 1. فتح Console على الهاتف
- استخدم متصفح يدعم أدوات المطور
- أو استخدم [Eruda](https://github.com/liriliri/eruda)

### 2. اختبار الاتصال
```javascript
// نفس الأوامر السابقة
quickTest().then(console.log);
```

## 🔧 استكشاف الأخطاء

### 1. مشاكل الشبكة
- تأكد من اتصال الإنترنت
- تحقق من حظر Firewall
- جرب VPN إذا لزم الأمر

### 2. مشاكل Supabase
- تحقق من حالة الخدمة: [status.supabase.com](https://status.supabase.com)
- تأكد من عدم تجاوز حدود الاستخدام
- تحقق من إعدادات المشروع

### 3. مشاكل Vercel
- تحقق من متغيرات البيئة في Vercel
- أعد نشر التطبيق
- تحقق من سجلات النشر

## 📞 الحصول على المساعدة

### 1. سجلات Console
- انسخ جميع الأخطاء من Console
- أرسلها مع وصف المشكلة

### 2. معلومات النظام
```javascript
// جمع معلومات النظام
console.log({
  userAgent: navigator.userAgent,
  url: window.location.href,
  timestamp: new Date().toISOString(),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
});
```

### 3. روابط مفيدة
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Vercel Support](https://vercel.com/support) 