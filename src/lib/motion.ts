/** Shared Framer Motion presets — smooth, GPU-friendly easing. */
export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const SCROLL_REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-48px' as const },
  transition: { duration: 0.55, ease: MOTION_EASE },
};

export const SPRING_SMOOTH = { type: 'spring' as const, stiffness: 380, damping: 32 };

export const STAGGER_GRID = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.04 },
  },
};

export const STAGGER_CARD = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: MOTION_EASE },
  },
};

export const FAQ_CONTENT = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.32, ease: MOTION_EASE },
};
