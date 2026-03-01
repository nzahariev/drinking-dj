/**
 * Extract YouTube video ID from URL or raw id.
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
 */
export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Already just an ID (11 chars, alphanumeric + _-)
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  // youtu.be/ID
  const short = trimmed.match(/(?:youtu\.be\/)([\w-]{11})/);
  if (short) return short[1];

  // youtube.com/watch?v=ID or youtube.com/embed/ID
  const long = trimmed.match(/(?:v=|\/embed\/)([\w-]{11})/);
  if (long) return long[1];

  return null;
}

/**
 * Simple rate limiter: max N actions per windowMs.
 */
export function createRateLimiter(maxPerWindow: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  function clean(userId: string) {
    const now = Date.now();
    const list = hits.get(userId) ?? [];
    const filtered = list.filter((t) => now - t < windowMs);
    if (filtered.length === 0) hits.delete(userId);
    else hits.set(userId, filtered);
    return filtered;
  }

  return {
    check(userId: string): boolean {
      const list = clean(userId);
      if (list.length >= maxPerWindow) return false;
      list.push(Date.now());
      hits.set(userId, list);
      return true;
    },
    remaining(userId: string): number {
      const list = clean(userId);
      return Math.max(0, maxPerWindow - list.length);
    },
  };
}
