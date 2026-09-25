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
 content='<details class="animation-drawer"><summary>Explore the animations</summary><p>Each demonstration states its own input and code. Check its loop bounds before comparing counts with the worked example.</p><label for="animation-choice">Choose a demonstration</label><select id="animation-choice">'+options+'</select>'+''.join(f'<div class="animation-panel" data-animation-panel="{i}"'+(' hidden' if i else '')+'>'+body+'</div>' for i,(_,_,body) in enumerate(items))+'</details>'
 assets='<link rel="stylesheet" href="../assets/anim.css"><script defer src="../assets/anim.js?v=14"></script>'
 for old in sorted(modules):
  if old>1:assets+=f'<link rel="stylesheet" href="../assets/anim-w{old}.css"><script defer src="../assets/anim-w{old}.js?v=10"></script>'
 if n==1:assets+='<link rel="stylesheet" href="../assets/week1-stories.css"><script defer src="../assets/week1-stories.js?v=1"></script>'
 for _,_,_,extra_assets in extra:
  if extra_assets and extra_assets not in assets:assets+=extra_assets
 return content,assets

def redirect(path,destination):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="refresh" content="0;url={destination}"><title>AA weekly lesson</title><link rel="canonical" href="{destination}"><p>This material is now inside its weekly lesson. <a href="{destination}">Open the lesson</a>.</p></html>')

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
