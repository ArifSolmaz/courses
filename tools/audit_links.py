#!/usr/bin/env python3
"""Audit course HTML/Markdown/notebook links; optionally check remote HTTP targets.

Run from any directory: python3 tools/audit_links.py [--online] [--output /tmp/course-links.json]
Colab links are checked against their actual notebook file, not Colab's HTTP-200 shell.
JavaScript-generated links must also be inspected in the rendered dashboards.
"""
import argparse, concurrent.futures, html, json, pathlib, re, subprocess, urllib.parse, urllib.request, urllib.error
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[1]
PUBLIC='https://arifsolmaz.github.io/courses/'
class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=set(); self.scripts=[]; self.in_script=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='a' and a.get('name'): self.ids.add(a['name'])
        if tag=='link' and a.get('rel') in ('preconnect','dns-prefetch'):return
        for key in ('href','src','poster'):
            if a.get(key): self.links.append((a[key],self.getpos()[0]))
        if tag=='meta' and a.get('http-equiv','').lower()=='refresh':
            m=re.search(r'url\s*=\s*(.+)',a.get('content',''),re.I)
            if m:self.links.append((m[1].strip(' "\''),self.getpos()[0]))
        if tag=='script':self.in_script=True
    def handle_endtag(self,tag):
        if tag=='script':self.in_script=False
    def handle_data(self,data):
        if self.in_script:self.scripts.append(data)

def markdown_links(s):
    # Remove executable examples and inline-code pseudo-links before extracting.
    s=re.sub(r'^(```|~~~).*?^\1[^\n]*', '',s,flags=re.M|re.S)
    s=re.sub(r'`[^`\n]*`', '', s)
    s=re.sub(r'^ {4}.*$', '', s, flags=re.M)
    s=re.sub(r'\$\$.*?\$\$|(?<!\\)\$[^$\n]+\$', '', s, flags=re.S)
    for m in re.finditer(r'!?\[[^\]\n]*\]\(\s*(<[^>]+>|[^\s)]+(?:\([^)]*\)[^\s)]*)?)',s):
        yield m[1].strip('<>'),s.count('\n',0,m.start())+1
    for m in re.finditer(r'^\s*\[[^\]]+\]:\s*(\S+)',s,re.M):yield m[1].strip('<>'),s.count('\n',0,m.start())+1
    for m in re.finditer(r'https?://[^\s<>\"\'`]+',s):
        url=m[0].rstrip('.,;')
        while url.endswith(')') and url.count(')')>url.count('('):url=url[:-1]
        yield url,s.count('\n',0,m.start())+1

def extract(p):
    s=p.read_text(); links=[]
    if p.suffix=='.ipynb':
        for i,c in enumerate(json.loads(s)['cells']):
            if c['cell_type']!='markdown':continue
            text=''.join(c['source']); parser=Links(); parser.feed(text)
            links.extend((u,f"cell {c.get('id',i)}") for u,_ in [*markdown_links(text),*parser.links])
    elif p.suffix in ('.md','.html'):
        parser=Links();parser.feed(s);links=parser.links
        if p.suffix=='.md':links+=list(markdown_links(s))
        # Static URLs in scripts include dynamically created HTML. Unresolved templates are reported separately.
        for script in parser.scripts:
            links.extend((m[0],'script') for m in re.finditer(r'https?://[^\s<>"\'`]+',script))
    return list(dict.fromkeys(links))

def local_target(source,url):
    u=urllib.parse.urlsplit(url); host=u.netloc.lower();path=urllib.parse.unquote(u.path)
    if host=='colab.research.google.com':
        m=re.match(r'/github/arifsolmaz/courses/blob/([^/]+)/(.*)',path,re.I)
        if m and m[1]=='main':return ROOT/m[2],u.fragment,'colab'
    if host in ('github.com','raw.githubusercontent.com'):
        m=re.match(r'/arifsolmaz/courses/(?:blob/|tree/)?main/(.*)',path,re.I)
        if m:return ROOT/m[1],u.fragment,'repository'
    if host=='arifsolmaz.github.io' and (path=='/courses' or path.startswith('/courses/')):
        return ROOT/path.removeprefix('/courses').lstrip('/'),u.fragment,'site'
    if not u.scheme and not u.netloc:
        if path.startswith('/courses/'):return ROOT/path[len('/courses/'):],u.fragment,'site'
        if path.startswith('/'):return None # outside this site's /courses/ base
        return (source.parent/path if path else source),u.fragment,'relative'
    return None

def check_local(source,url):
    result=local_target(source,url)
    if not result:return None
    p,fragment,kind=result;p=p.resolve()
    if not p.exists():return {'issue':'missing file','target':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p)}
    if p.is_relative_to(ROOT):
        current=ROOT
        for part in p.relative_to(ROOT).parts:
            names={x.name for x in current.iterdir()}
            if part not in names:return {'issue':'wrong filename case','target':str(p.relative_to(ROOT))}
            current=current/part
    if p.is_dir() and kind in ('site','relative') and source.suffix=='.html':
        if not (p/'index.html').exists():return {'issue':'no index page','target':str(p.relative_to(ROOT))}
        p=p/'index.html'
    if fragment and p.suffix=='.html':
        parser=Links();parser.feed(p.read_text())
        # Include literal IDs inside JavaScript-generated HTML. Interpolated IDs
        # are verified against the rendered dashboards during a full audit.
        parser.ids.update(re.findall(r'''id=["']([^"']+)["']''',p.read_text()))
        if urllib.parse.unquote(fragment) not in parser.ids:
            return {'issue':'missing anchor','target':str(p.relative_to(ROOT))+'#'+fragment}
    if fragment and p.suffix in ('.ipynb','.md'):
        text=p.read_text()
        if p.suffix=='.ipynb':
            text='\n'.join(''.join(c['source']) for c in json.loads(text)['cells'] if c['cell_type']=='markdown')
        ids=set(re.findall(r'''id=["']([^"']+)["']''',text))
        for heading in re.findall(r'^#{1,6}\s+(.+)$',text,re.M):
            ids.add(re.sub(r'[^\w\s-]','',heading.lower()).replace(' ','-'))
        if urllib.parse.unquote(fragment) not in ids:
            return {'issue':'missing anchor','target':str(p.relative_to(ROOT))+'#'+fragment}
    return {}

def fetch(url):
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (course link audit)'})
        with urllib.request.urlopen(req,timeout=15) as r:
            data=r.read(256)
            return {'url':url,'status':r.status,'final_url':r.url}
    except urllib.error.HTTPError as e:return {'url':url,'status':e.code,'error':str(e)}
    except Exception as e:return {'url':url,'status':None,'error':str(e)}

def run(extra=None):
    # These inputs use output-relative paths; their generated HTML is audited instead.
    templates=('aa/tools/guide/', 'aa/tools/weeks/', 'fall/cp1/tools/templates/', 'aa/tools/home.html', 'aa/tools/course_reference.html')
    files=[ROOT/x for x in subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines() if pathlib.Path(x).suffix in ('.html','.md','.ipynb') and not x.startswith(('_to_delete/','Claude outputs/',*templates))]
    refs=[]
    for p in files:
        for u,line in extract(p):refs.append({'source':str(p.relative_to(ROOT)),'line':line,'url':html.unescape(u).replace('\\_','_')})
    if extra:refs+=extra
    failures=[]; remote={};templates=[];checked=0
    for ref in refs:
        u=ref['url'].strip()
        if '${' in u or '{' in u or '<' in u or '\\' in u or '/wN/' in u or u.startswith(('javascript:','mailto:','tel:','data:')):templates.append(ref);continue
        if not u or u=='#':continue
        result=check_local(ROOT/ref['source'],u)
        if result is not None:
            checked+=1
            if result:failures.append({**ref,**result})
        elif u.startswith(('https://','http://')):remote.setdefault(u.split('#')[0],[]).append(ref)
    return {'files':len(files),'references':len(refs),'local_checks':checked,'local_failures':failures,'external':remote,'templates':templates}

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--online',action='store_true');ap.add_argument('--output',default='/tmp/course-links.json');ap.add_argument('--rendered',help='JSON list of {source,line,url} captured from rendered dashboards');args=ap.parse_args()
    report=run(json.loads(pathlib.Path(args.rendered).read_text()) if args.rendered else None)
    if args.online:
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:report['http']=list(pool.map(fetch,report['external']))
    pathlib.Path(args.output).write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print(f"{report['files']} files; {report['references']} link references; {report['local_checks']} local checks; {len(report['local_failures'])} local failures; {len(report['external'])} distinct external URLs")
    for x in report['local_failures']:print(f"{x['source']}:{x['line']} {x['issue']}: {x['url']} -> {x['target']}")
    if args.online:
        for x in report['http']:
            if x['status'] is None or x['status']>=400:print('HTTP',x)
    print('Report:',args.output)
    raise SystemExit(bool(report['local_failures']) or any(x['status'] is None or x['status']>=400 for x in report.get('http',[])))
