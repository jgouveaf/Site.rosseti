import json
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch()
 page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
 page.goto('http://127.0.0.1:4173/',wait_until='networkidle')
 page.screenshot(path=str(root/'docs/qa/desktop.png'))
 page.locator('#certificados').scroll_into_view_if_needed()
 page.screenshot(path=str(root/'docs/qa/certificados.png'))
 page.set_viewport_size({'width':390,'height':844})
 page.goto('http://127.0.0.1:4173/',wait_until='networkidle')
 page.screenshot(path=str(root/'docs/qa/mobile.png'))
 print('Screenshots saved')
 browser.close()
