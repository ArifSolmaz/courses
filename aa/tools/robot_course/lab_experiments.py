"""Short experiments students can append to the starter in the browser."""

EXPERIMENTS = [
    '''
n = 100
last_hit = [30] * (n - 1) + [19]
assert first_unsafe(last_hit, 20) == n - 1
assert first_unsafe([20, 19], 20) == 1
measure("last hit", lambda: first_unsafe(last_hit, 20))
''',
    '''
def unordered_pairs(values):
    checks = matches = 0
    for i, left in enumerate(values):
        for j in range(i + 1, len(values)):
            matches += left == values[j]
            checks += 1
    return checks, matches

assert unordered_pairs([8, 3, 8, 5]) == (6, 1)
for n in (200, 400):
    values = list(range(n))
    print(n, "->", unordered_pairs(values))
    measure("unordered pairs", lambda: unordered_pairs(values), repeats=2)
''',
    '''
values = [120, 220, 220, 450, 720]
for key, expected in [(220, 1), (221, 3), (900, 5)]:
    assert scan_bound(values, key) == lower_bound(values, key) == expected
    print(key, "->", expected)
assert lower_bound([], 220) == 0
''',
    '''
for n in (1, 1024):
    shift_buffer = list(range(n))
    ring_buffer = list(range(n))
    measure(f"{n}: shift", lambda: shift_cycle(shift_buffer))
    measure(f"{n}: ring", ring_job(ring_buffer))
''',
    '''
values = [0, 2, 4, 8]
table = {value: value for value in values}
for key in (0, 5, 8, 9):
    result = exact_lookup(values, key)
    assert result == table.get(key)
    print(key, "->", result)
''',
    '''
ordered = list(range(11))
cases = [("ordered", ordered), ("reversed", ordered[::-1]), ("duplicates", [5] * 11)]
for label, window in cases:
    assert insertion_median(window) == sorted_median(window)
    measure(label, lambda: insertion_median(window))
''',
    '''
from heapq import heapify, heappop

timers = [(3, 1), (7, 2), (5, 3), (3, 4)]
heapify(timers)
order = []
while timers:
    order.append(heappop(timers))
assert order == [(3, 1), (3, 4), (5, 3), (7, 2)]
print(order)
''',
    '''
open_route = ("S#..", ".#G.", "....")
blocked_route = ("S#..", ".#G.", ".#..")
for grid in (open_route, blocked_route):
    print(bfs(grid, (0, 0), (1, 2)))
assert bfs(open_route, (0, 0), (1, 2))[0] == 5
assert bfs(blocked_route, (0, 0), (1, 2))[0] is None
assert bfs(open_route, (0, 0), (0, 0))[0] == 0
''',
    '''
for c in (1, 2, 3, 9):
    grid = ("S" + str(c) * 3 + "G", ".###.", ".....")
    steps_route = bfs(grid, (0, 0), (0, 4))
    energy_route = weighted(grid, (0, 0), (0, 4), zero)
    assert energy_route[1] == min(3 * c + 1, 8)
    print(c, "->", steps_route[:2], energy_route[:2])
''',
    '''
grid = ("S11G", "0000")
start, goal = (0, 0), (0, 3)
for heuristic in (manhattan, zero):
    print(heuristic.__name__, weighted(grid, start, goal, heuristic))
assert weighted(grid, start, goal, manhattan)[1] == 3
assert weighted(grid, start, goal, zero)[1] == 1
''',
    '''
graph = [[2, 3], [3], [3], [], []]
order = topological(graph)
assert sorted(order) == list(range(len(graph)))
position = {task: i for i, task in enumerate(order)}
assert all(position[a] < position[b] for a, edges in enumerate(graph) for b in edges)
print(order)
graph[3].append(0)
assert topological(graph) is None
''',
    '''
links = [(1, 0, 1), (3, 0, 2), (2, 1, 2), (4, 1, 3), (1, 2, 3)]
assert kruskal(4, links) == (3, 4, 1)
without_cd = [link for link in links if link[1:] != (2, 3)]
assert kruskal(4, without_cd) == (3, 7, 1)
without_d = [link for link in links if 3 not in link[1:]]
assert kruskal(4, without_d) == (2, 3, 2)
print(kruskal(4, links), kruskal(4, without_cd), kruskal(4, without_d))
''',
    '''
grid = [[0, 2, 3, 1, 4], [1, 2, 2, 2, 1], [4, 1, 1, 1, 1]]
recursive = recursive_cost(grid)
table = table_cost(grid)
assert recursive[0] == table[0]
assert table[1] == 15
print(recursive, table)
''',
    '''
points = [(0, 0), (4, 0), (4, 3), (0, 3)]
crossed = [0, 2, 1, 3, 0]
better = two_opt(points, crossed)
assert length(points, crossed) == 16
assert length(points, better) == 14
assert length(points, exact(points)) == 14
print(crossed, "->", better)
''',
]
