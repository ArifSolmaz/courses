# Algorithm-analysis toolkit

This toolkit is the spine of the course. Weekly pages teach the ideas in context; this page collects the habits students should carry from one week to the next. Use it when a student can run code but cannot yet explain what the run proves, or when a solution gives a Big-O label without showing where the repeated work comes from.

The toolkit has one rule: write the claim in a way another person can check. "This is fast" is not checkable. "For a missing target in a list of length n, this loop performs n equality checks and stores O(1) extra variables" is checkable. It names the input size, the case, the counted operation, and the storage convention.

**Turkce:** Bu sayfa haftalik notlarin yerine gecmez. Her hafta o haftanin ornegini cozer; bu sayfa ise ayni dusunme kalibini tekrar kullanman icindir. Bir sembol yazmadan once neyi saydigini ve hangi girdi icin saydigini soyle.

## The analysis contract

Every complete algorithm-analysis answer starts by fixing the contract. The contract says what input is allowed, what output is required, and which differences matter. Without it, two programs can look comparable while answering different questions.

| Contract question | Weak answer | Strong answer |
| --- | --- | --- |
| What is the input? | a list | a list of n integer sensor readings |
| What is the output? | the value | whether at least one reading exceeds the threshold |
| Are duplicates meaningful? | maybe | duplicates are separate readings and must not be collapsed |
| Is order meaningful? | not sure | the output must preserve first occurrence order |
| What cases matter? | normal data | empty input, missing target, repeated values, first and last position hits |

Do this before timing. A set may answer a membership question quickly, but it does not preserve duplicates or sorted order. Sorting may help binary search, but it changes order and must be paid for unless the data was already sorted for a separate reason. A benchmark is useful only after both methods satisfy the same contract.

## Cost models used in this course

A cost model decides what one counted operation means. It is a simplified lens, not the physical truth of a laptop. In this course, the model is usually chosen to reveal the main repeated work:

| Situation | Useful counted operation | Usual reason |
| --- | --- | --- |
| Linear search | equality comparisons | each inspected item is compared with the target |
| Largest-value scan | comparisons after initialization | first item initializes, later items challenge the current best |
| Nested pair checks | pair visits or comparisons | every selected pair is examined |
| Front insertion or removal | shifted references | existing list slots move to make or close a gap |
| List concatenation or slicing | copied references | a new list is built |
| Dictionary or set lookup | hash-table probes in an average model | expected constant lookup under ordinary hashing assumptions |
| Binary search | middle-item inspections | the remaining interval is reduced after each inspection |

If comparing long strings, large records, or expensive function calls, the "one comparison" model may hide another size. Then define a second variable. For example, searching n strings of length at most L can require O(nL) character work in a worst case, even though the list-level scan has n comparisons.

**Turkce:** Model secmek gercegi saklamak degil, hangi soruyu cevapladigini soylemektir. "Karsilastirma sayiyorum" dediginde her karsilastirmanin sabit kabul edildigini de soylemis olursun. Bu kabul uygun degilse ikinci bir buyukluk tanimla.

## Trace tables that actually diagnose mistakes

A trace is not a decorative table after the answer. It is a debugging tool. A useful trace shows the state before and after the repeated action. Keep the input tiny enough that every row can be checked by eye.

| Column | Why it helps |
| --- | --- |
| iteration or visit number | separates human counting from zero-based indexes |
| index or bounds | exposes off-by-one errors and missing final candidates |
| current value | shows what data the algorithm actually inspected |
| decision | records the condition result, not only the action |
| stored state afterward | checks the invariant after this step |
| count so far | prevents adding skipped work after a break |

For a loop with `break`, stop the table immediately when the break occurs. For binary search, write the low and high bounds before choosing the midpoint, then write the new bounds after the comparison. For list building, record the length of the answer after each update. If a trace table is too large, the input is too large for learning.

## From exact counts to growth

Exact counts and growth classes answer different questions. Exact counts are useful at a stated n. Growth classes describe what eventually dominates as n grows. A strong answer often gives both:

```text
C(n) = 0 + 1 + 2 + ... + (n - 1)
     = n(n - 1)/2
     = (n^2 - n)/2
Therefore C(n) is Theta(n^2).
```

The equality belongs to the exact model. The Theta statement belongs to the growth summary. Do not replace the exact expression with n squared when a problem asks for the exact count. Do not use a small numerical table as a proof of the asymptotic statement. Three rows can suggest a pattern; the loop structure or inequality justifies it.

## Proof recipes students can reuse

For a polynomial upper bound, make lower powers no bigger than the highest power once n is at least one. Example: if T(n) = 4n^2 + 7n + 9, then for n >= 1, n <= n^2 and 1 <= n^2. Therefore T(n) <= 4n^2 + 7n^2 + 9n^2 = 20n^2. One valid constant is enough.

For a triangular loop, draw the first few row lengths. If the lengths are 0, 1, 2, ..., n - 1, the total is n(n - 1)/2. If they are n, n - 1, ..., 1, the total is n(n + 1)/2. Check whether the first row is zero or n before choosing the formula.

For a halving loop, write the remaining size after k reductions. If it is roughly n / 2^k, solve n / 2^k <= 1. That gives k at least log2 n. Then decide whether the algorithm also inspects a final candidate. Halving rounds and comparisons are related, but not always the same exact count.

For preparation, separate the build phase from the query phase. A set built once for q membership questions has a different total from a set rebuilt inside every query. The phrase "lookup is O(1)" is incomplete until preparation, memory, and the output contract are named.

## Benchmark protocol

Measurements should support an explanation, not replace it. A fair benchmark states the timed boundary, the input generator, the sizes, the repeats, and the summary statistic. It also checks that both methods return the same required output.

Use at least four input sizes when the purpose is growth. Doubling sizes make ratios easy to read. If timings are too small, time a batch of calls or increase n carefully. Do not divide by a rounded zero. If setup is part of the algorithm, include it in the timed function; if you intentionally exclude setup, label the result as query-only and report setup separately.

| Report item | What to write |
| --- | --- |
| Environment | Python version or Colab/local, and any relevant hardware note |
| Input sizes | the exact n values and any second size such as m or q |
| Data pattern | random, sorted, reverse sorted, repeated, missing target, or generated rule |
| Repeats | how many timings and whether you used min, median, or mean |
| Correctness check | the expected answer or assertion used before comparing speed |
| Limit | what the benchmark does not establish |

The fastest method in a table is not automatically the best method for every task. Memory, update cost, sortedness, duplicate preservation, and readability can change the recommendation.

## Common traps

The most common mistakes are predictable, which is good news: they can be checked systematically.

| Trap | Repair question |
| --- | --- |
| Big-O label with no n | What does n count in this problem? |
| Two loops automatically called quadratic | Are the loops sequential or nested? What are their bounds? |
| Hidden operation ignored | Does `in`, slicing, sorting, concatenation, or front insertion do input-sized work? |
| Average case asserted casually | What distribution or hashing assumption is being used? |
| Preparation omitted | Is data structure construction outside or inside the repeated task? |
| Faster but different output | Were order, duplicates, formatting, and edge cases preserved? |
| Timing treated as proof | What operation-count argument supports the measurement? |

**Turkce:** Cevabi guclendiren sey uzunluk degil, eksik halka birakmamaktir. Girdi buyuklugunu tanimla, sayilan islemi soyle, durumunu belirt, toplam maliyeti yaz, sonra buyume sinifini ver. Olcum varsa neyi kapsadigini ve neyi kapsamadigini acikla.

## Instructor use

Use this page as the repair station. If a student is lost in syntax, return to Weeks 2-4. If they can run code but cannot count work, use the trace-table section. If they can count examples but not generalize, use the proof recipes. If they trust a timing table too much, use the benchmark protocol.

The course should feel slower than a typical algorithms course at the beginning and more demanding by the end. That is intentional. The early weeks remove programming fog; the later weeks insist on precise contracts, cost models, and evidence. The final goal is not to recite asymptotic labels. It is to defend a correct choice under stated assumptions.
