import { Variants } from 'framer-motion';

export const slideVariants: Variants = {
  enter: (direction: 'prev' | 'next') => ({
    x: direction === 'next' ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: 'prev' | 'next') => ({
    x: direction === 'next' ? -300 : 300,
    opacity: 0
  })
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const scaleVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};