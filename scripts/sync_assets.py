import os, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "asset"
dst = ROOT / "frontend" / "public" / "assets"

if not src.exists():
    raise SystemExit("Folder 'asset' tidak ditemukan")

dst.mkdir(parents=True, exist_ok=True)
# copytree-like overwrite
for p in src.rglob("*"):
    if p.is_dir(): continue
    rel = p.relative_to(src)
    out = dst / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(p, out)

print("Assets tersinkron ke", dst)
