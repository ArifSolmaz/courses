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
                     (7,'slices',2):'IndexError',(11,'global',1):'UnboundLocalError'}
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
    assert end(6,'extremes',1)['output']=='Min, max: -9 -2\n'
    assert end(6,'extremes',2)['output']=='Min, max: -9 0\n'
    shared=end(7,'alias')['globals'];copied=end(7,'alias',1)['globals']
    assert shared['original']['ref']==shared['analysis']['ref']
    assert copied['original']['ref']!=copied['analysis']['ref']
    assert end(8,'transpose')['output']=='[[1, 4], [2, 5], [3, 6]]\n'
    rows=end(8,'rows',1)['globals']['grid']['items'];assert len({r['ref'] for r in rows})==1
    assert end(10,'return')['output']=='7\nStored values: None 7\n'
    assert any([s['name'] for s in f['stack']]==['transform','double'] for f in case(11,'composition')['frames'])
    assert any([s['name'] for s in f['stack']]==['transform','shift'] for f in case(11,'composition')['frames'])
    assert end(12,'handlers',1)['output']=='Cannot divide by zero\nFinished attempt\n'
    assert end(12,'retry',1)['output']=='Accepted: 0\n'
    assert end(13,'file-modes')['files']['log.txt']=='first\nsecond\n'
    assert end(13,'file-modes',1)['files']['log.txt']=='second\n'
    assert end(13,'csv',1)['globals']['parsed']['items'][0]['text']==repr('Demir, Elif')
    assert end(13,'clean-file')['files']['raw.txt']=='20\nbad\n22\n'
    assert end(13,'clean-file')['files']['clean.txt']=='20.0\n22.0\n'
    assert end(14,'validate-project')['output']=='Retained: 2 Rejected: 1\n'
    assert end(14,'report-project')['files']['report.txt']=='Retained: 2; rejected: 1; retained rate: 66.7%'
    assert end(14,'report-project',2)['files']['clean.csv']=='timestamp,sensor,value\n'
    print(f'PASS: {len(entries)} notebook mappings, {count} reproducible traces; loop, aliasing, stack, error, CSV and pipeline semantics.')

if __name__=='__main__':verify()
