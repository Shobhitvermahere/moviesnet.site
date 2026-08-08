'use client';

import { useEffect, useRef } from 'react';

export type { ThemePackId, ThemeConfig } from './theme-packs';
export { ThemePackConfig, THEME_IDS, isThemePackId } from './theme-packs';
export { ProfessionalLiveBackground } from './ProfessionalLiveBackground';
export { CinematicQuantumEngine } from './CinematicQuantumEngine';

export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />
      <div className="aurora-orb-3" />
    </div>
  );
}

export function FloatingParticles({ count = 30 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${15 + Math.random() * 25}s`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      particle.style.width = `${1 + Math.random() * 2}px`;
      particle.style.height = particle.style.width;
      particle.style.opacity = `${0.2 + Math.random() * 0.4}`;
      particle.style.background = [
        'rgba(232, 184, 109, 0.45)',
        'rgba(125, 211, 252, 0.35)',
        'rgba(255, 255, 255, 0.35)',
      ][Math.floor(Math.random() * 3)];

      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}

export function MouseSpotlight() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      document.querySelectorAll('.spotlight').forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        (el as HTMLElement).style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        (el as HTMLElement).style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return null;
}

export function SpatialScrollEffect() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMouseMoveOnCard = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.spatial-card') as HTMLElement | null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      target.style.setProperty('--tilt-x', `${(((y - centerY) / centerY) * -8).toFixed(2)}deg`);
      target.style.setProperty('--tilt-y', `${(((x - centerX) / centerX) * 8).toFixed(2)}deg`);
    };

    const handleMouseLeaveCard = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.spatial-card') as HTMLElement | null;
      if (target) {
        target.style.setProperty('--tilt-x', '0deg');
        target.style.setProperty('--tilt-y', '0deg');
      }
    };

    window.addEventListener('mousemove', handleMouseMoveOnCard);
    window.addEventListener('mouseout', handleMouseLeaveCard);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveOnCard);
      window.removeEventListener('mouseout', handleMouseLeaveCard);
    };
  }, []);

  return null;
}

export function NoiseOverlay() {
  return <div className="noise-overlay" aria-hidden="true" />;
}
