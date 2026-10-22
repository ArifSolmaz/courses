#!/usr/bin/env python3
"""Read-only checks for the independently authored first-week lesson.

The fresh lesson is not a new skin for the earlier generated notes. Its main
route must reproduce the authored HTML byte for byte; the complete earlier
lesson remains at a separate archive address. Existing AA content outside this
explicit replacement and its old-link routing is compared with the reviewed
baseline. Run the course rebuild checker separately for disposable-copy builds.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import hashlib
import json
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
BASELINE = 'acb217da0836cf447c10df2c2c6797a89b56266b'
ALLOWED_EXISTING_CHANGES = {
    'aa/README.md',
    'aa/w1/index.html',
    'aa/review/index.html',
    'aa/guide/w01/index.html',
    'aa/python/w1/index.html',
    'aa/python/w2/index.html',
    'aa/python/guide/w01/index.html',
    'aa/python/guide/w02/index.html',
    'aa/tools/aligned/build.py',
    'aa/tools/aligned/compact.py',
    'aa/tools/verify_alignment.py',
    'aa/tools/verify_redirects.py',
    'aa/tools/verify_learning_bridges.py',
    'aa/w13/ek-notlar/index.html',
}


class Page(HTMLParser):
    """Small structural reader; content is never evaluated or rendered."""

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.ids, self.references = [], []
        self.scripts, self.stylesheets, self.tags = [], [], []
        self.text, self.events = [], []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for name, value in attrs.items():
            if name.startswith('on'):
                self.events.append((tag, name, value))
            if name in ('href', 'src'):
                self.references.append((tag, name, value))
        if tag == 'script':
            self.scripts.append(attrs.get('src'))
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.stylesheets.append(attrs.get('href'))

    def handle_data(self, data):
        self.text.append(data)


def git(repo, *args):
    process = subprocess.run(
        ['git', *args], cwd=repo, check=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    return process.stdout


def blob_hash(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def baseline_files(repo, baseline):
    records = git(repo, 'ls-tree', '-rz', baseline, '--', 'aa').split(b'\0')
    files = {}
    for record in records:
        if not record:
            continue
        metadata, name = record.split(b'\t', 1)
        mode, kind, object_name = metadata.decode().split()
        if kind == 'blob':
            files[name.decode()] = object_name
    return files


def verify(root, baseline):
    root = root.resolve()
    repo = root.parent
    source = root / 'tools/lessons/w1.html'
    main = root / 'w1/index.html'
    archive = root / 'w1/ek-notlar/index.html'
    assert source.is_file(), 'The independently authored source is missing.'
    assert source.read_bytes() == main.read_bytes(), 'Main differs from its canonical authored lesson.'
    raw = main.read_text(encoding='utf-8')
    page = Page(raw)
    checks = []

    def check(condition, label):
        assert condition, label
        checks.append(label)

    check(len(page.ids) == len(set(page.ids)), 'all authored IDs are unique')
    check(sum(tag == 'h1' for tag, _ in page.tags) == 1, 'one lesson title')
    check(sum(tag == 'main' for tag, _ in page.tags) == 1, 'one main learning surface')
    check(any(tag == 'html' and attrs.get('lang') == 'tr' for tag, attrs in page.tags),
          'Turkish document language')
    check(any(tag == 'meta' and attrs.get('name') == 'viewport'
              and 'device-width' in attrs.get('content', '') for tag, attrs in page.tags),
          'responsive viewport')
    check(page.scripts == ['model.js?v=1', 'lesson.js?v=1'], 'only the two new local lesson scripts')
    check(page.stylesheets == ['lesson.css?v=1'], 'only the new local lesson stylesheet')
    check(not page.events, 'no executable inline event attributes')
    check(not any(marker in raw for marker in (
        'AA:LEARNING-BRIDGE', 'learning-bridges.js', 'learning-bridges.css',
        'aa-legacy-responsive-audit', 'aa-legacy-table-audit',
        'data-week-tab=', 'class="worked-example"',
    )), 'no legacy lesson or bridge layer is injected into the fresh main')
    required_sections = {'problem', 'trace', 'meaning', 'guided', 'boundaries',
                         'practice', 'next-question', 'teacher-note'}
    check(required_sections <= set(page.ids), 'the complete new lesson sequence is present')
    check({'bridge-path', 'learning-bridge-w1'} <= set(page.ids),
          'existing entry links still reach the new lesson')

    checked_references = []
    for tag, attribute, value in page.references:
        parsed = urlsplit(value)
        check(not parsed.scheme and not parsed.netloc and not value.startswith('//'),
              f'local safe reference: {value}')
        check('\\' not in value and parsed.query in ('', 'v=1'), f'plain portable URL: {value}')
        target = (main.parent / unquote(parsed.path)).resolve() if parsed.path else main
        check(target.is_relative_to(repo), f'reference remains inside the course site: {value}')
        if target.is_dir():
            target /= 'index.html'
        check(target.is_file(), f'reference exists: {value}')
        if parsed.fragment and target.suffix == '.html':
            target_page = page if target == main else Page(target.read_text(encoding='utf-8'))
            check(unquote(parsed.fragment) in target_page.ids, f'fragment exists: {value}')
        checked_references.append(value)

    # Preservation concerns the entire earlier content, not only headline counts.
    old = git(repo, 'show', f'{baseline}:aa/w1/index.html').decode('utf-8')
    archived_raw = archive.read_text(encoding='utf-8')
    check('Arşiv: Hafta 1 önceki ders sayfası.' in archived_raw, 'archive is clearly labelled')
    archived_without_banner = re.sub(
        r'<p class="ek-banner"[^>]*>.*?</p>', '', archived_raw, count=1, flags=re.S,
    )
    archived_page = Page(archived_without_banner)
    old_page = Page(old)
    check(old_page.ids == archived_page.ids, 'all earlier lesson anchors are preserved in order')
    check(''.join(old_page.text) == ''.join(archived_page.text),
          'all earlier lesson text, code and styles are preserved')
    check('notes' in archived_page.ids and 'practice' in archived_page.ids,
          'old Notes and practice destinations remain available')

    # A later, independently reviewed lesson must prove its own exact scope
    # against the publication immediately before it. Keep the original W1
    # archive and all unmodified earlier files under their original checks.
    # The successor verifier never calls this function, so there is no
    # verification recursion or silently unverified allowlist.
    successor = None
    allowed_changes = set(ALLOWED_EXISTING_CHANGES)
    if (root / 'tools/lessons/w2.html').is_file():
        from verify_fresh_week2 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w3.html').is_file():
        from verify_fresh_week3 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w4.html').is_file():
        from verify_fresh_week4 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w5.html').is_file():
        from verify_fresh_week5 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w6.html').is_file():
        from verify_fresh_week6 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w7.html').is_file():
        from verify_fresh_week7 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w8.html').is_file():
        from verify_fresh_week8 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w9.html').is_file():
        from verify_fresh_week9 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w10.html').is_file():
        from verify_fresh_week10 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)
    if (root / 'tools/lessons/w11.html').is_file():
        from verify_fresh_week11 import SUCCESSOR_EXISTING_CHANGES
        allowed_changes.update(SUCCESSOR_EXISTING_CHANGES)

    tracked = baseline_files(repo, baseline)
    protected = {path: digest for path, digest in tracked.items()
                 if path not in allowed_changes}
    drift = []
    for path, digest in protected.items():
        target = repo / path
        if not target.is_file() or blob_hash(target.read_bytes()) != digest:
            drift.append(path)
    check(not drift, f'all {len(protected)} protected existing AA files are unchanged: {drift}')
    old_w13 = git(repo, 'show', f'{baseline}:aa/w13/ek-notlar/index.html')
    expected_w13 = old_w13.replace(b'href="../../w1/#', b'href="../../w1/ek-notlar/#')
    check((root / 'w13/ek-notlar/index.html').read_bytes() == expected_w13,
          'Week 13 archived notes differ only in the preserved Week 1 reference URL')
    old_readme = git(repo, 'show', f'{baseline}:aa/README.md')
    check((root / 'README.md').read_bytes().startswith(old_readme),
          'existing course README text is preserved before the new documentation')

    # Existing dashboard/bridge/weekly links must still reach a real anchor on
    # the fresh main, rather than merely preserving their now-invalid bytes.
    existing_entry_links = []
    for path in sorted(root.rglob('*.html')):
        relative = path.relative_to(root)
        if relative.parts[0] in ('tools', 'archive'):
            continue
        for tag, attribute, value in Page(path.read_text(encoding='utf-8')).references:
            if tag != 'a' or attribute != 'href':
                continue
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc or not parsed.fragment:
                continue
            target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            if target.is_dir():
                target /= 'index.html'
            if target != main:
                continue
            check(unquote(parsed.fragment) in page.ids,
                  f'existing entry fragment remains valid: {relative.as_posix()} → {value}')
            existing_entry_links.append([relative.as_posix(), value])

    # The five aliases that used to lead to the old W1 Notes now lead to its archive.
    from verify_redirects import verify as verify_redirects
    redirects = verify_redirects(root)
    w1_aliases = [item for item in redirects['results'] if item['target'].startswith('w1/')]
    check(len(w1_aliases) == 5 and all(item['target'] == 'w1/ek-notlar/index.html'
                                     and item['fragment'] == 'notes' for item in w1_aliases),
          'all five legacy Week 1 aliases reach the complete archived Notes')
    review = (root / 'review/index.html').read_text(encoding='utf-8')
    check('href="../w1/#example-' not in review
          and 'href="../w1/#practice"' not in review
          and 'href="../w1/#skiena-' not in review,
          'historical review exercise links do not target the new lesson')
    check('href="../w1/ek-notlar/#example-1-1"' in review
          and 'href="../w1/ek-notlar/#practice"' in review,
          'historical review exercise links reach the archived lesson')

    if (root / 'tools/lessons/w2.html').is_file():
        from verify_fresh_week2 import verify as verify_fresh_week2
        successor = verify_fresh_week2(root)
        check(successor['status'] == 'passed',
              'authorized Week 2 successor passes its own exact-scope preservation audit')

    return {
        'status': 'passed', 'baseline': baseline, 'checks': len(checks),
        'canonical_bytes': len(source.read_bytes()),
        'canonical_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'main_is_exact_authored_copy': True,
        'old_lesson_text_and_anchors_preserved': True,
        'protected_existing_files': len(protected),
        'protected_drift': drift,
        'other_weeks_files': sum(bool(re.match(r'aa/w(?:[2-9]|1[0-4])/', path))
                                for path in protected) + 1,
        'other_week_main_pages_unchanged': (3 if (root / 'tools/lessons/w11.html').is_file()
                                          else 4 if (root / 'tools/lessons/w10.html').is_file()
                                          else 5 if (root / 'tools/lessons/w9.html').is_file()
                                          else 6 if (root / 'tools/lessons/w8.html').is_file()
                                          else 7 if (root / 'tools/lessons/w7.html').is_file()
                                          else 8 if (root / 'tools/lessons/w6.html').is_file()
                                           else 9 if (root / 'tools/lessons/w5.html').is_file()
                                           else 10 if (root / 'tools/lessons/w4.html').is_file()
                                           else 11 if (root / 'tools/lessons/w3.html').is_file()
                                           else 12 if successor else 13),
        'authorized_successor_audit': successor,
        'legacy_redirects_checked': redirects['aliases'],
        'new_lesson_references_checked': checked_references,
        'all_existing_week1_entry_fragments_checked': existing_entry_links,
        'passed_checks': checks,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--baseline', default=BASELINE)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    result = verify(args.root, args.baseline)
    encoded = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(encoded, encoding='utf-8')
    print(encoded, end='')
