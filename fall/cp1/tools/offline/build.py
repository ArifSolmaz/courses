"""Build the standalone CP1 notebooks; only the maintainer's build needs internet."""
import argparse, base64, hashlib, json
from pathlib import Path
from urllib.request import urlopen
HERE=Path(__file__).resolve().parent
CP1=HERE.parents[1]

def js(value):
    return json.dumps(value,ensure_ascii=True).replace('</','<\\/')

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--week',type=int,choices=[1,3],default=1);ap.add_argument('--cache',type=Path,default=Path('/tmp/cp1-offline-pilot'));args=ap.parse_args()
    args.cache.mkdir(parents=True,exist_ok=True)
    manifest=json.loads((HERE/'assets.json').read_text())
    assets={}
    for name,item in manifest.items():
        dest=args.cache/name
        if not dest.exists():
            with urlopen(item['url']) as response:dest.write_bytes(response.read())
        raw=dest.read_bytes()
        if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Asset hash mismatch: '+name)
        assets[name]=raw
    files={n:base64.b64encode(assets[n]).decode() for n in ['pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json']}
    worker=assets['pyodide.js'].decode()+'\n'+assets['pyodide.asm.js'].decode()+'\n'+(HERE/'worker.js').read_text()
    week=args.week
    nb=json.loads((CP1/f'notebooks/Week_{week:02d}.ipynb').read_text())
    if week==3:
        from week03 import complete_week
        nb=complete_week(nb,CP1)
    config={'week':week,'filename':f'CP1_Week_{week:02d}_Offline.html','saveName':f'CP1_Week_{week:02d}_my_work.ipynb'}
    nb['metadata']['cp1_offline_week']=week
    for cell in nb['cells']:
        if isinstance(cell['source'],str):cell['source']=cell['source'].splitlines(keepends=True)
        if cell['cell_type']=='code':cell['outputs']=[];cell['execution_count']=None
    html=(HERE/'template.html').read_text()
    if week==3:
        html=html.replace('Week 01','Week 03').replace('Week‑1','Week‑3').replace('Offline pilot','Offline notebook').replace('Offline pilot ·','Offline notebook ·').replace('Pilot scope &amp; help','Scope &amp; help').replace('Your notebook. No classroom internet.','Conditionals &amp; decision making').replace('The lesson below is the existing Week‑3 notebook.', 'The complete Week‑3 lesson, 12 exercises, the bridge exercise and their worked solutions are included below. Solutions run in a separate Python namespace, so they do not fill in variables in your practice.').replace('This pilot has not been tested on your managed classroom PCs.','This file has not been tested on your managed classroom PCs.')
    replacements={'CONFIG':js(config),'MARKED':assets['marked.js'].decode(),'PURIFY':assets['purify.js'].decode(),'NOTEBOOK':js(nb),'FILES':js(files),'WORKER':js(worker),'LICENSES':js('\n\n'.join(n+'\n'+v.decode() for n,v in assets.items() if n.startswith('LICENSE-'))),'APP':(HERE/'errors.js').read_text()+'\n'+(HERE/'app.js').read_text()}
    for key,value in replacements.items():html=html.replace('/*'+key+'*/',value)
    out=CP1/'offline'/config['filename'];out.parent.mkdir(exist_ok=True);out.write_text(html)
    print(f'{out}: {out.stat().st_size/1e6:.1f} MB, {len(nb["cells"])} cells')
if __name__=='__main__':main()
