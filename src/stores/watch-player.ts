import { create } from 'zustand';
import { type StoredShow } from '@/lib/personalization';

export type WatchPlayerConfig = {
  url: string;
  title: string;
  providerLabel: string;
  backHref: string;
  nextProviderHref?: string;
  watchHref: string;
  show: StoredShow;
};

interface WatchPlayerState {
  config: WatchPlayerConfig | null;
  started: boolean;
  setConfig: (config: WatchPlayerConfig) => void;
  setStarted: (started: boolean) => void;
  clear: () => void;
}

export const useWatchPlayerStore = create<WatchPlayerState>()((set) => ({
  config: null,
  started: false,
  setConfig: (config) =>
    set((state) => ({
      config,
      started:
        state.config?.watchHref === config.watchHref ? state.started : false,
    })),
  setStarted: (started) => set(() => ({ started })),
  clear: () => set(() => ({ config: null, started: false })),
}));
