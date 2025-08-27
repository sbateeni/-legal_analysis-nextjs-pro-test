import React, { useEffect, useState } from 'react';
import { Notifications, type Notice } from '../components/Notifications';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';
import { set as idbSet } from 'idb-keyval';
import { saveApiKey, loadApiKey, getAllCases, saveAllCases, clearAllCases } from '../utils/db';
import { loadExportPreferences, saveExportPreferences, type ExportPreferences } from '../utils/exportSettings';
import { loadAppSettings, saveAppSettings, type AppSettings } from '../utils/appSettings';

export default function Settings() {
  const { theme, darkMode, setDarkMode } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [exportPrefs, setExportPrefs] = useState<ExportPreferences>({ includeStages: true, includeInputs: false, includeOutputs: true, marginPt: 48 });
  const [appSettings, setAppSettings] = useState<AppSettings>({ preferredModel: 'gemini-1.5-flash', rateLimitPerMin: 10 });

  useEffect(() => {
    loadApiKey().then(val => setApiKey(val || '')); 
    loadExportPreferences().then(setExportPrefs);
    loadAppSettings().then(setAppSettings);
  }, []);

  const handleSaveKey = async () => {
    setSaving(true);
    try {
      await saveApiKey(apiKey.trim());
      // توافق مع إصدارات سابقة: حفظ نسخة في localStorage إن لزم
      try { localStorage.setItem('gemini_api_key', apiKey.trim()); } catch {}
      setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'success', message: 'تم حفظ مفتاح API بنجاح.' }]);
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
    setNotices(prev => [...prev, { id: Math.random().toString(36).slice(2), type: 'success', message: 'تم مسح البيانات وإعادة الضبط.' }]);
  };

  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text }}>
      <Notifications notices={notices} setNotices={setNotices} />
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

        {/* إعدادات التطبيق */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginTop: 16 }}>
          <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>🧠</span>
            <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>إعدادات الذكاء والحدود</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap: 10 }}>
            <select value={appSettings.preferredModel} onChange={e => setAppSettings(p => ({ ...p, preferredModel: e.target.value as AppSettings['preferredModel'] }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }}>
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
            </select>
            <input type="number" min={1} max={60} placeholder="حد الطلبات/دقيقة" value={appSettings.rateLimitPerMin || 10} onChange={e => setAppSettings(p => ({ ...p, rateLimitPerMin: Number(e.target.value)||10 }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
          </div>
          <div style={{ display:'flex', gap:8, marginTop: 12 }}>
            <button onClick={() => saveAppSettings(appSettings)} className="btn btn-info" style={{ background: theme.accent2 }}>حفظ إعدادات التطبيق</button>
          </div>
        </div>

        {/* إعدادات التصدير */}
        <div className="card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile()? 16:24, marginTop: 16 }}>
          <div className="font-headline" style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <span style={{fontSize: isMobile()? 22:24}}>🖨️</span>
            <h2 className="headline-sm" style={{margin:0, color: theme.accent2}}>إعدادات التصدير</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile()? '1fr' : '1fr 1fr', gap: 10 }}>
            <input type="text" placeholder="نص الترويسة" value={exportPrefs.headerText || ''} onChange={e => setExportPrefs(p => ({ ...p, headerText: e.target.value }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
            <input type="text" placeholder="نص التذييل" value={exportPrefs.footerText || ''} onChange={e => setExportPrefs(p => ({ ...p, footerText: e.target.value }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
            <input type="number" min={12} max={96} placeholder="الهامش (pt)" value={exportPrefs.marginPt || 48} onChange={e => setExportPrefs(p => ({ ...p, marginPt: Number(e.target.value)||48 }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
            <input type="text" placeholder="شعار (Data URL)" value={exportPrefs.logoDataUrl || ''} onChange={e => setExportPrefs(p => ({ ...p, logoDataUrl: e.target.value }))} style={{ border:`1.5px solid ${theme.input}`, borderRadius: 10, padding: 10 }} />
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={exportPrefs.includeStages !== false} onChange={e => setExportPrefs(p => ({ ...p, includeStages: e.target.checked }))} />
              تضمين عناوين المراحل
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={!!exportPrefs.includeInputs} onChange={e => setExportPrefs(p => ({ ...p, includeInputs: e.target.checked }))} />
              تضمين النصوص المدخلة
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={exportPrefs.includeOutputs !== false} onChange={e => setExportPrefs(p => ({ ...p, includeOutputs: e.target.checked }))} />
              تضمين النتائج
            </label>
          </div>
          <div style={{ display:'flex', gap:8, marginTop: 12 }}>
            <button onClick={() => saveExportPreferences(exportPrefs)} className="btn btn-info" style={{ background: theme.accent2 }}>حفظ إعدادات التصدير</button>
          </div>
        </div>

        {status && (
          <div className="text-center" style={{marginTop:12, color: theme.accent2, fontWeight:800}}>{status}</div>
        )}
      </main>
    </div>
  );
} 