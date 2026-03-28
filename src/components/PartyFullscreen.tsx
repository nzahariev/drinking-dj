'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { PartyItem, PartyItemText } from '@/lib/partyItems';

const COLOR_GLOW: Record<string, string> = {
  pink: '#ff2d95',
  cyan: '#00f5ff',
  purple: '#a855f7',
  green: '#22c55e',
  yellow: '#eab308',
};

type PartyFullscreenProps = {
  item: PartyItem | null;
  onClose: () => void;
};

async function enterFullscreen(el: HTMLElement) {
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if ((el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
      await (el as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
    }
  } catch {
    // Fullscreen blocked (e.g. desktop not focused) — overlay still covers screen visually
  }
  try {
    await (screen.orientation as unknown as { lock: (o: string) => Promise<void> }).lock('landscape');
  } catch {
    // Orientation lock unavailable on iOS / desktop — user rotates manually
  }
}

async function exitFullscreen() {
  try {
    const doc = document as unknown as {
      fullscreenElement?: Element;
      exitFullscreen?: () => Promise<void>;
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
    };
    if (doc.fullscreenElement && doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch {
    // ignore
  }
  try {
    screen.orientation?.unlock();
  } catch {
    // ignore
  }
}

function useAutoScaleText(item: PartyItemText | null) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || !item) return;

    function scale() {
      if (!el) return;
      const parent = el.parentElement;
      if (!parent) return;

      el.style.whiteSpace = 'nowrap';
      const maxWidth = parent.clientWidth - 32;   // 16px padding each side
      const maxHeight = window.innerHeight - 80;  // reserve space for "TAP TO CLOSE" + breathing room

      // Binary search for the largest font size that fits both width and height
      let lo = 20, hi = 600;
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        el.style.fontSize = `${mid}px`;
        if (el.scrollWidth <= maxWidth && el.scrollHeight <= maxHeight) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      el.style.fontSize = `${lo}px`;
    }

    scale();
    window.addEventListener('resize', scale);
    return () => window.removeEventListener('resize', scale);
  }, [item?.label]);

  return textRef;
}

export function PartyFullscreen({ item, onClose }: PartyFullscreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useAutoScaleText(item?.kind === 'text' ? item : null);

  const handleClose = useCallback(() => {
    exitFullscreen().finally(() => onClose());
  }, [onClose]);

  // Enter/exit fullscreen when item changes
  useEffect(() => {
    const el = overlayRef.current;
    if (item && el) {
      enterFullscreen(el);
    } else {
      exitFullscreen();
    }
  }, [item]);

  // Sync state when user exits fullscreen via Escape / device back
  useEffect(() => {
    function handleFsChange() {
      const doc = document as unknown as { fullscreenElement?: Element; webkitFullscreenElement?: Element };
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        onClose();
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { exitFullscreen(); };
  }, []);

  if (!item) return null;

  const glowColor = item.kind === 'text' ? (COLOR_GLOW[item.color] ?? '#ff2d95') : '#ff2d95';

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-club-black flex flex-col items-center justify-center cursor-pointer"
      onClick={handleClose}
    >
      <span className="absolute top-3 left-1/2 -translate-x-1/2 text-club-mute text-xs tracking-widest uppercase select-none">
        TAP TO CLOSE
      </span>

      {item.kind === 'piano' ? null : item.kind === 'text' ? (
        <div className="w-full flex items-center justify-center px-4">
          <span
            ref={textRef}
            className="font-display text-center leading-none select-none party-flash-text"
            style={{
              color: glowColor,
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.label}
            className="max-w-full max-h-[85vh] object-contain select-none"
            draggable={false}
          />
          <span
            className="absolute bottom-8 font-display text-center px-4 select-none"
            style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              color: '#ff2d95',
              textShadow: '0 0 30px #ff2d9580',
            }}
          >
            {item.label}
          </span>
        </div>
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
