"""Verify the additive learning routes using independent, standard-library checks.

Run from any directory: python3 aa/tools/verify_learning_bridges.py
The checked-in lesson bytes outside the marked additions are the baseline.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import ast
import re
from itertools import combinations, permutations, product
import subprocess


ROOT = Path(__file__).resolve().parents[2]
PAGES = {0: 'aa/index.html', **{n: f'aa/w{n}/index.html' for n in range(1, 15)}}
# The independently authored main deliberately has no legacy bridge panel.
# Keep exercising that complete, unmodified panel on its archived route.
LEGACY_BASELINES = {
    1: 'acb217da0836cf447c10df2c2c6797a89b56266b',
    2: 'b5248a58653bd1107c06470fec261edac5d7e652',
}
FRESH_WEEKS = {week for week in LEGACY_BASELINES
               if (ROOT / f'aa/tools/lessons/w{week}.html').is_file()}
for week in FRESH_WEEKS:
    PAGES[week] = f'aa/w{week}/ek-notlar/index.html'
from aligned import learning_paths as bridges
from aligned.page_links import fragment_exists


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.urls, self.labels, self.answers = [], [], [], []
        self.links, self.dependencies = [], []
        self.strongs, self.pre_blocks, self.headings, self.label_texts = [], [], [], []
        self.strong, self.pre, self.heading, self.current_label = None, None, None, None
        self.heading_tag = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        self.urls.extend(attrs[key] for key in ('href', 'src') if key in attrs)
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        self.dependencies.extend(attrs[key] for key in ('href', 'src') if key in attrs and not (tag == 'a' and key == 'href'))
        if tag == 'label':
            self.current_label = []
            if 'for' in attrs:
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
        if self.current_label is not None:
            self.current_label.append(text)
        if self.strong is not None:
            self.strong.append(text)
        if self.pre is not None:
            self.pre.append(text)
        if self.heading is not None:
            self.heading.append(text)

    def handle_endtag(self, tag):
        if tag == 'label' and self.current_label is not None:
            self.label_texts.append(' '.join(''.join(self.current_label).split()))
            self.current_label = None
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


def graph_distances(graph):
    """All-pairs edge relaxation supplies an oracle independent of BFS/DFS."""
    vertices = list(graph)
    distance = {(u, v): (0 if u == v else float('inf')) for u in vertices for v in vertices}
    for u, neighbors in graph.items():
        for v in neighbors:
            distance[u, v] = min(distance[u, v], 1)
    for middle in vertices:
        for source in vertices:
            for target in vertices:
                distance[source, target] = min(distance[source, target],
                                               distance[source, middle] + distance[middle, target])
    return distance


def reachable_neighbor_entries(graph, source):
    distances = graph_distances(graph)
    return sum(len(graph[vertex]) for vertex in graph if distances[source, vertex] != float('inf'))


def forest_relation(vertices, edges):
    # Connectivity is obtained by transitive closure, without union-find.
    graph = {vertex: [] for vertex in vertices}
    for u, v, _ in edges:
        graph[u].append(v)
        graph[v].append(u)
    distances = graph_distances(graph)
    return frozenset((u, v) for u in vertices for v in vertices if distances[u, v] != float('inf'))


def minimum_forest_cost(vertices, edges):
    """Brute-force edge subsets; the oracle does not run Prim or Kruskal."""
    relation = forest_relation(vertices, edges)
    components = {frozenset(v for v in vertices if (u, v) in relation) for u in vertices}
    edge_count = len(vertices) - len(components)
    costs = [sum(edge[2] for edge in chosen) for chosen in combinations(edges, edge_count)
             if forest_relation(vertices, chosen) == relation]
    assert costs, 'Every finite undirected graph has a spanning forest'
    return min(costs), edge_count, relation


def simple_path_distances(graph, source):
    """Enumerate simple vertex paths: no heap and no edge relaxation loop."""
    weights = {}
    for u, neighbors in graph.items():
        for v, weight in neighbors:
            weights[u, v] = min(weights.get((u, v), float('inf')), weight)
    result = {source: 0}
    for target in graph:
        if target == source:
            continue
        middle = [vertex for vertex in graph if vertex not in (source, target)]
        best = float('inf')
        for size in range(len(middle) + 1):
            for intermediate in permutations(middle, size):
                path = (source, *intermediate, target)
                arcs = list(zip(path, path[1:]))
                if all(arc in weights for arc in arcs):
                    best = min(best, sum(weights[arc] for arc in arcs))
        result[target] = best
    return result


def sensor_triangle():
    return {'A': [('B', 2), ('C', 3)], 'B': [('A', 2), ('C', 2)], 'C': [('A', 3), ('B', 2)]}


def cartesian_walks(graph, source, steps):
    """Filter all vertex sequences, without recursion, pruning or DP states.

    Parallel arc occurrences, if present, produce separate edge-choice walks.
    Repeated vertices and edges stay legal; length is exactly ``steps``.
    """
    weights = {}
    for u, neighbors in graph.items():
        for v, weight in neighbors:
            weights.setdefault((u, v), []).append(weight)
    records = []
    for suffix in product(graph, repeat=steps):
        path = (source, *suffix)
        edge_options = [weights.get(arc, []) for arc in zip(path, path[1:])]
        for chosen_weights in product(*edge_options):
            records.append((path, sum(chosen_weights)))
    return records


def independent_vertex_masks(vertices, edges):
    """Induced-subgraph oracle: enumerate independent vertex masks directly.

    The complement of a proposed cover must induce an edgeless graph. Edge
    weights are deliberately absent from this adjacency representation.
    """
    index = {vertex: i for i, vertex in enumerate(vertices)}
    adjacency = [0] * len(vertices)
    for u, v, _ in edges:
        adjacency[index[u]] |= 1 << index[v]
        adjacency[index[v]] |= 1 << index[u]
    return frozenset(mask for mask in range(1 << len(vertices))
                     if all(not (adjacency[i] & mask) for i in range(len(vertices)) if mask & (1 << i)))


def minimum_cover_size(vertices, edges):
    independent = independent_vertex_masks(vertices, edges)
    return len(vertices) - max(mask.bit_count() for mask in independent)


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
        8: reachable_neighbor_entries({'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A', 'D'], 'D': ['B', 'C'], 'E': []}, 'A'),
        9: sum(map(len, {'A': ['B', 'C'], 'B': ['D'], 'C': ['D'], 'D': []}.values())),
        10: minimum_forest_cost(list('ABC'), [('A', 'B', 2), ('B', 'C', 2), ('A', 'C', 3)])[0],
        11: simple_path_distances({'A': [('B', 2), ('C', 3)], 'B': [('A', 2), ('C', 2)], 'C': [('A', 3), ('B', 2)]}, 'A')['C'],
        12: len([record for record in cartesian_walks(sensor_triangle(), 'A', 3) if record[0][-1] == 'C']),
        13: min(cost for path, cost in cartesian_walks(sensor_triangle(), 'A', 3) if path[-1] == 'C'),
        14: minimum_cover_size(list('ABC'), [('A', 'B', 2), ('B', 'C', 2), ('A', 'C', 3)]),
    }


def apply_at_route(source, week):
    """Use the same old panel with its two-ancestor archive asset base."""
    page = bridges.apply(source, week)
    if week in FRESH_WEEKS:
        for start, end in ((bridges.PANEL_START, bridges.PANEL_END),
                           (bridges.ASSETS_START, bridges.ASSETS_END)):
            content = marked(page, start, end)
            relocated = content.replace('href="../', 'href="../../').replace('src="../', 'src="../../')
            page = page.replace(start + content + end, start + relocated + end, 1)
    return page


def check_sources(sources, *, published=False):
    rendered = {}
    for week, source in sources.items():
        page = apply_at_route(source, week)
        if published:
            assert bridges.PANEL_START in source, f'Week {week}: published learning bridge is missing'
            assert page == source, f'Week {week}: published learning bridge differs from its source'
        assert bridges.strip(page) == bridges.strip(source), f'Week {week}: existing bytes changed'
        assert apply_at_route(page, week) == page, f'Week {week}: repeated application changed page'
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
            if week in (10, 11, 13):
                assert panel.label_texts == ['Tahminim (toplam maliyet)'], f'{relative}: guided label must name cost, not operation count'
            if week == 12:
                assert panel.label_texts == ['Tahminim (yürüyüş sayısı)'], f'{relative}: guided label must name the number of walks'
            if week == 14:
                assert panel.label_texts == ['Tahminim (sensör sayısı)'], f'{relative}: guided label must name the number of sensors'
        for url in panel.urls + assets.urls:
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc:
                official_citation = (week == 14 and url == 'https://www.claymath.org/millennium/p-vs-np/'
                                     and url in panel.links and url not in panel.dependencies + assets.dependencies)
                assert official_citation, f'{relative}: unexpected external link/dependency {url}'
                link_count += 1
                continue  # An official source citation; all runtime assets stay local.
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


class ObservedGraph(dict):
    """Record the actual visible code's adjacency scans without changing it."""
    def __init__(self, graph):
        self.inspections, self.expansions = 0, []
        owner = self

        class Neighbors(list):
            def __iter__(self):
                for neighbor in super().__iter__():
                    owner.inspections += 1
                    yield neighbor

        super().__init__((vertex, Neighbors(neighbors)) for vertex, neighbors in graph.items())

    def __getitem__(self, vertex):
        self.expansions.append(vertex)
        return super().__getitem__(vertex)


def small_graphs():
    # Exhaustive simple directed graphs up to four vertices, plus explicit
    # self-loop/duplicate-edge cases below. Neighbor order is fixed by input.
    yield {}
    for n in range(1, 5):
        vertices = list('ABCD'[:n])
        arcs = [(u, v) for u in vertices for v in vertices if u != v]
        for mask in range(1 << len(arcs)):
            graph = {vertex: [] for vertex in vertices}
            for bit, (u, v) in enumerate(arcs):
                if mask & (1 << bit):
                    graph[u].append(v)
            yield graph
    yield {'A': ['A']}
    yield {'A': ['B', 'B'], 'B': ['A'], 'C': []}
    yield {'A': ['B'], 'B': ['C'], 'C': ['C'], 'D': []}


def check_displayed_graphs(bfs_page, dfs_page):
    bfs = displayed_namespace(bfs_page, 8)['bfs']
    dfs = displayed_namespace(dfs_page, 9)['dfs_dependencies']
    cases = 0
    for graph in small_graphs():
        distances = graph_distances(graph)
        for source in graph:
            observed = ObservedGraph(graph)
            distance, parent, scans = bfs(observed, source)
            expected = {vertex: int(distances[source, vertex]) for vertex in graph
                        if distances[source, vertex] != float('inf')}
            assert distance == expected, f'BFS distances: {graph}, source {source}'
            assert set(parent) == set(expected) and parent[source] is None, 'BFS parent coverage/source'
            for vertex in expected:
                if vertex != source:
                    assert parent[vertex] in graph and vertex in graph[parent[vertex]], 'BFS parent must be an edge'
                    assert distance[parent[vertex]] + 1 == distance[vertex], 'BFS parent gives a shortest path'
            assert scans == sum(len(graph[vertex]) for vertex in expected), 'BFS reachable adjacency count'
            assert scans == observed.inspections, 'BFS displayed counter equals actual neighbor inspections'
            assert len(observed.expansions) == len(expected) and set(observed.expansions) == set(expected), 'BFS expands each reached vertex exactly once'
            layers = [distance[vertex] for vertex in observed.expansions]
            assert layers == sorted(layers), 'FIFO expansion respects nondecreasing distance'
            cases += 1

        # A directed cycle exists iff an arc returns to its source by a path.
        # This oracle does not use recursion, colors or a second DFS traversal.
        cyclic = any(distances[v, u] != float('inf') for u in graph for v in graph[u])
        observed = ObservedGraph(graph)
        try:
            discovery, finish, scans = dfs(observed)
        except ValueError as error:
            assert cyclic, f'DFS falsely rejects an acyclic graph: {graph}'
            assert 'cycle' in str(error).lower(), 'Cycle failure must identify its cause'
        else:
            assert not cyclic, f'DFS missed a directed cycle: {graph}'
            assert len(discovery) == len(set(discovery)) == len(graph), 'DFS discovers every vertex once'
            assert len(finish) == len(set(finish)) == len(graph), 'DFS finishes every vertex once'
            assert set(discovery) == set(finish) == set(graph), 'DFS full forest covers isolated vertices'
            assert discovery == observed.expansions, 'DFS follows its actual adjacency-entry order'
            assert scans == observed.inspections == sum(map(len, graph.values())), 'DFS counts directed adjacency entries, not entry/exit events'
            rank = {vertex: index for index, vertex in enumerate(reversed(finish))}
            assert all(rank[u] < rank[v] for u in graph for v in graph[u]), 'Reverse finishes must obey every dependency'
        cases += 1

    undirected = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A', 'D'], 'D': ['B', 'C'], 'E': []}
    distance, parent, scans = bfs(undirected, 'A')
    assert distance == {'A': 0, 'B': 1, 'C': 1, 'D': 2}
    assert parent == {'A': None, 'B': 'A', 'C': 'A', 'D': 'B'} and scans == 8
    reverse_neighbors = {vertex: list(reversed(neighbors)) for vertex, neighbors in undirected.items()}
    distance2, parent2, scans2 = bfs(reverse_neighbors, 'A')
    assert distance2 == distance and parent2['D'] == 'C' and scans2 == scans, 'BFS tie changes parent, not shortest distance'
    assert bfs(undirected, 'E') == ({'E': 0}, {'E': None}, 0), 'Isolated source is still discovered'
    diamond = {'A': ['B', 'C'], 'B': ['D'], 'C': ['D'], 'D': []}
    discovery, finish, scans = dfs(diamond)
    assert discovery == ['A', 'B', 'D', 'C'] and finish == ['D', 'B', 'C', 'A'] and scans == 4, 'Listed-order DFS worked example'
    assert dfs({}) == ([], [], 0), 'Empty dependency graph has an empty full DFS forest'
    return cases + 5


def check_displayed_networks(mst_page, shortest_page):
    mst = displayed_namespace(mst_page, 10)['mst']
    dijkstra = displayed_namespace(shortest_page, 11)['dijkstra']
    cases = 0

    for n in range(5):
        vertices = list('ABCD'[:n])
        pairs = list(combinations(vertices, 2))
        for weights in product((None, -1, 0, 2), repeat=len(pairs)):
            edges = [(u, v, weight) for (u, v), weight in zip(pairs, weights) if weight is not None]
            expected_cost, edge_count, relation = minimum_forest_cost(vertices, edges)
            chosen, total = mst(vertices, edges)
            remaining = list(edges)
            for edge in chosen:
                edge = tuple(edge)
                assert edge in remaining, 'MST selects only available input-edge occurrences'
                remaining.remove(edge)
            assert len(chosen) == edge_count, 'Spanning forest has V minus component-count edges'
            assert forest_relation(vertices, chosen) == relation, 'Spanning forest preserves every original connected component'
            assert total == sum(weight for _, _, weight in chosen) == expected_cost, 'MST/forest total equals independent subset optimum'
            cases += 1

    def verify_routes(graph, source):
        distance, parent = dijkstra(graph, source)
        expected = simple_path_distances(graph, source)
        assert distance == expected, f'Dijkstra versus all simple paths: {graph}, source {source}'
        assert set(parent) == set(graph) and parent[source] is None, 'Dijkstra parent coverage/source'
        for target in graph:
            if distance[target] == float('inf'):
                assert parent[target] is None, 'Unreachable distance is infinity with no parent'
                continue
            # Parent links must reconstruct a real shortest path, even with
            # zero-weight cycles and several equally good route choices.
            visited, vertex, cost = set(), target, 0
            while vertex != source:
                assert vertex not in visited, 'Dijkstra parent records must not contain a cycle'
                visited.add(vertex)
                previous = parent[vertex]
                assert previous in graph, 'Reachable nonsource vertex needs a parent'
                weights = [weight for neighbor, weight in graph[previous] if neighbor == vertex]
                assert weights, 'Parent relation must be an actual directed edge'
                admissible = [weight for weight in weights if distance[previous] + weight == distance[vertex]]
                assert admissible, 'Parent edge must realize the final shortest distance'
                cost += min(admissible)
                vertex = previous
            assert cost == distance[target], 'Parent route has the independently optimal total cost'

    for n in range(1, 4):
        vertices = list('ABC'[:n])
        arcs = [(u, v) for u in vertices for v in vertices if u != v]
        for weights in product((None, 0, 1, 3), repeat=len(arcs)):
            graph = {vertex: [] for vertex in vertices}
            for (u, v), weight in zip(arcs, weights):
                if weight is not None:
                    graph[u].append((v, weight))
            for source in graph:
                verify_routes(graph, source)
                cases += 1
    for graph in [
        {'A': [], 'B': [], 'C': [], 'D': []},
        {'A': [('B', 5), ('C', 1)], 'B': [('D', 1)], 'C': [('B', 1), ('D', 10)], 'D': []},
        {'A': [('B', 0), ('C', 0)], 'B': [('D', 0)], 'C': [('D', 0)], 'D': []},
        {'A': [('B', 0)], 'B': [('A', 0), ('C', 2)], 'C': [('D', 0)], 'D': [('C', 0)]},
        {'A': [('A', 0), ('B', 3), ('B', 1)], 'B': [], 'C': []},
    ]:
        for source in graph:
            verify_routes(graph, source)
            cases += 1
    for graph in [
        {'A': [('B', -1)], 'B': []},
        {'A': [], 'B': [('C', -1)], 'C': []},
    ]:
        try:
            dijkstra(graph, 'A')
        except ValueError:
            pass
        else:
            raise AssertionError('Dijkstra must reject every negative edge, including unreachable edges')
        cases += 1
    for graph, source in [({}, 'A'), ({'A': []}, 'missing')]:
        try:
            dijkstra(graph, source)
        except ValueError:
            pass
        else:
            raise AssertionError('Unknown Dijkstra source must be rejected')
        cases += 1

    vertices, edges = list('ABC'), [('A', 'B', 2), ('B', 'C', 2), ('A', 'C', 3)]
    chosen, total = mst(vertices, edges)
    assert total == 4 and chosen == [('A', 'B', 2), ('B', 'C', 2)], 'Worked MST network total'
    triangle = {'A': [('B', 2), ('C', 3)], 'B': [('A', 2), ('C', 2)], 'C': [('A', 3), ('B', 2)]}
    distance, parent = dijkstra(triangle, 'A')
    assert distance == {'A': 0, 'B': 2, 'C': 3} and parent == {'A': None, 'B': 'A', 'C': 'A'}, 'Worked shortest route differs from the MST route'
    return cases + 2


def small_walk_graphs():
    """Exhaustive small structures and weights; retain loops and revisits."""
    seen = set()

    def unique(graph):
        key = tuple((vertex, tuple(neighbors)) for vertex, neighbors in graph.items())
        if key in seen:
            return False
        seen.add(key)
        return True

    for n in range(1, 4):
        vertices = list('ABC'[:n])
        arcs = [(u, v) for u in vertices for v in vertices if u != v]
        for mask in range(1 << len(arcs)):
            for shift in range(3):
                graph = {vertex: [] for vertex in vertices}
                for bit, (u, v) in enumerate(arcs):
                    if mask & (1 << bit):
                        graph[u].append((v, (-2, 0, 3)[(bit + shift) % 3]))
                if unique(graph):
                    yield graph
    # Every weighted directed graph on two vertices, including self-loops.
    arcs = list(product('AB', repeat=2))
    for weights in product((None, -2, 0, 3), repeat=len(arcs)):
        graph = {'A': [], 'B': []}
        for (u, v), weight in zip(arcs, weights):
            if weight is not None:
                graph[u].append((v, weight))
        if unique(graph):
            yield graph
    for graph in [
        sensor_triangle(),
        {'A': [('B', 0), ('C', 0)], 'B': [('A', 0), ('C', 0)], 'C': [('A', 0), ('B', 0)]},
        {'A': [('B', -2)], 'B': [('A', 1)], 'C': []},
        {'A': [('A', 3)], 'B': []},
        {'A': [('B', 1), ('B', 1), ('B', -1)], 'B': [('A', 0)], 'C': []},
    ]:
        if unique(graph):
            yield graph


def check_displayed_walks(enumeration_page, dp_page):
    enumerate_walks = displayed_namespace(enumeration_page, 12)['enumerate_walks']
    exact_walk_cost = displayed_namespace(dp_page, 13)['exact_walk_cost']
    cases = 0
    for graph in small_walk_graphs():
        for source in graph:
            expected_table = []
            for steps in range(5):
                records = cartesian_walks(graph, source, steps)
                row = {target: min((cost for path, cost in records if path[-1] == target), default=float('inf'))
                       for target in graph}
                expected_table.append(row)
                for target in graph:
                    expected_walks = sorted((path, cost) for path, cost in records if path[-1] == target)
                    actual = enumerate_walks(graph, source, target, steps)
                    actual_walks = sorted((tuple(path), cost) for path, cost in actual)
                    assert actual_walks == expected_walks, f'Exact-length walk enumeration: {graph}, {source}->{target}, k={steps}'
                    assert all(len(path) == steps + 1 and path[0] == source and path[-1] == target for path, _ in actual), 'Every returned walk has exactly k edges and correct endpoints'
                    answer, table = exact_walk_cost(graph, source, target, steps)
                    assert len(table) == steps + 1 and all(isinstance(state, dict) for state in table), 'DP table contains a dictionary snapshot for each exact step count 0..k'
                    assert table == expected_table, f'Every exact-length DP row matches independent vertex-sequence minima: {graph}, source {source}, k={steps}'
                    assert answer == row[target], 'DP answer selects the requested target at exactly k edges'
                    cases += 1

    invalid = [
        ({'A': []}, 'A', 'A', -1),
        ({'A': []}, 'A', 'A', True),
        ({'A': []}, 'A', 'A', 1.0),
        ({'A': []}, 'missing', 'A', 0),
        ({'A': []}, 'A', 'missing', 0),
        ({}, 'A', 'A', 0),
    ]
    for graph, source, target, steps in invalid:
        for function in (enumerate_walks, exact_walk_cost):
            try:
                function(graph, source, target, steps)
            except ValueError:
                pass
            else:
                raise AssertionError('Exact-walk code must reject non-integer/negative k or unknown endpoints')
            cases += 1

    expected = [(('A', 'B', 'A', 'C'), 7), (('A', 'C', 'A', 'C'), 9), (('A', 'C', 'B', 'C'), 7)]
    actual = enumerate_walks(sensor_triangle(), 'A', 'C', 3)
    assert sorted((tuple(path), cost) for path, cost in actual) == expected, 'Worked k=3 walks may revisit vertices and edges'
    answer, table = exact_walk_cost(sensor_triangle(), 'A', 'C', 3)
    assert answer == 7 and table == [
        {'A': 0, 'B': float('inf'), 'C': float('inf')},
        {'A': float('inf'), 'B': 2, 'C': 3},
        {'A': 4, 'B': 5, 'C': 4},
        {'A': 7, 'B': 6, 'C': 7},
    ], 'Worked DP states count exact edge length, rather than at-most length or ordinary shortest paths'
    class VisibleTable(HTMLParser):
        def __init__(self, source):
            super().__init__()
            self.tables, self.rows, self.row, self.cell = [], None, None, None
            self.feed(source)

        def handle_starttag(self, tag, attrs):
            if tag == 'table' and 'bfs-table' in dict(attrs).get('class', '').split():
                self.rows = []
            elif self.rows is not None and tag == 'tr':
                self.row = []
            elif self.row is not None and tag in ('td', 'th'):
                self.cell = []

        def handle_data(self, data):
            if self.cell is not None:
                self.cell.append(data)

        def handle_endtag(self, tag):
            if tag in ('td', 'th') and self.cell is not None:
                self.row.append(' '.join(''.join(self.cell).split()))
                self.cell = None
            elif tag == 'tr' and self.row is not None:
                self.rows.append(self.row)
                self.row = None
            elif tag == 'table' and self.rows is not None:
                self.tables.append(self.rows)
                self.rows = None

    visible = VisibleTable(marked(dp_page, bridges.PANEL_START, bridges.PANEL_END))
    expected_rows = [['t', 'A', 'B', 'C']]
    for steps in range(4):
        records = cartesian_walks(sensor_triangle(), 'A', steps)
        values = [min((cost for path, cost in records if path[-1] == target), default=float('inf')) for target in 'ABC']
        expected_rows.append([str(steps)] + ['∞' if value == float('inf') else str(value) for value in values])
    assert visible.tables == [expected_rows], 'The displayed HTML DP table must match independently enumerated exact-length minima'
    return cases + 3


def check_displayed_covers(page):
    namespace = displayed_namespace(page, 14)
    verify_cover, find_cover = namespace['verify_cover'], namespace['find_cover']
    cases = 0
    for n in range(6):
        vertices = list('ABCDE'[:n])
        pairs = list(combinations(vertices, 2))
        universe = (1 << n) - 1
        for edge_mask in range(1 << len(pairs)):
            edges = [(u, v, (-2, 0, 3)[bit % 3]) for bit, (u, v) in enumerate(pairs)
                     if edge_mask & (1 << bit)]
            independent = independent_vertex_masks(vertices, edges)
            alpha = max(mask.bit_count() for mask in independent)
            minimum = n - alpha
            verdicts = {}
            for mask in range(1 << n):
                candidate = [vertex for bit, vertex in enumerate(vertices) if mask & (1 << bit)]
                # This checks the complementary induced subgraph, rather than
                # repeating the visible verifier's per-edge endpoint rule.
                covers = (universe ^ mask) in independent
                for budget in range(n + 3):
                    actual = verify_cover(vertices, edges, candidate, budget)
                    expected = covers and mask.bit_count() <= budget
                    assert actual is expected, f'Cover certificate: V={vertices}, E={edges}, candidate={candidate}, k={budget}'
                    verdicts[mask, budget] = actual
                    cases += 1

            # Independent-set certificates and their complementary covers
            # preserve both the same graph and the n-q budget conversion.
            for mask in range(1 << n):
                for q in range(n + 1):
                    assert verdicts[universe ^ mask, n-q] is (mask in independent and mask.bit_count() >= q), 'Independent Set to Vertex Cover certificate/budget equivalence'
            found = {}
            for budget in range(n + 3):
                result = find_cover(vertices, edges, budget)
                found[budget] = result
                assert (result is not None) == (budget >= minimum), 'Cover search YES/NO matches exhaustive independent-set optimum'
                if result is not None:
                    assert isinstance(result, list) and len(result) == len(set(result)), 'A cover witness is a list without repeated vertices'
                    assert set(result) <= set(vertices) and len(result) <= budget, 'Returned witness uses declared vertices within budget'
                    result_mask = sum(1 << vertices.index(vertex) for vertex in result)
                    assert (universe ^ result_mask) in independent, 'Returned witness has an edgeless complementary induced subgraph'
                if not edges:
                    assert result == [], 'The empty witness is valid for an edgeless graph and must differ from None'
                cases += 1
            for q in range(n + 1):
                assert (found[n-q] is not None) == (alpha >= q), 'Independent-set size at least q iff cover size at most V-q'
            for candidate in [['unknown'], ['unknown', 'unknown'], [1]] + ([['A', 'A'], ['A', 'unknown'], ['A', 1]] if n else []):
                assert verify_cover(vertices, edges, candidate, n+2) is False, 'Duplicate, unknown or non-string certificate members must be rejected'
                cases += 1
            for budget in (-1, True, 1.0):
                assert verify_cover(vertices, edges, [], budget) is False, 'Verifier rejects negative, boolean and float budgets'
                try:
                    find_cover(vertices, edges, budget)
                except ValueError:
                    pass
                else:
                    raise AssertionError('Search must raise ValueError for invalid budget')
                cases += 2

    triangle = [('A', 'B', 2), ('B', 'C', 2), ('A', 'C', 3)]
    vertices = list('ABC')
    assert verify_cover(vertices, triangle, vertices, 3) is True, 'A valid certificate need not be optimal'
    assert minimum_cover_size(vertices, triangle) == 2, 'Triangle minimum sensor count is two'
    assert verify_cover(vertices, triangle, ['A'], 2) is False and find_cover(vertices, triangle, 2) is not None, 'One failed certificate does not make the instance NO'
    assert all(verify_cover(vertices, triangle, candidate, 1) is False
               for candidate in ([], ['A'], ['B'], ['C'])), 'Triangle k=1 is NO only after all permitted candidates fail'
    for weights in [(0, 0, 0), (-10, 5, 100), (2, 2, 3)]:
        edges = [(u, v, weight) for (u, v, _), weight in zip(triangle, weights)]
        for budget in range(4):
            result = find_cover(vertices, edges, budget)
            assert (result is not None) == (budget >= 2), 'Vertex cover ignores retained network weights'
            cases += 1
    return cases + 4


def check_original_content(current, head):
    for week in PAGES:
        original, revised = bridges.strip(head[week]), bridges.strip(current[week])
        if week in FRESH_WEEKS:
            # Only the archive label is additive; relative paths were relocated
            # in the reference reader below before this exact-byte comparison.
            revised = re.sub(r'<p class="ek-banner"[^>]*>.*?</p>', '', revised, count=1, flags=re.S)
        if week in range(4, 15):
            # The existing deck script gains only a cache key for hash routing.
            deck_script = 'recap/recap.js' if week == 4 else 'examples/lesson.js'
            old = f'<script defer src="{deck_script}"></script>'
            new = f'<script defer src="{deck_script}?v=2"></script>'
            assert original.count(old) + original.count(new) == 1, f'Week {week}: expected original deck script'
            assert revised.count(new) == 1, f'Week {week}: expected cache-versioned deck script'
            original = original.replace(old, new, 1)
        if week in range(6, 15):
            # Footer-aware viewport handling changes only the visual script;
            # permit its explicit cache refresh while preserving all lesson bytes.
            visual_scripts = [f'<script defer src="examples/visuals.js{suffix}"></script>'
                              for suffix in ('', '?v=20261017', '?v=3')]
            new = visual_scripts[-1]
            assert sum(original.count(tag) for tag in visual_scripts) == 1, f'Week {week}: expected original visual script'
            assert revised.count(new) == 1, f'Week {week}: expected refreshed visual script'
            for old in visual_scripts:
                original = original.replace(old, new, 1)
        assert revised.encode('utf-8') == original.encode('utf-8'), f'Week {week}: original lesson bytes changed versus HEAD'
        before, after = Document(original), Document(revised)
        assert before.ids == after.ids, f'Week {week}: original ID inventory changed'
        assert before.headings == after.headings, f'Week {week}: original headings changed'
        for url in before.urls:
            parsed = urlsplit(url)
            if not parsed.scheme and not parsed.netloc and Path(parsed.path).name == 'cards.js':
                card_path = ((ROOT / PAGES[week]).parent / unquote(parsed.path)).resolve()
                relative = card_path.relative_to(ROOT).as_posix()
                original_cards = subprocess.check_output(['git', 'show', f'HEAD:{relative}'], cwd=ROOT)
                if week == 4 and 2 in FRESH_WEEKS:
                    # These three references still open the same historical
                    # W2 material after its complete page moves to the archive.
                    original_cards = original_cards.replace(
                        b'"ref": "../w2/#', b'"ref": "../w2/ek-notlar/#')
                assert card_path.read_bytes() == original_cards, f'Week {week}: original card questions/data changed'
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


def reference_source(week, path):
    if week in FRESH_WEEKS:
        # Pin the last reviewed complete lesson, so preservation remains
        # meaningful after the fresh lesson itself is eventually committed.
        source = subprocess.check_output(
            ['git', 'show', f'{LEGACY_BASELINES[week]}:aa/w{week}/index.html'], cwd=ROOT,
        ).decode('utf-8')
        source = source.replace('href="../', 'href="../../').replace('src="../', 'src="../../')
        return re.sub(rf'href="\.\./\.\./w{week}/#(skiena-[^"]+)"', r'href="#\1"', source)
    return subprocess.check_output(['git', 'show', f'HEAD:{path}'], cwd=ROOT).decode('utf-8')


def main():
    current = {week: (ROOT / path).read_bytes().decode('utf-8') for week, path in PAGES.items()}
    head = {week: reference_source(week, path) for week, path in PAGES.items()}
    check_original_content(current, head)
    print('PASS preservation: all original lesson bytes, IDs, headings, questions and card data match their reviewed reference (archived authored weeks use pinned baselines; other pages use HEAD; only deck/visual cache keys and the three historical W2 card references are normalized).')
    for name, sources in [('current', current), ('reference', head)]:
        rendered, links = check_sources(sources, published=name == 'current')
        check_displayed_search(rendered[(ROOT / PAGES[1]).resolve()])
        check_displayed_insertion(rendered[(ROOT / PAGES[4]).resolve()])
        graph_cases = check_displayed_graphs(rendered[(ROOT / PAGES[8]).resolve()], rendered[(ROOT / PAGES[9]).resolve()])
        network_cases = check_displayed_networks(rendered[(ROOT / PAGES[10]).resolve()], rendered[(ROOT / PAGES[11]).resolve()])
        walk_cases = check_displayed_walks(rendered[(ROOT / PAGES[12]).resolve()], rendered[(ROOT / PAGES[13]).resolve()])
        cover_cases = check_displayed_covers(rendered[(ROOT / PAGES[14]).resolve()])
        print(f'PASS {name}: fifteen pages; idempotent additions; unique IDs; exact four learning problems; {links} new URL references checked (local targets/anchors and the permitted official citation); guided answers and visible Python search/insertion/BFS/DFS/MST/Dijkstra/exact-walk/cover programs verified (231 insertion boundaries, {graph_cases:,} graph cases, {network_cases:,} weighted-network cases, {walk_cases:,} exact-walk/DP cases, {cover_cases:,} cover/certificate cases).')

    check_math()
    for week in (-1, 15, 16):
        assert bridges.apply(current[1], week) == current[1], f'Unsupported week {week} changed'
    print('PASS math: loop counts for n=0..1000; triangular and polynomial Theta witnesses; unsupported weeks unchanged.')


if __name__ == '__main__':
    main()
