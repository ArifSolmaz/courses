"""Build the guided pages from template.html: ⟪Turkish‖English⟫ -> tr/index.html and index.html."""
import re, pathlib
here = pathlib.Path(__file__).parent
src = (here / 'template.html').read_text(encoding='utf-8')
pat = re.compile(r'⟪(.*?)‖(.*?)⟫', re.S)
for lang, idx, out_path in (('tr', 1, here.parent / 'tr' / 'index.html'), ('en', 2, here.parent / 'index.html')):
    out = pat.sub(lambda m: m.group(idx), src)
    assert not [c for c in '⟪‖⟫' if c in out], lang
    out_path.write_text(out, encoding='utf-8')
    print(lang, len(out))
