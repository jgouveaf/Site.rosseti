from pathlib import Path
import os
import json
import shutil
import numpy as np
from PIL import Image, ImageOps, ImageFilter

root = Path(r"D:/Site.rosseti")
photos_dir = root / "photos-extracted"
assets = root / "public/media"
assets_photos = assets / "photos"
assets_photos.mkdir(parents=True, exist_ok=True)
(assets / "video").mkdir(parents=True, exist_ok=True)

# Copy video if not present
video_src = photos_dir / "VID_20260926_133222428~3.mp4"
video_dst = assets / "video/fecart.mp4"
if video_src.exists() and (not video_dst.exists() or video_dst.stat().st_size == 0):
    shutil.copy2(video_src, video_dst)
    print("Copied video to fecart.mp4")

def apply_cinematic_grade(im, is_mono=False, crop_aspect=None):
    im = ImageOps.exif_transpose(im).convert('RGB')
    
    # Optional cinematic crop (e.g. 16:9 or 2.39:1 anamorphic)
    if crop_aspect:
        curr_aspect = im.width / im.height
        if curr_aspect > crop_aspect:
            new_w = int(im.height * crop_aspect)
            left = (im.width - new_w) // 2
            im = im.crop((left, 0, left + new_w, im.height))
        elif curr_aspect < crop_aspect:
            new_h = int(im.width / crop_aspect)
            top = (im.height - new_h) // 2
            im = im.crop((0, top, im.width, top + new_h))

    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    x = arr / 255.0

    # 1. Filmic S-curve tone mapping (deep rich blacks without digital clipping + smooth highlight rolloff)
    toe = 0.030
    shoulder = 0.985
    curved = x * x * (3.0 - 2.0 * x)
    x = toe + (shoulder - toe) * curved
    x = np.clip(x, 0.0, 1.0)

    # 2. Cinematic Split Toning (Teal shadows / Warm golden amber highlights)
    if not is_mono:
        lum = 0.299 * x[:, :, 0] + 0.587 * x[:, :, 1] + 0.114 * x[:, :, 2]
        shadow_mask = np.clip(1.0 - lum * 1.5, 0.0, 1.0)[:, :, None]
        highlight_mask = np.clip((lum - 0.42) * 1.5, 0.0, 1.0)[:, :, None]

        # Cool teal in dark tones
        x[:, :, 0] -= 0.022 * shadow_mask[:, :, 0]
        x[:, :, 2] += 0.032 * shadow_mask[:, :, 0]

        # Warm amber/gold in bright tones
        x[:, :, 0] += 0.028 * highlight_mask[:, :, 0]
        x[:, :, 1] += 0.012 * highlight_mask[:, :, 0]
        x[:, :, 2] -= 0.018 * highlight_mask[:, :, 0]

        x = np.clip(x, 0.0, 1.0)
    else:
        # Silver-halide monochrome
        gray = 0.299 * x[:, :, 0] + 0.587 * x[:, :, 1] + 0.114 * x[:, :, 2]
        x[:, :, 0] = gray
        x[:, :, 1] = gray
        x[:, :, 2] = gray

    # 3. Anamorphic Optical Vignette
    Y, X = np.ogrid[:h, :w]
    cx, cy = w / 2.0, h / 2.0
    dist = np.sqrt(((X - cx) / cx) ** 2 + ((Y - cy) / cy) ** 2) / 1.414
    vignette = 1.0 - 0.18 * (dist ** 2)
    vignette = np.clip(vignette, 0.80, 1.0)[:, :, None]
    x *= vignette

    # 4. Subtle 35mm motion picture grain (removes digital noise / sensor banding)
    np.random.seed(42)
    grain = np.random.normal(0, 0.010, (h, w, 1))
    x += grain
    x = np.clip(x, 0.0, 1.0)

    out_arr = (x * 255.0).astype(np.uint8)
    out_im = Image.fromarray(out_arr)

    # 5. Micro-contrast & sharp detail
    out_im = out_im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=65, threshold=3))
    return out_im

# Curated items with exact filenames from photos-extracted
items = [
    ("unity", "IMG_20251205_153641918~2.jpg", "GameDev com Unity", "Programação", 2025, False),
    ("formatura-turma", "IMG_20260630_205317784~2.jpg", "Uma conquista compartilhada", "Pessoal", 2026, False),
    ("formatura", "IMG_20260630_212305298_HDR.jpg", "Registro de formatura", "Pessoal", 2026, False),
    ("liga-escolar", "IMG_20261028_085038039_MP~2.jpg", "Medalha da Liga Escolar SP", "Esportes", None, False),
    ("mancini", "IMG_20261028_085046091_MP~2.jpg", "Medalha Team Mancini", "Esportes", None, False),
    ("inicup", "IMG_20261028_085053156_MP~2.jpg", "Inicup TT – Campeão Sub-13", "Esportes", 2024, False),
    ("liga-20", "IMG_20261028_085102340_MP~2.jpg", "Liga Pró Tênis de Mesa – 20 Anos", "Esportes", 2024, False),
    ("futebol-2018", "IMG_20261028_085258756_MP~2.jpg", "Chute Inicial Ipiranga – Vice-campeão Série Ouro", "Esportes", 2018, False),
    ("canguru-2022", "IMG_20261028_085321586_MP~2.jpg", "Medalha Canguru de Matemática", "Olimpíadas", 2022, False),
    ("kumon", "IMG_20261028_085352431_MP~2.jpg", "Medalha Kumon – Expo 2017", "Olimpíadas", 2017, False),
    ("canguru", "IMG_20261028_085429603_MP~2.jpg", "Medalha Canguru de Matemática", "Olimpíadas", None, False),
    ("zoom", "IMG_20261028_085506670_MP~2.jpg", "Medalha do Torneio de Robótica Zoom", "Robótica", None, False),
    ("poliedro", "IMG_20261028_085530168_MP~2.jpg", "Medalha Poliedro Matemática", "Olimpíadas", None, False),
    ("matchpoint", "IMG_20261028_085551345_MP~2.jpg", "Match Point – 2º e 3º Lugares", "Esportes", None, False),
    ("natacao", "IMG_20261028_085606833_MP~2.jpg", "Medalha de Natação – Raia 4", "Esportes", None, False),
    ("infancia-futebol", "IMG_20261028_103347812_MP~3.jpg", "Infância – Encontro em Campo", "Infância", None, False),
    ("infancia-formatura", "IMG_20261028_103454263_MP~3.jpg", "Infância – Primeiros Passos", "Infância", None, False),
    ("infancia-natacao", "IMG_20261028_103841135_MP~2.jpg", "Infância – Treinos na Piscina", "Infância", None, False),
    ("podio", "IMG-20241014-WA0002.jpg", "Pódio no Match Point", "Esportes", 2024, False),
    ("retrato", "2026-10-10-11-30-19-654.jpg", "João Gouvêa", "Pessoal", 2026, False),
    ("tenis", "3O6A3784.JPG", "Foco à Mesa – Tênis de Mesa", "Esportes", None, False),
    ("fecart", "Fecart-2026 (20) (1).JPG", "FECART – Demonstração do Projeto", "Robótica", 2026, False),
    ("infancia-piscina", "COOLPIX L1102612_Repaired.JPG", "Infância – Natação", "Infância", None, False),
    ("equipe-mancini", "IMG_20250920_164421012_MP.jpg", "Tênis de Mesa – Equipe Team Mancini", "Esportes", 2025, False),
    ("premiacao-2024", "IMG_20240421_122712014_MP.jpg", "Inicup TT – Cerimônia de Premiação", "Esportes", 2024, False),
    ("esporte-2025", "IMG_20250920_164519474_MP~2.jpg", "Tênis de Mesa – Conquistas 2025", "Esportes", 2025, False),
    ("torneio-2026", "IMG_20260301_165926707_MP.jpg", "Tênis de Mesa – Torneio Oficial 2026", "Esportes", 2026, False),
    ("tenis-preto-branco", "IMG_20261018_201959_962.webp", "Tênis de Mesa – Retrato Cinematográfico Preto & Branco", "Esportes", 2026, True),
    ("batismo", "batismo1.jpg", "Celebração e Origens", "Pessoal", None, False),
    ("foco-treino", "FullSizeRender_VSCO.jpg", "Intensidade e Concentração nos Treinos", "Esportes", 2025, False)
]

processed_photos = []

for item in items:
    id_name, filename, title, category, year, is_mono = item
    src_file = photos_dir / filename
    if not src_file.exists():
        print(f"Skipping {filename}: not found")
        continue

    print(f"Processing cinematographic grade: {id_name} ({filename})...")
    with Image.open(src_file) as raw_im:
        graded = apply_cinematic_grade(raw_im, is_mono=is_mono)

        # Resample to max 1920 on longest edge
        graded.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        full_dest = assets_photos / f"{id_name}.webp"
        graded.save(full_dest, "WEBP", quality=90, method=6)

        # Create responsive thumbnail
        thumb = graded.copy()
        thumb.thumbnail((720, 900), Image.Resampling.LANCZOS)
        thumb_dest = assets_photos / f"{id_name}-small.webp"
        thumb.save(thumb_dest, "WEBP", quality=85, method=6)

        processed_photos.append({
            "id": id_name,
            "title": title,
            "category": category,
            "year": year,
            "src": f"media/photos/{id_name}.webp",
            "thumb": f"media/photos/{id_name}-small.webp",
            "width": graded.width,
            "height": graded.height,
            "thumbWidth": thumb.width,
            "note": "Registro fotográfico tratado com color grading cinematográfico."
        })

print(f"\nSuccessfully graded and saved {len(processed_photos)} cinematic photos!")

# Update portfolio.json
portfolio_json_path = root / "src/data/portfolio.json"
with open(portfolio_json_path, "r", encoding="utf-8") as f:
    current_data = json.load(f)

current_data["photos"] = processed_photos
with open(portfolio_json_path, "w", encoding="utf-8") as f:
    json.dump(current_data, f, ensure_ascii=False, indent=2)

print("Updated src/data/portfolio.json with cinematic photos!")
