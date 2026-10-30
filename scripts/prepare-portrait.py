from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"D:\João Gouvea\Pictures\Imagens pro Site\IMG_20251205_153641918~2.jpg")
OUTPUT = ROOT / "public/media/photos/joao-real-bw.webp"

# João is the person on the right in this original photo. A crop and classic
# tonal adjustment retain the photographed face without reconstructing it.
image = Image.open(SOURCE).convert("RGB")
portrait = image.crop((1050, 1080, 1836, 2450))
portrait = ImageOps.grayscale(portrait)
portrait = ImageEnhance.Contrast(portrait).enhance(1.12)
portrait = portrait.filter(ImageFilter.UnsharpMask(radius=1.1, percent=85, threshold=3))
portrait.save(OUTPUT, "WEBP", quality=88, method=6)
print(f"{OUTPUT}: {portrait.size[0]}x{portrait.size[1]}")
