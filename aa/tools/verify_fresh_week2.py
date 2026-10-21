#!/usr/bin/env python3
"""Read-only structural and exact-scope checks for the fresh second lesson.

The earlier lesson is checked only as preserved archive material. It is not
the authoring source for the new main route. Run the separate model, browser
and disposable-copy rebuild checks for numerical and interaction validation.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import hashlib
import json
import re

from verify_fresh_week1 import Page, baseline_files, blob_hash, git


ROOT = Path(__file__).resolve().parents[1]
BASELINE = 'b5248a58653bd1107c06470fec261edac5d7e652'
W2_ALIASES = {
    'aa/guide/w02/index.html',
    'aa/python/w5/index.html',
    'aa/python/w6/index.html',
    'aa/python/w8/index.html',
    'aa/python/guide/w05/index.html',
    'aa/python/guide/w06/index.html',
    'aa/python/guide/w08/index.html',
    'aa/skiena/index.html',
}
# This explicit set is also used by the older W1 verifier. Every permitted
# successor change is checked here against the immediate pre-W2 publication.
SUCCESSOR_EXISTING_CHANGES = {
    'aa/README.md',
    'aa/tools/lessons/w1.html',
    'aa/w1/index.html',
    'aa/w2/index.html',
    'aa/review/index.html',
    'aa/w4/recap/cards.js',
    'aa/tools/verify_fresh_week1.py',
    'aa/tools/verify_learning_bridges.py',
    'aa/tools/verify_redirects.py',
} | W2_ALIASES
NEXT_LINK = ('\n<!-- AA:FRESH-W2:NEXT:START -->'
             '<p class="next-lesson"><a href="../w2/" '
             'style="display:inline-flex;align-items:center;min-height:44px">'
             'Hafta 2’ye geç: yaptığımız işi say →</a></p>'
             '<!-- AA:FRESH-W2:NEXT:END -->')


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo = root.parent
    source = root / 'tools/lessons/w2.html'
    main = root / 'w2/index.html'
    archive = root / 'w2/ek-notlar/index.html'
    checks = []

    def check(condition, label):
        assert condition, label
        checks.append(label)

    check(source.is_file(), 'an independently authored W2 source exists')
    check(main.read_bytes() == source.read_bytes(),
          'the published-route candidate exactly reproduces its authored source')
    raw = source.read_text(encoding='utf-8')
    page = Page(raw)
    check(len(page.ids) == len(set(page.ids)), 'all fresh W2 IDs are unique')
    check(sum(tag == 'h1' for tag, _ in page.tags) == 1, 'one lesson title')
    check(sum(tag == 'main' for tag, _ in page.tags) == 1, 'one main learning surface')
    check(any(tag == 'html' and attrs.get('lang') == 'tr' for tag, attrs in page.tags),
          'Turkish document language')
    check(any(tag == 'meta' and attrs.get('name') == 'viewport'
              and 'device-width' in attrs.get('content', '') for tag, attrs in page.tags),
          'responsive viewport')
    check(page.scripts == ['model.js?v=1', 'lesson.js?v=1'],
          'only the two fresh W2 local scripts are loaded')
    check(page.stylesheets == ['../w1/lesson.css?v=1', 'lesson.css?v=1'],
          'W1 visual grammar plus the small W2 extension are used')
    check(not page.events, 'no executable inline event attributes')
    check(not any(marker in raw for marker in (
        'AA:LEARNING-BRIDGE', 'learning-bridges.js', 'learning-bridges.css',
        'aa-legacy-responsive-audit', 'aa-legacy-table-audit',
        'data-week-tab=', 'class="worked-example"',
    )), 'no legacy lesson or bridge layer is injected into the fresh main')
    check({'unit', 'function', 'sequential', 'nested', 'guided', 'practice',
           'next-question', 'teacher-note'} <= set(page.ids),
          'the complete fresh learning sequence is present')
    check({'bridge-path', 'learning-bridge-w2', 'lb-w2-transfer'} <= set(page.ids),
          'earlier navigation entry anchors remain valid')

    references = []
    for tag, attribute, value in page.references:
        parsed = urlsplit(value)
        check(not parsed.scheme and not parsed.netloc and not value.startswith('//'),
              f'local safe reference: {value}')
        check('\\' not in value and parsed.query in ('', 'v=1'),
              f'plain portable URL: {value}')
        target = (main.parent / unquote(parsed.path)).resolve() if parsed.path else main
        check(target.is_relative_to(repo), f'reference remains inside the site: {value}')
        if target.is_dir():
            target /= 'index.html'
        check(target.is_file(), f'reference exists: {value}')
        if parsed.fragment and target.suffix == '.html':
            other = page if target == main else Page(target.read_text(encoding='utf-8'))
            check(unquote(parsed.fragment) in other.ids, f'fragment exists: {value}')
        references.append(value)

    old_raw = git(repo, 'show', f'{baseline}:aa/w2/index.html').decode('utf-8')
    archived_raw = archive.read_text(encoding='utf-8')
    banner = ('<p class="ek-banner" style="margin:0 0 1rem;padding:.6rem 1rem;'
              'border:1px solid var(--line,#888);border-radius:10px">'
              'Arşiv: Hafta 2 önceki ders sayfası. '
              '<a href="../">← Yeni ders sayfasına dön</a></p>')
    expected_archive = old_raw.replace('href="../', 'href="../../').replace('src="../', 'src="../../')
    expected_archive = expected_archive.replace('<header class="week-heading">',
                                              banner + '<header class="week-heading">', 1)
    check(archived_raw == expected_archive,
          'the complete earlier W2 bytes are preserved with only relocation and an archive label')
    old_page = Page(old_raw)
    archived_without_banner = archived_raw.replace(banner, '', 1)
    archived_page = Page(archived_without_banner)
    check(archived_page.ids == old_page.ids, 'all earlier W2 anchors are preserved in order')
    check(''.join(archived_page.text) == ''.join(old_page.text),
          'all earlier W2 text, code and styles are preserved')
    check({'lesson', 'practice', 'notes'} <= set(archived_page.ids),
          'all three historical W2 lesson panels remain available')

    # The approved first lesson gains exactly one explicitly marked onward link.
    for relative in ('aa/tools/lessons/w1.html', 'aa/w1/index.html'):
        before = git(repo, 'show', f'{baseline}:{relative}')
        after = (repo / relative).read_bytes()
        addition = NEXT_LINK.encode('utf-8')
        check(after.count(addition) == 1, f'exactly one marked W2 onward link: {relative}')
        check(after.replace(addition, b'', 1) == before,
              f'W1 differs only by that onward link: {relative}')

    review = root / 'review/index.html'
    old_review = git(repo, 'show', f'{baseline}:aa/review/index.html')
    check(review.read_bytes() == old_review.replace(b'href="../w2/#', b'href="../w2/ek-notlar/#'),
          'historical review differs only in relocated W2 reference URLs')
    cards = root / 'w4/recap/cards.js'
    old_cards = git(repo, 'show', f'{baseline}:aa/w4/recap/cards.js')
    check(old_cards.count(b'"ref": "../w2/#') == 3,
          'the historical W4 card-bank W2 reference inventory contains exactly three links')
    check(cards.read_bytes() == old_cards.replace(b'"ref": "../w2/#',
                                                 b'"ref": "../w2/ek-notlar/#'),
          'W4 card-bank questions, answers and data differ only in three W2 reference URLs')
    for value in re.findall(r'"ref": "(\.\./w2/ek-notlar/#[^"]+)"', cards.read_text()):
        parsed = urlsplit(value)
        check(unquote(parsed.fragment) in archived_page.ids,
              f'historical W4 reference reaches the preserved W2 material: {value}')

    from verify_redirects import verify as verify_redirects
    redirects = verify_redirects(root)
    w2_routes = [item for item in redirects['results'] if item['target'].startswith('w2/')]
    check({f'aa/{item["alias"]}' for item in w2_routes} == W2_ALIASES,
          'all eight historical W2 aliases have been accounted for')
    check(all(item['target'] == 'w2/ek-notlar/index.html' and item['fragment'] == 'notes'
              for item in w2_routes), 'all eight W2 aliases reach the complete archived Notes')
    for relative in sorted(W2_ALIASES):
        before = git(repo, 'show', f'{baseline}:{relative}')
        after = (repo / relative).read_bytes()
        check(after == before.replace(b'w2/index.html#notes', b'w2/ek-notlar/index.html#notes'),
              f'historical alias differs only in the preserved W2 destination: {relative}')

    old_readme = git(repo, 'show', f'{baseline}:aa/README.md')
    check((root / 'README.md').read_bytes().startswith(old_readme),
          'all existing course README text is preserved before the new documentation')
    tracked = baseline_files(repo, baseline)
    protected = {path: digest for path, digest in tracked.items()
                 if path not in SUCCESSOR_EXISTING_CHANGES}
    drift = [path for path, digest in protected.items()
             if not (repo / path).is_file() or blob_hash((repo / path).read_bytes()) != digest]
    check(not drift, f'all {len(protected)} other existing AA files are byte-preserved: {drift}')

    entry_links = []
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
                  f'existing W2 entry fragment remains valid: {relative.as_posix()} → {value}')
            entry_links.append([relative.as_posix(), value])

    return {
        'status': 'passed', 'baseline': baseline, 'checks': len(checks),
        'canonical_bytes': len(source.read_bytes()),
        'canonical_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'main_is_exact_authored_copy': True,
        'old_lesson_bytes_text_and_anchors_preserved': True,
        'old_lesson_anchors': len(old_page.ids),
        'protected_existing_files': len(protected), 'protected_drift': drift,
        'other_week_main_pages_unchanged': 12,
        'week1_change_is_only_one_onward_link': True,
        'historical_week2_redirects': len(w2_routes),
        'historical_week4_reference_urls_relocated': 3,
        'legacy_redirects_checked': redirects['aliases'],
        'new_lesson_references_checked': references,
        'existing_week2_entry_fragments_checked': entry_links,
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
