import type { Metadata } from 'next';
import Providers from './providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'التحليل القانوني الذكي',
  description: 'منصة SaaS للتحليل القانوني الذكي',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


