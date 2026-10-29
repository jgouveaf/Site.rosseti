from pathlib import Path
import numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

root = Path(r"D:/Site.rosseti")
photos_dir = root / "photos-extracted"
assets_photos = root / "public/media/photos"
assets_photos.mkdir(parents=True, exist_ok=True)

def enhance_photo_cinematic(raw_im, boost_face=True, is_mono=False):
    im = ImageOps.exif_transpose(raw_im).convert('RGB')
    
    # 1. High-quality auto-contrast with tone preservation
    im = ImageOps.autocontrast(im, cutoff=0.5, preserve_tone=True)
    
    # 2. Convert to float array for cinema color science
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    x = arr / 255.0

    # 3. Filmic S-Curve with lifted toe (rich charcoal shadows #0a0b0d, no clipping)
    toe = 0.025
    shoulder = 0.990
    curved = x * x * (3.0 - 2.0 * x)
    x = toe + (shoulder - toe) * curved
    x = np.clip(x, 0.0, 1.0)

    # 4. Color Grading: Rich sports arena colors + warm golden skin tones
    if not is_mono:
        # Calculate luminance
        lum = 0.299 * x[:, :, 0] + 0.587 * x[:, :, 1] + 0.114 * x[:, :, 2]
        
        # Shadows mask (cool teal/slate push)
        shadow_mask = np.clip(1.0 - lum * 1.8, 0.0, 1.0)[:, :, None]
        # Highlights/Skin tones mask (warm amber/golden glow)
        highlight_mask = np.clip((lum - 0.35) * 1.5, 0.0, 1.0)[:, :, None]

        # Subtle teal in deep shadows
        x[:, :, 0] -= 0.018 * shadow_mask[:, :, 0]
        x[:, :, 2] += 0.024 * shadow_mask[:, :, 0]

        # Rich warm amber in highlights & mid-tones (healthy vibrant skin & medal shine)
        x[:, :, 0] += 0.032 * highlight_mask[:, :, 0]
        x[:, :, 1] += 0.016 * highlight_mask[:, :, 0]
        x[:, :, 2] -= 0.015 * highlight_mask[:, :, 0]

        x = np.clip(x, 0.0, 1.0)
    else:
        gray = 0.299 * x[:, :, 0] + 0.587 * x[:, :, 1] + 0.114 * x[:, :, 2]
        x[:, :, 0] = gray
        x[:, :, 1] = gray
        x[:, :, 2] = gray

    # 5. Subtle lens vignette (8% falloff, subtle and elegant, not an oval blob!)
    Y, X = np.ogrid[:h, :w]
    cx, cy = w / 2.0, h / 2.0
    dist = np.sqrt(((X - cx) / cx) ** 2 + ((Y - cy) / cy) ** 2) / 1.414
    vignette = 1.0 - 0.10 * (dist ** 2)
    vignette = np.clip(vignette, 0.90, 1.0)[:, :, None]
    x *= vignette

    # 6. Ultra-fine 35mm grain texture (0.6% standard deviation)
    np.random.seed(42)
    grain = np.random.normal(0, 0.006, (h, w, 1))
    x += grain
    x = np.clip(x, 0.0, 1.0)

    out_arr = (x * 255.0).astype(np.uint8)
    out_im = Image.fromarray(out_arr)

    # 7. Vibrance and color richness
    if not is_mono:
        out_im = ImageEnhance.Color(out_im).enhance(1.10)
    
    # 8. Micro-contrast & detail sharpness (eyes, hair, jersey logos, medal textures)
    out_im = out_im.filter(ImageFilter.UnsharpMask(radius=1.3, percent=80, threshold=2))
    return out_im

# Curated high quality photos
photo_map = [
    # Hero portrait & main personal photos
    ("joao-portrait", "2026-10-10-11-30-19-654.jpg", "João Gouvêa — Retrato Oficial", "Pessoal", 2026, False),
    ("joao-foco", "FullSizeRender_VSCO.jpg", "Intensidade e Concentração nos Treinos", "Esportes", 2025, False),
    ("torneio-2026", "IMG_20260301_165926707_MP.jpg", "Competição Oficial de Tênis de Mesa", "Esportes", 2026, False),
    ("esporte-2025", "IMG_20250920_164519474_MP~2.jpg", "Conquistas e Premiações 2025", "Esportes", 2025, False),
    ("equipe-mancini", "IMG_20250920_164421012_MP.jpg", "Equipe Team Mancini — Tênis de Mesa", "Esportes", 2025, False),
    ("premiacao-2024", "IMG_20240421_122712014_MP.jpg", "Inicup TT — Cerimônia no Pódio (Campeão Sub-13)", "Esportes", 2024, False),
    ("fecart", "Fecart-2026 (20) (1).JPG", "FECART — Demonstração do Projeto Robótico", "Robótica", 2026, False),
    ("formatura", "IMG_20260630_212305298_HDR.jpg", "Formatura e Encerramento de Ciclo", "Pessoal", 2026, False),
    ("formatura-turma", "IMG_20260630_205317784~2.jpg", "Formatura — Conquista Coletiva com a Turma", "Pessoal", 2026, False),
    ("podio", "IMG-20241014-WA0002.jpg", "Pódio no Torneio Match Point", "Esportes", 2024, False),
    ("unity", "IMG_20251205_153641918~2.jpg", "GameDev com Unity e Programação", "Programação", 2025, False),
    ("tenis", "3O6A3784.JPG", "Foco à Mesa — Velocidade e Técnica", "Esportes", None, False),
    ("tenis-preto-branco", "IMG_20261018_201959_962.webp", "Tênis de Mesa — Estudo de Silhueta", "Esportes", 2026, True),
    ("retrato", "2026-10-10-11-30-19-654.jpg", "João Gouvêa", "Pessoal", 2026, False),
    
    # Sports & Childhood medals
    ("inicup", "IMG_20261028_085053156_MP~2.jpg", "Inicup TT — Campeão Sub-13 Masculino", "Esportes", 2024, False),
    ("liga-20", "IMG_20261028_085102340_MP~2.jpg", "Liga Pró Tênis de Mesa — 20 Anos", "Esportes", 2024, False),
    ("liga-escolar", "IMG_20261028_085038039_MP~2.jpg", "Medalha da Liga Escolar SP", "Esportes", None, False),
    ("mancini", "IMG_20261028_085046091_MP~2.jpg", "Medalha Oficial Team Mancini", "Esportes", None, False),
    ("natacao", "IMG_20261028_085606833_MP~2.jpg", "Medalha de Natação — Raia 4", "Esportes", None, False),
    ("futebol-2018", "IMG_20261028_085258756_MP~2.jpg", "Chute Inicial Ipiranga — Vice-campeão Série Ouro", "Esportes", 2018, False),
    ("matchpoint", "IMG_20261028_085551345_MP~2.jpg", "Match Point — 2º e 3º Lugares", "Esportes", None, False),
    
    # Olympiads & Robotics
    ("zoom", "IMG_20261028_085506670_MP~2.jpg", "Medalha do Torneio de Robótica Zoom", "Robótica", None, False),
    ("canguru-2022", "IMG_20261028_085321586_MP~2.jpg", "Medalha Canguru de Matemática (2022)", "Olimpíadas", 2022, False),
    ("canguru", "IMG_20261028_085429603_MP~2.jpg", "Medalha Canguru de Matemática", "Olimpíadas", None, False),
    ("poliedro", "IMG_20261028_085530168_MP~2.jpg", "Medalha Poliedro Matemática", "Olimpíadas", None, False),
    ("kumon", "IMG_20261028_085352431_MP~2.jpg", "Medalha Kumon — Expo 2017", "Olimpíadas", 2017, False),
    
    # Childhood memories
    ("infancia-futebol", "IMG_20261028_103347812_MP~3.jpg", "Infância — Primeiros Passos no Campo", "Infância", None, False),
    ("infancia-formatura", "IMG_20261028_103454263_MP~3.jpg", "Infância — Formatura Pré-Escolar", "Infância", None, False),
    ("infancia-natacao", "IMG_20261028_103841135_MP~2.jpg", "Infância — Dedicação na Piscina", "Infância", None, False),
    ("infancia-piscina", "COOLPIX L1102612_Repaired.JPG", "Infância — Início na Natação", "Infância", None, False),
    ("batismo", "batismo1.jpg", "Celebração em Família e Origens", "Pessoal", None, False)
]

processed_list = []

for item in photo_map:
    id_name, filename, title, category, year, is_mono = item
    src_path = photos_dir / filename
    if not src_path.exists():
        print(f"Skipping {filename}: not found")
        continue

    print(f"Master grading: {id_name} ({filename})...")
    with Image.open(src_path) as raw:
        graded = enhance_photo_cinematic(raw, is_mono=is_mono)
        
        # Save full resolution (up to 2048px)
        graded.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
        full_file = assets_photos / f"{id_name}.webp"
        graded.save(full_file, "WEBP", quality=92, method=6)
        
        # Save responsive thumbnail (up to 800px)
        thumb = graded.copy()
        thumb.thumbnail((800, 900), Image.Resampling.LANCZOS)
        thumb_file = assets_photos / f"{id_name}-small.webp"
        thumb.save(thumb_file, "WEBP", quality=88, method=6)
        
        processed_list.append({
            "id": id_name,
            "title": title,
            "category": category,
            "year": year,
            "src": f"media/photos/{id_name}.webp",
            "thumb": f"media/photos/{id_name}-small.webp",
            "width": graded.width,
            "height": graded.height,
            "thumbWidth": thumb.width,
            "note": "Tratamento de alta fidelidade e color grading cinematográfico."
        })

print(f"Successfully processed {len(processed_list)} master cinematic photos!")

# Update portfolio.json
import json
json_path = root / "src/data/portfolio.json"
with open(json_path, "r", encoding="utf-8") as f:
    d = json.load(f)

d["photos"] = processed_list
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

print("Updated portfolio.json with master photos!")
