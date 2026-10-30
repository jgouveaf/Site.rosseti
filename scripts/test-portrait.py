"""Check the real portrait and removal of the abandoned brush interaction."""
import sys
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5173/'
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto(base, wait_until='networkidle')
    assert page.locator('.pf-brush-photo').count() == 0
    portrait = page.locator('.pf-real-portrait img')
    assert portrait.evaluate('(e)=>e.complete && e.naturalWidth >= 700 && e.currentSrc.includes("joao-real-bw.webp")')
    letter = page.locator('.pf-hero h1 .pf-hover-letter').first
    letter.hover(force=True)
    page.wait_for_timeout(400)
    assert letter.evaluate('(e)=>getComputedStyle(e).animationName === "none"')
    print('PASS real portrait loads, brush is absent, letter hover is subtle')
    browser.close()
