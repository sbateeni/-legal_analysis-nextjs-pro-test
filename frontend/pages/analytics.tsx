import { useState, useEffect } from 'react';
import { isMobile } from '../utils/crypto';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsData {
  totalCases: number;
  casesByType: Record<string, number>;
  casesByMonth: Record<string, number>;
  averageStagesCompleted: number;
  mostCommonIssues: string[];
  successRate: number;
  averageCaseLength: number;
  topStages: Array<{ stage: string; count: number }>;
  recentActivity: Array<{ date: string; count: number }>;
  note?: string; // رسالة إضافية
}

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في جلب البيانات');
      }
      
      setAnalytics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.text, fontFamily: 'Tajawal, Arial, sans-serif' }}>
      {/* Header */}
      <header style={{ background: theme.accent2, color: 'white', padding: isMobile() ? '1rem' : '1.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>
          📊 التحليلات والإحصائيات
        </h1>
        <p className="muted" style={{ margin: '0.5rem 0 0 0' }}>
          نظرة شاملة على جميع القضايا والتحليلات
        </p>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: isMobile() ? '1rem' : '2rem' }}>
        {loading && (
          <div className="text-center muted" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3>جاري تحليل البيانات...</h3>
          </div>
        )}

        {error && (
          <div className="card-panel" style={{ padding: '1rem', background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
            ❌ {error}
          </div>
        )}

        {analytics && analytics.totalCases === 0 && analytics.note && (
          <div className="card-panel" style={{ background: '#fef3c7', borderColor: '#fbbf24', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ color: '#92400e', marginBottom: '1rem' }}>لا توجد بيانات للتحليل حالياً</h3>
            <p style={{ color: '#92400e', marginBottom: '1rem' }}>
              {analytics.note}
            </p>
            <div className="badge" style={{ background: '#fbbf24', color: '#fff' }}>
              💡 نصيحة: أنشئ قضية جديدة من الصفحة الرئيسية لرؤية التحليلات
            </div>
          </div>
        )}

        {analytics && analytics.totalCases > 0 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* الإحصائيات الأساسية */}
            <div className="grid-auto">
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>إجمالي القضايا</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.accent2 }}>
                  {analytics.totalCases}
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>معدل النجاح</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {analytics.successRate}%
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>متوسط الإنجاز</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {analytics.averageStagesCompleted}%
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>متوسط الطول</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.accent }}>
                  {analytics.averageCaseLength} كلمة
                </div>
              </div>
            </div>

            {/* أنواع القضايا */}
            <div className="card-panel" style={{ background: 'white' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>أنواع القضايا</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {Object.entries(analytics.casesByType).map(([type, count]) => (
                  <div key={type} style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                      {type}
                    </div>
                    <div style={{ fontSize: '1.5rem', color: theme.accent2, fontWeight: 'bold' }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* النشاط الأخير */}
            <div className="card-panel" style={{ background: 'white' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>النشاط الأخير</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.5rem'
              }}>
                {analytics.recentActivity.map(({ date, count }) => (
                  <div key={date} style={{
                    padding: '0.75rem',
                    background: count > 0 ? '#e0e7ff' : '#f3f4f6',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      {formatDate(date)}
                    </div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold',
                      color: count > 0 ? theme.accent2 : '#9ca3af'
                    }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* المراحل الأكثر استخداماً */}
            <div className="card-panel" style={{ background: 'white' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>المراحل الأكثر استخداماً</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analytics.topStages.map(({ stage, count }) => (
                  <div key={stage} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem'
                  }}>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{stage}</span>
                    <span style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold',
                      color: theme.accent2
                    }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* المشاكل الشائعة */}
            {analytics.mostCommonIssues.length > 0 && (
              <div className="card-panel" style={{ background: 'white' }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>المشاكل الشائعة</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {analytics.mostCommonIssues.map((issue, index) => (
                    <div key={index} style={{
                      padding: '0.75rem',
                      background: '#fef3c7',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <span style={{ color: '#92400e' }}>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 