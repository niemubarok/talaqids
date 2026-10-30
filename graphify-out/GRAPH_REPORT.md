# Graph Report - talaqids  (2026-10-30)

## Corpus Check
- 37 files · ~133,259 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .lock 1, .ico 1)

## Summary
- 352 nodes · 759 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d934111d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- MushafManualView.tsx
- Industry-Specific Design Languages
- package.json
- useAudioPlayer.ts
- talaQids README
- AudioEngineSingleton
- compilerOptions
- talaQids PWA
- talaqids Logo Image
- manifest.json
- Talaqids App Icon (PNG)
- page.tsx
- postcss.config.mjs
- sw.js

## God Nodes (most connected - your core abstractions)
1. `AudioEngineSingleton` - 31 edges
2. `useAudioPlayer()` - 27 edges
3. `HomePage()` - 19 edges
4. `syncWithGoogleDrive()` - 16 edges
5. `compilerOptions` - 16 edges
6. `NowPlayingSheet()` - 15 edges
7. `react` - 14 edges
8. `InfaqSettingsView()` - 13 edges
9. `ChildProfile` - 13 edges
10. `talaQids PWA` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Mobile App UI/UX Design Skill Guide` --semantically_similar_to--> `talaQids PWA`  [INFERRED] [semantically similar]
  .agents/skills/mobile-app-ui-design/SKILL.md → .github/copilot-instructions.md
- `calculateCycleStatus()` --semantically_similar_to--> `cycle-math.ts Module (src/lib/cycle-math.ts)`  [INFERRED] [semantically similar]
  .agent/skills/cycle-math.md → README.md
- `Implementation Notes (React/Tailwind)` --semantically_similar_to--> `Tailwind CSS Styling`  [INFERRED] [semantically similar]
  .agents/skills/mobile-app-ui-design/SKILL.md → .github/copilot-instructions.md
- `OnboardingModal Component` --references--> `calculateCycleStatus()`  [INFERRED]
  README.md → .agent/skills/cycle-math.md
- `Local-First Data Architecture (Dexie.js / IndexedDB)` --conceptually_related_to--> `TalaQidsDB Dexie Class`  [INFERRED]
  PRD.md → .agent/skills/db-schema.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Talaqids Icon Visual System (Palette, Circular Form, Glyphs)** — public_icon_talaqids_png_app_icon, public_icon_talaqids_png_color_palette, public_icon_talaqids_png_circular_composition, public_icon_talaqids_png_brand_identity [EXTRACTED 0.75]
- **Five-Step Mobile Design Flow** — agents_skills_mobile_app_ui_design_skill_design_process, agents_skills_mobile_app_ui_design_skill_ux_lens, agents_skills_mobile_app_ui_design_skill_color_system_60_30_10, agents_skills_mobile_app_ui_design_skill_peak_end_design, agents_skills_mobile_app_ui_design_skill_polish_details [EXTRACTED 1.00]
- **Core Mobile Design Laws** — agents_skills_mobile_app_ui_design_skill_color_system_60_30_10, agents_skills_mobile_app_ui_design_skill_spacing_8_point_grid, agents_skills_mobile_app_ui_design_skill_typography_hierarchy, agents_skills_mobile_app_ui_design_skill_thumb_zone, agents_skills_mobile_app_ui_design_skill_f_pattern, agents_skills_mobile_app_ui_design_references_industry_conventions_peak_end_rule [EXTRACTED 1.00]
- **Background Audio Playback System** — _agent_skills_audio_engine_singleton_audio_engine, _agent_skills_audio_engine_media_session_handlers, _agent_skills_audio_engine_continuous_juz_looping, _agent_skills_audio_engine_cache_api_integration, prd_audio_player, readme_useaudioplayer [INFERRED 0.85]
- **Local-First Dexie.js Data Layer** — _agent_skills_db_schema_talaqidsdb, _agent_skills_db_schema_childprofile, _agent_skills_db_schema_dailyprogress, _agent_skills_db_schema_appsettings, prd_local_first_architecture, readme_db_module [INFERRED 0.85]
- **Search + Read + Listen Motif Fusion in Talaqids Icon** — public_icon_talaqids_png_magnifying_glass, public_icon_talaqids_png_open_book, public_icon_talaqids_png_headphones, public_icon_talaqids_png_wave_lines [INFERRED 0.85]
- **talaQids Offline-First Audio Architecture** — github_copilot_instructions_talaqids, github_copilot_instructions_use_audio_player, github_copilot_instructions_media_session_api, github_copilot_instructions_audio_limiter, github_copilot_instructions_dexie_indexeddb [INFERRED 0.85]
- **Deterministic 30-Day Cycle Scheduling Flow** — _agent_skills_cycle_math_calculatecyclestatus, _agent_skills_cycle_math_cyclestatus, _agent_skills_cycle_math_pure_function_constraint, _agent_skills_db_schema_childprofile, prd_cycle_math_engine, prd_thirty_juz_cycle_method, readme_cycle_math_module [INFERRED 0.90]
- **talaqids Brand Visual System** — public_logo_talaqids_png_talaqids_wordmark, public_logo_talaqids_png_rounded_typeface, public_logo_talaqids_png_deep_green_palette, public_logo_talaqids_png_gold_accent [INFERRED 0.95]
- **talaqids Logo Mark Composition** — public_logo_talaqids_png_open_book_icon, public_logo_talaqids_png_headset_motif, public_logo_talaqids_png_magnifier_q_mark, public_logo_talaqids_png_smiling_face_detail [INFERRED 0.95]

## Communities (15 total, 3 thin omitted)

### Community 0 - "MushafManualView.tsx"
Cohesion: 0.12
Nodes (24): DashboardAudioViewProps, APP_BENEFITS, CATEGORIES, CategoryFilter, INSIGHT_ARTICLES, InsightArticle, InsightsViewProps, MushafManualViewProps (+16 more)

### Community 1 - "Industry-Specific Design Languages"
Cohesion: 0.06
Nodes (41): Mobile App UI Design Codebase Index, Quick Reference Guide, ASO Shots, Mobile App UI/UX Design Skill README, Ahead Case Study (Apple Design Award), AI/Tech Design Language, Design Process for Client/Product Work, The Comfort Trap (Consistency as Moat) (+33 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (34): dependencies, dexie, dexie-react-hooks, lucide-react, next, react, react-dom, @vercel/analytics (+26 more)

### Community 3 - "useAudioPlayer.ts"
Cohesion: 0.09
Nodes (36): nextConfig, lucide-react, next, react, react-dom, DashboardAudioView(), EditChildModalProps, NowPlayingBarProps (+28 more)

### Community 4 - "talaQids README"
Cohesion: 0.08
Nodes (34): Cache API Audio Prefetch Integration, Continuous Juz Looping Rule, Media Session Action Handlers (play/pause/seekto/previoustrack/nexttrack), calculateCycleStatus(), CycleStatus Interface, AppSettings Table Interface, ChildProfile Table Interface, DailyProgress Table Interface (+26 more)

### Community 5 - "AudioEngineSingleton"
Cohesion: 0.20
Nodes (4): NowPlayingBar(), NowPlayingSheet(), AudioEngineSingleton, useAudioPlayer()

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "talaQids PWA"
Cohesion: 0.17
Nodes (14): Implementation Notes (React/Tailwind), 30-Month Quranic Auditory Conditioning Cycle, audio-engine.md Spec, cycle-math.md Spec, db-schema.md Spec, Dexie.js IndexedDB, MediaSession API, Next.js App Router (+6 more)

### Community 8 - "talaqids Logo Image"
Cohesion: 0.40
Nodes (10): Deep Green Color Palette, Gold / Sand Accent Color, Headset / Listening Motif, Learning-Oriented Brand Identity, talaqids Logo Image, Circular Magnifier Q Mark, Open Book Icon, Rounded Soft Typeface (+2 more)

### Community 9 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 10 - "Talaqids App Icon (PNG)"
Cohesion: 0.39
Nodes (9): Talaqids App Icon (PNG), Audio-Enabled Text Library Product Concept, Talaqids Brand Identity (Search + Read + Listen), Concentric Circular Composition with Heavy Outline, Color Palette: Deep Green on Warm Gold / White, Headphones Motif (Ear Cups with Green Headband Arc), Magnifying Glass Motif (Gold Ring with Handle), Open Book Motif (Dark Green Center) (+1 more)

### Community 11 - "page.tsx"
Cohesion: 0.11
Nodes (44): ActiveTab, HomePage(), NAV_ITEMS, EditChildModal(), INFAQ_OPTIONS, InfaqSettingsView(), InfaqSettingsViewProps, InsightsView() (+36 more)

## Ambiguous Edges - Review These
- `Audio-Enabled Text Library Product Concept` → `Talaqids Brand Identity (Search + Read + Listen)`  [AMBIGUOUS]
  public/icon_talaqids.png · relation: rationale_for

## Knowledge Gaps
- **105 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 116 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Audio-Enabled Text Library Product Concept` and `Talaqids Brand Identity (Search + Read + Listen)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **Why does `react` connect `useAudioPlayer.ts` to `MushafManualView.tsx`, `package.json`, `page.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `next` connect `useAudioPlayer.ts` to `package.json`, `page.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useAudioPlayer()` connect `AudioEngineSingleton` to `page.tsx`, `MushafManualView.tsx`, `useAudioPlayer.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MushafManualView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `Industry-Specific Design Languages` be split into smaller, more focused modules?**
  _Cohesion score 0.061224489795918366 - nodes in this community are weakly interconnected._