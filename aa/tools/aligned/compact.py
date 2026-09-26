"""One dashboard and one reading surface per week; old addresses are redirects."""
from pathlib import Path
from html import escape as E, unescape
import re
ROOT=Path(__file__).resolve().parents[2]
OLD_TO_NEW={1:1,2:1,3:3,4:4,5:2,6:2,7:3,8:2,9:5,10:4,11:5,12:5,13:7,14:14}

def animation_content(n):
 items=[];modules=set()
 for old,target in OLD_TO_NEW.items():
  text=(ROOT/f'tools/weeks/w{old:02}.html').read_text()
  for m in re.finditer(r'<details[^>]*class="[^"]*anim-wrap[^"]*"[^>]*>\s*<summary>(.*?)</summary>\s*<div[^>]*data-anim="([^"]+)"[^>]*></div>\s*</details>',text,re.S):
   chosen={'w13-insertion':3,'w13-bubble-paper':3,'w13-stability':8}.get(m[2],target)
   if chosen!=n:continue
   title=unescape(re.sub('<[^>]+>','',m[1]).replace('Animate it — ',''))
   items.append((m[2],title,f'<div class="widget anim" data-anim="{m[2]}"></div>'))
   modules.add(old)
 if n==1:
  from learning_path import sections
  stories=[s for s in sections((ROOT/'tools/weeks/w01.html').read_text()) if 'story-lesson' in s]
  items=[('robot','Robot tour',stories[0]),('film','Movie-star scheduling',stories[1])]+items
 # Hook: demonstrations authored later drop in per week without editing this module.
 from .animations_extra import ANIMATIONS_EXTRA
 extra=list(ANIMATIONS_EXTRA.get(n,[]))
 items+=[(slug,title,body) for slug,title,body,_ in extra]
 if not items:return '', ''
 options=''.join(f'<option value="{i}">{E(title)}</option>' for i,(_,title,_) in enumerate(items))
 panels=''.join(f'<div class="animation-panel" data-animation-panel="{i}" data-animation-title="{E(title)}"'+(' hidden' if i else '')+'>'+body+'</div>' for i,(_,title,body) in enumerate(items))
 content=(f'<section class="anim-workspace" id="animations" aria-labelledby="animations-title">'
  f'<div class="anim-toolbar"><h2 id="animations-title">Animations <span class="anim-count-label"><b data-anim-index>1</b> / {len(items)}</span></h2>'
  f'<div class="anim-pick"><button type="button" class="anim-nav" data-anim-prev aria-label="Previous animation">&#8249;</button>'
  f'<label class="visually-hidden" for="animation-choice">Choose a demonstration</label><select id="animation-choice">{options}</select>'
  f'<button type="button" class="anim-nav" data-anim-next aria-label="Next animation">&#8250;</button></div>'
  f'<div class="anim-tools"><label class="anim-zoom">Zoom <select data-anim-zoom aria-label="Zoom"><option value="auto">Auto fit</option><option value="1">100%</option><option value="0.85">85%</option><option value="0.7">70%</option></select></label>'
  f'<button type="button" class="anim-expand" data-anim-expand aria-expanded="false">Expand &#8599;</button></div></div>'
  f'<div class="anim-stage" tabindex="0" aria-label="Animation stage">{panels}</div>'
  f'<p class="anim-hint">Each demonstration states its own input and code. Check its loop bounds before comparing counts with the worked example. Expand fills the screen and hides the toolbar: move the mouse to the top edge to bring it back, PageUp/PageDown switch demonstrations, Escape returns.</p></section>')
 assets='<link rel="stylesheet" href="../assets/anim.css"><script defer src="../assets/anim.js?v=16"></script>'
 for old in sorted(modules):
  if old>1:assets+=f'<link rel="stylesheet" href="../assets/anim-w{old}.css"><script defer src="../assets/anim-w{old}.js?v=10"></script>'
 if n==1:assets+='<link rel="stylesheet" href="../assets/week1-stories.css"><script defer src="../assets/week1-stories.js?v=1"></script>'
 for _,_,_,extra_assets in extra:
  if extra_assets and extra_assets not in assets:assets+=extra_assets
 return content,assets

STUB=('<!doctype html><html lang="en"><head><meta charset="utf-8">'
 '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
 '<meta http-equiv="refresh" content="0;url={destination}">'
 '<title>{title}</title><link rel="canonical" href="{destination}">'
 '<style>:root{{color-scheme:dark light}}'
 'body{{margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem;text-align:center;'
 'background:#081018;color:#dce5e2;font:400 1rem/1.7 Manrope,system-ui,-apple-system,sans-serif}}'
 'p{{max-width:44ch;margin:0 0 1.4rem}}'
 'a{{display:inline-block;padding:.6rem 1.25rem;border:1px solid #ff9e80;border-radius:999px;'
 'color:#ff9e80;text-decoration:none;font-weight:600}}'
 '@media(prefers-color-scheme:light){{body{{background:#f2f1eb;color:#263633}}'
 'a{{color:#b64f32;border-color:#b64f32}}}}'
 '</style></head><body><main><p>{message}</p><a href="{destination}">{link}</a></main></body></html>')

def redirect(path,destination,message='This material is now inside its weekly lesson.',
             link='Open the lesson',title='AA weekly lesson'):
 """An old address. The refresh fires immediately, so this page is only ever
 seen on a slow connection or with scripting restrictions - it carries its own
 styling inline rather than pulling the site stylesheets for one line of text."""
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(STUB.format(destination=destination,message=message,link=link,title=title))

def consolidate_routes():
 import os
 for parent in ('python','guide'):
  for path in (ROOT/parent).rglob('index.html'):
   m=re.search(r'/w(\d+)/',path.as_posix())
   if m:
    old=int(m[1]);week=OLD_TO_NEW[old] if parent=='python' else old
    target=ROOT/f'w{week}/index.html'
   else:target=ROOT/'index.html'
   redirect(path,os.path.relpath(target,path.parent)+('#notes' if m else ''))
 for route,week in [('extensions',8),('skiena',2),('engineering',14)]:
  redirect(ROOT/route/'index.html',f'../w{week}/#notes')
