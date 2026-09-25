"""Extra algorithm-analysis animations for the redesigned weeks (assets/anim-aa.js).

ANIMATIONS_EXTRA = {week: [(slug, title, html, assets_html), ...]}
The coordinator appends these to the week's animation drawer and de-duplicates assets.
"""

ASSETS = '<link rel="stylesheet" href="../assets/anim-aa.css"><script defer src="../assets/anim-aa.js?v=1"></script>'


def _item(slug, title):
    return (slug, title, f'<div class="widget anim" data-anim="{slug}"></div>', ASSETS)


ANIMATIONS_EXTRA = {
    2: [_item('aa-growth', 'compare lg n, n, n lg n, n² and 2ⁿ for n = 1…64 and find where 2ⁿ overtakes c·n²')],
    3: [_item('aa-nested', 'fill the triangular nested loop cell by cell and check n(n+1)/2')],
    4: [_item('aa-array-insert', 'insert at the front: count the moves in a packed array against a linked list')],
    5: [_item('aa-hash-probe', 'hash keys into m slots with linear probing, then look up a present and an absent key')],
    6: [_item('aa-heap', 'insert into a min-heap and extract the minimum, tree and array side by side')],
    7: [_item('aa-recursion-tree', 'draw the recursion tree of T(n) = a·T(n/b) + n^d and read off the master-theorem case')],
    8: [_item('aa-bfs-grid', 'breadth-first search on a grid: frontier by level, distance labels, path back via parents')],
    10: [_item('aa-kruskal', "Kruskal's algorithm with union-find sets shown as colours")],
    11: [_item('aa-dijkstra-grid', 'Dijkstra on a grid with terrain costs: priority queue and relaxations')],
    13: [_item('aa-dp-edit', 'fill the edit-distance table cell by cell for two short words')],
}
