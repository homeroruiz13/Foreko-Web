import { Metadata } from 'next';

import PageContent from '@/lib/shared/PageContent';
import { mockPageData } from '@/lib/mock-data';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: 'Foreko Complete Dashboard Suite - AI-Powered Business Management',
    description: 'Streamlined, AI-powered solution designed specifically for small businesses. Real-time inventory management, order tracking, and actionable insights through five core dashboards.',
  };
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  // Use mock data instead of API call
  const pageData = {
    ...mockPageData,
    locale: params.locale
  };

  return <PageContent pageData={pageData} />;
}
