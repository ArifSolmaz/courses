"""Bundle the same verified Python runtime and worker used by CP1, loaded on demand."""
import sys,json,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
CP=ROOT/'fall/cp1/tools/offline'
sys.path.insert(0,str(CP))
from build import read_assets
cache=Path('/tmp/cp1-offline-pilot');cache.mkdir(exist_ok=True)
a=read_assets(cache)
data={'files':{n:base64.b64encode(a[n]).decode() for n in ('pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json')},'worker':a['pyodide.js'].decode()+'\n'+a['pyodide.asm.js'].decode()+'\n'+(CP/'worker.js').read_text()}
(ROOT/'aa/assets/python-runtime.js').write_text('window.AA_PYTHON_RUNTIME='+json.dumps(data)+';\n')
(ROOT/'aa/assets/python-runtime-LICENSE.txt').write_text('\n\n'.join(n+'\n'+v.decode() for n,v in a.items() if n.startswith('LICENSE-')))
