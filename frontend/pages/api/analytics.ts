import type { NextApiRequest, NextApiResponse } from 'next';

// تخزين بسيط بالذاكرة لعينات Web Vitals (غير دائم؛ لغرض القياس السريع فقط)
type VitalSample = { name: string; value: number; id: string; label?: string; startTime?: number; t: number };
const inMemoryVitals: VitalSample[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const sample = req.body as Partial<VitalSample>;
      if (!sample || typeof sample.name !== 'string' || typeof sample.value !== 'number') {
        return res.status(400).json({ error: 'invalid payload' });
      }
      inMemoryVitals.push({
        name: sample.name,
        value: sample.value,
        id: String(sample.id || ''),
        label: sample.label,
        startTime: typeof sample.startTime === 'number' ? sample.startTime : undefined,
        t: Date.now(),
      });
      // احتفاظ بآخر 500 عينة فقط
      if (inMemoryVitals.length > 500) inMemoryVitals.splice(0, inMemoryVitals.length - 500);
      return res.status(204).end();
    }

    if (req.method === 'GET') {
      // إعادة تجميع مبسط
      const summary = inMemoryVitals.reduce<Record<string, { count: number; p95: number; avg: number }>>((acc, s) => {
        const key = s.name;
        acc[key] ||= { count: 0, p95: 0, avg: 0 };
        const item = acc[key];
        item.count += 1;
        item.avg += s.value;
        return acc;
      }, {});
      for (const k of Object.keys(summary)) {
        const values = inMemoryVitals.filter(v => v.name === k).map(v => v.value).sort((a, b) => a - b);
        const idx = Math.floor(values.length * 0.95);
        summary[k].p95 = values[idx] ?? 0;
        summary[k].avg = values.length ? summary[k].avg / values.length : 0;
      }
      return res.status(200).json({ vitalsCount: inMemoryVitals.length, summary });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('Error in analytics API:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return res.status(500).json({
      code: 'ANALYTICS_ERROR',
      message: 'حدث خطأ في تحليل البيانات',
      details: errorMessage
    });
  }
}