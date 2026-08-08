'use client';

import { useState, useEffect } from 'react';
import { ProfessionalLiveBackground, MouseSpotlight, SpatialScrollEffect, NoiseOverlay } from './index';
import { useLiveTheme } from '@/components/context/ThemeContext';

export function ThemeContainer() {
  const [mounted, setMounted] = useState(false);
  const { activeTheme } = useLiveTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ProfessionalLiveBackground theme={activeTheme} />
      <NoiseOverlay />
      <MouseSpotlight />
      <SpatialScrollEffect />
    </>
  );
}
