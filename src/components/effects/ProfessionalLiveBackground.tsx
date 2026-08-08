'use client';

import { useEffect, useRef } from 'react';
import type { ThemePackId } from './theme-packs';

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  hue: number;
  twinkle: number;
  phase: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileViewport() {
  return window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
}

function seedStars(width: number, height: number, count: number, warmBias = 0.08): Star[] {
  return Array.from({ length: count }, () => {
    const z = Math.random();
    const roll = Math.random();
    let hue = 0;
    if (roll < warmBias) hue = 30 + Math.random() * 25;
    else if (roll < warmBias + 0.12) hue = 200 + Math.random() * 40;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      z,
      size: (1 - z) * 1.7 + 0.3,
      hue,
      twinkle: 0.35 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  time: number,
  reduced: boolean,
  brightness = 1
) {
  for (const s of stars) {
    const flicker = reduced
      ? 0.72
      : 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(time * s.twinkle + s.phase));
    const alpha = (0.22 + (1 - s.z) * 0.68) * flicker * brightness;
    const size = s.size * (0.85 + flicker * 0.18);

    if (s.hue > 0) {
      ctx.fillStyle = `hsla(${s.hue}, 48%, 76%, ${alpha.toFixed(3)})`;
    } else {
      ctx.fillStyle = `rgba(232, 236, 245, ${alpha.toFixed(3)})`;
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
    ctx.fill();

    if (s.z < 0.28 && size > 1.15) {
      const bloom = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, size * 3.6);
      bloom.addColorStop(0, `rgba(255,255,255,${(alpha * 0.18).toFixed(3)})`);
      bloom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(s.x, s.y, size * 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number, strength = 0.7) {
  const v = ctx.createRadialGradient(
    width * 0.5,
    height * 0.46,
    Math.min(width, height) * 0.18,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.74
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(0.55, `rgba(0,0,0,${(0.12 * strength).toFixed(3)})`);
  v.addColorStop(1, `rgba(0,0,0,${strength.toFixed(3)})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, width, height);

  const top = ctx.createLinearGradient(0, 0, 0, height * 0.2);
  top.addColorStop(0, 'rgba(0,0,0,0.42)');
  top.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, width, height * 0.2);
}

function softCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function ProfessionalLiveBackground({ theme }: { theme: ThemePackId }) {
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
    let particles: Particle[] = [];
    let dust: { angle: number; radius: number; speed: number; size: number; warmth: number; alpha: number }[] = [];

    const seed = () => {
      const area = width * height;
      const starCount = Math.min(Math.floor(area / (reduced ? 10000 : 5600)), reduced ? 80 : 200);
      const warmBias = theme === 'ember' || theme === 'horizon' ? 0.14 : 0.06;
      stars = seedStars(width, height, starCount, warmBias);

      particles = Array.from({ length: reduced ? 0 : isMobileViewport() ? 28 : 52 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.2,
        size: 0.6 + Math.random() * 1.8,
        alpha: 0.12 + Math.random() * 0.28,
        life: Math.random() * Math.PI * 2,
      }));

      dust = Array.from({ length: reduced ? 0 : isMobileViewport() ? 40 : 78 }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.32 + Math.random() * 0.78,
        speed: 0.1 + Math.random() * 0.32,
        size: 0.7 + Math.random() * 2.2,
        warmth: Math.random(),
        alpha: 0.14 + Math.random() * 0.32,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      renderScale = isMobileViewport() ? 0.62 : 0.82;

      canvas.width = Math.max(1, Math.floor(width * dpr * renderScale));
      canvas.height = Math.max(1, Math.floor(height * dpr * renderScale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr * renderScale, 0, 0, dpr * renderScale, 0, 0);
      seed();
    };

    const drawHorizon = (cx: number, cy: number) => {
      const minDim = Math.min(width, height);
      const R = minDim * (isMobileViewport() ? 0.11 : 0.124);
      const photonR = R * 1.18;
      const diskInner = R * 1.32;
      const diskOuter = R * 2.5;
      const tilt = 0.17;

      softCloud(ctx, cx, cy, diskOuter * 1.55, 'rgba(255, 196, 120, 0.09)');

      ctx.save();
      ctx.translate(cx, cy);

      const topLens = ctx.createRadialGradient(0, -R * 0.35, R * 0.7, 0, -R * 0.35, diskOuter);
      topLens.addColorStop(0, 'rgba(255,248,230,0.48)');
      topLens.addColorStop(0.35, 'rgba(245,160,70,0.28)');
      topLens.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topLens;
      ctx.beginPath();
      ctx.ellipse(0, -R * 0.7, diskOuter, diskOuter * 0.58, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      const botLens = ctx.createRadialGradient(0, R * 0.35, R * 0.7, 0, R * 0.35, diskOuter * 0.95);
      botLens.addColorStop(0, 'rgba(255,240,210,0.38)');
      botLens.addColorStop(0.4, 'rgba(210,110,45,0.2)');
      botLens.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = botLens;
      ctx.beginPath();
      ctx.ellipse(0, R * 0.7, diskOuter * 0.95, diskOuter * 0.5, 0, 0, Math.PI);
      ctx.fill();

      ctx.save();
      ctx.rotate(tilt);
      const disk = ctx.createRadialGradient(0, 0, diskInner * 0.85, 0, 0, diskOuter);
      disk.addColorStop(0, 'rgba(255,252,245,0.9)');
      disk.addColorStop(0.12, 'rgba(255,220,150,0.72)');
      disk.addColorStop(0.4, 'rgba(235,140,50,0.42)');
      disk.addColorStop(0.75, 'rgba(120,40,18,0.16)');
      disk.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = disk;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskOuter, diskOuter * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) {
        for (const d of dust) {
          d.angle += d.speed * (1.5 - d.radius * 0.65) * 0.016;
          const r = diskInner + (diskOuter - diskInner) * d.radius;
          const cosA = Math.cos(d.angle);
          const doppler = 1 - cosA * 0.45;
          const px = cosA * r;
          const py = Math.sin(d.angle) * r * 0.25;
          const a = Math.min(0.65, d.alpha * doppler);
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,${Math.floor(150 + d.warmth * 70)},${Math.floor(70 + (1 - d.warmth) * 30)},${a.toFixed(3)})`;
          ctx.arc(px, py, d.size * (0.7 + doppler * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const shade = ctx.createLinearGradient(-diskOuter, 0, diskOuter, 0);
      shade.addColorStop(0, 'rgba(255,245,220,0.16)');
      shade.addColorStop(0.5, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskOuter, diskOuter * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const photon = ctx.createRadialGradient(0, 0, R * 0.92, 0, 0, photonR * 1.1);
      photon.addColorStop(0, 'rgba(0,0,0,0)');
      photon.addColorStop(0.55, 'rgba(255,248,235,0.9)');
      photon.addColorStop(0.78, 'rgba(255,210,140,0.4)');
      photon.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = photon;
      ctx.beginPath();
      ctx.arc(0, 0, photonR * 1.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 26;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const drawAurora = () => {
      softCloud(ctx, width * 0.25, height * 0.2, Math.min(width, height) * 0.55, 'rgba(94, 234, 212, 0.10)');
      softCloud(ctx, width * 0.7, height * 0.28, Math.min(width, height) * 0.5, 'rgba(124, 140, 255, 0.09)');
      softCloud(ctx, width * 0.5, height * 0.15, Math.min(width, height) * 0.4, 'rgba(167, 243, 208, 0.07)');

      if (reduced) return;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let band = 0; band < 4; band++) {
        const baseY = height * (0.18 + band * 0.08);
        const amp = 28 + band * 10;
        const speed = 0.22 + band * 0.05;
        const colors = [
          'rgba(94,234,212,0.11)',
          'rgba(125,211,252,0.09)',
          'rgba(129,140,248,0.10)',
          'rgba(52,211,153,0.08)',
        ];

        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y =
            baseY +
            Math.sin(x * 0.004 + time * speed + band) * amp +
            Math.sin(x * 0.01 + time * 0.35 + band * 1.3) * (amp * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const g = ctx.createLinearGradient(0, baseY - 80, 0, baseY + 160);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.35, colors[band]);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.restore();
    };

    const drawEmber = () => {
      softCloud(ctx, width * 0.7, height * 0.75, Math.min(width, height) * 0.7, 'rgba(232, 184, 109, 0.12)');
      softCloud(ctx, width * 0.3, height * 0.8, Math.min(width, height) * 0.55, 'rgba(180, 70, 30, 0.10)');
      softCloud(ctx, width * 0.55, height * 0.55, Math.min(width, height) * 0.35, 'rgba(255, 210, 140, 0.06)');

      if (reduced) return;
      for (const p of particles) {
        p.y -= 0.25 + Math.sin(p.life) * 0.15;
        p.x += Math.sin(time + p.life) * 0.2;
        p.life += 0.02;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.life));
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, ${180 + Math.floor(Math.random() * 40)}, 90, ${a.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawAbyss = () => {
      softCloud(ctx, width * 0.35, height * 0.55, Math.min(width, height) * 0.65, 'rgba(13, 90, 100, 0.16)');
      softCloud(ctx, width * 0.7, height * 0.4, Math.min(width, height) * 0.5, 'rgba(45, 160, 150, 0.10)');
      softCloud(ctx, width * 0.5, height * 0.75, Math.min(width, height) * 0.45, 'rgba(20, 60, 90, 0.12)');

      if (reduced) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const cx = width * (0.2 + i * 0.15) + Math.sin(time * 0.3 + i) * 40;
        const cy = height * (0.45 + Math.sin(time * 0.2 + i * 0.7) * 0.12);
        softCloud(ctx, cx, cy, 90 + i * 18, `rgba(80, 220, 200, ${0.04 + i * 0.008})`);
      }
      ctx.restore();
    };

    const drawMidnight = () => {
      softCloud(ctx, width * 0.5, height * 0.35, Math.min(width, height) * 0.7, 'rgba(40, 60, 100, 0.12)');
      softCloud(ctx, width * 0.2, height * 0.7, Math.min(width, height) * 0.45, 'rgba(30, 40, 70, 0.10)');
      softCloud(ctx, width * 0.8, height * 0.55, Math.min(width, height) * 0.4, 'rgba(70, 90, 130, 0.08)');
    };

    const drawNoir = () => {
      softCloud(ctx, width * 0.5, height * 0.4, Math.min(width, height) * 0.55, 'rgba(180, 180, 190, 0.05)');
      softCloud(ctx, width * 0.25, height * 0.65, Math.min(width, height) * 0.4, 'rgba(120, 120, 130, 0.05)');
      softCloud(ctx, width * 0.75, height * 0.3, Math.min(width, height) * 0.35, 'rgba(200, 200, 210, 0.04)');

      // Soft diagonal edge light
      const edge = ctx.createLinearGradient(0, 0, width, height);
      edge.addColorStop(0, 'rgba(255,255,255,0.03)');
      edge.addColorStop(0.45, 'rgba(0,0,0,0)');
      edge.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, width, height);
    };

    const bases: Record<ThemePackId, string> = {
      horizon: '#03050a',
      aurora: '#040812',
      midnight: '#05070f',
      ember: '#0a0705',
      abyss: '#02080c',
      noir: '#080808',
    };

    const renderFrame = (staticMode = false) => {
      ctx.fillStyle = bases[theme];
      ctx.fillRect(0, 0, width, height);

      const camX = staticMode ? 0 : Math.sin(time * 0.2) * width * 0.0035;
      const camY = staticMode ? 0 : Math.cos(time * 0.16) * height * 0.003;
      const cx = width * 0.5 + camX;
      const cy = height * 0.48 + camY;

      if (theme === 'horizon') {
        softCloud(ctx, cx - width * 0.25, cy - height * 0.1, Math.min(width, height) * 0.55, 'rgba(28,48,92,0.12)');
        softCloud(ctx, cx + width * 0.28, cy + height * 0.08, Math.min(width, height) * 0.5, 'rgba(42,28,68,0.08)');
        drawStars(ctx, stars, time, reduced, 1);
        drawHorizon(cx, cy);
        drawVignette(ctx, width, height, 0.72);
      } else if (theme === 'aurora') {
        drawStars(ctx, stars, time, reduced, 0.85);
        drawAurora();
        drawVignette(ctx, width, height, 0.65);
      } else if (theme === 'ember') {
        drawStars(ctx, stars, time, reduced, 0.7);
        drawEmber();
        drawVignette(ctx, width, height, 0.68);
      } else if (theme === 'abyss') {
        drawStars(ctx, stars, time, reduced, 0.55);
        drawAbyss();
        drawVignette(ctx, width, height, 0.7);
      } else if (theme === 'midnight') {
        drawMidnight();
        drawStars(ctx, stars, time, reduced, 1.05);
        drawVignette(ctx, width, height, 0.62);
      } else {
        drawNoir();
        drawStars(ctx, stars, time, reduced, 0.55);
        drawVignette(ctx, width, height, 0.55);
      }
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
      seed();
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

    if (reduced) renderFrame(true);
    else animationFrameId = requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionPref);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ background: '#03050a' }}
      aria-hidden="true"
    />
  );
}
