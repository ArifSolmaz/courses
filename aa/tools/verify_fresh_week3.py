#!/usr/bin/env python3
"""Read-only exact-scope checks for the independently authored third lesson.

The earlier authored W3 main and the separately generated full notes are
preservation fixtures, never authoring sources for the new main. Numerical,
interaction, accessibility and disposable-copy build tests run separately.
The pinned baseline is the publication immediately before the fresh W3 work.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import hashlib
import json

from verify_fresh_week1 import Page, baseline_files, blob_hash, git


ROOT = Path(__file__).resolve().parents[1]
BASELINE = 'a178a3eda5bcad2df3449c2da31538f3a1aaa5cc'
# Older W1/2 audits defer precisely these existing files to this independent
# successor audit. This function never calls either older lesson verifier.
SUCCESSOR_EXISTING_CHANGES = {
    'aa/README.md',
    'aa/tools/aligned/build.py',
    'aa/tools/lessons/w2.html',
    'aa/w2/index.html',
    'aa/w3/index.html',
    'aa/w4/recap/cards.js',
    'aa/tools/verify_fresh_week1.py',
    'aa/tools/verify_fresh_week2.py',
    'aa/tools/verify_learning_bridges.py',
    'aa/tools/verify_rebuild.py',
}
EXPECTED_NEW_FILES = {
    'aa/tools/lessons/w3.html',
    'aa/tools/verify_fresh_week3.py',
    'aa/tools/verify_fresh_week3_model.cjs',
    'aa/w3/lesson.css',
    'aa/w3/lesson.js',
    'aa/w3/model.js',
    'aa/w3/onceki-ders.html',
}
NEXT_LINK = ('\n<!-- AA:FRESH-W3:NEXT:START -->'
             '<p class="next-lesson"><a href="../w3/" '
             'style="display:inline-flex;align-items:center;min-height:44px">'
             'Hafta 3’e geç: büyümeyi karşılaştır, yöntemi seç →</a></p>'
             '<!-- AA:FRESH-W3:NEXT:END -->')
ARCHIVE_BANNER = ('<p class="previous-lesson-banner" '
                  'style="margin:1rem;padding:.75rem 1rem;border:1px solid #888;border-radius:10px">'
                  'Arşiv: Hafta 3 önceki ders sayfası. '
                  '<a href="./">← Yeni ders sayfasına dön</a></p>')


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo = root.parent
    source = root / 'tools/lessons/w3.html'
    main = root / 'w3/index.html'
    archive = root / 'w3/onceki-ders.html'
    supplemental = root / 'w3/ek-notlar/index.html'
    checks = []

    def check(condition, label):
        assert condition, label
        checks.append(label)

    check(source.is_file(), 'an independently authored W3 source exists')
    check(main.read_bytes() == source.read_bytes(),
          'the candidate main exactly reproduces the independently authored source')
    raw = source.read_text(encoding='utf-8')
    page = Page(raw)
    check(len(page.ids) == len(set(page.ids)), 'all fresh W3 IDs are unique')
    check(sum(tag == 'h1' for tag, _ in page.tags) == 1, 'one lesson title')
    check(sum(tag == 'main' for tag, _ in page.tags) == 1, 'one main learning surface')
    check(any(tag == 'html' and attrs.get('lang') == 'tr' for tag, attrs in page.tags),
          'Turkish document language')
    check(any(tag == 'meta' and attrs.get('name') == 'viewport'
              and 'device-width' in attrs.get('content', '') for tag, attrs in page.tags),
          'responsive viewport')
    check(page.scripts == ['model.js?v=1', 'lesson.js?v=1'],
          'only the two new local W3 lesson scripts load')
    check(page.stylesheets == ['../w1/lesson.css?v=1', 'lesson.css?v=1'],
          'W1 visual grammar and one local W3 extension load')
    check(not page.events, 'no executable inline event attributes')
    check(not any(marker in raw for marker in (
        'AA:LEARNING-BRIDGE', 'learning-bridges.js', 'learning-bridges.css',
        'aa-legacy-responsive-audit', 'aa-legacy-table-audit',
        'data-week-tab=', 'class="worked-example"',
    )), 'the fresh main has no injected legacy lesson, note bank or bridge layer')
    sequence = ['growth', 'choice', 'binary', 'conditions', 'guided', 'practice', 'next-question']
    check(all(ident in page.ids for ident in sequence), 'the complete fresh learning sequence exists')
    check([page.ids.index(ident) for ident in sequence] ==
          sorted(page.ids.index(ident) for ident in sequence),
          'the learning sequence follows growth, choice, search conditions and transfer')
    check({'main', 'lesson-title', 'teacher-note'} <= set(page.ids),
          'main landmark, title and teacher guidance exist')
    check({'bridge-path', 'learning-bridge-w3', 'lb-w3-transfer'} <= set(page.ids),
          'all earlier pedagogical entry anchors remain valid')

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

    # W3 had two distinct old pages. Neither may be lost or merged into the
    # new lesson. Preserve the authored main at precisely the same URL depth.
    old_raw = git(repo, 'show', f'{baseline}:aa/w3/index.html').decode('utf-8')
    archived_raw = archive.read_text(encoding='utf-8')
    check(old_raw.count('<body>') == 1, 'the earlier authored W3 has exactly one body')
    check(archived_raw == old_raw.replace('<body>', '<body>' + ARCHIVE_BANNER, 1),
          'the entire earlier authored W3 bytes are preserved with only an archive label')
    check(archive.parent == main.parent,
          'the earlier authored W3 stays at the same path depth, preserving relative dependencies')
    archived_page = Page(archived_raw.replace(ARCHIVE_BANNER, '', 1))
    old_page = Page(old_raw)
    check(archived_page.ids == old_page.ids, 'all earlier authored W3 anchors remain in order')
    check(''.join(archived_page.text) == ''.join(old_page.text),
          'all earlier authored W3 text, code, styles and sidebar content are preserved')
    check(archived_page.references == old_page.references,
          'all earlier authored W3 local fragments, assets and navigation URLs are preserved')
    archive_references = []
    from aligned.page_links import fragment_exists
    for tag, attribute, value in archived_page.references:
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc:
            continue
        target = (archive.parent / unquote(parsed.path)).resolve() if parsed.path else archive
        if target.is_dir():
            target /= 'index.html'
        check(target.is_file(), f'preserved authored W3 reference exists: {value}')
        if parsed.fragment and target.suffix == '.html':
            check(fragment_exists(target, unquote(parsed.fragment)),
                  f'preserved authored W3 fragment exists: {value}')
        archive_references.append(value)
    old_supplemental = git(repo, 'show', f'{baseline}:aa/w3/ek-notlar/index.html')
    check(supplemental.read_bytes() == old_supplemental,
          'the distinct generated W3 supplemental notes remain byte-identical')
    check({'lesson', 'practice', 'notes'} <= set(Page(old_supplemental.decode('utf-8')).ids),
          'all three generated W3 legacy panels remain accessible')

    # The reviewed W2 lesson gains exactly one marked onward link.
    for relative in ('aa/tools/lessons/w2.html', 'aa/w2/index.html'):
        before = git(repo, 'show', f'{baseline}:{relative}')
        after = (repo / relative).read_bytes()
        addition = NEXT_LINK.encode('utf-8')
        check(after.count(addition) == 1, f'exactly one marked W3 onward link: {relative}')
        check(after.replace(addition, b'', 1) == before,
              f'W2 differs only by the marked onward link: {relative}')

    cards = root / 'w4/recap/cards.js'
    old_cards = git(repo, 'show', f'{baseline}:aa/w4/recap/cards.js')
    expected_cards = old_cards
    for anchor in ('r0_A', 'r0_a0'):
        old_ref = f'"ref": "../w3/#{anchor}"'.encode()
        new_ref = f'"ref": "../w3/onceki-ders.html#{anchor}"'.encode()
        check(old_cards.count(old_ref) == 1, f'one historical W4 reference to W3 #{anchor}')
        expected_cards = expected_cards.replace(old_ref, new_ref)
        check(anchor in archived_page.ids, f'preserved authored W3 destination exists: #{anchor}')
    check(cards.read_bytes() == expected_cards,
          'the W4 question bank differs only in the two historical W3 deep-reference URLs')

    old_readme = git(repo, 'show', f'{baseline}:aa/README.md')
    check((root / 'README.md').read_bytes().startswith(old_readme),
          'all existing README text precedes the additive documentation')
    tracked = baseline_files(repo, baseline)
    new_files = {path.relative_to(repo).as_posix() for path in root.rglob('*')
                 if path.is_file() and '__pycache__' not in path.parts and path.suffix != '.pyc'
                 and path.relative_to(repo).as_posix() not in tracked}
    check(new_files == EXPECTED_NEW_FILES,
          f'the only added AA files are the canonical lesson, three local assets, archive and verifiers: {sorted(new_files)}')
    protected = {path: digest for path, digest in tracked.items()
                 if path not in SUCCESSOR_EXISTING_CHANGES}
    drift = [path for path, digest in protected.items()
             if not (repo / path).is_file() or blob_hash((repo / path).read_bytes()) != digest]
    check(not drift, f'all {len(protected)} unrelated existing AA files are byte-preserved: {drift}')
    check(all(path in protected for path in tracked if path.startswith('aa/w1/')),
          'the complete approved W1 page and every W1 asset are under exact-byte protection')
    check('aa/tools/simple/w3.html' in protected,
          'the previous authored W3 source is under exact-byte protection')

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
                  f'existing W3 entry fragment remains valid: {relative.as_posix()} → {value}')
            entry_links.append([relative.as_posix(), value])

    from verify_redirects import verify as verify_redirects
    redirects = verify_redirects(root)
    w3_aliases = [item for item in redirects['results'] if item['target'].startswith('w3/')]
    check(len(w3_aliases) == 5 and all(item['target'] == 'w3/ek-notlar/index.html'
                                     and item['fragment'] == 'notes' for item in w3_aliases),
          'all five historical W3 aliases still reach the preserved generated Notes')

    return {
        'status': 'passed', 'baseline': baseline, 'checks': len(checks),
        'canonical_bytes': len(source.read_bytes()),
        'canonical_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'main_is_exact_authored_copy': True,
        'previous_authored_main_bytes_text_code_styles_and_anchors_preserved': True,
        'previous_authored_main_anchors': len(old_page.ids),
        'previous_authored_main_references_checked': len(archive_references),
        'previous_generated_supplemental_bytes_preserved': True,
        'protected_existing_files': len(protected), 'protected_drift': drift,
        'new_files_in_exact_scope': sorted(new_files),
        'week1_all_files_byte_identical': True,
        'other_week_main_pages_unchanged': 12,
        'week2_change_is_only_one_onward_link': True,
        'historical_week4_reference_urls_relocated': 2,
        'legacy_redirects_checked': redirects['aliases'],
        'historical_week3_redirects': len(w3_aliases),
        'new_lesson_references_checked': references,
        'existing_week3_entry_fragments_checked': entry_links,
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
