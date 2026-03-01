# Drinking DJ

A single-user DJ web app: play YouTube music and trigger sound effects (air horn, cheer, record scratch, etc.) with DJ-style tools. No accounts, no rooms — just you.

## Run locally

```bash
cd drinking-dj
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Tap **“Enable audio”** once (browsers require a user gesture before sound), then use the player, soundboard, and DJ tools.

## Sound effects (SFX)

Place your own sound files in **`public/sfx/`** with these names (as `.mp3` or `.wav`):

- `airhorn`, `bruh`, `boo`, `cheer`, `drumfill`, `rimshot`, `scratch`, `drink`, `applause`, `whistle`, `laser`, `ok`

See `public/sfx/README.md` for the full list. Use only assets you have rights to.

## Features

- **YouTube:** Paste a URL or video ID, add to queue, play/pause/next. Uses the official YouTube IFrame API only (no downloading).
- **Soundboard:** 12 SFX with hotkeys (1–6, Q, W, E, A, S, D) and per-sound volume. Sounds are preloaded for instant playback.
- **DJ tools:** Crossfader (music vs SFX), volume sliders, filter, reverb, delay/echo, and hype buttons (DROP, REWIND, MUTE 3s).

## Tech

- Next.js (App Router), TypeScript, Tailwind CSS
- Web Audio API for SFX
- YouTube IFrame Player API for music
- No backend or database — everything runs in the browser

## Tests

```bash
npm test
```

## Build

```bash
npm run build
npm start
```
