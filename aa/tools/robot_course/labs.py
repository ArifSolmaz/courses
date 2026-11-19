"""Runnable standard-library Python for each timing lab."""

BENCH = '''
from statistics import median
from timeit import repeat


def measure(label, job, repeats=200):
    samples = repeat(job, repeat=5, number=repeats)
    typical = median(samples) * 1000 / repeats
    longest = max(samples) * 1000 / repeats
    print(f"{label:18}  {typical:.6f} ms  {longest:.6f} ms")
'''

BINARY = '''
def lower_bound(values, key):
    lo, hi = 0, len(values)
    while lo < hi:
        mid = (lo + hi) // 2
        if values[mid] < key:
            lo = mid + 1
        else:
            hi = mid
    return lo
'''

PLANNER = '''
from collections import deque
from heapq import heappop, heappush

DIRECTIONS = [(-1, 0), (0, 1), (1, 0), (0, -1)]


def neighbors(grid, cell):
    row, col = cell
    for dr, dc in DIRECTIONS:
        r, c = row + dr, col + dc
        if 0 <= r < len(grid) and 0 <= c < len(grid[r]) and grid[r][c] != "#":
            yield r, c


def entry_cost(grid, cell):
    row, col = cell
    symbol = grid[row][col]
    return int(symbol) if symbol.isdigit() else 1


def result(grid, parents, goal, popped):
    path = [goal]
    while parents[path[-1]] is not None:
        path.append(parents[path[-1]])
    path.reverse()
    return len(path) - 1, sum(entry_cost(grid, cell) for cell in path[1:]), popped, path
'''

BFS = '''
def bfs(grid, start, goal):
    queue = deque([start])
    parents = {start: None}
    popped = 0
    while queue:
        cell = queue.popleft()
        popped += 1
        if cell == goal:
            return result(grid, parents, goal, popped)
        for neighbor in neighbors(grid, cell):
            if neighbor not in parents:
                parents[neighbor] = cell
                queue.append(neighbor)
    return None, None, popped, []
'''

WEIGHTED = '''
def weighted(grid, start, goal, heuristic):
    frontier = [(heuristic(start, goal), start, 0)]
    costs = {start: 0}
    parents = {start: None}
    popped = 0
    while frontier:
        _, cell, cost = heappop(frontier)
        if cost != costs[cell]:
            continue
        popped += 1
        if cell == goal:
            return result(grid, parents, goal, popped)
        for neighbor in neighbors(grid, cell):
            candidate = cost + entry_cost(grid, neighbor)
            if candidate < costs.get(neighbor, float("inf")):
                costs[neighbor] = candidate
                parents[neighbor] = cell
                priority = candidate + heuristic(neighbor, goal)
                heappush(frontier, (priority, neighbor, candidate))
    return None, None, popped, []


def zero(cell, goal):
    return 0
'''

MANHATTAN = '''
def manhattan(cell, goal):
    return abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])
'''

SHARED_MAP = ("S999G", ".###.", ".....")
MAP_CASES = f'''
maps = [
    ({SHARED_MAP!r}, (0, 0), (0, 4)),
    (["." * 25] * 25, (12, 12), (12, 18)),
]
'''

PLAN_RUN = '''
for grid, start, goal in maps:
    for name, planner in planners:
        def job():
            return planner(grid, start, goal)

        moves, cost, popped, path = job()
        print(name, "-> (moves, terrain cost, popped):", (moves, cost, popped))
        print("Path:", path)
        measure(name, job, repeats=30)
'''

LABS = [
'''
def first_unsafe(readings, threshold):
    for position, reading in enumerate(readings):
        if reading < threshold:
            return position
    return None


for n in (100, 1000):
    first_hit = [19] + [30] * (n - 1)
    no_hit = [30] * n
    measure(f"{n}: first hit", lambda: first_unsafe(first_hit, 20))
    measure(f"{n}: no hit", lambda: first_unsafe(no_hit, 20))
''',
'''
def scan(values):
    for value in values:
        if value < 0:
            return True
    return False


def merge_sort(values):
    if len(values) < 2:
        return values
    mid = len(values) // 2
    left = merge_sort(values[:mid])
    right = merge_sort(values[mid:])
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    return merged + left[i:] + right[j:]


def compare_pairs(values):
    matches = 0
    for a in values:
        for b in values:
            matches += a == b
    return matches


for n in (100, 1000):
    values = list(range(n, 0, -1))
    measure(f"{n}: scan", lambda: scan(values))
    measure(f"{n}: merge", lambda: merge_sort(values), repeats=20)
    measure(f"{n}: pairs", lambda: compare_pairs(values), repeats=2)
''',
BINARY + '''
def scan_bound(values, key):
    for index, value in enumerate(values):
        if value >= key:
            return index
    return len(values)


for n in (100, 1000):
    values = list(range(n))
    for key in (n, 0):
        assert scan_bound(values, key) == lower_bound(values, key)
        measure(f"{n}/{key}: scan", lambda: scan_bound(values, key))
        measure(f"{n}/{key}: binary", lambda: lower_bound(values, key))
''',
'''
def shift_cycle(buffer):
    buffer.append(buffer.pop(0))


def ring_cycle(buffer, head):
    value = buffer[head]
    buffer[head] = value
    return (head + 1) % len(buffer)


def ring_job(buffer):
    head = 0

    def step():
        nonlocal head
        head = ring_cycle(buffer, head)
    return step


for n in (128, 8192):
    shift_buffer = list(range(n))
    ring_buffer = list(range(n))
    measure(f"{n}: shift", lambda: shift_cycle(shift_buffer))
    measure(f"{n}: ring", ring_job(ring_buffer))
''',
BINARY + '''
def exact_lookup(values, key):
    index = lower_bound(values, key)
    if index < len(values) and values[index] == key:
        return values[index]
    return None


for n in (100, 1000):
    values = list(range(n))
    table = {value: value for value in values}
    keys = [n // 2, n]

    def binary_queries():
        return [exact_lookup(values, key) for key in keys]

    def hash_queries():
        return [table.get(key) for key in keys]

    assert binary_queries() == hash_queries()
    measure(f"{n}: binary pair", binary_queries)
    measure(f"{n}: hash pair", hash_queries)
''',
'''
def insertion_median(window):
    values = window.copy()
    for i in range(1, len(values)):
        key = values[i]
        j = i
        while j > 0 and values[j - 1] > key:
            values[j] = values[j - 1]
            j -= 1
        values[j] = key
    return values[len(values) // 2]


def sorted_median(window):
    return sorted(window)[len(window) // 2]


for n in (5, 31):
    window = [(13 * i + 11) % 47 for i in range(n)]
    window[1] = 200
    print(n, "->", insertion_median(window))
    assert insertion_median(window) == sorted_median(window)
    measure(f"{n}: insertion", lambda: insertion_median(window))
    measure(f"{n}: sorted", lambda: sorted_median(window))
''',
'''
from heapq import heapify, heapreplace


def list_job(timers):
    index = min(range(len(timers)), key=timers.__getitem__)
    release, sequence = timers[index]
    timers[index] = release + len(timers), sequence


def heap_job(timers):
    release, sequence = timers[0]
    heapreplace(timers, (release + len(timers), sequence))


for n in (32, 512):
    timers = [(i, i) for i in range(n)]
    heap = timers.copy()
    heapify(heap)
    measure(f"{n}: list", lambda: list_job(timers))
    measure(f"{n}: heap", lambda: heap_job(heap))
    assert min(timers) == heap[0]
''',
PLANNER + BFS + MAP_CASES + '\nplanners = [("BFS", bfs)]\n' + PLAN_RUN,
PLANNER + BFS + WEIGHTED + MAP_CASES + '''
planners = [("BFS", bfs), ("Dijkstra", lambda grid, s, g: weighted(grid, s, g, zero))]
''' + PLAN_RUN,
PLANNER + WEIGHTED + MANHATTAN + MAP_CASES + '''
planners = [
    ("Dijkstra", lambda grid, s, g: weighted(grid, s, g, zero)),
    ("A*", lambda grid, s, g: weighted(grid, s, g, manhattan)),
]
''' + PLAN_RUN,
'''
def topological(graph):
    state = [0] * len(graph)
    finish = []

    def visit(task):
        if state[task] == 1:
            return False
        if state[task] == 2:
            return True
        state[task] = 1
        for dependent in graph[task]:
            if not visit(dependent):
                return False
        state[task] = 2
        finish.append(task)
        return True

    for task in range(len(graph)):
        if not visit(task):
            return None
    return finish[::-1]


for n in (20, 200):
    graph = [[i + 1] for i in range(n - 1)] + [[]]
    assert topological(graph) == list(range(n))
    measure(f"{n}: chain", lambda: topological(graph))
    graph[-1].append(0)
    assert topological(graph) is None
    measure(f"{n}: cycle", lambda: topological(graph))
''',
'''
def kruskal(n, links):
    parent = list(range(n))
    size = [1] * n

    def root(node):
        while node != parent[node]:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    total = accepted = 0
    for cost, a, b in sorted(links):
        left, right = root(a), root(b)
        if left == right:
            continue
        if size[left] < size[right]:
            left, right = right, left
        parent[right] = left
        size[left] += size[right]
        total += cost
        accepted += 1
    return accepted, total, n - accepted


for n in (20, 200):
    links = [(1 + i % 5, i, i + 1) for i in range(n - 1)]
    links += [(4 + i % 7, i, i + 2) for i in range(n - 2)]
    print(n, "-> (accepted, total, components):", kruskal(n, links))
    measure(f"{n}: Kruskal", lambda: kruskal(n, links))
    isolated = [(cost, a, b) for cost, a, b in links if n - 1 not in (a, b)]
    assert kruskal(n, isolated)[2] == 2
''',
'''
def recursive_cost(grid):
    calls = 0

    def cost(r, c):
        nonlocal calls
        calls += 1
        if r == c == 0:
            return 0
        above = cost(r - 1, c) if r else float("inf")
        left = cost(r, c - 1) if c else float("inf")
        return grid[r][c] + min(above, left)

    total = cost(len(grid) - 1, len(grid[0]) - 1)
    return total, calls


def table_cost(grid):
    width = len(grid[0])
    best = [[0] * width for _ in grid]
    for r, row in enumerate(grid):
        for c, entry in enumerate(row):
            if r == c == 0:
                continue
            above = best[r - 1][c] if r else float("inf")
            left = best[r][c - 1] if c else float("inf")
            best[r][c] = entry + min(above, left)
    return best[-1][-1], len(grid) * width


for n in (5, 9):
    grid = [[1 + (3 * r + 2 * c) % 9 for c in range(n)] for r in range(n)]
    slow, fast = recursive_cost(grid), table_cost(grid)
    assert slow[0] == fast[0]
    print(n, "-> (cost, recursive calls), (cost, table cells):", slow, fast)
    measure(f"{n}: recursion", lambda: recursive_cost(grid), repeats=3)
    measure(f"{n}: table", lambda: table_cost(grid))
''',
'''
from itertools import permutations
from math import dist


def length(points, route):
    return sum(dist(points[a], points[b]) for a, b in zip(route, route[1:]))


def nearest(points):
    remaining = set(range(1, len(points)))
    route = [0]
    while remaining:
        last = route[-1]
        next_stop = min(remaining, key=lambda i: (dist(points[last], points[i]), i))
        route.append(next_stop)
        remaining.remove(next_stop)
    return route + [0]


def two_opt(points, route):
    while True:
        best = route
        best_cost = length(points, route)
        for i in range(1, len(route) - 2):
            for j in range(i + 1, len(route) - 1):
                candidate = route[:i] + route[i:j + 1][::-1] + route[j + 1:]
                candidate_cost = length(points, candidate)
                if candidate_cost + 1e-9 < best_cost:
                    best, best_cost = candidate, candidate_cost
        if best is route:
            return route
        route = best


def exact(points):
    orders = ((0, *order, 0) for order in permutations(range(1, len(points))))
    return min(orders, key=lambda route: length(points, route))


stations = [(0, 0), (1, 2), (3, 1), (8, 0), (7, 7), (2, 5), (5, 4), (1, 7)]
for n in (6, 8):
    points = stations[:n]
    methods = [("nearest", nearest), ("2-opt", lambda p: two_opt(p, nearest(p))), ("exact", exact)]
    for name, method in methods:
        print(n, name, "->", round(length(points, method(points)), 3))
        measure(f"{n}: {name}", lambda: method(points), repeats=3)
''',
]


def lab_code(week):
    return BENCH.strip() + "\n\n" + LABS[week - 1].strip() + "\n"
