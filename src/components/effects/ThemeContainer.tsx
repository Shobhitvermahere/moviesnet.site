'use client';

import { useState, useEffect } from 'react';
import { ProfessionalLiveBackground, MouseSpotlight, SpatialScrollEffect, NoiseOverlay } from './index';
import { useLiveTheme } from '@/components/context/ThemeContext';

function useLiteEffects() {
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 768;
    setLite(coarse || narrow);

    const onResize = () => {
      setLite(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return lite;
}

export function ThemeContainer() {
  const [mounted, setMounted] = useState(false);
  const { activeTheme } = useLiveTheme();
  const liteEffects = useLiteEffects();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ProfessionalLiveBackground theme={activeTheme} />
      <NoiseOverlay />
      {!liteEffects && <MouseSpotlight />}
      {!liteEffects && <SpatialScrollEffect />}
    </>
  );
}
