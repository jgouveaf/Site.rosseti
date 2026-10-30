"""Exercise both full-image brush phases in a real browser."""
import sys
from playwright.sync_api import sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4175/Site.rosseti/'
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.goto(base, wait_until='networkidle')
    photo = page.locator('.pf-brush-photo')
    image = photo.locator('img')
    assert image.evaluate('(e)=>e.complete && e.naturalWidth>0 && getComputedStyle(e).filter==="none"')
    alpha = lambda x,y: photo.locator('canvas').evaluate('(c,[x,y])=>c.getContext("2d").getImageData(Math.floor(c.width*x),Math.floor(c.height*y),1,1).data[3]', [x,y])
    assert photo.get_attribute('data-mode') == 'paint' and alpha(.5,.5) == 0
    box = photo.bounding_box()
    page.mouse.move(box['x'] + box['width']*.5, box['y'] + box['height']*.5)
    assert alpha(.5,.5) > 0, 'pointer must paint at its real position'
    assert photo.get_attribute('data-mode') == 'paint', 'second phase must not start early'
    print('PASS local grayscale brush paints at pointer without changing phase early')
    # Visit a dense raster, including edges, until every coverage cell is painted.
    step = 25
    for y in range(0, int(box['height']) + step, step):
        xs = range(0, int(box['width']) + step, step)
        if y // step % 2: xs = reversed(list(xs))
        for x in xs:
            page.mouse.move(box['x'] + min(x,box['width']-1),box['y'] + min(y,box['height']-1))
        if photo.get_attribute('data-mode') == 'restore': break
    assert photo.get_attribute('data-mode') == 'restore', photo.locator('.pf-brush-instruction').inner_text()
    assert alpha(.5,.5) == 255, 'entire photo must become grayscale before restoring'
    print('PASS full image switches to restoration only after complete coverage')
    page.mouse.move(box['x'] + box['width']*.5, box['y'] + box['height']*.5)
    assert alpha(.5,.5) == 0, 'second pass must reveal original color'
    print('PASS second pass restores original color at pointer')
    letter = page.locator('.pf-hero h1 .pf-hover-letter').first
    letter.hover(force=True)
    page.wait_for_timeout(750)
    assert letter.evaluate('(e)=>getComputedStyle(e).animationName==="pf-rubber-letter"')
    print('PASS name letters animate like elastic rubber')
    browser.close()
