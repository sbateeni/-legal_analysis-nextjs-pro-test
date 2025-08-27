import type { NextApiRequest, NextApiResponse } from 'next';

interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  tags?: string[];
}

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
  note?: string;
}

// دالة تحديد نوع القضية
function determineCaseType(text: string): string {
  if (!text || typeof text !== 'string') return 'قضية مدنية عامة';
  
  if (/ميراث|ورثة|إرث/i.test(text)) return 'قضية ميراث';
  if (/طلاق|زواج|أحوال شخصية/i.test(text)) return 'قضية أحوال شخصية';
  if (/عقد|تجاري|شركة|عمل/i.test(text)) return 'قضية تجارية';
  if (/عقوبة|جريمة|جنحة/i.test(text)) return 'قضية جنائية';
  if (/أرض|عقار|ملكية/i.test(text)) return 'قضية عقارية';
  if (/عمل|موظف|راتب/i.test(text)) return 'قضية عمل';
  return 'قضية مدنية عامة';
}

// دالة حساب طول النص
function calculateTextLength(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// دالة محاكاة جلب البيانات (لأن IndexedDB لا يعمل على الخادم)
function getMockAnalyticsData(): AnalyticsData {
  return {
    totalCases: 0,
    casesByType: {},
    casesByMonth: {},
    averageStagesCompleted: 0,
    mostCommonIssues: [],
    successRate: 0,
    averageCaseLength: 0,
    topStages: [],
    recentActivity: [],
    note: 'لم يتم إنشاء أي قضايا بعد. ابدأ بإنشاء قضية جديدة من الصفحة الرئيسية لرؤية التحليلات والإحصائيات.'
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // دعم GET و POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // بما أن IndexedDB لا يعمل على الخادم، سنعيد بيانات محاكاة
    // في التطبيق الحقيقي، يمكن استخدام قاعدة بيانات حقيقية مثل PostgreSQL أو MongoDB
    const analyticsData = getMockAnalyticsData();

    res.status(200).json(analyticsData);

  } catch (error: unknown) {
    console.error('Error in analytics API:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    res.status(500).json({
      code: 'ANALYTICS_ERROR',
      message: 'حدث خطأ في تحليل البيانات',
      details: errorMessage
    });
  }
}