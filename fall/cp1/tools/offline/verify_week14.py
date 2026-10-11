"""Exercise the Week 14 pipeline, exports and failure paths in disposable folders."""
import contextlib
import csv
import io
import json
import os
import re
import tempfile
import warnings
from pathlib import Path
os.environ['MPLBACKEND'] = 'Agg'
warnings.filterwarnings('ignore', message='FigureCanvasAgg is non-interactive')
import matplotlib.pyplot as plt
R = Path(__file__).resolve().parents[2]
L = json.loads((R/'notebooks/Week_14.ipynb').read_text())['cells']
S = json.loads((R/'solutions/Week_14_Solutions.ipynb').read_text())['cells']

def text(c): return ''.join(c['source'])
def capture(function, *args):
    with contextlib.redirect_stdout(io.StringIO()) as output:
        result = function(*args)
    return result, output.getvalue()
def expected(c): return re.search(r'```(?:text)?\n(.*?)```',text(c),re.S).group(1)
checks = 0

def check(condition):
    global checks
    assert condition
    checks += 1

def rejects(function, *args, error=ValueError):
    try: function(*args)
    except error: check(True)
    else: raise AssertionError((function.__name__,args))

with tempfile.TemporaryDirectory(prefix='cp14_verify_') as folder, contextlib.chdir(folder):
    lesson_ns = {}
    for c in L:
        if c['cell_type']=='code': capture(exec, compile(text(c), '<Week 14 lesson>', 'exec'), lesson_ns)
    ns = {}
    student_indices = [15,20,25,27,30,32,37,40,45,48,53,55]
    for i,c in enumerate(S):
        if c['cell_type']!='code': continue
        _,out = capture(exec, compile(text(c), '<Week 14 solution>', 'exec'), ns)
        ex=(i-1)//3
        assert out==expected(S[i+1])==expected(L[student_indices[ex-1]]), ex
    check([ns['all_stats'][s]['count'] for s in ('temp','humidity','pressure')]==[6,5,4])
    for sensor,mean in [('temp',138.1/6),('humidity',45.38),('pressure',1012.8625)]:
        check(abs(ns['all_stats'][sensor]['mean']-mean)<1e-10)
    stamp='2024-01-15 08:00'
    validate=ns['validate_row']
    for sensor,lo,hi in [('temp',-50,60),('humidity',0,100),('pressure',800,1200)]:
        for value,valid in [(lo,True),(hi,True),(lo-0.1,False),(hi+0.1,False)]:check(validate([stamp,sensor,str(value)])[0] is valid)
    for row,reason in [([], 'expected exactly 3 fields'),([stamp,'temp'],'expected exactly 3 fields'),([stamp,'temp','1','x'],'expected exactly 3 fields'),([stamp,'light','1'],"unknown sensor: 'light'"),([stamp,'temp',' '],'empty value'),([stamp,'temp','nan'],"non-finite value: 'nan'"),([stamp,'temp','inf'],"non-finite value: 'inf'"),([stamp,'temp','-inf'],"non-finite value: '-inf'"),(['2024-02-30 08:00','temp','1'],"invalid timestamp: '2024-02-30 08:00'"),(['2024-1-15 08:00','temp','1'],"invalid timestamp: '2024-1-15 08:00'")]:check(validate(row)==(False,reason))
    check(validate(['2024-02-29 08:00','temp',' -10 '])==(True,'OK'))
    duplicate=[[stamp,'temp','0'],[stamp,'temp','0']]
    clean,bad=ns['clean_records'](duplicate)
    check(clean==duplicate and not bad)
    check(ns['compute_stats'](clean,'temp')=={'count':2,'min':0.0,'max':0.0,'mean':0.0})
    check(ns['compute_stats']([], 'temp')=={'count':0,'min':None,'max':None,'mean':None})
    raw=Path('sensor_data.csv').read_bytes()
    exports=['sensor_data_clean.csv','sensor_rejections.csv','sensor_report.txt']
    first={p:Path(p).read_bytes() for p in exports}
    capture(ns['main']);capture(ns['main'])
    check(Path('sensor_data.csv').read_bytes()==raw)
    check({p:Path(p).read_bytes() for p in exports}==first)
    check('Acceptance rate:  75.0%' in Path('sensor_report.txt').read_text())
    for unit in ['temp (C)','humidity (% RH)','pressure (hPa)']:check(unit in Path('sensor_report.txt').read_text())
    # CSV quoting, blank records, Unicode and multiline fields remain recoverable.
    rows=[[stamp,'temp',' 10 '],[],[stamp,'temp','bad, value\nİç'],[stamp,'temp',' 10 ']]
    with open('changed.csv','w',newline='',encoding='utf-8') as f:
        w=csv.writer(f);w.writerow(['timestamp','sensor','value']);w.writerows(rows)
    check(ns['read_data']('changed.csv')[1]==rows)
    result,_=capture(ns['main'],'changed.csv')
    check(len(result[0])==2 and [x[0] for x in result[1]]==[2,3])
    with open('sensor_rejections.csv',newline='',encoding='utf-8') as f:saved=list(csv.DictReader(f))
    check([json.loads(x['raw_fields_json']) for x in saved]==[rows[1],rows[2]])
    check(ns['read_data']('sensor_data_clean.csv')[1]==[rows[0],rows[3]])
    for content,counts,rate in [('timestamp,sensor,value\n',(0,0),'N/A (no records)'),('timestamp,sensor,value\n2024-01-15 08:00,temp,abc\n',(0,1),'0.0%')]:
        Path('empty_case.csv').write_text(content)
        result,out=capture(ns['main'],'empty_case.csv')
        check((len(result[0]),len(result[1]))==counts)
        report=Path('sensor_report.txt').read_text()
        check('Acceptance rate:  '+rate in report and report.count('min/max/mean: N/A')==3)
        check(ns['read_data']('sensor_data_clean.csv')[1]==[])
    # File-level failures must leave existing exports untouched and not report success.
    before={p:Path(p).read_bytes() for p in exports}
    for name,content in [('wrong.csv','wrong,header\n'),('blank.csv',''),('quotes.csv','timestamp,sensor,value\n"unclosed')]:
        Path(name).write_text(content)
        result,out=capture(ns['main'],name)
        check(result is None and 'Input error:' in out and 'successfully' not in out)
        check({p:Path(p).read_bytes() for p in exports}==before)
    result,out=capture(ns['main'],'does_not_exist.csv')
    check(result is None and 'Input error:' in out)
    rejects(ns['generate_report'],ns['stats_for_all']([]),1,1,1)
    rejects(ns['generate_report'],ns['stats_for_all']([]),1,1,0)
    check(ns['filter_by_time'](duplicate,stamp,stamp)==duplicate)
    check(ns['filter_by_time']([],stamp,stamp)==[])
    rejects(ns['filter_by_time'],[],stamp,'2024-01-14 08:00')
    rejects(ns['filter_by_time'],[],'invalid',stamp)
    capture(ns['plot_sensors'],[],'empty.png')
    capture(ns['plot_sensors'],duplicate,'duplicates.png')
    for name in ['sensor_plot.png','empty.png','duplicates.png']:check(Path(name).read_bytes().startswith(b'\x89PNG\r\n\x1a\n'))
    check(not plt.get_fignums())
    # An output error is not swallowed by the input-error handler.
    Path('sensor_data_clean.csv').unlink();Path('sensor_data_clean.csv').mkdir()
    with contextlib.redirect_stdout(io.StringIO()):
        rejects(ns['main'],error=IsADirectoryError)
print(f'Passed all 12 student/solution outputs and {checks} pipeline, boundary, export and plot checks.')
