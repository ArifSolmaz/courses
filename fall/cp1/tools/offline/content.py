"""Create complete offline editions from the maintained lecture and answer notebooks."""
import json,re
from week03 import complete_week
INPUTS={2:{49:['Elif'],51:['19'],53:['1.70','65']},5:{25:['3','9','7'],27:['0','121','20'],42:['hello','quit'],60:['5','7','0'],63:['60','70','80','90','100'],66:['yes','no'],70:['Elif'],82:['maybe','yes']}}

def text(cell):return ''.join(cell['source']) if isinstance(cell['source'],list) else cell['source']

def prepare(week,root):
    nb=json.loads((root/f'notebooks/Week_{week:02d}.ipynb').read_text());lesson_count=len(nb['cells'])
    if week==3:nb=complete_week(nb,root)
    else:
        answers=json.loads((root/f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())
        # All original teaching cells remain; replace the online solution-directory cell.
        for cell in nb['cells']:
            if text(cell).startswith('## Worked solutions and study support'):
                cell['source']=['## Worked solutions and study support\n\nThe complete answers are included below. Try your own code first, then compare the reasoning and tests. Solution variables and files are kept separate from your practice.\n\n[Read the worked solutions](#solutions)\n']
        for cell in answers['cells']:
            cell.setdefault('metadata',{})['offline_realm']='solutions'
        answers['cells'][0]['metadata']['offline_anchor']='solutions'
        nb['cells'].extend(answers['cells'])
    nb['metadata']['cp1_offline_week']=week
    for i,cell in enumerate(nb['cells']):
        s=text(cell);meta=cell.setdefault('metadata',{})
        cell['id']=f'w{week:02d}-'+('s' if i>=lesson_count else 'l')+f'-{i:03d}'
        if cell['cell_type']=='code':
            if s.startswith('%%writefile '):
                header,body=s.split('\n',1);name=header.split(maxsplit=1)[1].strip()
                s=f'# Create the same sample file using ordinary Python.\nwith open({name!r}, "w", encoding="utf-8") as file:\n    file.write({body!r})\nprint("Created:", {name!r})\n'
            if i in INPUTS.get(week,{}):meta['offline_inputs']=INPUTS[week][i]
            cell['outputs']=[];cell['execution_count']=None
        else:
            if re.search(r'^## Exercises\s*$',s,re.M):meta['offline_anchor']='practice'
            # Route notebook/solution references inside this self-contained document.
            s=re.sub(r'\[([^\]]+)\]\((?:https://colab\.research\.google\.com/github/ArifSolmaz/courses/blob/main/fall/cp1/)?(?:\.\./)?(?:notebooks/)?Week_\d+\.ipynb\)',r'[\1](#section-0)',s)
            s=re.sub(r'\[([^\]]+)\]\((?:https://colab\.research\.google\.com/github/ArifSolmaz/courses/blob/main/fall/cp1/)?(?:\.\./)?(?:solutions/)?Week_\d+_Solutions\.ipynb\)',r'[\1](#solutions)',s)
            s=s.replace('(../STUDY_GUIDE.md)','(https://arifsolmaz.github.io/courses/fall/cp1/STUDY_GUIDE.md)').replace('(../solutions/README.md)','(#solutions)').replace('(README.md)','(#solutions)')
            s=s.replace('Open it in a separate runtime.', 'Solutions use a separate Python namespace and working folder in this page.')
            s=s.replace('Use a separate runtime for your\nown practice so the worked answers do not supply hidden variables to it.', 'This page keeps solution variables and files separate from your practice.')
            s=s.replace('so **Run All never waits for keyboard input**','so no live keyboard input is needed')
            if week==12 and '%%writefile' in s:
                s+='\n\n**Offline edition:** the following setup cells use `with open(..., "w")` instead of Colab’s `%%writefile` command. They create the same files. Run each setup cell before reading its file.\n'
        cell['source']=s.splitlines(keepends=True)
    return nb,lesson_count
