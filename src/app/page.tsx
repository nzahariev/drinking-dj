'use client';

import { useCallback, useState } from 'react';
import { AudioGate } from '@/components/AudioGate';
import { SoundEngineProvider } from '@/contexts/SoundEngineContext';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { AudioFallbackPlayer } from '@/components/AudioFallbackPlayer';
import { Soundboard } from '@/components/Soundboard';
import { DJTools } from '@/components/DJTools';
import { QueuePanel } from '@/components/QueuePanel';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { PartyGrid } from '@/components/PartyGrid';
import { PartyFullscreen } from '@/components/PartyFullscreen';
import type { QueueItem, NowPlaying } from '@/components/YouTubePlayer';
import { DEFAULT_PARTY_ITEMS } from '@/lib/partyItems';
import type { PartyItem } from '@/lib/partyItems';

function generateId() {
  return Math.random().toString(36).slice(2, 12);
}

export default function HomePage() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [appMode, setAppMode] = useState<'dj' | 'party'>('dj');
  const [partyItems, setPartyItems] = useState<PartyItem[]>(DEFAULT_PARTY_ITEMS);
  const [activePartyItem, setActivePartyItem] = useState<PartyItem | null>(null);
  const [musicVolume, setMusicVolume] = useState(100);
  const [crossfader, setCrossfader] = useState(0.5);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleNext = useCallback(() => {
    setQueue((q) => {
      const next = q[0];
      if (next) {
        setNowPlaying({ videoId: next.videoId, title: next.title });
        return q.slice(1);
      }
      setNowPlaying(null);
      return [];
    });
  }, []);
  const handleSetVideo = useCallback((videoId: string, title: string) => {
    setNowPlaying({ videoId, title });
  }, []);
  const handleQueueAdd = useCallback((videoId: string, title: string) => {
    setQueue((q) => [...q, { id: generateId(), videoId, title }]);
  }, []);
  const handleQueueRemove = useCallback((itemId: string) => {
    setQueue((q) => q.filter((i) => i.id !== itemId));
  }, []);

  const content = (
    <div className="min-h-screen bg-club-black flex flex-col lg:h-screen">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-club-border bg-club-dark">
        <span className="font-display text-xl text-club-neon-pink">DRINKING DJ</span>
        <div className="flex rounded-lg border border-club-border overflow-hidden">
          <button
            type="button"
            onClick={() => setAppMode('dj')}
            className={`px-3 py-1 text-sm font-bold transition-colors ${
              appMode === 'dj'
                ? 'bg-[#ff2d95] text-black'
                : 'bg-transparent text-club-mute hover:text-white'
            }`}
          >
            DJ
          </button>
          <button
            type="button"
            onClick={() => setAppMode('party')}
            className={`px-3 py-1 text-sm font-bold transition-colors ${
              appMode === 'party'
                ? 'bg-[#00f5ff] text-black'
                : 'bg-transparent text-club-mute hover:text-white'
            }`}
          >
            PARTY
          </button>
        </div>
        {appMode === 'dj' && (
          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            className="text-club-mute hover:text-white text-sm px-2 py-1 rounded"
          >
            Shortcuts
          </button>
        )}
      </header>

      {appMode === 'dj' ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <section className="flex-shrink-0 lg:w-[360px] flex flex-col border-b lg:border-b-0 lg:border-r border-club-border">
            <YouTubePlayer
              nowPlaying={nowPlaying}
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onNext={handleNext}
              onSetVideo={handleSetVideo}
              onQueueAdd={handleQueueAdd}
              queue={queue}
              volume={Math.round((1 - crossfader) * musicVolume)}
            />
            <QueuePanel queue={queue} onRemove={handleQueueRemove} />
            <AudioFallbackPlayer volume={Math.round((1 - crossfader) * musicVolume)} />
          </section>

          <section className="flex-1 p-4 overflow-auto">
            <Soundboard audioUnlocked={audioUnlocked} />
          </section>

          <section className="flex-shrink-0 lg:w-[280px] border-t lg:border-t-0 lg:border-l border-club-border">
            <DJTools
              audioUnlocked={audioUnlocked}
              musicVolume={musicVolume}
              onMusicVolumeChange={setMusicVolume}
              crossfader={crossfader}
              onCrossfaderChange={setCrossfader}
            />
          </section>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <PartyGrid
            items={partyItems}
            onItemsChange={setPartyItems}
            onTilePress={setActivePartyItem}
          />
        </div>
      )}

      <PartyFullscreen
        item={activePartyItem}
        onClose={() => setActivePartyItem(null)}
      />
    </div>
  );

  return (
    <>
      {!audioUnlocked ? (
        <AudioGate onUnlock={() => setAudioUnlocked(true)} />
      ) : (
        <SoundEngineProvider unlocked={true}>
          {content}
        </SoundEngineProvider>
      )}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
    </>
  );
}
