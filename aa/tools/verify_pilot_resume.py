#!/usr/bin/env python3
"""Read-only CSV-resume checks for additive markup and the legacy pilot kit.

The CSV parser and asynchronous browser workflow have independent tests.
This verifier preserves the authored paper kit, checks the local enhancement
contract, and confirms that versioned CSV adds one column to the old schema.
"""
from datetime import datetime, timezone
from pathlib import Path
import argparse
import csv
import io
import json
import subprocess

from verify_capstone import Document, Verification, hidden
from verify_pilot import ROOT, REPO, PARTICIPANTS, verify as verify_pilot


BASELINE = '73e01495a0cc2f0f36c9cc5c320ff5420775a474'
START = b'<!-- AA:PILOT-CSV:START -->'
END = b'<!-- AA:PILOT-CSV:END -->'
CSV_SCRIPT = b'<script src="csv.js" defer></script>\n'
CACHE_ATTRIBUTES = ((b'href="style.css?v=csv-resume-1"', b'href="style.css"'),
                    (b'src="app.js?v=csv-resume-1"', b'src="app.js"'))


def committed(relative, baseline):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{baseline}:aa/{relative}'],
                          capture_output=True, check=True).stdout


def remove_addition(source, check):
    check.equal(source.count(START), 1, 'One CSV entry start marker')
    check.equal(source.count(END), 1, 'One CSV entry end marker')
    check.equal(source.count(CSV_SCRIPT), 1, 'One standalone deferred CSV script line')
    start, end = source.index(START), source.index(END)
    check.ensure(start < end, 'CSV entry markers have the correct order')
    # The added panel occupies whole lines in the existing authored HTML.
    # Its terminating line break belongs to that addition, just as the
    # deferred script's terminating line break belongs to its new line.
    end += len(END)
    check.ensure(source[end:end + 1] == b'\n', 'The added CSV block ends on its own line')
    restored = (source[:start] + source[end + 1:]).replace(CSV_SCRIPT, b'', 1)
    for current, original in CACHE_ATTRIBUTES:
        check.equal(restored.count(current), 1, 'One explicit cache update for a changed pilot asset')
        restored = restored.replace(current, original, 1)
    return restored


def static_contract(root, check):
    pilot = root / 'bridge/capstone/pilot'
    source = (pilot / 'index.html').read_bytes()
    document = Document(source.decode('utf-8')).root
    section = check.one(document, tag='section', attribute='aria-labelledby', value='import-title')
    check.ensure('js-only' in section.attrs.get('class', '').split() and hidden(section),
                 'CSV controls are hidden in the native no-JavaScript worksheet')
    check.one(section, tag='h3', attribute='id', value='import-title')
    file_input = check.one(section, tag='input', attribute='id', value='import-file')
    check.equal(file_input.attrs.get('type'), 'file', 'Import uses a native file control')
    check.equal(set(file_input.attrs.get('accept', '').split(',')), {'.csv', 'text/csv'},
                'The file chooser advertises CSV files')
    check.ensure('multiple' not in file_input.attrs, 'One file is reviewed at a time')
    label = check.one(section, tag='label', attribute='for', value='import-file')
    check.ensure(bool(label.text().strip()), 'The file control has a visible label')
    help_text = check.one(section, attribute='id', value='import-help')
    check.equal(file_input.attrs.get('aria-describedby'), 'import-help', 'File instructions are programmatically linked')
    check.ensure(bool(help_text.text().strip()), 'The local resume instructions exist')
    status = check.one(section, attribute='id', value='import-status')
    check.equal(status.attrs.get('role'), 'status', 'Import progress is announced as status')
    check.equal(status.attrs.get('aria-live'), 'polite', 'Import progress is a polite live region')
    error = check.one(section, attribute='id', value='import-error')
    check.equal(error.attrs.get('role'), 'alert', 'Import failure has an announced error target')
    preview = check.one(section, attribute='id', value='import-preview')
    check.ensure('hidden' in preview.attrs, 'No stale preview is displayed on initial entry')
    check.one(preview, attribute='id', value='import-summary')
    check.one(preview, tag='ul', attribute='id', value='import-warnings')
    for identifier in ('import-apply', 'import-cancel'):
        button = check.one(preview, tag='button', attribute='id', value=identifier)
        check.equal(button.attrs.get('type'), 'button', 'Preview actions cannot submit a paper form')
        check.ensure(bool(button.text().strip()), 'Preview actions have descriptive labels')
    content = section.text()
    for phrase in ('sunucuya gönderilmez', 'kayıtları değiştirmez', 'sekiz kayıt ve oturum notu', 'önce indir'):
        check.ensure(phrase in content, 'The preview states its local and explicit replacement behavior: ' + phrase)
    scripts = [node.attrs.get('src') for node in document.walk() if node.tag == 'script']
    check.equal(scripts, ['../model.js', 'model.js', 'csv.js', 'app.js?v=csv-resume-1'], 'CSV loads after both models and before the updated app')
    for node in document.walk():
        if node.tag == 'script':
            check.ensure('defer' in node.attrs, 'All enhancement scripts are deferred')
    return source, {'new_import_ids': ['import-file', 'import-status', 'import-error', 'import-preview',
                                      'import-summary', 'import-warnings', 'import-apply', 'import-cancel'],
                    'no_js_import_controls_hidden': True}


def csv_contract(root, check):
    script = ('const model=require(process.argv[1]),csv=require(process.argv[2]);'
              'const records=model.IDS.map(id=>model.createRecord(id));'
              'const legacy=model.toCSV(records),current=csv.toCSV(records,{conclusion:""});'
              'process.stdout.write(JSON.stringify({maxBytes:csv.MAX_BYTES,legacy,current,'
              'oldParsed:csv.parse(legacy),newParsed:csv.parse(current)}));')
    process = subprocess.run(['node', '-e', script, str(root / 'bridge/capstone/pilot/model.js'),
                              str(root / 'bridge/capstone/pilot/csv.js')],
                             check=True, capture_output=True, text=True)
    data = json.loads(process.stdout)
    old = list(csv.reader(io.StringIO(data['legacy'], newline='')))
    new = list(csv.reader(io.StringIO(data['current'], newline='')))
    check.equal(data['maxBytes'], 1048576, 'CSV resume has the agreed one-megabyte input limit')
    check.equal(len(old), 9, 'The unchanged legacy template has a header and eight slots')
    check.equal(len(old[0]), 36, 'The old model still exports exactly 36 columns')
    check.equal(len(new), 9, 'The new template keeps a header and eight slots')
    check.equal(len(new[0]), 37, 'The new template adds exactly one format column')
    check.equal(new[0][:-1], old[0], 'All original 36 column labels are unchanged and ordered')
    check.equal(new[0][-1], 'Dosya biçimi', 'The version column is clearly named')
    check.equal([row[0] for row in new[1:]], PARTICIPANTS, 'The new template retains P01–P08')
    for row in new[1:]:
        check.equal(len(row), 37, 'Every new row has the complete versioned schema')
        check.equal(row[-1], 'AA-PILOT-2', 'Every row carries its reversible escaping version')
        check.equal(row[1], 'Boş', 'Unused slots remain explicitly blank')
        check.ensure(all(cell == '' for cell in row[2:-1]), 'The new format does not invent zero scores')
    for key, format_name in (('oldParsed', 'legacy'), ('newParsed', 'v2')):
        parsed = data[key]
        check.equal(parsed['format'], format_name, 'Import correctly identifies the file format')
        check.equal([record['id'] for record in parsed['records']], PARTICIPANTS,
                    'The imported blank slots retain canonical identities')
        check.equal(parsed['conclusion'], '', 'A blank session conclusion remains blank')
        check.equal(parsed['summary']['activeCount'], 0, 'Blank files create no participants')
        for metric in ('teacher', 'choice', 'self'):
            check.equal(parsed['summary']['totals'][metric],
                        {'n': 0, 'preMean': None, 'postMean': None, 'deltaMean': None},
                        'CSV resume retains missing-data semantics for ' + metric)
    check.ensure(len(data['oldParsed']['warnings']) >= 1, 'The old apostrophe format is accompanied by an ambiguity notice')
    check.equal(data['newParsed']['warnings'], [], 'An untouched v2 file needs no repair warning')
    return {'legacy_columns': 36, 'current_columns': 37, 'format_column': 'Dosya biçimi',
            'format_value': 'AA-PILOT-2', 'legacy_and_v2_blank_imports_preserve_missing_values': True}


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    check = Verification()
    report = {'scope': 'Additive CSV-resume UI/schema and byte preservation; parser and browser runtime tests are separate.',
              'started_at_utc': datetime.now(timezone.utc).isoformat()}
    try:
        legacy = verify_pilot(root)
        check.ensure(legacy['status'] == 'passed', 'The full original pilot contract still passes: ' + str(legacy.get('error', '')))
        report.update({'original_pilot_assertions': legacy['assertions'],
                       'retained_rubric_strings': legacy.get('teacher_rubric_strings'),
                       'retained_print_mirrors': legacy.get('print_mirrors'),
                       'unchanged_week_files': legacy.get('unchanged_week_files')})
        source, details = static_contract(root, check)
        report.update(details)
        original = committed('bridge/capstone/pilot/index.html', baseline)
        restored = remove_addition(source, check)
        check.ensure(restored == original, 'Original pilot HTML after only the CSV addition and two asset cache URLs is byte-identical '
                     f'(actual {len(restored)} bytes, expected {len(original)} bytes)')
        for relative in ('bridge/capstone/index.html', 'bridge/capstone/app.js', 'bridge/capstone/model.js',
                         'bridge/capstone/style.css', 'bridge/capstone/pilot/model.js'):
            check.ensure((root / relative).read_bytes() == committed(relative, baseline),
                         'Existing capstone/assessment model is byte-identical: ' + relative)
        check.ensure((root / 'README.md').read_bytes().startswith(committed('README.md', baseline)),
                     'CSV-resume documentation appends to the previous README')
        report.update(csv_contract(root, check))
        report.update({'status': 'passed', 'baseline': baseline, 'old_pilot_html_outside_addition_unchanged': True,
                       'cache_url_whitelist': ['style.css?v=csv-resume-1', 'app.js?v=csv-resume-1'],
                       'old_capstone_and_pilot_models_unchanged': True, 'readme_append_only': True})
    except (AssertionError, OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError) as error:
        report.update({'status': 'failed', 'error': str(error)})
    report['assertions'] = check.assertions
    report['completed_at_utc'] = datetime.now(timezone.utc).isoformat()
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='AA tree to inspect (default: this repository).')
    parser.add_argument('--baseline', default=BASELINE, help='Reviewed pilot-kit commit whose existing content must remain.')
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
