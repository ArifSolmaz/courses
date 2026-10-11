"""Verify displayed-plot attribution without attributing construction or file saves."""
import base64
import contextlib
import os
import sys
import tempfile
import types
from pathlib import Path
os.environ['MPLBACKEND'] = 'Agg'
import matplotlib.pyplot as plt
HERE = Path(__file__).resolve().parent
images = []
output = types.ModuleType('offline_output')
output.emit = lambda text, lines: None
ui = types.ModuleType('offline_ui')
ui.plot = lambda png, lines: images.append((base64.b64decode(png), set(map(int, lines.split(','))) if lines else set()))
sys.modules['offline_output'] = output
sys.modules['offline_ui'] = ui
from output_trace import capture
original_show = plt.show
try:
    setup = {}
    exec((HERE/'plot_setup.py').read_text(), setup)
    code = 'plt.figure()\nplt.plot([0,1],[2,3])\nplt.savefig("test.png")\nplt.show()\nplt.figure()\nplt.plot([0,1],[4,5])\nplt.show()\n'
    with tempfile.TemporaryDirectory(prefix='cp1_plot_trace_') as folder, contextlib.chdir(folder):
        with capture(code, 'Cell 1'):
            exec(compile(code, 'Cell 1', 'exec'), {'plt': plt})
        assert [lines for _, lines in images] == [{4}, {7}]
        assert all(png.startswith(b'\x89PNG\r\n\x1a\n') for png, _ in images)
        assert Path('test.png').exists()
        assert not plt.get_fignums()
        # Calls to a helper in another cell link to the active cell's call site.
        ns = {'plt': plt}
        exec(compile('def display():\n    plt.figure()\n    plt.plot([1,2])\n    plt.show()\n', 'Cell 99', 'exec'), ns)
        with capture('display()', 'Cell 2'):
            exec(compile('display()', 'Cell 2', 'exec'), ns)
        assert images[-1][1] == {1}
        # Automatic display after a cell has finished has no invented call site.
        plt.figure(); plt.plot([1,2]); setup['show_offline']()
        assert images[-1][1] == set()
        assert not plt.get_fignums()
finally:
    plt.close('all')
    plt.show = original_show
print('Plot attribution passed: explicit displays, separate figures, cross-cell helper, untraced display and figure cleanup.')
