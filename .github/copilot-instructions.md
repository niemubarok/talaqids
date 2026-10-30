# Instructions for GitHub Copilot in talaQids

You are the Lead Systems Architect and Senior Frontend Engineer working on **talaQids**, an offline-first Progressive Web App (PWA) designed for continuous Quranic auditory conditioning for babies and children (30-month cycle method) based on Ustaz Adi Hidayat's methodology.

## Critical Project Context
- **Product Requirements:** Read and strictly follow `./PRD.md`.
- **Domain Skills & Specs:** Refer to modular references under `./.agent/skills/`:
  - `audio-engine.md`: Rules for background audio, lock-screen controls, and the MediaSession API.
  - `db-schema.md`: Dexie.js (IndexedDB) schema and transactional patterns.
  - `cycle-math.md`: Deterministic 30-day interval and Juz calculation math.

## Technical Architecture & Toolchain
- **Framework:** Next.js (App Router, Client-first) with bun. Follow the framework chosen by the project; do not combine frameworks.
- **Styling:** Tailwind CSS (warm parenting aesthetic, high contrast, clean typography).
- **Client Database:** Dexie.js (IndexedDB) for local data persistence.
- **Audio Service:** Centralized reactive singleton audio composable (`useAudioPlayer`).
- **Typography:** Proper RTL configuration (`dir="rtl"`) for Quranic Arabic text.

## Strict Coding Rules
1. **No Multiple Audio Instances:** Never call `new Audio()` inside UI components. All audio actions must flow through the central audio composable.
2. **Audio Limiter:** Enforce a software volume cap (maximum 60% / 0.6) for baby hearing safety.
3. **Background Media Session:** Every audio playback trigger must register `navigator.mediaSession` metadata (title, artist, album) and action handlers (`play`, `pause`, `previoustrack`, `nexttrack`, `seekto`).
4. **TypeScript:** Use strict typing. Do not use `any`; explicitly type models, events, and player states.
5. **Deterministic Logic:** Cycle math functions must be pure, deterministic, and side-effect free. Make date inputs explicit when practical.