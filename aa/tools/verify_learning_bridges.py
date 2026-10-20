"""Verify the additive learning route with standard-library tools only.

Run from any directory: python3 aa/tools/verify_learning_bridges.py
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import importlib.util
import subprocess


ROOT = Path(__file__).resolve().parents[2]
PAGES = {0: 'aa/index.html', **{n: f'aa/w{n}/index.html' for n in range(1, 4)}}
spec = importlib.util.spec_from_file_location('learning_bridges', ROOT / 'aa/tools/aligned/learning_paths.py')
bridges = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridges)


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.urls, self.labels, self.answers = [], [], [], []
        self.strongs, self.pre_blocks = [], []
        self.strong, self.pre = None, None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        self.urls.extend(attrs[key] for key in ('href', 'src') if key in attrs)
        if tag == 'label' and 'for' in attrs:
            self.labels.append(attrs['for'])
        if 'data-answer' in attrs:
            self.answers.append(int(attrs['data-answer']))
        if tag == 'strong':
            self.strong = []
        if tag == 'pre':
            self.pre = []

    def handle_data(self, text):
        if self.strong is not None:
            self.strong.append(text)
        if self.pre is not None:
            self.pre.append(text)

    def handle_endtag(self, tag):
        if tag == 'strong' and self.strong is not None:
            self.strongs.append(' '.join(''.join(self.strong).split()))
            self.strong = None
        if tag == 'pre' and self.pre is not None:
            self.pre_blocks.append(''.join(self.pre))
            self.pre = None


def marked(source, start, end):
    assert source.count(start) == source.count(end) == 1, 'Expected one marked addition'
    return source.split(start, 1)[1].split(end, 1)[0]


def scan_count(values, target):
    count = 0
    for value in values:
        count += 1
        if value == target:
            break
    return count


def check_sources(sources):
    rendered = {}
    for week, source in sources.items():
        page = bridges.apply(source, week)
        if bridges.PANEL_START in source:
            assert page == source, f'Week {week}: published learning bridge differs from its source'
        assert bridges.strip(page) == bridges.strip(source), f'Week {week}: existing bytes changed'
        assert bridges.apply(page, week) == page, f'Week {week}: repeated application changed page'
        rendered[(ROOT / PAGES[week]).resolve()] = page

    link_count = 0
    for week, relative in PAGES.items():
        path = (ROOT / relative).resolve()
        page = rendered[path]
        document = Document(page)
        assert len(document.ids) == len(set(document.ids)), f'{relative}: duplicate IDs'
        panel = Document(marked(page, bridges.PANEL_START, bridges.PANEL_END))
        assets = Document(marked(page, bridges.ASSETS_START, bridges.ASSETS_END))
        assert all(label in document.ids for label in panel.labels), f'{relative}: missing input label target'
        if week == 0:
            assert panel.strongs == [
                'Kodları ve döngüleri takip etmek',
                'Matematiksel ifadeleri anlamak',
                'Konuların ne işe yaradığını görmek',
                'Konular arasındaki bağlantıları kurmak',
            ], 'Dashboard must name all four learning problems'
            assert not panel.answers
        else:
            expected = {
                1: scan_count([4, 7, 2, 9, 5], 5),
                2: scan_count(list(range(10)), -1),
                3: len([(i, j) for i in range(5) for j in range(i)]),
            }[week]
            assert panel.answers == [expected], f'{relative}: incorrect guided answer'
        for url in panel.urls + assets.urls:
            parsed = urlsplit(url)
            assert not parsed.scheme and not parsed.netloc, f'{relative}: new external dependency {url}'
            target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            if target.is_dir():
                target /= 'index.html'
            assert target.is_file(), f'{relative}: missing target {url}'
            if parsed.fragment:
                target_source = rendered[target] if target in rendered else target.read_text(encoding='utf-8')
                assert unquote(parsed.fragment) in Document(target_source).ids, f'{relative}: missing anchor {url}'
            link_count += 1
    return rendered, link_count


def check_displayed_python(page):
    panel = Document(marked(page, bridges.PANEL_START, bridges.PANEL_END))
    namespace = {}
    exec(panel.pre_blocks[0], namespace)

    class Value:
        comparisons = 0

        def __init__(self, value):
            self.value = value

        def __eq__(self, other):
            Value.comparisons += 1
            return self.value == other

    for values, target, result, count in [
        ([4, 7, 2, 9, 5], 9, 3, 4),
        ([4, 7, 2, 9, 5], 5, 4, 5),
        ([4, 7, 2, 9, 5], 6, None, 5),
        ([], 9, None, 0),
        ([7, 7], 7, 0, 1),
    ]:
        Value.comparisons = 0
        actual = namespace['find_sensor']([Value(value) for value in values], target)
        assert actual == result, f'Displayed Python: wrong result for {values}, target {target}'
        assert Value.comparisons == count, f'Displayed Python: wrong equality count for target {target}'


def main():
    current = {week: (ROOT / path).read_bytes().decode('utf-8') for week, path in PAGES.items()}
    head = {week: subprocess.check_output(['git', 'show', f'HEAD:{path}'], cwd=ROOT).decode('utf-8')
            for week, path in PAGES.items()}
    for name, sources in [('current', current), ('HEAD', head)]:
        rendered, links = check_sources(sources)
        check_displayed_python(rendered[(ROOT / PAGES[1]).resolve()])
        print(f'PASS {name}: four pages preserve source bytes; idempotent; unique IDs; four learning problems; {links} new links/assets and their anchors resolve; guided answers and displayed Python verified.')

    for n in range(1001):
        count = sum(len(range(i)) for i in range(n))
        assert count == n * (n - 1) // 2, f'Triangular count at n={n}'
        if n >= 2:
            assert n * n <= 4 * count and 2 * count <= n * n, f'Triangular Theta witnesses at n={n}'
        if n >= 1:
            polynomial = 3 * n * n + 5 * n + 7
            assert 3 * n * n <= polynomial <= 15 * n * n, f'Polynomial Theta witnesses at n={n}'
    for week in (-1, 4, 14):
        assert bridges.apply(current[1], week) == current[1], f'Unsupported week {week} changed'
    print('PASS math: loop counts for n=0..1000; triangular and polynomial Theta witnesses; unsupported weeks unchanged.')


if __name__ == '__main__':
    main()
