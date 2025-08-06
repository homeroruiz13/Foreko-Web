import { Metadata } from 'next';
import PageContent from '@/lib/shared/PageContent';
import { mockPages } from '@/lib/mock-data';
import ClientSlugHandler from '../ClientSlugHandler';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  console.log('Generating metadata for slug:', params.slug);
  console.log('Available pages:', Object.keys(mockPages));
  
  const pageData = mockPages[params.slug as keyof typeof mockPages];
  
  if (!pageData) {
    console.log('Page not found, using fallback for:', params.slug);
    return {
      title: `${params.slug} - Foreko`,
      description: `Learn more about ${params.slug}`,
    };
  }
  
  console.log('Found page data for:', params.slug);
  return {
    title: pageData.seo?.metaTitle || `${params.slug} - Foreko`,
    description: pageData.seo?.metaDescription || `Learn more about ${params.slug}`,
  };
}

export default async function Page({ params }: { params: { locale: string, slug: string } }) {
  console.log('Rendering page for slug:', params.slug);
  
  const pageData = mockPages[params.slug as keyof typeof mockPages];

  // If no page data found, redirect to home or show 404
  if (!pageData) {
    console.log('No page data found for:', params.slug);
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page &ldquo;{params.slug}&rdquo; could not be found.</p>
        <a href={`/${params.locale}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Go Home
        </a>
      </div>
    );
  }

  console.log('Page data found, rendering:', params.slug);
  const localizedSlugs = { [params.locale]: params.slug };

  return (
    <>
      <ClientSlugHandler localizedSlugs={localizedSlugs} />
      <PageContent pageData={pageData} />
    </>
  );
}