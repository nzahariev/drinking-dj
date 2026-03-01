'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSoundEngine } from '@/contexts/SoundEngineContext';
import { SOUND_LABELS, SOUND_HOTKEYS, type SoundId } from '@/lib/sounds';

export function Soundboard({ audioUnlocked }: { audioUnlocked: boolean }) {
  const { play, loadAll, loaded } = useSoundEngine();
  const [perSoundVolume, setPerSoundVolume] = useState<Record<string, number>>({});

  useEffect(() => {
    if (audioUnlocked) loadAll();
  }, [audioUnlocked, loadAll]);

  const handleClick = useCallback(
    (soundId: string) => {
      const vol = perSoundVolume[soundId] ?? 1;
      play(soundId, vol);
    },
    [play, perSoundVolume]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const entry = Object.entries(SOUND_HOTKEYS).find(([, k]) => k.toUpperCase() === key);
      if (entry && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleClick(entry[0]);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [handleClick]);

  if (!audioUnlocked) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-club-neon-cyan">SOUNDBOARD</h2>
      {!loaded && <p className="text-club-mute text-sm">Loading sounds…</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {(Object.keys(SOUND_LABELS) as SoundId[]).map((soundId) => (
          <div key={soundId} className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleClick(soundId)}
              disabled={!loaded}
              className="btn-sfx flex-1 flex flex-col items-center justify-center p-3 disabled:opacity-50"
            >
              <span className="text-sm md:text-base">{SOUND_LABELS[soundId]}</span>
              <span className="text-xs text-club-mute mt-1">[{SOUND_HOTKEYS[soundId]}]</span>
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={(perSoundVolume[soundId] ?? 100)}
              onChange={(e) => setPerSoundVolume((v) => ({ ...v, [soundId]: Number(e.target.value) / 100 }))}
              className="w-full h-1.5 accent-club-neon-cyan"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
