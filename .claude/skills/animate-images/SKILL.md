---
name: animate-images
description: When the owner has finished generating or drawing scene images and sends them to Claude Code, import the supplied pictures into HealthyXZZS and generate real moving-character and living-background MP4 clips using a connected image-to-video backend.
argument-hint: "[project path] [image folder or single image file path]"
---

# Claude Code: turn owner-supplied scene pictures into animated video clips

When the user sends pictures to Claude, they want REAL body and environment motion based on these approved pictures, not just a pan/zoom of a still image. This skill orchestrates image intake, matching, model-based generation, QA, and eventual narrated rendering.

1. Find exact image files that are tool-readable in the Claude Code working environment. If photos only appear in a web chat and have not been saved to a local file or accessible attachment path, do not invent file paths or assert that Claude Code has their bytes. Ask the user to upload files into the project workspace. A group of uploaded pictures can be staged in a temporary folder with verified file paths.

2. Open PROJECT/motion/scenes.json and PROJECT/motion/scene_map.md. Determine the mapping from pictures to SC### scene IDs. Require names such as SC001.png, SC002.jpg and SC003.webp, or process a SINGLE arbitrary named image using --scene SC007. DO NOT assign scenes by guessed image order if the mapping is unclear.

3. Respect the user's approved Master Style, recurring character face, wardrobe, visual reference, fullbleed layout and scene-by-scene narration. Inspect incoming pictures for unwanted baked-in picture-frame borders. A visible frame embedded in a PNG cannot be removed by changing prompts alone.

4. Preflight uploaded images and produce motion prompts with NO paid API call, from the repository root:
    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images PROJECT --from /path/uploaded_images --batch 1 --max 3
   This validates file types/signatures, maps SC IDs, copies approved images to PROJECT/images/, writes a local import report and creates batch_001_live_prompts.md. It prints motion prompts for up to three selected animated scenes. It does NOT generate any video without --execute. The command processes a SINGLE batch with no more than 20 scene images.

   For a single custom-named uploaded picture:
    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images PROJECT --from /path/photo.png --scene SC007 --batch 1 --max 1

5. Review every image against the narration and edit each selected scene's action and environment_motion in scenes.json if the rule-based storyboard is not accurate. A walking clip should actually start from a walkable scene, not a person lying in bed. Only visible scene elements may move. A still environment scene can be opted in with mode=still and animate_environment=true. Keep diagrams as graphics unless the user explicitly requests a motivated animation.

6. Real image-to-video generation requires an available model. When paid API generation is explicitly authorized and FAL_KEY and @fal-ai/client are present, use:
    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images PROJECT --from /path/uploaded_images --batch 1 --max 3 --execute
   This invokes the configured fal.ai image-to-video endpoint with the approved SC### image as its exact first frame, saving MP4 to clips/SC###.mp4. The user need not manually visit an image-to-video website when this provider is configured. Never add --execute on your own merely because the user requests setup; explain the paid service and request appropriate authorization first. No credential, no paid clip.

7. Without a configured model, Claude Code can only prepare image imports and prompts; it cannot conjure realistic person animation from static pixels without a video model. A local ComfyUI/GPU model is a possible separate setup but is not connected by this skill. Do not falsely count FFmpeg zoom/pan, simple slideshows or cutout rotations as human movement.

8. For any generated clips, run:
    node .claude/skills/health-video/scripts/motion_v2.mjs qa PROJECT --frames
   Then visually inspect the first, middle and last keyframes and watch the clips. Reject clips with wrong motion, identity drift, extra digits, twisted joints, background warping, jitter, unwanted frames and style inconsistency. Never auto-approve before watching.

9. Approve only genuinely reviewed SC### clips:
    node .claude/skills/health-video/scripts/motion_v2.mjs approve PROJECT SC001 SC002
   Then create the narrated MP4:
    node .claude/skills/health-video/scripts/motion_v2.mjs render PROJECT

10. Report how many pictures were imported, which exact scene IDs had a truly generated MP4, which scenes require a video backend, whether manual QA was done and where finished files were saved. Never claim completed animated video based on a prompt or a synthetic test.

Guardrails: do not delete input pictures, do not overwrite a scene with a different picture unless explicitly instructed using --replace-images and no outdated clip is present, do not modify more than one 20-scene batch per command, and never activate paid inference by default. Keep all V2–V6 CLI behaviors unchanged.
