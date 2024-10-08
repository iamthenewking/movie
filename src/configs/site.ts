// import type { FooterItem, MainNavItem } from "@/types"
//
// import { productCategories } from "@/config/products"
// import { slugify } from "@/lib/utils"

import { Icons } from '@/components/icons';
import { env } from '@/env.mjs';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: env.NEXT_PUBLIC_SITE_NAME,
  author: env.NEXT_PUBLIC_SITE_NAME,
  slogan: 'Unlimited Movies, TV Shows, and more',
  description:
    'Watch movies & TV shows online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more.',
  keywords: [
    'watch movies',
    'movies online',
    'watch TV',
    'TV online',
    'TV shows online',
    'watch TV shows',
    'stream movies',
    'stream tv',
    'instant streaming',
    'watch online',
    'movies',
    'watch TV online',
    'no download',
    'full length movies',
    env.NEXT_PUBLIC_SITE_NAME,
  ],
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/images/hero.jpg`,

  // socialLinks: [
  //   {
  //     title: 'Facebook',
  //     href: `${env.NEXT_PUBLIC_FACEBOOK}`,
  //     icon: Icons.facebook,
  //   },
  //   {
  //     title: 'Instagram',
  //     href: `${env.NEXT_PUBLIC_INSTAGRAM}`,
  //     icon: Icons.instagram,
  //   },
  //   {
  //     title: 'Twitter',
  //     href: `${env.NEXT_PUBLIC_TWITTER}`,
  //     icon: Icons.twitter,
  //   },
  //   {
  //     title: 'Youtube',
  //     href: `${env.NEXT_PUBLIC_YOUTUBE}`,
  //     icon: Icons.youtube,
  //   },
  // ],

  footerItems: [
    { title: 'Korean Movies', href: '/korean' },
    { title: 'New and Popular', href: '/new-and-popular' },
    { title: 'Comedy', href: '/comedy' },
    { title: 'Scary Movies', href: '/scary' },
  ],
  mainNav: [
    {
      title: 'Home',
      href: '/home',
    },
    {
      title: 'TV Shows',
      href: '/tv-shows',
    },
    {
      title: 'Movies',
      href: '/movies',
    },
    {
      title: 'New & Popular',
      href: '/new-and-popular',
    },
  ],
};
