"""Check the authentic 4K source and removal of the brush interaction."""
import sys
from playwright.sync_api import sync_playwright
base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5174/"
with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(base, wait_until="domcontentloaded")
    assert page.locator(".pf-brush-photo").count() == 0
    image = page.locator(".pf-real-portrait img")
    image.scroll_into_view_if_needed()
    assert image.evaluate("e => e.complete && e.naturalWidth == 1836 && e.naturalHeight == 4080")
    assert "RETRATO" not in page.locator(".pf-real-portrait").inner_text().upper()
    print("PASS authentic full-resolution photo, no brush or portrait label")
    browser.close()
