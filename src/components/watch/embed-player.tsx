'use client';
import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from 'react-share';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer(props: EmbedPlayerProps) {
  const ref = React.useRef<HTMLIFrameElement>(null);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  React.useEffect(() => {
    if (ref.current) {
      ref.current.src = props.url;
    }

    const iframe: HTMLIFrameElement | null = ref.current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [props.url]);

  const handleIframeLoaded = () => {
    if (!ref.current) {
      return;
    }
    const iframe: HTMLIFrameElement = ref.current;
    if (iframe) iframe.style.opacity = '1';
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
      }}>
      <iframe
        ref={ref}
        width="100%"
        height="100%"
        allowFullScreen
        style={{ opacity: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 1000 }}>
        <FacebookShareButton url={currentUrl}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        <TwitterShareButton url={currentUrl}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LinkedinShareButton url={currentUrl}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>
    </div>
  );
}

export default EmbedPlayer;
