#!/usr/bin/env python3
"""HealthyXZZS V8: code-only local animation. No external video-model services.

Requires local Python 3 + Pillow and FFmpeg (installed software libraries, NOT
external AI apps). Image-only 'micro' is gentle REGION deformation, NOT a real
full-body walk. For articulated human movement use the 'rig' mode with
separate transparent sprites and carefully authored joint keyframes.

All output is a local 16:9 H264 MP4. The first scene image remains untouched.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import pathlib
import subprocess
import sys
from typing import Any

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError as exc:
    raise SystemExit("Pillow is required locally: python3 -m pip install Pillow (no cloud or AI API)") from exc


def safe_path(base: pathlib.Path, relative: str) -> pathlib.Path:
    if not isinstance(relative, str) or not relative:
        raise ValueError("Asset path missing")
    target = (base / relative).resolve()
    if not target.is_relative_to(base.resolve()):
        raise ValueError("Asset path must stay inside the video project: " + relative)
    if not target.is_file():
        raise FileNotFoundError("Missing local asset: " + str(target))
    if target.stat().st_size > 40_000_000:
        raise ValueError("Asset exceeds 40 MB: " + str(target))
    return target


def extent(name: str, values: Any, length: int, lower: float, upper: float) -> list[float]:
    if not isinstance(values, list) or len(values) != length:
        raise ValueError(name + " must be an array of exactly " + str(length) + " numbers")
    try:
        v = [float(x) for x in values]
    except (TypeError, ValueError) as exc:
        raise ValueError(name + " contains nonnumeric values") from exc
    if any(not math.isfinite(x) or x < lower or x > upper for x in v):
        raise ValueError(name + " values must be in [" + str(lower) + ", " + str(upper) + "]")
    return v


def rgb_frame(file: pathlib.Path, width: int, height: int) -> Image.Image:
    with Image.open(file) as opened:
        if opened.width > 8192 or opened.height > 8192:
            raise ValueError("Image dimensions are too large")
        im = opened.convert("RGBA")
    # Intentional center crop: never introduce any decorative frame or letterboxing.
    factor = max(width / im.width, height / im.height)
    scaled = im.resize((math.ceil(im.width * factor), math.ceil(im.height * factor)), Image.Resampling.LANCZOS)
    left = (scaled.width - width) // 2
    top = (scaled.height - height) // 2
    return scaled.crop((left, top, left + width, top + height))


def pixel_box(region: Any, w: int, h: int, name: str) -> tuple[int, int, int, int]:
    v = extent(name, region, 4, 0.0, 1.0)
    x0, y0, x1, y1 = (round(v[0] * w), round(v[1] * h), round(v[2] * w), round(v[3] * h))
    if x1 - x0 < 12 or y1 - y0 < 12:
        raise ValueError(name + " is empty or too small (use normalized [left,top,right,bottom])")
    if x1 <= x0 or y1 <= y0:
        raise ValueError(name + " has reversed coordinates")
    return x0, y0, x1, y1


def organic_region(base: Image.Image, box: tuple[int, int, int, int], time_s: float,
                   rate: float, strength: float, kind: str) -> Image.Image:
    """Small feathered image-space deformation; does NOT articulate joints."""
    w, h = base.size
    x0, y0, x1, y1 = box
    patch = base.crop(box)
    phase = math.sin(2 * math.pi * rate * time_s)
    pw, ph = patch.size
    # Local size deformation creates breathing / fabric / leaves ambience. Feather
    # mask avoids hard box seams, but movement still remains only an approximation.
    if kind == "breathe":
        sw = max(1, round(pw * (1.0 + strength * 0.6 * phase)))
        sh = max(1, round(ph * (1.0 + strength * phase)))
        dx, dy = 0, round(-strength * ph * 0.2 * phase)
    else:
        sw, sh = pw, ph
        dx = round(pw * strength * phase)
        dy = round(ph * strength * 0.25 * math.cos(2 * math.pi * rate * time_s))
    resized = patch.resize((sw, sh), Image.Resampling.BICUBIC)
    new_x = round(x0 + (pw - sw) / 2) + dx
    new_y = round(y0 + (ph - sh) / 2) + dy
    transformed = base.copy()
    transformed.paste(resized, (new_x, new_y))
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    pad = min(pw, ph) * 0.12
    if pw > 2 * pad + 1 and ph > 2 * pad + 1:
        draw.ellipse((x0 + pad, y0 + pad, x1 - pad, y1 - pad), fill=255)
    else:
        draw.rectangle(box, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=max(3, round(min(pw, ph) * 0.09))))
    return Image.composite(transformed, base, mask)


def micro_frame(source: Image.Image, cfg: dict, t: float) -> Image.Image:
    w, h = source.size
    frame = source.copy()
    if cfg["mode"] == "micro":
        if cfg.get("region") is None:
            raise ValueError("micro requires a reviewed region=[left,top,right,bottom]; Claude must inspect the figure")
        box = pixel_box(cfg["region"], w, h, "micro.region")
        amp = float(cfg.get("breath_strength", 0.012))
        if not 0.001 <= amp <= 0.025:
            raise ValueError("breath_strength must be 0.001..0.025 (subtle, not rubbery)")
        frame = organic_region(frame, box, t, 0.27, amp, "breathe")
    effects = cfg.get("ambient_regions", [])
    if not isinstance(effects, list) or len(effects) > 8:
        raise ValueError("ambient_regions must be an array of up to 8 regions")
    if cfg["mode"] == "ambient" and not effects:
        raise ValueError("ambient mode requires at least one VISUALLY confirmed ambient_regions entry")
    for i, effect in enumerate(effects):
        if not isinstance(effect, dict):
            raise ValueError("ambient_regions entries must be objects")
        box = pixel_box(effect.get("box"), w, h, "ambient_regions[" + str(i) + "].box")
        strength = float(effect.get("strength", 0.01))
        hz = float(effect.get("hz", 0.25))
        if not (0.001 <= strength <= 0.035 and 0.05 <= hz <= 1.0):
            raise ValueError("ambient strength must be 0.001..0.035 and hz 0.05..1.0")
        frame = organic_region(frame, box, t, hz, strength, "sway")
    return frame.convert("RGB")


def smooth(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return x * x * (3.0 - 2.0 * x)


def keyframe_value(keys: list, position: float, prop: str, default: float) -> float:
    if not keys:
        return default
    if position <= keys[0]["t"]:
        return float(keys[0].get(prop, default))
    for a, b in zip(keys, keys[1:]):
        if position <= b["t"]:
            f = smooth((position - a["t"]) / (b["t"] - a["t"]))
            return float(a.get(prop, default)) * (1 - f) + float(b.get(prop, default)) * f
    return float(keys[-1].get(prop, default))


def load_rig_layers(base: pathlib.Path, cfg: dict, w: int, h: int) -> list[dict]:
    layers = cfg.get("layers")
    if not isinstance(layers, list) or not layers or len(layers) > 24:
        raise ValueError("rig requires 1..24 separate TRANSPARENT layer images")
    out = []
    for index, raw in enumerate(layers):
        if not isinstance(raw, dict):
            raise ValueError("rig layer must be an object")
        file = safe_path(base, raw.get("image"))
        sprite = rgb_frame(file, w, h)
        alpha = sprite.getchannel("A")
        extremes = alpha.getextrema()
        if extremes[0] == 255 or extremes[1] == 0:
            raise ValueError("rig sprite must have nonempty transparent pixels: " + str(file))
        pivot = extent("layers.pivot", raw.get("pivot"), 2, 0.0, 1.0)
        keys = raw.get("keyframes")
        if not isinstance(keys, list) or len(keys) < 2 or len(keys) > 40:
            raise ValueError("rig layer requires 2..40 keyframes with normalized t in [0,1]")
        last = -1.0
        for key in keys:
            if not isinstance(key, dict) or not isinstance(key.get("t"), (int, float)):
                raise ValueError("rig keyframe needs numeric t")
            t = float(key["t"])
            if not 0 <= t <= 1 or t <= last:
                raise ValueError("rig keyframe t must strictly increase from 0 to 1")
            last = t
            for prop, limit in (("rotate", 40), ("dx", 120), ("dy", 120)):
                if prop in key and (not math.isfinite(float(key[prop])) or abs(float(key[prop])) > limit):
                    raise ValueError(prop + " exceeds safe local motion limit")
        out.append({"image": sprite, "pivot": (pivot[0] * w, pivot[1] * h), "keys": keys})
    return out


def rig_frame(background: Image.Image, layers: list[dict], time_s: float, duration: float) -> Image.Image:
    frame = background.copy()
    fraction = max(0, min(1, time_s / duration))
    for spec in layers:
        keys = spec["keys"]
        theta = keyframe_value(keys, fraction, "rotate", 0.0)
        dx = round(keyframe_value(keys, fraction, "dx", 0))
        dy = round(keyframe_value(keys, fraction, "dy", 0))
        layer = spec["image"].rotate(theta, center=spec["pivot"], resample=Image.Resampling.BICUBIC)
        shifted = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        shifted.paste(layer, (dx, dy))
        frame = Image.alpha_composite(frame, shifted)
    return frame.convert("RGB")


def render(args: argparse.Namespace) -> dict:
    root = pathlib.Path(args.project).resolve()
    if not root.is_dir():
        raise FileNotFoundError("Project folder not found")
    spec_path = safe_path(root, args.spec)
    cfg = json.loads(spec_path.read_text(encoding="utf8"))
    if not isinstance(cfg, dict) or cfg.get("mode") not in ("micro", "ambient", "rig"):
        raise ValueError("local spec mode must be micro | ambient | rig")
    if not (1.0 <= args.duration <= 30.0):
        raise ValueError("Local clip duration must be 1..30 seconds")
    if not (12 <= args.fps <= 30):
        raise ValueError("fps must be 12..30")
    width, height = args.width, args.height
    if width < 720 or height < 400 or width % 2 or height % 2 or abs(width / height - 16 / 9) > 0.1:
        raise ValueError("Use even output dimensions with a 16:9 aspect ratio, at least 720 x 400")
    if cfg["mode"] == "rig":
        background = rgb_frame(safe_path(root, cfg.get("background")), width, height)
        layers = load_rig_layers(root, cfg, width, height)
    else:
        source = rgb_frame(safe_path(root, args.image), width, height)
        # Validate now, before starting FFmpeg and writing any MP4.
        micro_frame(source, cfg, 0)
    target = pathlib.Path(args.output).resolve()
    if not target.is_relative_to(root):
        raise ValueError("Output video must stay within project folder")
    if target.exists() and not args.force:
        raise FileExistsError("Video already exists; review/remove it, or use --force for explicit regeneration")
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.stem + ".partial.mp4")
    frames = math.ceil(args.duration * args.fps)
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}",
        "-r", str(args.fps), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(temporary),
    ]
    process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        assert process.stdin is not None
        for i in range(frames):
            t = i / args.fps
            image = rig_frame(background, layers, t, args.duration) if cfg["mode"] == "rig" else micro_frame(source, cfg, t)
            process.stdin.write(image.tobytes())
        process.stdin.close()
        assert process.stderr is not None
        errors = process.stderr.read().decode("utf8", errors="replace")
        rc = process.wait()
        if rc != 0:
            raise RuntimeError("FFmpeg failed: " + errors[-2000:])
        os.replace(temporary, target)
        return {
            "mode": cfg["mode"],
            "output": str(target),
            "frames": frames, "fps": args.fps, "duration": round(frames / args.fps, 3),
            "claim": ("Layered code-driven movement; manually inspect joint mechanics" if cfg["mode"] == "rig"
                      else "Local micro-motion approximation, NOT full-body natural action"),
            "external_ai_api": False,
        }
    except Exception:
        if process.poll() is None:
            process.kill()
        process.wait()
        if temporary.exists():
            temporary.unlink()
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Local procedural animation from scene image and optional separated sprites")
    parser.add_argument("--project", required=True)
    parser.add_argument("--spec", required=True, help="Relative project path: motion/local/SC001.json")
    parser.add_argument("--image", required=True, help="Relative project path: images/SC001.png")
    parser.add_argument("--output", required=True, help="Output path inside project: clips/SC001.mp4")
    parser.add_argument("--duration", type=float, required=True)
    parser.add_argument("--fps", type=int, default=24)
    parser.add_argument("--width", type=int, default=960)
    parser.add_argument("--height", type=int, default=540)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    print(json.dumps(render(args), ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("LOCAL ANIMATION ERROR: " + str(exc), file=sys.stderr)
        raise SystemExit(1)
