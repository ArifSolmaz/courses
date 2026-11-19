#!/usr/bin/env python3
"""Pinned read-only audit for the Week 3 English/Turkish migration.

The earlier preservation audits are immutable historical evidence. This audit
has its own exact migration scope; it neither executes nor weakens them.
Browser/mobile/print and disposable build checks are separate evidence.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import json
import re
import subprocess

from verify_home_week1_bilingual import Page, git, sha, blob_sha, TEACHER_ANCHOR
from aligned.page_links import fragment_exists

ROOT = Path(__file__).resolve().parents[1]
BASELINE = 'dfa75c4b42c04d36f4f58d856ae99b7db164d1fb'
EXISTING = {
    'aa/README.md', 'aa/index.html', 'aa/tools/lessons/home.html',
    'aa/resources/teaching/index.html', 'aa/tools/lessons/teaching.html',
    'aa/w2/index.html', 'aa/tools/lessons/w2.html',
    'aa/w2/tr/index.html', 'aa/tools/lessons/w2.tr.html',
    'aa/w3/index.html', 'aa/tools/lessons/w3.html', 'aa/w3/lesson.css',
}
ADDED = {'aa/tools/lessons/w3.tr.html', 'aa/w3/tr/index.html',
         'aa/w3/lesson.en.js', 'aa/tools/verify_week3_bilingual.py'}
COPIES = {'tools/lessons/w3.html': 'w3/index.html', 'tools/lessons/w3.tr.html': 'w3/tr/index.html',
          'tools/lessons/w2.html': 'w2/index.html', 'tools/lessons/w2.tr.html': 'w2/tr/index.html',
          'tools/lessons/home.html': 'index.html', 'tools/lessons/teaching.html': 'resources/teaching/index.html'}
OLD_LANGUAGE = 'Weeks 1–2 have English and Turkish editions. Weeks 3–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
NEW_LANGUAGE = 'Weeks 1–3 have English and Turkish editions. Weeks 4–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
ENABLE = '''document.querySelectorAll('.js-only').forEach(node => {
    node.hidden = false;
    if (node.tagName === 'BUTTON') node.disabled = false;
  });'''


def translated_turkish(original):
    teacher = re.search(r'<details id="teacher-note".*?</details>', original, re.S).group(0)
    text = original.replace(teacher, TEACHER_ANCHOR, 1)
    for before, after in (
        ('href="../w1/lesson.css?v=1"', 'href="../../w1/lesson.css?v=1"'),
        ('href="lesson.css?v=1"', 'href="../lesson.css?v=2"'),
        ('src="model.js?v=1"', 'src="../model.js?v=1"'),
        ('src="lesson.js?v=1"', 'src="../lesson.js?v=1"'),
        ('href="../"', 'href="../../"'),
        ('href="../w2/#sequential"', 'href="../../w2/tr/#sequential"'),
        ('href="../w2/"', 'href="../../w2/tr/"'),
        ('href="../w4/"', 'href="../../w4/"'),
    ):
        assert text.count(before) == 1, f'one original Turkish URL: {before}'
        text = text.replace(before, after, 1)
    old_header = '<span class="week-label">Hafta 3 / 14</span>'
    assert text.count(old_header) == 1
    text = text.replace(old_header,
        '<div class="header-end"><span class="week-label">Hafta 3 / 14</span>'
        '<nav class="language-switch" aria-label="Ders dili"><a href="../" lang="en" hreflang="en">English</a>'
        '<span aria-current="page" lang="tr">Türkçe</span></nav></div>', 1)
    text = text.replace('<link rel="stylesheet" href="../lesson.css?v=2">',
        '<link rel="stylesheet" href="../lesson.css?v=2">\n'
        '<link rel="stylesheet" href="../../assets/lesson-language.css?v=2">\n'
        '<link rel="alternate" hreflang="en" href="../">', 1)
    return text.rstrip() + '\n', teacher


def ui_contract(root):
    """Extract declarative UI contracts; execute only the shared pure model."""
    code = r'''
const fs=require('fs'),vm=require('vm'),root=process.argv[1],model=require(root+'/w3/model.js');
const contracts={};
for(const lang of ['tr','en']){
 const s=fs.readFileSync(root+'/w3/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
 const directory=JSON.parse(s.match(/const directory = (\[[^\]]+\]);/)[1]);
 const cases=vm.runInNewContext('('+s.match(/const cases = (\{[^\n]+\});/)[1]+')');
 const independent=JSON.parse(s.match(/const values = (\[[^\]]+\]);/)[1]);
 const helpers=Object.fromEntries(['el','resetSearch','number'].map(name=>[name,s.match(new RegExp('  function '+name+'\\([\\s\\S]*?\\n  \\}'))[0]]));
 const calls=[...s.matchAll(/model\.(traceSearch|growth)\(([^;\n]*?)\)/g)].map(x=>x.slice(1,3));
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(x=>x.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 const binary=model.traceSearch(independent,30,'binary'),linear=model.traceSearch(independent,30,'linear');
 const literal=s.match(/const checks = (\[[\s\S]*?\n    \]);/)[1];
 const checks=vm.runInNewContext('('+literal+')',{binary,linear,model,values:independent,number:(id,min,max)=>({id,min,max})}).map(({id,min,max,expected})=>({id,min,max,expected}));
 contracts[lang]={directory,cases,independent,helpers,calls,events,refs,checks};
}
let searchCases=0,stepCount=0;
for(let n=0;n<=32;n++){
 const values=Array.from({length:n},(_,i)=>2*i);
 for(let target=-1;target<=2*n+1;target++)for(const mode of ['linear','binary']){
  const r=model.traceSearch(values,target,mode),index=values.indexOf(target);
  if(r.position!==(index<0?null:index+1)||r.probes!==r.steps.length)throw Error('position/probe oracle');
  if(mode==='linear'&&r.probes!==(index<0?n:index+1))throw Error('linear-count oracle');
  if(mode==='binary'&&r.probes>(n?Math.floor(Math.log2(n))+1:0))throw Error('halving bound');
  let left=1,right=n;
  r.steps.forEach((s,k)=>{
   const position=mode==='binary'?Math.floor((left+right)/2):left,value=values[position-1];
   const relation=value<target?-1:value>target?1:0;
   let nextLeft=left,nextRight=right;
   if(relation!==0){if(mode==='linear'||relation<0)nextLeft=position+1;else nextRight=position-1;}
   if(s.probe!==k+1||s.position!==position||s.value!==value||s.relation!==relation||s.left!==left||s.right!==right||s.mid!==(mode==='binary'?position:null)||s.nextLeft!==nextLeft||s.nextRight!==nextRight||s.candidatesBefore[0]!==left||s.candidatesBefore[1]!==right)throw Error('one-based interval-step oracle');
   left=nextLeft;right=nextRight;stepCount++;
  });searchCases++;
 }
}
let growthCases=0;
for(const n of [...Array.from({length:1025},(_,i)=>i),1000000]){
 const g=model.growth(n);
 if(g.n!==n||g.linear!==n+n||g.quadratic!==n*n||g.doubleN!==2*n||g.linearAtDouble!==4*n||g.quadraticAtDouble!==4*n*n)throw Error('growth oracle');growthCases++;
}
const guided=model.traceSearch(contracts.en.directory,11,'binary');
console.log(JSON.stringify({contracts,search_cases:searchCases,search_steps:stepCount,growth_cases:growthCases,guided:[guided.position,guided.probes]}));
'''
    return json.loads(subprocess.check_output(['node', '-e', code, str(root)], text=True))


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo, checks, hashes = root.parent, [], {}

    def check(ok, label):
        assert ok, label
        checks.append(label)

    check(baseline == BASELINE, 'the fixture is the published bilingual-W2 baseline')
    blobs = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            meta, name = row.split(b'\t')
            blobs[name.decode()] = meta.decode().split()[2]
    check(len(blobs) == 583, 'the pinned baseline contains exactly 583 AA files')
    names = {n.decode() for n in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if n}
    check(names - set(blobs) == ADDED, 'exactly four new bilingual-W3 files are present')
    check(set(blobs) <= names, 'no baseline AA file is deleted')
    changed = set()
    for name, digest in blobs.items():
        data = (repo / name).read_bytes()
        if blob_sha(data) != digest:
            changed.add(name)
        if name not in EXISTING:
            check(blob_sha(data) == digest, f'protected baseline bytes: {name}')
    check(changed == EXISTING, 'exactly twelve authorized existing files change')
    for name in sorted(names):
        hashes[name] = sha((repo / name).read_bytes())
    for source, destination in COPIES.items():
        check((root / source).read_bytes() == (root / destination).read_bytes(), f'canonical byte copy: {destination}')
    old = lambda name: git(repo, 'show', f'{baseline}:aa/{name}').decode()
    for name in ('tools/lessons/w2.html', 'w2/index.html', 'tools/lessons/w2.tr.html', 'w2/tr/index.html'):
        before = old(name)
        a, b = ('href="../../w3/"', 'href="../../w3/tr/"') if '.tr.' in name or '/tr/' in name else ('Week 3 (Turkish): compare growth, choose a method →', 'Week 3: compare growth, choose a method →')
        check(before.count(a) == 1 and (root / name).read_text() == before.replace(a, b, 1), f'W2 changes only its same-language next URL or label: {name}')
    for name in ('index.html', 'tools/lessons/home.html'):
        before = old(name)
        check(before.count(OLD_LANGUAGE) == 1 and (root / name).read_text() == before.replace(OLD_LANGUAGE, NEW_LANGUAGE, 1), f'home changes only language availability: {name}')
    check((root / 'README.md').read_bytes().startswith(old('README.md').encode()), 'README documentation is append-only')
    fixed_column = 'grid-template-columns:repeat(auto-fit,minmax(min(100%,8em),1fr))'
    intrinsic_column = 'grid-template-columns:repeat(auto-fit,minmax(min(100%,10em),1fr))'
    original_css = old('w3/lesson.css')
    check(original_css.count(fixed_column) == 1 and (root / 'w3/lesson.css').read_text() ==
          original_css.replace(fixed_column, intrinsic_column, 1),
          'the local stylesheet changes only the measured 8em-to-10em native-select grid width')
    old_w3 = old('w3/index.html')
    check(old_w3 == old('tools/lessons/w3.html'), 'the published Turkish main equalled its canonical source')
    expected_tr, teacher = translated_turkish(old_w3)
    tr_raw, en_raw = (root / 'w3/tr/index.html').read_text(), (root / 'w3/index.html').read_text()
    check(tr_raw == expected_tr, 'every Turkish W3 byte is preserved except its exact routing/header/teacher migration')
    teaching, original_teaching = (root / 'resources/teaching/index.html').read_text(), old('resources/teaching/index.html')
    position = original_teaching.rfind('</section>')
    check(teaching.startswith(original_teaching[:position]) and teaching.endswith(original_teaching[position:]), 'all prior teacher-hub bytes remain around one additive W3 insertion')
    addition = teaching[position:-len(original_teaching[position:])]
    teacher_tr = teacher.replace('<details id="teacher-note" class="teacher-note">', '<details id="week3-tr" lang="tr">', 1)
    en_match = re.search(r'<details id="week3-en".*?</details>', addition, re.S)
    heading = re.match(r'<h3>Week 3 · [^<]+</h3>\n', addition)
    check(en_match is not None and heading is not None, 'a named W3 teaching entry contains an English edition')
    teacher_en = en_match.group(0)
    check(addition == heading.group(0) + teacher_tr + '\n' + teacher_en.strip() + '\n', 'the addition contains only its heading, verbatim original Turkish guidance and its English edition')
    check(teacher_tr.count('<p>') == teacher_en.count('<p>') == 4, 'both teacher editions retain four guidance paragraphs')
    numbers = lambda raw: [re.findall(r'\d+', n.text()) for n in Page(raw).nodes if n.tag == 'p']
    check(numbers(teacher_tr) == numbers(teacher_en), 'teacher timings and numeric references are preserved in translation')

    en, tr, original = Page(en_raw), Page(tr_raw), Page(old_w3)
    ranges = {'guided-position': (1, 8), 'guided-probes': (0, 8), 'exit-position': (1, 7),
              'exit-binary': (0, 7), 'exit-linear': (0, 7), 'exit-square': (0, 100)}
    for language, page, raw in (('en', en, en_raw), ('tr', tr, tr_raw)):
        check(page.ids == original.ids and len(page.ids) == len(set(page.ids)), f'complete unique ordered lesson IDs: {language}')
        check(page.find('teacher-note').tag == 'span' and raw.count(TEACHER_ANCHOR) == 1, f'the old teacher anchor remains without instructor prose on the student route: {language}')
        check(any(n.tag == 'html' and n.attrs.get('lang') == language for n in page.nodes), f'correct document language: {language}')
        check(sum(n.tag == 'h1' for n in page.nodes) == sum(n.tag == 'main' for n in page.nodes) == 1, f'one main and title: {language}')
        check([n.attrs.get('id') for n in page.nodes if n.tag == 'form'] == ['guided-form', 'independent-form'], f'two original practice forms: {language}')
        submits = [n for n in page.nodes if n.tag == 'button' and n.attrs.get('type') == 'submit']
        check(len(submits) == 2 and all({'hidden', 'disabled'} <= set(n.attrs) for n in submits), f'both NoJS submits are hidden and disabled: {language}')
        for ident, (lower, upper) in ranges.items():
            check(all(page.find(ident).attrs.get(k) == v for k, v in {'type': 'number', 'min': str(lower), 'max': str(upper), 'step': '1', 'inputmode': 'numeric'}.items()), f'numeric constraint: {language} #{ident}')
        for ident, expected in (
            ('growth-n', ['1', '2', '4', '8', '16', '32']),
            ('search-case', ['worked', 'first', 'guided', 'missing', 'last', 'empty']),
            ('search-mode', ['binary', 'linear']),
        ):
            check([n.attrs.get('value') for n in page.find(ident).walk() if n.tag == 'option'] == expected, f'exact preset contract: {language} #{ident}')
        check([n.attrs['src'] for n in page.nodes if n.tag == 'script'] == (['model.js?v=1', 'lesson.en.js?v=1'] if language == 'en' else ['../model.js?v=1', '../lesson.js?v=1']), f'unchanged shared model and the correct localized UI: {language}')
        check([n.attrs['href'] for n in page.nodes if n.tag == 'link' and n.attrs.get('rel') == 'stylesheet'] ==
              (['../w1/lesson.css?v=1', 'lesson.css?v=2', '../assets/lesson-language.css?v=2'] if language == 'en' else
               ['../../w1/lesson.css?v=1', '../lesson.css?v=2', '../../assets/lesson-language.css?v=2']), f'unchanged shared styles and properly versioned local select-width fix: {language}')
        check([v for v in page.links() if 'w2/' in v] == (['../w2/#sequential', '../w2/'] if language == 'en' else ['../../w2/tr/#sequential', '../../w2/tr/']), f'the prerequisite and back link retain the current language: {language}')
        other, href = ('tr', 'tr/') if language == 'en' else ('en', '../')
        check(any(n.tag == 'a' and n.attrs.get('href') == href and n.attrs.get('hreflang') == other for n in page.nodes), f'visible direct alternate-language link: {language}')
        check(any(n.tag == 'link' and n.attrs == {'rel': 'alternate', 'href': href, 'hreflang': other} for n in page.nodes), f'discoverable alternate-language URL: {language}')
        check(any(n.tag == 'span' and n.attrs.get('aria-current') == 'page' and n.attrs.get('lang') == language for n in page.nodes), f'accessible current-language marker: {language}')
        check(all(not k.startswith('on') for n in page.nodes for k in n.attrs), f'no inline executable handlers: {language}')

    def skeleton(page, location):
        ignored = {'aria-label', 'placeholder', 'title', 'lang', 'hreflang'}
        def value(k, v):
            if k == 'href' and urlsplit(v).path:
                u = urlsplit(v)
                target = (location.parent / u.path).resolve()
                if target.is_dir():
                    target /= 'index.html'
                relative = str(target.relative_to(root)).replace('w2/tr/index.html', 'w2/index.html')
                return relative, u.query, u.fragment
            return v
        return [(n.tag, sorted((k, value(k, v)) for k, v in n.attrs.items() if k not in ignored)) for n in page.find('main').walk()]
    check(skeleton(en, root / 'w3/index.html') == skeleton(tr, root / 'w3/tr/index.html'), 'EN/TR main DOM, state hooks, form attributes and corresponding resolved links are identical')
    for label, selector in (('table numbers', lambda n: n.tag in ('td', 'th')), ('pseudocode literals', lambda n: n.tag == 'pre')):
        extract = lambda page: [re.findall(r'\d+', n.text()) for n in page.nodes if selector(n)]
        check(extract(en) == extract(tr), f'identical {label} in both language editions')
    # English spells out the two growth factors and reverses the natural
    # value/position word order twice. Pin those four precise differences;
    # every other individual lesson text node keeps its numerical sequence.
    numerical_translations = []
    for a, b in zip(en.find('main').walk(), tr.find('main').walk()):
        local = lambda n: re.findall(r'\d+', ''.join(x for x in n.children if isinstance(x, str)))
        left, right = local(a), local(b)
        if left != right:
            numerical_translations.append((a.tag, left, right))
    check(numerical_translations == [
        ('p', [], ['2']), ('p', [], ['4']),
        ('p', ['4', '7', '11', '18', '24', '31', '42', '56', '18', '4', '1', '3'],
         ['4', '7', '11', '18', '24', '31', '42', '56', '4', '18', '1', '3']),
        ('strong', ['30', '2'], ['2', '30']),
    ], 'all numeric text matches except the four explicit spelling/word-order translations')
    mathematical = re.compile(r'[\s0-9nC()×²=+\-−*/.,\[\]←≤<>]+')
    formulas = lambda page: [re.sub(r'\s+', '', n.text()) for n in page.nodes
                             if n.tag in ('strong', 'code') and mathematical.fullmatch(n.text())]
    check(formulas(en) == formulas(tr), 'all standalone formulas, comparison operators, numeric arrays and rubric scores remain identical')
    for name in ('lesson.js', 'lesson.en.js'):
        script = (root / 'w3' / name).read_text()
        check(script.count(ENABLE) == 1, f'only initialized JavaScript enables the existing hidden controls: {name}')
        check("window.addEventListener('beforeprint'" in script and "window.addEventListener('afterprint'" in script, f'worked-trace print/restore hooks: {name}')
        subprocess.run(['node', '--check', str(root / 'w3' / name)], check=True, capture_output=True)
    ui = ui_contract(root)
    check(ui['contracts']['en'] == ui['contracts']['tr'], 'localized UIs share directory/cases, pure helpers, model calls, event targets, DOM references and numeric keys')
    check(ui['guided'] == [3, 3], 'guided binary search returns position 3 after three abstract probes')
    check([c['expected'] for c in ui['contracts']['en']['checks']] == [6, 2, 6, 49], 'independent keys preserve position, binary probes, linear probes and the distinct quadratic report')
    check(ui['search_cases'] == 2310 and ui['growth_cases'] == 1026, 'all independent ordered-interval and growth-oracle cases pass')

    references = []
    for destination in COPIES.values():
        page = Page((root / destination).read_text())
        check(len(page.ids) == len(set(page.ids)), f'unique IDs on the changed route: {destination}')
        for node in page.nodes:
            for attribute in ('href', 'src'):
                if attribute not in node.attrs:
                    continue
                value = node.attrs[attribute]
                u = urlsplit(value)
                check(not u.scheme and not u.netloc and '\\' not in value and u.query in ('', 'v=1', 'v=2'), f'portable local reference: {destination} {value}')
                target = ((root / destination).parent / unquote(u.path)).resolve() if u.path else root / destination
                if target.is_dir():
                    target /= 'index.html'
                check(target.is_relative_to(repo) and target.is_file(), f'local target exists: {destination} {value}')
                if u.fragment:
                    check(fragment_exists(target, unquote(u.fragment)), f'actual fragment exists: {destination} {value}')
                references.append({'source': destination, 'url': value, 'target': str(target.relative_to(repo))})
    return {'status': 'passed', 'baseline': baseline, 'checks': len(checks), 'baseline_files': len(blobs),
            'protected_files': len(blobs) - len(EXISTING), 'modified_existing': sorted(changed), 'added': sorted(ADDED),
            'references_checked': len(references), 'references': references, 'canonical_copies': COPIES,
            'search_oracle_cases': ui['search_cases'], 'search_steps_checked': ui['search_steps'],
            'growth_oracle_cases': ui['growth_cases'], 'file_sha256': hashes, 'passed_checks': checks}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--baseline', default=BASELINE)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    report = verify(args.root, args.baseline)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k not in ('references', 'file_sha256', 'passed_checks')}, ensure_ascii=False, indent=2))
