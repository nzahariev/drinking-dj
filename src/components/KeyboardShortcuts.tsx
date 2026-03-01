'use client';

import { SOUND_HOTKEYS, SOUND_LABELS } from '@/lib/sounds';

export function KeyboardShortcuts({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div
        className="bg-club-card border-2 border-club-border rounded-xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-club-neon-pink mb-4">KEYBOARD SHORTCUTS</h3>
        <ul className="space-y-2 text-sm">
          {(Object.keys(SOUND_LABELS) as (keyof typeof SOUND_LABELS)[]).map((id) => (
            <li key={id} className="flex justify-between">
              <span className="text-club-mute">{SOUND_LABELS[id]}</span>
              <kbd className="px-2 py-0.5 rounded bg-club-dark border border-club-border text-club-neon-cyan">
                {SOUND_HOTKEYS[id]}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="text-club-mute text-xs mt-4">Play/Pause/Next from player. Use number keys and QWAS for SFX.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-club-neon-pink text-black font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
