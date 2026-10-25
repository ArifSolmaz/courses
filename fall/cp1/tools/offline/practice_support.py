"""Keep original practice starters and complete worked answers beside guided examples."""
from copy import deepcopy
import json
import re


def english_prose(text):
    # The originals include Turkish translations of the adjacent English prose.
    return '\n\n'.join(p for p in text.split('\n\n') if not p.lstrip().startswith(('**Türkçe:**', 'Türkçe:')))


def restore_practice(nb, root, week):
    original=json.loads((root/f'notebooks/Week_{week:02d}.ipynb').read_text())
    answers=json.loads((root/f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())
    cells=original['cells']
    start=next(i for i,c in enumerate(cells) if c['cell_type']=='markdown' and re.search(r'^### Exercise 1:', ''.join(c['source']),re.M))
    nb['cells'].append({'cell_type':'markdown','metadata':{'offline_anchor':'practice','offline_realm':'practice'},'source':['## Exercises to solve\n\nTry these problems yourself before opening the worked solutions below. Exercises 1–8 are core practice; Exercises 9–12 and the bridge are optional. Choose **Edit code** to complete each starter, then Run and compare with its expected result.\n\nPractice has its own Python variables and files, separate from examples and solutions. Run any supplied setup in this section first. Saving your notebook keeps your code; download generated files separately.\n']})
    skip=0
    for source in cells[start:]:
        text=''.join(source['source'])
        if source['cell_type']=='markdown' and text.startswith('## Worked solutions and study support'):break
        if skip:
            skip-=1;continue
        if source['cell_type']=='markdown' and re.search(r'### .*Checkpoint 5 of 5',text):
            skip=2;continue  # Reflection calls a helper from the original full lecture.
        nb['cells'].append(adapt(source,week,'practice'))
    lesson_count=len(nb['cells'])
    for index,source in enumerate(answers['cells']):
        cell=adapt(source,week,'solutions')
        if index==0:
            cell['metadata']['offline_anchor']='solutions'
            cell['source']=[f'## Fully worked solutions\n\nComplete Week {week:02d} answers follow the exercises. Compare your result and reasoning after making your own attempt. These cells use separate variables and files, so running an answer does not complete your practice cell. Run solution cells in order when an answer uses an earlier setup. Exercises 9–12 and the bridge remain optional.\n']
        nb['cells'].append(cell)
    for index,cell in enumerate(nb['cells']):
        cell['id']=f'w{week:02d}-offline-{index:03d}'
    nb['metadata']['cp1']['practice_restored']=True
    return nb,lesson_count


def adapt(source,week,realm):
    cell=deepcopy(source);meta=cell.setdefault('metadata',{});meta['offline_realm']=realm
    text=''.join(cell['source'])
    heading=re.search(r'^(#{2,3}) Exercise (\d+):',text,re.M)
    if heading:
        number=int(heading[2]);meta['offline_anchor']=f'{"exercise" if realm=="practice" else "solution"}-{number}'
        if number>=9:
            text=text[:heading.start()]+text[heading.start():].replace('Exercise ', 'Optional exercise ',1)
    if re.search(r'^#{2,3} Bridge Exercise:',text,re.M):
        text=re.sub(r'^(#{2,3}) Bridge Exercise:',r'\1 Optional bridge exercise:',text,flags=re.M)
        meta['offline_anchor']='exercise-bridge' if realm=='practice' else 'solution-bridge'
    if cell['cell_type']=='code':
        cell['execution_count']=None;cell['outputs']=[]
        assert not text.startswith('%%'), 'Original practice setup must use ordinary Python'
    else:
        text=english_prose(text)
        text=text.replace('Run cells in order in a fresh runtime working directory', 'Run these solution cells in order in their separate working folder')
        text=text.replace('Use a separate runtime for your own practice so the worked answers do not supply hidden variables to it.', 'This page keeps example, practice, and solution variables and files separate.')
        text=text.replace('(README.md)', '(#solutions)').replace('(../STUDY_GUIDE.md)', '(https://arifsolmaz.github.io/courses/fall/cp1/STUDY_GUIDE.md)')
        text=re.sub(r'\[([^\]]+)\]\((?:https://colab\.research\.google\.com/github/ArifSolmaz/courses/blob/main/fall/cp1/)?(?:\.\./)?(?:notebooks/)?Week_\d+\.ipynb\)',r'[\1](#practice)',text)
        text=text.replace('Hints (click to reveal)','Hints')
    cell['source']=text.splitlines(keepends=True)
    return cell
