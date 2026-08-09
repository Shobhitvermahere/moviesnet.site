import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { buildHomeMetadata, faqJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = buildHomeMetadata();

const HOME_FAQS = [
  {
    question: 'Where do the site links come from?',
    answer:
      'Every listing is curated into Movies & TV, Anime, Manga, Sports, or Live TV. MoviesNet indexes configured portals and opens the original source — nothing is mirrored here.',
  },
  {
    question: 'Does MoviesNet host or stream media?',
    answer:
      'No. MoviesNet is a discovery engine only. It does not host, upload, cache, embed, or stream copyrighted media.',
  },
  {
    question: 'How fresh are the results?',
    answer: 'Configured mirrors are health-checked regularly so availability and response signals stay current.',
  },
  {
    question: 'Can I search across categories?',
    answer:
      'Yes. Start from the hero search or open a category directory, then refine by title, language, and quality on the results page.',
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(HOME_FAQS)} />
      <HomePageClient />
    </>
  );
}
