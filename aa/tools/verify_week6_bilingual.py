#!/usr/bin/env python3
"""Pinned read-only audit for the Week 6 English/Turkish migration.

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
BASELINE = '77dc1c8adc53396d7741c8915cb71d89b810c822'
EXISTING = {
    'aa/README.md', 'aa/index.html', 'aa/tools/lessons/home.html',
    'aa/resources/teaching/index.html', 'aa/tools/lessons/teaching.html',
    'aa/w5/index.html', 'aa/tools/lessons/w5.html',
    'aa/w5/tr/index.html', 'aa/tools/lessons/w5.tr.html',
    'aa/w6/index.html', 'aa/tools/lessons/w6.html',
}
ADDED = {'aa/tools/lessons/w6.tr.html', 'aa/w6/tr/index.html',
         'aa/w6/lesson.en.js', 'aa/tools/verify_week6_bilingual.py'}
COPIES = {'tools/lessons/w6.html': 'w6/index.html', 'tools/lessons/w6.tr.html': 'w6/tr/index.html',
          'tools/lessons/w5.html': 'w5/index.html', 'tools/lessons/w5.tr.html': 'w5/tr/index.html',
          'tools/lessons/home.html': 'index.html', 'tools/lessons/teaching.html': 'resources/teaching/index.html'}
OLD_LANGUAGE = 'Weeks 1–5 have English and Turkish editions. Weeks 6–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
NEW_LANGUAGE = 'Weeks 1–6 have English and Turkish editions. Weeks 7–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
ENABLE = "document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });"


def translated_turkish(original):
    teacher = re.search(r'<details id="teacher-note".*?</details>', original, re.S).group(0)
    text = original.replace(teacher, TEACHER_ANCHOR, 1)
    for before, after in (
        ('href="../w1/lesson.css?v=1"', 'href="../../w1/lesson.css?v=1"'),
        ('href="lesson.css?v=1"', 'href="../lesson.css?v=1"'),
        ('src="model.js?v=1"', 'src="../model.js?v=1"'),
        ('src="lesson.js?v=1"', 'src="../lesson.js?v=1"'),
        ('href="../"', 'href="../../"'),
        ('href="../w5/#dictionary"', 'href="../../w5/tr/#dictionary"'),
        ('href="../w5/"', 'href="../../w5/tr/"'),
        ('href="../w7/"', 'href="../../w7/"'),
    ):
        assert text.count(before) == 1, f'one original Turkish URL: {before}'
        text = text.replace(before, after, 1)
    old_header = '<span class="week-label">Hafta 6 / 14</span>'
    assert text.count(old_header) == 1
    text = text.replace(old_header,
        '<div class="header-end"><span class="week-label">Hafta 6 / 14</span>'
        '<nav class="language-switch" aria-label="Ders dili"><a href="../" lang="en" hreflang="en">English</a>'
        '<span aria-current="page" lang="tr">Türkçe</span></nav></div>', 1)
    text = text.replace('<link rel="stylesheet" href="../lesson.css?v=1">',
        '<link rel="stylesheet" href="../lesson.css?v=1">\n'
        '<link rel="stylesheet" href="../../assets/lesson-language.css?v=2">\n'
        '<link rel="alternate" hreflang="en" href="../">', 1)
    return text.rstrip() + '\n', teacher


def ui_contract(root):
    """Compare executable data, numeric keys and all non-text UI logic."""
    code = r"""
const fs=require('fs'),vm=require('vm'),root=process.argv[1],model=require(root+'/w6/model.js');
const contracts={};
for(const lang of ['tr','en']){
 const s=fs.readFileSync(root+'/w6/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
 const literal=name=>s.match(new RegExp('const '+name+' = ([\\s\\S]*?);'))[1];
 const jobs=vm.runInNewContext('('+literal('jobs')+')');
 const h=vm.runInNewContext('('+literal('h')+')');
 const independent=vm.runInNewContext('('+literal('independent')+')');
 const p=vm.runInNewContext('('+literal('p')+')');
 const cases=vm.runInNewContext('('+s.match(/const cases = (\{[\s\S]*?\n  \});/)[1]+')',{jobs,h,model});
 for(const item of Object.values(cases))delete item.text;
 const inserted=model.traceInsert(independent,p),extracted=model.traceExtract(inserted.heap);
 const checks=vm.runInNewContext('('+literal('checks')+')',{inserted,extracted,number:(id,min,max)=>({id,min,max})}).map(({id,min,max,expected})=>({id,min,max,expected}));
 const helpers=Object.fromEntries(['el','activePositions','reset','number'].map(name=>[name,s.match(new RegExp('  function '+name+'\\([\\s\\S]*?\\n  \\}'))[0]]));
 const calls=[...s.matchAll(/model\.(traceInsert|traceExtract)\(([^;\n]*?)\)/g)].map(x=>x.slice(1,3));
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(x=>x.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 const protectedStrings=[...s.matchAll(/(?:className\s*=\s*|classList\.add\(|dataset\.state\s*=\s*|setAttribute\(|el\()'([^']*)'/g)].map(x=>x[1]);
 const comparisonStrings=[...s.matchAll(/(?:===|!==)\s*'([^']+)'/g)].map(x=>x[1]);
 const literalNumbers=[...s.matchAll(/'(?:\\.|[^'\\])*'/g)].map(x=>x[0].match(/\d+/g)||[]);
 const masked=s.replace(/'(?:\\.|[^'\\])*'/g,"''");
 contracts[lang]={jobs,h,independent,p,cases,checks,helpers,calls,events,refs,protectedStrings,comparisonStrings,literalNumbers,masked};
}
const presets=Object.fromEntries(Object.entries(contracts.en.cases).map(([key,c])=>{
 const trace=c.operation==='insert'?model.traceInsert(c.source,c.job):model.traceExtract(c.source);
 return [key,{order:trace.heap.map(j=>j.id),counts:trace.counts,result:trace.result,steps:trace.steps.map(s=>s.type)}];
}));
const guided=model.traceExtract(model.traceInsert(contracts.en.jobs,contracts.en.h).heap).counts;
console.log(JSON.stringify({contracts,presets,guided}));
"""
    try:
        return json.loads(subprocess.check_output(['node', '-e', code, str(root)], text=True, stderr=subprocess.PIPE))
    except subprocess.CalledProcessError as error:
        raise AssertionError('localized heap UI/data contract: ' + error.stderr.strip()) from error


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo, checks, hashes = root.parent, [], {}

    def check(ok, label):
        assert ok, label
        checks.append(label)

    check(baseline == BASELINE, 'the fixture is the published bilingual-W5 baseline')
    blobs = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            meta, name = row.split(b'\t')
            blobs[name.decode()] = meta.decode().split()[2]
    check(len(blobs) == 595, 'the pinned baseline contains exactly 595 AA files')
    names = {n.decode() for n in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if n}
    check(names - set(blobs) == ADDED, 'exactly four new bilingual-W6 files are present')
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
    for name in ('tools/lessons/w5.html', 'w5/index.html', 'tools/lessons/w5.tr.html', 'w5/tr/index.html'):
        before = old(name)
        a, b = ('href="../../w6/"', 'href="../../w6/tr/"') if '.tr.' in name or '/tr/' in name else ('Week 6 (Turkish): choose the highest-priority job →', 'Week 6: choose the highest-priority job →')
        check(before.count(a) == 1 and (root / name).read_text() == before.replace(a, b, 1), f'W5 changes only its same-language next URL or label: {name}')
    for name in ('index.html', 'tools/lessons/home.html'):
        before = old(name)
        check(before.count(OLD_LANGUAGE) == 1 and (root / name).read_text() == before.replace(OLD_LANGUAGE, NEW_LANGUAGE, 1), f'home changes only language availability: {name}')
    check((root / 'README.md').read_bytes().startswith(old('README.md').encode()), 'README documentation is append-only')
    old_w6 = old('w6/index.html')
    check(old_w6 == old('tools/lessons/w6.html'), 'the published Turkish main equalled its canonical source')
    expected_tr, teacher = translated_turkish(old_w6)
    tr_raw, en_raw = (root / 'w6/tr/index.html').read_text(), (root / 'w6/index.html').read_text()
    check(tr_raw == expected_tr, 'every Turkish W6 byte is preserved except its exact routing/header/teacher migration')
    teaching, original_teaching = (root / 'resources/teaching/index.html').read_text(), old('resources/teaching/index.html')
    position = original_teaching.rfind('</section>')
    check(teaching.startswith(original_teaching[:position]) and teaching.endswith(original_teaching[position:]), 'all prior teacher-hub bytes remain around one additive W6 insertion')
    addition = teaching[position:-len(original_teaching[position:])]
    teacher_tr = teacher.replace('<details id="teacher-note" class="teacher-note">', '<details id="week6-tr" lang="tr">', 1)
    en_match = re.search(r'<details id="week6-en".*?</details>', addition, re.S)
    heading = re.match(r'<h3>Week 6 · [^<]+</h3>\n', addition)
    check(en_match is not None and heading is not None, 'a named W6 teaching entry contains an English edition')
    teacher_en = en_match.group(0)
    check(addition == heading.group(0) + teacher_tr + '\n' + teacher_en.strip() + '\n', 'the addition contains only its heading, verbatim original Turkish guidance and its English edition')
    check(teacher_tr.count('<p>') == teacher_en.count('<p>') == 4, 'both teacher editions retain four guidance paragraphs')
    numbers = lambda raw: [re.findall(r'\d+', n.text()) for n in Page(raw).nodes if n.tag == 'p']
    check(numbers(teacher_tr) == numbers(teacher_en), 'teacher timings and numeric references are preserved in translation')

    en, tr, original = Page(en_raw), Page(tr_raw), Page(old_w6)
    ranges = {'guided-comparisons': (0, 20), 'guided-swaps': (0, 10), 'exit-insert': (0, 20),
              'exit-extract': (0, 20), 'exit-swaps': (0, 10), 'exit-size': (0, 10)}
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
            ('heap-case', ['insert', 'extract', 'after', 'tie', 'stop', 'single', 'empty']),
        ):
            check([n.attrs.get('value') for n in page.find(ident).walk() if n.tag == 'option'] == expected, f'exact preset contract: {language} #{ident}')
        check([n.attrs['src'] for n in page.nodes if n.tag == 'script'] == (['model.js?v=1', 'lesson.en.js?v=1'] if language == 'en' else ['../model.js?v=1', '../lesson.js?v=1']), f'unchanged shared model and the correct localized UI: {language}')
        check([n.attrs['href'] for n in page.nodes if n.tag == 'link' and n.attrs.get('rel') == 'stylesheet'] ==
              (['../w1/lesson.css?v=1', 'lesson.css?v=1', '../assets/lesson-language.css?v=2'] if language == 'en' else
               ['../../w1/lesson.css?v=1', '../lesson.css?v=1', '../../assets/lesson-language.css?v=2']), f'unchanged local/shared styles and the language stylesheet: {language}')
        check([v for v in page.links() if 'w5/' in v] == (['../w5/#dictionary', '../w5/'] if language == 'en' else ['../../w5/tr/#dictionary', '../../w5/tr/']), f'the prerequisite and back link retain the current language: {language}')
        next_links = [n for n in page.nodes if n.tag == 'a' and 'w7/' in n.attrs.get('href', '')]
        check(len(next_links) == 1 and next_links[0].attrs['href'] == ('../w7/' if language == 'en' else '../../w7/'), f'next lesson still resolves to the current Turkish Week 7: {language}')
        if language == 'en':
            check('Turkish' in next_links[0].text(), 'the English next link explicitly labels Week 7 as Turkish')
            check(not re.search(r'\b(?:öncelik|karşılaştırma|yer değiştirme|geliş numarası|Cihaz|Hafta)\b', page.find('main').text(), re.I), 'the English student lesson contains no untranslated Turkish interface or lesson prose')
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
                relative = str(target.relative_to(root)).replace('w5/tr/index.html', 'w5/index.html')
                return relative, u.query, u.fragment
            return v
        return [(n.tag, sorted((k, value(k, v)) for k, v in n.attrs.items() if k not in ignored)) for n in page.find('main').walk()]
    check(skeleton(en, root / 'w6/index.html') == skeleton(tr, root / 'w6/tr/index.html'), 'EN/TR main DOM, state hooks, form attributes and corresponding resolved links are identical')
    def displayed_jobs(page):
        container = next(n for n in page.nodes if n.attrs.get('class') == 'job-records')
        return [(next(x.text() for x in n.walk() if x.tag == 'b'),
                 re.findall(r'\d+', next(x.text() for x in n.walk() if x.tag == 'span')),
                 re.findall(r'\d+', next(x.text() for x in n.walk() if x.tag == 'small')))
                for n in container.children if not isinstance(n, str)]
    check(displayed_jobs(en) == displayed_jobs(tr), 'seven static job labels, priorities, device IDs and arrival numbers remain identical')
    numerical_translations = []
    for a, b in zip(en.find('main').walk(), tr.find('main').walk()):
        local = lambda n: re.findall(r'\d+', ''.join(x for x in n.children if isinstance(x, str)))
        left, right = local(a), local(b)
        if left != right:
            numerical_translations.append((a.tag, left, right))
    check(not numerical_translations, 'every ordered numeric token in the student lesson remains identical')
    mathematical = re.compile(r'[\s0-9nhpiP()⌊⌋₂×²=+\-−*/.,\[\]←≤≥<>]+')
    formulas = lambda page: [re.sub(r'\s+', '', n.text()) for n in page.nodes
                             if n.tag in ('strong', 'code') and mathematical.fullmatch(n.text())]
    check(formulas(en) == formulas(tr), 'standalone mathematical data, arrays and rubric scores remain identical')
    expressions = [r'⌊i/2⌋', r'2i\+1', r'h=⌊log₂n⌋', r'O\(logn\)', r'O\(1\)', r'n-1']
    expression_counts = lambda page: [len(re.findall(pattern, re.sub(r'\s+', '', page.find('main').text()).replace('−', '-'))) for pattern in expressions]
    check(expression_counts(en) == expression_counts(tr), 'position/height/asymptotic expressions retain every occurrence')
    for name in ('lesson.js', 'lesson.en.js'):
        script = (root / 'w6' / name).read_text()
        check(script.count(ENABLE) == 1, f'only initialized JavaScript enables the existing hidden controls: {name}')
        check("window.addEventListener('beforeprint'" in script and "window.addEventListener('afterprint'" in script, f'worked-trace print/restore hooks: {name}')
        subprocess.run(['node', '--check', str(root / 'w6' / name)], check=True, capture_output=True)
    ui = ui_contract(root)
    check(ui['contracts']['en'] == ui['contracts']['tr'], 'localized UIs share exact job data, case contracts, helpers, model calls, event targets, DOM references and all non-text logic')
    check(ui['contracts']['en']['jobs'] == [dict(id=i,device=d,priority=p,seq=s) for i,d,p,s in [('A',18,4,1),('B',7,7,2),('C',24,6,3),('D',4,12,4),('E',11,9,5),('F',20,8,6),('G',31,10,7)]], 'all original job records and their insertion order are pinned')
    check(ui['guided'] == {'comparisons':4,'swaps':2}, 'guided extraction counts four whole-job comparisons and two swaps')
    check([c['expected'] for c in ui['contracts']['en']['checks']] == [2,3,1,4], 'independent insertion/extraction comparisons, extraction swaps and remaining size retain distinct units')
    expected = {'insert':([3,3],list('HACBEFGD')), 'extract':([3,2],list('CBFDEG')), 'after':([4,2],list('ABCDEFG')), 'tie':([1,1],list('BC')), 'stop':([1,0],list('ABCDEFGI')), 'single':([0,0],[]), 'empty':([0,0],[])}
    for case,(counts,order) in expected.items():
        actual=ui['presets'][case]
        check(actual['counts']==dict(zip(['comparisons','swaps'],counts)) and actual['order']==order, f'pinned preset final order and separate counters: {case}')
    check(ui['presets']['tie']['result']['id']=='A' and ui['presets']['tie']['order'][0]=='B', 'equal priorities use preserved arrival numbers')
    check(all(ui['presets'][c]['steps'][0]=='replace-root' for c in ['extract','after','tie']), 'moving the last record to the root is explicit replacement, not a swap')

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
            'preset_cases': len(ui['presets']), 'file_sha256': hashes, 'passed_checks': checks}


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
