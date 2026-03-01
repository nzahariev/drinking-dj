/**
 * Sound effect IDs and labels for the soundboard.
 */

export type SoundId =
  | 'airhorn'
  | 'bruh'
  | 'boo'
  | 'cheer'
  | 'drumfill'
  | 'rimshot'
  | 'scratch'
  | 'drink'
  | 'applause'
  | 'whistle'
  | 'laser'
  | 'ok';

export const SOUND_IDS: SoundId[] = [
  'airhorn',
  'bruh',
  'boo',
  'cheer',
  'drumfill',
  'rimshot',
  'scratch',
  'drink',
  'applause',
  'whistle',
  'laser',
  'ok',
];

export const SOUND_LABELS: Record<SoundId, string> = {
  airhorn: 'Air Horn',
  bruh: 'Bruh',
  boo: 'Boo',
  cheer: 'Cheer',
  drumfill: 'Drum Fill',
  rimshot: 'Rimshot',
  scratch: 'Record Scratch',
  drink: 'Drink!',
  applause: 'Applause',
  whistle: 'Whistle',
  laser: 'Laser',
  ok: 'OK!',
};

export const SOUND_HOTKEYS: Record<SoundId, string> = {
  airhorn: '1',
  bruh: '2',
  boo: '3',
  cheer: '4',
  drumfill: '5',
  rimshot: '6',
  scratch: 'Q',
  drink: 'W',
  applause: 'E',
  whistle: 'A',
  laser: 'S',
  ok: 'D',
};
