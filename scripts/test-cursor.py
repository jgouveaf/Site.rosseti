"""The image-only VER cursor and gallery dialog were removed by request."""
import sys
from playwright.sync_api import sync_playwright
base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5174/"
with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto(base, wait_until="domcontentloaded")
    assert page.locator(".pf-pointer,dialog,.pf-reel-card button,.pf-sport-image button").count() == 0
    print("PASS no image cursor, dialog or clickable image")
    browser.close()
