---
name: db-schema
description: Schema definition, indexing, and transactional operations using Dexie.js.
---

Ensure all database operations follow this schema definition:

```typescript
import Dexie, { Table } from 'dexie';

export interface ChildProfile {
  id: string; // UUID v4
  name: string;
  birthDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  preferredReciterId: string; // Default: 'al_husary'
  isConsolidationMode: boolean; // default: false
  manualJuzOverride?: number | null; // Optional manual Juz override (1-30)
  customMaxVolume?: number; // default 0.6
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgress {
  id?: number; // Auto-increment
  childId: string;
  date: string; // YYYY-MM-DD
  juzNumber: number;
  listenMinutes: number;
  pagesCompleted: number[]; // Array halaman mushaf yang dibaca (1-20)
  readerRole?: 'Ayah' | 'Ibu' | 'Bersama';
  notes?: string;
}

export interface AppSettings {
  key: string; // 'app_config'
  isProUser: boolean; // Status tier Muhsinin
  infaqActivatedAt?: string;
  maxVolumeCap: number; // Default: 0.6
  enableBackgroundWakeLock: boolean;
}

export class TalaQidsDB extends Dexie {
  children!: Table<ChildProfile, string>;
  progress!: Table<DailyProgress, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('talaQidsDB');
    this.version(1).stores({
      children: 'id, birthDate, startDate',
      progress: '++id, [childId+date], childId, date, juzNumber',
      settings: 'key'
    });
  }
}

export const db = new TalaQidsDB();
```