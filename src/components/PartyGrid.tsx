'use client';

import type { PartyItem, PartyItemText } from '@/lib/partyItems';
import { PartyTile } from '@/components/PartyTile';

type PartyGridProps = {
  items: PartyItem[];
  onItemsChange: (items: PartyItem[]) => void;
  onTilePress: (item: PartyItem) => void;
};

function generateId() {
  return Math.random().toString(36).slice(2, 12);
}

export function PartyGrid({ items, onItemsChange, onTilePress }: PartyGridProps) {
  function handleLabelChange(id: string, newLabel: string) {
    const updated = items.map((item) => (item.id === id ? { ...item, label: newLabel } : item));
    const hasBlank = updated.some((i) => i.kind === 'text' && i.label.trim() === '');
    if (!hasBlank) {
      updated.push({ id: generateId(), kind: 'text', label: '', color: 'purple' });
    }
    onItemsChange(updated);
  }

  function handleColorChange(id: string, color: PartyItemText['color']) {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, color } : item)));
  }

  const textItems = items.filter((i) => i.kind === 'text');
  const mediaItems = items.filter((i) => i.kind === 'gif');

  function renderTile(item: PartyItem) {
    return (
      <PartyTile
        key={item.id}
        item={item}
        onPress={onTilePress}
        onLabelChange={handleLabelChange}
        onColorChange={handleColorChange}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {textItems.length > 0 && (
        <section>
          <p className="text-club-mute text-xs tracking-widest uppercase mb-3">Text</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {textItems.map(renderTile)}
          </div>
        </section>
      )}
      {mediaItems.length > 0 && (
        <section>
          <p className="text-club-mute text-xs tracking-widest uppercase mb-3">Images</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mediaItems.map(renderTile)}
          </div>
        </section>
      )}
    </div>
  );
}
