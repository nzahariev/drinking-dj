'use client';

export function AudioGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div
      className="audio-gate-overlay"
      role="button"
      tabIndex={0}
      onClick={onUnlock}
      onKeyDown={(e) => e.key === 'Enter' && onUnlock()}
      aria-label="Tap to enable audio"
    >
      <div className="text-center space-y-6 px-6">
        <h2 className="font-display text-4xl md:text-5xl text-club-neon-pink">
          TAP TO ENABLE AUDIO
        </h2>
        <p className="text-club-mute max-w-sm mx-auto">
          Browsers require a user gesture before playing sound. Click or tap anywhere to start.
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUnlock(); }}
          className="px-8 py-4 rounded-xl font-bold text-lg bg-club-neon-pink text-black hover:bg-club-neon-pink/90 transition"
        >
          Enable audio
        </button>
      </div>
    </div>
  );
}
