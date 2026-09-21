"""Execute all Week 01 demos, check conversions/dimensions, render boundary plots.

Usage: python tools/verify_week01_notebook.py --output-dir /tmp/phy101-week01-qa
Requires the same packages as validate_notebooks.py. Outputs never modify source.
"""
import sys, argparse
from pathlib import Path
import nbformat
sys.path.insert(0,str(Path(__file__).resolve().parent))
from validate_notebooks import PlainClient, PANEL_QA
parser=argparse.ArgumentParser()
parser.add_argument('--output-dir',type=Path,required=True)
args=parser.parse_args()
args.output_dir.mkdir(parents=True,exist_ok=True)
p=Path(__file__).resolve().parents[1]/'notebooks/Week_01.ipynb'
n=nbformat.read(p,as_version=4)
qa=r'''
import math, re
checks=0
for category, db in conversion_db.items():
    category_dd.value=category
    for i, from_unit in enumerate(db['units']):
        from_dd.value=from_unit
        for j, to_unit in enumerate(db['units']):
            to_dd.value=to_unit
            for value in [-2.5,0,763.0]:
                value_input.value=value
                do_conversion()
                expected=value*db['to_base'][i]/db['to_base'][j]
                assert f'= {expected:.4g} {to_unit}</b>' in result_label.value, result_label.value
                checks+=1
value_input.value=763.0
assert dim_of('(1/2) a t^2')==(1,0,0)
assert dim_of('rho v^2 A')==(1,1,-2)
assert dim_of('rho v A^2')!=(1,1,-2)
try: dim_of('unknown t')
except ValueError: pass
else: raise AssertionError('Unknown symbols accepted')
print('Converter cases:',checks,'; dimensional analysis: PASS')
_saved=[]
def capture(fig):
    name=str(_qa_output / f'plot-{len(_saved):02}.png')
    fig.savefig(name,dpi=110,bbox_inches='tight')
    _saved.append(name)
    plt.close(fig)
physics_show_figure=capture
for mag,angle in [(5,45),(5,90),(0,0),(5,270)]:
    plot_vector_components(mag,angle)
for order in range(6): plot_vector_order(order)
for angle in [0,90,180]: plot_two_products(4,5,angle)
assert len(_saved)==13
print('Rendered boundary plots:', _saved)
'''
n.cells.append(nbformat.v4.new_code_cell(PANEL_QA+'\nfrom pathlib import Path\n_qa_output=Path('+repr(str(args.output_dir.resolve()))+')\n'+qa))
PlainClient(n,timeout=120,kernel_name='python3',store_widget_state=False,resources={'metadata':{'path':str(p.parent.resolve())}}).execute()
nbformat.write(n,args.output_dir/'Week_01-extended.ipynb')
for o in n.cells[-1].get('outputs',[]):
 if o.get('text'): print(o['text'])
