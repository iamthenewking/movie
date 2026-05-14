'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import EmbedPlayer from '@/components/watch/embed-player';
import { useWatchPlayerStore } from '@/stores/watch-player';

export default function GlobalWatchPlayer() {
  const pathname = usePathname();
  const { config, started, setStarted, clear } = useWatchPlayerStore();
  const isWatchRoute = pathname.startsWith('/watch/');

  if (!config) {
    return null;
  }

  if (!isWatchRoute && !started) {
    return null;
  }

  return (
    <EmbedPlayer
      {...config}
      mode={isWatchRoute ? 'full' : 'mini'}
      started={started}
      onPlaybackStart={() => setStarted(true)}
      onClose={clear}
    />
  );
}
