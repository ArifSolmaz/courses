#!/usr/bin/env python3
"""Pinned, read-only audit of the Week 2 English/Turkish route migration.

Historical fresh-lesson and homepage audits remain unchanged. This audit
proves its own exact successor scope without calling them or adding waivers.
Browser/print/mobile and disposable rebuild checks are separate evidence.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import json
import re
import subprocess

from verify_home_week1_bilingual import Page, git, sha, blob_sha, ENABLE_BEFORE, ENABLE_AFTER, TEACHER_ANCHOR
from aligned.page_links import fragment_exists

ROOT = Path(__file__).resolve().parents[1]
BASELINE = 'aa0c8392953db542b9629132c6045fc56d7e5214'
EXISTING = {
    'aa/README.md', 'aa/index.html', 'aa/tools/lessons/home.html',
    'aa/resources/teaching/index.html', 'aa/tools/lessons/teaching.html',
    'aa/w1/index.html', 'aa/tools/lessons/w1.html',
    'aa/w1/tr/index.html', 'aa/tools/lessons/w1.tr.html',
    'aa/w2/index.html', 'aa/tools/lessons/w2.html', 'aa/w2/lesson.js', 'aa/w2/lesson.css',
    'aa/tools/verify_alignment.py',
}
ADDED = {'aa/tools/lessons/w2.tr.html', 'aa/w2/tr/index.html',
         'aa/w2/lesson.en.js', 'aa/tools/verify_week2_bilingual.py'}
COPIES = {'tools/lessons/w2.html': 'w2/index.html', 'tools/lessons/w2.tr.html': 'w2/tr/index.html',
          'tools/lessons/w1.html': 'w1/index.html', 'tools/lessons/w1.tr.html': 'w1/tr/index.html',
          'tools/lessons/home.html': 'index.html', 'tools/lessons/teaching.html': 'resources/teaching/index.html'}
OLD_LANGUAGE = 'Week 1 has English and Turkish editions. Weeks 2–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside Week 1.'
NEW_LANGUAGE = 'Weeks 1–2 have English and Turkish editions. Weeks 3–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
ALIGNMENT_BEFORE = " for source,destination in (('resources.html','resources/index.html'),('teaching.html','resources/teaching/index.html'),('w1.tr.html','w1/tr/index.html')):\n"
ALIGNMENT_AFTER = " translated=[(f'w{n}.tr.html',f'w{n}/tr/index.html') for n in range(1,15) if (root/f'tools/lessons/w{n}.tr.html').is_file()]\n for source,destination in [('resources.html','resources/index.html'),('teaching.html','resources/teaching/index.html')]+translated:\n"


def translated_turkish(old):
    teacher = re.search(r'<details id="teacher-note".*?</details>', old, re.S).group(0)
    text = old.replace(teacher, TEACHER_ANCHOR, 1)
    for before, after in (
        ('href="../w1/lesson.css?v=1"', 'href="../../w1/lesson.css?v=1"'),
        ('href="lesson.css?v=1"', 'href="../lesson.css?v=2"'),
        ('src="model.js?v=1"', 'src="../model.js?v=1"'),
        ('src="lesson.js?v=1"', 'src="../lesson.js?v=2"'),
        ('href="../"', 'href="../../"'),
        ('href="../w1/#trace"', 'href="../../w1/tr/#trace"'),
        ('href="../w1/"', 'href="../../w1/tr/"'),
        ('href="../w3/"', 'href="../../w3/"'),
    ):
        assert text.count(before) == 1, f'one original Turkish URL target: {before}'
        text = text.replace(before, after)
    text = text.replace('<span class="week-label">Hafta 2 / 14</span>',
        '<div class="header-end"><span class="week-label">Hafta 2 / 14</span>'
        '<nav class="language-switch" aria-label="Ders dili"><a href="../" lang="en" hreflang="en">English</a>'
        '<span aria-current="page" lang="tr">Türkçe</span></nav></div>')
    text = text.replace('<link rel="stylesheet" href="../lesson.css?v=2">',
        '<link rel="stylesheet" href="../lesson.css?v=2">\n'
        '<link rel="stylesheet" href="../../assets/lesson-language.css?v=2">\n'
        '<link rel="alternate" hreflang="en" href="../">')
    assert text.count('type="submit" class="js-only" hidden') == 2
    text = text.replace('type="submit" class="js-only" hidden', 'type="submit" class="js-only" hidden disabled')
    return text.rstrip() + '\n', teacher


def ui_contract(root):
    """Evaluate extracted data literals and the shared pure model, never UI code."""
    code = r'''
const fs=require('fs'),vm=require('vm'),root=process.argv[1],model=require(root+'/w2/model.js');
const contracts={};
for(const lang of ['tr','en']){
 const s=fs.readFileSync(root+'/w2/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
 const values=JSON.parse(s.match(/const values = (\[[^\]]+\]);/)[1]);
 const helpers=Object.fromEntries(['comparison','reset','number'].map(name=>[name,s.match(new RegExp('  function '+name+'\\([\\s\\S]*?\\n  \\}'))[0]]));
 const calls=[...s.matchAll(/model\.traceWork\(([^;\n]*?)\)/g)].map(x=>x[1]);
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(x=>x.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 const pairs=model.traceWork(3,'nested').count,total=pairs+model.traceWork(3,'single').count;
 const doubled=model.traceWork(6,'nested').count+model.traceWork(6,'single').count;
 const literal=s.match(/const checks = (\[[\s\S]*?\n    \]);/)[1];
 const checks=vm.runInNewContext('('+literal+')',{pairs,total,doubled,number:(id,min,max)=>({id,min,max})}).map(({id,min,max,expected})=>({id,min,max,expected}));
 contracts[lang]={values,helpers,calls,events,refs,checks};
}
let oracle=0,steps=0;
for(let n=0;n<=32;n++)for(const mode of ['single','sequential','nested']){
 const result=model.traceWork(n,mode),count=mode==='nested'?n*n:mode==='sequential'?n+n:n;
 if(result.count!==count||result.steps.length!==count)throw Error('count oracle');
 result.steps.forEach((s,k)=>{
  const pass=mode==='sequential'?Math.floor(k/n)+1:1;
  const i=mode==='nested'?Math.floor(k/n)+1:k%n+1,j=mode==='nested'?k%n+1:null;
  if(s.count!==k+1||s.pass!==pass||s.i!==i||s.j!==j)throw Error('ordered position/pass oracle');steps++;
 });oracle++;
}
console.log(JSON.stringify({contracts,oracle_cases:oracle,steps,
 guided:[model.traceWork(3,'sequential').count,model.traceWork(3,'nested').count],
 independent:[3,model.traceWork(3,'nested').count,model.traceWork(3,'single').count+model.traceWork(3,'nested').count,model.traceWork(6,'single').count+model.traceWork(6,'nested').count]}));
'''
    return json.loads(subprocess.check_output(['node', '-e', code, str(root)], text=True))


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo, checks, hashes = root.parent, [], {}

    def check(ok, label):
        assert ok, label
        checks.append(label)

    check(baseline == BASELINE, 'the migration fixture is the published bilingual-W1 baseline')
    blobs = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            meta, name = row.split(b'\t')
            blobs[name.decode()] = meta.decode().split()[2]
    check(len(blobs) == 579, 'the pinned baseline contains exactly 579 AA files')
    names = {n.decode() for n in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if n}
    check(names - set(blobs) == ADDED, 'exactly four new bilingual-W2 files are present')
    check(set(blobs) <= names, 'no baseline AA file is deleted')
    changed = set()
    for name, old_hash in blobs.items():
        data = (repo / name).read_bytes()
        if blob_sha(data) != old_hash:
            changed.add(name)
        if name not in EXISTING:
            check(blob_sha(data) == old_hash, f'protected baseline bytes: {name}')
    check(changed == EXISTING, 'exactly fourteen authorized existing files change')
    for name in sorted(names):
        hashes[name] = sha((repo / name).read_bytes())
    for source, target in COPIES.items():
        check((root / source).read_bytes() == (root / target).read_bytes(), f'canonical byte copy: {target}')
    old = lambda name: git(repo, 'show', f'{baseline}:aa/{name}').decode()
    for source in ('tools/lessons/w1.html', 'w1/index.html', 'tools/lessons/w1.tr.html', 'w1/tr/index.html'):
        before = old(source)
        a, b = ('href="../../w2/"', 'href="../../w2/tr/"') if '.tr.' in source or '/tr/' in source else ('Week 2 (Turkish): count the work →', 'Week 2: count the work →')
        check(before.count(a) == 1 and (root / source).read_text() == before.replace(a, b, 1), f'W1 changes only its next-language URL or label: {source}')
    for name in ('index.html', 'tools/lessons/home.html'):
        before = old(name)
        check(before.count(OLD_LANGUAGE) == 1 and (root / name).read_text() == before.replace(OLD_LANGUAGE, NEW_LANGUAGE, 1), f'home changes only its language-availability sentence: {name}')
    check((root / 'README.md').read_bytes().startswith(old('README.md').encode()), 'README documentation is append-only')
    expected_css = old('w2/lesson.css')
    for before, after in (
        ('grid-template-columns:80px minmax(160px,1fr)', 'grid-template-columns:minmax(min-content,100px) minmax(160px,1fr)'),
        ('grid-template-columns:70px minmax(140px,1fr)', 'grid-template-columns:minmax(min-content,100px) minmax(140px,1fr)'),
    ):
        check(expected_css.count(before) == 1, f'one original fixed label column: {before}')
        expected_css = expected_css.replace(before, after, 1)
    check((root / 'w2/lesson.css').read_text() == expected_css, 'the local stylesheet changes only its two measured label-overlap grid columns')
    before_w2 = old('w2/index.html')
    expected_tr, teacher = translated_turkish(before_w2)
    tr_raw, en_raw = (root / 'w2/tr/index.html').read_text(), (root / 'w2/index.html').read_text()
    check(tr_raw == expected_tr, 'every Turkish W2 byte is retained except its exact routing/header/teacher/NoJS migration')
    teaching, original_teaching = (root / 'resources/teaching/index.html').read_text(), old('resources/teaching/index.html')
    insertion = original_teaching.rfind('</section>')
    check(teaching.startswith(original_teaching[:insertion]) and teaching.endswith(original_teaching[insertion:]), 'all prior teacher-hub bytes remain unchanged around one additive W2 insertion')
    addition = teaching[insertion:-len(original_teaching[insertion:])]
    teacher_tr = teacher.replace('<details id="teacher-note" class="teacher-note">', '<details id="week2-tr" lang="tr">', 1)
    teacher_en_match = re.search(r'<details id="week2-en".*?</details>', addition, re.S)
    check(teacher_en_match is not None, 'English W2 teacher guidance is available')
    teacher_en = teacher_en_match.group(0)
    check(addition == '<h3>Week 2 · Count the work</h3>\n' + teacher_tr + '\n' + teacher_en.strip() + '\n', 'teacher insertion consists only of its heading, verbatim original TR prose and the new English edition')
    check(teacher_tr.count('<p>') == teacher_en.count('<p>') == 4, 'both teacher editions retain four guidance paragraphs')
    teacher_numbers = lambda raw: [re.findall(r'\d+', n.text()) for n in Page(raw).nodes if n.tag == 'p']
    check(teacher_numbers(teacher_tr) == teacher_numbers(teacher_en), 'teacher timing estimates and numeric references retain their meanings in English')

    en, tr, original = Page(en_raw), Page(tr_raw), Page(before_w2)
    ranges = {'guided-seq': (0, 100), 'guided-nested': (0, 100), 'exit-n': (0, 12),
              'exit-pairs': (0, 200), 'exit-total': (0, 200), 'exit-double': (0, 200)}
    for language, page, raw in (('en', en, en_raw), ('tr', tr, tr_raw)):
        check(page.ids == original.ids and len(page.ids) == len(set(page.ids)), f'complete, unique, ordered original ID contract: {language}')
        check(page.find('teacher-note').tag == 'span' and raw.count(TEACHER_ANCHOR) == 1, f'old teacher anchor remains outside the instructor prose: {language}')
        check(any(n.tag == 'html' and n.attrs.get('lang') == language for n in page.nodes), f'document language: {language}')
        check(sum(n.tag == 'h1' for n in page.nodes) == sum(n.tag == 'main' for n in page.nodes) == 1, f'one lesson title and main: {language}')
        check([n.attrs.get('id') for n in page.nodes if n.tag == 'form'] == ['guided-form', 'independent-form'], f'two original practice forms: {language}')
        check(all({'hidden', 'disabled'} <= set(n.attrs) for n in page.nodes if n.tag == 'button' and n.attrs.get('type') == 'submit'), f'NoJS submit buttons remain hidden and disabled: {language}')
        for ident, (lower, upper) in ranges.items():
            check(all(page.find(ident).attrs.get(k) == v for k, v in {'type': 'number', 'min': str(lower), 'max': str(upper), 'step': '1', 'inputmode': 'numeric'}.items()), f'numeric constraint: {language} #{ident}')
        check([n.attrs.get('value') for n in page.find('work-n').walk() if n.tag == 'option'] == list(map(str, range(7))), f'all seven n presets: {language}')
        check([n.attrs.get('value') for n in page.find('work-mode').walk() if n.tag == 'option'] == ['single', 'sequential', 'nested'], f'all three work layouts: {language}')
        check([n.attrs['src'] for n in page.nodes if n.tag == 'script'] == (['model.js?v=1', 'lesson.en.js?v=1'] if language == 'en' else ['../model.js?v=1', '../lesson.js?v=2']), f'shared model and properly versioned localized UI: {language}')
        check([n.attrs['href'] for n in page.nodes if n.tag == 'link' and n.attrs.get('rel') == 'stylesheet'] ==
              (['../w1/lesson.css?v=1', 'lesson.css?v=2', '../assets/lesson-language.css?v=2'] if language == 'en' else
               ['../../w1/lesson.css?v=1', '../lesson.css?v=2', '../../assets/lesson-language.css?v=2']), f'unchanged shared styles and the properly versioned local label-overlap fix: {language}')
        check([v for v in page.links() if 'w1/' in v] == (['../w1/#trace', '../w1/'] if language == 'en' else ['../../w1/tr/#trace', '../../w1/tr/']), f'trace reference and back link retain the current lesson language: {language}')
        other, href = ('tr', 'tr/') if language == 'en' else ('en', '../')
        check(any(n.tag == 'a' and n.attrs.get('href') == href and n.attrs.get('hreflang') == other for n in page.nodes), f'visible direct alternate-language link: {language}')
        check(any(n.tag == 'link' and n.attrs == {'rel': 'alternate', 'href': href, 'hreflang': other} for n in page.nodes), f'discoverable alternate-language URL: {language}')
        check(any(n.tag == 'span' and n.attrs.get('aria-current') == 'page' and n.attrs.get('lang') == language for n in page.nodes), f'accessible current-language marker: {language}')
        check(all(not k.startswith('on') for n in page.nodes for k in n.attrs), f'no inline executable event handlers: {language}')

    def skeleton(page, location):
        ignored = {'aria-label', 'placeholder', 'title', 'lang', 'hreflang'}
        def value(k, v):
            if k == 'href' and urlsplit(v).path:
                u = urlsplit(v)
                target = (location.parent / u.path).resolve()
                if target.is_dir():
                    target /= 'index.html'
                # Different editions of the same W1 trace have the same role.
                relative = str(target.relative_to(root)).replace('w1/tr/index.html', 'w1/index.html')
                return relative, u.query, u.fragment
            return v
        return [(n.tag, sorted((k, value(k, v)) for k, v in n.attrs.items() if k not in ignored)) for n in page.find('main').walk()]
    check(skeleton(en, root / 'w2/index.html') == skeleton(tr, root / 'w2/tr/index.html'), 'EN/TR main DOM, state hooks, form attributes and corresponding resolved links are identical')
    for label, selector in (
        ('table numbers', lambda n: n.tag in ('td', 'th')),
        ('pseudocode numeric literals', lambda n: n.tag == 'pre'),
        ('displayed formulas', lambda n: n.attrs.get('class') == 'formula'),
    ):
        extract = lambda page: [re.findall(r'\d+', n.text()) for n in page.nodes if selector(n)]
        check(extract(en) == extract(tr), f'the two editions retain identical {label}')

    old_js = old('w2/lesson.js')
    check(old_js.count(ENABLE_BEFORE) == 1 and (root / 'w2/lesson.js').read_text() == old_js.replace(ENABLE_BEFORE, ENABLE_AFTER, 1), 'Turkish operational code changes only the exact disabled-submit enable block')
    for name in ('lesson.js', 'lesson.en.js'):
        script = (root / 'w2' / name).read_text()
        check(script.count(ENABLE_AFTER) == 1, f'only initialized JavaScript enables submit: {name}')
        check("window.addEventListener('beforeprint'" in script and "window.addEventListener('afterprint'" in script, f'paper trace print/restore hooks: {name}')
        subprocess.run(['node', '--check', str(root / 'w2' / name)], check=True, capture_output=True)
    ui = ui_contract(root)
    check(ui['contracts']['en'] == ui['contracts']['tr'], 'localized UIs share values, pure helpers, model calls, event targets, DOM references and numeric keys')
    check(ui['guided'] == [6, 9] and ui['independent'] == [3, 9, 12, 42], 'guided and independent numerical answers agree with their stated reports')
    check(ui['oracle_cases'] == 99, 'all 99 mode/size traces pass the independent count and ordered-step oracle')

    references = []
    for destination in ('index.html', 'resources/teaching/index.html', 'w1/index.html', 'w1/tr/index.html', 'w2/index.html', 'w2/tr/index.html'):
        page = Page((root / destination).read_text())
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
                check(target.is_relative_to(repo) and target.is_file(), f'reference exists: {destination} {value}')
                if u.fragment:
                    check(fragment_exists(target, unquote(u.fragment)), f'actual fragment exists: {destination} {value}')
                references.append({'source': destination, 'url': value, 'target': str(target.relative_to(repo))})

    # Existing numerical and preservation audits themselves are protected by
    # the 565-file byte proof; no historical successor allowance is added.
    alignment = (root / 'tools/verify_alignment.py').read_text()
    check(alignment.count(ALIGNMENT_AFTER) == 1 and alignment.replace(ALIGNMENT_AFTER, ALIGNMENT_BEFORE, 1) == old('tools/verify_alignment.py'),
          'alignment changes only its exact dynamic translated-source enumeration; every prior assertion and helper byte remains')
    return {'status': 'passed', 'baseline': baseline, 'checks': len(checks), 'baseline_files': len(blobs),
            'protected_files': len(blobs) - len(EXISTING), 'modified_existing': sorted(changed), 'added': sorted(ADDED),
            'references_checked': len(references), 'references': references, 'model_oracle_cases': ui['oracle_cases'],
            'model_steps_checked': ui['steps'], 'canonical_copies': COPIES, 'file_sha256': hashes, 'passed_checks': checks}


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
