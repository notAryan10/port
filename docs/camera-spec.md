# Technical Camera Spec — Aryan Verma Portfolio

> Architecture: **Option B** — discrete per-chapter scenes, seamless-feeling transitions
> via disguised hand-offs (beacon dive, particle follow, portal, elevator).
> Asset pipeline: **Blender-authored + open-source GLB models + Three.js**. In-code
> geometry only for cheap/dynamic things (particles, instanced filler cubes, light rays).

This document is the build checklist. Each scene is self-contained, lazy-loaded, and only
the active scene's heavy geometry is live at once. Scroll is virtualized (Lenis) and drives a
normalized `progress` value `0→1` *within the active chapter section*. Transitions are GSAP
timelines that run a fast camera move + crossfade while the next scene mounts underneath.

---

## Conventions

- **Coordinate system:** Each scene has its own local space, structure centered near origin
  `(0,0,0)`. Camera positions below are approximate world units (tunable in greybox).
- **Camera model:** single `PerspectiveCamera`, fov ~45. We animate `position` and a separate
  `lookAt` target (both as GSAP-tweened objects), never snapping either.
- **Scroll model:** `progress` 0→1 per section. Keyframes are given as `progress` stops.
- **Transition mechanic (the "seam"):** at `progress ≈ 1` of scene N, a transition timeline
  (~1.2–2.5s, `cubic-bezier(.22,1,.36,1)`) takes over: camera accelerates into a "cover"
  (beacon interior / particle stream / portal white-out), opacity crossfades to the next
  scene which has finished mounting, then scroll re-binds to scene N+1 at its `progress 0`.
- **HUD:** separate React/DOM layer, edge-anchored, driven by the same `progress`. HUD never
  lives in 3D. Per-scene HUD states listed below.

---

## INTRO — World Generation

**Type:** Autoplay cinematic timeline (NOT scroll-driven). Gated by asset preload.
Doubles as the loading screen — terminal text covers asset/model fetch time.

**Scene contents**
- Pure black environment, fog `#050816`.
- Terminal text overlay (DOM, JetBrains Mono, cyan) — *not* in 3D.
- One emissive hero voxel (in-code box + bloom) at center.
- Particle system (in-code, GPU points) for chunk-spawn swirl.
- Instanced cube field (in-code `InstancedMesh`) for "chunks generate outward" — cheap,
  thousands of cubes, animated in via scale/position stagger.
- Beacon: vertical light-shaft shader column + emissive base block (Blender GLB for the base,
  in-code shader for the shaft).
- Title text (DOM overlay): `ARYAN VERMA / Engineer • Builder • Creator`.

**Timeline (autoplay, ~6–9s, starts when preload hits 100%)**
| t (s) | Event | Camera pos → lookAt |
|------|-------|---------------------|
| 0.0 | Terminal types: "Generating World…", "Loading Chunks…", "Loading Projects…", "Loading Experience…", "Spawning Player…" | static `(0, 1, 8)` → `(0,0,0)` |
| 2.5 | Single voxel glows in; slow dolly-in | dolly to `(0, 1, 4)` |
| 3.5 | Voxel multiplies; instanced chunks spawn outward; mountains/structures scale up; particles swirl | slow pull-up `(0, 6, 10)` → world |
| 5.5 | Beacon erupts (light shaft fires to sky); title fades in | begin orbit `(0, 8, 12)` |
| 6.0–8.0 | Slow 90–180° orbit around beacon | orbit radius ~14 around `(0,4,0)` |
| 8.0 | Prompt appears: `SCROLL TO ENTER` (mouse hint) | hold orbit |

**Decision flagged:** Intro is timed, not scrolled. First scroll input (or auto after a beat)
triggers the **beacon-dive transition**.

**Transition → Origin (beacon dive)**
- Camera accelerates straight into the beacon shaft; shaft brightness ramps to white-out.
- During white-out (~0.4s peak), Origin scene mount completes; crossfade out of white.
- Camera re-emerges *inside* Origin's floating island. Scroll binds to Origin `progress 0`.

**HUD state:** nav hidden during intro → fades in at white-out. System-status panel
("WORLD GEN 100% / CHUNKS LOADED 100% / READY ✓") visible bottom-left at end of intro,
carries into Origin.

---

## CHAPTER 1 — ORIGIN

**Type:** Scroll-driven, `progress 0→1`.
**Reference:** concept frame "ORIGIN / Every journey begins with a single block."

**Scene contents**
- Floating voxel island in a dark void (Blender GLB — the terraced island w/ grass, stairs,
  scattered crystal blocks). This is the hero asset; author in Blender, export GLB.
- Central glowing **core block** (Blender GLB shell + in-code emissive inner cube + custom
  glow shader). Must be able to "open" — model as separable shell panels OR a shader dissolve.
- Orbiting cube fragments around the core (in-code `InstancedMesh`, animated orbit).
- Holographic memory planes (in-code planes w/ texture: photos/icons/achievements) that
  appear *inside* the core when it opens.
- Escaping particles (in-code GPU points) that travel upward → become the transition.
- Ambient floating islands in far background (low-detail GLB or instanced, parallax only).
- Volumetric fog, bloom, faint vertical light shaft from the core.

**Camera keyframes**
| progress | State | Camera pos → lookAt |
|---------|-------|---------------------|
| 0.00 | Emerge inside island, core ahead | `(6, 3, 9)` → core `(0,2,0)` |
| 0.00–0.45 | Slow circle around the core (¼–½ orbit), island revealed below | orbit radius ~11 around `(0,2,0)`, slight rise |
| 0.45 | Core begins opening; camera eases closer | `(3, 2.5, 5)` → core |
| 0.45–0.75 | Core open: holographic memories visible inside; camera holds, slow push | dolly to `(1.5, 2.2, 3.5)` |
| 0.75–1.00 | Particles escape upward; camera tilts up and follows them into the sky | rise `(0, 9, 4)`, lookAt pans up to `(0, 16, 0)` |

**Interaction:** "CLICK & DRAG TO LOOK AROUND" — small free-orbit offset (clamped ±15°)
layered on top of the scripted camera, returns to rig on release.

**HUD state (Origin)**
- Top nav: `01 ORIGIN` active.
- Left: `CHAPTER 1 OF 5`, title `ORIGIN`, subtitle, body copy.
- Right: `CORE MEMORIES` panel (First Code / First Build / First Dream / + Many More).
- Bottom-left: `SYSTEM STATUS` panel.
- Bottom-right: quote panel ("The best way to predict the future is to build it.")
- Bottom-center: `SCROLL TO EXPLORE` → progress dots.
- Panels fade/slide in per their relevant `progress` window, not all at once.

**Transition → Learning Realm (particles become pathways)**
- The upward-escaping particles stretch into glowing streaks/pathways as camera follows them.
- Streaks resolve into the energy-pathways that thread the Learning Realm mountain.
- Crossfade as Origin unmounts and Learning Realm mounts; camera arrives flying *through*
  the mountain along a pathway at Learning `progress 0`.

---

## CHAPTER 2 — LEARNING REALM

**Type:** Scroll-driven, `progress 0→1`.
**Reference:** concept frame "LEARNING REALM / Every skill is a block. Every block builds mastery."
**Enters from:** Origin's upward particles, now stretched into glowing pathways, threaded into
the mountain — camera arrives flying *through* the mountain along a pathway.

**Scene contents**
- Enormous voxel **mountain** (Blender GLB, deliberately low-detail — it's a flythrough, never
  inspected up close). Hollowed/terraced so pathways can run through and the camera passes inside.
- Glowing **skill pathways** (in-code tube geometry swept along splines + emissive flow shader,
  animated UV scroll for "energy moving"). One spline per skill.
- **Skill nodes** at pathway junctions: small GLB marker blocks + billboarded DOM labels
  (`PYTHON`, `REACT`, `MACHINE LEARNING`, `AI / LLMs`, `BACKEND DEV`, `VIDEO EDITING`). Each
  illuminates as the camera's energy front reaches it.
- Distant **city silhouette** (low-detail GLB, parallax-only) visible through the mountain mouth.
- Volumetric fog, heavy bloom on the cyan pathways.

**Camera keyframes**
| progress | State | Camera pos → lookAt |
|---------|-------|---------------------|
| 0.00 | Inside the mountain, gliding along a glowing pathway | follow-cam behind energy front |
| 0.00–0.40 | Fly through mountain interior; nodes light up one-by-one as we pass | path-follow, lookAt leads the energy |
| 0.40–0.70 | Pull back enough to see the mountain's scale + distant mastery structures | rise, widen to `(0, 12, 24)` |
| 0.70–0.90 | Accelerate along the main energy stream; speed lines, fov widens ~+5 | fast path-follow toward mountain mouth |
| 0.90–1.00 | Mountain opens; futuristic city revealed beyond | burst out, lookAt locks onto city |

**Interaction:** hover a skill node → DOM tooltip expands with detail; free-look ±15°.

**HUD state**
- Top nav: `02 LEARNING` active.
- Left: `CHAPTER 2 OF 5`, title `LEARNING REALM`, body copy, `SKILL NETWORK` list panel.
- Right: `LEARNING PROGRESS` radial (87%) + "Constantly learning" caption.
- Bottom-right: `SCROLL TO ACCELERATE` prompt.

**Transition → Project City (highway of light)**
- The energy stream the camera rides straightens into a glowing **highway of light** leading
  into the metropolis. No white-out needed — it's a continuous fly-in; crossfade swaps the
  mountain scene out for the city scene mid-flight as the highway carries the camera in.

---

## CHAPTER 3 — PROJECT CITY

**Type:** Scroll-driven, `progress 0→1`, **+ click-to-explore interaction.**
**Reference:** concept frames "PROJECT CITY / Where ideas become reality."
**Enters from:** the highway of light, camera flying in above the city.

**Scene contents**
- Voxel **metropolis** built from modular building GLBs (instanced/scattered for the generic
  skyline) + **4 distinct hero project structures** (each its own Blender GLB):
  - **NovaChat** — glowing observatory dome with AI energy core inside.
  - **AI Study Workspace** — giant floating library structure.
  - **Dev Team Simulator** — industrial automation facility (gears/conveyors motif).
  - **Data Dashboard** — cluster of glass towers with animated data-stream shaders.
- **Light-river streets** (in-code emissive splines) connecting structures.
- **Block-assemble reveal:** as the camera nears each hero structure, its top blocks animate
  into place (scripted scale/position stagger on a sub-set of the GLB, or a clipping-plane
  wipe). Holographic project panel (DOM) slides in.
- Sunset sky (HDRI or gradient) for the warm amber accent.

**Camera keyframes**
| progress | State | Camera pos → lookAt |
|---------|-------|---------------------|
| 0.00 | Fly in high over the city on the highway | `(0, 30, 40)` → city center |
| 0.00–0.30 | Descend and glide toward NovaChat; it assembles + panel slides in | sweep to `(−12, 14, 18)` → NovaChat |
| 0.30–0.55 | Glide to AI Study Workspace (floating library) | sweep to `(6, 20, 14)` → library |
| 0.55–0.80 | Glide to Dev Team Simulator | sweep to `(20, 12, 16)` → facility |
| 0.80–0.95 | Drop toward Data Dashboard glass towers | descend to `(14, 8, 12)` → towers |
| 0.95–1.00 | Camera turns toward a glowing street-level **elevator shaft** | move to `(0, 4, 6)` → shaft |

**Interaction:** `CLICK ANY BUILDING TO EXPLORE` — clicking a hero structure opens a full
project detail overlay (DOM) without leaving the scene; closing returns to the scripted camera.
Scroll continues to drive the camera regardless.

**HUD state**
- Top nav: `03 PROJECTS` active.
- Left: `CHAPTER 3 OF 5`, title `PROJECT CITY`, body copy, `PROJECTS OVERVIEW` panel
  (12+ completed, tech icons, impact 1000+).
- Floating per-building panels: NovaChat / AI Study Workspace / Dev Team Simulator /
  Data Dashboard, each with `VIEW PROJECT →`.
- Bottom-center: `CLICK ANY BUILDING TO EXPLORE`.

**Transition → Experience Network (underground elevator)**
- Camera enters the elevator shaft and **descends**; walls blur into a downward motion streak,
  light dims from sunset-amber to deep underground cyan. City scene unmounts during the
  descent blur; Experience Network mounts below. Camera emerges beneath the city.

---

## CHAPTER 4 — EXPERIENCE NETWORK

**Type:** Scroll-driven, `progress 0→1`.
**Reference:** bible "redstone-inspired neural network" beneath the city.
**Enters from:** the descending elevator, camera emerging into a vast underground cavern.

**Scene contents**
- Dark underground **cavern** (low-detail GLB shell / fog box — barely seen, mostly negative space).
- The **neural network**: the centerpiece, almost entirely **in-code** for performance —
  instanced glowing **nodes** + **edges** (line/tube geometry) with an animated **pulse shader**
  sending energy along the connections. Grows denser as the camera descends.
- **Stage clusters** along the way (`LEARNING`, `BUILDING`, `LEADING`, `CREATING`, `ENGINEERING`)
  — each a denser sub-graph that lights up in sequence.
- **Holographic moment panels** (DOM billboards) beside the network: Internships, Leadership
  roles, Achievements, Collaborations.
- **Portal** at the convergence point (Blender GLB frame + swirling portal shader).

**Camera keyframes**
| progress | State | Camera pos → lookAt |
|---------|-------|---------------------|
| 0.00 | Emerge beneath city, sparse network ahead | `(0, 4, 10)` → network |
| 0.00–0.35 | Descend, following an energy pulse deeper; first moment panels appear | drift down `(0, −4, 8)` |
| 0.35–0.65 | Network thickens; stage clusters illuminate one-by-one | continue descent, slow roll |
| 0.65–0.90 | All pathways converge toward a single bright point | converge toward `(0, −16, 4)` |
| 0.90–1.00 | A massive portal opens at the convergence; camera moves into it | push into portal mouth |

**Interaction:** hover a moment panel → expand detail; free-look ±15°.

**HUD state**
- Top nav: `04 EXPERIENCE` active.
- Left: `CHAPTER 4 OF 5`, title `EXPERIENCE NETWORK`, body copy.
- Per-moment panels: Leadership / Internship / Content Creation / Competitions / Open Source /
  Academics / Creative Work (mapped to the constellation frame's panel set).
- Bottom-left: `JOURNEY STATS` panel (Achievements 27, Years 4+, Continuous ∞, Impact 1000+).

**Transition → Achievement Constellation (enter the portal)**
- Camera enters the portal; portal shader ramps to a bright flare/white-out (~0.4s). Under the
  flare the underground scene unmounts and the space scene mounts. Crossfade out of the flare —
  camera now drifting in open space.

---

## CHAPTER 5 — ACHIEVEMENT CONSTELLATION

**Type:** Scroll-driven, `progress 0→1`.
**Reference:** concept frame "ACHIEVEMENT CONSTELLATION / Milestones that shaped the journey."
**Enters from:** the portal flare, camera drifting out into space.

**Scene contents**
- **Starfield** (in-code GPU points, parallax layers).
- **Floating voxel islands** drifting (a few distinct Blender GLB island variants,
  scattered/instanced with slow drift animation).
- **Beacons** shooting into the sky from islands (in-code shader light-shafts) — one per
  achievement, purple-accented per the design system.
- **Constellation lines** that **draw themselves on** connecting beacons into shapes
  (in-code line geometry with animated draw progress).
- **Central hero island** with the **player avatar** GLB (the "you are here" anchor) standing
  and looking out.
- A distant **unfinished constellation** (partial line set) teasing the final chapter.

**Camera keyframes**
| progress | State | Camera pos → lookAt |
|---------|-------|---------------------|
| 0.00 | Exit portal into space; islands drift around | `(0, 2, 12)` → central island |
| 0.00–0.30 | Slow drift; player avatar revealed on hero island; first beacons fire | arc to `(−8, 4, 10)` |
| 0.30–0.65 | Drift gracefully between islands; achievements illuminate one-by-one; lines draw on | weave path, slow |
| 0.65–0.85 | Pull back to show the full constellation scale (user feels small) | rise to `(0, 10, 26)` |
| 0.85–1.00 | A giant **unfinished constellation** appears in the distance; camera approaches it | move toward `(0, 6, −20)` |

**Interaction:** hover a beacon/achievement → detail panel; `VIEW GALLERY`; free-look ±15°.

**HUD state**
- Top nav: `05 ACHIEVEMENTS` active.
- Left: `CHAPTER 4 OF 5`* title `ACHIEVEMENT CONSTELLATION` + subtitle (*frame labels this
  "4 of 5" — reconcile numbering during build; nav is the source of truth at `05`).
- Right: focused achievement panel (e.g. `LEADERSHIP` — Impact & Growth, Key Highlights,
  `VIEW GALLERY`).
- Surrounding panels: Leadership / Internship / Content Creation / Competitions / Open Source /
  Academics / Creative Work.
- Bottom-left: `JOURNEY STATS`.
- Bottom-center: `SCROLL TO EXPLORE CONSTELLATION`.

**Transition → The Future (approach the unfinished structure)**
- The distant unfinished constellation resolves, as the camera nears, into the **unfinished
  megastructure** of the final chapter. Continuous approach (no white-out) — crossfade swaps
  the space scene for the Future scene as the structure fills the frame.

---

## FINAL CHAPTER — THE FUTURE

**Type:** Scroll-driven, `progress 0→1`. Ends the journey (offers replay back to Intro).
**Reference:** concept frame "THE FUTURE AWAITS / Every block placed today builds a world of tomorrow."
**Enters from:** the constellation approach, camera arriving at the unfinished megastructure.

**Scene contents**
- Enormous **unfinished megastructure** (Blender GLB authored as partially-built — exposed
  scaffolding, missing blocks; a "completion" parameter drives which blocks are visible).
- **Construction drones** (in-code instanced, animated on loops) ferrying/placing blocks.
- **Assembling blocks** snapping into place in real time (in-code stagger animation).
- The **full world panorama** revealed on ascent: Skill Mountain, Project City, Experience
  Network, Achievement Islands all visible together — a single composite low-detail GLB / baked
  distant render of all regions (NOT the live high-detail scenes; this is a matte-style reveal).
- **Sunrise** sky (gradient/HDRI) rising over the horizon as camera ascends — the emotional beat.
- The **player avatar** GLB on a foreground ledge (recurring anchor).
- **Voxel planet** (GLB — a sphere built of voxels) for the final pull-back to space.
- Final text + **CTA buttons** (DOM): Explore Projects / GitHub / LinkedIn / Download Resume / Contact.

**Camera keyframes**
| progress | State | Camera pos → lookAt |
|---------|-------|---------------------|
| 0.00 | At the unfinished megastructure; drones working, blocks assembling | `(0, 8, 18)` → structure |
| 0.00–0.30 | Begin ascending; structure towers; `Future Projects 34%` panel | rise to `(0, 24, 16)` |
| 0.30–0.60 | Keep rising; the whole world comes into view below | rise to `(0, 60, 30)`, lookAt tilts down to world |
| 0.60–0.80 | Sunrise breaks over the horizon; slow pull-back; final text fades in | pull back `(0, 80, 60)` |
| 0.80–0.95 | Continue pull-back; world curves into the **voxel planet** in space | pull back `(0, 40, 140)` → planet |
| 0.95–1.00 | Planet small in frame; CTA buttons present; **fade to black** | hold; fade overlay to `#000` |

**Interaction:** CTA buttons clickable from ~`progress 0.6` onward; free-look ±15° until fade.

**HUD state**
- Top nav: `FINAL CHAPTER` active (nav gains a 6th item).
- Left: `FINAL CHAPTER`, title `THE FUTURE AWAITS`, body copy.
- Floating panels: `THE FUTURE` (34% Complete) + region recap cards (Achievement / Learning
  Realm / Project City / Experience Network).
- Right: `SYSTEM STATUS` (World Stability 100% / Memories Loaded 100% / Experiences Synced
  100% / Journey Complete ✓) + `WORLD OVERVIEW` minimap.
- Center: final quote — `"I DON'T BUILD PROJECTS. I BUILD WORLDS. LET'S BUILD THE NEXT ONE TOGETHER."`
- Bottom: CTA button row (Explore Projects / GitHub / LinkedIn / Download Resume / Contact).
- Bottom-left: `SCROLL TO REPLAY JOURNEY` (loops camera back to Intro).

---

## Scene & transition summary

| # | Scene | Type | Transition out | Seam mechanic |
|---|-------|------|----------------|---------------|
| 0 | Intro | autoplay timeline | beacon dive | white-out |
| 1 | Origin | scroll | particles → pathways | crossfade on follow |
| 2 | Learning Realm | scroll | highway of light | continuous fly-in crossfade |
| 3 | Project City | scroll + click | elevator descent | motion-blur crossfade |
| 4 | Experience Network | scroll | enter portal | flare/white-out |
| 5 | Achievement Constellation | scroll | approach structure | continuous crossfade |
| 6 | The Future | scroll | replay → Intro | fade to black |

**Seam rule:** white-out/flare seams (Intro→1, 4→5) hide a full geometry swap; continuous
seams (1→2, 2→3, 5→6) rely on motion + crossfade with brief scene overlap. Project City's
elevator is a motion-blur swap. Only one heavy scene's geometry is ever live; the next mounts
during the seam and the previous unmounts after.

---

## Open items before Phase 0 greybox

1. **Core-open mechanism:** separable Blender shell panels (more control, more modeling) vs.
   shader dissolve (faster, less literal). Recommend shader dissolve for v1.
2. **Memory plane content:** real photos/icons or stylized placeholders for first pass?
3. **Intro length:** 6–9s feels right but depends on real preload time; tune once assets exist.
4. **Free-look clamp:** confirm ±15° feels good or widen.

Next specs to write after sign-off: Learning Realm, Project City, Experience Network,
Achievement Constellation, The Future — each in this same format.
