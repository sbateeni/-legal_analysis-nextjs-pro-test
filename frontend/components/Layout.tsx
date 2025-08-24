import React from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import MobileNav from './MobileNav';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useTheme();
  const router = useRouter();
  const showHeader = !mounted ? true : !isMobile();
  
  // لا نعرض Header في الصفحة الرئيسية (صفحة تسجيل الدخول)
  const isHomePage = router.pathname === '/';
  const shouldShowHeader = showHeader && !isHomePage;
  
  return (
    <div style={{
      fontFamily: 'Tajawal, Arial, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      padding: 0,
      margin: 0,
      transition: 'background 0.4s',
    }}>
      {shouldShowHeader && <Header />}
      <main style={{ 
        maxWidth: isHomePage ? '100%' : 1000, 
        width: '100%', 
        margin: '0 auto', 
        padding: isHomePage ? '0' : '2rem 1rem' 
      }}>
        {children}
      </main>
      {!isHomePage && <MobileNav />}
    </div>
  );
} 