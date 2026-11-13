"""Optimize historical deck assets for responsive viewing (one-time build tool).
Inputs: 78 JPG files checked into public/tarot/rws/
Output: 78 WebP assets, 480x800 bound, quality 82.
Original JPEG scans remain in the repository as provenance/fallback.
"""
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parent.parent/"public"/"tarot"/"rws"
images=sorted(ROOT.glob("*.jpg"))
if len(images)!=78:
    raise SystemExit(f"Expected 78 historical JPGs, found {len(images)}")
before=0
after=0
for source in images:
    destination=source.with_suffix(".webp")
    before+=source.stat().st_size
    if destination.exists() and destination.stat().st_mtime>=source.stat().st_mtime:
        after+=destination.stat().st_size
        continue
    with Image.open(source) as img:
        img=img.convert("RGB")
        img.thumbnail((480,800), Image.Resampling.LANCZOS)
        img.save(destination,"WEBP",quality=82,method=6)
        after+=destination.stat().st_size
    if destination.stat().st_size < 3000:
        raise SystemExit(f"Invalid WebP file: {destination}")
print(f"Converted {len(images)} cards: {before/1048576:.1f} MiB JPEG -> {after/1048576:.1f} MiB WebP")
