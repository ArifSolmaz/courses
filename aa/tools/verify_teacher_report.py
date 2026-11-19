#!/usr/bin/env python3
"""Read-only teacher-report checks for additive UI, offline HTML, and retention.

The numerical report model and browser invalidation workflow have separate
tests. This verifier retains every earlier pilot/CSV check and verifies only
the explicitly marked report addition and its two asset cache URLs.
"""
from datetime import datetime, timezone
from pathlib import Path
import argparse
import json
import subprocess

from verify_capstone import Document, Verification, hidden
from verify_pilot import ROOT, PARTICIPANTS
from verify_pilot_resume import (committed, remove_teacher_report_addition,
                                 verify as verify_csv_resume)


BASELINE = '6d45e702ca65b42af4c98d7c04887168bc62d0f0'


def static_contract(root, check):
    source = (root / 'bridge/capstone/pilot/index.html').read_bytes()
    document = Document(source.decode('utf-8')).root
    section = check.one(document, tag='section', attribute='id', value='teacher-report-section')
    check.ensure('js-only' in section.attrs.get('class', '').split() and hidden(section),
                 'Native paper use does not expose inactive report controls')
    check.equal(section.attrs.get('aria-labelledby'), 'teacher-report-title', 'Report section has a named heading')
    check.one(section, tag='h3', attribute='id', value='teacher-report-title')
    make = check.one(section, tag='button', attribute='id', value='make-teacher-report')
    download = check.one(section, tag='button', attribute='id', value='download-teacher-report')
    for button in (make, download):
        check.equal(button.attrs.get('type'), 'button', 'Report actions cannot submit a paper form')
        check.ensure(bool(button.text().strip()), 'Report actions have descriptive labels')
    check.ensure('disabled' not in make.attrs, 'The prepare control is available for progressive enhancement to manage')
    check.ensure('disabled' in download.attrs, 'A report cannot download before it has been prepared')
    status = check.one(section, attribute='id', value='teacher-report-status')
    check.equal(status.attrs.get('role'), 'status', 'Report feedback is a status region')
    check.equal(status.attrs.get('aria-live'), 'polite', 'Report feedback is politely announced')
    preview = check.one(section, attribute='id', value='teacher-report-preview')
    check.ensure('hidden' in preview.attrs, 'Initial entry has no stale report preview')
    text = check.one(preview, tag='pre', attribute='id', value='teacher-report-text')
    check.equal(text.attrs.get('tabindex'), '0', 'The report text scroll area can receive keyboard focus')
    check.ensure(bool(text.attrs.get('aria-label')), 'The report text area has an accessible name')
    check.equal(text.text(), '', 'No stale report is authored into the initial preview')
    for phrase in ('güncel kayıtları kullanır', 'önizlemesi rapora girmez', 'çevrimdışı', 'raporu yeniden hazırla'):
        check.ensure(phrase in section.text(), 'The UI states the report snapshot contract: ' + phrase)
    scripts = [node.attrs.get('src') for node in document.walk() if node.tag == 'script']
    check.equal(scripts, ['../model.js', 'model.js', 'csv.js', 'report.js', 'app.js?v=teacher-report-1'],
                'The report module loads after assessment/CSV models and before the current app')
    check.one(document, tag='script', attribute='src', value='report.js')
    return source, {'report_control_ids': ['teacher-report-section', 'make-teacher-report', 'download-teacher-report',
                                          'teacher-report-status', 'teacher-report-preview', 'teacher-report-text'],
                    'no_js_report_controls_hidden': True, 'initial_download_disabled': True}


def model_contract(root, check):
    marker = 'Karar <img src=x onerror=alert(1)> & "alıntı"\nİkinci satır.'
    generated_at = '2026-10-20T00:00:00.000Z'
    script = ('const M=require(process.argv[1]),R=require(process.argv[2]);'
              'const records=M.IDS.map(id=>M.createRecord(id));'
              'const options={conclusion:process.argv[3],generatedAt:process.argv[4]};'
              'const report=R.build(records,options),again=R.build(records,options);'
              'process.stdout.write(JSON.stringify({report,again,expected:M.summarize(records),dimensions:M.DIMENSIONS}));')
    process = subprocess.run(['node', '-e', script, str(root / 'bridge/capstone/pilot/model.js'),
                              str(root / 'bridge/capstone/pilot/report.js'), marker, generated_at],
                             check=True, capture_output=True, text=True)
    data = json.loads(process.stdout)
    report = data['report']
    check.equal(report, data['again'], 'The same snapshot and supplied timestamp produce identical report artifacts')
    check.equal(report['summary'], data['expected'], 'Report statistics come from the unchanged assessment model')
    check.equal(report['summary']['activeCount'], 0, 'Blank participant slots are not pilot participants')
    for kind in ('teacher', 'choice', 'self'):
        check.equal(report['summary']['totals'][kind],
                    {'n': 0, 'preMean': None, 'postMean': None, 'deltaMean': None},
                    'Blank report keeps missing values distinct from zero for ' + kind)
    for key in ('text', 'html'):
        check.ensure(isinstance(report[key], str) and bool(report[key]), 'Report includes a nonempty ' + key + ' artifact')
    check.ensure(marker in report['text'], 'The plain-text report keeps the full teacher decision literally')
    check.ensure(generated_at in report['text'], 'The supplied generation timestamp is displayed literally')
    check.ensure(report['html'].lstrip().lower().startswith('<!doctype html>'), 'Downloaded HTML is a standalone document')
    document = Document(report['html']).root
    check.equal(check.one(document, tag='html').attrs.get('lang'), 'tr', 'Downloaded report language is Turkish')
    check.one(document, tag='title')
    check.one(document, tag='h1')
    check.ensure(marker in document.text(), 'The HTML report preserves the full decision as readable escaped text')
    check.ensure(generated_at in document.text(), 'The HTML report contains the supplied timestamp')
    for dimension in data['dimensions']:
        check.ensure(dimension['title'] in report['text'] and dimension['title'] in document.text(),
                     'Both artifacts retain the named dimension: ' + dimension['id'])
    for participant in PARTICIPANTS:
        check.ensure(participant in report['text'] and participant in document.text(),
                     'Both artifacts retain the participant slot: ' + participant)
    for node in document.walk():
        check.ensure(node.tag not in ('script', 'iframe', 'object', 'embed', 'img', 'link'),
                     'The downloaded report contains no executable or external embedded dependencies')
        check.ensure(not any(name.lower().startswith('on') for name in node.attrs), 'No inline event handlers enter the report')
        check.ensure('src' not in node.attrs, 'Offline report content needs no remote source')
        if node.tag == 'style':
            check.ensure('@import' not in node.text().lower() and 'url(' not in node.text().lower(),
                         'Offline report styles need no external resources')
        if node.tag == 'th':
            check.ensure(node.attrs.get('scope') in ('col', 'row', 'rowgroup', 'colgroup'),
                         'Downloaded report headers declare their scope')
    return {'downloaded_html_standalone': True, 'downloaded_html_uses_no_external_dependencies': True,
            'literal_teacher_text_preserved_and_escaped': True, 'blank_report_does_not_invent_zero_scores': True}


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    check = Verification()
    report = {'scope': 'Teacher-report UI/offline artifact and exact source retention; numerical and browser state tests are separate.',
              'started_at_utc': datetime.now(timezone.utc).isoformat()}
    try:
        earlier = verify_csv_resume(root)
        check.ensure(earlier['status'] == 'passed', 'All earlier CSV/pilot checks still pass: ' + str(earlier.get('error', '')))
        report.update({'retained_csv_assertions': earlier['assertions'],
                       'retained_pilot_assertions': earlier.get('original_pilot_assertions'),
                       'retained_rubric_strings': earlier.get('retained_rubric_strings'),
                       'retained_print_mirrors': earlier.get('retained_print_mirrors'),
                       'unchanged_week_files': earlier.get('unchanged_week_files')})
        source, details = static_contract(root, check)
        report.update(details)
        restored = remove_teacher_report_addition(source, check)
        original = committed('bridge/capstone/pilot/index.html', baseline)
        check.ensure(restored == original, 'Original pilot HTML outside the report panel/script and cache URLs is byte-identical '
                     f'(actual {len(restored)} bytes, expected {len(original)} bytes)')
        for relative in ('bridge/capstone/index.html', 'bridge/capstone/app.js', 'bridge/capstone/model.js',
                         'bridge/capstone/style.css', 'bridge/capstone/pilot/model.js', 'bridge/capstone/pilot/csv.js'):
            check.ensure((root / relative).read_bytes() == committed(relative, baseline),
                         'Existing lesson/model/CSV source is byte-identical: ' + relative)
        for relative in ('README.md', 'bridge/capstone/pilot/style.css'):
            check.ensure((root / relative).read_bytes().startswith(committed(relative, baseline)),
                         'Teacher-report additions append to existing source: ' + relative)
        report.update(model_contract(root, check))
        report.update({'status': 'passed', 'baseline': baseline, 'original_pilot_html_preserved': True,
                       'old_models_csv_and_capstone_unchanged': True,
                       'cache_url_whitelist': ['style.css?v=teacher-report-1', 'app.js?v=teacher-report-1']})
    except (AssertionError, OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError) as error:
        report.update({'status': 'failed', 'error': str(error)})
    report['assertions'] = check.assertions
    report['completed_at_utc'] = datetime.now(timezone.utc).isoformat()
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='AA tree to inspect (default: this repository).')
    parser.add_argument('--baseline', default=BASELINE, help='Reviewed CSV-resume commit whose existing content must remain.')
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
