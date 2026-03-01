import { describe, it, expect } from 'vitest';
import { extractVideoId, createRateLimiter } from './utils';

describe('extractVideoId', () => {
  it('returns null for empty input', () => {
    expect(extractVideoId('')).toBeNull();
    expect(extractVideoId('   ')).toBeNull();
  });

  it('returns raw 11-char id as-is', () => {
    expect(extractVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractVideoId('abc12345678')).toBe('abc12345678');
  });

  it('extracts from youtu.be URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractVideoId('http://youtu.be/abc12345678')).toBe('abc12345678');
  });

  it('extracts from youtube.com/watch URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractVideoId('https://youtube.com/watch?v=abc12345678&t=10s')).toBe('abc12345678');
  });

  it('extracts from youtube.com/embed URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid input', () => {
    expect(extractVideoId('not a url')).toBeNull();
    expect(extractVideoId('https://example.com')).toBeNull();
  });
});

describe('createRateLimiter', () => {
  it('allows actions under the limit', () => {
    const limiter = createRateLimiter(3, 1000);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(false);
  });

  it('returns remaining count', () => {
    const limiter = createRateLimiter(3, 1000);
    expect(limiter.remaining('user1')).toBe(3);
    limiter.check('user1');
    expect(limiter.remaining('user1')).toBe(2);
    limiter.check('user1');
    limiter.check('user1');
    expect(limiter.remaining('user1')).toBe(0);
  });

  it('isolates different users', () => {
    const limiter = createRateLimiter(2, 1000);
    limiter.check('userA');
    limiter.check('userA');
    expect(limiter.check('userA')).toBe(false);
    expect(limiter.check('userB')).toBe(true);
  });
});
