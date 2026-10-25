"""Confirm GitHub Pages serves the exact fourteen audited self-contained HTML files."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parents[2]

def check(week,base):
    filename=f'CP1_Week_{week:02d}_Offline.html'
    expected=hashlib.sha256((ROOT/'offline'/filename).read_bytes()).hexdigest()
    digest=hashlib.sha256();size=0
    request=Request(base.rstrip('/')+'/'+filename,headers={'Cache-Control':'no-cache','Accept-Encoding':'identity'})
    with urlopen(request,timeout=60) as response:
        assert response.status==200,(week,response.status)
        while chunk:=response.read(1024*1024):
            digest.update(chunk);size+=len(chunk)
    actual=digest.hexdigest()
    assert actual==expected,(week,'Published HTML differs from audited build',expected,actual)
    return dict(week=week,status='pass',bytes=size,sha256=actual)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--base-url',default='https://arifsolmaz.github.io/courses/fall/cp1/offline')
    parser.add_argument('--json',type=Path)
    args=parser.parse_args()
    with ThreadPoolExecutor(max_workers=3) as pool:
        results=list(pool.map(lambda week:check(week,args.base_url),range(1,15)))
    for row in results:print(f'Week {row["week"]:02d}: public HTML matches audited local build ({row["bytes"]} bytes).')
    if args.json:args.json.write_text(json.dumps(results,indent=2)+'\n')
