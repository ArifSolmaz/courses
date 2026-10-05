#!/usr/bin/env python3
"""Insert/refresh the left table of contents + reading-progress block in tools/simple/wN.html.
Usage: python3 inject_sidebar.py <dir-with-wN.html> [snippet.html]   (idempotent)"""
import re,sys,pathlib
d=pathlib.Path(sys.argv[1]);snip=pathlib.Path(sys.argv[2] if len(sys.argv)>2 else d/'_sidebar.html').read_text(encoding='utf-8')
for f in sorted(d.glob('w*.html')):
    s=f.read_text(encoding='utf-8')
    s=re.sub(r'<!--AA-SIDEBAR-->.*?<!--/AA-SIDEBAR-->\n?','',s,flags=re.S)
    assert s.count('</body>')==1,f
    f.write_text(s.replace('</body>',snip+'</body>'),encoding='utf-8');print('ok',f.name)
