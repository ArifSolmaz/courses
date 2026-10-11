"""Week 11: test actual validators, error paths, retry limits and answer outputs."""
import contextlib
import io
import json
import re
from pathlib import Path
R = Path(__file__).resolve().parents[2]
L = json.loads((R/'notebooks/Week_11.ipynb').read_text())['cells']
S = json.loads((R/'solutions/Week_11_Solutions.ipynb').read_text())['cells']

def run(cell, namespace=None):
    ns = {} if namespace is None else namespace
    with contextlib.redirect_stdout(io.StringIO()) as out:
        exec(compile(''.join(cell['source']), '<Week 11>', 'exec'), ns)
    return ns, out.getvalue()

def expected(cell):
    s=''.join(cell['source'])
    blocks=[body for lang,body in re.findall(r'```([^\n]*)\n(.*?)```',s,re.S) if lang in ('','text')]
    return blocks[0]

answers=[]
for i in (j for j,c in enumerate(S) if c['cell_type']=='code'):
    ns,out=run(S[i]);answers.append(ns)
    ex=str(len(answers)) if len(answers)<13 else 'Bridge'
    j=next(j for j,c in enumerate(L) if c['cell_type']=='code' and c.get('metadata',{}).get('cp1_exercise')==ex)
    assert out==expected(S[i-1]), (ex,'solution output')
    assert out==expected(L[j-1]), (ex,'student output')
original={c.get('metadata',{}).get('cp1_source_cell'):c for c in L if c['cell_type']=='code'}
checks=0

def check(fn,cases):
    global checks
    for args,wanted in cases:
        with contextlib.redirect_stdout(io.StringIO()):actual=fn(*args)
        assert actual==wanted,(args,actual,wanted)
        checks+=1

def raises(fn,args,error):
    global checks
    try:fn(*args)
    except error:checks+=1
    else:raise AssertionError((args,error))

n,_=run(original[68]);check(n['temperature_reading'],[((x,),float(x)) for x in ['0','-12.5','-50','60']])
for v in ['','ERROR','nan','inf','-inf','-50.1','60.1']:raises(n['temperature_reading'],(v,),ValueError)
raises(n['temperature_reading'],(True,),TypeError)
n,_=run(original[62]);check(n['get_number_with_retries'],[(('P',[],3),None),(('P',['bad'],5),None),(('P',['bad','0'],1),None),(('P',['nan','0'],2),0.0),(('P',['42'],0),None),(('P',['42','99'],-1),None)])
n,_=run(original[74]);check(n['safe_average'],[(([],),None),((None,),None),(([True],),None),(([0,0],),0.0),(([1,float('nan')],),None)])
n,_=run(original[78]);check(n['calculator'],[((0,-1,'**'),'Error: Cannot divide by zero'),((-1,.5,'**'),'Error: Result is not real'),((1e308,2,'*'),'Error: Result is not finite'),((1e308,2,'**'),'Error: Result is too large'),(('nan',1,'+'),'Error: Both values must be finite'),((True,2,'+'),'Error: Both values must be numbers')])
check(answers[1]['safe_int'],[(('0',),0),((' -2 ',),-2),((2.5,),None),((True,),None)])
check(answers[2]['safe_get'],[(([],0,'missing'),'missing'),(([1],-1),1)])
check(answers[3]['calc'],[(('1e308 * 2',),'Error: result is not finite'),(('nan + 1',),'Error: numbers must be finite'),(('10+',),'Error: use number operator number')])
check(answers[4]['divide_many'],[(([],),None),(([0,5],),0.0),(([100,0,5],),20.0),(([100,float('nan'),5],),20.0),(([1e308,1e-308],),None),(([True,2],),None)])
check(answers[5]['convert_all'],[((['1','2.5'],'int'),[1]),(([None,3],'str'),['None','3'])])
check(answers[6]['robust_average'],[(([],),None),(('hello',),None),(([True,False],),None),((['85','nan','92','inf'],),88.5),(([0,0],),0)])
check(answers[7]['convert_temperature'],[((-273.15,'C','K'),0),((-459.67,'F','K'),0),((0,'K','K'),0),((-1,'K','C'),'Error: below absolute zero'),((1,[],'C'),"Error: unknown unit '[]'"),((1e308,'C','F'),'Error: converted result is not finite')])
check(answers[8]['enter_grades'],[(([],),{'valid':[],'invalid':[],'average':None}),((['0','100'],),{'valid':[0,100],'invalid':[],'average':50})])
check(answers[9]['process_record'],[((None,),'TypeError: record must be a dictionary'),(({'name':'A','id':'1','grades':None},),'A (1): TypeError: grades must be a list'),(({'name':'A','id':'1','grades':[]},),'A (1): ZeroDivisionError: no grades to average'),(({'name':'A','id':'1','grades':[float('nan')]},),'A (1): ValueError: grades must be finite')])
check(answers[10]['get_valid_input'],[(('P',answers[10]['validate_grade'],['bad','85'],1),None),(('P',answers[10]['validate_grade'],['0'],3),0),(('P',answers[10]['validate_grade'],[],3),None)])
check(answers[10]['validate_positive_int'],[((True,),(False,'not a valid integer')),((2.5,),(False,'not a valid integer'))])
rows,summary=answers[11]['process_student_records']([{'name':'A','id':'1','midterm':40,'final':100},{'name':'B','id':'2','midterm':True,'final':90}]);assert rows[0]['average']==70 and summary['errors']==1;checks+=1
# Keyboard function: reject two bad strings, accept zero; exhaustion returns None.
for supplied,wanted in [(['bad','3.14','0'],0),([],None),(['bad'],None)]:
    values=iter(supplied)
    def input_value(prompt=''):
        try:return next(values)
        except StopIteration:raise EOFError
    # Execute definitions only to avoid consuming responses in the sample call.
    ns={};exec(''.join(original[58]['source']).split('\nage =')[0],ns);ns['input']=input_value
    check(ns['safe_int_input'],[(('P',),wanted)])
print(f'Passed {checks} boundary/error cases and all 13 student/solution expected outputs.')
