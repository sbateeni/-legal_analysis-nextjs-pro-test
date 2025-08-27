"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error('failed');
      window.location.href = '/login';
    } catch (err) {
      setError('تعذر إنشاء الحساب. تأكد من البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', animation: 'fadeInUp 0.6s ease-out' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>إنشاء حساب</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          الاسم
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #c7d2fe', marginTop: 6 }} />
        </label>
        <label>
          البريد الإلكتروني
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #c7d2fe', marginTop: 6 }} />
        </label>
        <label>
          كلمة المرور
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #c7d2fe', marginTop: 6 }} />
        </label>

        {error && (
          <div className="alert" style={{ background: '#fff0f0', color: '#b91c1c', padding: '10px 12px', borderRadius: 10 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700 }}>
          {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        لديك حساب؟{' '}<Link href="/login" style={{ color: '#4f46e5', fontWeight: 700 }}>تسجيل الدخول</Link>
      </div>
    </div>
  );
}


