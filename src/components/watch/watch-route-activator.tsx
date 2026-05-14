'use client';

import React from 'react';
import {
  type WatchPlayerConfig,
  useWatchPlayerStore,
} from '@/stores/watch-player';

export default function WatchRouteActivator({
  config,
}: {
  config: WatchPlayerConfig;
}) {
  const setConfig = useWatchPlayerStore((state) => state.setConfig);

  React.useEffect(() => {
    setConfig(config);
  }, [config, setConfig]);

  return <div className="min-h-screen bg-black" />;
}
