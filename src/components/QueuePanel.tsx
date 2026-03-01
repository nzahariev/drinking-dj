'use client';

export interface QueueItem {
  id: string;
  videoId: string;
  title: string;
}

export function QueuePanel({
  queue,
  onRemove,
}: {
  queue: QueueItem[];
  onRemove: (itemId: string) => void;
}) {
  return (
    <div className="p-4 border-t border-club-border flex-1 min-h-0 flex flex-col">
      <h3 className="font-display text-sm text-club-neon-cyan mb-2">QUEUE</h3>
      <ul className="space-y-1 overflow-auto flex-1 min-h-0 text-sm">
        {queue.length === 0 ? (
          <li className="text-club-mute">Empty — add tracks above</li>
        ) : (
          queue.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-1 group">
              <span className="truncate text-white" title={item.title}>
                {item.title}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="flex-shrink-0 text-club-mute hover:text-red-400 text-xs px-2 py-0.5 rounded"
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
