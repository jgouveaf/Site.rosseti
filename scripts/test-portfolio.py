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
 check('All 35 achievements render',page.locator('.pf-achievement').count()==35)
 check('No horizontal overflow on desktop',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
 check('No video autoplay',page.locator('video').get_attribute('autoplay') is None)
 page.screenshot(path=str(root/'docs/qa/desktop.png'))
 for cat in ['Olimpíadas','Robótica','Programação','Esportes','Arte','Projetos']:
  page.locator('#conquistas .pf-filters').get_by_role('button',name=cat,exact=True).click()
  check('Filter '+cat,page.locator('.pf-achievement').count()==sum(a['category']==cat for a in data['achievements']))
 page.locator('#conquistas .pf-filters').get_by_role('button',name='Todas',exact=True).click()
 # Dialog: keyboard, return focus, wrap-around, original data discrepancy.
 first=page.locator('.pf-cert-card button').first
 first.evaluate('(el)=>el.scrollIntoView({block:"center",behavior:"instant"})')
 first.click(force=True)
 page.wait_for_selector('dialog[open]')
 check('Certificate representation label',page.locator('dialog').inner_text().find('não é documento oficial')>=0)
 check('Poliedro discrepancy disclosed','bronze em 2024' in page.locator('dialog').inner_text())
 page.keyboard.press('ArrowLeft')
 check('Dialog wraps backwards',page.locator('#pf-dialog-title').inner_text()=='Poliedro · histórico informado')
 page.keyboard.press('ArrowRight')
 check('Dialog wraps forwards','prata no documento' in page.locator('#pf-dialog-title').inner_text())
 page.keyboard.press('Escape')
 check('Escape closes and restores focus',page.locator('dialog').count()==0 and first.evaluate('(el)=>document.activeElement===el'))
 # Verify all provided media URLs, not just currently visible lazy images.
 for item in data['photos']+data['certificates']:
  for field in ['src','thumb']:
   r=context.request.get(base+item[field]); assert r.status==200,(item['id'],field,r.status)
 check('All 82 image URLs load',True)
 # Browser decoder and real advancing playback.
 page.locator('video').evaluate('(v)=>v.load()')
 page.wait_for_function('document.querySelector("video").readyState>=2',timeout=30000)
 page.locator('video').evaluate('(v)=>{v.muted=true;return v.play()}')
 page.wait_for_function('document.querySelector("video").currentTime>0.3',timeout=15000)
 check('FECART video decodes and plays',page.locator('video').evaluate('(v)=>v.videoWidth>0 && !v.error'))
 report['video']=page.locator('video').evaluate('(v)=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight})')
 page.locator('video').evaluate('(v)=>v.pause()')
 page.locator('#certificados').evaluate('(e)=>scrollTo({top:e.offsetTop+420,behavior:"instant"})')
 page.wait_for_timeout(1000)
 page.screenshot(path=str(root/'docs/qa/certificados.png'))
 check('Sticky stacking enabled',page.locator('.pf-cert-card').first.evaluate('(e)=>getComputedStyle(e).position')=='sticky')
 for width,height in [(768,1024),(390,844),(320,740)]:
  page.set_viewport_size({'width':width,'height':height})
  page.evaluate('scrollTo({top:0,behavior:"instant"})')
  check(f'No horizontal overflow at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  if width==390:
   page.screenshot(path=str(root/'docs/qa/mobile.png'))
   page.get_by_role('button',name='Menu +').click()
   page.locator('#pf-nav').get_by_role('link',name='Galeria',exact=True).click()
   check('Mobile menu closes after navigation',page.locator('.pf-menu').get_attribute('aria-expanded')=='false')
 page.emulate_media(reduced_motion='reduce')
 check('Reduced motion disables stacking',page.locator('.pf-cert-card').first.evaluate('(e)=>getComputedStyle(e).position')=='relative')
 check('Reduced motion stops decoration',page.locator('.pf-orbit').evaluate('(e)=>getComputedStyle(e).animationName')=='none')
 # Gallery keyboard open and navigation.
 page.locator('#galeria .pf-filters').get_by_role('button',name='Infância',exact=True).click()
 check('Childhood is separated',page.locator('.pf-gallery-card').count()==4)
 page.locator('.pf-gallery-card').first.focus();page.keyboard.press('Enter')
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

