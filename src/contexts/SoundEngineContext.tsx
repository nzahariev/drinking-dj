'use client';

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import type { SoundId } from '@/lib/sounds';
import { SOUND_IDS } from '@/lib/sounds';

const SFX_BASE = '/sfx';

type SoundEngineApi = {
  play: (soundId: string, volume?: number) => void;
  setMasterSfxGain: (value: number) => void;
  setFilterFreq: (value: number) => void;
  setFilterDrop: () => void;
  setReverbMix: (value: number) => void;
  setDelayMix: (value: number) => void;
  setDelayTime: (value: number) => void;
  loaded: boolean;
  loadAll: () => Promise<void>;
};

const SoundEngineContext = createContext<SoundEngineApi | null>(null);

export function useSoundEngine() {
  const ctx = useContext(SoundEngineContext);
  if (!ctx) throw new Error('useSoundEngine must be used within SoundEngineProvider');
  return ctx;
}

export function SoundEngineProvider({ children, unlocked }: { children: ReactNode; unlocked: boolean }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterSfxGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);
  const reverbConvRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const [loaded, setLoaded] = useState(false);

  const init = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const masterSfx = ctx.createGain();
    masterSfx.gain.value = 1;
    masterSfx.connect(ctx.destination);
    masterSfxGainRef.current = masterSfx;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 22050;
    filter.Q.value = 1;
    filter.connect(masterSfx);
    filterRef.current = filter;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 1;
    dryGain.connect(filter);
    dryGainRef.current = dryGain;

    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.3;
    delayRef.current = delay;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0;
    delayGain.connect(filter);
    delayGainRef.current = delayGain;
    delay.connect(delayGain);

    const reverbConv = ctx.createConvolver();
    const irLength = ctx.sampleRate * 0.5;
    const irBuffer = ctx.createBuffer(2, irLength, ctx.sampleRate);
    const irL = irBuffer.getChannelData(0);
    const irR = irBuffer.getChannelData(1);
    for (let i = 0; i < irLength; i++) {
      const t = i / ctx.sampleRate;
      const decay = Math.exp(-t * 3) * (1 - i / irLength);
      irL[i] = (Math.random() * 2 - 1) * decay;
      irR[i] = (Math.random() * 2 - 1) * decay;
    }
    reverbConv.buffer = irBuffer;
    reverbConvRef.current = reverbConv;
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0;
    reverbGain.connect(masterSfx);
    reverbGainRef.current = reverbGain;
    reverbConv.connect(reverbGain);

    return ctx;
  }, []);

  const loadAll = useCallback(async () => {
    const ctx = init();
    for (const id of SOUND_IDS) {
      if (buffersRef.current.has(id)) continue;
      for (const ext of ['.mp3', '.wav']) {
        try {
          const res = await fetch(`${SFX_BASE}/${id}${ext}`);
          if (!res.ok) continue;
          const buf = await ctx.decodeAudioData(await res.arrayBuffer());
          buffersRef.current.set(id, buf);
          break;
        } catch {
          /* try next */
        }
      }
    }
    setLoaded(true);
  }, [init]);

  const play = useCallback((soundId: string, volume = 1) => {
    const ctx = audioContextRef.current;
    const dry = dryGainRef.current;
    const filter = filterRef.current;
    const delay = delayRef.current;
    const reverbConv = reverbConvRef.current;
    if (!ctx || !dry || !filter) return;
    const buffer = buffersRef.current.get(soundId);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(dry);
    if (delay) gain.connect(delay);
    if (reverbConv) gain.connect(reverbConv);
    src.start(0);
  }, []);

  const setMasterSfxGain = useCallback((value: number) => {
    if (masterSfxGainRef.current) masterSfxGainRef.current.gain.value = value;
  }, []);

  const setFilterFreq = useCallback((value: number) => {
    if (filterRef.current) filterRef.current.frequency.value = value;
  }, []);

  const setFilterDrop = useCallback(() => {
    const filter = filterRef.current;
    if (!filter) return;
    const ctx = filter.context;
    const now = ctx.currentTime;
    filter.frequency.setValueAtTime(22050, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(22050, now + 0.5);
  }, []);

  const setReverbMix = useCallback((value: number) => {
    if (reverbGainRef.current) reverbGainRef.current.gain.value = value * 0.5;
  }, []);

  const setDelayMix = useCallback((value: number) => {
    if (delayGainRef.current) delayGainRef.current.gain.value = value * 0.4;
  }, []);

  const setDelayTime = useCallback((value: number) => {
    if (delayRef.current) delayRef.current.delayTime.value = value;
  }, []);

  const api: SoundEngineApi = {
    play,
    setMasterSfxGain,
    setFilterFreq,
    setFilterDrop,
    setReverbMix,
    setDelayMix,
    setDelayTime,
    loaded,
    loadAll,
  };

  return (
    <SoundEngineContext.Provider value={api}>
      {children}
    </SoundEngineContext.Provider>
  );
}
