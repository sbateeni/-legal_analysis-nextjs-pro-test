"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Placeholder until NextAuth is wired
      await new Promise((r) => setTimeout(r, 600));
      window.location.href = '/';
    } catch (err) {
      setError('تعذر تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', animation: 'fadeInUp 0.6s ease-out' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>تسجيل الدخول</h1>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: 24 }}>سجّل دخولك للمتابعة</p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          البريد الإلكتروني
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #c7d2fe',
              marginTop: 6, background: '#fff', outline: 'none'
            }}
          />
        </label>
        <label>
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #c7d2fe',
              marginTop: 6, background: '#fff', outline: 'none'
            }}
          />
        </label>

        {error && (
          <div className="alert" style={{ background: '#fff0f0', color: '#b91c1c', padding: '10px 12px', borderRadius: 10 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px 16px', fontWeight: 700
          }}
        >
          {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        ليس لديك حساب؟{' '}
        <Link href="/signup" style={{ color: '#4f46e5', fontWeight: 700 }}>إنشاء حساب</Link>
      </div>
    </div>
  );
}


