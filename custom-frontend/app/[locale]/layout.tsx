import React from 'react'

import { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { CartProvider } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import { ViewTransitions } from 'next-view-transitions';
import { mockGlobalData } from '@/lib/mock-data';
import DashboardAwareLayout from '@/components/DashboardAwareLayout';

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700", "800", "900"],
});

// Default Global SEO for pages without them
export async function generateMetadata({
    params,
}: {
    params: { locale: string; slug: string };
}): Promise<Metadata> {
    return {
        title: mockGlobalData.seo.metaTitle,
        description: mockGlobalData.seo.metaDescription,
    };
}

export default async function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {

    return (
        <html lang={locale}>
            <ViewTransitions>
                <CartProvider>
                    <body
                        className={cn(
                            inter.className,
                            "bg-charcoal antialiased h-full w-full"
                        )}
                    >
                        <DashboardAwareLayout locale={locale} mockGlobalData={mockGlobalData}>
                            {children}
                        </DashboardAwareLayout>
                    </body>
                </CartProvider>
            </ViewTransitions>
        </html>
    );
}

