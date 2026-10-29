"""Regression for the custom VER cursor's alignment after scroll."""
import sys
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4175/Site.rosseti/'
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto(base, wait_until='networkidle')
    for selector in ('.pf-hero-photo', '.pf-reel-card button', '.pf-sport-image .pf-photo', '.pf-obi-paper'):
        item = page.locator(selector).first
        item.scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        bounds = item.bounding_box()
        x = bounds['x'] + bounds['width'] / 2
        y = bounds['y'] + bounds['height'] / 2
        page.mouse.move(x, y)
        page.wait_for_timeout(80)
        cx, cy, visible = page.locator('.pf-pointer').evaluate('''el => {
            const box = el.getBoundingClientRect();
            return [box.left + box.width / 2, box.top + box.height / 2, el.classList.contains('is-visible')];
        }''')
        assert visible and abs(cx-x)<2 and abs(cy-y)<2, (selector, x, y, cx, cy)
        print('PASS', selector)
    page.evaluate('scrollTo({top: 0, behavior: "instant"})')
    page.wait_for_timeout(150)
    page.mouse.move(100, 120)
    page.wait_for_timeout(80)
    assert not page.locator('.pf-pointer').evaluate("el => el.classList.contains('is-visible')")
    page.emulate_media(reduced_motion='reduce')
    assert page.locator('.pf-pointer').evaluate('el => getComputedStyle(el).display') == 'none'
    print('PASS hidden outside targets and with reduced motion')
    browser.close()
