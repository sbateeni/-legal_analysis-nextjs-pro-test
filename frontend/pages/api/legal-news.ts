import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

type NewsResponse = {
  updatedAt: number;
  model: string;
  content: string;
};

// In-memory 24h cache per model
const newsCacheByModel = new Map<string, { content: string; updatedAt: number; expiresAt: number }>();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function shouldUseCache(model: string): boolean {
  const entry = newsCacheByModel.get(model);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    newsCacheByModel.delete(model);
    return false;
  }
  return true;
}

async function callGemini(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function buildPrompt(): string {
  return [
    'أنت مساعد مختص يرصد الأخبار القانونية الفلسطينية فقط خلال آخر 24 ساعة.',
    'المطلوب: استخراج أي إعلان رسمي متعلق بـ: قرارات بقانون، قوانين جديدة، تعديلات على قوانين، نشر في الجريدة الرسمية، بلاغات أو تعليمات تنظيمية صادرة عن جهات فلسطينية رسمية.',
    'التزم بما يلي:',
    '- لا تذكر الأخبار السياسية أو الأمنية أو التصريحات العامة غير التشريعية.',
    '- إن لم تتوفر أي تحديثات قانونية خلال آخر 24 ساعة، أجب بجملة واضحة: لا توجد تحديثات قانونية خلال 24 ساعة الماضية.',
    '- نظّم الخرج في نقاط قصيرة، كل نقطة: العنوان المختصر، الجهة المُصدِرة، تاريخ اليوم، ولمحة بجملة واحدة.',
  ].join('\n');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = (req.headers['x-api-key'] as string) || (req.query.apiKey as string) || '';
    const modelName = (req.headers['x-model'] as string) || (req.query.model as string) || 'gemini-1.5-flash';
    const force = String(req.query.force || '').toLowerCase() === '1';

    if (!apiKey) {
      return res.status(400).json({ error: 'يرجى تزويد مفتاح Gemini API عبر x-api-key أو apiKey' });
    }

    // Serve from cache when valid and not forced
    if (!force && shouldUseCache(modelName)) {
      const cached = newsCacheByModel.get(modelName)!;
      const response: NewsResponse = {
        updatedAt: cached.updatedAt,
        model: modelName,
        content: cached.content,
      };
      return res.status(200).json(response);
    }

    // Build prompt and query Gemini
    const prompt = buildPrompt();
    const content = await callGemini(prompt, apiKey, modelName);

    // Cache for 24 hours
    newsCacheByModel.set(modelName, {
      content,
      updatedAt: Date.now(),
      expiresAt: Date.now() + ONE_DAY_MS,
    });

    const response: NewsResponse = {
      updatedAt: Date.now(),
      model: modelName,
      content,
    };
    return res.status(200).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ error: message });
  }
}


