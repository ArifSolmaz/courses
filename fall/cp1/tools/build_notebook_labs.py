"""Record real Python traces for the curated notebook animation catalogue."""
from pathlib import Path
import contextlib
import importlib.util
import io
import json
import os
import sys
import tempfile
import types

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('notebook_labs', ROOT/'lessons/notebook_labs.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
LABS = module.LABS

class TraceLimit(Exception):
    pass

def record(code):
    """Only executes repository-authored examples, in a disposable directory."""
    filename = '<cp1-animation>'
    compiled = compile(code, filename, 'exec')
    output = io.StringIO()
    frames = []
    retained = []
    refs = {}
    pending_errors = {}
    namespace = {'__name__': '__main__'}
    def value(v, depth=0):
        kind = type(v).__name__
        if isinstance(v, (str, int, float, bool)) or v is None:
            return {'type':kind, 'text':repr(v)}
        if isinstance(v, (list, dict, tuple)):
            if id(v) not in refs:
                retained.append(v)
                refs[id(v)] = f'object {len(refs)+1}'
            result = {'type':kind, 'ref':refs[id(v)]}
            if depth < 4:
                result['items'] = ([{'key':str(k), 'value':value(x,depth+1)} for k,x in v.items()]
                                   if isinstance(v,dict) else [value(x,depth+1) for x in v])
            return result
        if isinstance(v, types.FunctionType):
            return {'type':'function','text':v.__name__+'(…)'}
        if isinstance(v, BaseException):
            return {'type':kind,'text':str(v)}
        if isinstance(v, io.IOBase):
            if v.closed:
                state='closed'
            else:
                try: state=f'open · cursor {v.tell()}'
                except OSError: state='open · line iteration'
            return {'type':'file','text':f'{Path(v.name).name} · {state}'}
        return {'type':kind, 'text':kind}
    def visible(scope):
        return {k:value(v) for k,v in scope.items() if not k.startswith('__') and not isinstance(v,types.ModuleType)}
    def snapshot(frame, event, arg):
        if frame.f_code.co_filename != filename:
            return snapshot
        if event not in ('line','call','return','exception'):
            return snapshot
        if len(frames) >= 150:
            raise TraceLimit('Stopped after 150 steps: execution has not finished. Check whether the loop makes progress.')
        stack=[]
        cursor=frame
        while cursor and cursor.f_code.co_filename == filename:
            if cursor.f_code.co_name != '<module>':
                stack.append({'name':cursor.f_code.co_name,'values':visible(cursor.f_locals)})
            cursor=cursor.f_back
        item={'line':frame.f_lineno or None,'event':event,'globals':visible(namespace),
              'stack':list(reversed(stack)),'output':output.getvalue(),
              'files':{p.name:p.read_text() for p in sorted(Path('.').iterdir()) if p.is_file()}}
        if event=='line': pending_errors.pop(id(frame),None)
        if event=='return':
            item['detail'] = ('Unwinding after '+pending_errors.pop(id(frame)) if id(frame) in pending_errors
                              else 'Notebook execution finished' if frame.f_code.co_name=='<module>' else 'Return '+repr(arg))
        if event=='exception':
            item['detail']=arg[0].__name__+': '+str(arg[1])
            pending_errors[id(frame)]=arg[0].__name__
        frames.append(item)
        return snapshot
    old = Path.cwd()
    with tempfile.TemporaryDirectory(prefix='cp1-trace-') as directory:
        os.chdir(directory)
        try:
            with contextlib.redirect_stdout(output):
                try:
                    sys.settrace(snapshot)
                    exec(compiled,namespace)
                    status='Completed'
                except TraceLimit as error:
                    status=str(error)
                except Exception as error:
                    status=f'{type(error).__name__}: {error}'
                finally:
                    sys.settrace(None)
            final={'line':None,'event':'end','detail':status,'globals':visible(namespace),'stack':[],
                   'output':output.getvalue(),'files':{p.name:p.read_text() for p in sorted(Path('.').iterdir()) if p.is_file()}}
            frames.append(final)
        finally:
            os.chdir(old)
    return frames

def build(write=None):
    if write is None:
        def write(path,text):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    manifest=json.loads((ROOT/'course_manifest.json').read_text())
    total_cases=0
    for week in manifest['weeks']:
        number=week['week']
        records=[]
        for lab in [l for l in LABS if l['week']==number]:
            assert lab['exercise'] in [e['id'] for e in week['exercises']],lab['id']
            # Tie the animation to actual notebook section numbers, not the engineering intro.
            nb=json.loads((ROOT/week['notebook']).read_text())
            headings=[''.join(c['source']).splitlines() for c in nb['cells'] if c['cell_type']=='markdown']
            headings=[line for cell in headings for line in cell if line.startswith('## Part ')]
            sections=[]
            for part in lab['parts']:
                matching=[h for h in headings if h.startswith(f'## Part {part}:')]
                assert len(matching)==1,(number,part)
                sections.append(matching[0].removeprefix('## ').replace('`',''))
            entry={k:v for k,v in lab.items() if k not in ('cases','code','parts')}
            entry['sections']=sections
            entry['cases']=[]
            for case in lab['cases']:
                code='\n'.join(f'{name} = {value!r}' for name,value in case['inputs'].items())+'\n\n'+lab['code']+'\n'
                trace=record(code)
                entry['cases'].append({'label':case['label'],'code':code,'frames':trace})
                total_cases+=1
            records.append(entry)
        assert len(records)==4,number
        data={'week':number,'title':week['title'],'labs':records}
        text='window.CP1_NOTEBOOK_LABS = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n'
        write(ROOT/'web/lab-data'/f'week-{number:02d}.js',text)
    print(f'Built {len(LABS)} notebook walkthroughs, {total_cases} Python execution traces.')

if __name__=='__main__':
    build()
