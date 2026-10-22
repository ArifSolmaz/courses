#!/usr/bin/env python3
"""Pinned read-only audit for the Week 4 English/Turkish migration.

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
BASELINE = '6af61bcf63825ce434e11b44ce145d2bcd02c3de'
EXISTING = {
    'aa/README.md', 'aa/index.html', 'aa/tools/lessons/home.html',
    'aa/resources/teaching/index.html', 'aa/tools/lessons/teaching.html',
    'aa/w3/index.html', 'aa/tools/lessons/w3.html',
    'aa/w3/tr/index.html', 'aa/tools/lessons/w3.tr.html',
    'aa/w4/index.html', 'aa/tools/lessons/w4.html', 'aa/w4/lesson.css',
}
ADDED = {'aa/tools/lessons/w4.tr.html', 'aa/w4/tr/index.html',
         'aa/w4/lesson.en.js', 'aa/tools/verify_week4_bilingual.py'}
COPIES = {'tools/lessons/w4.html': 'w4/index.html', 'tools/lessons/w4.tr.html': 'w4/tr/index.html',
          'tools/lessons/w3.html': 'w3/index.html', 'tools/lessons/w3.tr.html': 'w3/tr/index.html',
          'tools/lessons/home.html': 'index.html', 'tools/lessons/teaching.html': 'resources/teaching/index.html'}
OLD_LANGUAGE = 'Weeks 1–3 have English and Turkish editions. Weeks 4–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
NEW_LANGUAGE = 'Weeks 1–4 have English and Turkish editions. Weeks 5–14 currently open in Turkish; their English editions will be prepared one at a time. Switch language inside each translated lesson.'
ENABLE = "document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });"


def translated_turkish(original):
    teacher = re.search(r'<details id="teacher-note".*?</details>', original, re.S).group(0)
    text = original.replace(teacher, TEACHER_ANCHOR, 1)
    for before, after in (
        ('href="../w1/lesson.css?v=1"', 'href="../../w1/lesson.css?v=1"'),
        ('href="lesson.css?v=1"', 'href="../lesson.css?v=2"'),
        ('src="model.js?v=1"', 'src="../model.js?v=1"'),
        ('src="lesson.js?v=1"', 'src="../lesson.js?v=1"'),
        ('href="../"', 'href="../../"'),
        ('href="../w3/#choice"', 'href="../../w3/tr/#choice"'),
        ('href="../w3/"', 'href="../../w3/tr/"'),
        ('href="../w5/"', 'href="../../w5/"'),
    ):
        assert text.count(before) == 1, f'one original Turkish URL: {before}'
        text = text.replace(before, after, 1)
    old_header = '<span class="week-label">Hafta 4 / 14</span>'
    assert text.count(old_header) == 1
    text = text.replace(old_header,
        '<div class="header-end"><span class="week-label">Hafta 4 / 14</span>'
        '<nav class="language-switch" aria-label="Ders dili"><a href="../" lang="en" hreflang="en">English</a>'
        '<span aria-current="page" lang="tr">Türkçe</span></nav></div>', 1)
    text = text.replace('<link rel="stylesheet" href="../lesson.css?v=2">',
        '<link rel="stylesheet" href="../lesson.css?v=2">\n'
        '<link rel="stylesheet" href="../../assets/lesson-language.css?v=2">\n'
        '<link rel="alternate" hreflang="en" href="../">', 1)
    return text.rstrip() + '\n', teacher


def ui_contract(root):
    """Extract UI data/keys and test the unchanged pure storage/policy model."""
    code = r'''
const fs=require('fs'),vm=require('vm'),root=process.argv[1],model=require(root+'/w4/model.js');
const contracts={};
for(const lang of ['tr','en']){
 const s=fs.readFileSync(root+'/w4/lesson'+(lang==='en'?'.en':'')+'.js','utf8');
 const directory=JSON.parse(s.match(/const directory = (\[[^\]]+\]);/)[1]);
 const cases=vm.runInNewContext('('+s.match(/const cases = (\{[\s\S]*?\n  \});/)[1]+')',{directory});
 const policyEvents=vm.runInNewContext('('+s.match(/const events = (\[[\s\S]*?\n  \]);/)[1]+')');
 const independent=JSON.parse(s.match(/const values = (\[[^\]]+\]);/)[1]);
 const helpers=Object.fromEntries(['el','orderedNodes','resetStorage','resetPolicy','number'].map(name=>[name,s.match(new RegExp('  function '+name+'\\([\\s\\S]*?\\n  \\}'))[0]]));
 const calls=[...s.matchAll(/model\.(traceAccess|traceInsert|tracePolicy)\(([^;\n]*?)\)/g)].map(x=>x.slice(1,3));
 const events=[...s.matchAll(/\$\('([^']+)'\)\.addEventListener\('([^']+)'/g)].map(x=>x.slice(1,3));
 const refs=[...s.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 const access=model.traceAccess(independent,4,'linked'),array=model.traceInsert(independent,3,10,'array',{capacity:6}),linked=model.traceInsert(independent,3,10,'linked');
 const literal=s.match(/const checks = (\[\n[\s\S]*?\n    \]);/)[1];
 const checks=vm.runInNewContext('('+literal+')',{access,array,linked,number:(id,min,max)=>({id,min,max})}).map(({id,min,max,expected})=>({id,min,max,expected}));
 contracts[lang]={directory,cases,policyEvents,independent,helpers,calls,events,refs,checks};
}
const eq=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(label);};
let accessCases=0,insertCases=0,policyCases=0,stepCount=0;
for(let n=0;n<=32;n++){
 const values=Array.from({length:n},(_,i)=>3*i+1);
 for(let k=1;k<=n;k++)for(const structure of ['array','linked']){
  const r=model.traceAccess(values,k,structure);if(r.value!==values[k-1])throw Error('read value oracle');
  eq(r.counts,structure==='array'?{indexReads:1,linkFollows:0,nodeValueReads:0}:{indexReads:0,linkFollows:k-1,nodeValueReads:1},'separate access units');
  if(r.steps.length!==(structure==='array'?1:k))throw Error('access step count');
  if(r.steps.at(-1).op!==(structure==='array'?'index-read':'node-read'))throw Error('final value-read operation');
  if(structure==='linked')r.steps.slice(0,-1).forEach((s,i)=>{if(s.op!=='follow-link'||s.from!==i+1||s.to!==i+2)throw Error('one-based access path');});
  stepCount+=r.steps.length;accessCases++;
 }
 for(let p=1;p<=n+1;p++)for(const scenario of ['array','linked','known']){
  const structure=scenario==='array'?'array':'linked',known=scenario==='known';
  const r=model.traceInsert(values,p,999,structure,{capacity:n+1,predecessorKnown:known});
  const expected=values.slice(0,p-1).concat([999],values.slice(p-1));eq(r.result,expected,'inserted order');
  if(structure==='array'){
   eq(r.counts,{valueShifts:n-p+1,valueWrites:1,linkFollows:0,pointerWrites:0},'array insertion units');
   r.steps.slice(0,-1).forEach((s,i)=>{if(s.op!=='shift'||s.from!==n-i||s.to!==n-i+1||s.value!==values[n-i-1])throw Error('right-to-left shift order');});
   if(r.steps.at(-1).op!=='value-write')throw Error('new value written last');
   eq(r.steps.at(-1).state.slots,expected,'array final slots');
  }else{
   const follows=known?0:Math.max(0,p-2);
   eq(r.counts,{valueShifts:0,valueWrites:0,linkFollows:follows,pointerWrites:2},'linked insertion units');
   if(r.steps.length!==follows+2)throw Error('linked step count');
   const writes=r.steps.slice(-2);
   if(writes[0].op!=='pointer-write'||writes[0].field!=='new.next'||writes[0].next!==(p<=n?'N'+p:null)||writes[1].field!==(p===1?'head':'N'+(p-1)+'.next')||writes[1].next!=='new')throw Error('preserve continuation before reconnecting predecessor');
   const state=writes[1].state,map=new Map(state.nodes.map(x=>[x.id,x])),seen=new Set(),ordered=[];
   let node=state.head;while(node!==null){if(seen.has(node)||!map.has(node))throw Error('broken/cyclic final chain');seen.add(node);const item=map.get(node);if(!item.nextSet)throw Error('unwritten final pointer');ordered.push(item.value);node=item.next;}
   eq(ordered,expected,'linked final traversal');
  }
  stepCount+=r.steps.length;insertCases++;
 }
}
for(let length=0;length<=7;length++)for(let encoding=0;encoding<2**length;encoding++)for(const policy of ['fifo','lifo']){
 const events=Array.from({length},(_,i)=>encoding&(1<<i)?{type:'put',token:'m'+i,id:i%3}:{type:'take'});
 const result=model.tracePolicy(events,policy),waiting=[],removed=[];
 events.forEach((event,i)=>{
  let item=null,empty=false;
  if(event.type==='put'){item={token:event.token,id:event.id};waiting.push(item);}
  else if(waiting.length){const index=policy==='fifo'?0:waiting.length-1;item=waiting[index];waiting.splice(index,1);removed.push(item);}
  else empty=true;
  const actual=result.steps[i];eq(actual.state,waiting,'waiting order');eq(actual.removed,removed,'removal order');eq(actual.item,item,'selected message identity');
  if(actual.event!==i+1||actual.type!==event.type||actual.empty!==empty)throw Error('policy event/empty oracle');
 });
 eq(result.remaining,waiting,'final waiting');eq(result.removed,removed,'final removals');stepCount+=result.steps.length;policyCases++;
}
const d=contracts.en.directory,events=contracts.en.policyEvents;
const guided=[model.traceInsert(d,2,6,'array',{capacity:7}).counts.valueShifts,model.traceInsert(d,2,6,'linked').counts.linkFollows];
const samplePolicies=Object.fromEntries(['fifo','lifo'].map(p=>[p,model.tracePolicy(events,p).removed.map(x=>x.id)]));
console.log(JSON.stringify({contracts,guided,sample_policies:samplePolicies,access_cases:accessCases,insert_cases:insertCases,policy_cases:policyCases,steps:stepCount}));
'''
    return json.loads(subprocess.check_output(['node', '-e', code, str(root)], text=True))

def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo, checks, hashes = root.parent, [], {}

    def check(ok, label):
        assert ok, label
        checks.append(label)

    check(baseline == BASELINE, 'the fixture is the published bilingual-W3 baseline')
    blobs = {}
    for row in git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0'):
        if row:
            meta, name = row.split(b'\t')
            blobs[name.decode()] = meta.decode().split()[2]
    check(len(blobs) == 587, 'the pinned baseline contains exactly 587 AA files')
    names = {n.decode() for n in git(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'aa').split(b'\0') if n}
    check(names - set(blobs) == ADDED, 'exactly four new bilingual-W4 files are present')
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
    for name in ('tools/lessons/w3.html', 'w3/index.html', 'tools/lessons/w3.tr.html', 'w3/tr/index.html'):
        before = old(name)
        a, b = ('href="../../w4/"', 'href="../../w4/tr/"') if '.tr.' in name or '/tr/' in name else ('Week 4 (Turkish): organise data for the task →', 'Week 4: organise data for the task →')
        check(before.count(a) == 1 and (root / name).read_text() == before.replace(a, b, 1), f'W3 changes only its same-language next URL or label: {name}')
    for name in ('index.html', 'tools/lessons/home.html'):
        before = old(name)
        check(before.count(OLD_LANGUAGE) == 1 and (root / name).read_text() == before.replace(OLD_LANGUAGE, NEW_LANGUAGE, 1), f'home changes only language availability: {name}')
    check((root / 'README.md').read_bytes().startswith(old('README.md').encode()), 'README documentation is append-only')
    original_css = old('w4/lesson.css')
    marker = '.storage-card,.message-card{'
    storage_width = '.storage-board{grid-template-columns:repeat(auto-fit,minmax(min(100%,6em),1fr))}'
    check(original_css.count(marker) == 1 and (root / 'w4/lesson.css').read_text() ==
          original_css.replace(marker, storage_width + marker, 1),
          'the local CSS adds only the measured empty-slot width fix; the original combined storage/policy rule and all other bytes remain')
    old_w4 = old('w4/index.html')
    check(old_w4 == old('tools/lessons/w4.html'), 'the published Turkish main equalled its canonical source')
    expected_tr, teacher = translated_turkish(old_w4)
    tr_raw, en_raw = (root / 'w4/tr/index.html').read_text(), (root / 'w4/index.html').read_text()
    check(tr_raw == expected_tr, 'every Turkish W4 byte is preserved except its exact routing/header/teacher migration')
    teaching, original_teaching = (root / 'resources/teaching/index.html').read_text(), old('resources/teaching/index.html')
    position = original_teaching.rfind('</section>')
    check(teaching.startswith(original_teaching[:position]) and teaching.endswith(original_teaching[position:]), 'all prior teacher-hub bytes remain around one additive W4 insertion')
    addition = teaching[position:-len(original_teaching[position:])]
    teacher_tr = teacher.replace('<details id="teacher-note" class="teacher-note">', '<details id="week4-tr" lang="tr">', 1)
    en_match = re.search(r'<details id="week4-en".*?</details>', addition, re.S)
    heading = re.match(r'<h3>Week 4 · [^<]+</h3>\n', addition)
    check(en_match is not None and heading is not None, 'a named W4 teaching entry contains an English edition')
    teacher_en = en_match.group(0)
    check(addition == heading.group(0) + teacher_tr + '\n' + teacher_en.strip() + '\n', 'the addition contains only its heading, verbatim original Turkish guidance and its English edition')
    check(teacher_tr.count('<p>') == teacher_en.count('<p>') == 4, 'both teacher editions retain four guidance paragraphs')
    numbers = lambda raw: [re.findall(r'\d+', n.text()) for n in Page(raw).nodes if n.tag == 'p']
    check(numbers(teacher_tr) == numbers(teacher_en), 'teacher timings and numeric references are preserved in translation')

    en, tr, original = Page(en_raw), Page(tr_raw), Page(old_w4)
    ranges = {'guided-shifts': (0, 6), 'guided-follows': (0, 6), 'exit-access': (0, 10),
              'exit-shifts': (0, 10), 'exit-locate': (0, 10), 'exit-pointers': (0, 10)}
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
            ('storage-case', ['access', 'insert', 'head', 'tail', 'empty']),
            ('storage-structure', ['array', 'linked']), ('policy-mode', ['fifo', 'lifo']),
        ):
            check([n.attrs.get('value') for n in page.find(ident).walk() if n.tag == 'option'] == expected, f'exact preset contract: {language} #{ident}')
        check([n.attrs['src'] for n in page.nodes if n.tag == 'script'] == (['model.js?v=1', 'lesson.en.js?v=1'] if language == 'en' else ['../model.js?v=1', '../lesson.js?v=1']), f'unchanged shared model and the correct localized UI: {language}')
        check([n.attrs['href'] for n in page.nodes if n.tag == 'link' and n.attrs.get('rel') == 'stylesheet'] ==
              (['../w1/lesson.css?v=1', 'lesson.css?v=2', '../assets/lesson-language.css?v=2'] if language == 'en' else
               ['../../w1/lesson.css?v=1', '../lesson.css?v=2', '../../assets/lesson-language.css?v=2']), f'unchanged shared styles and the properly versioned local empty-slot fix: {language}')
        check([v for v in page.links() if 'w3/' in v] == (['../w3/#choice', '../w3/'] if language == 'en' else ['../../w3/tr/#choice', '../../w3/tr/']), f'the prerequisite and back link retain the current language: {language}')
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
                relative = str(target.relative_to(root)).replace('w3/tr/index.html', 'w3/index.html')
                return relative, u.query, u.fragment
            return v
        return [(n.tag, sorted((k, value(k, v)) for k, v in n.attrs.items() if k not in ignored)) for n in page.find('main').walk()]
    check(skeleton(en, root / 'w4/index.html') == skeleton(tr, root / 'w4/tr/index.html'), 'EN/TR main DOM, state hooks, form attributes and corresponding resolved links are identical')
    for label, selector in (('table numbers', lambda n: n.tag in ('td', 'th')), ('pseudocode literals', lambda n: n.tag == 'pre')):
        extract = lambda page: [re.findall(r'\d+', n.text()) for n in page.nodes if selector(n)]
        check(extract(en) == extract(tr), f'identical {label} in both language editions')
    # The English edition writes the fourth/second positions as digits and
    # changes natural value/position word order. Pin these seven exact cases;
    # retain every other individual text node's numerical sequence.
    numerical_translations = []
    for a, b in zip(en.find('main').walk(), tr.find('main').walk()):
        local = lambda n: re.findall(r'\d+', ''.join(x for x in n.children if isinstance(x, str)))
        left, right = local(a), local(b)
        if left != right:
            numerical_translations.append((a.tag, left, right))
    check(numerical_translations == [
        ('h2', ['15', '4'], ['15']),
        ('li', ['31', '6', '7'], ['6', '31', '7']),
        ('li', ['24', '5', '6'], ['5', '24', '6']),
        ('li', ['18', '4', '5'], ['4', '18', '5']),
        ('p', ['4', '5', '5', '6', '18', '24', '3', '3'], ['4', '5', '5', '6', '24', '18', '3', '3']),
        ('p', ['0', '1', '2', '2'], ['1', '0', '2', '2']),
        ('h2', ['6', '2'], ['6']),
    ], 'all numeric text matches except the seven explicit ordinal/value/position translations')
    mathematical = re.compile(r'[\s0-9nkpNC()×²=+\-−*/.,\[\]←≤≥<>]+')
    formulas = lambda page: [re.sub(r'\s+', '', n.text()) for n in page.nodes
                             if n.tag in ('strong', 'code') and mathematical.fullmatch(n.text())]
    check(formulas(en) == formulas(tr), 'standalone mathematical data arrays and rubric scores remain identical')
    expressions = [r'n-p\+1', r'p-2', r'k-1', r'1≤k≤n', r'1≤p≤n\+1', r'p=n\+1', r'p≥2', r'n≥1', r'p-1=3']
    expression_counts = lambda page: [len(re.findall(pattern, re.sub(r'\s+', '', page.find('main').text()).replace('−', '-'))) for pattern in expressions]
    check(expression_counts(en) == expression_counts(tr), 'access/insertion formulas and boundary conditions retain all occurrences in both editions')
    for name in ('lesson.js', 'lesson.en.js'):
        script = (root / 'w4' / name).read_text()
        check(script.count(ENABLE) == 1, f'only initialized JavaScript enables the existing hidden controls: {name}')
        check("window.addEventListener('beforeprint'" in script and "window.addEventListener('afterprint'" in script, f'worked-trace print/restore hooks: {name}')
        subprocess.run(['node', '--check', str(root / 'w4' / name)], check=True, capture_output=True)
    ui = ui_contract(root)
    check(ui['contracts']['en'] == ui['contracts']['tr'], 'localized UIs share directory/cases, policy events, pure helpers, model calls, event targets, DOM references and numeric keys')
    check(ui['guided'] == [5, 0], 'guided insertion counts five array shifts and zero predecessor-link follows')
    check([c['expected'] for c in ui['contracts']['en']['checks']] == [3, 3, 1, 2], 'independent keys preserve access links, array shifts, predecessor links and pointer writes as separate units')
    check(ui['sample_policies'] == {'fifo': [24, 4], 'lifo': [18, 11]}, 'the fixed message examples obey FIFO and LIFO without sorting device IDs')
    check((ui['access_cases'], ui['insert_cases'], ui['policy_cases']) == (1056, 1683, 510), 'all independent access, insertion and policy oracle cases pass')

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
            'access_oracle_cases': ui['access_cases'], 'insert_oracle_cases': ui['insert_cases'],
            'policy_oracle_cases': ui['policy_cases'], 'model_steps_checked': ui['steps'], 'file_sha256': hashes, 'passed_checks': checks}


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
