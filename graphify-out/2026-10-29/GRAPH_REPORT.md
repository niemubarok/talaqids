# Graph Report - talaqids  (2026-10-29)

## Corpus Check
- 35 files · ~86,020 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .lock 1, .css 1)

## Summary
- 327 nodes · 594 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Screens & Domain Libraries
- Mobile UI Design Skill (Agents)
- Build Config & Dependencies
- Mobile UI Design Skill (Kiro)
- Product Spec & Feature Modules
- Audio Engine Singleton
- TypeScript Compiler Config
- Copilot Project Rules
- Brand Logo Composition
- PWA Manifest
- App Icon Motifs (PNG)
- SVG Icon Geometry
- PostCSS Config
- Service Worker Shell
- Skill Design Principle
- Order Tracking Pattern

## God Nodes (most connected - your core abstractions)
1. `AudioEngineSingleton` - 30 edges
2. `useAudioPlayer()` - 24 edges
3. `compilerOptions` - 16 edges
4. `DashboardAudioView()` - 14 edges
5. `talaQids PWA` - 13 edges
6. `Industry Conventions & Emotional Design Reference` - 12 edges
7. `5-Step Mobile Design Process` - 11 edges
8. `HomePage()` - 10 edges
9. `MushafManualView()` - 10 edges
10. `talaQids README` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Mobile App UI/UX Design Skill Guide` --semantically_similar_to--> `talaQids PWA`  [INFERRED] [semantically similar]
  .agents/skills/mobile-app-ui-design/SKILL.md → .github/copilot-instructions.md
- `calculateCycleStatus()` --semantically_similar_to--> `cycle-math.ts Module (src/lib/cycle-math.ts)`  [INFERRED] [semantically similar]
  .agent/skills/cycle-math.md → README.md
- `Implementation Notes (React/Tailwind)` --semantically_similar_to--> `Tailwind CSS Styling`  [INFERRED] [semantically similar]
  .agents/skills/mobile-app-ui-design/SKILL.md → .github/copilot-instructions.md
- `Continuous Juz Looping Rule` --implements--> `Audio Player & Baby Safety Control (F-02)`  [INFERRED]
  .agent/skills/audio-engine.md → PRD.md
- `OnboardingModal Component` --references--> `calculateCycleStatus()`  [INFERRED]
  README.md → .agent/skills/cycle-math.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Background Audio Playback System** — _agent_skills_audio_engine_singleton_audio_engine, _agent_skills_audio_engine_media_session_handlers, _agent_skills_audio_engine_continuous_juz_looping, _agent_skills_audio_engine_cache_api_integration, prd_audio_player, readme_useaudioplayer [INFERRED 0.85]
- **Deterministic 30-Day Cycle Scheduling Flow** — _agent_skills_cycle_math_calculatecyclestatus, _agent_skills_cycle_math_cyclestatus, _agent_skills_cycle_math_pure_function_constraint, _agent_skills_db_schema_childprofile, prd_cycle_math_engine, prd_thirty_juz_cycle_method, readme_cycle_math_module [INFERRED 0.90]
- **Local-First Dexie.js Data Layer** — _agent_skills_db_schema_talaqidsdb, _agent_skills_db_schema_childprofile, _agent_skills_db_schema_dailyprogress, _agent_skills_db_schema_appsettings, prd_local_first_architecture, readme_db_module [INFERRED 0.85]
- **Core Mobile Design Laws** — agents_skills_mobile_app_ui_design_skill_color_system_60_30_10, agents_skills_mobile_app_ui_design_skill_spacing_8_point_grid, agents_skills_mobile_app_ui_design_skill_typography_hierarchy, agents_skills_mobile_app_ui_design_skill_thumb_zone, agents_skills_mobile_app_ui_design_skill_f_pattern, agents_skills_mobile_app_ui_design_references_industry_conventions_peak_end_rule [EXTRACTED 1.00]
- **Five-Step Mobile Design Flow** — agents_skills_mobile_app_ui_design_skill_design_process, agents_skills_mobile_app_ui_design_skill_ux_lens, agents_skills_mobile_app_ui_design_skill_color_system_60_30_10, agents_skills_mobile_app_ui_design_skill_peak_end_design, agents_skills_mobile_app_ui_design_skill_polish_details [EXTRACTED 1.00]
- **talaQids Offline-First Audio Architecture** — github_copilot_instructions_talaqids, github_copilot_instructions_use_audio_player, github_copilot_instructions_media_session_api, github_copilot_instructions_audio_limiter, github_copilot_instructions_dexie_indexeddb [INFERRED 0.85]
- **Core Design Laws Applied Together** — kiro_skills_mobile_app_ui_design_skill_color_system_60_30_10, kiro_skills_mobile_app_ui_design_skill_eight_point_grid, kiro_skills_mobile_app_ui_design_skill_typography_hierarchy, kiro_skills_mobile_app_ui_design_skill_thumb_zone, kiro_skills_mobile_app_ui_design_skill_f_pattern, kiro_skills_mobile_app_ui_design_references_industry_conventions_peak_end_rule [EXTRACTED 1.00]
- **Emotional Design Framework (Peak-End + Spotify Principles)** — kiro_skills_mobile_app_ui_design_references_industry_conventions_peak_end_rule, kiro_skills_mobile_app_ui_design_references_industry_conventions_emotional_feedback_loops, kiro_skills_mobile_app_ui_design_references_industry_conventions_trojan_horse, kiro_skills_mobile_app_ui_design_references_industry_conventions_vanity_mirror, kiro_skills_mobile_app_ui_design_references_industry_conventions_comfort_trap [EXTRACTED 1.00]
- **Industry-Specific Design Language Catalog** — kiro_skills_mobile_app_ui_design_references_industry_conventions_ai_tech_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_crypto_web3_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_finance_banking_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_health_wellness_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_sleep_meditation_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_education_learning_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_fitness_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_productivity_language, kiro_skills_mobile_app_ui_design_references_industry_conventions_ecommerce_food_language [EXTRACTED 1.00]
- **TalaqIds Icon Composition: Book on Teal Emblem with Amber Accents** — public_icon_talaqids_mark, public_icon_open_book_glyph, public_icon_circular_emblem, public_icon_teal_amber_palette [EXTRACTED 1.00]
- **Search + Read + Listen Motif Fusion in Talaqids Icon** — public_icon_talaqids_png_magnifying_glass, public_icon_talaqids_png_open_book, public_icon_talaqids_png_headphones, public_icon_talaqids_png_wave_lines [INFERRED 0.85]
- **Talaqids Icon Visual System (Palette, Circular Form, Glyphs)** — public_icon_talaqids_png_app_icon, public_icon_talaqids_png_color_palette, public_icon_talaqids_png_circular_composition, public_icon_talaqids_png_brand_identity [EXTRACTED 0.75]
- **talaqids Logo Mark Composition** — public_logo_talaqids_png_open_book_icon, public_logo_talaqids_png_headset_motif, public_logo_talaqids_png_magnifier_q_mark, public_logo_talaqids_png_smiling_face_detail [INFERRED 0.95]
- **talaqids Brand Visual System** — public_logo_talaqids_png_talaqids_wordmark, public_logo_talaqids_png_rounded_typeface, public_logo_talaqids_png_deep_green_palette, public_logo_talaqids_png_gold_accent [INFERRED 0.95]

## Communities (16 total, 4 thin omitted)

### Community 0 - "App Screens & Domain Libraries"
Cohesion: 0.09
Nodes (45): lucide-react, react, ActiveTab, HomePage(), DashboardAudioViewProps, INFAQ_OPTIONS, InfaqSettingsView(), InfaqSettingsViewProps (+37 more)

### Community 1 - "Mobile UI Design Skill (Agents)"
Cohesion: 0.06
Nodes (41): Mobile App UI Design Codebase Index, Quick Reference Guide, ASO Shots, Mobile App UI/UX Design Skill README, Ahead Case Study (Apple Design Award), AI/Tech Design Language, Design Process for Client/Product Work, The Comfort Trap (Consistency as Moat) (+33 more)

### Community 2 - "Build Config & Dependencies"
Cohesion: 0.05
Nodes (35): nextConfig, dependencies, dexie, dexie-react-hooks, lucide-react, next, react, react-dom (+27 more)

### Community 3 - "Mobile UI Design Skill (Kiro)"
Cohesion: 0.09
Nodes (32): Codebase Index (Mobile App UI Design Skill), Quick Reference: Design Laws Summary, Mobile App UI/UX Design Skill README, ASO Shots (Store Screenshot Skill), Industry Conventions & Emotional Design Reference, AI/Tech Design Language, 4-Phase Client/Product Design Process, The Comfort Trap (Consistency as a Moat) (+24 more)

### Community 4 - "Product Spec & Feature Modules"
Cohesion: 0.08
Nodes (34): Cache API Audio Prefetch Integration, Continuous Juz Looping Rule, Media Session Action Handlers (play/pause/seekto/previoustrack/nexttrack), calculateCycleStatus(), CycleStatus Interface, AppSettings Table Interface, ChildProfile Table Interface, DailyProgress Table Interface (+26 more)

### Community 5 - "Audio Engine Singleton"
Cohesion: 0.21
Nodes (3): DashboardAudioView(), AudioEngineSingleton, useAudioPlayer()

### Community 6 - "TypeScript Compiler Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "Copilot Project Rules"
Cohesion: 0.17
Nodes (14): Implementation Notes (React/Tailwind), 30-Month Quranic Auditory Conditioning Cycle, audio-engine.md Spec, cycle-math.md Spec, db-schema.md Spec, Dexie.js IndexedDB, MediaSession API, Next.js App Router (+6 more)

### Community 8 - "Brand Logo Composition"
Cohesion: 0.40
Nodes (10): Deep Green Color Palette, Gold / Sand Accent Color, Headset / Listening Motif, Learning-Oriented Brand Identity, talaqids Logo Image, Circular Magnifier Q Mark, Open Book Icon, Rounded Soft Typeface (+2 more)

### Community 9 - "PWA Manifest"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 10 - "App Icon Motifs (PNG)"
Cohesion: 0.39
Nodes (9): Talaqids App Icon (PNG), Audio-Enabled Text Library Product Concept, Talaqids Brand Identity (Search + Read + Listen), Concentric Circular Composition with Heavy Outline, Color Palette: Deep Green on Warm Gold / White, Headphones Motif (Ear Cups with Green Headband Arc), Magnifying Glass Motif (Gold Ring with Handle), Open Book Motif (Dark Green Center) (+1 more)

### Community 11 - "SVG Icon Geometry"
Cohesion: 0.47
Nodes (6): Circular Badge Emblem Frame (r=184, Amber Ring), Open Book Glyph (Cream Pages, Golden Outline), PWA / App-Store Icon Identity (Rounded-Square Maskable Canvas), Supporting Motifs: Amber Dot Above Spine and Curved Base Arc, TalaqIds App Icon (icon.svg), Teal & Amber Brand Palette (#0F766E, #115E59, #F59E0B, #FBBF24, #FDFBF7)

## Ambiguous Edges - Review These
- `Talaqids Brand Identity (Search + Read + Listen)` → `Audio-Enabled Text Library Product Concept`  [AMBIGUOUS]
  public/icon_talaqids.png · relation: rationale_for

## Knowledge Gaps
- **97 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 106 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Talaqids Brand Identity (Search + Read + Listen)` and `Audio-Enabled Text Library Product Concept`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **Why does `react` connect `App Screens & Domain Libraries` to `Build Config & Dependencies`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `AudioEngineSingleton` connect `Audio Engine Singleton` to `App Screens & Domain Libraries`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useAudioPlayer()` connect `Audio Engine Singleton` to `App Screens & Domain Libraries`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Screens & Domain Libraries` be split into smaller, more focused modules?**
  _Cohesion score 0.09415584415584416 - nodes in this community are weakly interconnected._
- **Should `Mobile UI Design Skill (Agents)` be split into smaller, more focused modules?**
  _Cohesion score 0.061224489795918366 - nodes in this community are weakly interconnected._