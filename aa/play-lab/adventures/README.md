# Adventure Worlds

Four additional play-first campaigns, each with four progressively introduced missions. Access from each practice game's Adventure link, or use the world tabs here. Factory Rush is a separate six-mission campaign.

- Robot: shortest Manhattan round trip, more stops, pickup-before-delivery constraint, seeded maps. Nearest-first is a comparison, not an optimal solver. Merely passing through a station is not service; the selected stop order determines pickup/delivery.
- Commands: queue execution, stack/reversed execution, walls, key collection, then six repeating wall/mirroring variants. The robot must finish at the exit with the key if present. Stars require the BFS-derived shortest move budget. Reaching the right final square alone is insufficient when the key is missing.
- Depot: linear-probing insertion order, fixed-order deletion failure, unbalanced BST construction, then alternating collision-heavy vs collision-free datasets for structure selection. The target is the smallest worst successful-search cost among allowed structures/orders; it is not general asymptotic complexity. No tree deletion is taught here.
- Sorting: plan one lane or a contiguous split, pick selection/insertion per lane, then merge. Energy = comparisons + writeWeight * array writes. Swap = 2 writes; temporary storage is not charged. The merge writes each output value once. Targets are exact minima over supported plans, not universal algorithm lower bounds. New contracts vary values and write weight.

All four retain short Turkish introductions, optional hints, local stars, same-case attempt comparisons and free retries. Case changes reset attempt history. Existing practice games and the shared Factory Rush Classic leaderboard remain available. Adventure scores are local only.

Validation: model.test.cjs covers all world levels, 48 seeded route/grid/sort cases, all candidate sort plans, exhaustive depot insertion plans, known route/sort results, invalid plans, stack reversal, obstacles and broken deletion. All 16 stages were completed through browser interactions; failed wall/deletion/sort choices were also exercised. Desktop screenshots and 390px sorting/grid previews were inspected.
