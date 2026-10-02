"""Build self-contained CP1 HTML notebooks; only this maintainer build needs internet."""
import argparse,base64,hashlib,json,html,re
from pathlib import Path
from urllib.request import urlopen
from content import prepare
HERE=Path(__file__).resolve().parent
CP1=HERE.parents[1]

def js(value):return json.dumps(value,ensure_ascii=True).replace('</','<\\/')

def read_assets(cache,scientific=False):
    manifest=json.loads((HERE/'assets.json').read_text())
    if scientific:manifest.update(json.loads((HERE/'science-assets.json').read_text()))
    assets={}
    for name,item in manifest.items():
        dest=cache/name
        if not dest.exists():
            with urlopen(item['url']) as response:dest.write_bytes(response.read())
        raw=dest.read_bytes()
        if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Asset hash mismatch: '+name)
        assets[name]=raw
    return assets

def build(week,assets):
    scientific=week in [13,14]
    files={n:base64.b64encode(v).decode() for n,v in assets.items() if n in ['pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'] or (scientific and n.endswith('.whl'))}
    worker=assets['pyodide.js'].decode()+'\n'+assets['pyodide.asm.js'].decode()+'\n'+(HERE/'worker.js').read_text()
    nb,lesson_count=prepare(week,CP1)
    config={'week':week,'filename':f'CP1_Week_{week:02d}_Offline.html','saveName':f'CP1_Week_{week:02d}_my_work.ipynb','lessonCells':lesson_count,'packages':['numpy','matplotlib'] if scientific else [],'plotSetup':(HERE/'plot_setup.py').read_text() if scientific else ''}
    title=''.join(nb['cells'][0]['source']).splitlines()[0].lstrip('# ').split(' — PHASE')[0]
    title=re.sub(r'^(?:CP1 )?Week \d+:\s*','',title)
    page=(HERE/'template.html').read_text()
    page=page.replace('{{WEEK}}',f'{week:02d}').replace('{{TITLE}}',html.escape(title)).replace('{{COVERAGE}}',f'The complete Week {week:02d} lesson, exercises and worked solutions are included below.')
    scope='Includes Python and its bundled standard library'+(', NumPy and Matplotlib.' if scientific else '.')+' Notebook widgets and Colab services are not included. External links require internet. This file still needs a compatibility trial on your managed classroom PCs.'
    page=page.replace('{{SCOPE}}',scope)
    replacements={'CONFIG':js(config),'MARKED':assets['marked.js'].decode(),'PURIFY':assets['purify.js'].decode(),'NOTEBOOK':js(nb),'FILES':js(files),'WORKER':js(worker),'LICENSES':js('\n\n'.join(n+'\n'+v.decode() for n,v in assets.items() if n.startswith('LICENSE-'))),'APP':(HERE/'errors.js').read_text()+'\n'+(HERE/'app.js').read_text()}
    for key,value in replacements.items():page=page.replace('/*'+key+'*/',value)
    out=CP1/'offline'/config['filename'];out.parent.mkdir(exist_ok=True);out.write_text(page)
    print(f'Week {week:02d}: {out.stat().st_size/1e6:.1f} MB, {lesson_count} lesson + {len(nb["cells"])-lesson_count} solution cells')

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--week',type=int,choices=range(1,15),default=1);ap.add_argument('--all',action='store_true');ap.add_argument('--cache',type=Path,default=Path('/tmp/cp1-offline-pilot'));args=ap.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
    weeks=list(range(1,15)) if args.all else [args.week]
    assets=read_assets(args.cache,any(w in [13,14] for w in weeks))
    for week in weeks:build(week,assets)
if __name__=='__main__':main()
