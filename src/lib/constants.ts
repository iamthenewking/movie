import type { Variants } from 'framer-motion';

// framer motion
export const itemsReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
    },
  },
};

export const itemFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
};

export const DISCOVERY_TRENDING_QUERIES = [
  'thriller',
  'k-drama',
  'romantic comedy',
  'spy series',
  'space adventure',
  'animated movies',
];
