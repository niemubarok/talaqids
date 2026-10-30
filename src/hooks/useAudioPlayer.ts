'use client';

import { useEffect, useSyncExternalStore, useCallback } from 'react';
import { getJuzAyahTracks, RECITERS, type AyahTrackItem } from '@/lib/quran-metadata';
import { db, incrementListenMinutes, markPagesCompletedByAudio } from '@/lib/db';

const MAX_SAFE_VOLUME = 0.6; // Strict 60% Baby-Safe Volume Cap

export type SleepTimerMode = 'off' | '15m' | '30m' | '60m' | 'end_of_juz';

interface PlaybackCheckpoint {
  trackIndex: number;
  currentTime: number;
  volume?: number;
  updatedAt: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  activeJuz: number;
  reciterId: string;
  currentTrackIndex: number;
  tracks: AyahTrackItem[];
  volume: number; // 0.0 to 0.6 (strictly capped)
  requestedHighVolumeWarning: boolean;
  currentTime: number;
  duration: number;
  sleepTimerMode: SleepTimerMode;
  sleepRemainingSeconds: number | null;
  activeChildId: string | null;
  currentCycleMonth: number;
  error: string | null;
  offlineCachedCount: number;
  isDownloadingJuz: boolean;
  downloadProgress: number; // 0 to 100
}

type Listener = () => void;

class AudioEngineSingleton {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();
  private sleepInterval: ReturnType<typeof setInterval> | null = null;
  private listenAccumulatorSeconds = 0;

  private state: AudioPlayerState = {
    isPlaying: false,
    isLoading: false,
    activeJuz: 1,
    reciterId: 'al_husary',
    currentTrackIndex: 0,
    tracks: getJuzAyahTracks(1, 'al_husary'),
    volume: 0.45, // Safe soothing default (45% of 100%, below 60% cap)
    requestedHighVolumeWarning: false,
    currentTime: 0,
    duration: 0,
    sleepTimerMode: 'off',
    sleepRemainingSeconds: null,
    activeChildId: null,
    currentCycleMonth: 1,
    error: null,
    offlineCachedCount: 0,
    isDownloadingJuz: false,
    downloadProgress: 0,
  };

  public getState = (): AudioPlayerState => {
    return this.state;
  };

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private setState(partial: Partial<AudioPlayerState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l());
  }

  private ensureAudio(): HTMLAudioElement {
    if (typeof window === 'undefined') {
      throw new Error('AudioEngine can only be initialized in client browser');
    }
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = Math.min(MAX_SAFE_VOLUME, this.state.volume);

      this.audio.addEventListener('play', () => {
        this.setState({ isPlaying: true, isLoading: false, error: null });
        this.updateMediaSessionPlaybackState('playing');
      });

      this.audio.addEventListener('pause', () => {
        this.setState({ isPlaying: false });
        this.savePlaybackCheckpoint();
        this.updateMediaSessionPlaybackState('paused');
      });

      this.audio.addEventListener('waiting', () => {
        this.setState({ isLoading: true });
      });

      this.audio.addEventListener('canplay', () => {
        this.setState({ isLoading: false });
      });

      this.audio.addEventListener('timeupdate', () => {
        if (!this.audio) return;
        const ct = this.audio.currentTime;
        const dur = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
        this.setState({
          currentTime: ct,
          duration: dur,
        });
        // Persist playback position every ~2 seconds
        if (Math.floor(ct) % 2 === 0) {
          this.savePlaybackCheckpoint(this.state.currentTrackIndex, ct);
        }
      });

      this.audio.addEventListener('ended', () => {
        void this.handleTrackEnded();
      });

      this.audio.addEventListener('error', () => {
        this.setState({
          isLoading: false,
          isPlaying: false,
          error: 'Gagal memuat audio. Periksa koneksi internet atau unduh Juz untuk mode offline.',
        });
      });

      this.startTimers();
    }
    return this.audio;
  }

  private startTimers(): void {
    if (this.sleepInterval) return;
    this.sleepInterval = setInterval(() => {
      // 1. Track listening duration for active child
      if (this.state.isPlaying && this.state.activeChildId) {
        this.listenAccumulatorSeconds += 1;
        if (this.listenAccumulatorSeconds >= 30) {
          const minutes = this.listenAccumulatorSeconds / 60;
          this.listenAccumulatorSeconds = 0;
          void incrementListenMinutes(
            this.state.activeChildId,
            this.state.activeJuz,
            minutes
          );
        }
      }

      // 2. Countdown sleep timer
      if (
        this.state.isPlaying &&
        this.state.sleepRemainingSeconds !== null &&
        this.state.sleepRemainingSeconds > 0
      ) {
        const nextSec = this.state.sleepRemainingSeconds - 1;
        if (nextSec <= 0) {
          this.pause();
          this.setState({
            sleepTimerMode: 'off',
            sleepRemainingSeconds: null,
          });
        } else {
          this.setState({ sleepRemainingSeconds: nextSec });
        }
      }
    }, 1000);
  }

  private getCacheName(juz: number, reciterId: string): string {
    return `talaqids-audio-juz-${juz}-${reciterId}`;
  }

  private async resolveAudioSrc(audioUrl: string, juz: number, reciterId: string): Promise<string> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return audioUrl;
    }

    try {
      const cacheName = this.getCacheName(juz, reciterId);
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(audioUrl);

      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }

      // Background cache store without blocking playback stream
      void fetch(audioUrl)
        .then((res) => {
          if (res.ok) {
            return cache.put(audioUrl, res.clone());
          }
        })
        .then(() => {
          void this.refreshOfflineCacheCount(juz, reciterId);
        })
        .catch(() => {
          // Ignore network cache errors while streaming
        });
    } catch {
      // Fallback to direct URL
    }

    return audioUrl;
  }

  public async refreshOfflineCacheCount(
    juz = this.state.activeJuz,
    reciterId = this.state.reciterId
  ): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cache = await caches.open(this.getCacheName(juz, reciterId));
      const keys = await cache.keys();
      this.setState({ offlineCachedCount: keys.length });
    } catch {
      this.setState({ offlineCachedCount: 0 });
    }
  }

  private getCheckpointStorageKey(childId: string | null, juz: number): string {
    return `talaqids-playback-v1-${childId || 'default'}-juz-${juz}`;
  }

  private savePlaybackCheckpoint(
    trackIndex = this.state.currentTrackIndex,
    currentTime = this.state.currentTime
  ): void {
    if (typeof window === 'undefined') return;
    try {
      const key = this.getCheckpointStorageKey(this.state.activeChildId, this.state.activeJuz);
      const data: PlaybackCheckpoint = {
        trackIndex,
        currentTime,
        volume: this.state.volume,
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  private loadPlaybackCheckpoint(
    childId: string | null,
    juz: number,
    maxTracks: number
  ): PlaybackCheckpoint | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = this.getCheckpointStorageKey(childId, juz);
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PlaybackCheckpoint;
      if (typeof parsed.trackIndex !== 'number') return null;
      const safeIndex = Math.max(0, Math.min(maxTracks - 1, parsed.trackIndex));
      return {
        trackIndex: safeIndex,
        currentTime: Math.max(0, parsed.currentTime || 0),
        volume: parsed.volume,
        updatedAt: parsed.updatedAt || Date.now(),
      };
    } catch {
      return null;
    }
  }

  private syncPassedMushafPages(maxCompletedRelativePage: number): void {
    if (!this.state.activeChildId || maxCompletedRelativePage < 1) return;
    void markPagesCompletedByAudio({
      childId: this.state.activeChildId,
      juzNumber: this.state.activeJuz,
      maxRelativePage: maxCompletedRelativePage,
    });
  }

  public configureSession(params: {
    juz: number;
    reciterId: string;
    childId: string | null;
    cycleMonth: number;
  }): void {
    const juzChanged = params.juz !== this.state.activeJuz;
    const reciterChanged = params.reciterId !== this.state.reciterId;
    const childChanged = params.childId !== this.state.activeChildId;

    if (juzChanged || reciterChanged || childChanged) {
      const newTracks = getJuzAyahTracks(params.juz, params.reciterId);
      const onlyReciterChanged = reciterChanged && !juzChanged && !childChanged;
      const checkpoint = onlyReciterChanged
        ? null
        : this.loadPlaybackCheckpoint(params.childId, params.juz, newTracks.length);
      const restoredIndex = onlyReciterChanged
        ? Math.min(this.state.currentTrackIndex, Math.max(0, newTracks.length - 1))
        : checkpoint
          ? checkpoint.trackIndex
          : 0;
      const restoredTime = onlyReciterChanged ? 0 : checkpoint ? checkpoint.currentTime : 0;
      const restoredVolume =
        checkpoint && typeof checkpoint.volume === 'number'
          ? Math.min(MAX_SAFE_VOLUME, Math.max(0, checkpoint.volume))
          : this.state.volume;

      const wasPlaying = this.state.isPlaying;
      this.setState({
        activeJuz: params.juz,
        reciterId: params.reciterId,
        activeChildId: params.childId,
        currentCycleMonth: params.cycleMonth,
        tracks: newTracks,
        currentTrackIndex: restoredIndex,
        currentTime: restoredTime,
        volume: restoredVolume,
        duration: 0,
      });

      const currentTrack = newTracks[restoredIndex];
      if (currentTrack && currentTrack.relativePage > 1 && params.childId) {
        void markPagesCompletedByAudio({
          childId: params.childId,
          juzNumber: params.juz,
          maxRelativePage: currentTrack.relativePage - 1,
        });
      }

      void this.refreshOfflineCacheCount(params.juz, params.reciterId);
      if (wasPlaying) {
        void this.playTrackAtIndex(restoredIndex, restoredTime);
      } else if (this.audio) {
        // Clear old src so next togglePlay loads the restored track and time
        this.audio.removeAttribute('src');
      }
    } else {
      this.setState({
        activeChildId: params.childId,
        currentCycleMonth: params.cycleMonth,
      });
    }
  }

  public async playTrackAtIndex(index: number, resumeTimeSeconds = 0): Promise<void> {
    const audio = this.ensureAudio();
    const { tracks, activeJuz, reciterId } = this.state;
    if (tracks.length === 0) return;

    const safeIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    const track = tracks[safeIndex];

    this.setState({
      currentTrackIndex: safeIndex,
      currentTime: resumeTimeSeconds,
      isLoading: true,
      error: null,
    });

    this.savePlaybackCheckpoint(safeIndex, resumeTimeSeconds);

    // If audio has reached relativePage > 1, all previous pages (1 .. relativePage - 1) have been passed
    if (track.relativePage > 1) {
      this.syncPassedMushafPages(track.relativePage - 1);
    }

    const resolvedSrc = await this.resolveAudioSrc(track.audioUrl, activeJuz, reciterId);
    audio.src = resolvedSrc;
    audio.volume = Math.min(MAX_SAFE_VOLUME, this.state.volume);

    if (resumeTimeSeconds > 0) {
      const applyResumeTime = () => {
        if (this.audio && resumeTimeSeconds < (this.audio.duration || Infinity)) {
          this.audio.currentTime = resumeTimeSeconds;
        }
      };
      if (audio.readyState >= 1) {
        applyResumeTime();
      } else {
        audio.addEventListener('loadedmetadata', applyResumeTime, { once: true });
      }
    }

    this.registerMediaSession(track);

    try {
      await audio.play();
    } catch {
      this.setState({
        isLoading: false,
        isPlaying: false,
      });
    }
  }

  public async playFromRelativePage(relativePage: number): Promise<void> {
    const targetIdx = this.state.tracks.findIndex((t) => t.relativePage === relativePage);
    if (targetIdx >= 0) {
      await this.playTrackAtIndex(targetIdx, 0);
    }
  }

  public async playSpecificAyah(surahNumber: number, ayahNumber: number): Promise<void> {
    const targetIdx = this.state.tracks.findIndex(
      (t) => t.surahNumber === surahNumber && t.ayahNumber === ayahNumber
    );
    if (targetIdx >= 0) {
      await this.playTrackAtIndex(targetIdx, 0);
    }
  }

  public async restartFromBeginning(): Promise<void> {
    await this.playTrackAtIndex(0, 0);
  }

  public async togglePlay(): Promise<void> {
    const audio = this.ensureAudio();
    if (this.state.isPlaying) {
      this.pause();
      return;
    }

    if (!audio.src) {
      await this.playTrackAtIndex(this.state.currentTrackIndex, this.state.currentTime);
    } else {
      this.registerMediaSession(this.state.tracks[this.state.currentTrackIndex]);
      try {
        await audio.play();
      } catch {
        await this.playTrackAtIndex(this.state.currentTrackIndex, this.state.currentTime);
      }
    }
  }

  public pause(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.savePlaybackCheckpoint();
    this.setState({ isPlaying: false });
  }

  public async nextTrack(): Promise<void> {
    const currentTrack = this.state.tracks[this.state.currentTrackIndex];
    const nextIdx = (this.state.currentTrackIndex + 1) % this.state.tracks.length;
    const nextTrackItem = this.state.tracks[nextIdx];

    if (
      currentTrack &&
      nextTrackItem &&
      (nextIdx === 0 || nextTrackItem.relativePage > currentTrack.relativePage)
    ) {
      this.syncPassedMushafPages(currentTrack.relativePage);
    }

    await this.playTrackAtIndex(nextIdx, 0);
  }

  public async previousTrack(): Promise<void> {
    const prevIdx =
      (this.state.currentTrackIndex - 1 + this.state.tracks.length) %
      this.state.tracks.length;
    await this.playTrackAtIndex(prevIdx, 0);
  }

  public seekTo(seconds: number): void {
    if (!this.audio || !Number.isFinite(seconds)) return;
    this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    this.setState({ currentTime: this.audio.currentTime });
    this.savePlaybackCheckpoint(this.state.currentTrackIndex, this.audio.currentTime);
  }

  public setVolume(requestedVolume: number): void {
    const isOverCap = requestedVolume > MAX_SAFE_VOLUME;
    const clampedVolume = Math.max(0, Math.min(MAX_SAFE_VOLUME, requestedVolume));
    if (this.audio) {
      this.audio.volume = clampedVolume;
    }
    this.setState({
      volume: clampedVolume,
      requestedHighVolumeWarning: isOverCap || clampedVolume >= MAX_SAFE_VOLUME,
    });
    this.savePlaybackCheckpoint();
  }

  public setSleepTimer(mode: SleepTimerMode): void {
    if (mode === 'off') {
      this.setState({ sleepTimerMode: 'off', sleepRemainingSeconds: null });
    } else if (mode === '15m') {
      this.setState({ sleepTimerMode: '15m', sleepRemainingSeconds: 15 * 60 });
    } else if (mode === '30m') {
      this.setState({ sleepTimerMode: '30m', sleepRemainingSeconds: 30 * 60 });
    } else if (mode === '60m') {
      this.setState({ sleepTimerMode: '60m', sleepRemainingSeconds: 60 * 60 });
    } else if (mode === 'end_of_juz') {
      this.setState({ sleepTimerMode: 'end_of_juz', sleepRemainingSeconds: null });
    }
  }

  public setReciter(reciterId: string): void {
    if (reciterId === this.state.reciterId) return;
    const newTracks = getJuzAyahTracks(this.state.activeJuz, reciterId);
    const currentIndex = Math.min(
      this.state.currentTrackIndex,
      Math.max(0, newTracks.length - 1)
    );
    const wasPlaying = this.state.isPlaying;

    this.setState({
      reciterId,
      tracks: newTracks,
      currentTrackIndex: currentIndex,
      currentTime: 0,
      duration: 0,
      error: null,
    });

    this.savePlaybackCheckpoint(currentIndex, 0);

    if (this.state.activeChildId) {
      void db.children.update(this.state.activeChildId, {
        preferredReciterId: reciterId,
        updatedAt: new Date().toISOString(),
      });
    }

    void this.refreshOfflineCacheCount(this.state.activeJuz, reciterId);

    if (wasPlaying) {
      void this.playTrackAtIndex(currentIndex, 0);
    } else if (this.audio) {
      this.audio.removeAttribute('src');
    }
  }

  private async handleTrackEnded(): Promise<void> {
    const finishedTrack = this.state.tracks[this.state.currentTrackIndex];
    const isLastTrackOfJuz = this.state.currentTrackIndex >= this.state.tracks.length - 1;
    const nextIndex = isLastTrackOfJuz ? 0 : this.state.currentTrackIndex + 1;
    const nextTrack = this.state.tracks[nextIndex];

    // Mark Mushaf page completed when audio finishes the last verse of that page
    if (
      finishedTrack &&
      (isLastTrackOfJuz || (nextTrack && nextTrack.relativePage > finishedTrack.relativePage))
    ) {
      this.syncPassedMushafPages(finishedTrack.relativePage);
    }

    if (isLastTrackOfJuz && this.state.sleepTimerMode === 'end_of_juz') {
      this.pause();
      this.setState({
        currentTrackIndex: 0,
        currentTime: 0,
        sleepTimerMode: 'off',
        sleepRemainingSeconds: null,
      });
      this.savePlaybackCheckpoint(0, 0);
      return;
    }

    // Continuous Juz Looping: when last ayah finishes, loop back to ayah 1 of active Juz
    await this.playTrackAtIndex(nextIndex, 0);
  }

  private registerMediaSession(track: AyahTrackItem | undefined): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !track) {
      return;
    }

    const reciter = RECITERS.find((r) => r.id === this.state.reciterId) || RECITERS[0];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `Juz ${this.state.activeJuz} • QS. ${track.surahName}: ${track.ayahNumber}`,
      artist: reciter.name,
      album: `talaQids — Siklus Bulan Ke-${this.state.currentCycleMonth}`,
      artwork: [
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      void this.togglePlay();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      this.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      void this.previousTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      void this.nextTrack();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        this.seekTo(details.seekTime);
      }
    });
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused'): void {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  public async downloadActiveJuzForOffline(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window) || this.state.isDownloadingJuz) {
      return;
    }

    const { activeJuz, reciterId, tracks } = this.state;
    const cacheName = this.getCacheName(activeJuz, reciterId);
    this.setState({ isDownloadingJuz: true, downloadProgress: 0, error: null });

    try {
      const cache = await caches.open(cacheName);
      let completed = 0;

      // Download in small batches of 5 to keep UI responsive
      const batchSize = 5;
      for (let i = 0; i < tracks.length; i += batchSize) {
        const slice = tracks.slice(i, i + batchSize);
        await Promise.all(
          slice.map(async (item) => {
            const exists = await cache.match(item.audioUrl);
            if (!exists) {
              const response = await fetch(item.audioUrl);
              if (response.ok) {
                await cache.put(item.audioUrl, response.clone());
              }
            }
            completed += 1;
          })
        );
        const progress = Math.min(100, Math.round((completed / tracks.length) * 100));
        this.setState({ downloadProgress: progress });
      }

      await this.refreshOfflineCacheCount(activeJuz, reciterId);
    } catch {
      this.setState({
        error: 'Sebagian audio belum berhasil diunduh. Pastikan perangkat terhubung ke internet.',
      });
    } finally {
      this.setState({ isDownloadingJuz: false });
    }
  }

  public async clearPreviousJuzCaches(): Promise<number> {
    if (typeof window === 'undefined' || !('caches' in window)) return 0;
    const currentCache = this.getCacheName(this.state.activeJuz, this.state.reciterId);
    const allKeys = await caches.keys();
    let deletedCount = 0;

    for (const key of allKeys) {
      if (key.startsWith('talaqids-audio-juz-') && key !== currentCache) {
        await caches.delete(key);
        deletedCount += 1;
      }
    }
    return deletedCount;
  }
}

const audioSingleton = new AudioEngineSingleton();

export function useAudioPlayer() {
  const state = useSyncExternalStore(
    audioSingleton.subscribe,
    audioSingleton.getState,
    audioSingleton.getState
  );

  useEffect(() => {
    void audioSingleton.refreshOfflineCacheCount();
  }, []);

  const configureSession = useCallback(
    (params: { juz: number; reciterId: string; childId: string | null; cycleMonth: number }) => {
      audioSingleton.configureSession(params);
    },
    []
  );

  return {
    state,
    maxSafeVolume: MAX_SAFE_VOLUME,
    configureSession,
    togglePlay: () => audioSingleton.togglePlay(),
    pause: () => audioSingleton.pause(),
    nextTrack: () => audioSingleton.nextTrack(),
    previousTrack: () => audioSingleton.previousTrack(),
    playTrackAtIndex: (index: number) => audioSingleton.playTrackAtIndex(index),
    playFromRelativePage: (relativePage: number) =>
      audioSingleton.playFromRelativePage(relativePage),
    playSpecificAyah: (surah: number, ayah: number) =>
      audioSingleton.playSpecificAyah(surah, ayah),
    restartFromBeginning: () => audioSingleton.restartFromBeginning(),
    seekTo: (seconds: number) => audioSingleton.seekTo(seconds),
    setVolume: (vol: number) => audioSingleton.setVolume(vol),
    setSleepTimer: (mode: SleepTimerMode) => audioSingleton.setSleepTimer(mode),
    setReciter: (reciterId: string) => audioSingleton.setReciter(reciterId),
    downloadActiveJuzForOffline: () => audioSingleton.downloadActiveJuzForOffline(),
    clearPreviousJuzCaches: () => audioSingleton.clearPreviousJuzCaches(),
  };
}

/**
 * Configures the shared audio session without subscribing to playback ticks.
 * Use this in the app shell so it doesn't re-render several times per second.
 */
export function useAudioSessionConfig() {
  return useCallback(
    (params: { juz: number; reciterId: string; childId: string | null; cycleMonth: number }) => {
      audioSingleton.configureSession(params);
    },
    []
  );
}
