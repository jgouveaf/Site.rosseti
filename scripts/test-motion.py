import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
base=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:4175/Site.rosseti/'
results=[]
def check(name,value):
 assert value,name
 results.append(name);print('PASS',name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':1000});page.goto(base,wait_until='networkidle');page.wait_for_timeout(1600)
 check('Color table tennis hero loads',page.locator('.pf-hero-image img').evaluate('(e)=>e.currentSrc.includes("tenis.webp") && e.complete && e.naturalWidth>0'))
 check('Hero uses the prepared local photo',page.request.get(base+'media/photos/tenis.webp').body()==Path('public/media/photos/tenis.webp').read_bytes())
 page.evaluate('scrollTo({top:300,behavior:"instant"})');page.wait_for_timeout(200)
 check('Hero reacts to scrolling',float(page.locator('.pf-hero-stage').evaluate('(e)=>getComputedStyle(e).getPropertyValue("--hero-progress")'))>0)
 page.locator('.pf-reel').evaluate('(e)=>scrollTo({top:e.offsetTop+800,behavior:"instant"})');page.wait_for_timeout(500)
 check('Horizontal reel moves with vertical scroll',page.locator('.pf-reel-track').evaluate('(e)=>new DOMMatrix(getComputedStyle(e).transform).m41 < -100'))
 # Check click without forced events: focusing a card should not move it away from the pointer.
 page.locator('.pf-reel').evaluate('(e)=>scrollTo({top:e.offsetTop,behavior:"instant"})');page.wait_for_timeout(300)
 page.locator('.pf-reel-card button').first.click();page.wait_for_selector('dialog[open]')
 check('Reel photo opens on pointer click',page.locator('#pf-dialog-title').inner_text()==page.locator('.pf-reel-card .pf-photo img').first.get_attribute('alt'))
 page.keyboard.press('Escape')
 card=page.locator('.pf-reel-card button').last
 card.focus();page.wait_for_timeout(400)
 bounds=card.bounding_box()
 check('Keyboard reveals last reel card',card.evaluate('(e)=>e===document.activeElement') and bounds['x']>=0 and bounds['x']+bounds['width']<=1441)
 page.keyboard.press('Enter');page.wait_for_selector('dialog[open]');check('Keyboard opens last reel card','formatura' in page.locator('#pf-dialog-title').inner_text().lower());page.keyboard.press('Escape')
 page.locator('.pf-stats').evaluate('(e)=>e.scrollIntoView({block:"center",behavior:"instant"})');page.wait_for_timeout(1400)
 check('Counters finish at truthful values',page.locator('.pf-number').all_text_contents()==['16','10','03'])
 page.locator('#projetos').evaluate('(e)=>scrollTo({top:e.offsetTop,behavior:"instant"})')
 page.locator('#projetos .pf-section-heading.motion-visible').wait_for()
 check('Scroll reveals content',page.locator('#projetos .pf-section-heading').evaluate('(e)=>e.classList.contains("motion-visible")'))
 page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(200)
 check('Live reduced motion disables pinned hero',page.locator('.pf-hero-cinema').evaluate('(e)=>getComputedStyle(e).position')=='relative')
 check('Live reduced motion shows all reveal content',page.locator('.motion-reveal').evaluate_all('(els)=>els.every(e=>getComputedStyle(e).opacity==="1")'))
 check('Live reduced motion stops horizontal transform',page.locator('.pf-reel-track').evaluate('(e)=>getComputedStyle(e).transform')=='none')
 page.emulate_media(reduced_motion='no-preference');page.set_viewport_size({'width':390,'height':844});page.locator('.pf-reel').evaluate('(e)=>scrollTo({top:e.offsetTop,behavior:"instant"})');page.wait_for_timeout(250)
 check('Mobile reel is touch-scrollable',page.locator('.pf-reel-window').evaluate('(e)=>getComputedStyle(e).overflowX==="auto" && e.scrollWidth>e.clientWidth'))
 page.locator('.pf-reel-window').evaluate('(e)=>e.scrollLeft=e.scrollWidth');page.wait_for_timeout(350)
 check('Mobile reel reaches final card',page.locator('.pf-reel-window').evaluate('(e)=>e.scrollLeft>500'))
 for width,height in [(390,844),(320,740),(844,390)]:
  page.set_viewport_size({'width':width,'height':height});page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(200)
  check(f'Hero title fits {width}x{height}',page.locator('.pf-name-last').evaluate('(e)=>e.getBoundingClientRect().right<=innerWidth'))
 b.close()
Path('docs/qa/motion-results.json').write_text(json.dumps(results,indent=2))
print(len(results),'motion checks completed')
