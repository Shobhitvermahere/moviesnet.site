import type { Metadata } from 'next';
import { Suspense } from 'react';
import { buildSearchMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { SearchAnalytics } from '@/components/seo/SearchAnalytics';

export const metadata: Metadata = buildSearchMetadata();

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Search', path: '/search' },
        ])}
      />
      <Suspense fallback={null}>
        <SearchAnalytics />
      </Suspense>
      {children}
    </>
  );
}
