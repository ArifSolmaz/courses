#!/usr/bin/env python3
"""Read-only validation of every legacy AA redirect and its teaching destination.

Run after the course has been built: python3 aa/tools/verify_redirects.py
Use --root /path/to/copied/aa to check a disposable build without writing routes.
The explicit 54-address inventory prevents a missing alias from passing silently.
Browser meta-refresh / tab activation is checked separately by the UI audit.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import json
import re


ROOT = Path(__file__).resolve().parents[1]
# Former Python weeks retain their historical topic placements, not their numbers.
PYTHON_WEEKS = (1, 1, 3, 4, 2, 2, 3, 2, 5, 4, 5, 5, 7, 14)


def inventory():
    routes = {}
    for prefix in ('guide', 'python/guide'):
        for suffix in ('', '/bridges', '/reviews', '/toolkit'):
            routes[f'{prefix}{suffix}/index.html'] = None
    routes['python/index.html'] = None
    for old, mapped in enumerate(PYTHON_WEEKS, 1):
        routes[f'guide/w{old:02}/index.html'] = old
        routes[f'python/w{old}/index.html'] = mapped
        routes[f'python/guide/w{old:02}/index.html'] = mapped
    routes.update({'extensions/index.html': 'graph-notes',
                   'skiena/index.html': 2, 'engineering/index.html': 14})
    return routes


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.refreshes, self.canonicals, self.links, self.ids = [], [], [], []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh':
            self.refreshes.append(attrs.get('content', ''))
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href', ''))
        if tag == 'a':
            self.links.append(attrs.get('href', ''))


def expected_destination(week):
    if week is None:
        return 'index.html', ''
    if week == 'graph-notes':
        return 'w8/lecture-notes.html', ''
    # Weeks 1–2 own Notes on their main page. The later main pages have a
    # different structure; preserve access to the complete original Notes view.
    suffix = 'index.html' if week <= 2 else 'ek-notlar/index.html'
    return f'w{week}/{suffix}', 'notes'


def verify(root):
    root = root.resolve()
    expected = inventory()
    actual = {p.relative_to(root).as_posix()
              for parent in ('guide', 'python')
              for p in (root / parent).rglob('index.html')}
    actual.update(route for route in ('extensions/index.html', 'skiena/index.html',
                                      'engineering/index.html') if (root / route).is_file())
    assert actual == set(expected), {'missing_aliases': sorted(set(expected) - actual),
                                     'unaccounted_aliases': sorted(actual - set(expected))}
    results = []
    for relative, week in sorted(expected.items()):
        path = root / relative
        page = Page(path.read_text(encoding='utf-8'))
        assert len(page.refreshes) == 1, (relative, 'expected one meta refresh')
        match = re.fullmatch(r'\s*0\s*;\s*url\s*=\s*(.+?)\s*', page.refreshes[0], re.I)
        assert match, (relative, 'expected immediate URL refresh')
        destination = match[1].strip('"\'')
        assert '\\' not in destination, (relative, 'URL must use forward slashes')
        assert page.canonicals == [destination], (relative, 'canonical differs from refresh')
        assert page.links == [destination], (relative, 'fallback link differs from refresh')
        url = urlsplit(destination)
        assert not url.scheme and not url.netloc and not url.query, (relative, 'unexpected external/query target')
        target = (path.parent / unquote(url.path)).resolve()
        if target.is_dir():
            target /= 'index.html'
        assert target.is_file(), (relative, 'missing target', str(target))
        wanted_path, wanted_fragment = expected_destination(week)
        assert target == root / wanted_path, (relative, 'incorrect teaching destination', destination)
        assert unquote(url.fragment) == wanted_fragment, (relative, 'incorrect Notes fragment')
        if wanted_fragment:
            target_page = Page(target.read_text(encoding='utf-8'))
            assert wanted_fragment in target_page.ids, (relative, 'target does not own the Notes panel')
        results.append({'alias': relative, 'destination': destination,
                        'target': wanted_path, 'fragment': wanted_fragment})
    return {'status': 'passed', 'aliases': len(results), 'missing_aliases': [],
            'all_targets_and_fragments_exist': True,
            'refresh_canonical_fallback_agree': True, 'results': results}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='AA tree to inspect; no files are changed.')
    parser.add_argument('--report', type=Path, help='Optional report path outside the published source tree.')
    args = parser.parse_args()
    report = verify(args.root)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
