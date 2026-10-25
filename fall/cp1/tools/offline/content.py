"""Create complete offline editions from the maintained lecture and answer notebooks."""
import json,re
# Sample input responses live in notebook metadata so both formats agree.

def text(cell):return ''.join(cell['source']) if isinstance(cell['source'],list) else cell['source']

def prepare(week,root):
    if week == 6:
        from week06 import prepare as prepare_guided_week
        return prepare_guided_week(root)
    if week == 7:
        from week07 import prepare as prepare_guided_week
        return prepare_guided_week(root)
    nb=json.loads((root/f'notebooks/Week_{week:02d}.ipynb').read_text());lesson_count=len(nb['cells'])
    answers=json.loads((root/f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())
    for cell in answers['cells']:
        cell.setdefault('metadata',{})['offline_realm']='solutions'
    answers['cells'][0]['metadata']['offline_anchor']='solutions'
    nb['cells'].extend(answers['cells'])
    nb['metadata']['cp1_offline_week']=week
    for i,cell in enumerate(nb['cells']):
        s=text(cell).replace('the code is hidden; you do not need to read it','reading this helper code is optional').replace('Hints (click to reveal)','Hints (shown below)');meta=cell.setdefault('metadata',{})
        cell['id']=f'w{week:02d}-'+('s' if i>=lesson_count else 'l')+f'-{i:03d}'
        if cell['cell_type']=='code':
            if s.startswith('%%writefile '):
                header,body=s.split('\n',1);name=header.split(maxsplit=1)[1].strip()
                s=f'# Create the same sample file using ordinary Python.\nwith open({name!r}, "w", encoding="utf-8") as file:\n    file.write({body!r})\nprint("Created:", {name!r})\n'
            cell['outputs']=[];cell['execution_count']=None
        else:
            if re.search(r'^## Exercises\s*$',s,re.M):meta['offline_anchor']='practice'
            # Route notebook/solution references inside this self-contained document.
            s=re.sub(r'If you are using Colab, \[open the published solution notebook\]\([^\n]+\)\.', 'The worked solutions are included below in this offline page.', s)
            s=re.sub(r'\[([^\]]+)\]\((?:https://colab\.research\.google\.com/github/ArifSolmaz/courses/blob/main/fall/cp1/)?(?:\.\./)?(?:notebooks/)?Week_\d+\.ipynb\)',r'[\1](#section-0)',s)
            s=re.sub(r'\[([^\]]+)\]\((?:https://colab\.research\.google\.com/github/ArifSolmaz/courses/blob/main/fall/cp1/)?(?:\.\./)?(?:solutions/)?Week_\d+_Solutions\.ipynb\)',r'[\1](#solutions)',s)
            s=s.replace('(../STUDY_GUIDE.md)','(https://arifsolmaz.github.io/courses/fall/cp1/STUDY_GUIDE.md)').replace('(../solutions/README.md)','(#solutions)').replace('(README.md)','(#solutions)')
            s=s.replace('Open it in a separate runtime.', 'Solutions use a separate Python namespace and working folder in this page.')
            s=s.replace('Use a separate runtime for your\nown practice so the worked answers do not supply hidden variables to it.', 'This page keeps solution variables and files separate from your practice.')
            s=s.replace('so **Run All never waits for keyboard input**','so no live keyboard input is needed')
            if week==12 and '%%writefile' in s:
                s+='\n\n**Offline edition:** the following setup cells use `with open(..., "w")` instead of Colab’s `%%writefile` command. They create the same files. Run each setup cell before reading its file.\n'
        s=s.replace('In Google Colab and Jupyter Notebooks, `input()` works interactively — it pops up a text box for the user to type in.', 'In this offline page, fill in **Input values below the code/output pair before pressing Run**. Each `input()` call consumes one response line. The page does not open a live input dialog. If responses run out, add the missing lines and rerun the cell from the beginning.')
        s=s.replace('- In Jupyter/Colab: Click the **stop button** (square icon) or go to **Runtime > Interrupt execution**', '- On this offline page: use **Stop / restart Python** at the top. This stops execution and clears Python variables; your code edits remain.')
        cell['source']=s.splitlines(keepends=True)
    return nb,lesson_count
