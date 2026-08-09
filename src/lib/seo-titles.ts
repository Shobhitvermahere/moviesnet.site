export interface SeoTitleEntry {
  slug: string;
  title: string;
  category: 'movies' | 'tv-shows' | 'anime' | 'manga' | 'sports' | 'live-tv';
  year?: number;
  blurb?: string;
}

/** Curated high-intent titles for SEO landing pages (/watch/[slug]). */
export const SEO_TITLES: SeoTitleEntry[] = [
  { slug: 'naruto', title: 'Naruto', category: 'anime', year: 2002, blurb: 'Ninja adventures across indexed anime portals.' },
  { slug: 'one-piece', title: 'One Piece', category: 'anime', year: 1999 },
  { slug: 'dragon-ball-z', title: 'Dragon Ball Z', category: 'anime', year: 1989 },
  { slug: 'attack-on-titan', title: 'Attack on Titan', category: 'anime', year: 2013 },
  { slug: 'demon-slayer', title: 'Demon Slayer', category: 'anime', year: 2019 },
  { slug: 'jujutsu-kaisen', title: 'Jujutsu Kaisen', category: 'anime', year: 2020 },
  { slug: 'my-hero-academia', title: 'My Hero Academia', category: 'anime', year: 2016 },
  { slug: 'death-note', title: 'Death Note', category: 'anime', year: 2006 },
  { slug: 'bleach', title: 'Bleach', category: 'anime', year: 2004 },
  { slug: 'spy-x-family', title: 'Spy x Family', category: 'anime', year: 2022 },
  { slug: 'chainsaw-man', title: 'Chainsaw Man', category: 'anime', year: 2022 },
  { slug: 'oppenheimer', title: 'Oppenheimer', category: 'movies', year: 2023 },
  { slug: 'dune', title: 'Dune', category: 'movies', year: 2021 },
  { slug: 'interstellar', title: 'Interstellar', category: 'movies', year: 2014 },
  { slug: 'inception', title: 'Inception', category: 'movies', year: 2010 },
  { slug: 'the-dark-knight', title: 'The Dark Knight', category: 'movies', year: 2008 },
  { slug: 'avengers-endgame', title: 'Avengers: Endgame', category: 'movies', year: 2019 },
  { slug: 'spider-man-no-way-home', title: 'Spider-Man: No Way Home', category: 'movies', year: 2021 },
  { slug: 'barbie', title: 'Barbie', category: 'movies', year: 2023 },
  { slug: 'avatar-the-way-of-water', title: 'Avatar: The Way of Water', category: 'movies', year: 2022 },
  { slug: 'breaking-bad', title: 'Breaking Bad', category: 'tv-shows', year: 2008 },
  { slug: 'game-of-thrones', title: 'Game of Thrones', category: 'tv-shows', year: 2011 },
  { slug: 'stranger-things', title: 'Stranger Things', category: 'tv-shows', year: 2016 },
  { slug: 'the-witcher', title: 'The Witcher', category: 'tv-shows', year: 2019 },
  { slug: 'squid-game', title: 'Squid Game', category: 'tv-shows', year: 2021 },
  { slug: 'wednesday', title: 'Wednesday', category: 'tv-shows', year: 2022 },
  { slug: 'the-last-of-us', title: 'The Last of Us', category: 'tv-shows', year: 2023 },
  { slug: 'house-of-the-dragon', title: 'House of the Dragon', category: 'tv-shows', year: 2022 },
  { slug: 'the-mandalorian', title: 'The Mandalorian', category: 'tv-shows', year: 2019 },
  { slug: 'ted-lasso', title: 'Ted Lasso', category: 'tv-shows', year: 2020 },
];

const bySlug = new Map(SEO_TITLES.map((t) => [t.slug, t]));

export function getTitleBySlug(slug: string): SeoTitleEntry | undefined {
  return bySlug.get(slug);
}
