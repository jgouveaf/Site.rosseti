from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
    page.screenshot(path="docs/qa/refresh-desktop.png", full_page=True)
    assert page.locator(".pf-real-portrait img").evaluate("e => e.complete && e.naturalWidth > 0")
    assert page.locator(".pf-brush-photo").count() == 0
    assert page.locator("#jogos .pf-game").count() == 4
    assert page.locator(".pf-sport-image img").evaluate("e => getComputedStyle(e).filter.includes('grayscale')")
    assert page.locator(".pf-manifesto").evaluate("e => getComputedStyle(e).display === 'flex'")
    assert not errors, errors
    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile.goto("http://127.0.0.1:5173/", wait_until="networkidle")
    mobile.screenshot(path="docs/qa/refresh-mobile.png", full_page=True)
    print("desktop/mobile loaded; portrait, games, grayscale and manifesto verified")
    browser.close()
