"""Offline adaptations, keeping the complete Week-3 lesson and answer content."""
import json

def complete_week(nb, root):
    for cell in nb['cells']:
        text=''.join(cell['source']) if isinstance(cell['source'],list) else cell['source']
        # Clarify the sensor model's priority and physical simplification.
        text=text.replace('| below 70 | NORMAL |','| -40 ≤ temperature < 70 | NORMAL |').replace('| 90 and above | SHUTDOWN |','| 90 ≤ temperature ≤ 200 | SHUTDOWN |')
        if 'A lithium cell reads' in text:
            text=text.replace('A lithium cell reads','In this simplified linear teaching model, a lithium cell reads')
            text+='\n\nThis formula is a programming model, not an accurate physical battery gauge. The label FULL means the exercise’s 80–100% band; it does not mean exactly 100%.\n'
        cell['source']=[text]
        if text.startswith('---\n## Exercises'):
            cell.setdefault('metadata',{})['offline_anchor']='practice'
    nb['cells'][-1]['source']=['## Worked solutions and study support\n\nThe complete answers are included in this file, immediately below. Try the exercise, compare the reasoning and run its solution followed by its verification cell. Solutions use a separate Python namespace from your lesson and practice code. An assertion that passes produces no output; the status reads Finished.\n\n**Türkçe:** Önce kendi çözümünü dene. Sonra çözüm adımlarını ve sınır testlerini karşılaştır.\n']
    answers=json.loads((root/'solutions/Week_03_Solutions.ipynb').read_text())
    for i,cell in enumerate(answers['cells']):
        text=''.join(cell['source']) if isinstance(cell['source'],list) else cell['source']
        text=text.replace('PHASE 2: Expressing Decisions & Repetition','PHASE 1: Describe and decide')
        if i==0:
            text=text.replace('so **Run All never waits for keyboard input**','so no keyboard input is needed').replace('There are no sample file writes in these five weeks.','')
            cell.setdefault('metadata',{})['offline_anchor']='solutions'
        if i==1:
            text=text[:text.index('File examples create')]+ '\nReturn to [your practice](#practice) to try another input. Solution variables are kept separate automatically.\n'
        text=text.replace('| below 70 | NORMAL |','| -40 ≤ temperature < 70 | NORMAL |').replace('| 90 and above | SHUTDOWN |','| 90 ≤ temperature ≤ 200 | SHUTDOWN |')
        if 'A lithium cell reads' in text:
            text=text.replace('A lithium cell reads','In this simplified linear teaching model, a lithium cell reads')
        cell['source']=[text]
        cell.setdefault('metadata',{})['offline_realm']='solutions'
    # Compare the given voltage with the exact decimal thresholds for these bands.
    # At 3.96 V the calculated binary float SoC can be 79.99999999999999.
    for cell in [nb['cells'][109], answers['cells'][34]]:
        text=''.join(cell['source'])
        text=text.replace('Then use `if/elif/else` on `soc` with `< 20` and `< 80`', 'The 20% and 80% boundaries correspond to 3.24 V and 3.96 V. Use `< 3.24` and `< 3.96` on voltage for the bands')
        text=text.replace('Classify the unrounded value with increasing upper limits `< 20` and `< 80`; a continuous value such as 79.95 must not fall into a gap.', 'Use voltage thresholds 3.24 V and 3.96 V, equivalent to 20% and 80% in this model. This prevents binary floating-point noise from putting exactly 3.96 V just below the upper boundary. Compute SoC for the displayed percentage; a value such as 79.95% still belongs to OK.')
        text=text.replace('Sınıflandırmayı yuvarlanmamış değerle yap.', 'Sınıflandırmada 3.24 V ve 3.96 V sınırlarını kullan; yüzdeyi sonuç için hesapla.')
        cell['source']=[text]
    answers['cells'][35]['source']=[''.join(answers['cells'][35]['source']).replace('if soc < 20:', 'if voltage < 3.24:').replace('elif soc < 80:', 'elif voltage < 3.96:')]
    nb['cells'].extend(answers['cells'])
    return nb
