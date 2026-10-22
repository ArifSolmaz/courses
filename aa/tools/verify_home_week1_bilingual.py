#!/usr/bin/env python3
"""Read-only, pinned migration audit for the new home and bilingual Week 1.

This audit replaces no historical lesson checks and grants no successor waiver.
The pre-migration publication is the immutable content fixture. Browser/mobile
interaction and independent disposable-copy builds are reported separately.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import ast
import hashlib
import json
import re
import subprocess

from aligned.page_links import fragment_exists


ROOT = Path(__file__).resolve().parents[1]
BASELINE = '239ea38383883381cd6e150bb2c9e665422612b2'
EXISTING_CHANGES = {
    'aa/index.html', 'aa/README.md', 'aa/w1/index.html', 'aa/w1/lesson.js',
    'aa/tools/lessons/w1.html', 'aa/tools/aligned/build.py',
    'aa/tools/verify_alignment.py', 'aa/tools/verify_learning_bridges.py',
    'aa/tools/verify_rebuild.py',
}
NEW_FILES = {
    'aa/tools/lessons/home.html', 'aa/tools/lessons/resources.html',
    'aa/tools/lessons/teaching.html', 'aa/tools/lessons/w1.tr.html',
    'aa/resources/index.html', 'aa/resources/teaching/index.html',
    'aa/previous-home.html', 'aa/assets/route.css',
    'aa/assets/lesson-language.css', 'aa/w1/tr/index.html',
    'aa/w1/lesson.en.js', 'aa/tools/verify_home_week1_bilingual.py',
}
COPIES = {
    'tools/lessons/home.html': 'index.html',
    'tools/lessons/resources.html': 'resources/index.html',
    'tools/lessons/teaching.html': 'resources/teaching/index.html',
    'tools/lessons/w1.html': 'w1/index.html',
    'tools/lessons/w1.tr.html': 'w1/tr/index.html',
}
ENABLE_BEFORE = "document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; });"
ENABLE_AFTER = '''document.querySelectorAll('.js-only').forEach(node => {
    node.hidden = false;
    if (node.matches('button[type="submit"]')) node.disabled = false;
  });'''
TR_LABELS = {
    'Ana örnek · hedef 24': 'Örnek · 24',
    'Tek değişiklik · hedef 7': 'Erken · 7',
    'Yinelenen kimlik · hedef 18': 'Tekrar · 18',
    'Listede olmayan · hedef 99': 'Yok · 99',
    'Boş liste · hedef 24': 'Boş · 24',
}
TEACHER_ANCHOR = '<span id="teacher-note" class="compat-anchor" aria-hidden="true"></span>'
TOOL_INSERTIONS = {
    'tools/aligned/build.py': [''' # Fresh route pages are authored independently of the earlier syllabus.
 # Keep the complete earlier dashboard as a static archive at its own route.
 for source, destination in (
     ('home.html', 'index.html'),
     ('resources.html', 'resources/index.html'),
     ('teaching.html', 'resources/teaching/index.html'),
 ):
  fresh=ROOT/'tools'/'lessons'/source
  if fresh.is_file():
   target=ROOT/destination;target.parent.mkdir(parents=True,exist_ok=True)
   target.write_bytes(fresh.read_bytes())
 for n in range(1,15):
  translated=ROOT/'tools'/'lessons'/f'w{n}.tr.html'
  if translated.is_file():
   target=ROOT/f'w{n}'/'tr'/'index.html';target.parent.mkdir(parents=True,exist_ok=True)
   target.write_bytes(translated.read_bytes())
'''],
    'tools/verify_rebuild.py': ['''MAIN_PAGES += [f'w{n}/tr/index.html' for n in range(1, 15)
               if (ROOT / f'tools/lessons/w{n}.tr.html').is_file()]
MAIN_PAGES += [destination for source, destination in (
    ('resources.html', 'resources/index.html'),
    ('teaching.html', 'resources/teaching/index.html'),
) if (ROOT / 'tools/lessons' / source).is_file()]
'''],
    'tools/verify_learning_bridges.py': ['''# The simplified dashboard retains the complete original bridge panel on its
# byte-preserved, same-depth archive. Continue testing every original check.
if (ROOT / 'aa/tools/lessons/home.html').is_file():
    PAGES[0] = 'aa/previous-home.html'
''', '''    if week == 0 and path == 'aa/previous-home.html':
        return subprocess.check_output(
            ['git', 'show', '239ea38383883381cd6e150bb2c9e665422612b2:aa/index.html'], cwd=ROOT,
        ).decode('utf-8')
'''],
}
ALIGNMENT_BEFORE = '''for x in ('href="scope/"','href="review/"','href="textbook-problems/"'):assert x in home,x
print('Scope, review and textbook-problems pages exist and are linked from the dashboard and every week.')
'''
ALIGNMENT_AFTER = '''if (root/'tools/lessons/home.html').is_file():
 assert (root/'index.html').read_bytes()==(root/'tools/lessons/home.html').read_bytes()
 assert 'href="resources/"' in home
 for n in range(1,15):assert f'href="w{n}/"' in home,(n,'fresh route entry')
 for source,destination in (('resources.html','resources/index.html'),('teaching.html','resources/teaching/index.html'),('w1.tr.html','w1/tr/index.html')):
  assert (root/destination).read_bytes()==(root/'tools/lessons'/source).read_bytes()
  check_links(root/destination,(root/destination).read_text())
 reference=(root/'resources/index.html').read_text()
 for x in ('href="../scope/"','href="../review/"','href="../textbook-problems/"'):assert x in reference,x
 legacy=(root/'previous-home.html').read_text();check_links(root/'previous-home.html',legacy)
 for x in ('href="scope/"','href="review/"','href="textbook-problems/"'):assert x in legacy,x
else:
 for x in ('href="scope/"','href="review/"','href="textbook-problems/"'):assert x in home,x
print('Scope, review and textbook-problems pages are preserved; the fresh route collects them under additional resources.')
'''


def git(repo, *args):
    return subprocess.check_output(['git', *args], cwd=repo)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def blob_sha(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


class Node:
    def __init__(self, tag, attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return ''.join(x.text() if isinstance(x, Node) else x for x in self.children)

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()


class Page(HTMLParser):
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def __init__(self, raw):
        super().__init__(convert_charrefs=True)
        self.root = Node('document')
        self.stack = [self.root]
        self.feed(raw)
        self.nodes = list(self.root.walk())[1:]
        self.ids = [x.attrs['id'] for x in self.nodes if 'id' in x.attrs]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for pos in range(len(self.stack) - 1, 0, -1):
            if self.stack[pos].tag == tag:
                del self.stack[pos:]
                break

    def handle_data(self, text):
        self.stack[-1].children.append(text)

    def find(self, ident):
        matches = [x for x in self.nodes if x.attrs.get('id') == ident]
        assert len(matches) == 1, f'exactly one #{ident}, got {len(matches)}'
        return matches[0]

    def links(self):
        return [x.attrs['href'] for x in self.nodes if x.tag == 'a' and 'href' in x.attrs]


def expected_turkish(old):
    """Explicit reversible migration; never read an integration output fixture."""
    details = re.findall(r'<details id="teacher-note".*?</details>', old, re.S)
    assert len(details) == 1, 'one baseline Turkish teacher-note details'
    s = old.replace(details[0], TEACHER_ANCHOR, 1)
    replacements = {
        'Peki bu hedef her zaman iki kontrolde mi bulunur?':
            'Peki bu listedeki her hedef iki kontrolde mi bulunur?',
        'href="lesson.css?v=1"': 'href="../lesson.css?v=1"',
        'src="model.js?v=1"': 'src="../model.js?v=1"',
        'src="lesson.js?v=1"': 'src="../lesson.js?v=2"',
    }
    for before, after in replacements.items():
        assert s.count(before) == 1, f'one original migration target: {before}'
        s = s.replace(before, after)
    s = s.replace('href="../"', 'href="../../"').replace('href="../w2/"', 'href="../../w2/"')
    s = s.replace('<span class="week-label">Hafta 1 / 14</span>',
        '<div class="header-end"><span class="week-label">Hafta 1 / 14</span>'
        '<nav class="language-switch" aria-label="Ders dili">'
        '<a href="../" lang="en" hreflang="en">English</a>'
        '<span aria-current="page" lang="tr">Türkçe</span></nav></div>')
    s = s.replace('<link rel="stylesheet" href="../lesson.css?v=1">',
        '<link rel="stylesheet" href="../lesson.css?v=1">\n'
        '<link rel="stylesheet" href="../../assets/lesson-language.css?v=1">\n'
        '<link rel="alternate" hreflang="en" href="../">')
    for before, after in TR_LABELS.items():
        assert s.count(before) == 1, f'one original native select label: {before}'
        s = s.replace(before, after)
    assert s.count('type="submit" class="js-only" hidden') == 2
    s = s.replace('type="submit" class="js-only" hidden',
                  'type="submit" class="js-only" hidden disabled')
    return s.rstrip() + '\n', details[0]


def javascript_contract(root):
    """Read case data from both UIs and execute only the shared pure model."""
    script = r'''
const fs=require('fs'),vm=require('vm');
const root=process.argv[1],model=require(root+'/w1/model.js');
const read=lang=>fs.readFileSync(root+'/w1/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
const contracts={};
for(const lang of ['tr','en']){
 const s=read(lang);
 const cases=vm.runInNewContext('('+s.match(/const cases = (\{[\s\S]*?\n  \});/)[1]+')');
 const checks=vm.runInNewContext('('+s.match(/const checks = (\[[\s\S]*?\n    \])\.map/)[1]+')').map(x=>x.slice(0,4));
 const numeric=s.match(/  function numeric\([\s\S]*?\n  \}/)[0];
 const reset=s.match(/  function resetTrace\([\s\S]*?\n  \}/)[0];
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(x=>x.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 const guided=s.match(/const expected = model.trace\((\[[^\]]+\]), (\d+)\);/);
 contracts[lang]={cases,checks,numeric,reset,events,refs,
  guided:{values:JSON.parse(guided[1]),target:Number(guided[2])},
  model_results:Object.fromEntries(Object.entries(cases).map(([k,x])=>[k,model.trace(x.values,x.target)]))};
}
let total=0;
for(let n=0;n<=5;n++){
 for(let encoding=0;encoding<3**n;encoding++){
  let q=encoding;const a=[];for(let i=0;i<n;i++){a.push(q%3-1);q=Math.floor(q/3);}
  for(const target of [-2,-1,0,1,2]){
   const r=model.trace(a,target),index=a.indexOf(target),count=index<0?n:index+1;
   if(r.position!==(index<0?null:index+1)||r.comparisons!==count||r.steps.length!==count)throw Error('independent first-match oracle failed');
   r.steps.forEach((x,i)=>{if(x.position!==i+1||x.value!==a[i]||x.equal!==(a[i]===target)||x.comparisons!==i+1)throw Error('step oracle failed');});
   total++;
  }
 }
}
console.log(JSON.stringify({contracts,oracle_cases:total,
 guided:model.trace([12,5,19,5],19),independent:model.trace([9,14,6,14],14)}));
'''
    return json.loads(subprocess.check_output(['node', '-e', script, str(root)], text=True))


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo = root.parent
    checks, pins = [], {}

    def check(condition, label):
        assert condition, label
        checks.append(label)

    check(baseline == BASELINE, 'the migration fixture is pinned to the published W14 baseline')
    before = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            metadata, name = row.split(b'\t', 1)
            mode, kind, object_name = metadata.decode().split()
            if kind == 'blob':
                before[name.decode()] = object_name
    check(len(before) == 567, 'the pinned publication contains exactly 567 AA files')
    names = {x.decode() for x in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if x}
    check(names - set(before) == NEW_FILES, 'the exact twelve new migration files are present')
    check(set(before) <= names, 'no baseline AA file is deleted')
    changed, protected = [], []
    for name, object_name in sorted(before.items()):
        path = repo / name
        check(path.is_file(), f'baseline file exists: {name}')
        raw = path.read_bytes()
        if blob_sha(raw) != object_name:
            changed.append(name)
        elif name not in EXISTING_CHANGES:
            protected.append(name)
        if name not in EXISTING_CHANGES:
            check(blob_sha(raw) == object_name, f'byte-preserved baseline file: {name}')
    check(set(changed) == EXISTING_CHANGES, 'exactly the nine authorized existing files change')
    check(len(protected) == 558, 'all 558 other AA files remain byte-identical')
    for name in sorted(names):
        pins[name] = sha((repo / name).read_bytes())
    for source, destination in COPIES.items():
        check((root / source).read_bytes() == (root / destination).read_bytes(),
              f'authored source reproduces the route byte-for-byte: {destination}')
    check((root / 'previous-home.html').read_bytes() == git(repo, 'show', f'{baseline}:aa/index.html'),
          'the complete previous home is retained byte-for-byte at the same depth')
    check((root / 'README.md').read_bytes().startswith(git(repo, 'show', f'{baseline}:aa/README.md')),
          'existing README content is retained verbatim before additive documentation')
    for relative, insertions in TOOL_INSERTIONS.items():
        current = (root / relative).read_text()
        for insertion in insertions:
            check(current.count(insertion) == 1, f'one exact additive tool adapter: {relative}')
            current = current.replace(insertion, '', 1)
        check(current.encode() == git(repo, 'show', f'{baseline}:aa/{relative}'),
              f'all other tool bytes remain identical: {relative}')
    alignment = (root / 'tools/verify_alignment.py').read_text()
    check(alignment.count(ALIGNMENT_AFTER) == 1, 'one exact resource-routing alignment adapter')
    check(alignment.replace(ALIGNMENT_AFTER, ALIGNMENT_BEFORE, 1).encode() ==
          git(repo, 'show', f'{baseline}:aa/tools/verify_alignment.py'),
          'all other alignment checks and bytes remain identical')

    old = git(repo, 'show', f'{baseline}:aa/w1/index.html').decode()
    old_source = git(repo, 'show', f'{baseline}:aa/tools/lessons/w1.html').decode()
    check(old == old_source, 'the published Turkish lesson fixture exactly matched its canonical source')
    tr_raw, en_raw = [(root / name).read_text() for name in ('w1/tr/index.html', 'w1/index.html')]
    expected_tr, teacher = expected_turkish(old)
    check(tr_raw == expected_tr,
          'every Turkish lesson byte survives except the exact URL/header/teacher/NoJS/clarification/option migration')
    teaching = (root / 'resources/teaching/index.html').read_text()
    inner_teacher = re.sub(r'^<details[^>]*>|</details>$', '', teacher)
    check(teaching.count('<details id="week1-tr" lang="tr">' + inner_teacher + '</details>') == 1,
          'all original Turkish teacher guidance moves verbatim into its dedicated teaching entry')
    check('id="week1-en" lang="en"' in teaching, 'English teacher guidance is separately available')
    tr, en, old_page = Page(tr_raw), Page(en_raw), Page(old)
    for language, page, raw in (('tr', tr, tr_raw), ('en', en, en_raw)):
        check(page.ids == old_page.ids, f'all existing lesson IDs and their order survive: {language}')
        check(len(page.ids) == len(set(page.ids)), f'lesson IDs are unique: {language}')
        check(page.find('teacher-note').tag == 'span' and raw.count(TEACHER_ANCHOR) == 1,
              f'the old teacher anchor remains without teacher-only prose on the student route: {language}')
        check(not any(x.tag == 'details' and x.attrs.get('id') == 'teacher-note' for x in page.nodes),
              f'instructor-only details are removed from the student lesson: {language}')
        check(sum(x.tag == 'main' for x in page.nodes) == sum(x.tag == 'h1' for x in page.nodes) == 1,
              f'one main learning surface and one title: {language}')
        check(any(x.tag == 'html' and x.attrs.get('lang') == language for x in page.nodes),
              f'correct document language: {language}')
        check(any(x.tag == 'meta' and x.attrs.get('name') == 'viewport' and 'device-width' in x.attrs.get('content', '') for x in page.nodes),
              f'responsive viewport: {language}')
        buttons = [x for x in page.nodes if x.tag == 'button' and x.attrs.get('type') == 'submit']
        check(len(buttons) == 2 and all({'hidden', 'disabled'} <= set(x.attrs) for x in buttons),
              f'both number-check buttons are initially hidden and disabled for NoJS fallback: {language}')
        check(page.find('trace-case').tag == 'select' and
              [x.attrs.get('value') for x in page.find('trace-case').walk() if x.tag == 'option'] ==
              ['worked', 'early', 'duplicate', 'absent', 'empty'], f'all five trace presets are preserved: {language}')
        check(all(not name.startswith('on') for x in page.nodes for name in x.attrs),
              f'no inline executable event handlers: {language}')
        check([x.attrs.get('id') for x in page.nodes if x.tag == 'form'] == ['guided-form', 'independent-form'],
              f'the two original practice forms remain: {language}')

    # Ignore translated human text and accessible labels, not IDs, form
    # constraints, event hooks, class names, regions, states or DOM order.
    def skeleton(page, location):
        ignored = {'aria-label', 'placeholder', 'title', 'lang', 'hreflang'}
        def resolved(name, value):
            if name in ('href', 'src') and urlsplit(value).path:
                parts = urlsplit(value)
                target = (location.parent / unquote(parts.path)).resolve()
                if target.is_dir():
                    target /= 'index.html'
                return str(target.relative_to(repo)), parts.query, parts.fragment
            return value
        return [(x.tag, sorted((k, resolved(k, v)) for k, v in x.attrs.items() if k not in ignored))
                for x in page.find('main').walk()]
    check(skeleton(en, root / 'w1/index.html') == skeleton(tr, root / 'w1/tr/index.html'),
          'EN and TR retain the identical main DOM, resolved link targets and all structural/accessibility/form attributes')
    # English writes several Turkish word ordinals as digits and changes the
    # closing comparison's word order. Enumerate those six exact differences;
    # require every other individual text node's numerical content to match.
    numerical_translations = []
    for a, b in zip(en.find('main').walk(), tr.find('main').walk()):
        local_numbers = lambda node: re.findall(r'\d+', ''.join(x for x in node.children if isinstance(x, str)))
        left, right = local_numbers(a), local_numbers(b)
        if left != right:
            numerical_translations.append((a.tag, left, right))
    check(numerical_translations == [
        ('li', ['2'], []), ('p', ['2', '5', '19', '3', '19', '19'], ['5', '19', '19', '19']),
        ('p', ['1', '18', '3'], ['1', '18']), ('li', ['2', '14', '4'], ['14']),
        ('li', ['2'], []), ('p', ['40', '4'], ['4', '40']),
    ], 'all numeric text matches except the six explicitly enumerated ordinal/word-order translations')
    expected_ranges = {'guided-position': (1, 4), 'guided-count': (0, 4),
                       'exit-position': (1, 4), 'exit-count': (0, 4),
                       'exit-length': (0, 12), 'exit-last': (1, 4)}
    for language, page in (('en', en), ('tr', tr)):
        for ident, (lower, upper) in expected_ranges.items():
            check(all(page.find(ident).attrs.get(k) == v for k, v in
                      {'type': 'number', 'min': str(lower), 'max': str(upper), 'step': '1', 'inputmode': 'numeric'}.items()),
                  f'exact numeric input contract: {language} #{ident}')
        check(all(page.find(ident).tag == 'textarea' for ident in
                  ('guided-reason', 'exit-trace', 'exit-math', 'exit-purpose', 'exit-link')),
              f'all explanations in the four learning dimensions remain available: {language}')

    old_js = git(repo, 'show', f'{baseline}:aa/w1/lesson.js').decode()
    check(old_js.count(ENABLE_BEFORE) == 1, 'the old UI contains exactly one NoJS enable block')
    expected_js = old_js.replace(ENABLE_BEFORE, ENABLE_AFTER).replace(
        "'Konum ' + revealed + ' hedef değil.",
        "'Konum ' + revealed + ' içindeki değer hedefe eşit değil.")
    check((root / 'w1/lesson.js').read_text() == expected_js.rstrip() + '\n',
          'the original Turkish UI changes only the exact NoJS enable and value-versus-position wording')
    for name in ('lesson.js', 'lesson.en.js'):
        text = (root / 'w1' / name).read_text()
        check(text.count(ENABLE_AFTER) == 1, f'only ready JavaScript enables number checks: {name}')
        check("window.addEventListener('beforeprint'" in text and "window.addEventListener('afterprint'" in text,
              f'print expands and restores the complete paper trace: {name}')
        subprocess.run(['node', '--check', str(root / 'w1' / name)], check=True, capture_output=True)
        check(True, f'JavaScript syntax: {name}')
    js = javascript_contract(root)
    for field in ('cases', 'checks', 'numeric', 'reset', 'events', 'refs', 'guided', 'model_results'):
        check(js['contracts']['en'][field] == js['contracts']['tr'][field],
              f'both localized UIs use the same operational contract: {field}')
    check(js['contracts']['en']['checks'] == [[k, *expected_ranges[k], v] for k, v in
          [('exit-position', 2), ('exit-count', 2), ('exit-length', 4), ('exit-last', 4)]],
          'both independent-form number keys match the required first/last result and length')
    check((js['guided']['position'], js['guided']['comparisons']) == (3, 3),
          'the guided example returns position 3 after exactly 3 equality tests')
    check((js['independent']['position'], js['independent']['comparisons']) == (2, 2),
          'the independent first-match example returns position 2 after exactly 2 equality tests')
    check(js['oracle_cases'] == 1820, 'the unchanged shared model passes 1,820 independent finite-list/first-match cases')
    for language, page in (('en', en), ('tr', tr)):
        table = next(x for x in page.nodes if x.tag == 'details' and x.attrs.get('class') == 'worked-table')
        body = next(x for x in table.walk() if x.tag == 'tbody')
        numeric_rows = [[int(x.text()) for x in list(row.walk())[1:] if x.tag == 'td' and re.fullmatch(r'\d+', x.text())][:2]
                        for row in body.children if isinstance(row, Node) and row.tag == 'tr']
        check(numeric_rows == [[1, 18], [2, 7], [3, 18], [4, 24]], f'the visible paper trace matches the shared model: {language}')
        cases = js['contracts'][language]['model_results']
        check([(cases[k]['position'], cases[k]['comparisons']) for k in ('worked', 'early', 'duplicate', 'absent', 'empty')] ==
              [(4, 4), (2, 2), (1, 1), (None, 4), (None, 0)], f'all boundary presets retain their exact position/count pairs: {language}')

    pages = {destination: Page((root / destination).read_text()) for destination in COPIES.values()}
    references = []
    for destination, page in pages.items():
        check(len(page.ids) == len(set(page.ids)), f'unique IDs on route: {destination}')
        for node in page.nodes:
            for attribute in ('href', 'src'):
                if attribute not in node.attrs:
                    continue
                value = node.attrs[attribute]
                parsed = urlsplit(value)
                check(not parsed.scheme and not parsed.netloc and not value.startswith('//') and '\\' not in value,
                      f'portable local URL: {destination} {value}')
                check(parsed.query in ('', 'v=1', 'v=2', 'v=aligned'), f'known cache/version query: {destination} {value}')
                target = ((root / destination).parent / unquote(parsed.path)).resolve() if parsed.path else root / destination
                check(target.is_relative_to(repo), f'reference remains inside course site: {destination} {value}')
                if target.is_dir():
                    target /= 'index.html'
                check(target.is_file(), f'local target exists: {destination} {value}')
                if parsed.fragment:
                    check(fragment_exists(target, unquote(parsed.fragment)), f'real static or legacy fragment exists: {destination} {value}')
                references.append({'from': destination, 'url': value, 'target': str(target.relative_to(repo))})
    home = pages['index.html']
    schedule = home.find('schedule')
    check([x.attrs['href'] for x in schedule.walk() if x.tag == 'a'] == [f'w{n}/' for n in range(1, 15)],
          'one ordered schedule entry leads to each of the fourteen current lessons')
    check({'w1/', 'bridge/', 'resources/', 'resources/teaching/', 'play-lab/'} <= set(home.links()),
          'the home exposes a single weekly start and named optional-resource destinations')
    check(not any(x.tag == 'script' for x in home.nodes), 'the simplified home needs no progress or bridge injection script')
    check('Week 1 has English and Turkish editions' in home.root.text() and
          'Weeks 2–14 currently open in Turkish' in home.root.text(), 'the homepage states the actual language availability')
    check([x.attrs['src'] for x in en.nodes if x.tag == 'script'] == ['model.js?v=1', 'lesson.en.js?v=1'] and
          [x.attrs['src'] for x in tr.nodes if x.tag == 'script'] == ['../model.js?v=1', '../lesson.js?v=2'],
          'both editions load the same model and their own localized UI')
    for language, page, other, href in (('en', en, 'tr', 'tr/'), ('tr', tr, 'en', '../')):
        check(any(x.tag == 'link' and x.attrs == {'rel': 'alternate', 'hreflang': other, 'href': href} for x in page.nodes),
              f'correct discoverable alternate language: {language}')
        check(any(x.tag == 'a' and x.attrs.get('hreflang') == other and x.attrs.get('href') == href for x in page.nodes),
              f'visible direct switch to the other edition: {language}')
        check(any(x.tag == 'span' and x.attrs.get('aria-current') == 'page' and x.attrs.get('lang') == language for x in page.nodes),
              f'current lesson language is accessible: {language}')

    # Route adaptation may move a complete legacy panel, but its old numeric
    # assertions and numerical helpers must never be discarded or weakened.
    bridges_before = ast.parse(git(repo, 'show', f'{baseline}:aa/tools/verify_learning_bridges.py').decode())
    bridges_after = ast.parse((root / 'tools/verify_learning_bridges.py').read_text())
    assertions = lambda tree: [ast.dump(x, include_attributes=False) for x in ast.walk(tree) if isinstance(x, ast.Assert)]
    check(len(assertions(bridges_before)) == 101 and assertions(bridges_before) == assertions(bridges_after),
          'all 101 legacy assertions survive with identical ASTs')
    functions = lambda tree: {x.name: ast.dump(x, include_attributes=False) for x in tree.body if isinstance(x, ast.FunctionDef)}
    prior_functions, current_functions = functions(bridges_before), functions(bridges_after)
    check(set(prior_functions) == set(current_functions) and all(v == current_functions[k] for k, v in prior_functions.items() if k != 'reference_source'),
          'all 29 unchanged legacy functions retain identical ASTs; only the pinned home-reference adapter changes')

    return {'status': 'passed', 'baseline': baseline, 'checks': len(checks),
            'baseline_files': len(before), 'protected_files': len(protected),
            'modified_existing': sorted(changed), 'added': sorted(NEW_FILES),
            'canonical_copies': COPIES, 'references_checked': len(references),
            'references': references, 'shared_model_oracle_cases': js['oracle_cases'],
            'legacy_assertions_unchanged': 101, 'legacy_functions_unchanged': 29,
            'file_sha256': pins, 'passed_checks': checks}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='AA directory in the checkout')
    parser.add_argument('--baseline', default=BASELINE)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    result = verify(args.root, args.baseline)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k not in ('references', 'file_sha256', 'passed_checks')}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
