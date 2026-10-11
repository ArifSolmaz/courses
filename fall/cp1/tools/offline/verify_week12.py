"""Verify Week 12 outputs and real file behavior in disposable directories."""
import contextlib
import csv
import io
import json
import re
import tempfile
from pathlib import Path
R=Path(__file__).resolve().parents[2]
L=json.loads((R/'notebooks/Week_12.ipynb').read_text())['cells']
S=json.loads((R/'solutions/Week_12_Solutions.ipynb').read_text())['cells']

def execute(c, ns):
    with contextlib.redirect_stdout(io.StringIO()) as out:
        exec(compile(''.join(c['source']), '<Week 12>', 'exec'), ns)
    return out.getvalue()

def expected(c):
    return re.search(r'\*\*Expected output:\*\*\s*```text\n(.*?)```',''.join(c['source']),re.S).group(1)

checks=0
with tempfile.TemporaryDirectory(prefix='cp1_files_test_') as folder, contextlib.chdir(folder):
    ns={}
    for c in L:
        if c['cell_type']=='code':execute(c,ns)
    raw=Path('sensor_raw.csv').read_bytes()
    accepted,rejected=ns['read_sensor_rows']('sensor_raw.csv')
    assert accepted==[['Arm, left',0.0],['Arm, right',-12.5]];checks+=1
    assert [r[0] for r in rejected]==[4,5,6,7];checks+=1
    export=next(c for c in L if c['cell_type']=='code' and 'json.dumps(fields' in ''.join(c['source']))
    execute(export,ns);execute(export,ns)
    assert Path('sensor_raw.csv').read_bytes()==raw;checks+=1
    with open('sensor_clean.csv',newline='',encoding='utf-8') as f:rows=list(csv.reader(f))
    assert len(rows)==3 and rows.count(['sensor','temperature_c'])==1;checks+=1
    with open('sensor_rejections.csv',newline='',encoding='utf-8') as f:rows=list(csv.reader(f))
    assert [int(r[0]) for r in rows[1:]]==[4,5,6,7];checks+=1
    assert json.loads(rows[1][1])==['Motor','ERROR'];checks+=1
    # Quoted commas, newlines and Turkish text must survive intact.
    with open('changed.csv','w',newline='',encoding='utf-8') as f:
        csv.writer(f).writerows([['sensor','temperature_c'],['İç, sol\nkol','-50'],['Upper','60'],['bad','nan'],['Outside','60.1']])
    good,bad=ns['read_sensor_rows']('changed.csv')
    assert good==[['İç, sol\nkol',-50.0],['Upper',60.0]];checks+=1
    assert [r[0] for r in bad]==[5,6];checks+=1
    for text,valid,error_count in [('sensor,temperature_c\n',[],0),('sensor,temperature_c\nA,0\n',[['A',0.0]],0),('sensor,temperature_c\nA,inf\nB,-inf\n',[],2),('sensor,temperature_c\nA\n\n,2\n',[],3)]:
        Path('case.csv').write_text(text,encoding='utf-8');good,bad=ns['read_sensor_rows']('case.csv');assert good==valid and len(bad)==error_count;checks+=1
    for text,error in [('wrong,header\n',ValueError),('sensor,temperature_c\n"unclosed',csv.Error)]:
        Path('case.csv').write_text(text,encoding='utf-8')
        try:ns['read_sensor_rows']('case.csv')
        except error:checks+=1
        else:raise AssertionError(text)

with tempfile.TemporaryDirectory(prefix='cp1_answers_') as folder, contextlib.chdir(folder):
    ns={}
    for i in range(4,29,2):
        out=execute(S[i],ns)
        ex=str((i-2)//2) if i<28 else 'Bridge'
        student=next(c for c in L if c['cell_type']=='markdown' and (re.match(r'### Exercise '+ex+':',''.join(c['source'])) if ex!='Bridge' else ''.join(c['source']).startswith('### Bridge Exercise:')))
        assert out==expected(S[i-1])==expected(student),ex
    Path('search.txt').write_text('Python\nPYTHON\nother',encoding='utf-8')
    assert ns['search_file']('search.txt','python')==[(1,'Python'),(2,'PYTHON')];checks+=1
    assert ns['search_file']('search.txt','none')==[];checks+=1
    try:ns['search_file']('search.txt','')
    except ValueError:checks+=1
    else:raise AssertionError('Empty search accepted')
    for text,wanted in [('date,temp_celsius\n',([],None)),('date,temp_celsius\nx,-3.5\n',([-3.5],-3.5))]:
        Path('temp.csv').write_text(text,encoding='utf-8');assert ns['mean_from_file']('temp.csv')==wanted;checks+=1
    for text,wanted in [('name,midterm,final\n',[]),('name,midterm,final\n"Ada, Demir",40,100\n',[['Ada, Demir',70.0,'PASS']])]:
        Path('exam.csv').write_text(text,encoding='utf-8');assert ns['grade_report']('exam.csv','exam_out.csv')==wanted;checks+=1
    ns['append_entries']('new.log',['a','b']);before=Path('new.log').read_text();ns['append_entries']('new.log',['c']);assert Path('new.log').read_text()==before+'[3] c\n';checks+=1
    ns['append_entries']('new.log',[]);assert len(Path('new.log').read_text().splitlines())==3;checks+=1
    for lines,wanted,errors in [([],[],0),(['A,0,B','A,120,B'],[['A','0','B'],['A','120','B']],0),(['A,121,B','A,-1,B','A,nan,B'],[],3),(['A,2.5,B','A,20,','too,few'],[],3)]:
        clean,bad=ns['clean_people'](lines);assert clean==wanted and len(bad)==errors;checks+=1
    with open('clean_rejections.csv',newline='',encoding='utf-8') as f:rows=list(csv.reader(f))
    assert [r[0] for r in rows[1:]]==['4','6','8'];checks+=1
print(f'Passed {checks} file/edge-case checks and all 13 student/solution expected outputs.')
