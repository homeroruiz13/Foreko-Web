"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  
  // Routes that should not show header/footer
  const noLayoutRoutes = [
    '/subscription',
    '/payment',
    '/company-setup'
  ];
  
  // Check if current path matches any no-layout routes
  const shouldHideLayout = noLayoutRoutes.some(route => 
    pathname.includes(route)
  );

  if (shouldHideLayout) {
    return <>{children}</>;
  }

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
