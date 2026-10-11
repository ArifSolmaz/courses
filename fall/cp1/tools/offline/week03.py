"""Compatibility helper: Week 3 corrections now live in the source notebooks."""
import json

def complete_week(nb, root):
    answers=json.loads((root/'solutions/Week_03_Solutions.ipynb').read_text())
    for cell in answers['cells']:
        cell.setdefault('metadata',{})['offline_realm']='solutions'
    answers['cells'][0]['metadata']['offline_anchor']='solutions'
    nb['cells'].extend(answers['cells'])
    return nb
