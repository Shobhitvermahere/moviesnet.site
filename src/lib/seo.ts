import type { Metadata } from 'next';

export const SITE_URL = 'https://moviesnet.site';
export const SITE_NAME = 'MoviesNet';
export const SITE_TAGLINE = 'Search Once. Find Everywhere.';

export const DEFAULT_KEYWORDS = [
  'moviesnet',
  'movie search engine',
  'where to watch movies',
  'where to watch tv shows',
  'anime search',
  'find anime online',
  'tv series finder',
  'multi-site search',
  'streaming site directory',
  'watch movies online finder',
  'content discovery',
  'manga search',
  'live sports streams finder',
  'live tv channels search',
];

export function absoluteUrl(path = ''): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildRootMetadata(): Metadata {
  const verification: Metadata['verification'] = {};
  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      'MoviesNet helps you find movies, TV shows, anime, manga, sports, and live TV across curated streaming portals in one search. Discover titles instantly and open the original source.',
    keywords: DEFAULT_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'entertainment',
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description:
        'Search movies, TV, anime, and more across every indexed site. One query — all your portals.',
      images: [
        {
          url: '/logo.svg',
          width: 320,
          height: 64,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: 'Unified search for movies, TV shows, anime, and live streams across curated sites.',
      images: ['/logo.svg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification,
  };
}

export function buildHomeMetadata(): Metadata {
  return {
    title: `${SITE_NAME} — Search Movies, TV Shows & Anime in One Place`,
    description:
      'Find where to watch any movie, TV series, or anime. MoviesNet searches your curated streaming directory and ranks the fastest sites for every title.',
    alternates: { canonical: SITE_URL },
    openGraph: {
      url: SITE_URL,
      title: `${SITE_NAME} — Search Movies, TV Shows & Anime`,
      description: 'One search across every indexed streaming portal. Fast, free discovery.',
    },
  };
}

export function buildSearchMetadata(query?: string): Metadata {
  if (!query?.trim()) {
    return {
      title: 'Search Movies, TV Shows & Anime',
      description:
        'Search MoviesNet for any movie, series, or anime title and see which indexed streaming sites have it.',
      alternates: { canonical: absoluteUrl('/search') },
    };
  }

  const q = query.trim();
  const canonical = absoluteUrl(`/search?q=${encodeURIComponent(q)}`);

  return {
    title: `${q} — Where to Watch Online`,
    description: `Find where to watch "${q}" online. MoviesNet searches all indexed movie, TV, and anime sites and shows the fastest portals for ${q}.`,
    keywords: [
      q,
      `watch ${q} online`,
      `where to watch ${q}`,
      `${q} streaming sites`,
      `${q} moviesnet`,
      ...DEFAULT_KEYWORDS.slice(0, 6),
    ],
    alternates: { canonical },
    openGraph: {
      title: `${q} — Where to Watch | ${SITE_NAME}`,
      description: `Discover streaming sites for "${q}" across MoviesNet's curated directory.`,
      url: canonical,
    },
  };
}

export function buildWatchPageMetadata(entry: {
  title: string;
  category: string;
  year?: number;
  slug: string;
}): Metadata {
  const label = entry.year ? `${entry.title} (${entry.year})` : entry.title;
  const canonical = absoluteUrl(`/watch/${entry.slug}`);

  return {
    title: `Where to Watch ${label} Online`,
    description: `Looking for ${label}? Use MoviesNet to find ${entry.title} on movie, TV, and ${entry.category} streaming sites — ranked by speed.`,
    keywords: [
      entry.title,
      `watch ${entry.title} online`,
      `where to watch ${entry.title}`,
      `${entry.title} streaming`,
      entry.category,
      ...DEFAULT_KEYWORDS.slice(0, 4),
    ],
    alternates: { canonical },
    openGraph: {
      title: `Where to Watch ${label} | ${SITE_NAME}`,
      description: `Find ${entry.title} across indexed streaming portals instantly.`,
      url: canonical,
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo.svg'),
    sameAs: [
      'https://discord.gg/ATGRvAjBr',
      'https://www.reddit.com/user/allsitehub/',
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Unified movie, TV, anime, and live stream discovery search engine.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: SITE_URL,
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function creativeWorkJsonLd(entry: {
  title: string;
  category: string;
  year?: number;
  slug: string;
}) {
  const isAnime = entry.category === 'anime' || entry.category === 'manga';
  const type = isAnime ? 'TVSeries' : entry.category === 'movies' ? 'Movie' : 'TVSeries';

  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: entry.title,
    ...(entry.year ? { datePublished: String(entry.year) } : {}),
    url: absoluteUrl(`/watch/${entry.slug}`),
    potentialAction: {
      '@type': 'WatchAction',
      target: absoluteUrl(`/search?q=${encodeURIComponent(entry.title)}`),
    },
  };
}
