"""Check executable question traces with Python; do not execute the infinite-loop example."""
import contextlib,io,json
from pathlib import Path
qs=json.loads(Path(__file__).with_name('questions.json').read_text())
expected={1:'4',3:'Ready',6:'3 2',9:'3.14 V',11:'High',12:'Pass',15:'Done',16:'2\n4\n6',17:'6',18:'3',19:'*\n*\n*\n*\n*\n*',21:'0',22:'1\n2',23:'1\n3\n4'}
for num,want in expected.items():
 out=io.StringIO()
 with contextlib.redirect_stdout(out):exec(qs[num-1]['code'],{})
 assert out.getvalue().strip()==want,(num,out.getvalue())
assert eval(qs[6]['code'])==50
out=io.StringIO()
with contextlib.redirect_stdout(out):exec(qs[7]['code'],{'input':lambda _: '7'})
assert out.getvalue().strip()=='72'
try:exec(qs[3]['code'],{})
except NameError:pass
else:raise AssertionError('Q4 must raise NameError')
assert 150/12==12.5 and float('3.5')==3.5
for v in [-1,0,5,6]:assert (0<=v<=5)==(v in [0,5])
for a in ['yes','no','maybe']:assert (a!='yes' and a!='no')==(a=='maybe')
out=io.StringIO()
with contextlib.redirect_stdout(out):exec(qs[19]['code'].replace('product = 0','product = 1'),{})
assert out.getvalue().strip()=='24'
print('PASS: executable traces, conversion, boundary and repair answers.')
