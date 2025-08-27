"use client";
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Layout>
        {children}
      </Layout>
    </ThemeProvider>
  );
}


