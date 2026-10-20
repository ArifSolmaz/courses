#!/usr/bin/env python3
"""Check the current course build in disposable copies, never published routes.

The dashboard and all 14 main pages must reproduce byte for byte. Sources,
authored notes, card banks and assets must remain untouched. Two builds of the
same copy and an independent fresh copy must agree on the complete AA tree.
Every other generated output must also match; drift is reported separately so
it cannot hide inside a successful main-page check.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
MAIN_PAGES = ['index.html'] + [f'w{n}/index.html' for n in range(1, 15)]


def snapshot(root):
    """Return content hashes, excluding Python's disposable import caches."""
    return {
        p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted(root.rglob('*'))
        if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc'
    }


def generated(path):
    """Explicit generated outputs; everything else is protected author input."""
    p = Path(path)
    return (
        path in MAIN_PAGES
        or path in ('COURSE_GUIDE.md', 'scope/index.html', 'review/index.html',
                    'textbook-problems/index.html', 'extensions/index.html',
                    'engineering/index.html', 'skiena/index.html')
        or (p.name == 'index.html' and (
            path.startswith(('guide/', 'python/'))
            or '/ek-notlar/' in path
        ))
    )


def build_in_copy(parent, name):
    destination = parent / name / 'aa'
    shutil.copytree(ROOT, destination, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    process = subprocess.run(
        [sys.executable, 'aa/tools/build.py'], cwd=destination.parent,
        capture_output=True, text=True,
    )
    if process.returncode:
        raise AssertionError(f'{name}: build failed\n{process.stdout}\n{process.stderr}')
    verify_redirects(destination)
    return destination, snapshot(destination)


def verify_redirects(root):
    process = subprocess.run(
        [sys.executable, str(root / 'tools/verify_redirects.py'), '--root', str(root)],
        capture_output=True, text=True,
    )
    if process.returncode:
        raise AssertionError(f'redirect verification failed\n{process.stdout}\n{process.stderr}')


def verify():
    before = snapshot(ROOT)
    protected = {p: digest for p, digest in before.items() if not generated(p)}
    note_paths = [p for p in protected if p.endswith('/lecture-notes.html') or '/teknik-notlar/' in p]
    question_paths = [p for p in protected if (
        p.startswith('tools/') or p.endswith('/cards.js')
    )]
    with tempfile.TemporaryDirectory(prefix='final-aa-rebuild-', dir=REPO.parent) as temporary:
        parent = Path(temporary)
        first, built = build_in_copy(parent, 'first')
        main_drift = [p for p in MAIN_PAGES if built.get(p) != before.get(p)]
        protected_paths = {p for p in set(before) | set(built) if not generated(p)}
        protected_drift = sorted(p for p in protected_paths
                                 if built.get(p) != before.get(p))
        unexpected_protected = sorted(protected_paths - set(before))
        other_drift = sorted(p for p in set(before) | set(built)
                             if generated(p) and p not in MAIN_PAGES
                             and built.get(p) != before.get(p))
        second_run = subprocess.run(
            [sys.executable, 'aa/tools/build.py'], cwd=first.parent,
            capture_output=True, text=True,
        )
        if second_run.returncode:
            raise AssertionError(f'repeat: build failed\n{second_run.stdout}\n{second_run.stderr}')
        verify_redirects(first)
        repeated = snapshot(first)
        _, independent = build_in_copy(parent, 'independent')
        idempotent = repeated == built
        independent_match = independent == built
    source_unchanged = snapshot(ROOT) == before
    result = {
        'main_pages': len(MAIN_PAGES),
        'main_pages_match': not main_drift,
        'main_page_drift': main_drift,
        'protected_files': len(protected),
        'protected_source_and_assets_unchanged': not protected_drift,
        'protected_drift': protected_drift,
        'unexpected_protected_outputs': unexpected_protected,
        'authored_note_files': len(note_paths),
        'authored_notes_unchanged': all(before[p] == built.get(p) for p in note_paths),
        'question_and_author_source_files': len(question_paths),
        'questions_and_card_banks_unchanged': all(before[p] == built.get(p) for p in question_paths),
        'repeat_build_idempotent': idempotent,
        'independent_fresh_build_matches': independent_match,
        'redirects_verified_for_each_build': True,
        'original_tree_unchanged': source_unchanged,
        'other_generated_drift_count': len(other_drift),
        'other_generated_drift': other_drift,
    }
    result['status'] = 'passed' if all((
        not main_drift, not other_drift, not protected_drift,
        idempotent, independent_match, source_unchanged,
    )) else 'failed'
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path, help='Optional JSON report outside the disposable build copies.')
    args = parser.parse_args()
    report = verify()
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report['status'] == 'passed' else 1)
