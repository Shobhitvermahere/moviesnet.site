import Link from 'next/link';
import { CATEGORIES } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/[0.04]">
      <div className="page-shell mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg border border-[#e8b86d]/35 bg-[#e8b86d]/10 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e8b86d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                <span className="text-white">Movies</span>
                <span className="text-[#e8b86d]">Net</span>
              </span>
            </Link>
            <p className="text-sm text-white/45 leading-relaxed mb-6">
              Search once. Find everywhere.<br />
              Discover titles across curated sites, then open the original source.
            </p>
            <p className="text-xs text-white/25 leading-relaxed">
              MoviesNet does not host, upload, or distribute copyrighted content.
              We are a discovery engine that redirects to original sources.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors flex items-center gap-2"
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-3">
              {[
                { href: '/search', label: 'Search' },
                { href: '/trending', label: 'Trending' },
                { href: '/themes', label: 'Themes' },
                { href: '/websites', label: 'Websites' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Socials */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://discord.gg/ATGRvAjBr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-[#5865F2] transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.894a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discord Server
                </a>
              </li>
              <li>
                <a
                  href="https://www.reddit.com/user/allsitehub/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-[#FF4500] transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547l-.8 3.747c1.824.07 3.48.632 4.674 1.488c.308-.309.73-.491 1.196-.491c.962 0 1.743.78 1.743 1.742c0 .601-.307 1.127-.77 1.43c.018.188.028.38.028.574c0 2.907-3.37 5.263-7.525 5.263c-4.156 0-7.526-2.356-7.526-5.263c0-.184.009-.368.025-.544A1.737 1.737 0 0 1 3.5 12.18c0-.962.78-1.742 1.742-1.742c.465 0 .888.182 1.196.49c1.192-.855 2.846-1.417 4.67-1.488l.942-4.411a.25.25 0 0 1 .288-.194l3.14.661c.143-.448.56-.752 1.032-.752zM9.354 13.991c-.68 0-1.232.552-1.232 1.232c0 .68.552 1.232 1.232 1.232c.68 0 1.232-.552 1.232-1.232c0-.68-.552-1.232-1.232-1.232zm5.292 0c-.68 0-1.232.552-1.232 1.232c0 .68.552 1.232 1.232 1.232c.68 0 1.232-.552 1.232-1.232c0-.68-.552-1.232-1.232-1.232zm-5.048 3.63a.25.25 0 0 0-.173.43c.87.87 2.4.95 2.576.95c.175 0 1.706-.08 2.576-.95a.25.25 0 0 0-.353-.353c-.636.635-1.82.723-2.223.723c-.402 0-1.587-.088-2.223-.723a.247.247 0 0 0-.18-.077z" />
                  </svg>
                  Reddit Community
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20" suppressHydrationWarning>
            © {new Date().getFullYear()} MoviesNet. Search engine and content discovery platform.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/ATGRvAjBr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-[#5865F2] transition-colors flex items-center gap-1.5"
            >
              <span>Discord</span>
            </a>
            <span className="text-white/10">•</span>
            <a
              href="https://www.reddit.com/user/allsitehub/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-[#FF4500] transition-colors flex items-center gap-1.5"
            >
              <span>Reddit</span>
            </a>
            <span className="text-white/10">•</span>
            <span className="text-xs text-white/20">
              Built with Next.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
