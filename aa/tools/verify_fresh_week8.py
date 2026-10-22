#!/usr/bin/env python3
"""Read-only exact-scope checks for the independently authored eighth lesson.

The old authored cards, technical notes and generated supplement are retained
as separate preservation fixtures, never as the fresh lesson's authoring
source. Numerical, browser and disposable-copy build checks run separately.
Older audits delegate precisely this scope; this audit never calls them.
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
BASELINE = '9c32f7df3f45437e47fd12fb96928fe0b9efe585'
SUCCESSOR_EXISTING_CHANGES = {
    'aa/README.md',
    'aa/tools/lessons/w7.html',
    'aa/w7/index.html',
    'aa/w8/index.html',
    'aa/w8/teknik-notlar/index.html',
    'aa/w8/teknik-notlar/notlar.md',
    'aa/tools/verify_fresh_week1.py',
    'aa/tools/verify_fresh_week2.py',
    'aa/tools/verify_fresh_week3.py',
    'aa/tools/verify_fresh_week4.py',
    'aa/tools/verify_fresh_week5.py',
    'aa/tools/verify_fresh_week6.py',
    'aa/tools/verify_fresh_week7.py',
    'aa/tools/verify_learning_bridges.py',
}
EXPECTED_NEW_FILES = {
    'aa/tools/lessons/w8.html',
    'aa/tools/verify_fresh_week8.py',
    'aa/tools/verify_fresh_week8_model.cjs',
    'aa/w8/lesson.css',
    'aa/w8/lesson.js',
    'aa/w8/model.js',
    'aa/w8/onceki-ders.html',
}
NEXT_LINK = ('\n<!-- AA:FRESH-W8:NEXT:START -->'
             '<p class="next-lesson"><a href="../w8/" '
             'style="display:inline-flex;align-items:center;min-height:44px">'
             'Hafta 8’e geç: ağda en az adımı bul →</a></p>'
             '<!-- AA:FRESH-W8:NEXT:END -->')
ARCHIVE_BANNER = ('<p class="previous-lesson-banner" '
                  'style="margin:1rem;padding:.75rem 1rem;border:1px solid #888;border-radius:10px">'
                  'Arşiv: Hafta 8 önceki ders sayfası. '
                  '<a href="./">← Yeni ders sayfasına dön</a></p>')
TECHNICAL_NOTE_REPLACEMENTS = {
    'aa/w8/teknik-notlar/index.html': (
        (b'href="../#example-', b'href="../onceki-ders.html#example-', 22),
        (b'href="../"', b'href="../onceki-ders.html"', 2),
    ),
    'aa/w8/teknik-notlar/notlar.md': (
        (b'](../#example-', b'](../onceki-ders.html#example-', 22),
    ),
}


def verify(root=ROOT, baseline=BASELINE):
    root = root.resolve()
    repo = root.parent
    source = root / 'tools/lessons/w8.html'
    main = root / 'w8/index.html'
    archive = root / 'w8/onceki-ders.html'
    supplemental = root / 'w8/ek-notlar/index.html'
    checks = []

    def check(condition, label):
        assert condition, label
        checks.append(label)

    check(source.is_file(), 'an independently authored W8 source exists')
    check(main.read_bytes() == source.read_bytes(),
          'the candidate main exactly reproduces its independently authored source')
    raw = source.read_text(encoding='utf-8')
    page = Page(raw)
    check(len(page.ids) == len(set(page.ids)), 'all fresh W8 IDs are unique')
    check(sum(tag == 'h1' for tag, _ in page.tags) == 1, 'one lesson title')
    check(sum(tag == 'main' for tag, _ in page.tags) == 1, 'one main learning surface')
    check(any(tag == 'html' and attrs.get('lang') == 'tr' for tag, attrs in page.tags),
          'Turkish document language')
    check(any(tag == 'meta' and attrs.get('name') == 'viewport'
              and 'device-width' in attrs.get('content', '') for tag, attrs in page.tags),
          'responsive viewport')
    check(page.scripts == ['model.js?v=1', 'lesson.js?v=1'],
          'only the two new local W8 lesson scripts load')
    check(page.stylesheets == ['../w1/lesson.css?v=1', 'lesson.css?v=1'],
          'W1 visual grammar and one local W8 extension load')
    check(not page.events, 'no executable inline event attributes')
    check(not any(marker in raw for marker in (
        'AA:LEARNING-BRIDGE', 'learning-bridges.js', 'learning-bridges.css',
        'aa-legacy-responsive-audit', 'aa-legacy-table-audit',
        'data-week-tab=', 'class="worked-example"',
    )), 'the fresh main has no injected legacy lesson, note bank or bridge layer')
    sequence = ['need', 'graph', 'queue', 'bfs', 'distance', 'cost', 'guided', 'practice', 'next-question']
    check(all(ident in page.ids for ident in sequence), 'the complete fresh learning sequence exists')
    check([page.ids.index(ident) for ident in sequence] ==
          sorted(page.ids.index(ident) for ident in sequence),
          'the learning sequence follows the stated need, graph, FIFO queue, breadth-first search, distance, cost and transfer')
    check({'main', 'lesson-title', 'teacher-note', 'bfs-widget'} <= set(page.ids),
          'main landmark, title, BFS widget and teacher guidance exist')
    check({'bridge-path'} <= set(page.ids),
          'all earlier pedagogical entry anchors remain valid')
    check({'#need', '#graph', '#bfs', '#practice'} <=
          {value for tag, attribute, value in page.references if tag == 'a' and attribute == 'href'},
          'the four short top-level learning-route anchors exist')

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
    if not (root / 'tools/lessons/w9.html').is_file():
        check(not any(re.fullmatch(r'\.\./w9(?:/(?:index\.html)?)?', urlsplit(value).path)
                      for value in references),
              'the next-week question does not route learners to the unrevised W9 main')
    else:
        from verify_fresh_week9 import NEXT_LINK as W9_NEXT_LINK, BASELINE as W9_BASELINE
        check(raw.count(W9_NEXT_LINK) == 1 and raw.replace(W9_NEXT_LINK, '', 1).encode('utf-8') ==
              git(repo, 'show', f'{W9_BASELINE}:aa/tools/lessons/w8.html'),
              'the reviewed W9 onward link is the only addition to the approved W8 source')

    old_raw = git(repo, 'show', f'{baseline}:aa/w8/index.html').decode('utf-8')
    archived_raw = archive.read_text(encoding='utf-8')
    check(old_raw.count('<body>') == 1, 'the earlier authored W8 has exactly one body')
    check(archived_raw == old_raw.replace('<body>', '<body>' + ARCHIVE_BANNER, 1),
          'the entire earlier authored W8 bytes are preserved with only an archive label')
    check(archive.parent == main.parent,
          'the earlier authored W8 stays at the same path depth for relative dependencies')
    old_page = Page(old_raw)
    archived_page = Page(archived_raw.replace(ARCHIVE_BANNER, '', 1))
    check(archived_page.ids == old_page.ids, 'all earlier authored W8 anchors remain in order')
    check(''.join(archived_page.text) == ''.join(old_page.text),
          'all earlier authored W8 text, inline routing code, styles and card interface content remain')
    check(archived_page.references == old_page.references,
          'all earlier authored W8 local URLs and virtual example entry links remain')
    archive_references = []
    for tag, attribute, value in archived_page.references:
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc:
            continue
        target = (archive.parent / unquote(parsed.path)).resolve() if parsed.path else archive
        if target.is_dir():
            target /= 'index.html'
        check(target.is_file(), f'preserved authored W8 reference exists: {value}')
        if parsed.fragment and target.suffix == '.html':
            check(fragment_exists(target, unquote(parsed.fragment)),
                  f'preserved authored W8 static/virtual fragment exists: {value}')
        archive_references.append(value)
    old_supplemental = git(repo, 'show', f'{baseline}:aa/w8/ek-notlar/index.html')
    check(supplemental.read_bytes() == old_supplemental,
          'the distinct generated W8 supplemental notes remain byte-identical')
    check({'lesson', 'practice', 'notes'} <= set(Page(old_supplemental.decode('utf-8')).ids),
          'all three generated W8 legacy panels remain accessible')

    for relative in ('aa/tools/lessons/w7.html', 'aa/w7/index.html'):
        before = git(repo, 'show', f'{baseline}:{relative}')
        after = (repo / relative).read_bytes()
        addition = NEXT_LINK.encode('utf-8')
        check(after.count(addition) == 1, f'exactly one marked W8 onward link: {relative}')
        check(after.replace(addition, b'', 1) == before,
              f'W7 differs only by the marked onward link: {relative}')

    # The HTML and downloadable Markdown are separate authored notes. Keep
    # every original byte except the exact 46 old-card URL replacements.
    replacement_map = []
    for relative, replacements in TECHNICAL_NOTE_REPLACEMENTS.items():
        before = git(repo, 'show', f'{baseline}:{relative}')
        expected = before
        for old, new, count in replacements:
            check(before.count(old) == count,
                  f'exact original technical-note URL inventory ({count}): {relative} {old.decode()}')
            expected = expected.replace(old, new)
            replacement_map.append({'file': relative, 'old': old.decode(), 'new': new.decode(), 'count': count})
        after = (repo / relative).read_bytes()
        check(after == expected,
              f'technical-note prose, code, style and structure differ only by the exact URL map: {relative}')
    check(sum(item['count'] for item in replacement_map) == 46,
          'exactly 46 technical-note URLs are relocated')
    note_html = (root / 'w8/teknik-notlar/index.html').read_text(encoding='utf-8')
    note_md = (root / 'w8/teknik-notlar/notlar.md').read_text(encoding='utf-8')
    for text, pattern, label in (
        (note_html, r'href="\.\./onceki-ders\.html#example-(\d+)"', 'HTML'),
        (note_md, r'\]\(\.\./onceki-ders\.html#example-(\d+)\)', 'Markdown'),
    ):
        ids = list(map(int, re.findall(pattern, text)))
        check(ids == list(range(1, 23)), f'all 22 {label} old-card references are retained in order')
        for ident in ids:
            check(fragment_exists(archive, f'example-{ident}'),
                  f'{label} technical note reaches the preserved virtual card: #example-{ident}')
    check(note_html.count('href="../onceki-ders.html"') == 2,
          'both technical-note return links reach the earlier authored W8 surface')

    cards = root / 'w8/examples/cards.js'
    check(cards.read_bytes() == git(repo, 'show', f'{baseline}:aa/w8/examples/cards.js'),
          'every earlier W8 card question, answer, number and reference remains byte-identical')
    text = cards.read_text(encoding='utf-8')
    declaration = re.search(r'\bconst\s+cards\s*=\s*', text)
    check(declaration is not None, 'the unchanged JSON card array remains readable')
    card_data, _ = json.JSONDecoder().raw_decode(text[declaration.end():])
    check([card['id'] for card in card_data] == list(range(1, 23)),
          'all 22 preserved W8 virtual card IDs remain in their original order')
    card_references = []
    for card in card_data:
        # This is precisely the existing lesson.js reference contract: the
        # main ref is already a URL; subsequent refs are lecture topic IDs.
        values = [card['ref']] + ['lecture-notes.html#topic-' + value for value in card.get('refs', [])[1:]]
        for value in values:
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
    if (root / 'tools/lessons/w9.html').is_file():
        from verify_fresh_week9 import (SUCCESSOR_EXISTING_CHANGES as W9_CHANGES,
                                        EXPECTED_NEW_FILES as W9_NEW_FILES)
        allowed_changes.update(W9_CHANGES)
        expected_new_files.update(W9_NEW_FILES)
    if (root / 'tools/lessons/w10.html').is_file():
        from verify_fresh_week10 import (SUCCESSOR_EXISTING_CHANGES as W10_CHANGES,
                                        EXPECTED_NEW_FILES as W10_NEW_FILES)
        allowed_changes.update(W10_CHANGES)
        expected_new_files.update(W10_NEW_FILES)
    if (root / 'tools/lessons/w11.html').is_file():
        from verify_fresh_week11 import (SUCCESSOR_EXISTING_CHANGES as W11_CHANGES,
                                        EXPECTED_NEW_FILES as W11_NEW_FILES)
        allowed_changes.update(W11_CHANGES)
        expected_new_files.update(W11_NEW_FILES)
    if (root / 'tools/lessons/w12.html').is_file():
        from verify_fresh_week12 import (SUCCESSOR_EXISTING_CHANGES as W12_CHANGES,
                                        EXPECTED_NEW_FILES as W12_NEW_FILES)
        allowed_changes.update(W12_CHANGES)
        expected_new_files.update(W12_NEW_FILES)
    if (root / 'tools/lessons/w13.html').is_file():
        from verify_fresh_week13 import (SUCCESSOR_EXISTING_CHANGES as W13_CHANGES,
                                        EXPECTED_NEW_FILES as W13_NEW_FILES)
        allowed_changes.update(W13_CHANGES)
        expected_new_files.update(W13_NEW_FILES)
    if (root / 'tools/lessons/w14.html').is_file():
        from verify_fresh_week14 import (SUCCESSOR_EXISTING_CHANGES as W14_CHANGES,
                                        EXPECTED_NEW_FILES as W14_NEW_FILES)
        allowed_changes.update(W14_CHANGES)
        expected_new_files.update(W14_NEW_FILES)
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
    for week in (1, 2, 3, 4, 5, 6):
        check(all(path in protected for path in tracked if path.startswith(f'aa/w{week}/')),
              f'the complete reviewed W{week} route and every asset remain byte-protected')
        check(f'aa/tools/lessons/w{week}.html' in protected,
              f'the reviewed authored W{week} source remains byte-protected')
    check({'aa/tools/simple/w8.html', 'aa/tools/card-pages/w8.html',
           'aa/tools/aligned/build.py', 'aa/tools/verify_rebuild.py',
           'aa/w8/lecture-notes.html', 'aa/w8/examples/cards.js',
           'aa/w8/examples/lesson.js', 'aa/w8/examples/lesson.css',
           'aa/w8/examples/visuals.js', 'aa/w8/teknik-notlar/notes.css',
           'aa/w8/examples/python-runner.js'} <= set(protected),
          'previous W8 sources, card data, notes, Python runner and unchanged build machinery remain protected')
    check(not (root / 'w8/examples/index.html').exists(),
          'no nonexistent historical example alias is invented')

    # The W9 successor pins the next publication and never calls an older
    # audit. Each deferred change has its own nonrecursive exact-scope check.
    if (root / 'tools/lessons/w9.html').is_file():
        from verify_fresh_week9 import verify as verify_fresh_week9
        successor = verify_fresh_week9(root)
        check(successor['status'] == 'passed',
              'authorized Week 9 successor passes its exact-scope preservation audit')

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
                  f'existing W8 entry fragment remains valid: {relative.as_posix()} → {value}')
            entry_links.append([relative.as_posix(), value])

    from verify_redirects import verify as verify_redirects
    redirects = verify_redirects(root)
    w8_aliases = [item for item in redirects['results']
                  if item['target'] == 'w8/ek-notlar/index.html']
    check(len(w8_aliases) == 1 and w8_aliases[0]['alias'] == 'guide/w08/index.html'
          and w8_aliases[0]['fragment'] == 'notes',
          'the historical W8 guide alias still reaches the preserved generated Notes')
    w8_lecture_aliases = [item for item in redirects['results']
                          if item['target'] == 'w8/lecture-notes.html']
    check(len(w8_lecture_aliases) == 1 and w8_lecture_aliases[0]['alias'] == 'extensions/index.html'
          and w8_lecture_aliases[0]['fragment'] == '',
          'the separate extensions alias still reaches the unchanged W8 detailed lecture notes')

    return {
        'status': 'passed', 'baseline': baseline, 'checks': len(checks),
        'canonical_bytes': len(source.read_bytes()),
        'canonical_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'main_is_exact_authored_copy': True,
        'previous_authored_main_bytes_text_code_styles_and_anchors_preserved': True,
        'previous_authored_main_anchors': len(old_page.ids),
        'previous_authored_main_references_checked': len(archive_references),
        'previous_generated_supplemental_bytes_preserved': True,
        'old_card_data_byte_identical': True,
        'old_cards': len(card_data), 'old_card_references_checked': len(card_references),
        'technical_note_url_replacement_map': replacement_map,
        'technical_note_url_replacements': 46,
        'technical_note_html_card_links_checked': 22,
        'technical_note_markdown_card_links_checked': 22,
        'protected_existing_files': len(protected), 'protected_drift': drift,
        'new_files_in_exact_scope': sorted(new_files),
        'week1_through_week6_all_files_byte_identical': True,
        'builder_and_rebuild_verifier_byte_identical': True,
        'other_week_main_pages_unchanged': (6 if (root / 'tools/lessons/w14.html').is_file()
                                          else 7 if (root / 'tools/lessons/w13.html').is_file()
                                          else 8 if (root / 'tools/lessons/w12.html').is_file()
                                          else 9 if (root / 'tools/lessons/w11.html').is_file()
                                          else 10 if (root / 'tools/lessons/w10.html').is_file()
                                          else 11 if successor else 12),
        'authorized_successor_audit': successor,
        'week7_change_is_only_one_onward_link': True,
        'legacy_redirects_checked': redirects['aliases'],
        'historical_week8_notes_redirects': len(w8_aliases),
        'historical_week8_lecture_note_redirects': len(w8_lecture_aliases),
        'new_lesson_references_checked': references,
        'existing_week8_entry_fragments_checked': entry_links,
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
