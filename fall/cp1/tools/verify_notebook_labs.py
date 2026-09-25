"""Regeneration and semantic checks for notebook-backed Python animations."""
import json
from pathlib import Path
from build_notebook_labs import build, ROOT


def verify():
    regenerated={}
    build(lambda p,s:regenerated.setdefault(p,s))
    for p,s in regenerated.items():
        assert p.read_text()==s, f'Stale animation data: {p}'
    weeks=[json.loads(s.split(' = ',1)[1].rstrip(';\n')) for s in regenerated.values()]
    entries={(w['week'],l['id']):l for w in weeks for l in w['labs']}
    def case(week,lab,index=0):return entries[week,lab]['cases'][index]
    def end(week,lab,index=0):return case(week,lab,index)['frames'][-1]
    expected_errors={(1,'errors',1):'ZeroDivisionError',(1,'errors',2):'TypeError',
                     (2,'convert',1):'ValueError',(2,'convert',2):'ValueError',
                     (3,'logic',2):'ZeroDivisionError',(5,'while',2):'Stopped after',
                     (6,'slices',2):'IndexError',(7,'lookup',2):'KeyError',(10,'global',1):'UnboundLocalError'}
    count=0
    for (week,slug),lab in entries.items():
        for i,c in enumerate(lab['cases']):
            count+=1
            status=c['frames'][-1]['detail']
            if (week,slug,i) in expected_errors:assert status.startswith(expected_errors[week,slug,i]),(week,slug,status)
            else:assert status=='Completed',(week,slug,status)
            assert len(c['frames'])<=151
            for f in c['frames']:
                assert f['line'] is None or 1<=f['line']<=len(c['code'].splitlines())
    assert end(4,'range')['output']=='1\n2\n3\n4\nVisited: [1, 2, 3, 4]\n'
    assert end(4,'range',2)['output']=='Visited: []\n'
    assert end(4,'factorial',1)['output']=='Factorial: 1\n'
    assert end(5,'sentinel')['output']=='Total: 7\nInputs consumed: 3\n'
    assert end(5,'control')['output']=='[2, 3]\n'
    shared=end(6,'alias')['globals'];copied=end(6,'alias',1)['globals']
    assert shared['original']['ref']==shared['analysis']['ref']
    assert copied['original']['ref']!=copied['analysis']['ref']
    assert end(6,'peak-index')['output']=='Total: 16\nAbove limit: 1\nPeak: 9 at index 2\n'
    assert end(6,'peak-index',1)['output']=='Total: -14\nAbove limit: 0\nPeak: -2 at index 1\n'
    assert end(7,'lookup')['output']=="Known keys: ['T1', 'T2']\nget: 1.02\n[]: 1.02\n"
    assert end(7,'lookup',2)['output']=="Known keys: ['T1', 'T2']\nget: None\n"
    assert end(7,'tally')['output']=="{'OK': 3, 'WARN': 1, 'ERR': 1}\n"
    assert end(7,'group')['output']=='T1 [21.5, 21.9]\nT2 [22.0]\nT3 [19.8]\n'
    assert end(7,'tuples',1)['output']=='Peak 25.9 at t = 0\ntuple\n'
    assert end(9,'return')['output']=='7\nStored values: None 7\n'
    assert any([s['name'] for s in f['stack']]==['transform','double'] for f in case(10,'composition')['frames'])
    assert any([s['name'] for s in f['stack']]==['transform','shift'] for f in case(10,'composition')['frames'])
    assert end(11,'handlers',1)['output']=='Cannot divide by zero\nFinished attempt\n'
    assert end(11,'retry',1)['output']=='Accepted: 0\n'
    assert end(12,'file-modes')['files']['log.txt']=='first\nsecond\n'
    assert end(12,'file-modes',1)['files']['log.txt']=='second\n'
    assert end(12,'csv',1)['globals']['parsed']['items'][0]['text']==repr('Demir, Elif')
    assert end(12,'clean-file')['files']['raw.txt']=='20\nbad\n22\n'
    assert end(12,'clean-file')['files']['clean.txt']=='20.0\n22.0\n'
    assert end(13,'rows')['output']=='Rows: 3\nColumns: 3\nRow 1 is [22.3, 21.9, 22.6]\nColumn 2 is [22.4, 22.6, 22.9]\nCell: 22.6\n'
    assert end(13,'mask',1)['output']=='Mask: [False, False, True, False]\nAbove limit: 1\nSelected: [4.1]\n'
    assert end(13,'trapezoid',1)['output']=='Step 0 area: 2.0\nStep 1 area: 2.0\nDistance: 4.0\n'
    assert end(14,'validate-project')['output']=='Retained: 2 Rejected: 1\n'
    assert end(14,'report-project')['files']['report.txt']=='Retained: 2; rejected: 1; retained rate: 66.7%'
    assert end(14,'report-project',2)['files']['clean.csv']=='timestamp,sensor,value\n'
    print(f'PASS: {len(entries)} notebook mappings, {count} reproducible traces; loop, aliasing, stack, error, CSV and pipeline semantics.')

if __name__=='__main__':verify()
