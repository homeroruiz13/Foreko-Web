import React from 'react';
import dynamic from 'next/dynamic';

interface DynamicZoneComponent {
  __component: string;
  id: number;
  [key: string]: any;
}

interface Props {
  dynamicZone: DynamicZoneComponent[];
  locale: string;
}

const componentMapping: { [key: string]: any } = {
  'dynamic-zone.hero': dynamic(() => import('./hero').then(mod => mod.Hero), { ssr: false }),
  'dynamic-zone.features': dynamic(() => import('./features').then(mod => mod.Features), { ssr: false }),
  'dynamic-zone.testimonials': dynamic(() => import('./testimonials').then(mod => mod.Testimonials), { ssr: false }),
  'dynamic-zone.how-it-works': dynamic(() => import('./how-it-works').then(mod => mod.HowItWorks), { ssr: false }),
  'dynamic-zone.brands': dynamic(() => import('./brands').then(mod => mod.Brands), { ssr: false }),
  'dynamic-zone.pricing': dynamic(() => import('./pricing').then(mod => mod.Pricing), { ssr: false }),
  'dynamic-zone.launches': dynamic(() => import('./launches').then(mod => mod.Launches), { ssr: false }),
  'dynamic-zone.cta': dynamic(() => import('./cta').then(mod => mod.CTA), { ssr: false }),
  'dynamic-zone.form-next-to-section': dynamic(() => import('./form-next-to-section').then(mod => mod.FormNextToSection), { ssr: false }),
  'dynamic-zone.faq': dynamic(() => import('./faq').then(mod => mod.FAQ), { ssr: false }),
  'dynamic-zone.related-products': dynamic(() => import('./related-products').then(mod => mod.RelatedProducts), { ssr: false }),
  'dynamic-zone.related-articles': dynamic(() => import('./related-articles').then(mod => mod.RelatedArticles), { ssr: false }),
  'dynamic-zone.blog-grid': dynamic(() => import('./blog-grid').then(mod => mod.BlogGrid), { ssr: false }),
  'dynamic-zone.team-static': dynamic(() => import('./team-static').then(mod => mod.TeamStatic), { ssr: false }),
  'dynamic-zone.contact-form': dynamic(() => import('./contact-form').then(mod => mod.ContactForm), { ssr: false }),
  'dynamic-zone.company-info': dynamic(() => import('./company-info').then(mod => mod.CompanyInfo), { ssr: false }),
  'dynamic-zone.privacy-policy': dynamic(() => import('./privacy-policy').then(mod => mod.PrivacyPolicy), { ssr: false }),
  'dynamic-zone.cookie-policy': dynamic(() => import('./cookie-policy').then(mod => mod.CookiePolicy), { ssr: false }),
  'dynamic-zone.terms-of-service': dynamic(() => import('./terms-of-service').then(mod => mod.TermsOfService), { ssr: false })
}

const DynamicZoneManager: React.FC<Props> = ({ dynamicZone, locale }) => {
  return (
    <div>
      {
        dynamicZone.map((componentData) => {
          const Component = componentMapping[componentData.__component];
          if (!Component) {
            console.warn(`No component found for: ${componentData.__component}`);
            return null;
          }
          return <Component key={componentData.id} {...componentData} locale={locale} />;
        })}
    </div>
  );
};

export default DynamicZoneManager;
