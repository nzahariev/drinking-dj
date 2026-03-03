'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { extractVideoId } from '@/lib/utils';

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, options: Record<string, unknown>) => unknown;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

type YTPlayer = {
  loadVideoById(videoId: string, startSeconds?: number): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  getVideoData(): { title: string };
  setVolume(volume: number): void;
  destroy(): void;
};

export interface NowPlaying {
  videoId: string;
  title: string;
}

export interface QueueItem {
  id: string;
  videoId: string;
  title: string;
}

export function YouTubePlayer({
  nowPlaying,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onSetVideo,
  onQueueAdd,
  queue,
  volume: volumeProp,
}: {
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onSetVideo: (videoId: string, title: string) => void;
  onQueueAdd: (videoId: string, title: string) => void;
  queue: QueueItem[];
  volume?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [localVolume, setLocalVolume] = useState(100);
  const [embedError, setEmbedError] = useState<boolean>(false);
  const volume = volumeProp ?? localVolume;
  const videoId = nowPlaying?.videoId ?? null;
  const title = nowPlaying?.title ?? null;

  // Reset embed error when video changes so we can retry
  useEffect(() => {
    setEmbedError(false);
  }, [videoId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const container = containerRef.current;
    const init = () => {
      if (!containerRef.current) return;
      const player = new window.YT.Player(container, {
        height: '200',
        width: '100%',
        videoId: videoId || '',
        playerVars: { autoplay: 0, controls: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            playerRef.current = player as unknown as YTPlayer;
            setEmbedError(false);
          },
          onError: () => {
            // 2=invalid id, 5=HTML5 error, 100=not found, 101/150=embed not allowed
            setEmbedError(true);
          },
        },
      });
    };
    if (window.YT?.Player) {
      init();
    } else {
      window.onYouTubeIframeAPIReady = init;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const first = document.getElementsByTagName('script')[0];
      first?.parentNode?.insertBefore(tag, first);
    }
    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player?.loadVideoById || !videoId) return;
    player.loadVideoById(videoId, 0);
  }, [videoId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) player.playVideo?.();
    else player.pauseVideo?.();
  }, [isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player?.setVolume) return;
    player.setVolume(volume);
  }, [volume]);

  const handleAddToQueue = useCallback(() => {
    const id = extractVideoId(inputValue);
    if (!id) return;
    onQueueAdd(id, 'Unknown');
    setInputValue('');
  }, [inputValue, onQueueAdd]);

  const youtubeWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;

  return (
    <div className="p-4 space-y-3">
      <div ref={containerRef} className="rounded-lg overflow-hidden bg-black aspect-video max-h-[200px]" />
      {embedError && videoId && (
        <div className="rounded-lg bg-club-card border border-amber-500/50 p-3 text-sm">
          <p className="text-amber-200 mb-2">This video can’t be played in the app (unavailable or embedding disabled).</p>
          <a
            href={youtubeWatchUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium"
          >
            Open in YouTube
          </a>
        </div>
      )}
      {title && (
        <p className="text-sm font-medium text-white truncate" title={title}>
          Now playing: {title}
        </p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="YouTube URL or video ID"
          className="flex-1 px-3 py-2 rounded-lg bg-club-card border border-club-border text-white placeholder-club-mute text-sm focus:border-club-neon-pink focus:outline-none"
        />
        <button type="button" onClick={handleAddToQueue} className="btn-dj px-4 py-2 text-sm">
          Add to queue
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onPlay} className="btn-dj px-3 py-2 text-sm">
          Play
        </button>
        <button type="button" onClick={onPause} className="btn-dj px-3 py-2 text-sm">
          Pause
        </button>
        <button type="button" onClick={onNext} className="btn-dj px-3 py-2 text-sm">
          Next
        </button>
        {volumeProp == null && (
          <label className="flex items-center gap-2 text-sm text-club-mute">
            <span>Vol</span>
            <input
              type="range"
              min={0}
              max={100}
              value={localVolume}
              onChange={(e) => setLocalVolume(Number(e.target.value))}
              className="w-24"
            />
          </label>
        )}
      </div>
    </div>
  );
}
