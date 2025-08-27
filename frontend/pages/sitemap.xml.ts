import type { NextApiRequest, NextApiResponse } from 'next';

const PAGES = ['/', '/chat', '/analytics', '/history', '/about', '/privacy', '/templates'];

function generateSiteMap(baseUrl: string) {
  const urls = PAGES.map((path) => `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
  const baseUrl = `${proto}://${host}`;
  const xml = generateSiteMap(baseUrl);
  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

