---
name: audio-engine
description: Rules and templates for generating the PWA background audio player and Media Session handlers.
---

When implementing or modifying the audio system:
1. Always maintain a singleton pattern for the audio instance.
2. Ensure `navigator.mediaSession` supports:
   - `play` / `pause`
   - `seekto`
   - `previoustrack` / `nexttrack` (navigating between surahs/ayahs within the active Juz)
3. Ensure the audio automatically triggers continuous looping for the active Juz:
   - When ayah N finishes, trigger ayah N+1.
   - When the last ayah of the Juz finishes, loop back to ayah 1 of that Juz.
4. Integrate with the Cache API:
   - Before playing, check `caches.match(audioUrl)`.
   - If not found, stream the audio and asynchronously store a clone of the response in the cache.