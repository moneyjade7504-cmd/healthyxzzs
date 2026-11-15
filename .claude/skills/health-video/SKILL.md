---
name: health-video
description: Make health and fitness science explainer videos for YouTube (short exercise explainers or 10–20-minute organ/topic videos, often Spanish scripts for seniors) in the channel's approved format: picture-first, key-phrase captions only, a paced hook, never a slide-deck look. Code-rendered infographics (titles, organ maps, mechanism diagrams, charts, count-ups, check/X and stamp verdicts, warnings, CTAs, quiz, on-screen sources) plus real drawings the user generates in free apps (exercise pose sheets shown as step sequences, organ/food item sheets, 2x2 scene panels shown as push-in stills). No puppet animation, no code-drawn people, no paid tools. Workflow: script → research and fact-check → asset order (sheets + voice spec) → the user sends sheets and a voice-over → cut assets, transcribe, map cues to words, build sections, render in parallel, QA → deliver the MP4 (split into parts under 30 MB). Use for any health/fitness video script, topic, asset sheet, voice-over or render request on this channel.
---

## LOCAL Claude Animation V8 — OVERRIDES paid cloud model advice on owner's new request

The owner now explicitly says: "I want Claude to animate my generated pictures itself, without ANY external app or paid image-to-video service." Treat this as a hard production constraint for new local-animation workflows.

- Use the Claude Code skill at .claude/skills/local-animation/SKILL.md (slash command /local-animation).
- From repo root, to import user pictures and prepare/run offline motion:
  node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images PROJECT --from UPLOADED_IMAGES_DIR --batch 1 --max 3 --local
- Already imported pictures:
  node .claude/skills/health-video/scripts/motion_v2.mjs local-init PROJECT --batch 1 --max 3
  node .claude/skills/health-video/scripts/motion_v2.mjs animate-local PROJECT --batch 1 --max 3
- Python 3 + Pillow and FFmpeg run entirely locally; no FAL_KEY, no external generative model API, no automatic payment or upload. These local software dependencies are different from a third-party image-to-video app.
- The local script supports mode=micro (single opaque picture: only subtle, feathered breathing deformation), mode=ambient (selected local natural background movement), and mode=rig (supplied transparent full-canvas layers + explicitly authored joint pivots/keyframes).
- **Never promise realistic walking, full-body action, accurate exercise mechanics or scene completion from ONE opaque image alone.** A user-supplied flat PNG does not encode joints, occluded body surfaces or muscle movement. For true 2D articulated character movements, provide isolated layers and rig keyframes or enough separate pose art; transparent cutout animation can still look rigid, and must be visually QA'd.
- local-init leaves region=null until Claude Code actually inspects a photo, chooses the character torso bounding box, and edits the JSON. Without a reviewed region/layer, animate-local will say NEEDS SETUP rather than synthesize a fake human action.
- Keep approved fullbleed V6 / Master Style V4 / scene diversity V3 / one 20-scene batch V2 behavior. Never silently substitute paid fal.ai, even though V7's older commands still exist as optional legacy.
- Output MP4s via code are marked local_mode=micro/ambient/rig in progress, NOT automatically approved. Run qa --frames, watch the clips and require explicit approval before final render.
- Read LOCAL_ANIMATION_V8_VI.md for the exact configuration formats and limitations.

## Images-to-Video V7 — the owner sends finished images to Claude

When the owner has already created scene illustrations and uploads them to Claude, **DO NOT create another image-order or assume the goal is only still pictures**. Use the installed project skill at .claude/skills/animate-images/SKILL.md (invocable in Claude Code as /animate-images) to import exactly those images as first frames and prepare/create actual animated scene MP4s.

- From repository root: node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images PROJECT --from /path/uploaded_images --batch 1 --max 3
- A single arbitrary filename: add --scene SC007. For folders require SC### filenames or user-verified mapping; never guess order based solely on file appearance.
- The CLI copies validated PNG/JPG/WEBP to PROJECT/images/, updates scenes.json, writes motion/imports/batch_001.json, refreshes first-frame and motion prompts, and safely selects only imported scene IDs for image-to-video.
- **If the owner wants people in all supplied illustrations to MOVE**, inspect each image alongside the scene narration and explicitly choose mode=character for scenes depicting a moving person; do not blindly keep the heuristically assigned still/graphic mode. Reserve mode=still + animate_environment=true for environmental motion without an acting person. A true medical diagram can remain graphic.
- Claude Code can coordinate this workflow, **but a video model generates the actual human/body motion**. Without a configured backend, import and prompt preview work, but no actual MP4 exists. With an explicitly approved paid model setup, installed @fal-ai/client, FAL_KEY and --execute, the current Wan image-to-video endpoint generates real MP4s into PROJECT/clips/SC###.mp4.
- Never use the paid API by default or claim that Claude itself has image-to-video inference built in. An alternative local GPU model requires a separately set up backend; this particular command currently uses fal.ai for --execute.
- For visually complex requests, avoid inventing prompts based on filenames; check the image's depicted pose, equipment, character and scene first, then correct actions/environment_motion to match user intent before any charged generation.
- Keep custom Master Style V4, Living Scenes V5, fullbleed V6 and one batch at a time. The source images stay unmodified; replaced scene photos require explicit --replace-images and may not silently reuse old video.
- Finish with qa --frames, inspect actual clips, approve only after manual QA, render with narration. Never pretend an image zoom is meaningful movement.

## Full-bleed V6 — PRIMARY output layout rule: NO decorative outer frame

The owner has explicitly rejected the picture-frame border and rounded/inset card look in videos. **Fullbleed is now the DEFAULT for new and newly generated scenes**, even with V1/V2 presets or a user-defined Master Style. This newer rule supersedes the V1/V2 frame requirement anywhere in older documents.

- Use \`node scripts/motion_v2.mjs frame-mode PROJECT --mode fullbleed\` (when running within the skill folder) or the same command from repo root with full script path, to set \`motion/scenes.json.frame_mode\`.
- Output: true edge-to-edge 16:9 composition; the character, surroundings and scenery fill the entire canvas. No blue picture outline, no rounded corners, no decorative frame, no white inset margin and no boxed panel.
- \`init\` defaults to \`frame_mode: fullbleed\`. \`batch\`, \`animate\`, and \`animate-live\` consistently pass it to still, motion and living scene prompts. This frame layout overrides old decoration words inside a custom master, but does NOT override its art medium, character identity or palette.
- Alternate \`framed\` or \`soft-frame\` options are only for a deliberate user request.
- The new frame-mode CLI changes **plans and future prompts**, never retroactively edits already generated SC### PNG or MP4. You must regenerate any older image/video with a baked-in border and review it. Switches clear past motion approvals to guard against silently reusing old framed video.
- Keep existing Master Style V4, Scene Director V3, Living Scenes V5 and 20-image batch pause behavior. This change concerns **layout**, not stylistic consistency or actual movement quality.

## Living Scenes V5 — actual character motion AND subtle environmental motion

The owner has now requested to add a code command so that **both recurring characters and their environments can move naturally** rather than remaining in a static frame. Implement this with the new `animate-live` command, which overrides the older static-background advice for V5 clips without disabling the existing `animate` workflow.

- Run `node scripts/motion_v2.mjs animate-live PROJECT --batch 1 --max 1` (from the skill folder) to PREVIEW motion prompts. With no `--execute` there is no paid API or video generation.
- A chosen batch's `motion/batches/batch_001_live_prompts.md` includes scene-by-scene instructions for character action **and** existing environment secondary motion.
- For an ordinary scene `mode: "character"`, define `action` in `motion/scenes.json` describing a single physically coherent movement. Use `environment_motion` to control visible curtains/leaves/cloth/shadows, never introduce unseen objects.
- For an environment-only living shot, set `mode: "still", "animate_environment": true` with a specific `environment_motion`; the resulting video is a real animated B-roll scene. Unflagged stills remain ordinary stills; `graphic` is unchanged.
- Optional `motion_intensity` accepts `subtle` (default) or `balanced`; minimize overstated wind, camera motion, perspective drift, AI limb-morphing and flicker. Fixed camera inside each clip, diverse angles BETWEEN clips.
- `scripts/living_scene.mjs` infers optional surroundings from locations, but **explicit scene motion wins**. Only elements present in the approved first frame may move. Keep the approved user Master Style and character identity from V4.
- For actual clip generation use the chosen external image-to-video tool and save `SC###.mp4`, or ONLY with explicit consent and configuration, `FAL_KEY` plus `--execute` for the pre-existing optional API; max defaults to 1 clip. Never charge/trigger API by default.
- `qa --frames` must inspect image/video assets, but human review of movement, limbs, face, props and surroundings remains mandatory; `approve` also supports environment-only motion B-roll. Final `render` requires missing flagged motion clips unless `--draft --allow-stills` is used.
- This does NOT mean Python/FFmpeg can automatically turn static figures into anatomically correct human animations. Actual body/environment motions are produced by a video model or supplied clip.
- Do not delete/replace original project artifacts or break V2, V3, V4 legacy commands.

## Universal Master Style V4 — priority over V1/V2 and old 2D-only rules

The owner wants **ANY custom user-selected Master Style**, not just V1/V2/LEGACY. For each new video, first check whether the user supplied an image master, a JSON master style, or both.

- Default presets V1/V2/LEGACY still work **only when no custom master is supplied**.
- With a user master, use `motion_v2.mjs init PROJECT --srt ... --voice ... --master-image /path/style.png`, or `--master /path/style.json`, optionally `--character-image /path/character.png`. Read `MOTION_V2_VI.md` and template `styles/master_style.template.json` first.
- `scripts/master_style.mjs` stores custom master style descriptors and copies approved visual references into `PROJECT/motion/master/`; `scripts/motion_style.mjs` accepts a custom style object for scene images and motion.
- The style may use crayon, watercolor, scrapbook, doodle, flat vector, stop motion, 3D stylized, realistic photography, or any other coherent aesthetic. **Do NOT add 2D-only, pastel-only, white-border-only or anti-3D constraints to a custom master**. If the master is V1/V2, retain its contrast, palette and drawing identity, but do not add a picture frame unless the user explicitly requests framed mode.
- Keep the same chosen art medium and character identity across shots. Scene Director V3 varies setting, shot, action and lighting, NOT the identity or master style. Both older adults and user-supplied mascots are supported.
- Every 20-image agent batch must explicitly mention the master reference files and require the image generation app to ATTACH them. A filename in a text prompt is NOT the actual image. The CLI cannot infer detailed style properties from unseen pixels, and does not automatically generate images from reference pictures.
- If a master has no character identity reference, approve an initial character design before subsequent scenes and reuse it consistently.
- The model producing MP4 video uses the approved SC### image as the first frame; custom master reference images are not automatically passed as additional model inputs unless that specific provider supports them.
- Honor user's rights to the references and protect private pictures in a publicly visible repository. Avoid uploading secrets, private photographs or copyrighted artwork without permission.
- For medical teaching, validate human anatomy, exercises and claims even when a master uses a stylized or fantastical aesthetic.
- All previous safety gates remain: one batch per execution, review/approval, no paid API unless explicitly enabled, no pretending that still image zooms are actual character motion.

## Scene Variety Director V3 — natural scenes, not an idle talking-head loop

The owner explicitly requests **varied environments and visual storytelling** with the same recurring character, instead of an older adult always standing in one static room. This is the DEFAULT for new videos.

- `scripts/scene_director.mjs` uses the Spanish SRT to construct an initial editable scene story arc. Every scene receives a **narrative kind, setting, framing, camera view, props, lighting, mood, wardrobe constraints, style treatment, and distinct physical action** for moving character scenes.
- After `motion_v2.mjs init`, open `motion/scene_map.md` and `motion/scenes.json`. These are rule-based suggestions, so rewrite any medically inappropriate setting/action manually.
- Maintain one chosen master aesthetic per channel/video: V1/V2/LEGACY or the user's custom Master Style. Visual diversity means different scenes, framing and infographic compositions, NEVER an unrequested style or identity switch.
- Prefer a balanced rhythm of wide / medium / over-shoulder / close-up / full-body / flat-lay images. Environments can move between living room, outdoor walking path, exercise corner, kitchen, bedroom and clinic where the script warrants it.
- Keep character identity consistent: face, hairstyle, age and body proportions must match the master reference. Use appropriate wardrobe changes only when actually necessary.
- Every character scene must have one contextually meaningful action (walking, sitting, cooking, reaching, exercising safely). Avoid repeating the default standing/pointing/talking pose.
- In the 20-image batch, prompts must be varied by shot, setting, and treatment; the agent still generates **one batch only and stops for approval**.
- Use `motion_v2.mjs map PROJECT` to refresh the scene map after manual scene edits. `qa` reports repeated three-scene location+framing combinations and diversity statistics.
- Different scenes may use different first-frame camera angles, but each short motion clip should keep its own camera stable to reduce image-to-video hallucination.

## Motion V2: nâng cấp theo yêu cầu mới — nhân vật được CHUYỂN ĐỘNG THẬT

The channel owner has requested *actual smooth, attractive, animated recurring characters*, in the user-selected Master Style (which may or may not be 2D).
This section overrides the older "no animated characters" restriction when using the Motion V2 workflow.
Keep the original HTML infographic workflow working; never run rejected puppet/body-part rotations or image morphing.

- Read repository-root MOTION_V2_VI.md for complete Vietnamese setup and commands.
- Use scripts/motion_style.mjs to produce matching visual DNA from V1/V2 presets OR a custom user-supplied Master Style and first-frame motion prompts.
- Use scripts/motion_v2.mjs to turn SRT plus narration into scene plan (3–6 s where feasible).
- Generate one batch of at most 20 scene images, name them SC###.png, move to Collection/folder, then STOP for OK.
- Create an actual MP4 image-to-video clip SC###.mp4 for each scene marked mode=character. Never claim Ken Burns, still-image zoom, crossfade, puppet or flipbook is real human body movement.
- Prefer user's own free external image/video tools. Optional fal.ai Wan API requires explicit FAL_KEY and --execute (paid, opt-in only).
- Use QA still frames at beginning, middle and end for every moving scene. Look for facial drift, unnatural joint movement, extra limbs, fused hands, footwear/clothes changes, instability, flicker and border drift. Only approve after visually checking.
- Final render must use only motion clips marked approved for full output, while --draft --allow-stills remains a clearly labeled fallback.
- Narration is added once; never include AI clip audio when joining.
- Older renderer + old section projects remain untouched and usable.
- Existing medically grounded exercise cards and character QA still apply.

# Health explainer video creator

You make research-backed health and fitness explainer videos for this channel. They are **YouTube
videos, not slide decks**: picture first, short key-phrase captions, a fast but calm hook. Read
`references/youtube-style.md` and `references/production-format.md` first: it is the format the owner approved, the list of what they
rejected, and the scene recipes. The approved reference video is `projects/sample_flat/`
(`scene.html` → `out/sample_flat.mp4`).

## Working with this user
- **Chat in Vietnamese.** The user writes in Vietnamese; reply in Vietnamese.
- **Scripts may arrive in Spanish.** On-screen text follows the script language. Transcribe Spanish
  voice-overs with `--lang spanish`. Write fact-check notes in Vietnamese, with corrected lines given in
  the script language plus a Vietnamese meaning.
- **Image prompts in English,** since image apps follow English best, with a one-line Vietnamese
  explanation of each.
- **Zero cost.** The user does not pay for APIs. You cannot generate images or video here; the user
  generates pose sheets in free apps (Gemini, ChatGPT). Never propose paid tools as the default.
- **Never reuse clips from `reference/` demos** as if they were new work.
- **Research before showing any movement or claim.** Never invent angles, numbers or study details.
- **Faceless channel: the narrator never claims to be a doctor.** Scripts written for an on-camera
  clinician ("Soy endocrinóloga…", "mis pacientes…", host stories) get a narrator version (`script.md`)
  that removes the credential and invented personal stories. Use the original only if a real clinician
  signs it. Fictional patients (e.g. Doña Carmen) are fine when labelled "Dramatización" on screen.
- **No logos** of organisations or brands, and never AI-drawn ones; cite sources as text.

## Workflow per video
1. **Intake:** save the script (any language, .docx is fine: unzip `word/document.xml`) and source log to
   `projects/<slug>/`.
2. **Research and fact-check:** check every claim against the sources and flag overstated or unsupported
   ones (`references/niche-playbook.md`). For every exercise, open or write its card in
   `references/motion-research.md` and its drawing spec in `references/anatomy-motion.md`, using web
   search for studies and citing them.
3. **Scene plan:** split the script into ~2–4 s beats and pick a scene type for each from
   `production-format.md`: infographic, diagram, chart, exercise step sequence or takeaway. Follow
   `youtube-style.md`: give every beat a picture, cap text at the key phrases (≤ 6 words, ≤ 2 captions on
   screen), keep the hook at a cut every 1.5–2.5 s, and budget ~1 drawing per 15–20 s of voice.
4. **Order assets** (`references/asset-order.md`): sheets, not single images. A pose sheet per exercise
   (3–4 poses in a row, template `characters/senior_m/situp_pose_sheet.md`); for topic videos an organ or
   food item sheet and 2×2 scene panels with the character; plus the voice spec. Write `order.md`.
5. **Check delivered sheets** (anatomy, character consistency, clocks/times, no baked-in text) and ask
   for regenerations with exact fixes.
6. **Cut poses:** `python3 scripts/cut_poses.py sheet.webp projects/<slug>/poses --name <exercise> --count N`.
   This writes aligned transparent PNGs in the house blue, plus `<name>_poses.json`.
   Other sheets: `python3 scripts/cut_items.py sheet.webp projects/<slug>/cut --names a,b,c` cuts separate
   items (organs, foods; reading order; `--close 3` if two items touch), and `--grid 2x2 --names …`
   splits a panel sheet into scene stills. Check the cut-outs on a dark contact sheet.
7. **Build scenes:** short video → one `scene.html` from `projects/sample_flat/scene.html`. Long topic
   video → one HTML per section plus `common.js`, starting from `projects/7dias_sin_cenar/` (recipes in
   `production-format.md`). Helpers: `flat/lib.js` and `flat/kit.js`.
8. **Time to the voice:** `node scripts/transcribe.mjs voice.wav transcript --lang spanish|english`.
   The script stays the truth for the words; the transcript only gives timestamps. Every beat lands
   0.1–0.3 s before its keyword. Write `cues.txt` (`label | phrase from the script`, in order) and run
   `node scripts/cues.mjs transcript/words.json cues.txt cues.js`; the scene reads `CUE.label`, so a new
   voice take only needs the cues re-run, not new times.
9. **Render and QA** (`references/qa-checklist.md`): run `node flat/render.mjs scene.html x --frames t1,t2,… --png out/f` and look at
   the frames. Fix placement, spelling and timing. Then run
   `node flat/render.mjs scene.html out/final.mp4 --audio voice.wav`.
   Long videos (10+ min): one HTML per script section, each setting `window.START`/`window.END` on the
   shared voice timeline, then `node scripts/render_sections.mjs projects/<slug> voice.mp3 out/final.mp4
   intro.html punto1.html … --jobs 3` (parallel, frame-snapped joins, voice added once; ~3× real time
   per job). Shared pieces for a video go in its `common.js` (see `projects/7dias_sin_cenar/`).
10. **Deliver** the MP4 with a short Vietnamese summary of what's in it and any changes made to on-screen
    facts. Files over 30 MB can't be uploaded to the app: split without re-encoding into ~280 s parts
    (command in `qa-checklist.md`) and send them in order. Never commit full renders (GitHub's 100 MB limit);
    commit the scenes, cues and assets so the video can be re-rendered.

Setup once per machine: `bash scripts/setup.sh`. It installs Whisper (offline), the flat renderer
dependencies (playwright-core) and the motion QA tools.

## Files
- `references/youtube-style.md`: picture-first rules, text budget, pacing and hook recipe. **Read first.**
- `references/production-format.md`: the approved format, the rejections and the scene recipes.
- `references/motion-research.md`, `references/anatomy-motion.md`: exercise research and drawing specs.
- `references/niche-playbook.md`: script structure, retention and health-claim rules.
- `references/style-bible.md`: palette (cream `#F5ECD7`, skin `#58A9E4`, red `#E23B2E`, orange
  `#F95C00`, amber `#F7AD36`, ink `#1B1A22`) and typography (Inter Black/ExtraBold).
- `references/history.md`: what was tried in this project and why it was dropped. Read it before
  proposing a "new" approach.
- `references/asset-order.md`: sheet types, prompt templates, voice spec, delivery checks.
- `references/qa-checklist.md`: build/QA gotchas (overflow, z-order, cues) and delivery limits.
- `references/legacy-skill-notes.md`: the earlier skill version (AI video, puppets), kept for reference only.
- `flat/`: `render.mjs` (HTML → MP4, deterministic), `lib.js` (helpers), `kit.js` (Still with push-in,
  Tile, Cutout, Stamp, Clock, DayCounter, icons, sceneVis, and the YouTube helpers Caption, cutVis,
  punch, slideIn, float). Organ/topic video reference:
  `projects/7dias_sin_cenar/intro.html`. `figure.js`, `pictogram.js` and
  `sheetfigure.js` are rejected experiments; don't use them for videos.
- `scripts/`: `cut_poses.py`, `cut_items.py`, `transcribe.mjs`, `cues.mjs`, `qa_pages.mjs` (contact sheet per section), `render_sections.mjs`, `setup.sh`, plus the legacy tools `render.py`,
  `puppet.py`, `motion.py` and `qa_motion.py`.
- `characters/`: the user's character sheets. `projects/`: one folder per video.
