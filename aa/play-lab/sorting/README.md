# Sorting Arena

Static, dependency-free practice game, linked from Play Lab. No network requests, scores uploaded or persistent storage. Every key comparison requires a player choice; every placement requires a player action. Wrong choices show feedback and leave the algorithm state unchanged (apart from the separate mistake count).

Selection sort scans the remaining suffix, then swaps the minimum into place, skipping self-swaps. Insertion sort holds a key outside the array, shifts strictly larger elements, then writes the key into the gap. Equal values keep the earlier element during a comparison; this does NOT claim selection sort is stable.

Counters measure key comparisons and array-slot writes, not time or total CPU work. A selection swap is two array writes; holding a temporary value is excluded. Insertion counts its final placement even if the key did not move. Both use n−1 passes. Insertion’s ordered prefix is not yet fixed in final position; selection’s completed prefix is fixed.

Use `node aa/play-lab/sorting/model.test.cjs`. Tests exhaust 1,080 arrays including duplicates, verify both sorting methods and wrong-answer invariance, and check sorted/reverse comparison and write counts for lengths 3–8.

UI checks: complete both methods on [3,1,2]; wrong choice; duplicate and invalid custom input; laptop and narrow layout. Results compare only identical starting inputs; changing input clears the comparison. Restarting a tool retains its previous completed result until another completed run replaces it.
