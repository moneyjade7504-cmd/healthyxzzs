---
name: local-animation
description: Use only Claude Code, local Python/Pillow and FFmpeg to turn user-supplied approved scene images into procedural MP4 animation clips. NO fal.ai, Kling, external generative video model, subscriptions or API calls. Must be honest about limitations for natural human motion from one flat picture.
argument-hint: "[project path] [optional folder containing SC### pictures]"
---

# Claude Code — LOCAL animation V8, no external image-to-video app

Invocation arguments: $ARGUMENTS

The owner explicitly does NOT want any third-party service/app/model to animate pictures. Follow this skill when asked to animate a generated picture directly inside Claude.

1. Confirm exact project path. Read project/motion/scenes.json, narration and scene_map.md; check whether user picture files are visible on the local filesystem. Never invent local paths. Files in chat need to be available locally for processing.
2. Do not use fal.ai, @fal-ai/client, --execute, any image-to-video API or hidden remote generative models. Local Node.js, Python Pillow and FFmpeg are permitted local code dependencies, not external content-creation services.
3. If user supplied finished numbered images, import:
    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images PROJECT --from /path/uploaded_images --batch 1 --max 3 --local
   Or if they already exist at PROJECT/images/:
    node .claude/skills/health-video/scripts/motion_v2.mjs local-init PROJECT --batch 1 --max 3
4. Inspect each actual input picture. Decide for EACH scene which motion can be built with accessible source data. The default micro template region=null is a deliberate review gate. Set region to a visually confirmed torso in normalized [left,top,right,bottom]. Ambient-only scenes use mode=ambient and visible curtain/leaves regions. Never guess unreviewed coordinates.
5. One opaque frame cannot produce correct walking, chair stands, arm rotations or accurate exercise by itself. Micro mode applies subtle feathered pixel-space deformation/breathing. It is a low-motion effect, NOT full body movement. Never label it natural human walking.
6. For articulated motion, use a background-only image plus separate transparent full-canvas sprite files for torso/head/upper arm/forearm/legs as needed. The owner can supply layers, or Claude Code may author them from original layered art if they are actually available. Do not claim to cleanly segment complex flat photos automatically. Author motion/local/SC###.json mode=rig, layers, pivot coordinates and eased keyframes. Check attachment, depth, overlap, balance and foot contact. Do not claim a rigid spinning cutout is natural walking.
7. Render locally:
    node .claude/skills/health-video/scripts/motion_v2.mjs animate-local PROJECT --batch 1 --max 3
   This creates clips/SC###.mp4 only where specs are complete. A missing region/layer triggers NEEDS SETUP. Back up older files before --force.
8. Run QA:
    node .claude/skills/health-video/scripts/motion_v2.mjs qa PROJECT --frames
   Inspect front/middle/end frames plus full playback. Reject face, limbs or background artifacts. Never auto-approve. Preserve fullbleed V6 and Master Style V4.
9. Approve only clips genuinely checked:
    node .claude/skills/health-video/scripts/motion_v2.mjs approve PROJECT SC001 SC002
   Then render with narration:
    node .claude/skills/health-video/scripts/motion_v2.mjs render PROJECT
10. Report imported image count, which scenes generated micro versus rig video, assets still required, QA status and final MP4. If user demands truly realistic human motion from one opaque image, explain the engineering limitation rather than quietly using external apps.

See repository-root LOCAL_ANIMATION_V8_VI.md for precise commands, keyframes, examples and limitations.
