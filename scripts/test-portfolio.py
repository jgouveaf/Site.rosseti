from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
base=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:4173/Site.rosseti/'
data=json.loads((root/'src/data/portfolio.json').read_text(encoding='utf-8'))
report={'base':base,'checks':[],'errors':[]}
def check(name,condition):
 assert condition,name
 report['checks'].append(name)
 print('PASS',name)
with sync_playwright() as p:
 browser=p.chromium.launch()
 context=browser.new_context(viewport={'width':1440,'height':1000})
 page=context.new_page()
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 response=page.goto(base,wait_until='networkidle')
 check('Production page and public name',response.status==200 and 'João Gouvêa' in page.title())
 check('All achievements appear in the scroll timeline',page.locator('.pf-history-item').count()==len(data['achievements']))
 check('No achievement filters or reveal button',page.locator('.pf-filters,.pf-gallery-more,.pf-year h3 button').count()==0)
 check('Current table tennis teams are shown','Itaim Keiko' in page.locator('#sobre').inner_text() and 'FECAP' in page.locator('#sobre').inner_text())
 check('Futsal is clearly historical','joguei futsal' in page.locator('#sobre').inner_text().lower())
 check('Only five curated photos are on the page',page.locator('main img').count()==6 and page.locator('#momentos .pf-reel-card img').count()==3)
 check('OBI poster removed from page',page.locator('img[src*="photos/obi"]').count()==0)
 check('No 29-photo gallery or concept image',page.locator('.pf-gallery-card,.pf-project-visual').count()==0)
 check('Curated images use monochrome treatment','grayscale(1)' in page.locator('#momentos img').first.evaluate('(e)=>getComputedStyle(e).filter'))
 page.locator('#project-tab-1').click()
 check('Project selector switches content',page.locator('#project-panel h3').inner_text().casefold()=='frequência morta')
 page.locator('#project-tab-1').focus();page.keyboard.press('ArrowRight')
 check('Project selector works by keyboard',page.locator('#project-panel h3').inner_text().casefold()=='italianwhey' and page.locator('#project-tab-2').get_attribute('aria-selected')=='true')
 check('Timeline year has visible events',page.locator('#year-2024 .pf-history-item').count()==sum(a['year']==2024 for a in data['achievements']))
 check('No horizontal overflow on desktop',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
 check('FECART loops muted without controls',page.locator('video').evaluate('(v)=>v.autoplay && v.muted && v.loop && !v.controls'))
 page.screenshot(path=str(root/'docs/qa/desktop.png'))
 # The certificate section contains only the original OBI document.
 check('Only original OBI certificate shown',page.locator('#certificados img').count()==1 and page.locator('.pf-cert-card').count()==0)
 check('OBI certificate PDF loads',context.request.get(base+'media/certificates/obi-2026.pdf').status==200)
 check('OBI result is visible','146º' in page.locator('#certificados').inner_text())
 # Photo dialog: keyboard, return focus and circular navigation.
 first=page.locator('.pf-hero-photo')
 first.evaluate('(el)=>el.scrollIntoView({block:"center",behavior:"instant"})')
 first.click(force=True)
 page.wait_for_selector('dialog[open]')
 check('Real photo opens in dialog',page.locator('#pf-dialog-title').inner_text()==next(p['title'] for p in data['photos'] if p['id']=='tenis-preto-branco'))
 page.keyboard.press('ArrowLeft')
 check('Dialog wraps backwards',page.locator('dialog .pf-modal-top span').inner_text()=='5 / 5')
 page.keyboard.press('ArrowRight')
 check('Dialog wraps forwards',page.locator('dialog .pf-modal-top span').inner_text()=='1 / 5')
 page.keyboard.press('Escape')
 check('Escape closes and restores focus',page.locator('dialog').count()==0 and first.evaluate('(el)=>document.activeElement===el'))
 # Verify all provided media URLs, not just currently visible lazy images.
 for item in data['photos']+data['certificates']:
  for field in ['src','thumb']:
   r=context.request.get(base+item[field]); assert r.status==200,(item['id'],field,r.status)
 check('All image URLs load',True)
 # Browser decoder and real advancing playback.
 page.locator('video').evaluate('(v)=>v.load()')
 page.wait_for_function('document.querySelector("video").readyState>=2',timeout=30000)
 page.locator('video').evaluate('(v)=>{v.muted=true;return v.play()}')
 page.wait_for_function('document.querySelector("video").currentTime>0.3',timeout=15000)
 check('FECART video decodes and plays',page.locator('video').evaluate('(v)=>v.videoWidth>0 && !v.error'))
 report['video']=page.locator('video').evaluate('(v)=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight})')
 check('Video cannot be paused with a pointer',page.locator('video').evaluate('(v)=>getComputedStyle(v).pointerEvents')=='none')
 page.locator('#certificados').evaluate('(e)=>scrollTo({top:e.offsetTop+420,behavior:"instant"})')
 page.wait_for_timeout(1000)
 page.screenshot(path=str(root/'docs/qa/certificados.png'))
 check('OBI preview renders',page.locator('.pf-obi-paper img').evaluate('(e)=>e.complete && e.naturalWidth>0'))
 for width,height in [(768,1024),(390,844),(320,740)]:
  page.set_viewport_size({'width':width,'height':height})
  page.evaluate('scrollTo({top:0,behavior:"instant"})')
  check(f'No horizontal overflow at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  if width==390:
   page.screenshot(path=str(root/'docs/qa/mobile.png'))
   page.get_by_role('button',name='Menu +').click()
   page.locator('#pf-nav').get_by_role('link',name='Momentos',exact=True).click()
   check('Mobile menu closes after navigation',page.locator('.pf-menu').get_attribute('aria-expanded')=='false')
 page.emulate_media(reduced_motion='reduce')
 check('Reduced motion disables certificate hover transform',page.locator('.pf-obi-paper').evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s')
 check('Reduced motion stops decoration',page.locator('.pf-scroll-orbit svg').evaluate('(e)=>getComputedStyle(e).animationName')=='none')
 # Curated moment opens through the keyboard.
 page.locator('#momentos .pf-reel-card button').first.focus();page.keyboard.press('Enter')
 page.wait_for_selector('dialog[open]')
 check('Keyboard opens real photos','Infância' in page.locator('#pf-dialog-title').inner_text())
 page.keyboard.press('Escape')
 # Historical experiences still have valid routes and meaningful UI.
 page.goto(base+'neymar/',wait_until='networkidle')
 check('Neymar experience preserved',page.locator('.ney-hero-name').count()==1)
 page.goto(base+'exploracao/',wait_until='networkidle')
 check('3D exploration restored',page.locator('.gallery-page').count()==1)
 check('No uncaught JS errors',not report['errors'])
 browser.close()
(root/'docs/qa/test-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Completed',len(report['checks']),'checks')
