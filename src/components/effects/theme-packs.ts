'use client';

/**
 * Professional live background theme catalog.
 * Refined cinematic packs — restrained color, readable over UI.
 */

export type ThemePackId =
  | 'horizon'
  | 'aurora'
  | 'midnight'
  | 'ember'
  | 'abyss'
  | 'noir';

export interface ThemeConfig {
  id: ThemePackId;
  name: string;
  description: string;
  longDescription: string;
  mood: string;
  swatch: [string, string, string];
}

export const ThemePackConfig: Record<ThemePackId, ThemeConfig> = {
  horizon: {
    id: 'horizon',
    name: 'Horizon',
    description: 'Cinematic deep space with a soft accretion glow.',
    longDescription:
      'A filmic deep-space canvas with layered starlight and a restrained accretion glow. Built for focus — dramatic without overpowering the interface.',
    mood: 'Cinematic',
    swatch: ['#03050a', '#e8b86d', '#1a2240'],
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description: 'Northern light ribbons over a quiet night sky.',
    longDescription:
      'Soft teal and indigo ribbons drift across a calm night field. Quiet motion, cool clarity, and a premium atmospheric feel.',
    mood: 'Serene',
    swatch: ['#040812', '#5eead4', '#7c8cff'],
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Minimal navy atmosphere with gentle starlight.',
    longDescription:
      'Navy depth, soft haze, and gentle starlight. The cleanest option when you want atmosphere without visual noise.',
    mood: 'Minimal',
    swatch: ['#05070f', '#8fa4c8', '#1e2a44'],
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    description: 'Warm amber haze and slow solar drift.',
    longDescription:
      'Warm amber haze with slow rising embers. Pairs naturally with MoviesNet’s gold accent for a cohesive, inviting look.',
    mood: 'Warm',
    swatch: ['#0a0705', '#e8b86d', '#7a3b1e'],
  },
  abyss: {
    id: 'abyss',
    name: 'Abyss',
    description: 'Deep teal oceanic depth with soft caustics.',
    longDescription:
      'Deep teal waters and soft caustic blooms. Cool, immersive, and professional — like searching from beneath a quiet sea.',
    mood: 'Immersive',
    swatch: ['#02080c', '#3db8a8', '#0d3a48'],
  },
  noir: {
    id: 'noir',
    name: 'Noir',
    description: 'Ultra-clean charcoal with silver edge light.',
    longDescription:
      'Charcoal planes and silver edge light. Ultra-clean, editorial, and distraction-free for maximum content readability.',
    mood: 'Editorial',
    swatch: ['#080808', '#c8c8c8', '#2a2a2a'],
  },
};

export const THEME_IDS = Object.keys(ThemePackConfig) as ThemePackId[];

export function isThemePackId(value: string | null): value is ThemePackId {
  return !!value && THEME_IDS.includes(value as ThemePackId);
}
