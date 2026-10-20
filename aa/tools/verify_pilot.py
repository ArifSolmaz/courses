#!/usr/bin/env python3
"""Read-only pilot-kit checks: paper content, local links, and preservation.

This does not assess student explanations, infer learning effects, or replace
the independent pilot model and browser workflow tests. Python's standard
library and Node are the only runtime requirements.
"""
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import csv
import hashlib
import io
import json
import re
import subprocess

from verify_capstone import Document, Element, Verification, hidden


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
BASELINE = '87d0bc4c124ee180b13a72c2cd6e2c2a6e078eb5'
START = b'<!-- AA:PILOT-ENTRY:START -->'
END = b'<!-- AA:PILOT-ENTRY:END -->'
DIMENSIONS = ['code', 'math', 'purpose', 'links']
PARTICIPANTS = [f'P{n:02d}' for n in range(1, 9)]


def committed(path, baseline=BASELINE):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{baseline}:{path}'],
                          check=True, capture_output=True).stdout


def metadata(root):
    script = ('const cap=require(process.argv[1]),pilot=require(process.argv[2]);'
              'process.stdout.write(JSON.stringify({dimensions:cap.DIMENSIONS,'
              'questions:cap.PHASES.pre.questions,pilotDimensions:pilot.DIMENSIONS,'
              'rubrics:pilot.RUBRICS,ids:pilot.IDS,'
              'template:pilot.toCSV(pilot.IDS.map(id=>pilot.createRecord(id)))}));')
    process = subprocess.run(['node', '-e', script,
                              str(root / 'bridge/capstone/model.js'),
                              str(root / 'bridge/capstone/pilot/model.js')],
                             check=True, capture_output=True, text=True)
    return json.loads(process.stdout)


def strip_pilot_entry(source, check):
    check.equal(source.count(START), 1, 'One additive pilot entry start')
    check.equal(source.count(END), 1, 'One additive pilot entry end')
    start, end = source.index(START), source.index(END)
    check.ensure(start < end, 'Pilot entry markers have the correct order')
    return source[:start] + source[end + len(END):]


def preservation(root, check, baseline):
    capstone = root / 'bridge/capstone'
    current = (capstone / 'index.html').read_bytes()
    original = committed('aa/bridge/capstone/index.html', baseline)
    restored = strip_pilot_entry(current, check)
    check.ensure(restored == original, 'Capstone HTML outside the reversible pilot entry is byte-identical '
                 f'(actual {len(restored)} bytes, expected {len(original)} bytes)')
    entry = Document(current.split(START, 1)[1].split(END, 1)[0].decode('utf-8')).root
    link = check.one(entry, tag='a')
    check.equal(link.attrs.get('href'), 'pilot/', 'The additive entry opens this pilot kit')
    for name in ('app.js', 'model.js', 'style.css'):
        check.ensure((capstone / name).read_bytes() == committed('aa/bridge/capstone/' + name, baseline),
                     'Existing capstone asset is byte-identical: ' + name)
    original_readme = committed('aa/README.md', baseline)
    check.ensure((root / 'README.md').read_bytes().startswith(original_readme),
                 'README changes append to the original document')
    # Check all existing Week 1–14 files, not only the visible index pages.
    arguments = ['git', '-C', str(REPO), 'ls-tree', '-r', '-z', baseline, '--']
    arguments.extend(f'aa/w{week}/' for week in range(1, 15))
    entries = subprocess.run(arguments, check=True, capture_output=True).stdout
    inventory = []
    for raw in entries.split(b'\0'):
        if not raw:
            continue
        header, name = raw.split(b'\t', 1)
        mode, kind, object_id = header.decode().split()
        check.equal(kind, 'blob', 'Week inventory contains authored file blobs')
        relative = Path(name.decode()).relative_to('aa')
        file = root / relative
        check.ensure(file.is_file(), 'Existing week file retained: ' + str(relative))
        data = file.read_bytes()
        digest = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
        check.equal(digest, object_id, 'Week file preserved: ' + str(relative))
        inventory.append(relative.as_posix())
    check.ensure(all(f'w{week}/index.html' in inventory for week in range(1, 15)),
                 'All fourteen original week entry pages are checked')
    current_inventory = {file.relative_to(root).as_posix()
                         for week in range(1, 15) for file in (root / f'w{week}').rglob('*') if file.is_file()}
    check.equal(current_inventory, set(inventory), 'No week files were added or removed outside the pilot scope')
    return {'baseline': baseline, 'unchanged_week_files': len(inventory),
            'capstone_original_assets_unchanged': True,
            'capstone_html_outside_entry_unchanged': True,
            'readme_append_only': True}


def html_basics(root, check):
    pilot = root / 'bridge/capstone/pilot'
    source = (pilot / 'index.html').read_text(encoding='utf-8')
    document = Document(source).root
    elements = list(document.walk())
    check.ensure(source.lstrip().lower().startswith('<!doctype html>'), 'Pilot uses an HTML5 document')
    check.equal(check.one(document, tag='html').attrs.get('lang'), 'tr', 'Turkish document language')
    check.one(document, tag='meta', attribute='name', value='viewport')
    check.one(document, tag='title')
    check.one(document, tag='h1')
    main = check.one(document, tag='main')
    ids = [node.attrs['id'] for node in elements if 'id' in node.attrs]
    check.ensure(all(ids), 'HTML IDs are nonempty')
    check.equal([name for name, count in Counter(ids).items() if count > 1], [], 'HTML IDs are unique')
    by_id = {node.attrs['id']: node for node in elements if 'id' in node.attrs}
    labelable = {'input', 'select', 'textarea', 'button', 'meter', 'output', 'progress'}
    label_count = 0
    for label in (node for node in elements if node.tag == 'label'):
        if 'for' in label.attrs:
            target = by_id.get(label.attrs['for'])
            check.ensure(target is not None and target.tag in labelable and target.attrs.get('type') != 'hidden',
                         'An explicit label targets a labelable control')
        else:
            check.equal(sum(node.tag in labelable for node in label.walk()), 1,
                        'An implicit label contains one control')
        label_count += 1
    for node in elements:
        if node.tag in ('input', 'select', 'textarea') and node.attrs.get('type') != 'hidden':
            explicit = node.attrs.get('id') and any(label.tag == 'label' and
                       label.attrs.get('for') == node.attrs['id'] for label in elements)
            ancestor = node.parent
            implicit = False
            while ancestor is not None:
                implicit |= ancestor.tag == 'label'
                ancestor = ancestor.parent
            check.ensure(explicit or implicit or node.attrs.get('aria-label') or node.attrs.get('aria-labelledby'),
                         'Every form control has a usable label')
        if node.tag == 'button':
            check.equal(node.attrs.get('type'), 'button', 'Enhancement buttons cannot submit a native paper form')
        if node.tag == 'form':
            check.ensure(not node.attrs.get('action'), 'Paper forms do not send participant data')
        if node.tag == 'th':
            check.ensure(node.attrs.get('scope') in ('row', 'col', 'rowgroup', 'colgroup'),
                         'Table header scope is explicit')
    check.ensure(any(node.tag == 'noscript' for node in elements), 'Native paper use is explained without JavaScript')
    dependencies, links = [], []
    parsed = {}
    for node in elements:
        for attribute in ('href', 'src'):
            if attribute not in node.attrs:
                continue
            address = node.attrs[attribute]
            url = urlsplit(address)
            if url.scheme or url.netloc:
                check.ensure(node.tag == 'a' and url.scheme in ('http', 'https'),
                             'All executable and presentation dependencies are local')
                continue
            target = (pilot / unquote(url.path)).resolve() if url.path else pilot / 'index.html'
            if target.is_dir():
                target /= 'index.html'
            check.ensure(target.is_relative_to(root), 'Local links stay within AA')
            check.ensure(target.is_file(), 'A local target exists: ' + address)
            if url.fragment:
                if target not in parsed:
                    parsed[target] = Document(target.read_text(encoding='utf-8')).root
                targets = {n.attrs['id'] for n in parsed[target].walk() if 'id' in n.attrs}
                check.ensure(unquote(url.fragment) in targets, 'A local fragment exists: ' + address)
            item = {'url': address, 'target': target.relative_to(root).as_posix()}
            (links if node.tag == 'a' else dependencies).append(item)
            if node.tag == 'script':
                check.ensure('defer' in node.attrs, 'Enhancement scripts defer until the paper markup exists')
    scripts = [node.attrs.get('src') for node in elements if node.tag == 'script']
    check.equal(scripts, ['../model.js', 'model.js', 'csv.js', 'app.js?v=csv-resume-1'], 'Parent rubric and pilot models load before CSV support and app')
    check.ensure(any(item['target'] == 'bridge/capstone/pilot/style.css' for item in dependencies),
                 'The pilot stylesheet is local and linked')
    return document, by_id, {'unique_ids': len(ids), 'valid_labels': label_count,
                             'local_links': links, 'local_dependencies': dependencies}


def paper_contract(document, by_id, model, check):
    sections = {}
    for identifier in ('ogrenci', 'ogretmen', 'sonuclar'):
        section = check.one(document, tag='section', attribute='id', value=identifier)
        check.ensure(not hidden(section), 'Paper section is available without JavaScript: ' + identifier)
        sections[identifier] = section
    schedule = check.one(sections['ogrenci'], tag='ol', attribute='class', value='schedule')
    items = [node for node in schedule.children if isinstance(node, Element) and node.tag == 'li']
    times = [check.one(item, tag='strong').text() for item in items]
    check.equal(times, ['4 dk', '10 dk', '6 dk', '5 dk'], 'The pilot uses the original four-part time plan')
    check.equal(sum(int(time.split()[0]) for time in times), 25, 'The paper plan totals 25 minutes')
    check.ensure('25 dakika' in sections['ogrenci'].text(), 'The student guide states the planned duration')
    check.ensure('ad veya öğrenci numarası yazma' in sections['ogrenci'].text(), 'Students use codes rather than identifiers')
    check.ensure('raporunu indirdim' in sections['ogrenci'].text(), 'The student checklist includes saving the report')
    form = check.one(sections['ogretmen'], tag='form', attribute='id', value='record-form')
    check.ensure(not hidden(form), 'The teacher evidence form exists without JavaScript')
    fields = [node for node in form.walk() if node.tag == 'fieldset' and 'data-dimension' in node.attrs]
    check.equal([node.attrs['data-dimension'] for node in fields], DIMENSIONS, 'Four paper teacher dimensions in the original order')
    title_for = {dimension['id']: dimension['title'] for dimension in model['dimensions']}
    rubric_count, evidence_count = 0, 0
    for field in fields:
        dimension = field.attrs['data-dimension']
        check.ensure(not hidden(field), 'A teacher dimension is available on paper')
        check.equal(check.one(field, tag='legend').text(), title_for[dimension], 'Teacher dimension label')
        criteria = check.one(field, tag='ol', attribute='data-rubric', value=dimension)
        check.equal(criteria.attrs.get('start'), '0', 'Teacher rubric begins at level zero')
        points = [node.text() for node in criteria.children if isinstance(node, Element) and node.tag == 'li']
        check.equal(points, model['rubrics'][dimension], 'Paper rubric keeps the three actual parent strings')
        rubric_count += len(points)
        for phase in ('pre', 'post'):
            score = check.one(field, tag='select', attribute='id', value=f'teacher-{phase}-{dimension}')
            check.equal(score.attrs.get('data-phase'), phase, 'Teacher score phase')
            check.equal(score.attrs.get('data-dimension'), dimension, 'Teacher score dimension')
            choices = [node for node in score.walk() if node.tag == 'option']
            check.equal([node.attrs.get('value') for node in choices], ['', '0', '1', '2'],
                        'A blank teacher score is separate from the real score zero')
            check.equal(choices[0].text(), 'Seçilmedi', 'The blank teacher option is truthfully named')
            evidence = check.one(field, tag='textarea', attribute='id', value=f'evidence-{phase}-{dimension}')
            check.equal(evidence.attrs.get('maxlength'), '1200', 'Each score has a bounded evidence field')
            check.equal(evidence.attrs.get('aria-describedby'), 'evidence-help', 'Evidence requirements are linked to each field')
            check.ensure(not hidden(score) and not hidden(evidence), 'Score and evidence are available on paper')
            evidence_count += 1
    for kind, upper in (('choice', 4), ('self', 8)):
        for phase in ('pre', 'post'):
            control = check.one(form, tag='input', attribute='id', value=f'{kind}-{phase}')
            check.equal({key: control.attrs.get(key) for key in ('type', 'min', 'max', 'step')},
                        {'type': 'number', 'min': '0', 'max': str(upper), 'step': '1'},
                        'Choice correctness and self-ratings retain separate numeric ranges')
    check.ensure('öğretmen puanının yerine kullanma' in form.text(), 'Other score types are not teacher scores')
    check.ensure('boş değer 0 değildir' in by_id['evidence-help'].text(), 'Missing evidence scores are not called zero')
    participant = check.one(form, tag='select', attribute='id', value='participant')
    options = [node for node in participant.walk() if node.tag == 'option']
    check.equal([(node.attrs.get('value'), node.text()) for node in options],
                list(zip(PARTICIPANTS, PARTICIPANTS)), 'The teacher can select each of eight pseudonymous slots')
    check.ensure(not hidden(by_id['paper-participant']), 'A participant line exists for the native paper form')
    for identifier, maximum in (('bottleneck', 500), ('notes', 1200), ('pilot-conclusion', 1200)):
        control = check.one(document, tag='textarea', attribute='id', value=identifier)
        check.equal(control.attrs.get('maxlength'), str(maximum), 'Observation length limit: ' + identifier)
    minutes = check.one(form, tag='input', attribute='id', value='minutes')
    check.equal({key: minutes.attrs.get(key) for key in ('type', 'min', 'max', 'step')},
                {'type': 'number', 'min': '0', 'max': '120', 'step': 'any'}, 'Observed duration accepts any finite fractional minute in range')
    print_fields = [node.attrs['data-print-field'] for node in document.walk() if 'data-print-field' in node.attrs]
    expected_print = {'participant', 'minutes', 'bottleneck', 'choice.pre', 'choice.post',
                      'self.pre', 'self.post', 'notes', 'pilotConclusion'}
    expected_print |= {f'{kind}.{dimension}.{phase}' for kind in ('teacher', 'evidence')
                       for dimension in DIMENSIONS for phase in ('pre', 'post')}
    check.equal(set(print_fields), expected_print, 'Every form value has a print mirror')
    check.equal(len(print_fields), len(expected_print), 'Print mirrors are unique')
    paper_tables = [node for node in sections['sonuclar'].walk() if node.tag == 'table'
                    and any(n.tag == 'th' and n.text() == 'P01' for n in node.walk())]
    check.equal(len(paper_tables), 1, 'One native eight-participant comparison table')
    paper_table = paper_tables[0]
    check.ensure(not hidden(paper_table), 'The paper comparison table needs no JavaScript')
    body = check.one(paper_table, tag='tbody')
    rows = [node for node in body.children if isinstance(node, Element) and node.tag == 'tr']
    check.equal([check.one(row, tag='th').text() for row in rows], PARTICIPANTS, 'Eight paper table rows are P01–P08')
    for row in rows:
        cells = [node for node in row.children if isinstance(node, Element) and node.tag == 'td']
        check.equal(len(cells), 9, 'Paper row separates teacher, choice, self, duration, and status columns')
        check.ensure(all(not node.text().strip() for node in cells), 'Unused paper cells are blank, never prefilled with zero')
    check.one(document, tag='tbody', attribute='id', value='comparison-body')
    for identifier in ('record-errors', 'record-status', 'comparison-summary', 'dimension-results',
                       'total-results', 'timing-results', 'download-template', 'download-results'):
        check.ensure(identifier in by_id, 'The enhancement contract has a stable target: ' + identifier)
    check.ensure('eşleşmeleri karşılaştır' in sections['sonuclar'].text(), 'The paper summary explains matched records')
    check.ensure('Boyutlara ait öğrenci sayısı farklı olabilir' in sections['sonuclar'].text(), 'Different dimensions may have different matched n')
    return {'paper_sections': list(sections), 'schedule_minutes': [4, 10, 6, 5],
            'teacher_rubric_strings': rubric_count, 'teacher_evidence_fields': evidence_count,
            'print_mirrors': len(print_fields), 'paper_participant_rows': len(rows)}


def csv_contract(model, check):
    rows = list(csv.reader(io.StringIO(model['template'], newline='')))
    check.equal(len(rows), 9, 'The downloadable blank CSV has a header and eight participant rows')
    headers = ['Öğrenci kodu', 'Durum', 'Hatalar', 'Süre (dakika)',
               'Seçenek başlangıç (0–4)', 'Seçenek aktarım (0–4)', 'Seçenek farkı (aktarım − başlangıç)',
               'Özpuan başlangıç (0–8)', 'Özpuan aktarım (0–8)', 'Özpuan farkı (aktarım − başlangıç)',
               'Öğretmen başlangıç toplamı (0–8)', 'Öğretmen aktarım toplamı (0–8)',
               'Öğretmen toplam farkı (aktarım − başlangıç)']
    for dimension in model['dimensions']:
        headers.extend(dimension['title'] + suffix for suffix in
                       (' · öğretmen başlangıç (0–2)', ' · başlangıç kanıtı',
                        ' · öğretmen aktarım (0–2)', ' · aktarım kanıtı',
                        ' · öğretmen farkı (aktarım − başlangıç)'))
    headers.extend(['Takılma noktası', 'Öğretmen notları', 'Oturum sonuç notu'])
    check.equal(rows[0], headers, 'CSV labels distinguish teacher, self, choice, evidence, and units')
    check.equal(len(set(headers)), 36, 'The 36 CSV fields have unique human-readable labels')
    check.equal([row[0] for row in rows[1:]], PARTICIPANTS, 'The CSV keeps P01–P08 in a stable order')
    for row in rows[1:]:
        check.equal(len(row), len(headers), 'A blank CSV row retains all fields')
        check.equal(row[1], 'Boş', 'Unused participant slots are named blank rather than valid participants')
        check.ensure(all(value == '' for value in row[2:]), 'The blank CSV never invents zero scores or observations')
    return {'csv_columns': len(headers), 'csv_participant_rows': len(rows) - 1,
            'csv_missing_values_remain_blank': True}


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    check = Verification()
    report = {'scope': 'Pilot paper/model metadata, links, and exact preservation; runtime behavior and learning effects are not inferred.',
              'started_at_utc': datetime.now(timezone.utc).isoformat()}
    try:
        model = metadata(root)
        check.equal([d['id'] for d in model['dimensions']], DIMENSIONS, 'Four original learning dimensions')
        check.equal(model['pilotDimensions'], model['dimensions'], 'Pilot names the same four learning difficulties')
        check.equal(model['ids'], PARTICIPANTS, 'Eight pseudonymous participant slots, P01 through P08')
        expected_rubrics = {question['id']: question['rubric'] for question in model['questions']}
        check.equal(model['rubrics'], expected_rubrics, 'Teacher criteria equal the actual parent rubric strings')
        report.update(csv_contract(model, check))
        document, by_id, details = html_basics(root, check)
        report.update(details)
        report.update(paper_contract(document, by_id, model, check))
        report.update(preservation(root, check, baseline))
        report.update({'status': 'passed', 'dimensions': DIMENSIONS, 'participant_ids': PARTICIPANTS})
    except (AssertionError, OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError) as error:
        report.update({'status': 'failed', 'error': str(error)})
    report['assertions'] = check.assertions
    report['completed_at_utc'] = datetime.now(timezone.utc).isoformat()
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='AA tree to inspect (default: this repository).')
    parser.add_argument('--baseline', default=BASELINE, help='Reviewed commit whose existing content must be retained.')
    parser.add_argument('--report', type=Path, help='Optional JSON report outside the inspected AA tree.')
    args = parser.parse_args()
    if args.report and args.report.resolve().is_relative_to(args.root.resolve()):
        parser.error('--report must be outside the inspected AA tree')
    result = verify(args.root, args.baseline)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result['status'] == 'passed' else 1)
