'use client';

import { useEffect, useRef, useState } from 'react';
import { useSoundEngine } from '@/contexts/SoundEngineContext';

export function DJTools({
  audioUnlocked,
  musicVolume = 100,
  onMusicVolumeChange,
  crossfader = 0.5,
  onCrossfaderChange,
}: {
  audioUnlocked: boolean;
  musicVolume?: number;
  onMusicVolumeChange?: (v: number) => void;
  crossfader?: number;
  onCrossfaderChange?: (v: number) => void;
}) {
  const {
    play,
    setMasterSfxGain,
    setFilterFreq,
    setFilterDrop,
    setReverbMix,
    setDelayMix,
    setDelayTime,
  } = useSoundEngine();
  const [sfxVolume, setSfxVolume] = useState(100);
  const [reverb, setReverb] = useState(0);
  const [delay, setDelay] = useState(0);
  const [delayTime, setDelayTimeState] = useState(0.3);
  const [filterFreq, setFilterFreqState] = useState(22050);
  const muteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMasterSfxGain((sfxVolume / 100) * crossfader);
  }, [setMasterSfxGain, sfxVolume, crossfader]);

  useEffect(() => {
    setReverbMix(reverb / 100);
  }, [setReverbMix, reverb]);

  useEffect(() => {
    setDelayMix(delay / 100);
    setDelayTime(delayTime);
  }, [setDelayMix, setDelayTime, delay, delayTime]);

  useEffect(() => {
    setFilterFreq(filterFreq);
  }, [setFilterFreq, filterFreq]);

  function runHype(type: 'drop' | 'rewind' | 'mute') {
    if (type === 'drop') {
      setFilterDrop();
      play('airhorn', 1);
    } else if (type === 'rewind') {
      play('scratch', 1);
      const prev = onMusicVolumeChange ? musicVolume : 100;
      if (onMusicVolumeChange) onMusicVolumeChange(Math.max(0, prev - 60));
      setTimeout(() => onMusicVolumeChange?.(prev), 800);
    } else if (type === 'mute') {
      const prev = onMusicVolumeChange ? musicVolume : 100;
      if (onMusicVolumeChange) onMusicVolumeChange(0);
      if (muteTimeoutRef.current) clearTimeout(muteTimeoutRef.current);
      muteTimeoutRef.current = setTimeout(() => {
        onMusicVolumeChange?.(prev);
        muteTimeoutRef.current = null;
      }, 3000);
    }
  }

  if (!audioUnlocked) return null;

  return (
    <div className="p-4 space-y-6">
      <h2 className="font-display text-xl text-club-neon-purple">DJ TOOLS</h2>

      <div>
        <label className="block text-sm text-club-mute mb-1">Crossfader (Music ⟷ SFX)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={crossfader * 100}
          onChange={(e) => onCrossfaderChange?.(Number(e.target.value) / 100)}
          className="w-full h-3 crossfader-track accent-club-neon-pink"
        />
      </div>

      <div>
        <label className="block text-sm text-club-mute mb-1">SFX volume</label>
        <input
          type="range"
          min={0}
          max={100}
          value={sfxVolume}
          onChange={(e) => setSfxVolume(Number(e.target.value))}
          className="w-full accent-club-neon-cyan"
        />
      </div>

      {onMusicVolumeChange && (
        <div>
          <label className="block text-sm text-club-mute mb-1">Music volume</label>
          <input
            type="range"
            min={0}
            max={100}
            value={musicVolume}
            onChange={(e) => onMusicVolumeChange(Number(e.target.value))}
            className="w-full accent-club-neon-pink"
          />
        </div>
      )}

      <div>
        <label className="block text-sm text-club-mute mb-1">Filter (Hz)</label>
        <input
          type="range"
          min={100}
          max={22050}
          step={100}
          value={filterFreq}
          onChange={(e) => setFilterFreqState(Number(e.target.value))}
          className="w-full accent-club-neon-purple"
        />
        <button
          type="button"
          onClick={() => {
            setFilterDrop();
            setFilterFreqState(100);
            setTimeout(() => setFilterFreqState(22050), 500);
          }}
          className="btn-dj mt-2 w-full py-2 text-sm"
        >
          DROP
        </button>
      </div>

      <div>
        <label className="block text-sm text-club-mute mb-1">Reverb</label>
        <input
          type="range"
          min={0}
          max={100}
          value={reverb}
          onChange={(e) => setReverb(Number(e.target.value))}
          className="w-full accent-club-neon-purple"
        />
      </div>

      <div>
        <label className="block text-sm text-club-mute mb-1">Delay / Echo</label>
        <input
          type="range"
          min={0}
          max={100}
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          className="w-full accent-club-neon-purple"
        />
        <label className="block text-xs text-club-mute mt-1">Delay time (s)</label>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={delayTime}
          onChange={(e) => setDelayTimeState(Number(e.target.value))}
          className="w-full accent-club-neon-purple"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-club-mute">Hype buttons</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => runHype('drop')}
            className="btn-dj py-3 bg-club-neon-pink/20 border-club-neon-pink text-club-neon-pink"
          >
            DROP
          </button>
          <button
            type="button"
            onClick={() => runHype('rewind')}
            className="btn-dj py-3 bg-club-neon-purple/20 border-club-neon-purple text-club-neon-purple"
          >
            REWIND
          </button>
          <button
            type="button"
            onClick={() => runHype('mute')}
            className="btn-dj py-3 bg-club-neon-cyan/20 border-club-neon-cyan text-club-neon-cyan"
          >
            MUTE 3s
          </button>
        </div>
      </div>
    </div>
  );
}
