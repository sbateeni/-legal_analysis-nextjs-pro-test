"use client";
import React, { useEffect, useState } from 'react';

type Org = { id: string; name: string; slug: string };

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<string>('loading');

  useEffect(() => {
    fetch('/api/orgs')
      .then(async (r) => {
        if (!r.ok) throw new Error('failed');
        return r.json();
      })
      .then((data) => setOrgs(data.orgs as Org[]))
      .catch(() => setError('فشل تحميل المؤسسات'))
      .finally(() => setLoading(false));
    fetch('/api/billing/status').then(async (r) => {
      if (!r.ok) return setSubStatus('none');
      const d = await r.json();
      setSubStatus(d.status || 'none');
    }).catch(() => setSubStatus('none'));
  }, []);

  if (loading) return <div style={{ padding: 20 }}>جارٍ التحميل...</div>;
  if (error) return <div style={{ padding: 20 }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 12 }}>لوحة التحكم</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>إدارة المؤسسات والاشتراكات والاستخدام.</p>
      <div style={{ marginBottom: 16 }}>
        الحالة الحالية للاشتراك: <strong>{subStatus}</strong>
        {subStatus !== 'active' && (
          <button
            onClick={async () => {
              const r = await fetch('/api/billing/checkout', { method: 'POST' });
              const d = await r.json();
              if (d.url) window.location.href = d.url as string;
            }}
            style={{ marginInlineStart: 10, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 700 }}
          >
            اشترك الآن
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orgs.map((o) => (
          <div key={o.id} className="card" style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 800 }}>{o.name}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>/{o.slug}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


