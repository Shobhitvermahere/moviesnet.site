import type { Metadata, Viewport } from 'next';
import { Syne, Instrument_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeContainer } from '@/components/effects/ThemeContainer';

const syne = Syne({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const instrumentSans = Instrument_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'MoviesNet — Search Once. Find Everywhere.',
    template: '%s | MoviesNet',
  },
  description:
    'Discover content across multiple websites instantly. MoviesNet is a unified content discovery engine that searches configured websites and redirects you to original sources.',
  keywords: [
    'moviesnet',
    'movie search',
    'search engine',
    'content discovery',
    'anime search',
    'tv show search',
    'multi-site search',
  ],
  authors: [{ name: 'MoviesNet' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://moviesnet.site',
    siteName: 'MoviesNet',
    title: 'MoviesNet — Search Once. Find Everywhere.',
    description:
      'Discover content across multiple websites instantly. Search once, find everywhere.',
    images: [{ url: '/logo.svg', width: 320, height: 64, alt: 'MoviesNet' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoviesNet — Search Once. Find Everywhere.',
    description:
      'Discover content across multiple websites instantly. Search once, find everywhere.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: '/logo-mark.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logo-mark.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#03050a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${instrumentSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'MoviesNet',
              url: 'https://moviesnet.site',
              description: 'Unified content discovery search engine',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://moviesnet.site/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#03050a] text-white font-sans">
        <Providers>
          <ThemeContainer />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-[4.25rem]">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
