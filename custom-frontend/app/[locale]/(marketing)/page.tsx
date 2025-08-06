import { Metadata } from 'next';

import PageContent from '@/lib/shared/PageContent';
import { mockPageData } from '@/lib/mock-data';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: 'Inventory Reimagined - AI-Powered Inventory Management | Foreko',
    description: 'AI-powered inventory management that predicts exactly what to order and when. Smart reordering, demand forecasting, and real-time insights for small businesses.',
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
