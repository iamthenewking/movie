'use client';
import React from 'react';
import {
  ArrowLeft,
  Copy,
  Flag,
  Minimize2,
  Play,
  Share2,
  Tv2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  recordContinueWatching,
  toStoredShow,
  type StoredShow,
} from '@/lib/personalization';

interface EmbedPlayerProps {
  url: string;
  title: string;
  providerLabel: string;
  backHref: string;
  nextProviderHref?: string;
  watchHref: string;
  show: StoredShow;
  mode: 'full' | 'mini';
  started: boolean;
  onPlaybackStart: () => void;
  onClose: () => void;
}

function EmbedPlayer(props: EmbedPlayerProps) {
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [currentUrl, setCurrentUrl] = React.useState('');
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied'>('idle');
  const [reportStatus, setReportStatus] = React.useState<'idle' | 'sent'>(
    'idle',
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasLoadError, setHasLoadError] = React.useState(false);
  const hasStarted = props.started;
  const isMini = props.mode === 'mini';

  React.useEffect(() => {
    if (ref.current && hasStarted) {
      setIsLoading(true);
      setHasLoadError(false);
      ref.current.style.opacity = '0';
      ref.current.src = props.url;
    }

    const iframe: HTMLIFrameElement | null = ref.current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [hasStarted, props.url]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setCurrentUrl(new URL(props.watchHref, window.location.origin).toString());
  }, [props.watchHref]);

  React.useEffect(() => {
    if (!hasStarted || !currentUrl) {
      return;
    }
    recordContinueWatching({
      show: toStoredShow(props.show),
      watchHref: currentUrl,
      detailHref: props.backHref,
      updatedAt: new Date().toISOString(),
    });
  }, [currentUrl, hasStarted, props.backHref, props.show]);

  React.useEffect(() => {
    if (!hasStarted) {
      return;
    }
    const timer = window.setTimeout(() => {
      setHasLoadError(true);
      setIsLoading(false);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [hasStarted, props.url]);

  const handleIframeLoaded = () => {
    if (!ref.current) {
      return;
    }
    const iframe: HTMLIFrameElement = ref.current;
    if (iframe) iframe.style.opacity = '1';
    setIsLoading(false);
    setHasLoadError(false);
  };

  const handleNativeShare = async () => {
    if (!currentUrl) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ url: currentUrl, title: props.title });
        return;
      }
      await navigator.clipboard.writeText(currentUrl);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1500);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error(error);
    }
  };

  const handleCopyLink = async () => {
    if (!currentUrl || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReportBroken = async () => {
    if (!currentUrl || typeof window === 'undefined') {
      return;
    }

    try {
      const reportText = `Broken stream report\nTitle: ${props.title}\nProvider: ${props.providerLabel}\nPage: ${currentUrl}`;
      await navigator.clipboard.writeText(reportText);
      setReportStatus('sent');
      window.setTimeout(() => setReportStatus('idle'), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={
        isMini
          ? 'fixed bottom-4 right-4 z-[1400] h-[220px] w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl'
          : 'absolute inset-0 bg-black'
      }>
      <iframe
        ref={ref}
        title="Movie player"
        width="100%"
        height="100%"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        style={{ opacity: 0, pointerEvents: hasStarted ? 'auto' : 'none' }}
        referrerPolicy="no-referrer-when-downgrade"
      />
      {isMini ? (
        <div className="from-black/85 absolute inset-x-0 top-0 z-[1100] flex items-center justify-between gap-2 bg-gradient-to-b to-transparent p-2">
          <Link
            href={props.watchHref}
            className="bg-black/35 min-w-0 flex-1 rounded-lg px-3 py-2 text-left text-white backdrop-blur-md">
            <p className="text-white/55 line-clamp-1 text-xs uppercase tracking-[0.2em]">
              Mini Player
            </p>
            <p className="line-clamp-1 text-sm font-semibold">{props.title}</p>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={props.watchHref}>
              <Button
                variant="outline"
                size="icon"
                className="border-white/15 bg-black/45 h-9 w-9 rounded-full text-white backdrop-blur-md hover:bg-black/70 hover:text-white">
                <Minimize2 className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={props.onClose}
              className="border-white/15 bg-black/45 h-9 w-9 rounded-full text-white backdrop-blur-md hover:bg-black/70 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-[1300] flex max-w-[calc(100vw-1.5rem)] items-center justify-end gap-2 sm:right-5 sm:top-5">
          <Link href={props.backHref}>
            <Button
              variant="outline"
              className="border-white/15 bg-black/45 h-9 rounded-full px-3 text-xs text-white backdrop-blur-md hover:bg-black/70 hover:text-white sm:h-10 sm:px-4">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            aria-label="Copy link"
            onClick={() => void handleCopyLink()}
            className="border-white/15 bg-black/45 h-9 w-9 rounded-full text-white backdrop-blur-md hover:bg-black/70 hover:text-white sm:hidden">
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Copy link"
            onClick={() => void handleCopyLink()}
            className="border-white/15 bg-black/45 hidden h-9 rounded-full px-3 text-xs text-white backdrop-blur-md hover:bg-black/70 hover:text-white sm:inline-flex sm:h-10 sm:px-4">
            <Copy className="mr-1.5 h-4 w-4" />
            {copyStatus === 'copied' ? 'Copied' : 'Copy link'}
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Share this page"
            onClick={() => void handleNativeShare()}
            className="border-white/15 bg-black/45 hidden h-9 rounded-full px-3 text-xs text-white backdrop-blur-md hover:bg-black/70 hover:text-white sm:inline-flex sm:h-10 sm:px-4">
            <Share2 className="mr-1.5 h-4 w-4" />
            Share
          </Button>
          {props.nextProviderHref ? (
            <Link href={props.nextProviderHref}>
              <Button
                variant="outline"
                className="border-white/15 bg-black/45 hidden h-9 rounded-full px-3 text-xs text-white backdrop-blur-md hover:bg-black/70 hover:text-white sm:inline-flex sm:h-10 sm:px-4">
                <Tv2 className="mr-1.5 h-4 w-4" />
                Next source
              </Button>
            </Link>
          ) : null}
          <Button
            type="button"
            variant="outline"
            aria-label="Report broken stream"
            onClick={() => void handleReportBroken()}
            className="border-white/15 bg-black/45 hidden h-9 rounded-full px-3 text-xs text-white backdrop-blur-md hover:bg-black/70 hover:text-white sm:inline-flex sm:h-10 sm:px-4">
            <Flag className="mr-1.5 h-4 w-4" />
            {reportStatus === 'sent' ? 'Copied report' : 'Report'}
          </Button>
        </div>
      )}
      {!hasStarted ? (
        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_38%),linear-gradient(180deg,_rgba(0,0,0,0.38),_rgba(0,0,0,0.92))] p-6">
          <div className="bg-black/55 w-full max-w-md rounded-3xl border border-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-md">
            <p className="text-white/55 text-xs font-semibold uppercase tracking-[0.28em]">
              Watch Mode
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Start the player when you are ready
            </h2>
            <p className="text-white/72 mt-3 text-sm leading-6">
              This stream is loaded from a third-party provider. Starting it
              manually reduces accidental ad-clicks before playback begins.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={props.onPlaybackStart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
                <Play className="h-4 w-4 fill-current" />
                Start playback
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/50">
              Provider: {props.providerLabel}. If the stream fails, use the
              source switcher in the top-right controls.
            </p>
          </div>
        </div>
      ) : null}
      {hasStarted && isLoading ? (
        <div className="bg-black/35 pointer-events-none absolute inset-0 z-[880] flex items-center justify-center">
          <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-md">
            Loading stream...
          </div>
        </div>
      ) : null}
      {hasStarted && hasLoadError ? (
        <div className="absolute inset-x-0 bottom-24 z-[1080] flex justify-center px-4">
          <div className="max-w-xl rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-center text-sm text-white shadow-2xl backdrop-blur-md">
            This source is taking too long to respond. Try reloading the stream
            or switch sources if another provider is configured.
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default EmbedPlayer;
