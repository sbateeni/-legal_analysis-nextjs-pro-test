"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './signup.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (password.length < 8) {
      setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل');
      return false;
    }
    if (!/\d/.test(password)) {
      setError('يجب أن تحتوي كلمة المرور على رقم واحد على الأقل');
      return false;
    }
    return true;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      // تحسين معالجة الاستجابة
      let data;
      try {
        // محاولة تحليل الاستجابة كـ JSON
        data = await res.json();
      } catch (jsonError) {
        // إذا فشل تحليل JSON، فقد يكون الخادم أرجع HTML أو نص عادي
        console.error('فشل تحليل استجابة الخادم كـ JSON:', jsonError);
        throw new Error('خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      }
      
      if (!res.ok) {
        if (data.error === 'email_in_use') {
          throw new Error('البريد الإلكتروني مستخدم بالفعل');
        } else if (data.message) {
          throw new Error(data.message);
        }
        throw new Error('تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى');
      }
      
      window.location.href = '/login';
    } catch (err) {
      console.error('خطأ في إنشاء الحساب:', err);
      setError(err instanceof Error ? err.message : 'تعذر إنشاء الحساب. تأكد من البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>إنشاء حساب</h1>
      <form onSubmit={onSubmit} className={styles.form}>
        <div>
          <label className={styles.label}>الاسم</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسمك"
            required
          />
        </div>
        <div>
          <label className={styles.label}>البريد الإلكتروني</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            required
          />
        </div>
        <div>
          <label className={styles.label}>كلمة المرور</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            minLength={8}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
        </button>
      </form>

      <div className={styles.loginLink}>
        لديك حساب؟{' '}<Link href="/login">تسجيل الدخول</Link>
      </div>
    </div>
  );
}


