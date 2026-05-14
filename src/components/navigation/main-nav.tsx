'use client';

import React from 'react';
import { LogOut, User } from 'lucide-react';
import { MediaType, type Show, type NavItem } from '@/types';
import Link from 'next/link';
import {
  cn,
  getNameFromShow,
  getSearchValue,
  getShowHref,
  handleDefaultSearchBtn,
  handleDefaultSearchInp,
} from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import { useAuthStore } from '@/stores/auth';
import { ModeToggle as ThemeToggle } from '@/components/theme-toggle';
import { DebouncedInput } from '@/components/debounced-input';
import MovieService from '@/services/MovieService';
import CustomImage from '@/components/custom-image';

interface MainNavProps {
  items?: NavItem[];
}

interface SearchResult {
  results: Show[];
}

export function MainNav({ items }: MainNavProps) {
  const path = usePathname();
  const router = useRouter();
  const isWatchPage = path.startsWith('/watch/');
  // search store
  const searchStore = useSearchStore();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const openDialog = useAuthStore((state) => state.openDialog);
  const logout = useAuthStore((state) => state.logout);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  const handlePopstateEvent = React.useCallback(() => {
    const pathname = window.location.pathname;
    const search: string = getSearchValue('q');

    if (!search?.length || !pathname.includes('/search')) {
      searchStore.reset();
      searchStore.setOpen(false);
    } else if (search?.length) {
      searchStore.setOpen(true);
      searchStore.setLoading(true);
      searchStore.setQuery(search);
      setTimeout(() => {
        handleDefaultSearchBtn();
      }, 10);
      setTimeout(() => {
        handleDefaultSearchInp();
      }, 20);
      MovieService.searchMovies(search)
        .then((response: SearchResult) => {
          void searchStore.setShows(response.results);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => searchStore.setLoading(false));
    }
  }, [searchStore]);

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, [handlePopstateEvent]);

  async function searchShowsByQuery(value: string) {
    if (!value?.trim()?.length) {
      if (path === '/search') {
        router.push('/home');
      } else {
        window.history.pushState(null, '', path);
      }
      return;
    }

    if (getSearchValue('q')?.trim()?.length) {
      window.history.replaceState(null, '', `/search?q=${value}`);
    } else {
      window.history.pushState(null, '', `/search?q=${value}`);
    }

    searchStore.setQuery(value);
    searchStore.setLoading(true);
    const shows = await MovieService.searchMovies(value);
    searchStore.setLoading(false);
    void searchStore.setShows(shows.results);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // change background color on scroll
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setIsTouchDevice(
      window.matchMedia('(hover: none)').matches ||
        window.matchMedia('(pointer: coarse)').matches,
    );
  }, []);

  React.useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false);
    };
    window.addEventListener('scroll', changeBgColor);
    return () => window.removeEventListener('scroll', changeBgColor);
  }, [isScrolled]);

  const handleChangeStatusOpen = (value: boolean): void => {
    searchStore.setOpen(value);
    if (!value) searchStore.reset();
  };

  const suggestions = searchStore.query.trim().length
    ? searchStore.shows.slice(0, 6)
    : [];

  return (
    <nav
      className={cn(
        'pointer-events-auto relative flex h-12 w-full items-center justify-between px-[4vw] transition-all duration-300 md:h-16',
        isWatchPage
          ? isTouchDevice
            ? 'bg-black/55 rounded-b-2xl border-b border-white/10 shadow-2xl backdrop-blur-md'
            : 'bg-black/45 -translate-y-[calc(100%-0.85rem)] rounded-b-2xl border-b border-white/10 shadow-2xl backdrop-blur-md focus-within:translate-y-0 hover:translate-y-0'
          : 'bg-gradient-to-b from-secondary/70 from-10%',
        !isWatchPage && isScrolled ? 'bg-secondary shadow-md' : '',
        !isWatchPage && !isScrolled ? 'bg-transparent' : '',
      )}>
      <div className="flex items-center gap-6 md:gap-10">
        <Link
          href="/home"
          className="hidden md:block"
          onClick={() => handleChangeStatusOpen(false)}>
          <div className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" aria-hidden="true" />
            {/* <span className="inline-block font-bold">{siteConfig.name}</span> */}
            <span className="sr-only">Home</span>
          </div>
        </Link>
        {items?.length ? (
          <nav className="hidden gap-6 md:flex">
            {items?.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'flex items-center text-sm font-medium text-foreground/60 transition hover:text-foreground/80',
                      path === item.href && 'font-bold text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-80',
                    )}
                    onClick={() => handleChangeStatusOpen(false)}>
                    {item.title}
                  </Link>
                ),
            )}
          </nav>
        ) : null}
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-0 hover:bg-transparent focus:ring-0"
                // className="h-auto px-2 py-1.5 text-base hover:bg-neutral-800 focus:ring-0 dark:hover:bg-neutral-800 lg:hidden"
              >
                <Icons.logo className="h-6 w-6" />
                <span className="text-base font-bold">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={20}
              // className="w-52 overflow-y-auto overflow-x-hidden rounded-sm bg-neutral-800 text-slate-200 dark:bg-neutral-800 dark:text-slate-200"
              className="w-52 overflow-y-auto overflow-x-hidden rounded-sm">
              <DropdownMenuLabel>
                <Link
                  href="/home"
                  className="flex items-center justify-center"
                  onClick={() => handleChangeStatusOpen(false)}>
                  {/* <Icons.logo */}
                  {/*   className="mr-2 h-4 w-4 text-red-600" */}
                  {/*   aria-hidden="true" */}
                  {/* /> */}
                  <span className="">{siteConfig.name}</span>
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {items?.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  asChild
                  className="items-center justify-center">
                  {item.href && (
                    <Link
                      href={item.href}
                      onClick={() => handleChangeStatusOpen(false)}>
                      {/* {item.icon &&  */}
                      {/*   <item.icon className="mr-2 h-4 w-4" aria-hidden="true" /> */}
                      {/* } */}
                      <span
                        className={cn(
                          'line-clamp-1 text-foreground/60 hover:text-foreground/80',
                          path === item.href && 'font-bold text-foreground',
                        )}>
                        {item.title}
                      </span>
                    </Link>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <DebouncedInput
            id="search-input"
            open={searchStore.isOpen}
            value={searchStore.query}
            onChange={searchShowsByQuery}
            onChangeStatusOpen={handleChangeStatusOpen}
            containerClassName={cn(path === '/home' ? 'hidden' : 'flex')}
          />
          {searchStore.isOpen && searchStore.query.trim().length ? (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[1300] w-[min(88vw,22rem)] overflow-hidden rounded-2xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Search
                  </p>
                  <p className="text-sm font-medium">Quick matches</p>
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(searchStore.query)}`}
                  className="text-xs font-medium text-primary"
                  onClick={() => handleChangeStatusOpen(false)}>
                  See all
                </Link>
              </div>
              <div className="max-h-[22rem] overflow-y-auto p-2">
                {searchStore.loading ? (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Searching titles...
                  </div>
                ) : suggestions.length ? (
                  suggestions.map((show) => (
                    <Link
                      key={`${show.media_type}-${show.id}`}
                      href={getShowHref(show)}
                      onClick={() => handleChangeStatusOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5">
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-secondary/60">
                        <CustomImage
                          src={
                            show.poster_path ?? show.backdrop_path
                              ? `https://image.tmdb.org/t/p/w300${
                                  show.poster_path ?? show.backdrop_path
                                }`
                              : '/images/grey-thumbnail.jpg'
                          }
                          alt={getNameFromShow(show)}
                          className="object-cover"
                          fill
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {getNameFromShow(show)}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase tracking-[0.18em]">
                            {show.media_type === MediaType.TV
                              ? 'TV Show'
                              : 'Movie'}
                          </span>
                          <span>{Math.round(show.vote_average * 10)}%</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No quick matches. Try a title, actor, or genre.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {hydrated ? (
          user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full border border-white/10 bg-white/5 px-3 text-white hover:bg-white/10 hover:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span className="max-w-[7rem] truncate text-sm font-medium">
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl border-white/10 bg-black/95 p-2 text-white shadow-2xl">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="rounded-xl px-3 py-2 text-white focus:bg-white/10 focus:text-white"
                  onSelect={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => openDialog('register')}
              className="h-10 rounded-full border-white/10 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white">
              Join
            </Button>
          )
        ) : null}

        <ThemeToggle />
      </div>
    </nav>
  );
}

export default MainNav;
