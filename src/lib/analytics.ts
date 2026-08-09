/** GA4 measurement ID — public; override with NEXT_PUBLIC_GA_ID in Vercel if needed. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID?.trim() || 'G-V7SC3DEWKE';
