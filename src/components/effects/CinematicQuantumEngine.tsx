'use client';

import { useEffect, useRef } from 'react';

/**
 * Professional cinematic deep-space backdrop.
 * Layered starfield + soft nebula haze + physically-inspired accretion disk.
 * Tuned for readability: vivid center presence, restrained brightness, soft falloff.
 */

type Star = {
  x: number;
  y: number;
  z: number; // 0 near … 1 far
  size: number;
  hue: number;
  twinkle: number;
  phase: number;
};

type Dust = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  warmth: number;
  alpha: number;
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileViewport() {
  return window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
}

export function CinematicQuantumEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let renderScale = 1;
    let time = 0;
    let lastTs = 0;
    let running = true;
    let reduced = prefersReducedMotion();

    let stars: Star[] = [];
    let dust: Dust[] = [];

    const seedField = () => {
      const area = width * height;
      const starCount = Math.min(Math.floor(area / (reduced ? 9000 : 5200)), reduced ? 90 : 220);
      const dustCount = reduced ? 0 : isMobileViewport() ? 48 : 90;

      stars = Array.from({ length: starCount }, () => {
        const z = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          size: (1 - z) * 1.8 + 0.35,
          hue: Math.random() > 0.82 ? 210 + Math.random() * 30 : Math.random() > 0.9 ? 35 : 0,
          twinkle: 0.4 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
        };
      });

      dust = Array.from({ length: dustCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.35 + Math.random() * 0.75,
        speed: 0.12 + Math.random() * 0.35,
        size: 0.8 + Math.random() * 2.4,
        warmth: Math.random(),
        alpha: 0.15 + Math.random() * 0.35,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      renderScale = isMobileViewport() ? 0.65 : 0.85;

      const rw = Math.max(1, Math.floor(width * dpr * renderScale));
      const rh = Math.max(1, Math.floor(height * dpr * renderScale));

      canvas.width = rw;
      canvas.height = rh;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr * renderScale, 0, 0, dpr * renderScale, 0, 0);
      seedField();
    };

    const drawNebula = (cx: number, cy: number, base: number) => {
      // Distant cool haze — atmospheric depth, not neon blobs
      const clouds = [
        { x: cx - base * 2.2, y: cy - base * 1.1, r: base * 3.4, c: 'rgba(28, 48, 92, 0.16)' },
        { x: cx + base * 2.4, y: cy + base * 0.9, r: base * 3.1, c: 'rgba(42, 28, 68, 0.12)' },
        { x: cx - base * 0.4, y: cy + base * 1.8, r: base * 2.6, c: 'rgba(18, 62, 78, 0.10)' },
        { x: cx + base * 1.6, y: cy - base * 1.6, r: base * 2.2, c: 'rgba(72, 42, 28, 0.08)' },
      ];

      for (const cloud of clouds) {
        const driftX = Math.sin(time * 0.07 + cloud.x * 0.001) * base * 0.08;
        const driftY = Math.cos(time * 0.05 + cloud.y * 0.001) * base * 0.06;
        const g = ctx.createRadialGradient(
          cloud.x + driftX,
          cloud.y + driftY,
          0,
          cloud.x + driftX,
          cloud.y + driftY,
          cloud.r
        );
        g.addColorStop(0, cloud.c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cloud.x + driftX, cloud.y + driftY, cloud.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawStars = () => {
      for (const s of stars) {
        const flicker = reduced
          ? 0.75
          : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * s.twinkle + s.phase));
        const alpha = (0.25 + (1 - s.z) * 0.65) * flicker;
        const size = s.size * (0.85 + flicker * 0.2);

        if (s.hue > 0) {
          ctx.fillStyle = `hsla(${s.hue}, 55%, 78%, ${alpha.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(235, 240, 255, ${alpha.toFixed(3)})`;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Soft bloom on nearer stars
        if (s.z < 0.35 && size > 1.2) {
          const bloom = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, size * 4);
          bloom.addColorStop(0, `rgba(255,255,255,${(alpha * 0.22).toFixed(3)})`);
          bloom.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bloom;
          ctx.beginPath();
          ctx.arc(s.x, s.y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawBlackHole = (cx: number, cy: number) => {
      const minDim = Math.min(width, height);
      const R = minDim * (isMobileViewport() ? 0.11 : 0.125);
      const photonR = R * 1.18;
      const diskInner = R * 1.32;
      const diskOuter = R * 2.55;
      const tilt = 0.18; // ~10°

      // Ambient warm glow behind the system (subtle, professional)
      const ambient = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, diskOuter * 1.6);
      ambient.addColorStop(0, 'rgba(255, 196, 120, 0.10)');
      ambient.addColorStop(0.35, 'rgba(180, 90, 40, 0.07)');
      ambient.addColorStop(0.7, 'rgba(40, 20, 10, 0.04)');
      ambient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ambient;
      ctx.beginPath();
      ctx.arc(cx, cy, diskOuter * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);

      // --- Gravitational lensing arches (soft, rear disk light) ---
      const drawLensArch = (ySign: number, brightness: number) => {
        ctx.save();
        const gy = ySign * R * 0.55;
        const lens = ctx.createRadialGradient(0, gy * 0.4, R * 0.7, 0, gy * 0.4, diskOuter * 1.05);
        lens.addColorStop(0, `rgba(255, 248, 230, ${(0.55 * brightness).toFixed(3)})`);
        lens.addColorStop(0.2, `rgba(255, 210, 140, ${(0.42 * brightness).toFixed(3)})`);
        lens.addColorStop(0.48, `rgba(230, 120, 45, ${(0.28 * brightness).toFixed(3)})`);
        lens.addColorStop(0.78, `rgba(120, 35, 18, ${(0.12 * brightness).toFixed(3)})`);
        lens.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lens;
        ctx.beginPath();
        if (ySign < 0) {
          ctx.ellipse(0, gy, diskOuter * 1.02, diskOuter * 0.62, 0, Math.PI, Math.PI * 2);
        } else {
          ctx.ellipse(0, gy, diskOuter * 0.98, diskOuter * 0.55, 0, 0, Math.PI);
        }
        ctx.fill();
        ctx.restore();
      };

      drawLensArch(-1, 0.85);
      drawLensArch(1, 0.7);

      // --- Main accretion disk ---
      ctx.save();
      ctx.rotate(tilt);

      // Soft disk body
      const disk = ctx.createRadialGradient(0, 0, diskInner * 0.85, 0, 0, diskOuter);
      disk.addColorStop(0, 'rgba(255, 252, 245, 0.92)');
      disk.addColorStop(0.1, 'rgba(255, 220, 150, 0.78)');
      disk.addColorStop(0.32, 'rgba(245, 150, 55, 0.55)');
      disk.addColorStop(0.58, 'rgba(180, 55, 28, 0.28)');
      disk.addColorStop(0.82, 'rgba(60, 18, 12, 0.10)');
      disk.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = disk;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskOuter, diskOuter * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner hot ring
      const innerHot = ctx.createRadialGradient(0, 0, diskInner * 0.7, 0, 0, diskInner * 1.35);
      innerHot.addColorStop(0, 'rgba(255,255,255,0)');
      innerHot.addColorStop(0.45, 'rgba(255, 245, 220, 0.55)');
      innerHot.addColorStop(0.75, 'rgba(255, 190, 100, 0.25)');
      innerHot.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = innerHot;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskInner * 1.35, diskInner * 1.35 * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // Turbulent orbital dust (Doppler-beamed)
      if (!reduced) {
        for (const d of dust) {
          const orbital = 1.55 - d.radius * 0.7;
          d.angle += d.speed * orbital * 0.016;
          const r = diskInner + (diskOuter - diskInner) * d.radius;
          const cosA = Math.cos(d.angle);
          const sinA = Math.sin(d.angle);
          // Approaching side (left / negative X) is brighter — relativistic beaming
          const doppler = 1 - cosA * 0.48;
          const px = cosA * r;
          const py = sinA * r * 0.26;

          const warmth = d.warmth;
          const rC = Math.floor(255);
          const gC = Math.floor(140 + warmth * 90);
          const bC = Math.floor(60 + (1 - warmth) * 40);
          const a = Math.min(0.7, d.alpha * doppler);

          ctx.beginPath();
          ctx.fillStyle = `rgba(${rC},${gC},${bC},${a.toFixed(3)})`;
          ctx.arc(px, py, d.size * (0.7 + doppler * 0.45), 0, Math.PI * 2);
          ctx.fill();

          // Short motion trail on bright side
          if (doppler > 1.15) {
            const trail = 0.22 * doppler;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,230,180,${(a * 0.35).toFixed(3)})`;
            ctx.lineWidth = Math.max(0.6, d.size * 0.45);
            ctx.ellipse(0, 0, r, r * 0.26, 0, d.angle - trail, d.angle);
            ctx.stroke();
          }
        }
      }

      // Doppler shading overlay across disk
      const dopplerShade = ctx.createLinearGradient(-diskOuter, 0, diskOuter, 0);
      dopplerShade.addColorStop(0, 'rgba(255, 245, 220, 0.18)');
      dopplerShade.addColorStop(0.45, 'rgba(0,0,0,0)');
      dopplerShade.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = dopplerShade;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskOuter, diskOuter * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // tilt

      // --- Photon ring (soft, no hard cartoon stroke) ---
      const photon = ctx.createRadialGradient(0, 0, R * 0.92, 0, 0, photonR * 1.12);
      photon.addColorStop(0, 'rgba(0,0,0,0)');
      photon.addColorStop(0.42, 'rgba(0,0,0,0)');
      photon.addColorStop(0.58, 'rgba(255, 248, 235, 0.95)');
      photon.addColorStop(0.72, 'rgba(255, 210, 140, 0.55)');
      photon.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = photon;
      ctx.beginPath();
      ctx.arc(0, 0, photonR * 1.12, 0, Math.PI * 2);
      ctx.fill();

      // Thin bright filament along photon sphere
      ctx.beginPath();
      ctx.arc(0, 0, photonR * 0.99, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 250, 240, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = 'rgba(255, 220, 160, 0.65)';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Event horizon (absolute void) ---
      const voidGrad = ctx.createRadialGradient(-R * 0.15, -R * 0.1, 0, 0, 0, R);
      voidGrad.addColorStop(0, '#000000');
      voidGrad.addColorStop(0.85, '#000000');
      voidGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = voidGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 28;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore(); // translate
    };

    const drawVignette = () => {
      // Keep UI readable — darken edges, especially top/header band
      const v = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        Math.min(width, height) * 0.2,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72
      );
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(0.55, 'rgba(0,0,0,0.15)');
      v.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, width, height);

      const top = ctx.createLinearGradient(0, 0, 0, height * 0.22);
      top.addColorStop(0, 'rgba(0,0,0,0.45)');
      top.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, width, height * 0.22);
    };

    const renderFrame = (staticMode = false) => {
      // Deep space base — slight navy, not pure #000 flat void
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, width, height);

      const camX = staticMode ? 0 : Math.sin(time * 0.22) * width * 0.004;
      const camY = staticMode ? 0 : Math.cos(time * 0.18) * height * 0.0035;
      const cx = width * 0.5 + camX;
      const cy = height * 0.48 + camY;
      const base = Math.min(width, height) * 0.13;

      drawNebula(cx, cy, base);
      drawStars();
      drawBlackHole(cx, cy);
      drawVignette();
    };

    const tick = (ts: number) => {
      if (!running) return;
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      time += dt;

      renderFrame(false);
      animationFrameId = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(animationFrameId);
      } else if (!reduced) {
        running = true;
        lastTs = 0;
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const onMotionPref = () => {
      reduced = prefersReducedMotion();
      seedField();
      if (reduced) {
        running = false;
        cancelAnimationFrame(animationFrameId);
        renderFrame(true);
      } else if (!document.hidden) {
        running = true;
        lastTs = 0;
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', onMotionPref);

    if (reduced) {
      renderFrame(true);
    } else {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionPref);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03050a]"
      aria-hidden="true"
    />
  );
}
