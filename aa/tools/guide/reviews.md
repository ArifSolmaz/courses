# Four review sessions inside the 14 weeks

Each session uses the final **50 minutes, 02:10–03:00**, of an existing class. Both breaks remain. These are consolidation sessions with familiar ideas; students should not meet a new algorithm here. The timings below are a teaching plan, not an additional assessment. The answers make the plan usable for private revision as well.

Use the first ten minutes to retrieve without notes, twenty minutes for a shared worked example, ten minutes for a changed input, and ten minutes for an exit ticket and repair decision. Before revealing a solution, let each student make a prediction and explain one line to a partner.

**Türkçe:** Tekrarın amacı aynı slaytları yeniden göstermek değil, öğrencinin bir fikri kendi başına kullanıp kullanamadığını görmektir. Yanlış cevap, hangi köprüye dönmek gerektiğini söyler. Çözümleri okuduktan sonra sayıları değiştirerek yeniden dene.

## Review A

### Week 4: from reading Python to measuring work

**Source connection:** [Week 3](w3/index.html), loop counters and stopping; [Week 4](w4/index.html), lists and membership search. Next step: [Week 5](w5/index.html), place understood work inside a function.

**02:10–02:20 · Recall.** What does `range(3)` produce? What is the last valid index of a five-item list? What is the difference between `items[2]` and “find the value 2”? Explain the update `checks = checks + 1`.

**Recall answers:** The range produces 0, 1, 2. The last valid index is 4. `items[2]` reads a known position, the third item; searching for 2 compares values until a match or exhaustion. The counter update reads the old count and stores one more.

**02:20–02:40 · Shared example.** Search `[6, 2, 9, 2, 5]` for 9, stopping at the first match. Count equality checks, not printed lines.

| Visit | Index | Value | Compare with 9 | Checks so far | Action |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 6 | False | 1 | Continue |
| 2 | 1 | 2 | False | 2 | Continue |
| 3 | 2 | 9 | True | 3 | Stop; found at index 2 |

The answer is index 2, but the count is 3. These are different quantities. Counting starts with the first inspected item; indexing starts at zero. No fourth or fifth comparison occurs after stopping.

```python
items = [6, 2, 9, 2, 5]
target = 9
checks = 0
position = -1
for i in range(len(items)):
    checks = checks + 1
    if items[i] == target:
        position = i
        break
print(position, checks)
```

This prints `2 3`. The initial value −1 means “not found yet”; it is a reporting convention in this program. It does not mean Python has no negative indices. Do not use the returned −1 to index the list as though it were a successful result.

**Türkçe:** “İndeks 2” ile “2 karşılaştırma” aynı değildir. İndeks sıfırdan başlar, işlem sayacı sıfırdan artırılarak üçe ulaşır. Çıkışı bulduktan sonra döngünün geri kalanını saymıyoruz.

**02:40–02:50 · Variation and solution.** Predict the same two outputs for targets 6, 5, 7, and 2. Then consider an empty list.

| Input variation | Position returned | Equality checks | Why |
| --- | --- | --- | --- |
| Target 6 | 0 | 1 | First item matches |
| Target 5 | 4 | 5 | Fifth item matches |
| Target 7 | −1 | 5 | All five fail |
| Target 2 | 1 | 2 | Stop at the first occurrence |
| Empty list, any target | −1 | 0 | There is no item to inspect |

**02:50–03:00 · Exit and repair.** On `[8, 3, 4]`, target 4 is found at index 2 after three checks; target 1 is absent after three checks. Explain both results without running the code. If the index/count distinction is unclear, draw boxes labelled 0, 1, 2 and number the visits separately. If the stop is unclear, cross out every line execution after `break`. Revisit Week 3's trace before Week 5's opening ten minutes. Ready students can predict a last-position match on a six-item list and explain the new count: index 5, after six checks.

## Review B

### Week 6: from measured seconds to counted operations

**Source connection:** [Week 5](w5/index.html), timing known functions; [Week 6](w6/index.html), doubling and measurement noise. Next step: [Week 7](w7/index.html), write an explicit count T(n).

**02:10–02:20 · Recall.** If the start reading is 12.350 seconds and the end is 12.362 seconds, what elapsed time do we report? Why repeat the measurement? Does a function definition run its body?

**Recall answers:** Elapsed time = end − start = 0.012 seconds = 12 milliseconds. Repeats expose variation from system activity and other effects. A definition creates the function; the body runs when the function is called. An empty timing interval does not measure the function's work.

**02:20–02:40 · Shared example.** Compare a full scan with all ordered pairs, including pairs of an item with itself. Count body executions first.

| n | Scan visits n | Ordered-pair visits n × n | Scan ratio from previous row | Pair ratio from previous row |
| --- | --- | --- | --- | --- |
| 4 | 4 | 16 | — | — |
| 8 | 8 | 64 | 8/4 = 2 | 64/16 = 4 |
| 16 | 16 | 256 | 16/8 = 2 | 256/64 = 4 |

For n = 4, draw a 4-by-4 grid. Each outer-loop value owns a row; each inner-loop value selects one cell. There are four cells in each of four rows. Doubling n doubles both dimensions: eight rows of eight cells. This explains 64 without guessing from the appearance of the code.

Now consider these **illustrative timing values**, not actual benchmark results:

| n | Scan time, ms | Pair time, ms |
| --- | --- | --- |
| 100 | 1.2 | 2.0 |
| 200 | 2.3 | 7.8 |
| 400 | 4.7 | 31.0 |

Scan ratios are 2.3/1.2 ≈ 1.92 and 4.7/2.3 ≈ 2.04. Pair ratios are 7.8/2.0 = 3.9 and 31.0/7.8 ≈ 3.97. They are close to two and four. Exact operation counts and noisy timings support the same explanation here, but only the loop argument establishes those counts for every valid n.

**Türkçe:** Kareli kâğıt iç içe döngüyü görünür kılar: satır sayısı da sütun sayısı da ikiye katlanır. Süre tablosunda ise 4 yerine 3.9 görebiliriz. Bu, otomatik olarak hesabın yanlış olduğunu göstermez; ölçümde sabit işler ve değişken etkiler de vardır.

**02:40–02:50 · Variation and solution.** Suppose one scan of n items is followed by a second scan. At n = 4 the visits are 4 + 4 = 8; at n = 8 they are 8 + 8 = 16. The ratio is two. Two loops do not imply a square. If a reported time is 0.0 after rounding, do not divide by it: retain more precision or time a sufficiently large batch, accounting for the number of calls.

**02:50–03:00 · Exit and repair.** A measured time grows from 5 ms to 20 ms when n doubles. The ratio is 20/5 = 4, suggesting quadratic growth over those sizes. We still need more sizes and an explanation of the code. If a student treats 4 as seconds, redo Arithmetic Bridge 3. If they can calculate ratios but cannot explain the grid, redraw n = 3 and n = 6 before introducing T(n) in Week 7. Optional log–log interpretation can wait until the counts and ratios make sense.

## Review C

### Week 8: from a growth label to a justified comparison

**Source connection:** [Week 7](w7/index.html), exact counts and dominant terms; [Week 8](w8/index.html), bounds, cases, and space. Next step: [Week 9](w9/index.html), compare four ways to solve the same anagram problem.

**02:10–02:20 · Recall.** What is n? What operation are we counting? Is O(n²) a number of seconds? Does worst case mean “a slow computer”?

**Recall answers:** Define n from the input, commonly its item count. Specify an operation such as a comparison. Big-O describes an upper bound on growth, not exact elapsed time. Worst case chooses the most demanding input of a fixed size, under the stated algorithm and model.

**02:20–02:40 · Shared example.** Under a stated model, an algorithm has count T(n) = 2n² + 3n + 4. Compute T(2) = 8 + 6 + 4 = 18 and T(4) = 32 + 12 + 4 = 48. The ratio is 48/18 ≈ 2.67, not four. Lower-order terms still matter at these small sizes.

For n ≥ 1, n ≤ n² and 1 ≤ n². Therefore:

```text
2n² + 3n + 4 ≤ 2n² + 3n² + 4n² = 9n².
```

This supplies c = 9 and n₀ = 1 for an O(n²) bound. The expression is not equal to n². The constant 9 is a convenient upper multiplier, not the runtime or a count of loops.

Now compare a membership scan and a copied list. A scan that stores only a counter, current item, and result uses a fixed amount of auxiliary state: O(1). A function that builds another list of n items uses O(n) auxiliary storage, even if it has only one loop. Count extra memory separately from how often work is performed.

**Türkçe:** Küçük bir girdide oran dört çıkmadı diye O(n²) sonucu yanlış olmaz. Büyüme iddiası, büyük girdilerde geçerli bir üst sınırdır. Ayrıca zaman ve bellek aynı eksen değildir: tek döngü hem O(n) zamanda çalışıp hem O(n) yeni bellek üretebilir.

**02:40–02:50 · Variation and solution.** An early-stopping scan of n distinct items makes one comparison for a first-position match and n comparisons for an absent target. Best case is constant; worst case is linear. Both statements concern the same program and the same input size. A uniform successful target position gives average comparisons (1 + ... + n)/n = [n(n + 1)/2]/n = (n + 1)/2. This average requires the stated probability assumption; it is not automatically true for every real workload.

**02:50–03:00 · Exit and repair.** Explain why n² + 100n has O(n²) growth, while two consecutive full scans have O(n) growth. For n ≥ 1, n² + 100n ≤ 101n²; for the scans, n + n = 2n. State one counting assumption for each. If addition and nesting are confused, redo Arithmetic Bridge 5. If the inequality is unclear, replace n by 2 and 10 to see it, then return to Bridge 8's general argument. Use Week 9's opening ten minutes to check a repeated-letter anagram contract before comparing speed.

## Review D

### Week 11: from a container trick to a defensible choice

**Source connection:** [Week 10](w10/index.html), list membership and copying; [Week 11](w11/index.html), dictionaries, sets, and preparation. Next step: [Week 12](w12/index.html), choose a search strategy while accounting for sortedness.

**02:10–02:20 · Recall.** Does list membership know the target's index? Can a set preserve the count of repeated values by itself? Does O(1) average lookup mean every query always takes the same time?

**Recall answers:** Membership searches for a value; it is different from index access. A set stores distinct members, so duplicates collapse. Average O(1) hash lookup is a model-based expected/average statement with key and hashing assumptions; it is not a worst-case guarantee or a fixed number of seconds.

**02:20–02:40 · Shared example.** A fixed list has n = 1000 integer IDs. We will make q = 100 absent-ID queries. Each full scan makes 1000 equality checks, so all scans make 100 × 1000 = 100,000 checks. In an average unit-cost model, building one set then querying it costs O(n + q). Building a new set inside every query instead costs O(nq). Write “build once” on paper and place it visibly outside the query loop.

Then examine the output contract. For `left = [4, 4, 7]` and `right = [4, 9]`, the required result is the items from left that also appear in right, retaining left's order and repeated occurrences. The answer is `[4, 4]`.

```python
left = [4, 4, 7]
right = [4, 9]
right_lookup = set(right)
answer = []
for value in left:
    if value in right_lookup:
        answer.append(value)
print(answer)
```

This prints `[4, 4]`. Converting both inputs into sets and taking their intersection yields `{4}`, which answers a different question: which distinct values occur in both? Retain the original left list when the output needs its order and duplicates. Dictionaries preserve insertion order; sets do not provide a sorted sequence.

**Türkçe:** Veri yapısını değiştirirken sonucun anlamını koru. İki tane 4 çıktıda kalmalıysa küme kesişimi tek başına doğru çözüm değildir. Sağ tarafta aramayı hızlandırıp sol taraftaki sırayı ve tekrarları korumak mümkündür.

**02:40–02:50 · Variation and solution.** If there is only one query and the match is the first list item, a direct scan performs one check. Building a set processes the data first, so a faster lookup does not automatically give a faster end-to-end task. If there are many queries on changing data, count updates or rebuilds as well. If memory is constrained, the additional set is a material cost.

**02:50–03:00 · Exit and repair.** State a choice for: (a) one membership question on an existing small list, and (b) many membership questions on a fixed large list. A direct scan is a reasonable first candidate for (a); a reusable set is a strong candidate for (b) if the values are hashable and memory permits. Neither statement guarantees measured superiority on every machine. If preparation is omitted, redo Arithmetic Bridge 9. If duplicates disappear, trace the three-item example again. Week 12 starts by asking whether sorted data is already available and what must be paid if it is not.

# Cumulative revision and the final explanation

## Six moves to practise across the course

| Move | A useful practice question | What a complete answer contains |
| --- | --- | --- |
| Trace | What changes on each iteration? | Input, variable table, stopping point, output |
| Count | How often does the chosen operation happen? | Definition of n, bounds, case, sum or product |
| Classify | How does the count grow? | Simplified growth with a reason and assumptions |
| Compare | Which method fits this workload? | Same output contract, preparation, repeated work, memory |
| Interpret | What does this table or graph show? | Axes and units, ratios, range tested, variability, limits |
| Justify | Why should we accept the recommendation? | Correctness reasoning, count model, actual evidence, one limitation |

These are the verbs in the course's existing assessment description. The following short diagnostic is practice, not an added exam or grading scheme. Attempt it without notes, then check the explanations.

## A cumulative diagnostic with full answers

### Problem 1: trace and meaning

A full scan of `[3, 8, 3, 5]` increments a counter every time it sees 3. What are the counter values after each item, and what is the result? How would a membership search differ?

#### Solution 1

Starting at zero, the values are 1, 1, 2, 2. The result is 2 occurrences. A membership search asks only whether at least one match exists and may stop at the first item, returning True. Counting and membership require different outputs, so early stopping changes correctness for the counting task.

### Problem 2: a sum, not a guess

An outer loop has five iterations. Its inner loop executes 0, 1, 2, 3, and 4 times. Give the exact count and its general expression for n outer iterations.

#### Solution 2

The exact count is 0 + 1 + 2 + 3 + 4 = 10. Generally the values are 0 through n − 1, so the sum is n(n − 1)/2 = (n² − n)/2. For n ≥ 1 it is at most n²/2, giving O(n²). For growing n it is also bounded below by a constant multiple of n² once n ≥ 2, so the close class is quadratic. The nested loops do not perform n² exact iterations.

### Problem 3: analyse the experiment

At sizes 200, 400, 800, illustrative median times are 3, 6, 13 milliseconds. What do the ratios suggest? What additional evidence would you want?

#### Solution 3

The ratios are 6/3 = 2 and 13/6 ≈ 2.17. They suggest roughly linear growth over this tested range. We need a clear timed boundary, repeat counts and variability, more appropriate sizes if needed, and an operation-count explanation. These three points alone cannot establish an asymptotic theorem. The median is the middle ordered observation for an odd number of measurements, or the mean of the two middle observations for an even number. It is not the smallest time; report the summary actually used.

### Problem 4: read a hidden cost

A list of n items is repeatedly drained using `pop(0)` until empty. How many remaining-item shifts occur in the ordinary array-list model? Does `pop()` at the end have the same shift count?

#### Solution 4

The first front removal shifts n − 1 remaining items, the next n − 2, and so on to zero. The total is n(n − 1)/2, hence quadratic growth. End removal does not shift the preceding items; n end removals have linear total work in the usual amortized model. The two versions also remove items in different orders, which may matter to the task.

### Problem 5: searching with preparation

You have an unsorted list and one query. A classmate recommends sorting and then binary searching because O(log n) is less than O(n). What is missing?

#### Solution 5

The comparison counts only the final search, omitting sorting. Sorting then searching has a general comparison-model cost O(n log n) + O(log n), whereas a single direct scan is O(n). If the data is already sorted or will serve many queries, the recommendation may change. A set is another candidate for membership under suitable conditions; binary search can support ordered-position questions that simple set membership does not answer.

### Problem 6: make the recommendation precise

Two methods return the same values on three small tests. Method B is faster at all four benchmark sizes. What should the report say, and what should it avoid concluding?

#### Solution 6

Report that B was faster for those sizes under the stated environment, measurement boundary, repeat policy, and input cases. Explain why both methods satisfy the intended contract, including important edge cases; three successful tests alone do not prove correctness for all inputs. Connect observed scaling to operation counts and describe memory/preparation costs. Do not conclude that B is universally faster or that timing proves its Big-O bound. State a specific limitation such as a small size range, one input distribution, or unmeasured memory use.

**Türkçe:** Hazır olmak, her terimi ezberlemek değil; yeni bir küçük örnekte bu altı hareketi yapabilmektir. Hata tek bir başlıkta toplanıyorsa tüm dersi yeniden okumak yerine ilgili haftaya dön: izleme için 2–4, ölçüm için 5–6, sayma ve sınıflandırma için 7–8, yöntem seçimi için 9–13.

## Keep a one-page learning record

For each week, keep one tiny input, one trace or calculation, one corrected misconception, and one sentence you can explain without notes. This is your private revision aid. It is not an extra submission. Revisit the matching original chapter problems after the core example is comfortable.

Use this final speaking frame: “The task requires ____. I compared ____ and ____. I define n as ____. The important repeated work is ____. My measurements include ____. I recommend ____ for ____ because ____. A limitation is ____.”

**Türkçe:** “Görev şu sonucu istiyor. İki yöntemim bunlar. n şu miktarı gösteriyor. Asıl tekrar eden iş bu. Ölçümüm şu maliyetleri içeriyor. Şu koşulda bu yöntemi öneriyorum; çünkü gerekçem ve verim bunu destekliyor. Sınırı ise şu.” Bu cümlelerin her birini doldurabiliyorsan, sembolleri bir kararın gerekçesine dönüştürmüşsün demektir.
