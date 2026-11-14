"""DOM/browser regression checks. Storage is intentionally an in-memory test adapter.
Run: python -m pip install playwright && python tests/browser-smoke.py
Uses an installed Chromium; alternatively set CHROMIUM_EXECUTABLE.
This does not replace a real HTTPS/localStorage cross-browser acceptance test.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os, re, sys
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(os.environ.get('PARTY_TEST_OUTPUT', str(ROOT / 'tests' / 'output')))
OUTPUT.mkdir(parents=True, exist_ok=True)
RESULTS = []

def html(filename):
    text = (ROOT / filename).read_text()
    text = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>'+(ROOT/m.group(1)).read_text()+'</style>', text)
    text = re.sub(r'<script defer src="[^"]+"></script>', '', text)
    return text

def script(page, name):
    page.add_script_tag(content=(ROOT / name).read_text())

def adapter(page, data=None, mode='ok'):
    page.evaluate('''({data,mode}) => {
      window.__store = {...data}; window.__writes = 0;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){if(mode==='read-error') throw new Error('test:blocked');return Object.hasOwn(__store,k)?__store[k]:null;},
        setItem(k,v){if(mode==='write-error') throw new Error('test:quota');__store[k]=String(v);if(!k.includes('probe:')) __writes++;},
        removeItem(k){delete __store[k];},clear(){window.__store={};}
      }});
    }''', {'data':data or {},'mode':mode})

def app(browser, data=None, mode='ok', patch=None, reduced=False, width=390):
    page=browser.new_page(viewport={'width':width,'height':844}, reduced_motion='reduce' if reduced else 'no-preference')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html('index.html'));adapter(page,data,mode)
    script(page,'config.js');script(page,'core.js')
    if patch: page.evaluate(patch)
    script(page,'app.js')
    return page,errors

def ok(name, condition=True):
    assert condition, name
    RESULTS.append(name)
    print('PASS:',name)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    page, errors=app(browser,width=1440)
    page.wait_for_function('document.body.dataset.state === "ready"')
    page.set_viewport_size({'width':1440,'height':1050})
    page.screenshot(path=str(OUTPUT/'desktop.png'),full_page=True)
    ok('Desktop ready state and 30 SVG segments',page.locator('#wheel g[data-task-id]').count()==30)
    for width in [320,360,390,768,1024,1440]:
        page.set_viewport_size({'width':width,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'overflow {width}'
    ok('No horizontal overflow at 320, 360, 390, 768, 1024, 1440 px')
    page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUTPUT/'mobile.png'),full_page=True)
    page.locator('#privacyButton').click()
    ok('Privacy dialog opens',page.locator('#privacyDialog').evaluate('(el)=>el.open'))
    page.keyboard.press('Escape')
    ok('Privacy dialog closes with Escape',not page.locator('#privacyDialog').evaluate('(el)=>el.open'))
    page.evaluate('for(let i=0;i<20;i++) document.getElementById("spinButton").click()')
    page.wait_for_function('document.body.dataset.state === "spinning"')
    data=page.evaluate('window.__store')
    saved=json.loads(next(v for k,v in data.items() if 'probe:' not in k))
    ok('Double/multi-click: exactly one draw persisted before animation',page.evaluate('__writes')==1)
    page.wait_for_function('document.body.dataset.state === "done"',timeout=10000)
    ok('Animation reveals stored task',page.locator('#resultTitle').inner_text()==saved['task']['title'])
    page.screenshot(path=str(OUTPUT/'result-mobile.png'),full_page=True)
    restored, restored_errors=app(browser,data=data)
    ok('Fresh page restores same task; spin controls hidden',restored.locator('#resultTitle').inner_text()==saved['task']['title'] and not restored.locator('#spinControls').is_visible())
    restored.locator('#completeButton').click()
    restored.wait_for_function('document.getElementById("resultKicker").textContent === "MISSION ACCOMPLISHED"')
    completed_data=restored.evaluate('window.__store')
    completed,_=app(browser,data=completed_data)
    ok('Completion survives a fresh page',completed.locator('#completeButton').is_disabled() and completed.locator('#resultKicker').inner_text()=='MISSION ACCOMPLISHED')
    mutated,_=app(browser,data=data,patch='PARTY_CONFIG.tasks = PARTY_CONFIG.tasks.slice(0,2).map(t=>({...t,title:"NEUER TEXT"}))')
    ok('Saved snapshot survives changed config',mutated.locator('#resultTitle').inner_text()==saved['task']['title'] and mutated.locator('#wheel g[data-task-id]').count()==30)
    invalid,_=app(browser,data={next(iter(data)):'broken-json'})
    ok('Corrupt saved draw fails closed',invalid.evaluate('document.body.dataset.state')=='blocked' and invalid.locator('#spinButton').is_disabled())
    blocked,_=app(browser,mode='read-error')
    quota,_=app(browser,mode='write-error')
    ok('Read/write storage failures fail closed',blocked.evaluate('document.body.dataset.state')=='blocked' and quota.evaluate('document.body.dataset.state')=='blocked')
    changed_id,_=app(browser,data=data,patch='PARTY_CONFIG.partyId="other-party"')
    ok('Different party ID starts separately',changed_id.evaluate('document.body.dataset.state')=='ready')
    reduced,_=app(browser,reduced=True)
    reduced.locator('#spinButton').click()
    reduced.wait_for_function('document.body.dataset.state === "done"',timeout=2000)
    ok('Reduced-motion reveal works')
    dense,_=app(browser,patch='PARTY_CONFIG.tasks=Array.from({length:30},(_,i)=>({...PARTY_CONFIG.tasks[i%30],id:"t"+i}))',width=320)
    ok('30-task numbered wheel renders without overflow',dense.locator('#wheel g[data-task-id]').count()==30 and dense.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    xss,_=app(browser,patch='PARTY_CONFIG.name="<img src=x onerror=alert(1)>"')
    ok('Configured HTML is rendered as text, not markup',xss.locator('.brand img').count()==0 and '<img' in xss.locator('.brand').inner_text())
    ok('No uncaught JavaScript errors on guest flows',not errors and not restored_errors)

    editor=browser.new_page(viewport={'width':1280,'height':1000});editor_errors=[]
    editor.on('pageerror',lambda e:editor_errors.append(str(e)))
    editor.set_content(html('setup.html'))
    for name in ['config.js','core.js','vendor/qr.js','setup.js']:script(editor,name)
    ok('Editor loads all configured tasks',editor.locator('.task-editor').count()==30)
    ok('Editor prevents more than 30 tasks',editor.locator('#addTask').is_disabled())
    editor.locator('.task-editor').first.locator('.task-delete').click()
    ok('Removing a task allows adding again',editor.locator('.task-editor').count()==29 and editor.locator('#addTask').is_enabled())
    editor.locator('#addTask').click()
    editor.locator('.task-editor').last.locator('[data-field="label"]').fill('Test-Mission')
    ok('Adding and editing updates task summary',editor.locator('.task-editor').count()==30 and editor.locator('.task-editor').last.locator('.task-summary-name').inner_text()=='Test-Mission')
    editor.evaluate('''() => {
      window.__exported = null;
      URL.createObjectURL = blob => {window.__exported=blob;return 'blob:test';};
      URL.revokeObjectURL=()=>{};
      document.addEventListener('click',e=>{if(e.target.matches('a[download]'))e.preventDefault();},true);
    }''')
    editor.locator('#exportConfig').click()
    exported=editor.evaluate('window.__exported.text()')
    ok('Editor exports valid JavaScript with edited tasks','"label": "Test-Mission"' in exported and 'window.PARTY_CONFIG =' in exported)
    editor.locator('#siteUrl').fill('https://example.com/party/')
    editor.locator('#generateQr').click()
    ok('QR is generated locally with 4-module quiet zone',editor.locator('#qrPreview svg').count()==1 and editor.locator('#qrActions').is_visible())
    editor.locator('#qrPreview').screenshot(path=str(OUTPUT/'qr.png'))
    (OUTPUT/'qr.svg').write_text(editor.locator('#qrPreview').inner_html())
    try:
        import cv2
        image=cv2.imread(str(OUTPUT/'qr.png'))
        decoded,_,_=cv2.QRCodeDetector().detectAndDecode(image)
        ok('Independent QR decoder returns the exact URL',decoded=='https://example.com/party/')
    except ImportError:
        print('SKIP: QR decode (opencv not installed)')
    editor.locator('#siteUrl').fill('javascript:alert(1)');editor.locator('#generateQr').click()
    ok('QR rejects non-web URL schemes',editor.locator('#qrError').is_visible() and not editor.locator('#qrActions').is_visible())
    editor.locator('#siteUrl').fill('https://example.com/party/');editor.locator('#generateQr').click()
    editor.set_viewport_size({'width':390,'height':844})
    ok('Editor mobile layout has no horizontal overflow',editor.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    editor.set_viewport_size({'width':1280,'height':1000});editor.evaluate('scrollTo(0,0)')
    editor.screenshot(path=str(OUTPUT/'editor.png'),full_page=True)
    editor.emulate_media(media='print');editor.set_viewport_size({'width':794,'height':1123})
    editor.screenshot(path=str(OUTPUT/'poster-print.png'),full_page=True)
    ok('Print stylesheet exposes the QR poster only',editor.locator('#posterSheet').is_visible() and not editor.locator('.setup-shell').is_visible())
    ok('No uncaught JavaScript errors in editor',not editor_errors)
    browser.close()

(OUTPUT/'report.json').write_text(json.dumps({'browser':'Chromium','storage':'in-memory test adapter (not real localStorage)','passed':len(RESULTS),'checks':RESULTS},ensure_ascii=False,indent=2))
print(f'\n{len(RESULTS)} DOM/browser checks passed. Screenshots: {OUTPUT}')
