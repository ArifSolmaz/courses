#!/usr/bin/env python3
"""Pinned read-only audit for the Week 5 English/Turkish migration.

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
BASELINE = '5cfa8aa5067212069a4640b3622d99674bd58f2c'
EXISTING = {
    'aa/README.md', 'aa/index.html', 'aa/tools/lessons/home.html',
    'aa/resources/teaching/index.html', 'aa/tools/lessons/teaching.html',
    'aa/w4/index.html', 'aa/tools/lessons/w4.html',
    'aa/w4/tr/index.html', 'aa/tools/lessons/w4.tr.html',
    'aa/w5/index.html', 'aa/tools/lessons/w5.html',
}
ADDED = {'aa/tools/lessons/w5.tr.html', 'aa/w5/tr/index.html',
         'aa/w5/lesson.en.js', 'aa/tools/verify_week5_bilingual.py'}
COPIES = {'tools/lessons/w5.html': 'w5/index.html', 'tools/lessons/w5.tr.html': 'w5/tr/index.html',
          'tools/lessons/w4.html': 'w4/index.html', 'tools/lessons/w4.tr.html': 'w4/tr/index.html',
          'tools/lessons/home.html': 'index.html', 'tools/lessons/teaching.html': 'resources/teaching/index.html'}
OLD_LANGUAGE = 'Weeks 1–4 have English and Turkish editions. Weeks 5–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
NEW_LANGUAGE = 'Weeks 1–5 have English and Turkish editions. Weeks 6–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
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
        ('href="../w4/#access"', 'href="../../w4/tr/#access"'),
        ('href="../w4/"', 'href="../../w4/tr/"'),
        ('href="../w6/"', 'href="../../w6/"'),
    ):
        assert text.count(before) == 1, f'one original Turkish URL: {before}'
        text = text.replace(before, after, 1)
    old_header = '<span class="week-label">Hafta 5 / 14</span>'
    assert text.count(old_header) == 1
    text = text.replace(old_header,
        '<div class="header-end"><span class="week-label">Hafta 5 / 14</span>'
        '<nav class="language-switch" aria-label="Ders dili"><a href="../" lang="en" hreflang="en">English</a>'
        '<span aria-current="page" lang="tr">Türkçe</span></nav></div>', 1)
    text = text.replace('<link rel="stylesheet" href="../lesson.css?v=1">',
        '<link rel="stylesheet" href="../lesson.css?v=1">\n'
        '<link rel="stylesheet" href="../../assets/lesson-language.css?v=2">\n'
        '<link rel="alternate" hreflang="en" href="../">', 1)
    return text.rstrip() + '\n', teacher


def ui_contract(root):
    """Pin every record value to a glossary and compare executable UI/data contracts."""
    code = r'''
const fs=require('fs'),vm=require('vm'),root=process.argv[1],model=require(root+'/w5/model.js');
const glossary={'pompa':'pump','sera':'greenhouse','depo':'warehouse','çatı':'roof','kuyu':'well','bahçe':'garden','kapı':'gate','oda':'room','atölye':'workshop'};
const normalize=x=>typeof x==='string'?(glossary[x]||x):Array.isArray(x)?x.map(normalize):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,normalize(v)])):x;
const contracts={};
for(const lang of ['tr','en']){
 const s=fs.readFileSync(root+'/w5/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
 const entries=vm.runInNewContext('('+s.match(/const entries = (\[[\s\S]*?\n  \]);/)[1]+')');
 const added=vm.runInNewContext('('+s.match(/const added = (\{[^\n]+\});/)[1]+')');
 const cases=vm.runInNewContext('('+s.match(/const cases = (\{[\s\S]*?\n  \});/)[1]+')',{entries,added});
 const source=vm.runInNewContext('('+s.match(/const source = (\[\{[^\n]+\]);/)[1]+')');
 const tree=model.traceGet(source,17,'bst'),hash=model.traceGet(source,17,'hash',{m:5});
 const literal=s.match(/const checks = (\[\n[\s\S]*?\n    \]);/)[1];
 const checks=vm.runInNewContext('('+literal+')',{tree,hash,source,model,number:(id,min,max)=>({id,min,max})}).map(({id,min,max,expected})=>({id,min,max,expected}));
 const helpers=Object.fromEntries(['el','levels','reset','number'].map(name=>[name,s.match(new RegExp('  function '+name+'\\([\\s\\S]*?\\n  \\}'))[0]]));
 const calls=[...s.matchAll(/model\.(traceGet|traceSet)\(([^;\n]*?)\)/g)].map(x=>x.slice(1,3)).map(row=>row.map(x=>x.replace(/'([^']*)'/g,(whole,value)=>"'"+(glossary[value]||value)+"'")));
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(x=>x.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 const protectedStrings=[...s.matchAll(/(?:className\s*=\s*|classList\.add\(|dataset\.state\s*=\s*|setAttribute\(|el\()'([^']*)'/g)].map(x=>x[1]);
 const comparisonStrings=[...s.matchAll(/(?:===|!==)\s*'([^']+)'/g)].map(x=>x[1]);
 const literalNumbers=[...s.matchAll(/'(?:\\.|[^'\\])*'/g)].map(x=>x[0].match(/\d+/g)||[]);
 const masked=s.replace(/'(?:\\.|[^'\\])*'/g,"''");
 const locale=s.match(/toLocaleString\('([^']+)', \{ maximumFractionDigits: (\d+) \}\)/);
 if(!locale||locale[1]!== (lang==='en'?'en-GB':'tr-TR')||locale[2]!=='2')throw Error('explicit alpha presentation locale');
 if(lang==='en' && [...s.matchAll(/'([^']*)'/g)].some(x=>Object.hasOwn(glossary,x[1])))throw Error('English record data retains a Turkish glossary literal');
 // Key/value record fields are operational data. English values must match
 // the explicit nine-word glossary, not a general 'all strings may differ' rule.
 for(const collection of [entries,[added],source,...Object.values(cases).map(x=>x.entries)])for(const record of collection){
  const values=Object.values(glossary),original=Object.keys(glossary);
  if(!(lang==='en'?values:original).includes(record.value))throw Error('record glossary violation '+lang+': '+record.value);
 }
 contracts[lang]={entries:normalize(entries),added:normalize(added),cases:normalize(cases),source:normalize(source),checks,helpers,calls,events,refs,protectedStrings,comparisonStrings,literalNumbers,masked};
}
const eq=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(label);};
let oracleCases=0,steps=0;
function oracle(entries,key,structure,m,setValue){
 const records=new Map(),nodes=new Map();let root=null;
 const buckets=Array.from({length:m},()=>[]);
 for(const record of entries){
  if(records.has(record.key)){nodes.get(record.key).value=record.value;buckets[record.key%m].find(x=>x.key===record.key).value=record.value;records.set(record.key,{...record});continue;}
  const node={...record,left:null,right:null};nodes.set(record.key,node);records.set(record.key,{...record});buckets[record.key%m].push({...record});
  if(root===null)root=record.key;
  else{let current=nodes.get(root);for(;;){const side=record.key<current.key?'left':'right';if(current[side]===null){current[side]=record.key;break;}current=nodes.get(current[side]);}}
 }
 const path=[];let found=null;
 if(structure==='bst'){let current=root;while(current!==null){path.push(current);if(current===key){found=nodes.get(current);break;}current=nodes.get(current)[key<current?'left':'right'];}}
 else for(const record of buckets[key%m]){path.push(record.key);if(record.key===key){found=record;break;}}
 const updated=found!==null;
 if(setValue!==undefined){if(found)found.value=setValue;else records.set(key,{key,value:setValue});}
 return {path,updated,result:setValue===undefined?(found?{key,value:found.value}:null):{key,value:setValue,updated},size:records.size};
}
const permutations=values=>values.length?values.flatMap((x,i)=>permutations(values.filter((_,j)=>j!==i)).map(rest=>[x,...rest])):[[]];
for(let n=0;n<=5;n++)for(const order of permutations(Array.from({length:n},(_,i)=>i*5+1))){
 const base=order.map((key,i)=>({key,value:'v'+i}));
 for(const entries of [base,base.length?base.concat([{key:base[0].key,value:'updated-initial'}]):base])for(const key of [...order,0,26])for(const structure of ['bst','hash'])for(const m of [1,5])for(const value of [undefined,'new']){
  const expected=oracle(entries,key,structure,m,value),actual=value===undefined?model.traceGet(entries,key,structure,{m}):model.traceSet(entries,key,value,structure,{m});
  eq(actual.result,expected.result,'independent dictionary result');
  if(actual.stats.size!==expected.size)throw Error('independent dictionary size');
  const comparisons=actual.steps.filter(s=>s.op===(structure==='bst'?'compare-node':'compare-key'));
  eq(comparisons.map(s=>s.key),expected.path,'independent search path');
  eq(actual.counts,{nodeComparisons:structure==='bst'?expected.path.length:0,bucketKeyChecks:structure==='hash'?expected.path.length:0,hashComputations:structure==='hash'?1:0,recordSets:value===undefined?0:1},'separate count units');
  actual.steps.forEach((s,i)=>{if(s.step!==i+1)throw Error('step numbering');});
  steps+=actual.steps.length;oracleCases++;
 }
}
const entries=contracts.en.entries;
const bst=model.traceGet(entries,31,'bst'),hash=model.traceGet(entries,31,'hash',{m:5}),sorted=model.traceGet(entries.slice().sort((a,b)=>a.key-b.key),31,'bst');
const source=entries.concat([{key:26,value:'room'}]);
const guided=[model.traceGet(source,26,'bst').counts.nodeComparisons,model.traceGet(source,26,'hash',{m:5}).counts.bucketKeyChecks];
let preserve=true;
for(const structure of ['bst','hash']){
 const update=model.traceSet(entries,31,'workshop',structure,{m:5});
 if(structure==='bst')eq(update.initial.nodes.map(({key,left,right})=>({key,left,right})),update.state.nodes.map(({key,left,right})=>({key,left,right})),'updated BST shape');
 else eq(update.initial.buckets.map(b=>b.map(x=>x.key)),update.state.buckets.map(b=>b.map(x=>x.key)),'updated bucket order');
 if(update.stats.size!==7)preserve=false;
}
console.log(JSON.stringify({contracts,guided,sample_get:{bst_path:bst.state.path,hash_bucket:hash.state.activeBucket,hash_keys:hash.steps.filter(s=>s.op==='compare-key').map(s=>s.key),sorted_path:sorted.state.path},insert_then_find:{bst:guided[0],hash:guided[1],size:source.length},updated_size:model.traceSet(entries,31,'workshop','bst').stats.size,update_structure_preserved:preserve,oracle_cases:oracleCases,steps}));
'''
    try:
        return json.loads(subprocess.check_output(['node', '-e', code, str(root)], text=True, stderr=subprocess.PIPE))
    except subprocess.CalledProcessError as error:
        raise AssertionError('localized UI/data/oracle contract: ' + error.stderr.strip()) from error

def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo, checks, hashes = root.parent, [], {}

    def check(ok, label):
        assert ok, label
        checks.append(label)

    check(baseline == BASELINE, 'the fixture is the published bilingual-W4 baseline')
    blobs = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            meta, name = row.split(b'\t')
            blobs[name.decode()] = meta.decode().split()[2]
    check(len(blobs) == 591, 'the pinned baseline contains exactly 591 AA files')
    names = {n.decode() for n in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if n}
    check(names - set(blobs) == ADDED, 'exactly four new bilingual-W5 files are present')
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
    for name in ('tools/lessons/w4.html', 'w4/index.html', 'tools/lessons/w4.tr.html', 'w4/tr/index.html'):
        before = old(name)
        a, b = ('href="../../w5/"', 'href="../../w5/tr/"') if '.tr.' in name or '/tr/' in name else ('Week 5 (Turkish): find a record by ID →', 'Week 5: find a record by ID →')
        check(before.count(a) == 1 and (root / name).read_text() == before.replace(a, b, 1), f'W3 changes only its same-language next URL or label: {name}')
    for name in ('index.html', 'tools/lessons/home.html'):
        before = old(name)
        check(before.count(OLD_LANGUAGE) == 1 and (root / name).read_text() == before.replace(OLD_LANGUAGE, NEW_LANGUAGE, 1), f'home changes only language availability: {name}')
    check((root / 'README.md').read_bytes().startswith(old('README.md').encode()), 'README documentation is append-only')
    old_w5 = old('w5/index.html')
    check(old_w5 == old('tools/lessons/w5.html'), 'the published Turkish main equalled its canonical source')
    expected_tr, teacher = translated_turkish(old_w5)
    tr_raw, en_raw = (root / 'w5/tr/index.html').read_text(), (root / 'w5/index.html').read_text()
    check(tr_raw == expected_tr, 'every Turkish W5 byte is preserved except its exact routing/header/teacher migration')
    teaching, original_teaching = (root / 'resources/teaching/index.html').read_text(), old('resources/teaching/index.html')
    position = original_teaching.rfind('</section>')
    check(teaching.startswith(original_teaching[:position]) and teaching.endswith(original_teaching[position:]), 'all prior teacher-hub bytes remain around one additive W5 insertion')
    addition = teaching[position:-len(original_teaching[position:])]
    teacher_tr = teacher.replace('<details id="teacher-note" class="teacher-note">', '<details id="week5-tr" lang="tr">', 1)
    en_match = re.search(r'<details id="week5-en".*?</details>', addition, re.S)
    heading = re.match(r'<h3>Week 5 · [^<]+</h3>\n', addition)
    check(en_match is not None and heading is not None, 'a named W5 teaching entry contains an English edition')
    teacher_en = en_match.group(0)
    check(addition == heading.group(0) + teacher_tr + '\n' + teacher_en.strip() + '\n', 'the addition contains only its heading, verbatim original Turkish guidance and its English edition')
    check(teacher_tr.count('<p>') == teacher_en.count('<p>') == 4, 'both teacher editions retain four guidance paragraphs')
    numbers = lambda raw: [re.findall(r'\d+', n.text()) for n in Page(raw).nodes if n.tag == 'p']
    check(numbers(teacher_tr) == numbers(teacher_en), 'teacher timings and numeric references are preserved in translation')

    en, tr, original = Page(en_raw), Page(tr_raw), Page(old_w5)
    ranges = {'guided-tree': (0, 10), 'guided-hash': (0, 10), 'exit-tree': (0, 10),
              'exit-bucket': (0, 4), 'exit-checks': (0, 10), 'exit-size': (0, 10)}
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
            ('lookup-case', ['found', 'missing', 'insert', 'after', 'update', 'sorted', 'empty']),
            ('lookup-structure', ['bst', 'hash']),
        ):
            check([n.attrs.get('value') for n in page.find(ident).walk() if n.tag == 'option'] == expected, f'exact preset contract: {language} #{ident}')
        check([n.attrs['src'] for n in page.nodes if n.tag == 'script'] == (['model.js?v=1', 'lesson.en.js?v=1'] if language == 'en' else ['../model.js?v=1', '../lesson.js?v=1']), f'unchanged shared model and the correct localized UI: {language}')
        check([n.attrs['href'] for n in page.nodes if n.tag == 'link' and n.attrs.get('rel') == 'stylesheet'] ==
              (['../w1/lesson.css?v=1', 'lesson.css?v=1', '../assets/lesson-language.css?v=2'] if language == 'en' else
               ['../../w1/lesson.css?v=1', '../lesson.css?v=1', '../../assets/lesson-language.css?v=2']), f'unchanged local/shared styles and the language stylesheet: {language}')
        check([v for v in page.links() if 'w4/' in v] == (['../w4/#access', '../w4/'] if language == 'en' else ['../../w4/tr/#access', '../../w4/tr/']), f'the prerequisite and back link retain the current language: {language}')
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
                relative = str(target.relative_to(root)).replace('w4/tr/index.html', 'w4/index.html')
                return relative, u.query, u.fragment
            return v
        return [(n.tag, sorted((k, value(k, v)) for k, v in n.attrs.items() if k not in ignored)) for n in page.find('main').walk()]
    check(skeleton(en, root / 'w5/index.html') == skeleton(tr, root / 'w5/tr/index.html'), 'EN/TR main DOM, state hooks, form attributes and corresponding resolved links are identical')
    glossary = {'pompa': 'pump', 'sera': 'greenhouse', 'depo': 'warehouse', 'çatı': 'roof',
                'kuyu': 'well', 'bahçe': 'garden', 'kapı': 'gate', 'oda': 'room', 'atölye': 'workshop'}
    def displayed_records(page):
        container = next(n for n in page.nodes if n.attrs.get('class') == 'dictionary-records')
        return [(int(next(x.text() for x in n.walk() if x.tag == 'b')),
                 next(x.text() for x in n.walk() if x.tag == 'span'))
                for n in container.children if not isinstance(n, str)]
    check(displayed_records(en) == [(key, glossary[value]) for key, value in displayed_records(tr)],
          'the seven static record cards use the exact key/order/value glossary')
    en_text = ' '.join(x for n in en.find('main').walk() for x in n.children if isinstance(x, str))
    check(all(not re.search(r'\b' + re.escape(word) + r'\b', en_text, re.I) for word in glossary),
          'no Turkish record value survives in the English student text')
    check(all(re.search(r'\b' + value + r'\b', en_text, re.I) for value in glossary.values()),
          'all nine translated record values remain in the English student lesson')
    for label, selector in (('table numbers', lambda n: n.tag in ('td', 'th')), ('pseudocode literals', lambda n: n.tag == 'pre')):
        extract = lambda page: [re.findall(r'\d+', n.text()) for n in page.nodes if selector(n)]
        check(extract(en) == extract(tr), f'identical {label} in both language editions')
    numerical_translations = []
    for a, b in zip(en.find('main').walk(), tr.find('main').walk()):
        local = lambda n: re.findall(r'\d+', ''.join(x for x in n.children if isinstance(x, str)))
        left, right = local(a), local(b)
        if left != right:
            numerical_translations.append((a.tag, left, right))
    check(numerical_translations == [('p', ['5', '0', '1', '2', '3', '4'], ['5', '0', '1', '2', '3', '4', '1'])],
          'all numeric text matches except the explicit 1-based to one-based wording')
    mathematical = re.compile(r'[\s0-9nhmαNC()×²=+\-−*/.,\[\]←≤≥<>]+')
    formulas = lambda page: [re.sub(r'(?<=\d),(?=\d)', '.', re.sub(r'\s+', '', n.text())) for n in page.nodes
                             if n.tag in ('strong', 'code') and mathematical.fullmatch(n.text())]
    check(formulas(en) == formulas(tr), 'standalone mathematical data arrays and rubric scores remain identical')
    expressions = [r'h\+1', r'α=n/m', r'7/5=1[,.]4', r'8/5=1[,.]6', r'O\(1\+α\)', r'O\(1\)', r'O\(n\)']
    expression_counts = lambda page: [len(re.findall(pattern, re.sub(r'\s+', '', page.find('main').text()).replace('−', '-'))) for pattern in expressions]
    check(expression_counts(en) == expression_counts(tr), 'height/load formulas and asymptotic conditions retain all occurrences in both editions')
    for name in ('lesson.js', 'lesson.en.js'):
        script = (root / 'w5' / name).read_text()
        check(script.count(ENABLE) == 1, f'only initialized JavaScript enables the existing hidden controls: {name}')
        check("window.addEventListener('beforeprint'" in script and "window.addEventListener('afterprint'" in script, f'worked-trace print/restore hooks: {name}')
        subprocess.run(['node', '--check', str(root / 'w5' / name)], check=True, capture_output=True)
    ui = ui_contract(root)
    check(ui['contracts']['tr']['entries'] == [dict(key=k, value=v) for k, v in [(18, 'pump'), (7, 'greenhouse'), (24, 'warehouse'), (4, 'roof'), (11, 'well'), (20, 'garden'), (31, 'gate')]], 'the exact original key/order/value glossary is retained')
    check(ui['contracts']['en'] == ui['contracts']['tr'], 'localized UIs share glossary-normalized entries/cases, pure helpers, model calls, event targets, DOM references and numeric keys')
    check(ui['guided'] == [4, 3], 'guided lookup after insertion counts four BST comparisons and three bucket equality checks')
    check([c['expected'] for c in ui['contracts']['en']['checks']] == [3, 2, 3, 5], 'independent keys preserve comparisons, bucket label, equality checks and updated size as separate units')
    check(ui['sample_get'] == {'bst_path': [18, 24, 31], 'hash_bucket': 1, 'hash_keys': [11, 31], 'sorted_path': [4, 7, 11, 18, 20, 24, 31]}, 'fixed found and sorted cases retain BST paths and exact bucket order')
    check(ui['insert_then_find'] == {'bst': 4, 'hash': 3, 'size': 8}, 'adding 26 changes size and only its subsequent lookup is assessed')
    check(ui['updated_size'] == 7 and ui['update_structure_preserved'], 'updating key 31 retains size, tree shape and bucket key order')
    check(ui['oracle_cases'] > 5000, 'independent dictionary model oracles cover empty, found, missing, insertion, update, duplicates and collisions')

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
            'dictionary_oracle_cases': ui['oracle_cases'], 'model_steps_checked': ui['steps'], 'file_sha256': hashes, 'passed_checks': checks}


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
