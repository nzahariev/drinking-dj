'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Note = { name: string; freq: number; isBlack: boolean };

const NOTES: Note[] = [
  { name: 'C4',  freq: 261.63, isBlack: false },
  { name: 'C#4', freq: 277.18, isBlack: true },
  { name: 'D4',  freq: 293.66, isBlack: false },
  { name: 'D#4', freq: 311.13, isBlack: true },
  { name: 'E4',  freq: 329.63, isBlack: false },
  { name: 'F4',  freq: 349.23, isBlack: false },
  { name: 'F#4', freq: 369.99, isBlack: true },
  { name: 'G4',  freq: 392.00, isBlack: false },
  { name: 'G#4', freq: 415.30, isBlack: true },
  { name: 'A4',  freq: 440.00, isBlack: false },
  { name: 'A#4', freq: 466.16, isBlack: true },
  { name: 'B4',  freq: 493.88, isBlack: false },
  { name: 'C5',  freq: 523.25, isBlack: false },
  { name: 'C#5', freq: 554.37, isBlack: true },
  { name: 'D5',  freq: 587.33, isBlack: false },
  { name: 'D#5', freq: 622.25, isBlack: true },
  { name: 'E5',  freq: 659.25, isBlack: false },
  { name: 'F5',  freq: 698.46, isBlack: false },
  { name: 'F#5', freq: 739.99, isBlack: true },
  { name: 'G5',  freq: 783.99, isBlack: false },
  { name: 'G#5', freq: 830.61, isBlack: true },
  { name: 'A5',  freq: 880.00, isBlack: false },
  { name: 'A#5', freq: 932.33, isBlack: true },
  { name: 'B5',  freq: 987.77, isBlack: false },
  { name: 'C6',  freq: 1046.50, isBlack: false },
];

const WHITE_NOTES = NOTES.filter((n) => !n.isBlack);

type ActiveOsc = { osc: OscillatorNode; gain: GainNode };

type PartyPianoProps = { onClose: () => void };

export function PartyPiano({ onClose }: PartyPianoProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeRef = useRef<Map<string, ActiveOsc>>(new Map());
  const activeKeysRef = useRef<Set<string>>(new Set());
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noteOn(note: Note) {
    if (activeRef.current.has(note.name)) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    activeRef.current.set(note.name, { osc, gain });
    activeKeysRef.current.add(note.name);
    rerender();
  }

  function noteOff(note: Note) {
    const entry = activeRef.current.get(note.name);
    if (!entry) return;
    const ctx = audioCtxRef.current!;
    entry.gain.gain.cancelScheduledValues(ctx.currentTime);
    entry.gain.gain.setValueAtTime(entry.gain.gain.value, ctx.currentTime);
    entry.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    entry.osc.stop(ctx.currentTime + 0.25);
    activeRef.current.delete(note.name);
    activeKeysRef.current.delete(note.name);
    rerender();
  }

  function stopAll() {
    activeRef.current.forEach((entry) => {
      try { entry.osc.stop(); } catch { /* already stopped */ }
    });
    activeRef.current.clear();
    activeKeysRef.current.clear();
  }

  // Fullscreen + orientation lock
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    (async () => {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
      } catch { /* ignore */ }
      try {
        await (screen.orientation as any).lock('landscape');
      } catch { /* ignore */ }
    })();

    return () => {
      stopAll();
      audioCtxRef.current?.close();
      (async () => {
        try {
          const doc = document as any;
          if (doc.fullscreenElement) await doc.exitFullscreen();
          else if (doc.webkitFullscreenElement) await doc.webkitExitFullscreen();
        } catch { /* ignore */ }
        try { screen.orientation?.unlock(); } catch { /* ignore */ }
      })();
    };
  }, []);

  // Close on escape or fullscreen exit
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function handleFsChange() {
      const doc = document as any;
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [onClose]);

  // Touch handlers for multi-touch piano
  function getNoteFromTouch(touch: { clientX: number; clientY: number }): Note | null {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return null;
    const noteName = (el as HTMLElement).dataset?.note;
    if (!noteName) return null;
    return NOTES.find((n) => n.name === noteName) ?? null;
  }

  const touchNoteMap = useRef<Map<number, string>>(new Map());

  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const note = getNoteFromTouch(touch);
      if (note) {
        touchNoteMap.current.set(touch.identifier, note.name);
        noteOn(note);
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const note = getNoteFromTouch(touch);
      const prevName = touchNoteMap.current.get(touch.identifier);
      if (note && note.name !== prevName) {
        if (prevName) {
          const prevNote = NOTES.find((n) => n.name === prevName);
          if (prevNote) noteOff(prevNote);
        }
        touchNoteMap.current.set(touch.identifier, note.name);
        noteOn(note);
      }
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const noteName = touchNoteMap.current.get(touch.identifier);
      if (noteName) {
        const note = NOTES.find((n) => n.name === noteName);
        if (note) noteOff(note);
        touchNoteMap.current.delete(touch.identifier);
      }
    }
  }

  // Mouse fallback for desktop testing
  function handleMouseDown(note: Note) {
    noteOn(note);
  }
  function handleMouseUp(note: Note) {
    noteOff(note);
  }

  // Build key positions: black keys sit between specific white keys
  const whiteKeyWidth = 100 / WHITE_NOTES.length; // percentage

  // Map each note to its x position
  function getBlackKeyLeft(note: Note): number {
    // Find which white key index this black key sits after
    const idx = NOTES.indexOf(note);
    let whiteIdx = 0;
    for (let i = 0; i < idx; i++) {
      if (!NOTES[i].isBlack) whiteIdx++;
    }
    // Black key sits between whiteIdx-1 and whiteIdx
    return whiteIdx * whiteKeyWidth - whiteKeyWidth * 0.3;
  }

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-club-black flex flex-col piano-landscape"
      style={{ touchAction: 'none' }}
    >
      {/* Close button */}
      <div className="flex-shrink-0 flex items-center justify-center py-2">
        <button
          type="button"
          onClick={onClose}
          className="text-club-mute text-xs tracking-widest uppercase select-none px-4 py-1"
        >
          TAP TO CLOSE
        </button>
      </div>

      {/* Piano keyboard */}
      <div
        className="flex-1 relative select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* White keys */}
        {WHITE_NOTES.map((note, i) => {
          const isActive = activeKeysRef.current.has(note.name);
          return (
            <div
              key={note.name}
              data-note={note.name}
              className="absolute top-0 bottom-0 transition-colors duration-75"
              style={{
                left: `${i * whiteKeyWidth}%`,
                width: `${whiteKeyWidth}%`,
                background: isActive ? '#d4d4d4' : '#ffffff',
                borderLeft: '1px solid #aaa',
                borderRight: '1px solid #aaa',
                borderBottom: '4px solid #888',
                borderRadius: '0 0 6px 6px',
              }}
              onMouseDown={() => handleMouseDown(note)}
              onMouseUp={() => handleMouseUp(note)}
              onMouseLeave={() => handleMouseUp(note)}
            >
              <span
                className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold select-none pointer-events-none"
                style={{ color: '#999' }}
              >
                {note.name.replace(/\d/, '')}
              </span>
            </div>
          );
        })}

        {/* Black keys */}
        {NOTES.filter((n) => n.isBlack).map((note) => {
          const isActive = activeKeysRef.current.has(note.name);
          const left = getBlackKeyLeft(note);
          return (
            <div
              key={note.name}
              data-note={note.name}
              className="absolute top-0 rounded-b-lg z-10 transition-colors duration-75"
              style={{
                left: `${left}%`,
                width: `${whiteKeyWidth * 0.6}%`,
                height: '60%',
                background: isActive
                  ? 'linear-gradient(to bottom, #444, #222)'
                  : 'linear-gradient(to bottom, #222, #000)',
                borderBottom: '3px solid #000',
                boxShadow: '2px 4px 6px rgba(0,0,0,0.6)',
              }}
              onMouseDown={() => handleMouseDown(note)}
              onMouseUp={() => handleMouseUp(note)}
              onMouseLeave={() => handleMouseUp(note)}
            />
          );
        })}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
