'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Play music from a direct audio URL or uploaded file when YouTube embed isn't an option.
 * Use this as a workaround when videos are unavailable or embedding is disabled.
 */
export function AudioFallbackPlayer({
  volume: volumeProp = 100,
}: {
  volume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState('');
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = (volumeProp ?? 100) / 100;
  }, [volumeProp]);

  const setSource = useCallback((source: string | null, label?: string) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setUrl(source || '');
    setFileLabel(label || null);
    setError(null);
    setIsPlaying(false);
  }, []);

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const raw = (e.target as HTMLFormElement).querySelector('input')?.value?.trim();
    if (!raw) return;
    setError(null);
    setSource(raw, raw);
    const audio = audioRef.current;
    if (audio) {
      audio.src = raw;
      audio.play().then(() => setIsPlaying(true)).catch((err) => setError(err?.message || 'Could not play'));
    }
  }, [setSource]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSource(objectUrl, file.name);
    const audio = audioRef.current;
    if (audio) {
      audio.src = objectUrl;
      audio.play().then(() => setIsPlaying(true)).catch((err) => setError(err?.message || 'Could not play'));
    }
    e.target.value = '';
  }, [setSource]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => setError(err?.message || 'Could not play'));
    }
  }, [isPlaying]);

  // Sync volume
  return (
    <div className="p-4 border-t border-club-border space-y-3">
      <h3 className="font-display text-sm text-club-neon-green">BACKUP: YOUR AUDIO</h3>
      <p className="text-club-mute text-xs">
        If YouTube won’t play here, use a direct link to an MP3 or upload a file.
      </p>
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setError('Playback failed')}
        onPlay={() => { setIsPlaying(true); setError(null); }}
        onPause={() => setIsPlaying(false)}
      />
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <input
          type="url"
          placeholder="https://… direct link to .mp3"
          className="flex-1 px-3 py-2 rounded-lg bg-club-card border border-club-border text-white placeholder-club-mute text-sm focus:border-club-neon-cyan focus:outline-none"
        />
        <button type="submit" className="btn-dj px-3 py-2 text-sm">
          Load &amp; play
        </button>
      </form>
      <div className="flex items-center gap-2">
        <label className="btn-dj px-3 py-2 text-sm cursor-pointer">
          Choose file…
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {(url || fileLabel) && (
          <>
            <button type="button" onClick={togglePlay} className="btn-dj px-3 py-2 text-sm">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <span className="text-club-mute text-xs truncate max-w-[120px]" title={fileLabel || url}>
              {fileLabel || 'Loaded'}
            </span>
          </>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <p className="text-club-mute text-xs">Volume follows main Music / crossfader.</p>
    </div>
  );
}
