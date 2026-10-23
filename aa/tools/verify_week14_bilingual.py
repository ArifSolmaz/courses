#!/usr/bin/env python3
"""Pinned read-only audit for the Week 14 English/Turkish migration.

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
BASELINE = '44ca03c72547c1672f6683c11ef576079e0738eb'
EXISTING = {
    'aa/README.md', 'aa/index.html', 'aa/tools/lessons/home.html',
    'aa/resources/teaching/index.html', 'aa/tools/lessons/teaching.html',
    'aa/w13/index.html', 'aa/tools/lessons/w13.html',
    'aa/w13/tr/index.html', 'aa/tools/lessons/w13.tr.html',
    'aa/w14/index.html', 'aa/tools/lessons/w14.html',
}
ADDED = {'aa/tools/lessons/w14.tr.html', 'aa/w14/tr/index.html',
         'aa/w14/lesson.en.js', 'aa/tools/verify_week14_bilingual.py'}
COPIES = {'tools/lessons/w14.html': 'w14/index.html', 'tools/lessons/w14.tr.html': 'w14/tr/index.html',
          'tools/lessons/w13.html': 'w13/index.html', 'tools/lessons/w13.tr.html': 'w13/tr/index.html',
          'tools/lessons/home.html': 'index.html', 'tools/lessons/teaching.html': 'resources/teaching/index.html'}
OLD_LANGUAGE = 'Weeks 1–13 have English and Turkish editions. Week 14 currently opens in Turkish; its English edition will be prepared next. Switch language inside each translated lesson.'
NEW_LANGUAGE = 'All 14 weeks have English and Turkish editions. Switch language inside each lesson.'
ENABLE = ("document.querySelectorAll('.js-only').forEach(n=>{n.hidden=false;});", "document.querySelectorAll('form button').forEach(n=>{n.disabled=false;});")


def translated_turkish(original):
    teacher = re.search(r'<details id="teacher-note".*?</details>', original, re.S).group(0)
    text = original.replace(teacher, TEACHER_ANCHOR, 1)
    for before, after in (
        ('href="../w1/lesson.css?v=1"', 'href="../../w1/lesson.css?v=1"'),
        ('href="lesson.css?v=1"', 'href="../lesson.css?v=1"'),
        ('src="model.js?v=1"', 'src="../model.js?v=1"'),
        ('src="lesson.js?v=1"', 'src="../lesson.js?v=1"'),
        ('href="../"', 'href="../../"'),
        ('href="../w13/#path"', 'href="../../w13/tr/#path"'),
        ('href="../w13/"', 'href="../../w13/tr/"'),
    ):
        assert text.count(before) == 1, f'one original Turkish URL: {before}'
        text = text.replace(before, after, 1)
    old_header = '<span class="week-label">Hafta 14 / 14</span>'
    assert text.count(old_header) == 1
    text = text.replace(old_header,
        '<div class="header-end"><span class="week-label">Hafta 14 / 14</span>'
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
    """Compare localized operations and problem data independently of prose."""
    code = r"""
const fs=require('fs'),vm=require('vm'),root=process.argv[1],model=require(root+'/w14/model.js'),contracts={};
for(const lang of ['tr','en']){
 const s=fs.readFileSync(root+'/w14/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
 const data=vm.runInNewContext(s.slice(s.indexOf('  const vertices'),s.indexOf('  let task,'))+'\n({vertices,edges,repeatPath,simplePath,independentVertices,independentEdges,cases})');
 for(const item of Object.values(data.cases))delete item.text;
 const good=model.traceCertificate(data.independentVertices,data.independentEdges,18,4,3,6,[18,24,7,4]),bad=model.traceCertificate(data.independentVertices,data.independentEdges,18,4,3,6,[18,7,24,4]),reduced=model.transformHamiltonianST(data.independentVertices,data.independentEdges.map(([u,v])=>[u,v]),18,4);
 const checks=vm.runInNewContext('('+s.match(/const checks\s*=\s*(\[[^\n]*\]);/)[1]+')',{good,bad,reduced,number:id=>({id})}).map(({id,expected})=>({id,expected}));
 const calls=[...s.matchAll(/model\.(traceCertificate|transformHamiltonianST)\(([^;\n]*?)\)/g)].map(m=>m.slice(1,3));
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(m=>m.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]);
 const protectedStrings=[...s.matchAll(/(?:className\s*=\s*|classList\.add\(|dataset\.state\s*=\s*|setAttribute\(|el\()'([^']*)'/g)].map(m=>m[1]);
 const comparisonStrings=[...s.matchAll(/(?:===|!==)\s*'([^']+)'/g)].map(m=>m[1]);
 const literalNumbers=[...s.matchAll(/'(?:\\.|[^'\\])*'/g)].map(m=>m[0].match(/\d+/g)||[]);
 const masked=s.replace(/'(?:\\.|[^'\\])*'/g,"''");
 const reasonKeys=Object.keys(vm.runInNewContext('('+s.match(/const reasons=(\{[^\n]*\});/)[1]+')'));
 const operationalLists=[...s.matchAll(/(\[(?:'[^']*'(?:,)?)+\])\.(?:includes|forEach)/g)].map(m=>m[1]);
 const guidedPart=s.slice(s.indexOf("$('guided-form').addEventListener"),s.indexOf("$('independent-form').addEventListener"));
 const guided={cost:Number(guidedPart.match(/cost\.value!==([0-9]+)/)[1]),edges:Number(guidedPart.match(/count\.value!==([0-9]+)/)[1]),claim:guidedPart.match(/choice\.value!=='([^']+)'/)[1]};
 contracts[lang]={data,checks,calls,events,refs,protectedStrings,comparisonStrings,literalNumbers,masked,reasonKeys,operationalLists,guided};
}
console.log(JSON.stringify({contracts}));
"""
    try:
        return json.loads(subprocess.check_output(['node','-e',code,str(root)],text=True,stderr=subprocess.PIPE))
    except subprocess.CalledProcessError as error:
        raise AssertionError('localized certificate UI/data contract: '+error.stderr.strip()) from error


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo, checks, hashes = root.parent, [], {}

    def check(ok, label):
        assert ok, label
        checks.append(label)

    check(baseline == BASELINE, 'the fixture is the published bilingual-W13 baseline')
    blobs = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            meta, name = row.split(b'\t')
            blobs[name.decode()] = meta.decode().split()[2]
    check(len(blobs) == 627, 'the pinned baseline contains exactly 627 AA files')
    names = {n.decode() for n in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if n}
    check(names - set(blobs) == ADDED, 'exactly four new bilingual-W14 files are present')
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
    for name in ('tools/lessons/w13.html', 'w13/index.html', 'tools/lessons/w13.tr.html', 'w13/tr/index.html'):
        before = old(name)
        a, b = ('href="../../w14/"', 'href="../../w14/tr/"') if '.tr.' in name or '/tr/' in name else ('Continue to Week 14 (Turkish): check a candidate →', 'Continue to Week 14: check a candidate →')
        check(before.count(a) == 1 and (root / name).read_text() == before.replace(a, b, 1), f'W13 changes only its same-language next URL or label: {name}')
    for name in ('index.html', 'tools/lessons/home.html'):
        before = old(name)
        check(before.count(OLD_LANGUAGE) == 1 and (root / name).read_text() == before.replace(OLD_LANGUAGE, NEW_LANGUAGE, 1), f'home changes only language availability: {name}')
    check((root / 'README.md').read_bytes().startswith(old('README.md').encode()), 'README documentation is append-only')
    old_w14 = old('w14/index.html')
    check(old_w14 == old('tools/lessons/w14.html'), 'the published Turkish main equalled its canonical source')
    expected_tr, teacher = translated_turkish(old_w14)
    tr_raw, en_raw = (root / 'w14/tr/index.html').read_text(), (root / 'w14/index.html').read_text()
    check(tr_raw == expected_tr, 'every Turkish W14 byte is preserved except its exact routing/header/teacher migration and bracket/brace-list and numeric path spacing')
    teaching, original_teaching = (root / 'resources/teaching/index.html').read_text(), old('resources/teaching/index.html')
    position = original_teaching.rfind('</section>')
    check(teaching.startswith(original_teaching[:position]) and teaching.endswith(original_teaching[position:]), 'all prior teacher-hub bytes remain around one additive W14 insertion')
    addition = teaching[position:-len(original_teaching[position:])]
    teacher_tr = teacher.replace('<details id="teacher-note" class="teacher-note">', '<details id="week14-tr" lang="tr">', 1)
    en_match = re.search(r'<details id="week14-en".*?</details>', addition, re.S)
    heading = re.match(r'<h3>Week 14 · [^<]+</h3>\n', addition)
    check(en_match is not None and heading is not None, 'a named W14 teaching entry contains an English edition')
    teacher_en = en_match.group(0)
    check(addition == heading.group(0) + teacher_tr + '\n' + teacher_en.strip() + '\n', 'the addition contains only its heading, verbatim original Turkish guidance and its English edition')
    check(teacher_tr.count('<p>') == teacher_en.count('<p>') == 5, 'both teacher editions retain five guidance paragraphs')
    numbers = lambda raw: [re.findall(r'\d+', n.text()) for n in Page(raw).nodes if n.tag == 'p']
    check(numbers(teacher_tr) == numbers(teacher_en), 'teacher timings and numeric references are preserved in translation')

    en, tr, original = Page(en_raw), Page(tr_raw), Page(old_w14)
    ranges = {name:(0,100) for name in ('guided-cost','guided-edges','exit-good','exit-bad','exit-k','exit-budget')}
    ranges['cert-budget'] = (0,9007199254740991)
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
            ('cert-case', ['repeat','walk','budget','valid','short','missing','wrong','unknown','empty','separate']),
            ('guided-claim', ['', 'yes','minimum','p']),
            ('exit-arrow', ['', 'a-to-l','l-to-a']),
        ):
            check([n.attrs.get('value') for n in page.find(ident).walk() if n.tag == 'option'] == expected, f'exact preset contract: {language} #{ident}')
        check([n.attrs['src'] for n in page.nodes if n.tag == 'script'] == (['model.js?v=1', 'lesson.en.js?v=1'] if language == 'en' else ['../model.js?v=1', '../lesson.js?v=1']), f'unchanged shared model and the correct localized UI: {language}')
        check([n.attrs['href'] for n in page.nodes if n.tag == 'link' and n.attrs.get('rel') == 'stylesheet'] ==
              (['../w1/lesson.css?v=1', 'lesson.css?v=1', '../assets/lesson-language.css?v=2'] if language == 'en' else
               ['../../w1/lesson.css?v=1', '../lesson.css?v=1', '../../assets/lesson-language.css?v=2']), f'unchanged local/shared styles and the language stylesheet: {language}')
        check([v for v in page.links() if 'w13/' in v] == (['../w13/#path', '../w13/'] if language == 'en' else ['../../w13/tr/#path', '../../w13/tr/']), f'the prerequisite and back link retain the current language: {language}')
        check(not any('w15/' in v for v in page.links()), f'course closure has no invented Week 15: {language}')
        check(page.find('closing').text().strip() != '', f'original course closure remains: {language}')
        if language == 'en':
            check(not re.search(r'\b(?:seçildi|elendi|bileşen|maliyet|çevrim|Cihaz|Hafta)\b', page.find('main').text(), re.I), 'no untranslated Turkish student/interface prose')
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
                relative = str(target.relative_to(root)).replace('w13/tr/index.html', 'w13/index.html')
                return relative, u.query, u.fragment
            return v
        return [(n.tag, sorted((k, value(k, v)) for k, v in n.attrs.items() if k not in ignored)) for n in page.find('main').walk()]
    check(skeleton(en, root / 'w14/index.html') == skeleton(tr, root / 'w14/tr/index.html'), 'EN/TR main DOM, state hooks, form attributes and corresponding resolved links are identical')
    glossary={'çatı':'roof','sera':'greenhouse','kuyu':'well','pompa':'pump','bahçe':'garden','depo':'warehouse','oda':'room','kapı':'gate'}
    en_text=' '.join(x for n in en.find('main').walk() for x in n.children if isinstance(x,str))
    check(not any(re.search(r'\b'+re.escape(v)+r'\b',en_text,re.I) for v in glossary), 'no Turkish place name survives in English learner prose')
    check(all(re.search(r'\b'+v+r'\b',en_text,re.I) for v in glossary.values()), 'all eight glossary values remain in English learner prose')
    def catalog(page):
        box=next(n for n in page.nodes if n.attrs.get('class')=='edge-catalog')
        rows=[list(map(int,re.findall(r'\d+',n.text()))) for n in box.walk() if n.tag=='p']
        return {f'{min(a,b)}-{max(a,b)}':w for a,b,w in rows}
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
    expressions=[r'k=V−1',r'B=V−1',r'P⊆NP',r'P=NP',r'A→B',r'UHAMPATH',r'k\+1']
    expression_counts=lambda page:[len(re.findall(pattern,re.sub(r'\s+','',page.find('main').text()))) for pattern in expressions]
    check(expression_counts(en)==expression_counts(tr), 'decision, reduction direction and class expressions retain every occurrence')
    for name in ('lesson.js', 'lesson.en.js'):
        script = (root / 'w14' / name).read_text()
        check(all(script.count(code)==1 for code in ENABLE), f'only initialized JavaScript enables the existing hidden widgets and form submits: {name}')
        check("window.addEventListener('beforeprint'" in script and "window.addEventListener('afterprint'" in script, f'worked-trace print/restore hooks: {name}')
        subprocess.run(['node', '--check', str(root / 'w14' / name)], check=True, capture_output=True)
    ui = ui_contract(root)
    check(ui['contracts']['en']==ui['contracts']['tr'], 'localized UIs share exact weighted data, ten presets, calls, events, DOM hooks and every non-text operation')
    data=ui['contracts']['en']['data']
    check(data['vertices']==[4,7,11,18,20,24,26,31] and data['edges']==[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]], 'all original vertices and ten undirected weighted candidates are pinned')
    check(data['independentVertices']==[4,7,18,24] and data['independentEdges']==[[18,24,3],[24,7,1],[7,4,2],[18,7,1],[24,4,7]], 'the independent task preserves its four devices and five costs')
    check([c['expected'] for c in ui['contracts']['en']['checks']]==[6,9,3,3], 'independent fields retain costs6/9 and transformedk3/budget3')
    check(list(data['cases'])==['repeat','walk','budget','valid','short','missing','wrong','unknown','empty','separate'], 'ten presets retain exact original keys and order')
    check(data['repeatPath']==[24,20,31,20,31] and data['simplePath']==[24,18,7,11,31], 'previous walk and new simple-path certificate remain distinct')
    check(ui['contracts']['en']['reasonKeys']==['format','length','unknown-id','source','target','repeat','missing-edge','budget','valid'], 'verifier rejection/acceptance enums remain operational')
    for language in ('en','tr'):
        check(ui['contracts'][language]['guided']=={'cost':12,'edges':4,'claim':'yes'}, 'guided answers12/4/yes remain invariant: '+language)

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
