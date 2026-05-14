'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/configs/site';
import MainNav from '@/components/navigation/main-nav';
import { cn } from '@/lib/utils';

const SiteHeader = () => {
  const pathname = usePathname();
  const isWatchPage = pathname.startsWith('/watch/');

  return (
    <header
      className={cn(
        'z-50',
        isWatchPage
          ? 'pointer-events-none fixed inset-x-0 top-0 z-[1200]'
          : 'sticky top-0',
      )}>
      <MainNav items={siteConfig.mainNav} />
      {/* <MobileNav items={siteConfig.mainNav} className="md:hidden" /> */}
    </header>
  );
};

export default SiteHeader;
