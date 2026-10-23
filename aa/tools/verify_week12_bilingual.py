#!/usr/bin/env python3
"""Pinned read-only audit for the Week 12 English/Turkish migration.

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
BASELINE = '387f7803d7d290b7619188ee6d7317eaaaa94875'
EXISTING = {
    'aa/README.md', 'aa/index.html', 'aa/tools/lessons/home.html',
    'aa/resources/teaching/index.html', 'aa/tools/lessons/teaching.html',
    'aa/w11/index.html', 'aa/tools/lessons/w11.html',
    'aa/w11/tr/index.html', 'aa/tools/lessons/w11.tr.html',
    'aa/w12/index.html', 'aa/tools/lessons/w12.html',
}
ADDED = {'aa/tools/lessons/w12.tr.html', 'aa/w12/tr/index.html',
         'aa/w12/lesson.en.js', 'aa/tools/verify_week12_bilingual.py'}
COPIES = {'tools/lessons/w12.html': 'w12/index.html', 'tools/lessons/w12.tr.html': 'w12/tr/index.html',
          'tools/lessons/w11.html': 'w11/index.html', 'tools/lessons/w11.tr.html': 'w11/tr/index.html',
          'tools/lessons/home.html': 'index.html', 'tools/lessons/teaching.html': 'resources/teaching/index.html'}
OLD_LANGUAGE = 'Weeks 1–11 have English and Turkish editions. Weeks 12–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
NEW_LANGUAGE = 'Weeks 1–12 have English and Turkish editions. Weeks 13–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
ENABLE = ("document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});", "document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});")


def translated_turkish(original):
    teacher = re.search(r'<details id="teacher-note".*?</details>', original, re.S).group(0)
    text = original.replace(teacher, TEACHER_ANCHOR, 1)
    for before, after in (
        ('href="../w1/lesson.css?v=1"', 'href="../../w1/lesson.css?v=1"'),
        ('href="lesson.css?v=1"', 'href="../lesson.css?v=1"'),
        ('src="model.js?v=1"', 'src="../model.js?v=1"'),
        ('src="lesson.js?v=1"', 'src="../lesson.js?v=1"'),
        ('href="../"', 'href="../../"'),
        ('href="../w11/#need"', 'href="../../w11/tr/#need"'),
        ('href="../w11/"', 'href="../../w11/tr/"'),
        ('href="../w7/#recursion"', 'href="../../w7/tr/#recursion"'),
        ('href="../w9/#dfs"', 'href="../../w9/tr/#dfs"'),
        ('href="../w13/"', 'href="../../w13/"'),
    ):
        assert text.count(before) == 1, f'one original Turkish URL: {before}'
        text = text.replace(before, after, 1)
    old_header = '<span class="week-label">Hafta 12 / 14</span>'
    assert text.count(old_header) == 1
    text = text.replace(old_header,
        '<div class="header-end"><span class="week-label">Hafta 12 / 14</span>'
        '<nav class="language-switch" aria-label="Ders dili"><a href="../" lang="en" hreflang="en">English</a>'
        '<span aria-current="page" lang="tr">Türkçe</span></nav></div>', 1)
    text = text.replace('<link rel="stylesheet" href="../lesson.css?v=1">',
        '<link rel="stylesheet" href="../lesson.css?v=1">\n'
        '<link rel="stylesheet" href="../../assets/lesson-language.css?v=2">\n'
        '<link rel="alternate" hreflang="en" href="../">', 1)
    text = re.sub(r'(?:\[[^\]<>]*\]|\{[^}<>]*\})', lambda m: re.sub(r',(?=\S)', ', ', m.group(0)), text)
    text = re.sub(r'(?<=\d)([→←–])(?=\d)', r' \1 ', text)
    return text.rstrip() + '\n', teacher


def ui_contract(root):
    """Compare localized source operations without depending on translated prose."""
    code = r"""
const fs=require('fs'),vm=require('vm'),root=process.argv[1],model=require(root+'/w12/model.js');
const contracts={};
for(const lang of ['tr','en']){
 const s=fs.readFileSync(root+'/w12/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
 const data=vm.runInNewContext(s.slice(s.indexOf('  const vertices'),s.indexOf('  let task,'))+'\n({vertices,edges,independentVertices,independentEdges,cases})');
 for(const item of Object.values(data.cases))delete item.text;
 const expected=model.traceWalks(data.independentVertices,data.independentEdges,18,4,5);
 const checks=vm.runInNewContext('('+s.match(/const checks\s*=\s*(\[[^\n]*\]);/)[1]+')',{expected,number:(id,min,max)=>({id,min,max})}).map(({id,min,max,expected})=>({id,min,max,expected}));
 const calls=[...s.matchAll(/model\.(traceWalks)\(([^;\n]*?)\)/g)].map(x=>x.slice(1,3));
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(x=>x.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 const protectedStrings=[...s.matchAll(/(?:className\s*=\s*|classList\.add\(|dataset\.state\s*=\s*|setAttribute\(|el\()'([^']*)'/g)].map(x=>x[1]);
 const comparisonStrings=[...s.matchAll(/(?:===|!==)\s*'([^']+)'/g)].map(x=>x[1]);
 const literalNumbers=[...s.matchAll(/'(?:\\.|[^'\\])*'/g)].map(x=>x[0].match(/\d+/g)||[]);
 const masked=s.replace(/'(?:\\.|[^'\\])*'/g,"''");
 const labelKeys=Object.keys(vm.runInNewContext('('+s.match(/const labels=(\{[^\n]*\});/)[1]+')'));
 contracts[lang]={data,checks,calls,events,refs,protectedStrings,comparisonStrings,literalNumbers,masked,labelKeys};
}
console.log(JSON.stringify({contracts}));
"""
    try:
        return json.loads(subprocess.check_output(['node', '-e', code, str(root)], text=True, stderr=subprocess.PIPE))
    except subprocess.CalledProcessError as error:
        raise AssertionError('localized walk-search UI/data contract: ' + error.stderr.strip()) from error


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo, checks, hashes = root.parent, [], {}

    def check(ok, label):
        assert ok, label
        checks.append(label)

    check(baseline == BASELINE, 'the fixture is the published bilingual-W11 baseline')
    blobs = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            meta, name = row.split(b'\t')
            blobs[name.decode()] = meta.decode().split()[2]
    check(len(blobs) == 619, 'the pinned baseline contains exactly 619 AA files')
    names = {n.decode() for n in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if n}
    check(names - set(blobs) == ADDED, 'exactly four new bilingual-W12 files are present')
    check(set(blobs) <= names, 'no baseline AA file is deleted')
    changed = set()
    for name, digest in blobs.items():
        data = (repo / name).read_bytes()
        if blob_sha(data) != digest:
            changed.add(name)
        if name not in EXISTING:
            check(blob_sha(data) == digest, f'protected baseline bytes: {name}')
    check(changed == EXISTING, 'exactly eleven authorized existing files change')
    for name in sorted(names):
        hashes[name] = sha((repo / name).read_bytes())
    for source, destination in COPIES.items():
        check((root / source).read_bytes() == (root / destination).read_bytes(), f'canonical byte copy: {destination}')
    old = lambda name: git(repo, 'show', f'{baseline}:aa/{name}').decode()
    for name in ('tools/lessons/w11.html', 'w11/index.html', 'tools/lessons/w11.tr.html', 'w11/tr/index.html'):
        before = old(name)
        a, b = ('href="../../w12/"', 'href="../../w12/tr/"') if '.tr.' in name or '/tr/' in name else ('Continue to Week 12 (Turkish): find walks with exactly k edges →', 'Continue to Week 12: find walks with exactly k edges →')
        check(before.count(a) == 1 and (root / name).read_text() == before.replace(a, b, 1), f'W11 changes only its same-language next URL or label: {name}')
    for name in ('index.html', 'tools/lessons/home.html'):
        before = old(name)
        check(before.count(OLD_LANGUAGE) == 1 and (root / name).read_text() == before.replace(OLD_LANGUAGE, NEW_LANGUAGE, 1), f'home changes only language availability: {name}')
    check((root / 'README.md').read_bytes().startswith(old('README.md').encode()), 'README documentation is append-only')
    old_w12 = old('w12/index.html')
    check(old_w12 == old('tools/lessons/w12.html'), 'the published Turkish main equalled its canonical source')
    expected_tr, teacher = translated_turkish(old_w12)
    tr_raw, en_raw = (root / 'w12/tr/index.html').read_text(), (root / 'w12/index.html').read_text()
    check(tr_raw == expected_tr, 'every Turkish W12 byte is preserved except its exact routing/header/teacher migration and bracket/brace-list and numeric path spacing')
    teaching, original_teaching = (root / 'resources/teaching/index.html').read_text(), old('resources/teaching/index.html')
    position = original_teaching.rfind('</section>')
    check(teaching.startswith(original_teaching[:position]) and teaching.endswith(original_teaching[position:]), 'all prior teacher-hub bytes remain around one additive W12 insertion')
    addition = teaching[position:-len(original_teaching[position:])]
    teacher_tr = teacher.replace('<details id="teacher-note" class="teacher-note">', '<details id="week12-tr" lang="tr">', 1)
    en_match = re.search(r'<details id="week12-en".*?</details>', addition, re.S)
    heading = re.match(r'<h3>Week 12 · [^<]+</h3>\n', addition)
    check(en_match is not None and heading is not None, 'a named W12 teaching entry contains an English edition')
    teacher_en = en_match.group(0)
    check(addition == heading.group(0) + teacher_tr + '\n' + teacher_en.strip() + '\n', 'the addition contains only its heading, verbatim original Turkish guidance and its English edition')
    check(teacher_tr.count('<p>') == teacher_en.count('<p>') == 4, 'both teacher editions retain four guidance paragraphs')
    numbers = lambda raw: [re.findall(r'\d+', n.text()) for n in Page(raw).nodes if n.tag == 'p']
    check(numbers(teacher_tr) == numbers(teacher_en), 'teacher timings and numeric references are preserved in translation')

    en, tr, original = Page(en_raw), Page(tr_raw), Page(old_w12)
    ranges = {name:(0,100) for name in ('guided-cost','exit-cost','exit-terminals','exit-valid','exit-calls')}
    ranges['guided-remaining'] = (0,6)
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
            ('walk-case', ['main', 'two', 'none', 'zero', 'self', 'wrongzero', 'isolated']),
            ('guided-decision', ['', 'prune', 'continue']),
        ):
            check([n.attrs.get('value') for n in page.find(ident).walk() if n.tag == 'option'] == expected, f'exact preset contract: {language} #{ident}')
        check([n.attrs['src'] for n in page.nodes if n.tag == 'script'] == (['model.js?v=1', 'lesson.en.js?v=1'] if language == 'en' else ['../model.js?v=1', '../lesson.js?v=1']), f'unchanged shared model and the correct localized UI: {language}')
        check([n.attrs['href'] for n in page.nodes if n.tag == 'link' and n.attrs.get('rel') == 'stylesheet'] ==
              (['../w1/lesson.css?v=1', 'lesson.css?v=1', '../assets/lesson-language.css?v=2'] if language == 'en' else
               ['../../w1/lesson.css?v=1', '../lesson.css?v=1', '../../assets/lesson-language.css?v=2']), f'unchanged local/shared styles and the language stylesheet: {language}')
        check([v for v in page.links() if 'w11/' in v] == (['../w11/#need', '../w11/'] if language == 'en' else ['../../w11/tr/#need', '../../w11/tr/']), f'the prerequisite and back link retain the current language: {language}')
        next_links = [n for n in page.nodes if n.tag == 'a' and 'w13/' in n.attrs.get('href', '')]
        check(len(next_links) == 1 and next_links[0].attrs['href'] == ('../w13/' if language == 'en' else '../../w13/'), f'next lesson still resolves to the current Turkish Week 13: {language}')
        if language == 'en':
            check('Turkish' in next_links[0].text(), 'the English next link explicitly labels Week 13 as Turkish')
            check(not re.search(r'\b(?:seçildi|elendi|bileşen|maliyet|çevrim|Cihaz|Hafta)\b', page.find('main').text(), re.I), 'the English student lesson contains no untranslated Turkish interface or lesson prose')
        check([v for v in page.links() if 'w7/' in v] == (['../w7/#recursion'] if language == 'en' else ['../../w7/tr/#recursion']), f'the recursion prerequisite retains the current language: {language}')
        check(page.find('walk-prune').attrs == {'id':'walk-prune','type':'checkbox'}, f'optional pruning starts unchecked: {language}')
        check([v for v in page.links() if 'w9/' in v] == (['../w9/#dfs'] if language == 'en' else ['../../w9/tr/#dfs']), f'DFS prerequisite retains the current language: {language}')
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
                relative = str(target.relative_to(root)).replace('w11/tr/index.html', 'w11/index.html').replace('w9/tr/index.html', 'w9/index.html').replace('w7/tr/index.html', 'w7/index.html')
                return relative, u.query, u.fragment
            return v
        return [(n.tag, sorted((k, value(k, v)) for k, v in n.attrs.items() if k not in ignored)) for n in page.find('main').walk()]
    check(skeleton(en, root / 'w12/index.html') == skeleton(tr, root / 'w12/tr/index.html'), 'EN/TR main DOM, state hooks, form attributes and corresponding resolved links are identical')
    glossary={'çatı':'roof','sera':'greenhouse','kuyu':'well','pompa':'pump','bahçe':'garden','depo':'warehouse','oda':'room','kapı':'gate'}
    en_text=' '.join(x for n in en.find('main').walk() for x in n.children if isinstance(x,str))
    check(not any(re.search(r'\b'+re.escape(v)+r'\b',en_text,re.I) for v in glossary), 'no Turkish place name survives in English learner prose')
    check(all(re.search(r'\b'+v+r'\b',en_text,re.I) for v in glossary.values()), 'all eight glossary values remain in English learner prose')
    def catalog(page):
        box=next(n for n in page.nodes if n.attrs.get('class')=='edge-catalog')
        rows=[list(map(int,re.findall(r'\d+',n.text()))) for n in box.walk() if n.tag=='p']
        return {f'{a}-{b}':w for a,b,w in rows}
    expected_catalog={'4-7':1,'4-11':2,'7-11':2,'7-18':2,'20-31':2,'11-24':3,'18-24':3,'20-24':4,'26-31':4,'11-31':5}
    check(catalog(en)==catalog(tr)==expected_catalog, 'both static weighted edge catalogs preserve all ten costs and endpoint pairs')
    def svg_signature(page):
        svg=next(n for n in page.nodes if n.tag=='svg')
        return [(n.tag,sorted(n.attrs.items())) for n in svg.walk()]
    check(svg_signature(en)==svg_signature(tr)==svg_signature(original), 'all original SVG geometry, labels and accessible-title/description hooks remain identical')
    numerical_translations=[]
    for a,b in zip(en.find('main').walk(),tr.find('main').walk()):
        local=lambda n:re.findall(r'\d+',''.join(x for x in n.children if isinstance(x,str)))
        if local(a)!=local(b):numerical_translations.append((a.tag,local(a),local(b)))
    check(not numerical_translations, 'every ordered numeric token in learner prose, SVG and forms remains identical')
    mathematical=re.compile(r'[\s0-9VEcOlog()²×=+\-−*/.,\[\]←→≤≥<>]+')
    formulas=lambda page:[re.sub(r'\s+','',n.text()) for n in page.nodes if n.tag in ('strong','code') and mathematical.fullmatch(n.text())]
    check(formulas(en)==formulas(tr), 'standalone graph counts, walk prefixes and rubric scores remain identical')
    expressions=[r'O\(1\+Δ\+…\+Δᵏ\)',r'O\(Δᵏ\)',r'O\(k\+1\)',r'O\(I\(k\+1\)\)',r'c≥B',r'r=0']
    expression_counts=lambda page:[len(re.findall(pattern,re.sub(r'\s+','',page.find('main').text()))) for pattern in expressions]
    check(expression_counts(en)==expression_counts(tr), 'nonnegative pruning, terminal tests and geometric call/space bounds retain every occurrence')
    for name in ('lesson.js', 'lesson.en.js'):
        script = (root / 'w12' / name).read_text()
        check(all(script.count(code)==1 for code in ENABLE), f'only initialized JavaScript enables the existing hidden widgets and form submits: {name}')
        check("window.addEventListener('beforeprint'" in script and "window.addEventListener('afterprint'" in script, f'worked-trace print/restore hooks: {name}')
        subprocess.run(['node', '--check', str(root / 'w12' / name)], check=True, capture_output=True)
    ui = ui_contract(root)
    check(ui['contracts']['en']==ui['contracts']['tr'], 'localized UIs share exact weighted data, seven presets, calls, events, DOM hooks and every non-text operation')
    data=ui['contracts']['en']['data']
    check(data['vertices']==[4,7,11,18,20,24,26,31] and data['edges']==[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]], 'all original vertices and ten undirected weighted candidates are pinned')
    check(data['independentVertices']==[4,7,18,24] and data['independentEdges']==[[18,24,3],[24,7,1],[7,4,2]], 'the independent task preserves its four devices and three costs')
    check([c['expected'] for c in ui['contracts']['en']['checks']]==[8,8,3,20], 'independent fields retain cost8/terminals8/valid3/calls20')
    check(list(data['cases'])==['main','two','none','zero','self','wrongzero','isolated'], 'seven presets retain their original keys and order')
    check([(c['source'],c['target'],c['k']) for c in data['cases'].values()]==[(24,31,4),(24,31,2),(24,31,3),(24,31,4),(24,24,0),(24,31,0),(24,26,4)], 'source, target and exact-edge counts remain unchanged')
    check(ui['contracts']['en']['labelKeys']==['open','expanded','valid','invalid','pruned','deadend'], 'opened choice-tree status keys remain operational enums')

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
            'preset_cases': len(ui['contracts']['en']['data']['cases']), 'file_sha256': hashes, 'passed_checks': checks}


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
