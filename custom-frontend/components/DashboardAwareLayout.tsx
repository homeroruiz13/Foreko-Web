import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface DashboardAwareLayoutProps {
  children: React.ReactNode;
  locale: string;
  mockGlobalData: any;
}

export default function DashboardAwareLayout({ 
  children, 
  locale, 
  mockGlobalData 
}: DashboardAwareLayoutProps) {
  return (
    <>
      <Navbar data={mockGlobalData?.navbar} locale={locale} />
      <main>
        {children}
      </main>
      <Footer data={mockGlobalData?.footer} locale={locale} />
    </>
  );
}
