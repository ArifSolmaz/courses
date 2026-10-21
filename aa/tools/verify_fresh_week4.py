#!/usr/bin/env python3
"""Read-only exact-scope checks for the independently authored fourth lesson.

Earlier authored cards and full generated notes are preservation fixtures, not
authoring sources for the new lesson. Keep numerical, browser and disposable
rebuild checks separate. Each older fresh-week verifier delegates only this
explicit successor scope; this verifier never calls an older lesson audit.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import hashlib
import json
import re

from verify_fresh_week1 import Page, baseline_files, blob_hash, git
from aligned.page_links import fragment_exists


ROOT = Path(__file__).resolve().parents[1]
BASELINE = '819ffd90dcc85890e26d8da9daefe0b6de5c7111'
SUCCESSOR_EXISTING_CHANGES = {
    'aa/README.md',
    'aa/tools/lessons/w3.html',
    'aa/w3/index.html',
    'aa/w4/index.html',
    'aa/w4/recap/index.html',
    'aa/w4/recap/cards.js',
    'aa/tools/verify_fresh_week1.py',
    'aa/tools/verify_fresh_week2.py',
    'aa/tools/verify_fresh_week3.py',
    'aa/tools/verify_learning_bridges.py',
}
EXPECTED_NEW_FILES = {
    'aa/tools/lessons/w4.html',
    'aa/tools/verify_fresh_week4.py',
    'aa/tools/verify_fresh_week4_model.cjs',
    'aa/w4/lesson.css',
    'aa/w4/lesson.js',
    'aa/w4/model.js',
    'aa/w4/onceki-ders.html',
}
NEXT_LINK = ('\n<!-- AA:FRESH-W4:NEXT:START -->'
             '<p class="next-lesson"><a href="../w4/" '
             'style="display:inline-flex;align-items:center;min-height:44px">'
             'Hafta 4’e geç: veriyi işe göre düzenle →</a></p>'
             '<!-- AA:FRESH-W4:NEXT:END -->')
ARCHIVE_BANNER = ('<p class="previous-lesson-banner" '
                  'style="margin:1rem;padding:.75rem 1rem;border:1px solid #888;border-radius:10px">'
                  'Arşiv: Hafta 4 önceki ders sayfası. '
                  '<a href="./">← Yeni ders sayfasına dön</a></p>')


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo = root.parent
    source = root / 'tools/lessons/w4.html'
    main = root / 'w4/index.html'
    archive = root / 'w4/onceki-ders.html'
    supplemental = root / 'w4/ek-notlar/index.html'
    checks = []

    def check(condition, label):
        assert condition, label
        checks.append(label)

    check(source.is_file(), 'an independently authored W4 source exists')
    check(main.read_bytes() == source.read_bytes(),
          'the candidate main exactly reproduces its independently authored source')
    raw = source.read_text(encoding='utf-8')
    page = Page(raw)
    check(len(page.ids) == len(set(page.ids)), 'all fresh W4 IDs are unique')
    check(sum(tag == 'h1' for tag, _ in page.tags) == 1, 'one lesson title')
    check(sum(tag == 'main' for tag, _ in page.tags) == 1, 'one main learning surface')
    check(any(tag == 'html' and attrs.get('lang') == 'tr' for tag, attrs in page.tags),
          'Turkish document language')
    check(any(tag == 'meta' and attrs.get('name') == 'viewport'
              and 'device-width' in attrs.get('content', '') for tag, attrs in page.tags),
          'responsive viewport')
    check(page.scripts == ['model.js?v=1', 'lesson.js?v=1'],
          'only the two new local W4 lesson scripts load')
    check(page.stylesheets == ['../w1/lesson.css?v=1', 'lesson.css?v=1'],
          'W1 visual grammar and one local W4 extension load')
    check(not page.events, 'no executable inline event attributes')
    check(not any(marker in raw for marker in (
        'AA:LEARNING-BRIDGE', 'learning-bridges.js', 'learning-bridges.css',
        'aa-legacy-responsive-audit', 'aa-legacy-table-audit',
        'data-week-tab=', 'class="worked-example"',
    )), 'the fresh main has no injected legacy lesson, note bank or bridge layer')
    sequence = ['need', 'access', 'insertion', 'policy', 'guided', 'practice', 'next-question']
    check(all(ident in page.ids for ident in sequence), 'the complete fresh learning sequence exists')
    check([page.ids.index(ident) for ident in sequence] ==
          sorted(page.ids.index(ident) for ident in sequence),
          'the learning sequence follows the stated need, access, insertion, policy and transfer')
    check({'main', 'lesson-title', 'teacher-note'} <= set(page.ids),
          'main landmark, title and teacher guidance exist')
    check({'bridge-path', 'learning-bridge-w4', 'lb-w4-transfer'} <= set(page.ids),
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

    # The earlier W4 card surface stays at the same directory depth. Its
    # separate detailed notes, generated notes, card data and scripts survive.
    old_raw = git(repo, 'show', f'{baseline}:aa/w4/index.html').decode('utf-8')
    archived_raw = archive.read_text(encoding='utf-8')
    check(old_raw.count('<body>') == 1, 'the earlier authored W4 has exactly one body')
    check(archived_raw == old_raw.replace('<body>', '<body>' + ARCHIVE_BANNER, 1),
          'the entire earlier authored W4 bytes are preserved with only an archive label')
    check(archive.parent == main.parent,
          'the earlier authored W4 stays at the same path depth for relative dependencies')
    old_page = Page(old_raw)
    archived_page = Page(archived_raw.replace(ARCHIVE_BANNER, '', 1))
    check(archived_page.ids == old_page.ids, 'all earlier authored W4 anchors remain in order')
    check(''.join(archived_page.text) == ''.join(old_page.text),
          'all earlier authored W4 text, code, styles and card interface content remain')
    check(archived_page.references == old_page.references,
          'all earlier authored W4 local URLs and example entry links remain')
    archive_references = []
    for tag, attribute, value in archived_page.references:
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc:
            continue
        target = (archive.parent / unquote(parsed.path)).resolve() if parsed.path else archive
        if target.is_dir():
            target /= 'index.html'
        check(target.is_file(), f'preserved authored W4 reference exists: {value}')
        if parsed.fragment and target.suffix == '.html':
            check(fragment_exists(target, unquote(parsed.fragment)),
                  f'preserved authored W4 static/virtual fragment exists: {value}')
        archive_references.append(value)
    old_supplemental = git(repo, 'show', f'{baseline}:aa/w4/ek-notlar/index.html')
    check(supplemental.read_bytes() == old_supplemental,
          'the distinct generated W4 supplemental notes remain byte-identical')
    check({'lesson', 'practice', 'notes'} <= set(Page(old_supplemental.decode('utf-8')).ids),
          'all three generated W4 legacy panels remain accessible')

    # The reviewed W3 lesson gains exactly one marked onward link.
    for relative in ('aa/tools/lessons/w3.html', 'aa/w3/index.html'):
        before = git(repo, 'show', f'{baseline}:{relative}')
        after = (repo / relative).read_bytes()
        addition = NEXT_LINK.encode('utf-8')
        check(after.count(addition) == 1, f'exactly one marked W4 onward link: {relative}')
        check(after.replace(addition, b'', 1) == before,
              f'W3 differs only by the marked onward link: {relative}')

    old_recap = git(repo, 'show', f'{baseline}:aa/w4/recap/index.html')
    check(old_recap.count(b"location.replace('../'+location.hash);") == 1
          and old_recap.count(b'href="../"') == 1,
          'the historical recap alias has one script destination and one fallback link')
    expected_recap = old_recap.replace(b"location.replace('../'+location.hash);",
                                      b"location.replace('../onceki-ders.html'+location.hash);")
    expected_recap = expected_recap.replace(b'href="../"', b'href="../onceki-ders.html"')
    check((root / 'w4/recap/index.html').read_bytes() == expected_recap,
          'the recap alias changes only its archive destination and preserves the example hash')

    cards = root / 'w4/recap/cards.js'
    old_cards = git(repo, 'show', f'{baseline}:aa/w4/recap/cards.js')
    check(old_cards.count(b'"ref": "../w1/#') == 3,
          'the W4 card bank has exactly three historical W1 deep-reference URLs')
    check(cards.read_bytes() == old_cards.replace(b'"ref": "../w1/#',
                                                b'"ref": "../w1/ek-notlar/#'),
          'every card question, answer and number is preserved; only three W1 archive URLs change')
    for anchor, count in (('lesson', 2), ('example-1-1', 1)):
        value = f'../w1/ek-notlar/#{anchor}'
        check(cards.read_text(encoding='utf-8').count(f'"ref": "{value}"') == count,
              f'the exact W1 archive reference count is retained for #{anchor}')
        check(fragment_exists(root / 'w1/ek-notlar/index.html', anchor),
              f'the preserved W1 archive owns the repaired fragment: #{anchor}')
    text = cards.read_text(encoding='utf-8')
    declaration = re.search(r'\bconst\s+cards\s*=\s*', text)
    check(declaration is not None, 'the unchanged JSON card array remains readable')
    card_data, _ = json.JSONDecoder().raw_decode(text[declaration.end():])
    card_references = []
    for card in card_data:
        value = card['ref']
        parsed = urlsplit(value)
        check(not parsed.scheme and not parsed.netloc, f'local historical card reference: {value}')
        target = (archive.parent / unquote(parsed.path)).resolve() if parsed.path else archive
        if target.is_dir():
            target /= 'index.html'
        check(target.is_file(), f'historical card reference exists: {value}')
        if parsed.fragment:
            check(fragment_exists(target, unquote(parsed.fragment)),
                  f'historical card reference fragment exists: {value}')
        card_references.append(value)

    old_readme = git(repo, 'show', f'{baseline}:aa/README.md')
    check((root / 'README.md').read_bytes().startswith(old_readme),
          'all existing README text precedes the additive documentation')
    tracked = baseline_files(repo, baseline)
    allowed_changes = set(SUCCESSOR_EXISTING_CHANGES)
    expected_new_files = set(EXPECTED_NEW_FILES)
    successor = None
    if (root / 'tools/lessons/w5.html').is_file():
        from verify_fresh_week5 import (SUCCESSOR_EXISTING_CHANGES as W5_CHANGES,
                                        EXPECTED_NEW_FILES as W5_NEW_FILES)
        allowed_changes.update(W5_CHANGES)
        expected_new_files.update(W5_NEW_FILES)
    new_files = {path.relative_to(repo).as_posix() for path in root.rglob('*')
                 if path.is_file() and '__pycache__' not in path.parts and path.suffix != '.pyc'
                 and path.relative_to(repo).as_posix() not in tracked}
    check(new_files == expected_new_files,
          f'the only added AA files are the canonical lesson, three local assets, archive and verifiers: {sorted(new_files)}')
    protected = {path: digest for path, digest in tracked.items()
                 if path not in allowed_changes}
    drift = [path for path, digest in protected.items()
             if not (repo / path).is_file() or blob_hash((repo / path).read_bytes()) != digest]
    check(not drift, f'all {len(protected)} unrelated existing AA files are byte-preserved: {drift}')
    for week in (1, 2):
        check(all(path in protected for path in tracked if path.startswith(f'aa/w{week}/')),
              f'the complete reviewed W{week} route and every asset remain byte-protected')
        check(f'aa/tools/lessons/w{week}.html' in protected,
              f'the reviewed authored W{week} source remains byte-protected')
    check({'aa/tools/simple/w4.html', 'aa/tools/card-pages/w4.html',
           'aa/tools/aligned/build.py', 'aa/tools/verify_rebuild.py',
           'aa/w4/lecture-notes.html', 'aa/w4/recap/recap.js',
           'aa/w4/recap/recap.css', 'aa/w4/recap/visuals.js'} <= set(protected),
          'all previous W4 author sources, notes, scripts and unchanged build machinery remain protected')

    # The W5 successor pins the next publication and never invokes an older
    # audit. Every deferred byte change is verified once in a nonrecursive
    # W1 -> W2 -> W3 -> W4 -> W5 successor chain.
    if (root / 'tools/lessons/w5.html').is_file():
        from verify_fresh_week5 import verify as verify_fresh_week5
        successor = verify_fresh_week5(root)
        check(successor['status'] == 'passed',
              'authorized Week 5 successor passes its exact-scope preservation audit')

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
                  f'existing W4 entry fragment remains valid: {relative.as_posix()} → {value}')
            entry_links.append([relative.as_posix(), value])

    from verify_redirects import verify as verify_redirects
    redirects = verify_redirects(root)
    w4_aliases = [item for item in redirects['results'] if item['target'].startswith('w4/')]
    check(len(w4_aliases) == 5 and all(item['target'] == 'w4/ek-notlar/index.html'
                                     and item['fragment'] == 'notes' for item in w4_aliases),
          'all five historical W4 aliases still reach the preserved generated Notes')

    return {
        'status': 'passed', 'baseline': baseline, 'checks': len(checks),
        'canonical_bytes': len(source.read_bytes()),
        'canonical_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'main_is_exact_authored_copy': True,
        'previous_authored_main_bytes_text_code_styles_and_anchors_preserved': True,
        'previous_authored_main_anchors': len(old_page.ids),
        'previous_authored_main_references_checked': len(archive_references),
        'previous_generated_supplemental_bytes_preserved': True,
        'old_card_data_preserved_except_three_w1_reference_urls': True,
        'old_cards': len(card_data), 'old_card_references_checked': len(card_references),
        'historical_recap_alias_preserves_example_hash': True,
        'protected_existing_files': len(protected), 'protected_drift': drift,
        'new_files_in_exact_scope': sorted(new_files),
        'week1_and_week2_all_files_byte_identical': True,
        'builder_and_rebuild_verifier_byte_identical': True,
        'other_week_main_pages_unchanged': 11 if successor else 12,
        'authorized_successor_audit': successor,
        'week3_change_is_only_one_onward_link': True,
        'legacy_redirects_checked': redirects['aliases'],
        'historical_week4_notes_redirects': len(w4_aliases),
        'new_lesson_references_checked': references,
        'existing_week4_entry_fragments_checked': entry_links,
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
