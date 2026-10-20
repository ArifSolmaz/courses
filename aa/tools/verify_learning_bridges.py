"""Verify the additive learning routes using independent, standard-library checks.

Run from any directory: python3 aa/tools/verify_learning_bridges.py
The checked-in lesson bytes outside the marked additions are the baseline.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import ast
import subprocess


ROOT = Path(__file__).resolve().parents[2]
PAGES = {0: 'aa/index.html', **{n: f'aa/w{n}/index.html' for n in range(1, 8)}}
from aligned import learning_paths as bridges
from aligned.page_links import fragment_exists


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.urls, self.labels, self.answers = [], [], [], []
        self.strongs, self.pre_blocks, self.headings = [], [], []
        self.strong, self.pre, self.heading = None, None, None
        self.heading_tag = None
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
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self.heading, self.heading_tag = [], tag

    def handle_data(self, text):
        if self.strong is not None:
            self.strong.append(text)
        if self.pre is not None:
            self.pre.append(text)
        if self.heading is not None:
            self.heading.append(text)

    def handle_endtag(self, tag):
        if tag == 'strong' and self.strong is not None:
            self.strongs.append(' '.join(''.join(self.strong).split()))
            self.strong = None
        if tag == 'pre' and self.pre is not None:
            self.pre_blocks.append(''.join(self.pre))
            self.pre = None
        if tag == self.heading_tag and self.heading is not None:
            self.headings.append((tag, ''.join(self.heading)))
            self.heading, self.heading_tag = None, None


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


def probe_count(table, target):
    # Independently traverse one finite cycle; include the first empty slot.
    positions = [(target + offset) % len(table) for offset in range(len(table))]
    for count, position in enumerate(positions, 1):
        if table[position] in (target, None):
            return count
    return len(table)


def heap_parent_comparisons(heap, key):
    # Read the original ancestor values; do not simulate the author's swaps.
    position, ancestors = len(heap), []
    while position:
        position = (position - 1) // 2
        ancestors.append(heap[position])
    for count, value in enumerate(ancestors, 1):
        if value <= key:
            return count
    return len(ancestors)


def merge_rank_comparisons(left, right):
    # Stable sorting tagged records provides a separate oracle for the point
    # where the first input empties, without implementing another merge loop.
    ordered = sorted([(value, 0, i) for i, value in enumerate(left)] +
                     [(value, 1, i) for i, value in enumerate(right)])
    if not left or not right:
        return 0
    last = [max(i for i, (_, origin, _) in enumerate(ordered) if origin == side)
            for side in (0, 1)]
    return min(last) + 1


def guided_answers():
    """Count the worked inputs independently; never use author helper results."""
    return {
        1: scan_count([4, 7, 2, 9, 5], 5),
        2: scan_count(list(range(10)), -1),
        3: len([(i, j) for i in range(5) for j in range(i)]),
        4: len([index for index in range(7) if index >= 3]),
        5: probe_count([7, 14, 21, None, None, None, None], 28),
        6: heap_parent_comparisons([1, 3, 2, 7, 5, 4, 6], 0),
        7: merge_rank_comparisons([1, 3, 5], [2, 4, 6]),
    }


def check_sources(sources, *, published=False):
    rendered = {}
    for week, source in sources.items():
        page = bridges.apply(source, week)
        if published:
            assert bridges.PANEL_START in source, f'Week {week}: published learning bridge is missing'
            assert page == source, f'Week {week}: published learning bridge differs from its source'
        assert bridges.strip(page) == bridges.strip(source), f'Week {week}: existing bytes changed'
        assert bridges.apply(page, week) == page, f'Week {week}: repeated application changed page'
        rendered[(ROOT / PAGES[week]).resolve()] = page

    expected_answers = guided_answers()
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
            ], 'Dashboard must name all four learning problems exactly'
            assert not panel.answers
        else:
            assert panel.answers == [expected_answers[week]], f'{relative}: incorrect guided answer'
        for url in panel.urls + assets.urls:
            parsed = urlsplit(url)
            assert not parsed.scheme and not parsed.netloc, f'{relative}: new external dependency {url}'
            target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            if target.is_dir():
                target /= 'index.html'
            assert target.is_file(), f'{relative}: missing target {url}'
            if parsed.fragment:
                target_source = rendered[target] if target in rendered else target.read_text(encoding='utf-8')
                assert (unquote(parsed.fragment) in Document(target_source).ids or fragment_exists(target, unquote(parsed.fragment))), f'{relative}: missing anchor {url}'
            link_count += 1
    return rendered, link_count


def displayed_namespace(page, week):
    """Execute the actual visible function code, rather than source helpers."""
    panel = Document(marked(page, bridges.PANEL_START, bridges.PANEL_END))
    namespace, found = {}, False
    for block in panel.pre_blocks:
        if 'def ' not in block:
            continue
        tree = ast.parse(block)
        assert any(isinstance(node, ast.FunctionDef) for node in tree.body), f'Week {week}: no displayed function'
        exec(compile(tree, f'<displayed Week {week} Python>', 'exec'), namespace)
        found = True
    assert found, f'Week {week}: expected executable displayed Python'
    return namespace


def check_displayed_search(page):
    namespace = displayed_namespace(page, 1)

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


def check_displayed_insertion(page):
    panel = Document(marked(page, bridges.PANEL_START, bridges.PANEL_END))
    assert len(panel.pre_blocks) == 1, 'Week 4: expected one visible insertion program'
    tree = ast.parse(panel.pre_blocks[0])
    initial = {'print': lambda *args: None}
    exec(compile(tree, '<displayed Week 4 Python>', 'exec'), initial)
    assert initial['a'] == [4, 7, 8, 9, 12] and initial['shifts'] == 2, 'Week 4: displayed example result/count'

    # Substitute only the two input declarations; keep the visible algorithm.
    assert isinstance(tree.body[0], ast.Assign) and isinstance(tree.body[1], ast.Assign)
    assert [target.id for target in tree.body[0].targets] == ['a']
    assert [node.id for node in tree.body[1].targets[0].elts] == ['n', 'i', 'shifts']
    algorithm = ast.Module(body=tree.body[2:], type_ignores=[])
    compiled = compile(algorithm, '<displayed Week 4 insertion body>', 'exec')

    class Slots(list):
        writes = 0

        def __setitem__(self, index, value):
            self.writes += 1
            super().__setitem__(index, value)

    for n in range(21):
        old = list(range(100, 100+n))
        for index in range(n+1):
            slots = Slots(old + [None, None])
            namespace = {'a': slots, 'n': n, 'i': index, 'shifts': 0, 'print': lambda *args: None}
            exec(compiled, namespace)
            assert slots == old[:index] + [8] + old[index:] + [None], f'Week 4 insertion result: n={n}, i={index}'
            assert namespace['shifts'] == n-index, f'Week 4 shift count: n={n}, i={index}'
            assert slots.writes == n-index+1, f'Week 4 slot writes: n={n}, i={index}'


def check_original_content(current, head):
    for week in PAGES:
        original, revised = bridges.strip(head[week]), bridges.strip(current[week])
        if week in (4, 5, 6, 7):
            # The existing deck script gains only a cache key for hash routing.
            deck_script = 'recap/recap.js' if week == 4 else 'examples/lesson.js'
            old = f'<script defer src="{deck_script}"></script>'
            new = f'<script defer src="{deck_script}?v=2"></script>'
            assert original.count(old) + original.count(new) == 1, f'Week {week}: expected original deck script'
            assert revised.count(new) == 1, f'Week {week}: expected cache-versioned deck script'
            original = original.replace(old, new, 1)
        assert revised.encode('utf-8') == original.encode('utf-8'), f'Week {week}: original lesson bytes changed versus HEAD'
        before, after = Document(original), Document(revised)
        assert before.ids == after.ids, f'Week {week}: original ID inventory changed'
        assert before.headings == after.headings, f'Week {week}: original headings changed'
    # Exact source-byte preservation also covers original questions, answers,
    # embedded card data, animations, and existing lesson interactions.


def check_math():
    for n in range(1001):
        count = sum(len(range(i)) for i in range(n))
        assert count == n * (n - 1) // 2, f'Triangular count at n={n}'
        if n >= 2:
            assert n * n <= 4 * count and 2 * count <= n * n, f'Triangular Theta witnesses at n={n}'
        if n >= 1:
            polynomial = 3 * n * n + 5 * n + 7
            assert 3 * n * n <= polynomial <= 15 * n * n, f'Polynomial Theta witnesses at n={n}'


def main():
    current = {week: (ROOT / path).read_bytes().decode('utf-8') for week, path in PAGES.items()}
    head = {week: subprocess.check_output(['git', 'show', f'HEAD:{path}'], cwd=ROOT).decode('utf-8')
            for week, path in PAGES.items()}
    check_original_content(current, head)
    print('PASS preservation: all original lesson bytes, IDs, headings, questions and card data are unchanged versus HEAD for dashboard / Weeks 1–7 (only the four deck-script cache keys are normalized).')
    for name, sources in [('current', current), ('HEAD', head)]:
        rendered, links = check_sources(sources, published=name == 'current')
        check_displayed_search(rendered[(ROOT / PAGES[1]).resolve()])
        check_displayed_insertion(rendered[(ROOT / PAGES[4]).resolve()])
        print(f'PASS {name}: eight pages; idempotent additions; unique IDs; exact four learning problems; {links} new links/assets and anchors resolve; guided answers and visible Python search/insertion programs verified (including 231 insertion boundaries).')

    check_math()
    for week in (-1, 8, 14):
        assert bridges.apply(current[1], week) == current[1], f'Unsupported week {week} changed'
    print('PASS math: loop counts for n=0..1000; triangular and polynomial Theta witnesses; unsupported weeks unchanged.')


if __name__ == '__main__':
    main()
