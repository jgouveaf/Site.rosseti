"""Motion is scroll driven and remains usable with reduced motion."""
import sys
from playwright.sync_api import sync_playwright
base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5174/"
with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(base, wait_until="domcontentloaded")
    page.locator("#momentos").evaluate("e => scrollTo({top:e.offsetTop + 700,behavior:'instant'})")
    page.wait_for_timeout(250)
    assert page.locator(".pf-reel-track").evaluate("e => new DOMMatrix(getComputedStyle(e).transform).m41 < -100")
    print("PASS reel advances with page scroll")
    page.locator("#trajetoria").evaluate("e => scrollTo({top:e.offsetTop + 600,behavior:'instant'})")
    page.wait_for_timeout(250)
    assert page.locator(".pf-tunnel i").first.evaluate("e => getComputedStyle(e).transform != 'none'")
    print("PASS tunnel advances with page scroll")
    page.emulate_media(reduced_motion="reduce")
    page.wait_for_timeout(150)
    assert page.locator(".pf-tunnel").evaluate("e => getComputedStyle(e).display == 'none'")
    assert page.locator(".pf-reel-track").evaluate("e => getComputedStyle(e).transform == 'none'")
    print("PASS reduced motion removes tunnel and horizontal motion")
    browser.close()
