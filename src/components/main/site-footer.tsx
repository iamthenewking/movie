import React from 'react';
import { siteConfig } from '@/configs/site';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const SiteFooter = () => {
  return (
    <footer aria-label="Footer" className="w-full">
      <div className="container grid w-full max-w-6xl gap-7 py-10">
        <div className="flex flex-wrap items-center gap-2">
          {siteConfig.socialLinks.map(
            (item, i) =>
              item.href && (
                <Link key={i} href={item.href} target="_blank" rel="noreferrer">
                  <div
                    className={buttonVariants({
                      size: 'sm',
                      variant: 'ghost',
                      className:
                        // "rounded-none text-neutral-700 hover:bg-transparent dark:text-neutral-50 dark:hover:bg-transparent",
                        'rounded-none hover:bg-transparent',
                    })}>
                    {item.icon && <item.icon className="h-6 w-6" />}
                    <span className="sr-only">{item.title}</span>
                  </div>
                </Link>
              ),
          )}
        </div>

        <p className="text-xs text-foreground/60 sm:text-sm">
          @ 2023-{new Date().getFullYear()} {siteConfig.author} x
          @iamthenewking.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
