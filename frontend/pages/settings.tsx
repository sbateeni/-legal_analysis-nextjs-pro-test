import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';
import { set as idbSet } from 'idb-keyval';
import { saveApiKey, loadApiKey, getAllCases, saveAllCases, clearAllCases } from '../utils/db';

export default function Settings() {
  const { theme, darkMode, setDarkMode } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    loadApiKey().then(val => setApiKey(val || '')); 
  }, []);

  const handleSaveKey = async () => {
    setSaving(true);
    try {
      await saveApiKey(apiKey.trim());
      // توافق مع إصدارات سابقة: حفظ نسخة في localStorage إن لزم
      try { localStorage.setItem('gemini_api_key', apiKey.trim()); } catch {}
      setStatus('تم حفظ مفتاح API بنجاح.');
      setTimeout(() => setStatus(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const cases = await getAllCases();
    const blob = new Blob([JSON.stringify(cases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal_cases.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(ev) {
      if (typeof ev.target?.result === 'string') {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            await saveAllCases(imported);
            setStatus('تم استيراد القضايا بنجاح.');
            setTimeout(() => setStatus(null), 2000);
          } else {
            alert('صيغة الملف غير صحيحة!');
          }
        } catch {
          alert('فشل في قراءة الملف!');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (!confirm('هل أنت متأكد من مسح جميع القضايا وإعادة تعيين الإعدادات؟')) return;
    await clearAllCases();
    await idbSet('legal_dark_mode', '0');
    setDarkMode(false);
    setApiKey('');
    await saveApiKey('');
    try { localStorage.removeItem('gemini_api_key'); } catch {}
    setStatus('تم مسح البيانات وإعادة الضبط.');
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text }}>
      <main className="fade-in-up container" style={{ maxWidth: 900, padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem' }}>
        <div className="font-headline" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16}}>
          <span style={{fontSize: isMobile()? 28:32}}>⚙️</span>
          <h1 className="headline-lg" style={{margin:0, color: theme.accent}}>الإعدادات</h1>
        </div>

        {/* بطاقة مفتاح API */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginBottom: 16 }}>
          <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>🔑</span>
            <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>مفتاح Gemini API</h2>
          </div>
          <input
            type="password"
            placeholder="أدخل مفتاح Gemini API"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: '100%', padding: isMobile()? 12:14, border: `1.5px solid ${theme.input}`, borderRadius: 12, fontSize: isMobile()? 15:16, outline: 'none' }}
          />
          <div style={{display:'flex', gap:10, marginTop:10, flexWrap:'wrap'}}>
            <button onClick={handleSaveKey} disabled={saving} className="btn btn-info" style={{ background: theme.accent2, cursor: saving? 'not-allowed':'pointer' }}>حفظ المفتاح</button>
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="btn" style={{ background:'#fff', color: theme.accent, border:`1px solid ${theme.accent2}` }}>الحصول على المفتاح</a>
          </div>
        </div>

        {/* بطاقة المظهر والخصوصية */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginBottom: 16 }}>
          <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>{darkMode ? '🌙' : '☀️'}</span>
            <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>المظهر والخصوصية</h2>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="btn" style={{ background: 'none', border:`1px solid ${theme.accent2}`, color: theme.accent2 }}>
            تبديل الوضع ({darkMode ? 'ليلي' : 'فاتح'})
          </button>
          <p className="font-body card-panel" style={{marginTop:12, fontSize:14, lineHeight:1.8, background: '#f5f7ff', color:'#222', padding: '10px 12px', borderColor: theme.border }}>
            🔒 جميع بياناتك (القضايا والمفاتيح) تحفظ محليًا على جهازك فقط ولا يتم رفعها إلى أي خادم.
          </p>
        </div>

        {/* بطاقة القضايا: تصدير/استيراد ومسح */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24 }}>
          <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>📦</span>
            <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>القضايا</h2>
          </div>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <button onClick={handleExport} className="btn btn-info" style={{ background: theme.accent }}>⬇️ تصدير القضايا</button>
            <label className="btn btn-info" style={{ background: theme.accent2 }}>
              ⬆️ استيراد قضايا
              <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <button onClick={handleClearAll} className="btn btn-danger">🗑️ مسح كل البيانات</button>
          </div>
        </div>

        {status && (
          <div className="text-center" style={{marginTop:12, color: theme.accent2, fontWeight:800}}>{status}</div>
        )}
      </main>
    </div>
  );
} 