"use client";
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Layout>
          {children}
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
}


