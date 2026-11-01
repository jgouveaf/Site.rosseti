"""Verify that the tunnel creatures change position while scroll stays still."""
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageChops, ImageStat
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5175/"

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(args=["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"])
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base, wait_until="domcontentloaded")
    page.locator(".pf-journey").evaluate(
        "e => scrollTo({top:e.getBoundingClientRect().top+scrollY+.25*(e.offsetHeight-innerHeight),behavior:'instant'})"
    )
    page.wait_for_timeout(2500)
    canvas = page.locator(".pf-journey-world canvas")
    first = Image.open(BytesIO(canvas.screenshot(timeout=120000))).convert("RGB")
    page.wait_for_timeout(1700)
    second = Image.open(BytesIO(canvas.screenshot(timeout=120000))).convert("RGB")
    capture = Path("docs/qa")
    capture.mkdir(parents=True, exist_ok=True)
    first.save(capture / "alien-walk-1.png")
    second.save(capture / "alien-walk-2.png")
    movement = ImageChops.difference(first.crop((300, 250, 700, 740)), second.crop((300, 250, 700, 740)))
    mean_change = sum(ImageStat.Stat(movement).mean) / 3
    assert mean_change > 2, f"Creature region barely changed: {mean_change:.2f}"
    assert not errors, errors
    print(f"PASS alien movement visible at fixed scroll (mean pixel change: {mean_change:.2f})")
    browser.close()
