'use client';

import { useRef, useState } from 'react';
import type { PartyItem, PartyItemText } from '@/lib/partyItems';

const COLOR_BG: Record<string, string> = {
  pink: 'bg-[#ff2d95]',
  cyan: 'bg-[#00f5ff]',
  purple: 'bg-[#a855f7]',
  green: 'bg-[#22c55e]',
  yellow: 'bg-[#eab308]',
};

const COLORS: PartyItemText['color'][] = ['pink', 'cyan', 'purple', 'green', 'yellow'];
const COLOR_HEX: Record<PartyItemText['color'], string> = {
  pink: '#ff2d95',
  cyan: '#00f5ff',
  purple: '#a855f7',
  green: '#22c55e',
  yellow: '#eab308',
};

type PartyTileProps = {
  item: PartyItem;
  onPress: (item: PartyItem) => void;
  onLabelChange: (id: string, newLabel: string) => void;
  onColorChange: (id: string, color: PartyItemText['color']) => void;
};

export function PartyTile({ item, onPress, onLabelChange, onColorChange }: PartyTileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(item.label);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  function startEdit() {
    setDraftLabel(item.label);
    setIsEditing(true);
  }

  function commitEdit() {
    const trimmed = draftLabel.trim();
    // For blank tiles (original label was ''), allow saving as '' to stay blank
    if (item.label === '') {
      onLabelChange(item.id, trimmed);
    } else {
      onLabelChange(item.id, trimmed || item.label);
    }
    setIsEditing(false);
  }

  function handlePointerDown() {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      startEdit();
    }, 500);
  }

  function handlePointerUp() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function handleClick() {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    if (!isEditing) {
      if (item.kind === 'text' && item.label.trim() === '') {
        startEdit();
      } else {
        onPress(item);
      }
    }
  }

  function handleDoubleClick() {
    startEdit();
  }

  if (item.kind === 'text') {
    const bg = COLOR_BG[item.color] ?? 'bg-[#ff2d95]';
    return (
      <div
        className={`relative ${bg} rounded-2xl min-h-[140px] flex items-center justify-center cursor-pointer select-none overflow-hidden`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            autoFocus
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value.toUpperCase())}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitEdit();
              }
              if (e.key === 'Escape') {
                setDraftLabel(item.label);
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent text-center resize-none outline-none font-display text-2xl uppercase text-black/80 p-3 absolute inset-0"
            style={{ caretColor: 'rgba(0,0,0,0.6)', paddingBottom: '2.5rem' }}
          />
        ) : item.label === '' ? (
          <div className="flex flex-col items-center gap-1 text-black/50 select-none">
            <span className="text-5xl font-bold leading-none">+</span>
            <span className="text-xs font-bold tracking-widest uppercase">Tap to write</span>
          </div>
        ) : (
          <span className="font-display text-2xl uppercase text-black/90 text-center px-3 leading-tight break-words">
            {item.label}
          </span>
        )}
        {!isEditing && item.label !== '' && (
          <span className="absolute bottom-1 right-2 text-[10px] text-black/40 font-bold">HOLD TO EDIT</span>
        )}
        {isEditing && (
          <div
            className="absolute bottom-2 left-0 right-0 flex justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange(item.id, c);
                }}
                className="w-6 h-6 rounded-full transition-transform active:scale-90"
                style={{
                  background: COLOR_HEX[c],
                  outline: item.color === c ? '2px solid white' : '2px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // GIF tile
  return (
    <div
      className="relative rounded-2xl min-h-[140px] flex items-end cursor-pointer select-none overflow-hidden bg-club-card"
      style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Dark gradient overlay at bottom for caption legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      {isEditing ? (
        <textarea
          autoFocus
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value.toUpperCase())}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitEdit();
            }
            if (e.key === 'Escape') {
              setDraftLabel(item.label);
              setIsEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full bg-transparent text-center resize-none outline-none font-display text-lg uppercase text-white p-2"
          style={{ caretColor: 'white' }}
        />
      ) : (
        <span className="relative z-10 w-full font-display text-lg uppercase text-white text-center px-2 pb-2 leading-tight break-words">
          {item.label}
        </span>
      )}
    </div>
  );
}
