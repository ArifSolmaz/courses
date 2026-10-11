"""Check Week 10's teaching functions, output parity and refactoring behavior."""
import contextlib
import io
import json
import re
from pathlib import Path
R = Path(__file__).resolve().parents[2]
L = json.loads((R/'notebooks/Week_10.ipynb').read_text())['cells']
S = json.loads((R/'solutions/Week_10_Solutions.ipynb').read_text())['cells']

def run(cell):
    ns = {}
    with contextlib.redirect_stdout(io.StringIO()) as out:
        exec(compile(''.join(cell['source']), '<Week 10>', 'exec'), ns)
    return ns, out.getvalue()

def expected(cell):
    return re.search(r'\*\*Expected (?:output|behavior):\*\*\s*```(?:text)?\n(.*?)```', ''.join(cell['source']), re.S).group(1)

answers = []
for i in range(3,28,2):
    ns, output = run(S[i])
    answers.append(ns)
    assert output == expected(S[i-1]), f'Solution {i}: output mismatch'
    marker = str(len(answers)) if len(answers)<13 else 'Bridge'
    student = next(j for j,c in enumerate(L) if c['cell_type']=='code' and f'[EX{marker}]' in ''.join(c['source']))
    assert output == expected(L[student-1]), f'Student {marker}: output mismatch'

checks = 0

def check(fn, cases):
    global checks
    for args, wanted in cases:
        with contextlib.redirect_stdout(io.StringIO()): actual = fn(*args)
        assert actual == wanted, (args, actual, wanted)
        checks += 1

n,_=run(L[68]);a={'offset':.5,'gain':25};b={'offset':1.,'gain':25}
check(n['sensor_force'], [((.5,.5,25),0),((4.5,.5,25),100),((.49,.5,25),None),((4.51,.5,25),None)])
check(n['sensor_report'],[(('A',2.5,a),'A: 50.0 N'),(('B',2.5,b),'B: 37.5 N'),(('A',2.5,a),'A: 50.0 N')])
assert a=={'offset':.5,'gain':25} and b=={'offset':1.,'gain':25};checks+=1
n,_=run(L[28]);items=[7];n['mutate_then_rebind'](items);assert items==[7,3];checks+=1
n,_=run(L[59]);check(n['count_sentences'],[(('',),0),((' \n ',),0),(('Hello',),1),(('Hi. Bye!',),2)])
assert 'Words per sentence: 0.0' in n['text_summary']('');checks+=1
before=run(L[62])[1];after=run(L[64])[1];assert before==after;checks+=1
check(answers[1]['get_full_greeting'],[(('Ada','Hi'),'Hi, Ada!')])
check(answers[2]['c_to_k'],[((-273.15,),0)])
check(answers[3]['gcd'],[((0,0),0),((-12,8),4),((8,0),8)])
check(answers[3]['lcm'],[((0,0),0),((0,7),0),((-3,4),12)])
check(answers[3]['factorial'],[((0,),1),((1,),1)])
check(answers[3]['is_prime'],[((-5,),False),((49,),False),((97,),True)])
check(answers[4]['is_palindrome'],[(('',),True),(('Never odd or even',),True)])
check(answers[5]['median'],[(([4,1,2,3],),2.5),(([8],),8)])
check(answers[5]['mode'],[(([2,1,1,2],),2),(([4,5],),4)])
check(answers[6]['shape_report'],[(([],),[])])
check(answers[7]['apply_discount'],[((100,),100),((200,),190),((0,),0)])
check(answers[8]['validate_id'],[(('0123456789',),True),(('²'*10,),False),((1234567890,),False)])
check(answers[8]['validate_age'],[((True,),False),((0,),True),((150,),True),((151,),False)])
check(answers[8]['validate_email'],[(('@.',),True),(('first.last@example',),False)])
check(answers[9]['process_grade'],[((-10,0,0),(0,'FF')),((95,10,5),(100,'AA'))])
check(answers[10]['weighted_average'],[((40,100),70),((100,40),70)])
stats=answers[10]['class_stats']([]);assert all(v is None for v in stats.values());checks+=1
rows=[{'name':x,'score':50,'status':'PASS'} for x in ['First','Second']]
stats=answers[10]['class_stats'](rows);assert stats['highest']['name']==stats['lowest']['name']=='First';checks+=1
with contextlib.redirect_stdout(io.StringIO()) as out:answers[10]['print_report']([])
assert out.getvalue()=='No student records.\n';checks+=1
with contextlib.redirect_stdout(io.StringIO()):p=answers[11]['physics_report'](2,0,3,-1)
assert p['kinetic']==p['force']==p['momentum']==0 and p['potential']==-19.62;checks+=1
print(f'Passed {checks} boundary/behavior cases and all 13 student/solution expected outputs.')
