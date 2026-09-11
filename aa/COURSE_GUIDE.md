# AA — The Detailed Learning Guide

## Contents

- [Arithmetic and notation bridges](#arithmetic-and-notation-bridges)
- [Week 01 — What Is an Algorithm?](#week-01--what-is-an-algorithm)
- [Week 02 — Your First Python: Values, Names, and Output](#week-02--your-first-python-values-names-and-output)
- [Week 03 — Repeating Work: Loops and a Step Counter](#week-03--repeating-work-loops-and-a-step-counter)
- [Week 04 — Lists: Holding Many Things at Once](#week-04--lists-holding-many-things-at-once)
- [Week 05 — Functions and trustworthy timing](#week-05--functions-and-trustworthy-timing)
- [Week 06 — Doubling experiments, plots, and noisy evidence](#week-06--doubling-experiments-plots-and-noisy-evidence)
- [Week 07 — Exact operation counts and dominant growth](#week-07--exact-operation-counts-and-dominant-growth)
- [Week 08 — Big-O, precise bounds, cases, and space](#week-08--big-o-precise-bounds-cases-and-space)
- [Week 09 — One problem, four strategies](#week-09--one-problem-four-strategies)
- [Week 10 — The real cost of list operations](#week-10--the-real-cost-of-list-operations)
- [Week 11 — Sets, dictionaries, and preparing once](#week-11--sets-dictionaries-and-preparing-once)
- [Week 12 — Binary search, boundaries, and preparation](#week-12--binary-search-boundaries-and-preparation)
- [Week 13 — Sorting: count the work and preserve the meaning](#week-13--sorting-count-the-work-and-preserve-the-meaning)
- [Week 14 — From a correct algorithm to a convincing report](#week-14--from-a-correct-algorithm-to-a-convincing-report)
- [Four review sessions inside the 14 weeks](#four-review-sessions-inside-the-14-weeks)
- [Cumulative revision and the final explanation](#cumulative-revision-and-the-final-explanation)

**Algorithm Analysis with Python · 14 weeks · English explanations with Turkish support**

The central question is simple: **When the amount of input grows, how does the work grow?** We will learn to answer it by following small examples, measuring carefully, counting operations, and explaining a choice. Python makes the steps visible. Understanding those steps matters more than memorising syntax.

**Türkçe:** Bu rehber her haftayı öğrenirken kullanabileceğin ayrıntılı bir çalışma arkadaşıdır. Önce yöntemin ne yaptığını anlayacağız; sonra küçük bir örneği elle takip edeceğiz; en son işlem sayısını ve büyümeyi açıklayacağız. Formüle bir anda atlamayacağız. Bir sembolü anlamadığında ilgili aritmetik köprüsüne dönebilirsin.

The guide follows the actual [AA weekly notes](index.html#weeks), in their original order. The explanations, small examples, and practice solutions here develop those notes. The original lessons remain the source for their full chapter problem sets and optional extensions. The [Skiena companion](skiena/index.html) offers additional worked chapter solutions; it is a later reference, not a prerequisite for Week 1.

## Start here

You do not need prior programming experience. Start at Week 1 if variables, loops, or lists are unfamiliar. If you already program, use the Week 4 readiness check before moving ahead: knowing syntax does not automatically mean you can explain its cost.

Use one weekly chapter alongside its original lesson. Do not try to read this entire guide before class. Each chapter provides a question, a retrieval exercise with an answer, slow explanations, worked examples, practice with complete solutions, common mistakes, a vocabulary card, and a readiness check. Read only the arithmetic bridge you currently need.

**A practical reading cycle:**

1. State the problem in everyday words. What is given? What must be returned?
2. Predict one tiny example on paper. Use three to six items so every change remains visible.
3. Trace the variables. Record values after each relevant step, not only the final output.
4. Run the example in the original lesson or a short code block here. Compare it with your prediction.
5. Change one detail: a missing target, a duplicate, an empty list, or twice as much data.
6. Explain what stayed the same and what changed. Then use the technical term.

**Türkçe:** Çözümü okumadan önce en azından ilk adımı kendin yaz. Hata yaptığında sadece doğru cevabı kopyalama: “Ben hangi adımın kaç kez çalıştığını yanlış düşündüm?” sorusuna cevap ver. Bir örneği anlamak, çıktısını tanımaktan fazlasıdır; girdi değişince sonucu yeniden bulabilmelisin.

The code examples in this guide are small learning examples. A printed elapsed time is a measurement from that run, not an answer everyone should reproduce. Tables explicitly described as illustrative are arithmetic exercises, not measurements from your machine.

## Course map

The calendar remains **14 weeks**. Reviews take place inside existing classes in Weeks **4, 6, 8, and 11**; they do not add four more weeks. The weekly sequence below matches the course source files `tools/weeks/w01.html` through `w14.html`. No calendar dates are inferred from another course's timetable.

| Week | Actual lesson topic | What you should be able to explain | Transition or review |
| --- | --- | --- | --- |
| 1 | What is an algorithm? | Input, output, definite steps, termination, correctness, and counting by hand | Everyday instructions → computer instructions |
| 2 | Values, names, and output | Read assignments and evaluate arithmetic one operation at a time | One instruction → repeated instructions |
| 3 | Loops and a step counter | Trace decisions, ranges, counters, and stopping conditions | Repetition → processing a collection |
| 4 | Lists | Separate position access from value search; count successful and missing searches | Review A: explain a complete small program |
| 5 | Functions and the stopwatch | Separate defining, calling, returning, and timing; repeat measurements | One measurement → a controlled comparison |
| 6 | The doubling experiment | Calculate time ratios and interpret a labelled plot without overclaiming | Review B: seconds → operation counts |
| 7 | Counting steps instead of seconds | Choose a cost model, derive T(n), add or multiply counts appropriately | Exact expressions → growth descriptions |
| 8 | Big-O notation | Explain a useful upper bound, its conditions, cases, and auxiliary space | Review C: justify a growth claim |
| 9 | Four anagram algorithms | Compare strategies while preserving the same definition of a match | Strategy → costs hidden in familiar operations |
| 10 | Python list costs | Explain shifting, copying, repeated membership, and amortized append | Container operations → container choice |
| 11 | Dictionaries and sets | Include build cost, average-case lookup, memory, and meaning of the result | Review D: prepare data for repeated questions |
| 12 | Linear and binary search | Trace bounds, explain sortedness, and account for preparation | Searching sorted data → obtaining sorted data |
| 13 | Sorting | Trace bubble and selection sort; derive comparison counts; compare with sorted() | Separate correctness, growth, and measured performance |
| 14 | Putting it together | Defend two correct approaches using counts, benchmarks, and limitations | Project, cumulative review, engineering interpretation |

The first phase teaches the Python needed for analysis. Weeks 5–6 develop experiments. Weeks 7–9 develop the language for explaining experiments. Weeks 10–14 use that language to choose methods. When a later chapter is difficult, identify the missing link rather than restarting the entire course.

## How the three-hour class stays manageable

| Time in class | Ordinary week | Review weeks 4, 6, 8, 11 |
| --- | --- | --- |
| 00:00–00:10 | Retrieve an earlier idea and state today's question | Same; use a tiny repair example if needed |
| 00:10–01:00 | Explain, predict, run, discuss; pause for questions | Teach the week's essential ideas |
| 01:00–01:10 | Break | Break |
| 01:10–02:00 | Worked example, changed input, explanation to a partner | Finish a representative core example and check it |
| 02:00–02:10 | Break | Break |
| 02:10–02:50 | Core engineering practice and exam bridge | Protected review of familiar ideas |
| 02:50–03:00 | Questions, summary, exit ticket | Review exit ticket and specific repair plan |

A review week still includes its scheduled topic. Make room by choosing representative examples from the notes and leaving optional extensions for later. Do not remove a break or rush through every optional problem. The review plans later in this guide include actual questions, full solutions, and a way to decide what needs another pass.

**Türkçe:** “Tampon” burada takvime boş hafta eklemek değildir. Zor bir kavramdan diğerine geçmeden önce, mevcut haftanın son 50 dakikasını önceki fikirleri birleştirmeye ayırmaktır. Bir sonraki haftanın ilk 10 dakikası da gerekirse küçük bir onarım örneği için kullanılır. Böylece aynı yanlış anlama haftalarca taşınmaz.

## Three different questions: answer them separately

Consider finding a target in a list. These three statements answer different questions:

| Question | Example answer | What it does not establish |
| --- | --- | --- |
| Is the result correct? | A full scan returns whether at least one item equals the target, including the empty-list case | How fast it runs |
| How much work is done? | An absent target requires n equality checks in this simple scan | Exact seconds on a laptop |
| How long did this run take? | The measured elapsed time was recorded with a stated timer and repeat policy | A proof about every larger input |

Correctness comes first. Comparing a function that returns the first matching position with one that returns only True or False requires care: they do not have the same output contract. Replacing a list with a set can change the meaning of duplicates and order. Faster output is useful only if it is the output the problem requires.

**Türkçe:** “Doğru cevap”, “işlem sayısı” ve “geçen süre” üç ayrı değerlendirmedir. Sınavda veya projede bunları ayrı cümlelerle yaz. “Hızlı çalıştı, o hâlde doğru” ya da “O(n), o hâlde şu kadar saniye” çıkarımları geçerli değildir.

## A reusable answer structure

Use this structure for a trace, an analysis exercise, or your project:

1. **Contract:** The input is … and the required output is … . Assume … .
2. **Size:** Let n be … . If a second size matters, let m or q be … .
3. **Case:** I am analysing all inputs, the worst case, or a stated input arrangement.
4. **Counted operation:** I count comparisons, visits, shifts, or another specified operation.
5. **Reasoning:** This operation happens … times because … . Show the sum or product.
6. **Growth:** Therefore a useful bound is … under these assumptions.
7. **Evidence and limits:** The experiment suggests … . It includes/excludes preparation … . A limitation is … .

For Week 1, use only the first four ideas informally. Add symbols and bounds as the course introduces them. You are not expected to know Week 8 language in Week 2.

**Example of a complete short analysis:** “Let n be the list length. I count equality checks in an ordinary left-to-right scan. In the missing-target case, every item is checked once, so C(n) = n. The worst-case growth is linear, O(n), assuming an individual equality check has constant cost. The loop stores a fixed number of extra variables, so its auxiliary space is O(1).”

**Türkçe:** Güçlü cevap uzun olmak zorunda değildir; eksik adım bırakmamalıdır. Önce n'nin anlamı, sonra saydığın işlem, ardından neden n kez yapıldığı ve son olarak büyüme sınıfı gelir. Sembolü açıklamanın yerine koyma.

## Assessment and source boundaries

The [course home](index.html#grading) currently labels its assessment scheme **suggested**: midterm 30%, final exam 40%, in-class project demonstration 20%, and technical presentation 10%. This guide adds learning support, not a new grading policy. Weekly self-checks remain private practice. Follow any assessment announcement from the instructor.

The final project follows [Week 14](w14/index.html): two correct methods for the same task, measurements at four input sizes, a shared labelled figure, a growth explanation, and an approximately two-page report with a recommendation and an honest limitation. The engineering capstone remains a reading after Week 14.

The primary sources for every chapter are linked in that chapter. Added micro-examples and review exercises are teaching examples built around those source concepts. Harder proof-style and interview-style chapter problems remain available in the original notes and the Skiena companion. Their optional status is preserved.

**Türkçe:** Rehberdeki ek açıklamalar konu sırasını ve ölçme-değerlendirme düzenini değiştirmez. Amaç, mevcut notları gerçekten anlayabilmen için aradaki düşünme adımlarını görünür kılmaktır.

# Arithmetic and notation bridges

Use these short bridges when a weekly explanation introduces an unfamiliar operation. They are references, not an extra preparatory course. Bridges 1–2 help from Week 2; 3–4 from Week 6; 5–8 from Weeks 7–8; 9 from Weeks 11–12.

## Bridge 1: a symbol is a named quantity

Let n be the number of items in a list. If the list contains five items, n = 5. The expression 3n means 3 × n, so 3n = 3 × 5 = 15. In Python you must write `3 * n`; `3n` is not valid code.

T(n) means “the amount of work as a function of input size n.” It does not mean T multiplied by n. Unless we say otherwise, T counts a chosen kind of operation. We use t(n), a lowercase t, for a measured elapsed time when distinguishing the two helps.

| Written expression | Read it aloud | At n = 4 | Python spelling |
| --- | --- | --- | --- |
| n + 3 | n plus three | 4 + 3 = 7 | `n + 3` |
| 3n | three times n | 3 × 4 = 12 | `3 * n` |
| n² | n squared | 4 × 4 = 16 | `n ** 2` |
| 2ⁿ | two to the power n | 2 × 2 × 2 × 2 = 16 | `2 ** n` |
| n(n − 1)/2 | n times n minus one, divided by two | 4 × 3 / 2 = 6 | `n * (n - 1) // 2` for an integer pair count |

At n = 4, n² and 2ⁿ happen to be equal. At n = 5 they are 25 and 32. One matching small value does not mean two functions have the same growth.

**Türkçe:** n bir “sihirli algoritma sembolü” değil, bizim tanımladığımız bir miktardır. Liste sorusunda eleman sayısı, metin sorusunda karakter sayısı olabilir. Her sorunun başında anlamını yeniden belirt. T(n) ise “n boyutundaki girdi için iş miktarı” diye okunur.

**Check and answer:** At n = 3, 2n² + 1 = 2 × (3 × 3) + 1 = 2 × 9 + 1 = 19. First evaluate the power, then multiplication, then addition. In Python, `^` means bitwise XOR, not exponentiation; use `**`.

## Bridge 2: assignment is an update, not an algebraic identity

In mathematics, x = x + 1 has no ordinary numerical solution: subtracting x from each side would say 0 = 1. In Python, `x = x + 1` is an instruction: read the old x, add one, and store the result under the name x.

```python
x = 4
x = x + 1
print(x)
```

The result is 5. The right-hand side uses the old value 4. The assignment then replaces the value associated with the name. Equality testing in Python uses `==`, as in `x == 5`.

**Türkçe:** Eşitliğin iki tarafını çözmeye çalışmıyoruz. “Eski değeri al, bir ekle, yeni değeri sakla” komutunu uyguluyoruz. Döngü sayaçlarında bu ayrım kritik: her turda yeni değer, sonraki turun eski değeri olur.

## Bridge 3: ratios compare like with like

The doubling ratio is R(n) = t(2n) / t(n). The numerator is the time at the larger input; the denominator is the time at the smaller input. Suppose an illustrative table gives 0.012 seconds at n and 0.024 seconds at 2n.

```text
R(n) = 0.024 / 0.012
     = 24 / 12       (multiply both numerator and denominator by 1000)
     = 2
```

The time became twice as large. This is a factor, not an increase of two seconds. If the new time is 0.048 seconds, the ratio is 0.048 / 0.012 = 4. A percentage increase uses a different expression: (new − old) / old × 100. Doubling is a 100% increase, not a 200% increase.

Ratios have no time unit when the same units cancel. Convert units first: 2 milliseconds is 0.002 seconds. Dividing 4 milliseconds by 0.002 seconds without conversion would give a meaningless numerical comparison.

**Türkçe:** Pay “sonraki”, payda “önceki” ölçümdür. İki zamanın birimi aynı olmalı. 2 oranı süreye 2 eklendiğini değil, sürenin 2 ile çarpıldığını söyler. Çok küçük veya sıfır görünen sürelerde bu oran güvenilir olmaz; daha fazla işi birlikte ölçmek gerekir.

**Check and answer:** Illustrative times 6, 12, 24 milliseconds at sizes 100, 200, 400 give successive ratios 12/6 = 2 and 24/12 = 2. They suggest linear scaling over this range; they do not prove an asymptotic bound.

## Bridge 4: substitute 2n into the whole expression

Suppose T(n) = n². To calculate T(2n), replace every n by 2n, keeping parentheses:

```text
T(2n) = (2n)²
      = (2n) × (2n)
      = 2 × 2 × n × n
      = 4n²
T(2n) / T(n) = 4n² / n² = 4, for n > 0.
```

It is not 2n²: that would mean multiplying the old answer by two instead of doubling the input before computing the answer.

For T(n) = 3n + 2:

```text
T(2n) = 3 × (2n) + 2 = 6n + 2
T(2n) / T(n) = (6n + 2) / (3n + 2)
```

At n = 2, the ratio is 14/8 = 1.75. At n = 100, it is 602/302 ≈ 1.993. It approaches two as the fixed extra work matters less. We cannot cancel the 2s across addition. Cancellation applies to common factors of an entire numerator and denominator, not selected terms of sums.

**Türkçe:** “n yerine 2n yaz” işlemini bütün ifadeye uygula. Parantez, hatayı önler. Ayrıca (6n + 2)/(3n + 2) ifadesindeki +2'leri silmek geçersizdir. Üstte ve altta toplam var; ortak çarpan yok.

## Bridge 5: consecutive work adds; repeated work multiplies

A scan of n items followed by another scan of n items visits 2n items in total: n + n. If, for each of n items, you scan all n items again, you visit n × n = n² pairs.

At n = 3, sequential scans contribute 3 + 3 = 6 visits. Nested full scans contribute 3 + 3 + 3 = 9 visits. The indentation in code tells you which actions happen again for every outer iteration; the count comes from the actual bounds.

For a nested loop whose inner loop always runs three times, the count is n × 3 = 3n. Its growth is linear, even though the code has two loops. For an outer loop running n times and an inner loop running m times, the count is nm. Do not silently assume m = n.

**Türkçe:** “Ardından” yapılan işleri topluyoruz. “Her biri için yeniden” yapılan işi çarpıyoruz. İç içe döngü gördüğünde otomatik olarak n² yazma; içteki döngünün gerçek tekrar sayısını bul.

**Check and answer:** A full n-item scan followed by a full n-by-n pair scan gives n + n² visits. At n = 4 this is 4 + 16 = 20. The quadratic term dominates for large n.

## Bridge 6: why 1 + 2 + ... + (n − 1) equals n(n − 1)/2

Imagine comparing each item only with items after it. For n = 5, the first item has four later items, the second has three, then two, then one, then zero. The total is 4 + 3 + 2 + 1 = 10. This counts unordered pairs once, without comparing an item with itself.

Let S = 1 + 2 + ... + (n − 1). Write the same sum backwards and add matching positions:

```text
S = 1       + 2       + ... + (n − 1)
S = (n − 1) + (n − 2) + ... + 1
2S = n + n + ... + n     (there are n − 1 columns)
2S = n(n − 1)
S = n(n − 1)/2
  = (n² − n)/2
```

The division by two corrects for writing the same sum twice. At n = 5, 5 × 4 / 2 = 10. At n = 1, there are no pairs and the formula gives zero. At n = 0, the empty pair count is also zero.

For the inclusive sum 1 + ... + n, the corresponding formula is n(n + 1)/2. Check the final term before choosing a formula. These sums reappear in triangular loops, repeated list shifts, and simple sorting.

**Türkçe:** Formülü ezberlemekten önce “kaç çift var?” sorusunu gör. İlk elemanın n−1, ikincinin n−2 eşi var. Toplamın son terimi n mi, n−1 mi? Bu ayrım, formüldeki +1 veya −1'i belirler.

## Bridge 7: halving and logarithms

Start with 32 candidates. After one ideal halving, 16 remain; after two, 8; then 4, 2, and 1. Five halvings reduce 32 to one. We write log₂32 = 5 because 2⁵ = 32. A logarithm answers “which exponent?”

| Halvings k | Remaining candidates, 32 / 2ᵏ |
| --- | --- |
| 0 | 32 |
| 1 | 16 |
| 2 | 8 |
| 3 | 4 |
| 4 | 2 |
| 5 | 1 |

To reduce n candidates to at most one in the ideal model:

```text
n / 2ᵏ ≤ 1
n ≤ 2ᵏ          (multiply both sides by positive 2ᵏ)
log₂n ≤ k       (log₂ preserves the order for positive quantities)
```

Thus k is at least log₂n; choose an integer large enough. For n = 10, three ideal halvings leave 1.25 and four leave 0.625, so ceiling(log₂10) = 4. Real binary search uses integer positions and checks a middle item each round; the exact worst-case number of middle inspections for the common inclusive-bound loop is floor(log₂n) + 1 for n ≥ 1. Empty input takes zero inspections. Halving rounds and inspections are related counts, not interchangeable exact formulas.

**Türkçe:** Logaritma bu derste gizemli bir işlem değil: “Kaç kez ikiye bölebilirim?” sorusunun tersinden yazımıdır. n = 8 için üç yarılama sonunda bir aday kalır; o adayı kontrol etmek ayrı bir işlem olabilir. Bu yüzden “yarılama sayısı” ile “karşılaştırma sayısı” aynıymış gibi yazmıyoruz.

A doubling adds one to a base-two logarithm: log₂(2n) = 1 + log₂n. For n log₂n work, the doubling ratio is 2 × (1 + 1/log₂n), for n > 1. At n = 8 it is 2 × (1 + 1/3) = 8/3 ≈ 2.67. Therefore n log n does not double by exactly two at every size.

## Bridge 8: dominant terms and an actual upper bound

Suppose the selected count is T(n) = 3n² + 2n + 1. At n = 10, its terms are 300, 20, and 1. At n = 100, they are 30,000, 200, and 1. The n² term becomes the largest contribution. Dropping smaller terms is a growth summary, not an equality: 3n² + 2n + 1 is never literally n² for positive n.

To justify an O(n²) upper bound, use n ≥ 1. Then n ≤ n² and 1 ≤ n², so:

```text
3n² + 2n + 1 ≤ 3n² + 2n² + n² = 6n².
```

We found one multiplier c = 6 and a starting size n₀ = 1 for which T(n) ≤ c n² thereafter. We do not need the smallest possible c. Big-O permits multiplying the comparison function by a fixed constant and ignoring an initial finite range.

**Türkçe:** “Küçük terimleri attım” ifadesinin arkasında bir üst sınır vardır. n en az 1 olduğunda her küçük terimi n²'nin bir katıyla yukarıdan sınırladık. Sonuç 6n² oldu. Buradaki 6, n büyürken değişmeyen sabit bir çarpandır.

O(n²) is an upper-bound statement. T(n) = n also belongs to O(n²), but O(n) describes its growth more closely. Θ(n) states both matching upper and lower bounds. The weekly notes introduce further notation and optional proofs; first learn to justify the useful close bound in plain language.

## Bridge 9: paying once versus paying every time

Let n be the number of records and q the number of membership queries. A missing-target list scan makes n comparisons for each query, so q queries make nq comparisons. A prepared lookup structure has a build cost plus a query cost. In a simplified unit-cost average-case model, building a set and making q lookups is proportional to n + q. Real constants and hash assumptions matter.

At n = 1000 and q = 100, the simple scan count is 1000 × 100 = 100,000 equality checks. The abstract set model is 1000 + 100 = 1100 preparation/query units. These units represent different underlying operations; 100,000/1100 is not a measured speedup. The model explains why paying preparation once can become attractive.

For a timing-based break-even calculation, suppose a measured build takes 3 milliseconds, each old query 0.20 milliseconds, and each new query 0.05 milliseconds. These are illustrative values:

```text
Old total = 0.20q
New total = 3 + 0.05q
New is faster when 3 + 0.05q < 0.20q
Subtract 0.05q from both sides: 3 < 0.15q
Divide both sides by positive 0.15: 20 < q
```

At 20 queries the modeled times tie; above 20, the new method is faster. An integer query count therefore needs at least 21. If the data changes and preparation must be repeated, recalculate the total.

**Türkçe:** Hazırlık maliyetini yok sayma. “Bir kez hazırla, birçok kez sor” ile “her soruda yeniden hazırla” aynı algoritma değildir. Eşitsizliği çözerken iki taraftan aynı terimi çıkarıyoruz; pozitif bir sayıya bölünce eşitsizliğin yönü değişmiyor.

# Week 01 — What Is an Algorithm?

[Original lesson](w1/index.html)

## The big question

**If two people both get the right answer, why would we prefer one method?**

This week begins with instructions, numbered cards and a guessing game. You need no programming experience. Explain exactly what somebody should do, then count the work required. Python begins in Week 2.

By the end, you should be able to identify an input and an output, write an unambiguous stopping rule, follow a method without inventing missing steps, and compare two methods using one clearly defined unit of work. You should also be able to name an assumption that makes a faster method valid. Speed is useful only when the method still solves the intended problem.

## Retrieve the ideas you already have

| Question | Answer and reason |
|---|---|
| What is half of 16? What is half of 8? | 8, then 4. Two reductions leave one quarter of the original quantity. |
| Does looking at three of five hidden cards guarantee the largest? | No. Either unseen card could be larger than all three inspected cards. |
| Is “put these in order” a complete instruction? | No. It must identify the ordering rule, such as increasing number or alphabetical order. |

These are analysis questions: distinguish a claim from its evidence and identify missing information. To visualize halving, draw sixteen marks and cross out half at each stage.

**Türkçe açıklama:** Algoritma analizi için önce karmaşık formüller değil, açık bir soru gerekir. “En büyüğü buldum” demekle “görmediğim kart daha büyük olamaz” demek farklıdır. İkinci cümle, cevabın neden güvenilir olduğunu açıklamaya başlar.

## 1. A method needs a contract

An **algorithm** is a procedure with definite steps that finishes and produces the required result for its allowed inputs. A short description should answer four questions: What do we start with? What operations are allowed? When do we stop? What do we report?

For example, “find the largest card” is a problem, not yet a procedure. We can make the contract precise: the input is a nonempty row of number cards; reading and comparing cards are allowed; the output is the largest value. We do not promise to find a largest value in an empty row, because there is no value to return. We can instead report “no cards.” Stating that case is part of being precise.

“Finite” concerns execution, not merely the number of written sentences. “Keep repeating step one forever” is a very short description, but it never finishes. A useful stopping rule must be checkable, and the procedure must make progress toward it. “Stop after inspecting the final card” works because the row is finite and each inspection advances to the next card.

**Türkçe açıklama:** Girdi koşulu bir mazeret değildir; çözmek istediğimiz problemin sınırını belirtir. Boş bir listedeki en büyük sayıyı istemek, içinde hiç kart olmayan bir kutudan kart seçmek gibidir. Bu durumu açıkça ayırınca hem çözüm hem hata davranışı anlaşılır olur.

## 2. Instructions must not depend on guessing

The lesson uses recipes and directions because they expose hidden assumptions. “Add some water” leaves the amount unspecified. “Walk toward the building” leaves the building unspecified. “Use the middle card to choose a half” leaves the ordering assumption unspecified.

A precise version says, “Read the next card from the left; compare its number with the largest number remembered so far.” Another person can follow this literally.

We need not describe every physical movement. We can agree that “read one card” is an available operation. Later, a Python command will be an agreed operation, whose internal work we may examine separately.

## 3. Worked example: a largest-value scan

Use the cards **8, 3, 11, 6**. We will count two things separately: a **look** reads one card, and a **comparison** compares a later card with the remembered largest value.

The procedure is: read the first card and remember it; move right; replace the remembered value only if the new card is larger; stop after the last card; report the remembered value.

| Card inspected | Comparison | Remembered largest afterward | Total looks | Total comparisons |
|---|---|---:|---:|---:|
| 8 | None: initialize the remembered value | 8 | 1 | 0 |
| 3 | Is 3 greater than 8? No | 8 | 2 | 1 |
| 11 | Is 11 greater than 8? Yes | 11 | 3 | 2 |
| 6 | Is 6 greater than 11? No | 11 | 4 | 3 |

The answer is 11. Four cards required four looks but only three comparisons. For n nonempty cards, the same procedure uses n looks and n − 1 comparisons. Here **n means the number of cards**, not the largest number printed on them. Replacing 11 with 11 million does not add another card.

Why can we trust the answer? After each row, the remembered value is the largest among the cards already inspected. A larger newcomer replaces it; a smaller newcomer cannot invalidate it. After the last row, “already inspected” means the whole input.

**Türkçe açıklama:** “Dört adım” demeden önce neyi saydığını söyle. Kartı okumak ile iki değeri karşılaştırmak aynı olay değildir. İlk kart başlangıç değerini sağlar; onu önceki bir şampiyonla karşılaştırmadığımız için karşılaştırma sayısı bir eksiktir.

## 4. Worked example: keeping only the possible half

A friend chooses **13** from the whole numbers **1 through 16**. After each guess they truthfully answer higher, lower or correct. Guess the middle of the remaining interval, rounding a midpoint down when necessary.

| Guess number | Possible interval before guessing | Midpoint calculation | Guess | Feedback | New interval |
|---|---|---|---:|---|---|
| 1 | 1–16 | (1 + 16) / 2 = 8.5; round down | 8 | Higher | 9–16 |
| 2 | 9–16 | (9 + 16) / 2 = 12.5; round down | 12 | Higher | 13–16 |
| 3 | 13–16 | (13 + 16) / 2 = 14.5; round down | 14 | Lower | 13–13 |
| 4 | 13–13 | (13 + 13) / 2 = 13 | 13 | Correct | Finished |

Notice the boundary changes. After “higher than 8,” 8 is no longer possible, so the new lower boundary is 9. After “lower than 14,” the upper boundary becomes 13. Keeping the rejected midpoint would create unnecessary work and can prevent progress in a careless implementation.

This secret took four guesses. That is not a guarantee that every secret takes four: with this convention, 16 follows 8, 12, 14, 15, 16 and takes five. Distinguish the guesses for one input from the maximum over every allowed input.

**Türkçe açıklama:** Her tahminden sonra cevabın bulunabileceği aralığı koruyoruz. “Daha büyük” cevabı yalnızca yön söylemez; tahmin edilen sayıyı ve altındaki bütün sayıları eler. Son kalan sayıyı gerçekten kontrol etmek de bir tahmindir; aralığı küçültmek ile cevabı kontrol etmek aynı sayım değildir.

## 5. Why structure can buy speed

A dictionary is alphabetically ordered. Looking near its middle tells us which side can contain a requested word. A shuffled pile provides no such information: a small middle value does not imply that every value to its left is small. Throwing away that half could throw away the answer.

For roughly 1,000 possibilities, repeated halving needs about ten decisions; for a million, about twenty; for a billion, about thirty. These are growth comparisons, not promises about the exact execution of every search. Increasing the size from 1,000 to a million is a thousandfold increase, while the approximate count rises by ten. From 1,000 to a billion is a millionfold increase, and the count rises by about twenty.

A complete scan behaves differently: doubling the number of cards doubles the looks. Comparing every card with every other card grows faster still. Today you need the pictures: one fixed action, one pass through the data, repeated halving, and many pair comparisons. Formal growth notation comes later.

**Türkçe açıklama:** Hız kazancı boşluktan gelmez; sıralılık gibi kullanılabilir bilgiden gelir. Bir yöntemi seçerken “kaç işlem?” kadar “hangi koşul altında doğru?” sorusunu da sor. Sırasız veriye sıralı veri yöntemini uygulamak, daha hızlı bir yanlış cevap üretebilir.

## 6. Graduated practice

### Practice 1 — specify a complete task

Rewrite “take enough cards and find the biggest” for a supplied row of exactly three cards: 4, 9, 2. State input, stopping rule, result and look count.

#### Solution 1 — replace vague words with checkable steps

The input is the three-card row 4, 9, 2. Read 4 and remember it. Read 9; because 9 > 4, remember 9. Read 2; because 2 < 9, keep 9. Stop because all three cards have been inspected. Output 9. The count is three looks and two comparisons. “Enough” has been replaced by “all three supplied cards.”

### Practice 2 — trace a search

The secret is 6 in the interval 1–8. Use the same midpoint rule as the worked example. Compare with guessing 1, 2, 3 and so on.

#### Solution 2 — write every remaining interval

First midpoint: (1 + 8) / 2 = 4.5, rounded down to 4. “Higher” leaves 5–8. Next midpoint: (5 + 8) / 2 = 6.5, rounded down to 6. “Correct” stops the method after two guesses. Counting upward makes six guesses. On this input the first method saves 6 − 2 = 4 guesses. That does not mean it saves exactly four on every input.

### Practice 3 — challenge a speed claim

Someone inspects only three cards in an unsorted row of ten and claims to know the largest. Explain why this cannot guarantee a correct result. What changes if the cards are sorted in increasing order and that fact is trusted?

#### Solution 3 — use an unseen counterexample

Keep the inspected cards unchanged. Put a larger number on one of the seven unseen cards. The observer received exactly the same information but would now give a wrong answer. Therefore, without extra information, a guaranteed maximum needs ten looks. If the row is already known to be sorted increasingly, its last card is the largest; one look suffices. That shortcut relies on the trusted ordering, whose creation or verification may itself cost work.

## 7. Misconceptions and useful corrections

| Misconception | Correction |
|---|---|
| A method that works once is correct for every input. | Try boundary cases and explain why its steps preserve the required result. |
| One “step” must mean one second. | A step is a chosen event; seconds also depend on the machine and circumstances. |
| Every problem has a clever halving solution. | Halving requires information that safely excludes possibilities. |
| A short written procedure must finish quickly. | A short instruction can request a huge number of repetitions or never finish. |

## 8. Glossary, readiness and the bridge

| English | Türkçe | Meaning here |
|---|---|---|
| Algorithm | Algoritma | Definite procedure that finishes for its allowed inputs |
| Input / output | Girdi / çıktı | Starting information / required reported result |
| Assumption | Varsayım / ön koşul | Fact the method relies on, such as sorted order |
| Trace | Adım adım izleme | Recorded execution on one concrete input |
| Input size | Girdi büyüklüğü | Number of relevant items, represented by n |
| Worst case | En kötü durum | Largest cost among allowed inputs of the same size |

You are ready when you can explain why four cards needed three comparisons, why the halving trace changed 9–16 to 13–16, and why a shuffled pile breaks the shortcut. The answers are initialization, rejection of values at or below 12, and absence of usable ordering. If one explanation is unclear, redo that table with physical cards before adding symbols.

**Bridge to Week 2:** A remembered largest value will become a variable; “report the answer” will become an output command. The reasoning remains the same. You can also use the original lesson's optional Colab setup to prepare the workspace, without treating programming knowledge as a prerequisite for this week.

# Week 02 — Your First Python: Values, Names, and Output

[Original lesson](w2/index.html)

## The big question

**How do I give the computer one instruction at a time?**

This week you express precise instructions in Python and follow their changing values. Understand each line before asking how fast it runs. Loops and functions come later.

By the end, you should be able to distinguish numbers from text, trace assignment, choose an arithmetic operator, convert numeric text, and display a readable result. You should also be able to explain an error using its final message and the line that caused it.

## Retrieve before you type

| Question | Answer and reason |
| --- | --- |
| What is an input? | Data a method starts with, such as a price and a quantity. |
| Is “calculate the answer” a sufficient instruction? | No. It must identify the operation and the values involved. |
| Does getting one example right prove correctness? | No. Other allowed inputs can expose missing cases. |
| What must we choose before counting work? | A unit: for example, item inspections or executions of a particular instruction. |

In Colab, a code cell groups editable instructions. Earlier cells may supply later values. These examples are independent: each defines everything it uses. When old output disagrees with edited code, restart and run from the beginning.

**Türkçe açıklama:** Hücrede görünen metin ile bellekteki değerler farklı olabilir. Bir atama satırını değiştirmek, o hücreyi çalıştırmadan değişkeni güncellemez. Başlangıçta her örneğin kendi başlangıç değerlerini tanımlaması bu gizli bağımlılığı azaltır.

## Values first, names second

`7` is an integer. `2.5` is a floating-point number. `"7"` is text containing one character. Quotes tell Python to treat their contents as a string; they are not printed as part of that string. The operator `+` therefore has different meanings: `7 + 3` produces the number `10`, while `"7" + "3"` produces the text `"73"`.

Python's type names are `int`, `float`, and `str`; `type(value)` reports the kind. Floats have limited precision: not every decimal fraction is stored exactly. Calculate the intended arithmetic first, then format its presentation.

**Türkçe açıklama:** `"12"` yazısı, matematiksel olarak on iki sayısı değildir; iki karakterden oluşur. Bilgisayar bunun telefon numarası mı, etiket mi, sayı mı olduğunu kendiliğinden seçmez. İşlem yapmak istiyorsan sayıya dönüştürme kararını sen vermelisin.

An assignment such as `count = 4` attaches the name `count` to a value. Read `=` as **“store the result on the right using this name.”** It is not an equation that must remain true forever. For `count = count + 1`, first retrieve the old value, calculate `4 + 1`, then replace the stored value with `5`. The old `4` is used before the new `5` is assigned.

Use descriptive names such as `unit_price`. Names cannot contain spaces or start with a digit. Capitalization matters: `total` and `Total` differ.

## Worked example 1: a receipt with a complete trace

Suppose one notebook costs 50 units of currency. We buy three and apply a tax rate of 20% to the subtotal. Here, `0.20` is the rate because `20 / 100 = 0.20`. This is a classroom arithmetic example, with the rate supplied as input.

```python
unit_price = 50
quantity = 3
tax_rate = 0.20
subtotal = unit_price * quantity
tax = subtotal * tax_rate
total = subtotal + tax
print(f"Subtotal: {subtotal:.2f}")
print(f"Tax: {tax:.2f}")
print(f"Total: {total:.2f}")
```

```output
Subtotal: 150.00
Tax: 30.00
Total: 180.00
```

| Instruction | Calculation or meaning | Value afterward |
| --- | --- | --- |
| `unit_price = 50` | Store the price of one item | `unit_price` is 50 |
| `quantity = 3` | Store how many items | `quantity` is 3 |
| `tax_rate = 0.20` | Store twenty hundredths | `tax_rate` is 0.20 |
| `subtotal = unit_price * quantity` | 50 × 3 | `subtotal` is 150 |
| `tax = subtotal * tax_rate` | 150 × 0.20 | `tax` is 30.0 |
| `total = subtotal + tax` | 150 + 30 | `total` is 180.0 |
| Three `print` lines | Insert values into readable labels | Three lines appear |

The `f` before a quoted string allows expressions inside braces. In `{total:.2f}`, `total` supplies the value and `.2f` requests two digits after the decimal point. Formatting `180.0` as `180.00` changes its displayed form; it does not add more money or make the internal calculation more precise.

**Türkçe açıklama:** Yüzdeyi iki kez uygulama: `tax_rate = 0.20` zaten yüzde yirmidir, tekrar 100'e bölünmez. Önce ara toplamı, sonra vergi miktarını, en son ikisinin toplamını buluyoruz. Bu ayrım hem hesabı kontrol etmeyi hem de yanlış satırı bulmayı kolaylaştırır.

## Arithmetic: ask what kind of answer is needed

| Expression | Result | Meaning |
| --- | --- | --- |
| `17 + 5` | 22 | Addition |
| `17 - 5` | 12 | Subtraction |
| `17 * 5` | 85 | Multiplication |
| `17 / 5` | 3.4 | Ordinary division |
| `17 // 5` | 3 | Floor division |
| `17 % 5` | 2 | Remainder |
| `17 ** 2` | 289 | 17 squared: 17 × 17 |

For nonnegative quantities, floor division answers how many complete groups fit. The remainder is what is left: `17 = 3 × 5 + 2`. With negative values, flooring moves toward negative infinity: `-7 // 3` is `-3`, whereas `int(-7 / 3)` is `-2` because `int` truncates toward zero. They are different operations.

Use parentheses when an expression's grouping matters. `(20 + 10) / 3` means `30 / 3 = 10`; `20 + 10 / 3` performs division first. A line that states the intended grouping clearly is easier to inspect than a clever-looking expression.

## Worked example 2: full tables and leftover students

There are 100 students and seven seats per table. We need the number of full tables, the number of students left over, and enough tables for everyone.

```python
students = 100
seats_per_table = 7
full_tables = students // seats_per_table
left_over = students % seats_per_table
tables_needed = (students + seats_per_table - 1) // seats_per_table
print(full_tables, left_over, tables_needed)
```

```output
14 2 15
```

| Step | Arithmetic | Interpretation |
| --- | --- | --- |
| Divide into full groups | 100 // 7 = 14 | Fourteen tables can be filled |
| Find remaining students | 100 % 7 = 2 | Two students still need seats |
| Check the decomposition | 14 × 7 + 2 = 100 | Every student is accounted for |
| Round groups upward | (100 + 7 − 1) // 7 = 106 // 7 = 15 | Provide fifteen tables |

The last formula works for nonnegative whole numbers of students and a positive number of seats. Adding six before division makes any leftover group count as another table. It still gives 14 when there are exactly 98 students: `(98 + 6) // 7 = 104 // 7 = 14`. It also gives zero for zero students.

**Türkçe açıklama:** `100 / 7` sonucu yaklaşık 14.286'dır, fakat kesirli bir masa hazırlayamayız. “Tam dolan masa” ile “gereken masa” farklı sorulardır. Önce soruyu belirlemek, doğru bölme işlemini seçmekten önce gelir.

## Text, conversion and error repair

`len("quokka")` is 6. `"Ada" + " " + "Lovelace"` joins two names with a space. `"ha" * 3` repeats text as `"hahaha"`. `.upper()` and `.lower()` produce uppercase and lowercase versions. Spaces count as characters, so the joined full name has 12 characters; the two names without the joining space have 11.

The original lesson introduces `input`, which always returns text. To keep this guide runnable without prompts, imagine it returned `raw_quantity = "12"`. Then `int(raw_quantity)` produces the integer 12. `float("12.5")` produces a numerical value with a fractional part; `str(12)` produces text. These conversions have a purpose, not a universal “fix everything” role: `int("twelve")` cannot interpret the word as a decimal integer.

When code fails, read the final error, locate its instruction, and inspect the values and types involved.

| Error | Typical cause | Repair reasoning |
| --- | --- | --- |
| `SyntaxError` | An unclosed quote or bracket | Make the instruction grammatically complete |
| `NameError` | `totla` used instead of `total` | Check spelling and whether assignment ran |
| `TypeError` | `"12" + 5` | Decide whether addition or text joining was intended |

**Türkçe açıklama:** Hata mesajı “başaramadın” demek değildir; bilgisayarın hangi isteği yorumlayamadığını söyler. `"12" + 5` için sayısal amaç varsa `int("12") + 5`, metinsel amaç varsa `"12" + str(5)` uygundur. Bu iki çözüm farklı sonuçlar üretir: 17 ve `"125"`.

## Three practice problems with complete solutions

### Practice 1 — predict before running

Find the results of `10 / 4`, `10 // 4`, `10 % 4`, `"10" * 3`, and `10 * 3`. Explain why the last two differ.

#### Solution 1

The results are `2.5`, `2`, `2`, `"101010"`, and `30`. Two full groups of four use eight, leaving two: `10 = 2 × 4 + 2`. A string multiplied by three repeats its characters; a number multiplied by three performs arithmetic. **Türkçe:** Tırnak işaretleri işlemin anlamını değiştirir; görünüşte aynı olan 10 ve `"10"` aynı tür değildir.

### Practice 2 — divide a bill

A bill is 137 units and four people share it equally. Find the whole-unit amount per person, the leftover whole units, and the exact share for this example.

#### Solution 2

`137 // 4 = 34` and `137 % 4 = 1`, because `4 × 34 + 1 = 137`. The exact share here is `137 / 4 = 34.25`. If everyone pays only 34, the group pays 136 and remains one short. **Türkçe:** Kalan 1, kişi başına 1 değildir; grubun tamamının kalanıdır. Dörde bölününce herkesin payına 0.25 eklenir.

### Practice 3 — swap without losing information

Start with `a = "left"` and `b = "right"`. Exchange their values using a temporary name. Explain why assigning `a = b` and then `b = a` fails.

#### Solution 3

```python
a = "left"
b = "right"
temporary = a
a = b
b = temporary
print(a, b)
```

```output
right left
```

The temporary name preserves `"left"`. The next line changes `a` to `"right"`; the final assignment retrieves the saved `"left"` for `b`. Without saving it, `a = b` leaves both names referring to `"right"`, so `b = a` merely copies that same value again. **Türkçe:** Atama geriye dönüp eski değeri hatırlamaz; kaybolacak bilgiyi değiştirmeden önce saklamak gerekir.

## Misconceptions and glossary

| Misconception | Correction |
| --- | --- |
| `=` asserts mathematical equality | Assignment calculates the right side and updates the left name |
| `.2f` fixes inaccurate arithmetic | It controls displayed decimal places |
| Every written line costs exactly the same time | We may count statement executions in a simplified model; actual operations differ |
| A fresh name automatically has a value | It must be assigned before use |

| English | Türkçe | Working meaning |
| --- | --- | --- |
| Value | Değer | Data such as 12 or `"Ada"` |
| Variable name | Değişken adı | A name used to retrieve a value |
| Assignment | Atama | Store a calculated result under a name |
| Conversion | Tür dönüşümü | Explicitly obtain another representation |
| Remainder | Kalan | What is left after complete groups |
| Trace | Adım adım izleme | Record values as instructions execute |

## Readiness, repair and the next bridge

Explain `score = score + 2` when the old score is 8. **Answer:** retrieve 8, calculate 10, store 10. Explain `"8" + "2"`. **Answer:** it joins text to make `"82"`. Explain why a four-statement calculation does not repeat more statements when its ordinary input changes from 10 to 100. **Answer:** there is no repetition instruction; its chosen statement count stays four. Very large integers or longer output can still change lower-level costs.

If assignment is unclear, draw an “old value / calculation / new value” table. If types are unclear, label every literal as number or text before calculating. Week 3 adds decisions and repetition to this same tracing habit: one written line may then execute many times.

# Week 03 — Repeating Work: Loops and a Step Counter

[Original lesson](w3/index.html)

## The big question

**How do I make the computer repeat work, and how do I count that work?**

A five-line program can perform thousands of operations. Decisions and loops let us investigate how work changes with input. Trace tiny cases first; formulas should summarize an understood pattern.

Trace `if`, `for`, and `while`; explain `range` endpoints; maintain an accumulator; and count a specified operation. Distinguish visits, accepted values, and inner-body executions: their counts can differ.

## Retrieval with answers

| Question | Answer |
| --- | --- |
| Old `total` is 7. What does `total = total + 3` do? | Calculate 7 + 3, then store 10. |
| What is `17 % 5`? | 2, since 17 = 3 × 5 + 2. |
| What is `17 // 5`? | 3, the number of complete groups of five. |
| Does `=` test equality? | No. `=` assigns; `==` compares values. |

If uncertain, revisit Week 2 assignment. Distinguish a value before an iteration from its value afterward.

## Decisions: one selected path

An `if` condition produces `True` or `False`. Its indented block runs only when the condition is true. In an `if` / `elif` / `else` chain, Python selects the first true branch, or the final `else` if none is true. It does not execute every branch whose condition might be true independently.

For the lesson's weather example, “hot” means `temperature > 30`, “warm” means the remaining cases with `temperature > 15`, and “cool” covers everything else. Therefore 31 is hot, 30 is warm, and 15 is cool. Exact boundary values reveal whether you intended `>` or `>=`.

`and` requires both conditions; `or` needs at least one; `not` reverses a Boolean result. A multiple of both three and five satisfies `number % 3 == 0 and number % 5 == 0`. In FizzBuzz, check this combined case before the single-multiple cases, or 15 will enter the first single case too early.

**Türkçe açıklama:** Koşul sırası, sorunun çözümünün bir parçasıdır. `if` ile başlayan tek zincirde ilk doğru dal seçilince aşağıdaki `elif` dalları denenmez. “Her koşulu ayrı ayrı kontrol et” ile “uygun tek sınıfı seç” aynı algoritma değildir.

## Repetition: define exactly which values are visited

`range(5)` visits 0, 1, 2, 3, 4. `range(1, 6)` visits 1, 2, 3, 4, 5. Both contain five values. The stop value is excluded, which lets `range(n)` repeat exactly `n` times for a nonnegative integer `n`. `range(10, 0, -1)` visits ten down to one; the negative step moves toward the excluded zero.

A `for` loop visits a supplied sequence. A `while` loop repeats while a condition is true. With `while`, identify what changes and why the condition must eventually become false. For example, subtracting one from a positive countdown moves it toward zero. Forgetting that update can produce an infinite loop.

**Türkçe açıklama:** `range(1, n)` yazınca n dahil değildir. Son değeri ezberlemek yerine üç küçük değer yaz: n = 4 için 1, 2, 3 gelir. Amaç 1'den 4'e kadar toplamaksa durma sınırı 5 olmalıdır.

## Worked example 1: an accumulator and its counter

Add the integers from one through four. `total` stores the mathematical result so far. `steps` counts executions of the addition line; it does not count every operation performed by Python.

```python
n = 4
total = 0
steps = 0
for value in range(1, n + 1):
    total = total + value
    steps = steps + 1
print(total, steps)
```

```output
10 4
```

| Iteration | `value` | `total` before | Addition | `total` after | `steps` after |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | 0 | 0 + 1 | 1 | 1 |
| 2 | 2 | 1 | 1 + 2 | 3 | 2 |
| 3 | 3 | 3 | 3 + 3 | 6 | 3 |
| 4 | 4 | 6 | 6 + 4 | 10 | 4 |

The initialization `total = 0` runs before the loop. Moving it inside would erase the previous sum every iteration, leaving only the last value, four. The counter follows the same pattern: initialize once, update once per counted event.

For general nonnegative `n`, the selected addition executes `n` times. The resulting sum is `n × (n + 1) / 2`: at four, `4 × 5 / 2 = 10`. These are different quantities. At 100, the answer is 5050 but the addition count is 100.

**Türkçe açıklama:** Sonucun büyüklüğü, işlemin kaç kez yapıldığı değildir. Para toplarken kutudaki toplam tutar ile kutuya kaç kez para koyduğun ayrı sayılardır. `total` birinciyi, `steps` ikinciyi izler.

## Worked example 2: count a grid row by row

For each of three rows, visit each of three columns. The inner loop restarts for every outer iteration.

```python
n = 3
steps = 0
for row in range(n):
    for column in range(n):
        steps = steps + 1
        print(row, column, steps)
print("Total:", steps)
```

```output
0 0 1
0 1 2
0 2 3
1 0 4
1 1 5
1 2 6
2 0 7
2 1 8
2 2 9
Total: 9
```

| Outer value | Inner values | Work in this row | Accumulated work |
| --- | --- | --- | --- |
| 0 | 0, 1, 2 | 3 | 3 |
| 1 | 0, 1, 2 | 3 | 6 |
| 2 | 0, 1, 2 | 3 | 9 |

There are `n` rows and `n` visits per row, so the body executes `n × n = n²` times. Doubling `n` from three to six changes nine visits to 36: `36 / 9 = 4`. Both dimensions doubled.

Two nested loops do not automatically mean `n²`. If each row contains only two visits, the total is `2n`. If row lengths differ, add their lengths. Always inspect the actual bounds.

**Türkçe açıklama:** İç içe döngüyü bir dikdörtgen gibi düşünmek, yalnızca her satır aynı uzunluktaysa doğrudur. İç sınır dış değişkene bağlıysa önce satırların uzunluklarını yaz; çarpım formülünü otomatik uygulama.

## Halving: count reductions precisely

The integer-halving loop applies floor division until at most one remains. Trace actual updates rather than substituting an approximate search estimate.

```python
remaining = 1000
reductions = 0
while remaining > 1:
    remaining = remaining // 2
    reductions = reductions + 1
    print(reductions, remaining)
print("Reductions:", reductions)
```

```output
1 500
2 250
3 125
4 62
5 31
6 15
7 7
8 3
9 1
Reductions: 9
```

For starting sizes 1000, 10 000, 100 000 and 1 000 000, the counts are **9, 13, 16 and 19**. Odd values round downward: 125 // 2 is 62. This program counts size reductions; it does not inspect a target, maintain a search interval or perform a final candidate comparison. Therefore its exact counts are not the exact guessing-game counts from Week 1. The shared idea is slow growth under repeated halving.

**Türkçe açıklama:** “Yaklaşık yarıya indirme” fikri doğru olsa da sayaç, yazdığın kodun olaylarını sayar. Son adayın kontrolü bu döngüde yoktur. Arama adımı ile tamsayı bölme adımını aynı saymak bir eksik veya bir fazla sonuca götürebilir.

## Three practice problems with complete solutions

### Practice 1 — visits and accepted values

Inspect every integer from one through six and count the even values. How many values are inspected, and how many pass the test?

#### Solution 1

```python
n = 6
visited = 0
even_count = 0
for value in range(1, n + 1):
    visited = visited + 1
    if value % 2 == 0:
        even_count = even_count + 1
print(visited, even_count)
```

```output
6 3
```

The visited values are 1, 2, 3, 4, 5, 6. The accepted values are 2, 4, 6. Thus six tests produce three successes. At `n = 5`, the counts become five and two. **Türkçe:** Koşul yanlış olduğunda o değer yine incelenmiştir; yalnızca başarı sayacı artmaz.

### Practice 2 — stopping and skipping

First, test positive integers in order until finding one whose square exceeds 1000. How many tests occur? Second, sum one through 20 while skipping multiples of three. Find the sum, skipped count, and total visits.

#### Solution 2

`31² = 961` is too small and `32² = 1024` exceeds 1000. Testing from one finds 32 after 32 tests; a `break` then ends the loop. A counter placed before the condition includes that successful final test.

The full sum is `20 × 21 / 2 = 210`. Skipped numbers are 3, 6, 9, 12, 15, 18, totaling `3 × (1 + 2 + 3 + 4 + 5 + 6) = 3 × 21 = 63`. The desired sum is `210 − 63 = 147`, with six skips and 20 visits. `continue` skips the remaining body for one iteration; it does not terminate the loop. **Türkçe:** `break` aramayı bitirir, `continue` sadece mevcut adayın kalan işlemlerini atlar.

### Practice 3 — unequal row lengths

For `i` from one through `n`, let `j` run from `i` through `2i`, including both endpoints. Count the inner-body executions for `n = 3`, then write a general expression. This follows the lesson's Chapter 2 problem 2-35.

#### Solution 3

| `i` | `j` values | Row count |
| --- | --- | --- |
| 1 | 1, 2 | 2 |
| 2 | 2, 3, 4 | 3 |
| 3 | 3, 4, 5, 6 | 4 |

An inclusive interval from `i` to `2i` contains `2i − i + 1 = i + 1` values. Total work is `2 + 3 + ... + (n + 1) = n(n + 1)/2 + n = (n² + 3n)/2`. At three, `(9 + 9)/2 = 9`. Python needs `range(i, 2 * i + 1)` to include `2i`. **Türkçe:** Sondaki `+1`, iki uç dahil olduğundan gelir; uzunluk hesabında en sık kaybolan adımdır.

## The chapter connections, without rushing

Problem 2-32 alternates squares: at five, `1 − 4 + 9 − 16 + 25 = 15 = 5 × 6 / 2`. Pairing adjacent terms explains the cancellation; testing examples alone is evidence, not a proof for every input. For even `k`, the result is `−k(k + 1)/2`; for odd `k`, it is positive.

To see why, take an odd number `a` followed by `a + 1`. Their square difference is `a² − (a + 1)² = −2a − 1 = −(a + (a + 1))`. For even `k`, pairing every term therefore gives the negative sum from one through `k`. For odd `k`, the first `k − 1` terms give `−(k − 1)k/2`; adding the last square gives `k² − (k − 1)k/2 = (2k² − k² + k)/2 = k(k + 1)/2`.

Problem 2-34 counts gifts. Day `d` gives `d(d + 1)/2` gifts, so four days give `1 + 3 + 6 + 10 = 20`. The cumulative formula is `n(n + 1)(n + 2)/6`. A loop adding the daily formula runs once per day: its addition count is `n`, even though the gift total grows like a cubic expression. State what you are counting before discussing growth.

**Türkçe açıklama:** İşaretli karelerde iki komşu terimi birlikte açınca büyük kareler birbirini götürür; tek sayıda terim varsa son kareyi ayrıca ekleriz. Hediyelerde ise toplam hediye sayısı ile günlük toplamı hesaplayan kodun işlem sayısı ayrıdır. Formülü kullanmak, her hediyeyi tek tek ziyaret etmek anlamına gelmez.

## Misconceptions, glossary and repair

| Misconception | Correction |
| --- | --- |
| Every nested loop has square growth | Check inner bounds and add row counts |
| Resetting the accumulator each round is harmless | It erases previous work |
| A counter measures all running time | It measures the event where you increment it |
| Testing many values proves a formula | A general argument must cover all allowed values |

| English | Türkçe | Meaning |
| --- | --- | --- |
| Condition | Koşul | A true-or-false test |
| Iteration | Yineleme | One visit through a loop |
| Accumulator | Biriktirici | A value storing the running result |
| Counter | Sayaç | A value recording events |
| Loop body | Döngü gövdesi | The repeated indented instructions |
| Termination | Sonlanma | Reaching a condition that ends the process |

For readiness, explain why a four-by-four grid makes 16 visits and why five even numbers among ten still require ten inspections. Explain where `total = 0` belongs. **Answers:** four rows each contain four visits; every candidate needs a test; initialization belongs before accumulation begins.

If uncertain, use `n = 3`, write each visited value, and mark the counted line before increasing the input. Week 4 applies these counters to stored lists, scans, searches and pair comparisons.

# Week 04 — Lists: Holding Many Things at Once

[Original lesson](w4/index.html)

## The big question

**What happens to the work when the data gets bigger?**

A list stores many values without a separate variable for each. Reading a known position, scanning every value, and comparing pairs are different jobs with different costs.

Read and modify lists, trace scans and searches, construct filtered results, and explain aliasing. Justify a running maximum and distinguish condition tests from successful updates.

## Retrieve with answers

| Question | Answer and reason |
| --- | --- |
| Which values does `range(4)` visit? | 0, 1, 2, 3; the stop value is excluded. |
| Where should a running total start? | Before the loop, normally at zero. |
| What does `break` do? | End the loop immediately after the current instructions reach it. |
| Do two nested loops always give `n²` operations? | No. The count depends on the number of inner visits for each outer value. |

Keep a small list on paper; predict each visited value before running code.

## Positions, values and changes

For `scores = [72, 88, 45, 91, 63]`, the length is five. The indices are 0 through 4, so `scores[0]` is 72 and `scores[4]` is 63. `scores[-1]` also accesses the last value. Index 5 is outside this list and raises `IndexError`.

The slice `scores[1:4]` produces `[88, 45, 91]`: start at index one and stop before index four. A single index retrieves one value; a slice creates a list of the selected values. A full slice, `scores[:]`, creates a new outer list containing all the existing values.

**Türkçe açıklama:** “Üçüncü eleman” günlük dilde sıra numarasıdır; Python'daki indeksi 2'dir. İndeks ile elemanın değerini de ayır: `scores[2]` içindeki 2 konumu, sonuç olan 45 ise o konumdaki veriyi gösterir.

`append(value)` adds an item at the end. `pop()` removes and returns the final item. `scores[0] = 75` replaces the value at an existing position. `append` modifies the list and returns `None`, so `scores = scores.append(80)` mistakenly replaces the useful name with `None`. However, `removed = scores.pop()` is valid because `pop` deliberately returns the removed value.

Reading a valid known index has constant growth cost in the usual list model: Python need not inspect all earlier entries. Searching for an unknown value may require inspecting the whole list. This does not promise identical measured time on every access; it describes dependence on list length.

## Worked example 1: four answers from one scan

Compute the total, mean, number passing at 60, and maximum of the lesson's five scores. Assume a nonempty list so its first value initializes `best` and its length divides the total.

```python
scores = [72, 88, 45, 91, 63]
total = 0
passed = 0
best = scores[0]
for score in scores:
    total = total + score
    if score >= 60:
        passed = passed + 1
    if score > best:
        best = score
mean = total / len(scores)
print(total, mean, passed, best)
```

```output
359 71.8 4 91
```

| Score | Total calculation | Passes afterward | Maximum afterward |
| --- | --- | --- | --- |
| 72 | 0 + 72 = 72 | 1 | 72 |
| 88 | 72 + 88 = 160 | 2 | 88 |
| 45 | 160 + 45 = 205 | 2 | 88 |
| 91 | 205 + 91 = 296 | 3 | 91 |
| 63 | 296 + 63 = 359 | 4 | 91 |

The mean is `359 / 5 = 71.8`. Passing values are 72, 88, 91 and 63. Each iteration performs several operations; there is one traversal. Doubling the length doubles its iterations.

Why initialize `best` from the data instead of zero? If the permitted data were `[-8, -3, -6]`, a starting zero would never be replaced and would falsely appear as the maximum. The first real item supplies a valid candidate.

**Türkçe açıklama:** Başlangıç değeri, çözümün doğruluğunu etkiler. Toplam için sıfır uygundur; en büyük değer için her zaman uygun değildir. Boş listede ise “ilk eleman” yoktur: ya boş girdiyi baştan dışlamalı ya da onun için ayrı bir sonuç belirlemelisin.

## Why the running maximum is correct

After inspecting some items, maintain this promise: **`best` is the largest of the inspected items.** This is a loop invariant. It is true initially because the first item is the largest of a one-item collection. For a new item, there are two cases. If it exceeds `best`, replace `best`. Otherwise keep `best`, which is at least as large as the newcomer. After the final item, the inspected prefix is the whole list.

Not every previous item exceeds the newcomer. For `[2, 9]` followed by 5, the previous 2 is smaller than 5, but maximum 9 remains correct. This distinction matters in Chapter 2 problem 2-6.

**Türkçe açıklama:** Korunan bilgi “önceki tüm sayılar büyük” değildir; “öncekilerin en büyüğü elimizde” bilgisidir. Her yineleme bu bilgiyi koruyunca son durumda bütün listenin cevabını elde ederiz. Buna değişmez denir çünkü doğru kalan ifade, döngü boyunca aynı yapıdadır.

## Worked example 2: finding a value versus knowing its index

Search the lesson's name list for `"Dilek"`. Record its first index and count equality comparisons.

```python
names = ["Ada", "Bilal", "Cem", "Dilek", "Ece"]
target = "Dilek"
found_index = -1
looks = 0
for index in range(len(names)):
    looks = looks + 1
    if names[index] == target:
        found_index = index
        break
print(found_index, looks)
```

```output
3 4
```

| Index | Compared value | Match? | Looks so far |
| --- | --- | --- | --- |
| 0 | Ada | No | 1 |
| 1 | Bilal | No | 2 |
| 2 | Cem | No | 3 |
| 3 | Dilek | Yes; stop | 4 |

Index three means the fourth item, so four comparisons are correct. The `-1` is a chosen “not found” marker here; do not immediately use it as `names[-1]`, which would access the last name. A missing target requires five comparisons, and `found_index` remains `-1`.

If a successful target is equally likely to occupy any of `n` positions, the average comparison count is `(1 + 2 + ... + n) / n = (n + 1)/2`. For five names this is three. Without that probability assumption, “average” is unspecified; a workload containing many misses can be much more expensive.

**Türkçe açıklama:** `target in names` aynı işi daha kısa yazabilir, fakat liste içinde arama maliyetini ortadan kaldırmaz. Kaynak kodun kısalığı ile incelenen eleman sayısı farklı ölçülerdir.

## Constructing lists and understanding shared objects

Filtering keeps selected values; transforming calculates new ones. From `[72, 88, 45]`, filtering for at least 60 gives `[72, 88]`; adding five gives `[77, 93, 50]`. The comprehension `[score + 5 for score in scores]` means: visit each score, add five, collect the results. Every score is still visited.

`list(range(4))` constructs `[0, 1, 2, 3]`. The lesson's `random.sample` produces distinct values, useful for a no-duplicates test. Deliberately include duplicates to test successful detection too.

For aliasing, `a = [1, 2]` followed by `b = a` makes two names refer to the same list. `b.append(3)` changes that shared list, so both names show `[1, 2, 3]`. Reassigning `b = [9]` instead attaches `b` to another list and leaves `a` unchanged. Names are not permanently tied together.

**Türkçe açıklama:** Atama bir listeyi otomatik kopyalamaz. İki isim aynı kutuyu gösterebilir; kutunun içini değiştirmek ikisinden de görünür. İsmi başka bir kutuya yönlendirmek ise önceki kutunun içini değiştirmez. `a[:]` yeni bir dış liste oluşturur; iç içe listelerde iç nesneler yine paylaşılabilir.

## Three practice problems with complete solutions

### Practice 1 — statistics and safe copying

For `[12, 7, 30, 4, 18]`, find the total, mean, minimum and maximum. Create an independent outer list, append 99 to it, and state both final lists.

#### Solution 1

Total: `12 + 7 + 30 + 4 + 18 = 71`; mean: `71 / 5 = 14.2`; minimum: four; maximum: 30. Assign this list to `original`, use `copy = original[:]`, then `copy.append(99)`. The original stays `[12, 7, 30, 4, 18]`; the copy becomes `[12, 7, 30, 4, 18, 99]`. **Türkçe:** Tam dilim, bu sayı listesinin dış yapısını bağımsızlaştırır.

### Practice 2 — build a filtered result

From `[3, 8, 2, 9, 4]`, keep the even values in their original order. Give both a readable loop and an equivalent comprehension. Does finding three matches require only three tests?

#### Solution 2

```python
data = [3, 8, 2, 9, 4]
evens = []
for value in data:
    if value % 2 == 0:
        evens.append(value)
compact = [value for value in data if value % 2 == 0]
print(evens)
print(compact)
```

```output
[8, 2, 4]
[8, 2, 4]
```

Five values are tested, but only 8, 2 and 4 are appended. Both versions perform five tests; shortening the notation does not reduce that count. **Türkçe:** Çıktının uzunluğu üç, girdinin uzunluğu beştir. Filtreleme koşulunu reddedilen elemanlarda da denemek zorundayız.

### Practice 3 — repeated searches and all distinct pairs

Twenty missing-target searches each scan 10 000 items. Find the total comparisons. Separately, compare every item with every later item in a four-item list, with no early stop. Enumerate the index pairs and generalize to `n` items.

#### Solution 3

The searches require `20 × 10 000 = 200 000` comparisons. For four items, the pairs are `(0,1)`, `(0,2)`, `(0,3)`, `(1,2)`, `(1,3)`, `(2,3)`. Row counts are three, two, one and zero, totaling six. For `n` items the total is `(n − 1) + (n − 2) + ... + 1 = n(n − 1)/2`.

At 100, 200 and 400 items, this gives `100 × 99 / 2 = 4950`, `200 × 199 / 2 = 19 900`, and `400 × 399 / 2 = 79 800`. Doubling gives close to four times the comparisons, not exactly four for these finite sizes. **Türkçe:** Her çifti bir kez sayıyoruz; `(0,1)` ile `(1,0)` aynı iki elemanı tekrar karşılaştırmak olurdu.

## A careful extension: tests versus updates

Chapter 2 problem 2-45 counts new minimum assignments, not all comparisons. In a uniformly random ordering of `N` distinct values, the second item becomes a new minimum with probability `1/2`, the third with probability `1/3`, and so on. Expected updates after initialization are `1/2 + 1/3 + ... + 1/N`.

For four items: `1/2 + 1/3 + 1/4 = 6/12 + 4/12 + 3/12 = 13/12`, about 1.083 updates. Each run makes an integer number; the fraction averages possible orders. Three comparisons still occur. The lesson indexes zero through `n`, so `N = n + 1`; check that convention before substituting.

**Türkçe açıklama:** Nadir güncellenen bir değişken, tüm algoritmanın az çalıştığını göstermez. Daha küçük bir değer çıkmasa bile sıradaki eleman karşılaştırılır. Olasılık hesabı ayrıca farklı değerler ve eş olasılıklı sıralamalar varsayar.

## Misconceptions and glossary

| Misconception | Correction |
| --- | --- |
| Assigning a list name copies its contents | Assignment can create a second reference to the same list |
| Every mutating method returns `None` | `append` does; `pop` returns the removed item |
| A fast update count makes the whole scan fast | Comparisons still occur for every candidate |
| “Average search” always means half the list | Specify where targets occur and how often searches fail |

| English | Türkçe | Meaning |
| --- | --- | --- |
| Index | İndeks | A position used to access an item |
| Slice | Dilim | A selected interval of positions |
| Traversal | Tarama | Visiting items in a collection |
| Aliasing | Aynı nesneye farklı adlarla erişim | Multiple names refer to one object |
| Invariant | Döngü değişmezi | A claim preserved through iterations |
| Expected count | Beklenen sayı | Probability-weighted average over specified cases |

## Readiness, repair and Review A

Explain why a missing search over six values needs six comparisons, why two names can display the same appended item, and why a four-item all-pairs scan needs six comparisons. **Answers:** every candidate must be rejected; the names may share one list; the row counts are `3 + 2 + 1 + 0`.

If any answer is uncertain, draw the list with indices, draw arrows from names to the list, or enumerate pairs on paper. Then change one input and predict the outcome again. Complete [Review A — Weeks 1–4](#review-a) before moving on: this is the built-in consolidation point for instructions, types, loops and lists. Week 5 packages a process into a function and measures it with a stopwatch. Clear inputs, correct outputs and meaningful counts come first.

# Week 05 — Functions and trustworthy timing

[Original lesson](w5/index.html)

## The question for this week

**How can we run the same piece of work with different inputs, then measure it without measuring something else by accident?**

Earlier weeks used variables and loops to describe algorithms. This week packages those steps into functions and adds a stopwatch. These are separate skills: a function can be correct while its benchmark is misleading, and a carefully measured function can still calculate the wrong answer. Check correctness first, timing second.

By the end, you should be able to explain a parameter, an argument, and a return value; define a reusable function; place a timer around a clearly stated task; repeat measurements; distinguish clock resolution from practical measurement accuracy; and choose between `perf_counter` and `timeit`. You should also know what a timing table cannot establish.

**Türkçe:** Önce “hangi işi yapıyorum?” sorusunu kesinleştiririz. Fonksiyon o işi tekrar kullanmamızı sağlar; zaman ölçümü ise işin belirli bir ortamda ne kadar sürdüğünü gösterir. Doğru sonuç, doğru ölçüm ve büyüme analizi birbirinin yerine geçmez.

## Prerequisite warm-up, with answers

1. What values does `range(1, 5)` produce? **Answer:** 1, 2, 3, 4. Its stop value is excluded.
2. Starting with `total = 0`, what follows adding 1, then 2, then 3? **Answer:** the successive totals are 1, 3, 6.
3. What is 15% as a decimal? **Answer:** 15/100 = 0.15. Conversely, a fraction becomes a percentage by multiplying by 100.
4. A clock reads 12.400 seconds before work and 12.425 afterward. What elapsed? **Answer:** 12.425 − 12.400 = 0.025 seconds = 25 milliseconds.

If the last conversion was difficult, keep these equalities visible: 1 second = 1000 milliseconds; 1 millisecond = 1000 microseconds. A smaller unit produces a larger numerical reading for the same interval.

## 1. A function has an input, a job, and a result

Consider this complete program:

```python
def sum_to(n):
    total = 0
    for number in range(1, n + 1):
        total = total + number
    return total

answer = sum_to(4)
print(answer)
assert answer == 10
assert sum_to(0) == 0
```

`def` creates the function. The indented lines are its body. The name `n` is a **parameter**: a local name ready to receive a value. In `sum_to(4)`, 4 is the **argument** supplied by this particular call. The call begins the body, and `return total` hands its result to the caller. Assignment then stores that returned result in `answer`.

Defining the function does not execute its loop. Calling it does. Calling it again starts a fresh `total = 0`; it does not continue the previous call's total. Here the input contract is a non-negative integer n. Negative or fractional inputs need a separate specification rather than an accidental interpretation of `range`.

### Worked example 1 — trace before running

For n = 4, `range(1, n + 1)` becomes `range(1, 5)`.

| Moment | number | total before addition | total afterward |
|---|---:|---:|---:|
| Initialization | not assigned yet | — | 0 |
| First iteration | 1 | 0 | 1 |
| Second iteration | 2 | 1 | 3 |
| Third iteration | 3 | 3 | 6 |
| Fourth iteration | 4 | 6 | 10 |
| Return | — | 10 | caller receives 10 |

The arithmetic is 1 + 2 + 3 + 4 = 10. The table also shows why initialization belongs outside the loop. Moving `total = 0` inside would repeatedly erase earlier additions.

`print(total)` and `return total` do different jobs. Printing displays text. Returning supplies a value that another calculation can use. A function that only prints and then reaches its end returns `None`. Therefore, when `answer` unexpectedly becomes `None`, inspect the function's return paths before blaming the arithmetic.

**Türkçe:** `print` ekrana yazar; `return` çağırana değer verir. Parametre tanımdaki isimdir, argüman çağrıda verdiğimiz değerdir. Her çağrıda yerel toplam yeniden sıfırdan başlar.

## 2. Put boundaries around the measured task

`time.perf_counter()` provides a clock suitable for elapsed intervals. Its absolute reading is not a date or an execution time. Subtract two readings to obtain an interval. It is monotonic: it does not move backward when the wall clock is adjusted. This is why it is preferable to `time.time()` for these measurements.

```python
import time

def sum_to(n):
    total = 0
    for number in range(1, n + 1):
        total += number
    return total

n = 1000
start = time.perf_counter()
answer = sum_to(n)
elapsed = time.perf_counter() - start
assert answer == 500500
print("Answer:", answer)
print("Observed seconds:", elapsed)
```

This small run demonstrates timer placement. Its short duration is **not sufficient evidence for a growth classification**. Your observed number will vary. There is no fixed expected timing to copy.

For a search benchmark, decide whether the task is “search an existing list” or “construct a list and search it.” Both questions can be legitimate. They need different timer boundaries. If you claim to measure search alone, build the list before starting the clock. Keep printing outside the timed interval because formatting and console output are additional work.

Record the function, input size, input contents or generation rule, chosen case, repetition count, and summary statistic. “The algorithm took 0.02 seconds” omits almost everything another person needs to interpret the result.

## 3. Repetition, warm-up, and noise

A computer shares its resources among many tasks. Scheduling, CPU frequency, cache state, memory allocation and garbage collection can change observed time. Repeat the same stated experiment instead of trusting one lucky or unlucky run.

The lesson's minimum-of-repeats harness is useful when asking about relatively uninterrupted execution. The **minimum** is the smallest observation. The **mean** is total time divided by the number of observations. The **median** is the middle value after sorting, or the mean of the middle two when there is an even count. Report which one you use.

### Worked example 2 — summarize illustrative observations

The following values are **illustrative arithmetic data, not measurements made for this guide**: 12, 8, 9, 8, 13 milliseconds.

| Statistic | Calculation | Result |
|---|---|---:|
| Minimum | smallest of the five | 8 ms |
| Mean | (12 + 8 + 9 + 8 + 13)/5 = 50/5 | 10 ms |
| Median | sorted values 8, 8, 9, 12, 13 | 9 ms |
| Relative spread | (13 − 8)/8 × 100 | 62.5% |

If we deliberately exclude the first observation, the mean becomes (8 + 9 + 8 + 13)/4 = 38/4 = 9.5 ms. The minimum remains 8 ms. This demonstrates the arithmetic of a warm-up policy; it does not prove the first observation was a warm-up effect.

The first call **may** pay one-time costs and be slower. It is not guaranteed to be the slowest. An explicit untimed warm-up makes the policy understandable. Taking a minimum is not a universal substitute for controlling the experiment, and does not reveal a unique hardware-independent “true time.” For workloads where cold-start behavior matters, discarding it would answer the wrong question.

**Türkçe:** En küçük süre “kesin gerçek süre” değildir; gözlenen koşullardan birini temsil eder. İlk çalıştırmayı çıkarıyorsanız neden çıkardığınızı yazın. Sıcak başlangıç ile ilk kullanım performansı farklı sorulardır.

## 4. Resolution is not the same as accuracy

Clock resolution is the nominal interval the clock can distinguish. You can inspect it with `time.get_clock_info("perf_counter").resolution`. A fine clock still has call overhead, and your program still experiences noise. Many displayed decimal places do not establish equally many trustworthy digits.

Suppose a disturbance adds 0.25 ms. On a 0.5 ms task, its share is 0.25/0.5 × 100 = 50%. On a 2-second task, first convert 2 seconds to 2000 ms. The share is 0.25/2000 × 100 = **0.0125%**. Always use matching units before dividing.

Longer observations can reduce the relative effect of a fixed disturbance. However, disturbances are not all fixed, and very large inputs can introduce cache or memory effects. Use a small pilot experiment, increase sizes cautiously, and stop before an expensive trial becomes impractical. The lesson's “tens of milliseconds” advice is a practical starting point, not a universal mathematical threshold.

## 5. Tiny snippets and `timeit`

For a very short operation, time a batch of calls. If 1000 calls take total time t, the estimated average per call is t/1000. This is what `timeit` helps organize. Its standard configuration temporarily disables garbage collection during the timed work, which is helpful for some experiments but must be considered if collection is part of the workload you care about.

```python
import timeit

def sum_formula(n):
    return n * (n + 1) // 2

assert sum_formula(1000) == 500500
totals = timeit.repeat(lambda: sum_formula(1000), number=1000, repeat=3)
print("Observed total seconds for each 1000-call batch:", totals)
print("Minimum batch average per call:", min(totals) / 1000)
```

The `lambda` supplies a tiny callable that performs the chosen call; it is not an extra algorithm to learn. The measured average includes calling overhead. This block has bounded inputs and produces real observations, with no promised numeric timing.

The loop and formula give the same sum because 1 + … + n = n(n+1)/2. At n = 4, the formula gives 4×5/2 = 10. The loop performs n additions; the formula performs a fixed number of arithmetic operations under the course's unit-cost model. For arbitrarily large Python integers, arithmetic costs grow with the number of bits, so “fixed number of operations” does not mean unlimited-size arithmetic is literally free.

## 6. Graduated practice with complete solutions

### Practice 1 — make search reusable

Write `contains(data, target)` and explain why the final `False` must be outside the loop. Test `[3, 9, 4]` with targets 9 and 5, and test an empty list.

#### Solution 1

```python
def contains(data, target):
    for item in data:
        if item == target:
            return True
    return False

assert contains([3, 9, 4], 9) is True
assert contains([3, 9, 4], 5) is False
assert contains([], 9) is False
print("All three search cases passed.")
```

For target 9, comparing 3 is unsuccessful, but does not justify failure: later items remain. Only exhausting the list justifies `False`. The empty list immediately reaches that final return.

### Practice 2 — repair a measurement report

A report times list construction, search, and printing together, then calls the result “search time.” It reports one run. Give a complete repair and calculate the average of illustrative repeats 18, 12, 12 ms.

#### Solution 2

Construct the list first, choose a missing target to require a full scan, warm up according to a stated policy, then time only the search. Repeat and move printing afterward. Preserve the individual observations. The example mean is (18+12+12)/3 = 14 ms; the minimum is 12 ms. State the statistic and measured scope. If construction is intentionally included, rename the result “construction plus search time” rather than claiming the observation is meaningless.

### Practice 3 — check correctness before comparing speed

Compare the loop and formula for n = 0, 1, 4, 10. Predict the answers and explain why a timing win alone would not validate either implementation.

#### Solution 3

```python
def loop_sum(n):
    result = 0
    for value in range(1, n + 1):
        result += value
    return result

def formula_sum(n):
    return n * (n + 1) // 2

for n, expected in [(0, 0), (1, 1), (4, 10), (10, 55)]:
    assert loop_sum(n) == formula_sum(n) == expected
    print(n, expected)
```

Both methods satisfy these checks. Returning zero immediately would be extremely fast but wrong for most inputs. Test cases support correctness; the summation identity explains why the formula works for all non-negative integers.

## Misconceptions, glossary, and readiness

| Misconception | Correction |
|---|---|
| Defining a function runs its work | A call runs the body |
| Printing returns the answer | A return supplies the caller's value |
| The fastest timing proves complexity | It is an observation at one size and under one environment |
| A tiny time is automatically accurate | Clock overhead and relative noise may dominate |

| English | Türkçe | Meaning here |
|---|---|---|
| Parameter / argument | Parametre / argüman | Definition's name / call's supplied value |
| Return value | Dönüş değeri | Result handed to the caller |
| Benchmark | Performans ölçümü | A measurement with explicit scope and conditions |
| Warm-up | Isınma çalıştırması | Preparation before recorded runs |
| Resolution | Çözünürlük | Clock's nominal distinguishable interval |
| Noise | Ölçüm değişkenliği | Variation not explained solely by the algorithm |

You are ready when you can trace `sum_to(4)`, explain `None`, put a timer around search alone, and compute a repeat statistic with correct units. If returns are unclear, repair Practice 1 before timing. If percentages are unclear, redo the 0.25 ms example entirely in milliseconds. If measurements fluctuate, keep the samples and inspect scope before making a claim.

**Bridge to Week 6:** one timing answers “how long here?” Several input sizes answer “how does it change?” Bring the same function, correctness checks and measurement policy to the doubling experiment.

# Week 06 — Doubling experiments, plots, and noisy evidence

[Original lesson](w6/index.html)

## The question for this week

**When the input becomes twice as large, how much more work does the algorithm do?**

Week 5 established a repeatable task and a clearly placed stopwatch. Now change input size systematically. The purpose is to develop a useful hypothesis about growth, then check that hypothesis against the code. A measured ratio is evidence; even a beautiful table is not a proof that the same pattern holds for every future input.

The core outcomes are to build a doubling table, calculate ratios, label an ordinary plot, recognize misleading measurements, and write a defensible prediction. Logarithmic growth and log–log slopes are second-pass material: revisit them in Weeks 7–8 if the core ideas need more time. [Review B](#review-b) supplies the longer scheduled review session; use this chapter to identify what needs repair.

**Türkçe:** İki kat veri, iki kat süre demek zorunda değildir. Amacımız değişimin şeklini görmek, sonra kodun yaptığı işlemlerle açıklamaktır. Ölçümden gelen tahmin ile bütün girdiler için geçerli matematiksel kanıtı ayırmalıyız.

## Prerequisite warm-up, with answers

1. A task takes 0.12 s, then 0.48 s at double the input. What is the ratio? **Answer:** 0.48/0.12 = 4. Divide the later observation by the earlier one.
2. What does n² mean when n = 6? **Answer:** 6×6 = 36. At n = 12 it becomes 144, which is four times 36.
3. What is log₂8? **Answer:** 3, because 2³ = 8. A logarithm asks for an exponent.
4. What is wrong with timing `sorted(make_data(n))` and reporting sorting alone? **Answer:** input construction is also inside the measured call. Prepare the data before starting the sorting timer.

Keep these units distinct: n is an input size, a count is a number of chosen operations, and a duration is seconds. A ratio of two durations has no time unit because seconds cancel.

## 1. The ratio is a question about change

Write T(n) for the cost at size n. The doubling ratio is T(2n)/T(n). At the first size there is no earlier observation, so put a dash rather than inventing a meaningful first ratio.

The following table describes **ideal cost models**, not guaranteed timing behavior:

| Model | Cost at n | Cost at 2n | Doubling behavior |
|---|---|---|---|
| Constant | c | c | ratio 1 |
| Logarithmic | c log₂n | c(log₂n + 1) | adds c |
| Linear | cn | 2cn | ratio 2 |
| Linearithmic | cn log₂n | 2cn(log₂n + 1) | slightly above 2 |
| Quadratic | cn² | 4cn² | ratio 4 |
| Cubic | cn³ | 8cn³ | ratio 8 |

Here c is a positive fixed multiplier. In a timing model it incorporates implementation and machine effects that are assumed stable over the comparison. That assumption sometimes fails. Ratios can reduce the influence of a fixed multiplier; they do not magically remove every hardware effect.

### Worked example 1 — derive the quadratic ratio

Suppose a counter visits every ordered pair from n items. There are n choices for the first item and n for the second, hence n×n = n² visits.

| n | Pair visits | Ratio to preceding row |
|---:|---:|---:|
| 4 | 16 | — |
| 8 | 64 | 64/16 = 4 |
| 16 | 256 | 256/64 = 4 |
| 32 | 1024 | 1024/256 = 4 |

This is an exact deterministic count. Algebra explains every doubling: (2n)²/n² = 4n²/n² = 4 for n > 0. A finite table checks our calculations; the formula establishes the pattern for all positive n.

```python
def pair_visits(n):
    count = 0
    for first in range(n):
        for second in range(n):
            count += 1
    return count

previous = None
for n in [4, 8, 16, 32]:
    count = pair_visits(n)
    ratio = '-' if previous is None else f'{count / previous:.2f}'
    print(n, count, ratio)
    assert count == n * n
    previous = count
```

**Türkçe:** Birinci seçimin n, ikinci seçimin n olasılığı vardır. Çarpım n²’dir. n yerine 2n yazınca yalnızca bir faktör değil, iki faktör de iki katına çıkar: 2×2 = 4.

## 2. Design a doubling experiment that can finish

Choose one task and input family. A missing-target search forces a full scan; searching for the first element measures a different case. A duplicate finder can stop early when a duplicate appears, so “random data” does not automatically produce its worst case. For sorting, preserve whether the input is shuffled, already sorted, or reverse ordered.

Use a pilot size before committing to several doublings. Doubling a quadratic task four times multiplies its final cost by 4⁴ = 256. Starting at 0.1 s could lead to an approximately 25.6 s final trial under a stable quadratic model. Choosing smaller sizes is a way to keep the experiment bounded, not a way to hide poor scaling.

The following block demonstrates the mechanics on small deterministic inputs. It records actual times, so its output depends on the environment. It makes **no automatic complexity verdict** from those short observations.

```python
import time

def contains(data, target):
    for item in data:
        if item == target:
            return True
    return False

previous = None
for n in [1000, 2000, 4000, 8000]:
    data = list(range(n))
    assert contains(data, -1) is False
    samples = []
    contains(data, -1)  # explicit untimed warm-up
    for repeat in range(5):
        start = time.perf_counter()
        contains(data, -1)
        samples.append(time.perf_counter() - start)
    best = min(samples)
    ratio = '-' if previous is None or previous <= 0 else f'{best / previous:.2f}'
    print(n, 'observed seconds:', samples, 'minimum ratio:', ratio)
    previous = best
```

The list is built before timing. Repeats use the same prepared data, and printing follows the timer. For a task that mutates its input, give every timed trial a fresh equivalent input outside its timed region; otherwise later trials may solve an easier problem.

## 3. Optional second pass — logarithmic and n log n growth

For a halving loop, log₂n counts approximately how many halvings are needed to reduce n to one. The sequence n = 8, 16, 32, 64 has logarithms 3, 4, 5, 6. Doubling adds one step. Its ratios are 4/3, 5/4, 6/5: they move toward 1, even though the work is not constant.

For T(n) = n log₂n, divide the doubled model by the original:

```text
T(2n)/T(n)
= [2n × log₂(2n)] / [n × log₂n]
= [2n × (1 + log₂n)] / [n × log₂n]
= 2 + 2/log₂n.
```

At n = 16, the ratio is 2 + 2/4 = 2.5. At n = 256, it is 2 + 2/8 = 2.25. At n = 65536, it is 2 + 2/16 = 2.125. There is no single universal “sorting ratio of 2.2.” A ratio near 2 does not separate linear from linearithmic growth by itself, and adaptive sorting can exploit particular input orderings.

**Türkçe:** Logaritmik büyümede iki kat veri bir ek adım getirir. n log n için ise hem n faktörü iki katına çıkar hem logaritmaya 1 eklenir. Bu nedenle oran 2’nin biraz üstündedir ve n arttıkça 2’ye yaklaşır.

## 4. Read plots without losing the question

A linear-axis plot puts input size n horizontally and measured time in seconds vertically. State the operation counted if plotting counts instead. Include a title and a legend when comparing methods. A line connecting sampled points is an aid to reading, not evidence that all intermediate or future points were measured.

### Optional second pass — logarithmic axes and slopes

You may move directly from the ordinary-plot paragraph to Section 5 on noise. This extension can wait until Weeks 7–8; it is not required for core readiness.

A log–log plot transforms both axes. Equal spacing now represents equal multiplicative changes. Sizes 10, 100, 1000 are equally spaced in base-10 logarithms because their logs are 1, 2, 3. Zero and negative values cannot appear on ordinary logarithmic axes; never replace a zero timing with an unexplained tiny number just to make the plot work.

For a power model T = cnᵏ, logarithms give:

```text
log T = log c + k log n.
```

Define x = log n and y = log T. Then y = log c + kx, a straight line with slope k. A constant model has slope 0; linear has slope 1; quadratic has slope 2. The constant multiplier shifts the line vertically. A model such as n log n is not exactly a fixed power, so its log–log curve need not be exactly straight.

The original lesson supplies Matplotlib commands for drawing these figures. You can understand and check the transformed coordinates using a table or paper before using the plotting interface.

### Worked example 2 — calculate a slope

Use deterministic counts n², not invented timings. Between n = 4 and n = 16, the input ratio is 16/4 = 4 and the count ratio is 256/16 = 16. The log–log slope is log₂16/log₂4 = 4/2 = 2.

A line fit uses all points. Let x and y be their logged coordinates, and x̄ and ȳ their averages. The least-squares slope is the sum of `(x − x̄)(y − ȳ)` divided by the sum of `(x − x̄)²`. This is the calculation behind the lesson's `polyfit` call. Here is a version using only the standard library:

```python
import math

sizes = [4, 8, 16, 32]
counts = [n * n for n in sizes]
xs = [math.log(n) for n in sizes]
ys = [math.log(count) for count in counts]
x_mean = sum(xs) / len(xs)
y_mean = sum(ys) / len(ys)
numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, ys))
denominator = sum((x - x_mean) ** 2 for x in xs)
slope = numerator / denominator
print(f'Fitted slope of exact quadratic counts: {slope:.2f}')
assert abs(slope - 2) < 1e-12
```

`zip` pairs corresponding coordinates. A fit can summarize multiple observations, but one outlier can still affect it. Inspect the points, residuals and sampled range instead of treating the fitted slope as an unquestionable tie-breaker.

## 5. Three reasons a ratio can mislead

**Small-signal noise:** a short task can have timing variation comparable to the work itself. Repetition, batching, and cautiously increasing n may help. Merely printing more decimal places cannot.

**Fixed overhead and lower-order work:** if T(n) = 1000 + n in chosen units, T(20)/T(10) = 1020/1010 ≈ 1.01. The growth-dependent part is linear, but the setup cost dominates these sizes. A low ratio does not prove constant work.

**Changing conditions:** cache capacity, memory allocation, CPU frequency, input distribution and competing tasks can change per-item cost. A ratio above 2 for a known linear scan does not instantly make its operation count quadratic. Conversely, do not dismiss every disagreement as noise: it might expose a hidden operation or incorrect model.

An honest interpretation says what was measured, gives actual sizes and ratios, names a hypothesis, explains it using the code, identifies limitations, and states any prediction conditionally. Do not write a made-up fitted slope or crossover merely because the lesson suggests what might occur.

## 6. Graduated practice with complete solutions

### Practice 1 — classify an exact table

For n = 10, 20, 40, the chosen operation counts are A: 30, 60, 120 and B: 100, 400, 1600. Find both ratio columns and formulas consistent with the table.

#### Solution 1

A has ratios 60/30 = 2 and 120/60 = 2, consistent with 3n. B has ratios 400/100 = 4 and 1600/400 = 4, consistent with n². A formula derived from the code would justify extending these patterns. Three matching rows alone do not uniquely determine a function.

### Practice 2 — make and qualify a prediction

Illustratively, a stable quadratic model takes 0.08 seconds at n = 200. Predict n = 600. A later observation is 0.78 seconds. Find the prediction error relative to the prediction.

#### Solution 2

Input multiplier = 600/200 = 3. Cost multiplier = 3² = 9. Predicted duration = 0.08×9 = 0.72 s. Difference = 0.78−0.72 = 0.06 s. Relative error = 0.06/0.72×100 ≈ 8.33%. Report the model and difference; investigate input preparation, noise, memory behavior and lower-order terms. These numbers are an arithmetic exercise, not a benchmark performed here.

### Practice 3 — expose the hidden measurement

A wrapper builds a list, shuffles it, sorts it, and prints it inside a timer. Its ratios approach 2.2. Is sorting proved to be n log n? Give a corrected experiment and a defensible conclusion.

#### Solution 3

No. The measured task combines generation, shuffle, sort and output. Prepare deterministic shuffled inputs outside timing, preserve equivalent input conditions between trials, time sorting alone, and print afterward. Record individual samples and the summary policy. Compare the sorting implementation's known operation bound with the observations. A defensible statement is “the measured range is consistent with the proposed sorting model under these conditions,” not “the ratio proves the bound.”

## Misconceptions to repair

- “A ratio of four proves quadratic time.” It supports that model on the sampled range; count the code to justify a general bound.
- “A fitted line removes noise.” A fit can still be distorted by outliers or changing conditions; inspect the individual observations.
- “A slower run means the algorithm changed.” The operation count may be unchanged while the environment or input case differs. State both.

## Glossary, readiness, and transition

| English | Türkçe | Meaning |
|---|---|---|
| Doubling experiment | İkiye katlama deneyi | Compare costs at n, 2n, 4n |
| Ratio | Oran | Later cost divided by earlier cost |
| Log–log slope | Log–log eğimi | Relative growth on two logarithmic axes |
| Line fit | Doğru uydurma | Estimate a line from several points |
| Extrapolation | Aralık dışı kestirim | Predict beyond observed sizes |
| Cache effect | Önbellek etkisi | Changing cost when memory behavior changes |

Core readiness means deriving ratios 2 and 4, labelling an ordinary plot with input size and time units, calculating a prediction, and challenging a suspicious table. If ratios are unclear, write units on numerator and denominator. If your conclusion is stronger than the evidence, rewrite Practice 3. Use [Review B](#review-b) for those repairs.

Optional second-pass readiness means explaining how doubling affects logarithmic work and reading a log–log slope. If logs are unclear, rebuild the powers-of-two warm-up when you return to these sections in Weeks 7–8; this does not block your Week 7 core work.

**Bridge to Week 7:** the stopwatch suggests a pattern. A line-by-line operation count explains why it arises, even when a shared computer gives noisy times.

# Week 07 — Exact operation counts and dominant growth

[Original lesson](w7/index.html)

## The question for this week

**Can we explain an algorithm's work without depending on the speed of the computer that runs it?**

Week 6 supplied observational evidence. This week develops an explicit model. We choose what to count, read loop bounds carefully, derive a formula, and then simplify its growth. The exact formula and the growth description answer different questions. Keep both until you understand why terms can be ignored for one purpose but not the other.

You should finish able to count a linear scan, distinguish sequential from nested work, derive a triangular sum, handle a fixed inner bound, compare constant factors, recognize halving, and use the RAM model honestly. The later chapter problems extend the same tools to dependent triple loops and polynomial evaluation.

**Türkçe:** Süre ölçümü bilgisayardan etkilenir. İşlem sayısı için önce neyi “bir işlem” saydığımızı belirleriz. Tam formül ile büyüme sınıfı aynı şey değildir: biri belirli n için sayıyı, diğeri n büyürken davranışı anlatır.

## Prerequisite warm-up, with answers

1. How often does `range(5)` run? **Answer:** five times, for 0 through 4.
2. How many integers are in the inclusive interval 3 through 7? **Answer:** 7−3+1 = 5. Subtract endpoints and add one.
3. If one loop performs 4 operations and a later loop performs 6, how many altogether? **Answer:** 4+6 = 10, not 24.
4. If each of 4 outer iterations performs 6 inner operations, how many altogether? **Answer:** 4×6 = 24.
5. What happens to 3n² when n doubles? **Answer:** 3(2n)² = 12n², four times the original 3n².

If the second answer was not immediate, trace inclusive and exclusive ranges on paper before tackling dependent loops. Most errors below come from endpoints rather than advanced mathematics.

## 1. Declare the counted operation

Let n denote input size and T(n) denote a chosen operation count. For `sum_to(n)`, the original lesson first counts assignments:

```python
def sum_to(n):
    total = 0
    for number in range(1, n + 1):
        total = total + number
    return total

assert sum_to(5) == 15
print(sum_to(5))
```

There is one initialization of `total`, n assignments to the loop variable `number`, and n assignments updating `total`. Under that declared convention, T(n) = 1+2n. For n = 5, this is 11 assignments. If we count only additions instead, the count is n = 5. Neither number is “the exact cost” without its counting convention.

The unit-cost **Random Access Machine**, or RAM model, treats ordinary operations on machine-sized values as constant-cost steps. Arithmetic, comparisons, assignments and array access receive fixed costs. This helps compare algorithmic structure without choosing a particular laptop. It does not claim a real division and addition take identical nanoseconds.

Be careful with the word “ordinary.” Comparing arbitrarily long strings can inspect many characters. Multiplying huge Python integers can depend on their bit lengths. Calling `sorted` is not one constant-time sorting operation merely because it occupies one source line. The model must describe the work that matters.

Different representative operations often yield the same growth class when each iteration performs a bounded amount of work. Counting only the final `return` would miss an expensive loop completely. Choose a count that actually represents the expensive region.

## 2. Sequential, rectangular, fixed, and triangular loops

### Worked example 1 — four loop shapes

Count **body updates only**, excluding setup and loop-control assignments. Use n = 4 first.

| Shape | Body work | At n = 4 | General count |
|---|---|---:|---|
| Two separate loops | n updates, then n more | 4+4 = 8 | 2n |
| Full nested loops | n inner updates per outer iteration | 4×4 = 16 | n² |
| Fixed inner loop | 10 updates per outer iteration | 4×10 = 40 | 10n |
| Triangular loop | i updates for outer index i | 0+1+2+3 = 6 | n(n−1)/2 |

The fixed-inner case is the important trap. Ten is independent of n. Multiplying n by ten changes the multiplier, not the power of n. In the rectangular case, both dimensions grow with n, so their product is quadratic.

```python
n = 4
sequential = 0
for i in range(n):
    sequential += 1
for j in range(n):
    sequential += 1

rectangle = 0
fixed_inner = 0
triangle = 0
for i in range(n):
    for j in range(n):
        rectangle += 1
    for j in range(10):
        fixed_inner += 1
    for j in range(i):
        triangle += 1

print(sequential, rectangle, fixed_inner, triangle)
assert (sequential, rectangle, fixed_inner, triangle) == (8, 16, 40, 6)
```

This program verifies four specific counts; the formulas explain all n. If we instead count all assignments in the rectangular loop, the initializer contributes 1, the outer loop variable n, the inner loop variable n², and the body counter n². That gives 1+n+2n². It is not the same exact formula as n², but both have quadratic dominant growth. Differences between conventions need not be only one or two operations.

### Derive the triangular formula slowly

For the triangular loop, i takes 0, 1, …, n−1, and the inner loop runs i times. Write the sum forward and backward:

```text
S = 0 + 1 + 2 + ... + (n−1)
S = (n−1) + (n−2) + ... + 0
2S = (n−1) + (n−1) + ... + (n−1), with n terms
2S = n(n−1)
S = n(n−1)/2 = n²/2 − n/2.
```

The factor one-half does not remove the square. At n = 10 the count is 10×9/2 = 45. At n = 20 it is 20×19/2 = 190. The ratio 190/45 ≈ 4.222 is not exactly 4 because the linear term still matters. Ratios approach 4 as n grows.

**Türkçe:** İç döngü her seferinde n kez çalışmıyorsa doğrudan n×n yazmayın. Önce her dış tur için iç tur sayısını bulun, sonra toplayın. 0+1+…+(n−1), kare büyümenin yarısıdır; doğrusal büyüme değildir.

## 3. A dominant term describes large-input behavior

Consider T(n) = 5n²+200n+3000.

| n | 5n² | 200n | 3000 | Total |
|---:|---:|---:|---:|---:|
| 10 | 500 | 2000 | 3000 | 5500 |
| 100 | 50000 | 20000 | 3000 | 73000 |
| 1000 | 5000000 | 200000 | 3000 | 5203000 |

At n = 10, the constant contributes more than the squared term. At n = 1000, the squared term contributes about 96.1% of the total. Dividing the formula by n² makes the reason visible: T(n)/n² = 5 + 200/n + 3000/n². The last two terms shrink toward zero; the ratio approaches 5.

For growth classification, keep n². For predicting actual operation totals at n = 10, keep all terms. Small inputs can matter in engineering, especially if a small task runs millions of times. “Ignore lower terms” is a rule for asymptotic simplification, not permission to erase them from every calculation.

### Worked example 2 — solve a crossover

Method A costs 100n operations; method B costs n². For positive n, equality requires:

```text
100n = n²
100 = n, after dividing both sides by n.
```

| n | A: 100n | B: n² | Smaller modeled count |
|---:|---:|---:|---|
| 50 | 5000 | 2500 | B |
| 100 | 10000 | 10000 | tie |
| 1000 | 100000 | 1000000 | A |

For n > 0, B/A = n²/(100n) = n/100. At n = 1000, B uses ten times the modeled work. The operation-model crossover is exactly 100. A measured time crossover can differ because the two implementations' operations have different real costs.

**Türkçe:** Sabit çarpan küçük girdilerde sonucu değiştirebilir. Ancak 100n ile n² karşılaştırmasında n/100 oranı sınırsız büyür. Önce eşitlik noktasını hesaplayın, sonra bu noktanın hangi tarafında olduğunuzu belirleyin.

## 4. Adding a constant versus shrinking by a factor

A loop that changes i from 0 toward n using `i += 1` runs n times. A loop beginning at n and applying `i //= 2` while i > 1 shrinks much faster.

For n = 20, the halving states are 20 → 10 → 5 → 2 → 1, giving four iterations. For n = 16 they are 16 → 8 → 4 → 2 → 1, also four. For integer n ≥ 1, this floor-halving loop has floor(log₂n) iterations. For powers of two, n = 2ᵏ, the count is exactly k.

The phrase “multiply means logarithmic” needs context. Multiplying the **progress variable** by a fixed factor can make the iteration count logarithmic. An algorithm that creates twice as many recursive subproblems each level can instead produce exponential total work. Identify what quantity changes, its stopping condition, and the work per iteration.

## 5. Optional deepening — after the core check: dependent loops

First check that you can explain the four simple loop shapes in Section 2. The following chapter problems preserve the original lesson’s deeper material; their cubic formulas are not prerequisites for Week 8. Return after the core check, using the same method: start at the innermost loop, find its length, then add over the surrounding choices.

### Mystery: group by the middle index

In the mystery function, i runs from 1 to n−1; j runs from i+1 to n; k runs from 1 to j. For a fixed j, there are j−1 possible i values and j inner iterations. Thus that j contributes j(j−1).

Adding over j = 2 through n gives the sum of j² minus the sum of j. Using the standard sums:

```text
r = n(n+1)(2n+1)/6 − n(n+1)/2
  = n(n+1)[(2n+1)−3]/6
  = n(n+1)(n−1)/3
  = (n³−n)/3.
```

At n = 5, r = (125−5)/3 = 40. The dominant term is cubic. This grouping argument is stronger than merely noticing three visible loops.

### Pesky: cancel the lower endpoint

Here i runs 1 through n; j runs 1 through i; k runs j through i+j **inclusive**. The inner length is (i+j)−j+1 = i+1. Its starting position changes with j, but its length does not.

There are i choices of j, giving i(i+1) updates for each i. Summing i²+i yields n(n+1)(n+2)/3. At n = 5, the result is 5×6×7/3 = 70. The lower-degree terms explain why small-input doubling ratios are below 8; this is not timing noise, because these are exact counts.

### Foobar: a shrinking interval still has cubic total work

Take even n = 2m. The outer i runs 1 through m, j runs i through 2m−i, and the inner loop runs j times. Summing j over that interval gives its average m multiplied by its length 2m−2i+1.

Therefore the whole count is m times the sum `(2m−1)+(2m−3)+…+1`. The first m odd numbers sum to m², so total updates = m×m² = m³ = n³/8. For n = 4, there are 8 updates; for n = 10, 125. Doubling even n multiplies this exact formula by 8.

## 6. Optional deepening — polynomial evaluation

The source evaluates a₀+a₁x+…+aₙxⁿ using a running power of x. Each of n iterations updates the power with one multiplication, then multiplies by a coefficient and adds to the result. Total: **2n multiplications and n additions**. With no data-dependent early exit, those counts do not change between best, average and worst coefficient values under this model.

Horner's method rewrites the expression as a₀+x(a₁+x(a₂+…)). Work from the highest coefficient downward. For 2−3x+x²+4x³ at x = 2:

| Step | Horner calculation | New running value |
|---|---|---:|
| Start | highest coefficient | 4 |
| Include x² coefficient | 4×2+1 | 9 |
| Include x coefficient | 9×2−3 | 15 |
| Include constant | 15×2+2 | 32 |

Direct substitution agrees: 2−6+4+32 = 32. Horner uses n multiplications and n additions: half the multiplications of this particular running-power method. Both are linear in the number of coefficients. The “naive” method here does not recompute every power from scratch; that would be a different implementation with different counts.

## 7. Graduated practice with complete solutions

### Practice 1 — exact count versus growth

Count body updates for two sequential loops of lengths n and 3n, followed by one fixed loop of length 7. Evaluate n = 5 and simplify the growth.

#### Solution 1

Sequential regions add: n+3n+7 = 4n+7 updates. At n = 5, that is 20+7 = 27. The dominant term is linear. The exact value 27 depends on including the final seven updates; the growth class does not.

### Practice 2 — implement and verify the triangle

Count `count += 1` in an outer `range(n)` and inner `range(i)`. Verify n = 0, 1, 4, 8, and explain the ratio from 4 to 8.

#### Solution 2

```python
def triangular_count(n):
    count = 0
    for i in range(n):
        for j in range(i):
            count += 1
    return count

for n, expected in [(0, 0), (1, 0), (4, 6), (8, 28)]:
    actual = triangular_count(n)
    assert actual == n * (n - 1) // 2 == expected
    print(n, actual)
print('Ratio from 4 to 8:', 28 / 6)
```

The ratio is 28/6 ≈ 4.667. The formula has a negative linear term, so the small-size ratio is not exactly four. Do not calculate ratios whose denominator is zero, such as the count at n = 1.

### Practice 3 — optional challenge: verify Horner's arithmetic and savings

Evaluate coefficients `[2, -3, 1, 4]` at x = 2 using Horner, count multiplications, and compare with the lesson's running-power method. State what n means.

#### Solution 3

```python
coefficients = [2, -3, 1, 4]
x = 2
degree = len(coefficients) - 1
value = coefficients[-1]
multiplications = additions = 0
for i in range(degree - 1, -1, -1):
    value = value * x + coefficients[i]
    multiplications += 1
    additions += 1
print(value, multiplications, additions)
assert (value, multiplications, additions) == (32, 3, 3)
```

Here n is polynomial degree 3, and there are n+1 = 4 coefficients. The running-power method uses 6 multiplications and 3 additions. Horner saves 3 multiplications. The result and the asymptotic class are unchanged; the operation count improves.

## Misconceptions, glossary, and readiness

| Misconception | Correction |
|---|---|
| Two loops always mean n² | Bounds and nesting determine the count |
| Every operation choice is equally informative | The count must represent the expensive work |
| A factor of one-half makes a quadratic linear | A constant multiplier does not change the exponent |
| An exact counter's nonideal ratio must be noise | Lower-order terms can explain it exactly |
| Theory disagreeing with timing is automatically wrong | Inspect the model, implementation and measurement conditions |

| English | Türkçe | Meaning |
|---|---|---|
| Basic operation | Temel işlem | The operation explicitly being counted |
| Dominant term | Baskın terim | Fastest-growing part of a cost formula |
| Constant factor | Sabit çarpan | Multiplier independent of input size |
| Triangular sum | Üçgensel toplam | A sum of consecutive increasing counts |
| RAM model | RAM hesaplama modeli | Constant-cost operations on machine-sized values |
| Horner's method | Horner yöntemi | Nested multiply-and-add polynomial evaluation |

You are ready when you can derive 2n, n², 10n and n(n−1)/2 without guessing from indentation alone. If not, trace n = 4 and label the counted update. The dependent triple-loop proofs and Horner challenge can wait. When revisiting them, redo the inclusive-length warm-up and the pesky cancellation. If exact counts and growth labels are mixed together, keep two separate columns in your answers.

**Bridge to Week 8:** now that you can justify a cost formula, you are ready to express an upper bound precisely and distinguish it from a tight description of growth.

# Week 08 — Big-O, precise bounds, cases, and space

[Original lesson](w8/index.html)

## The question for this week

**What exactly are we promising when we say an algorithm is O(n²)?**

The earlier weeks built evidence and exact operation counts. Big-O expresses an eventual upper bound. It does not say an algorithm always takes exactly n² steps, always needs quadratic time, or is slower than every linear algorithm at every input size.

Your outcomes are to write an upper bound with a constant and starting size, distinguish upper and tight bounds, analyze visible and hidden loops, name the input case, and report extra space separately from time. The original lesson also introduces Ω, Θ, little-o and little-ω, growth-order puzzles, and sums. The core route is Sections 1 and 3–6, then Practices 1–2: a simple explicit O bound, growth families, input cases, and time versus memory. Section 2’s strict notation and cubic proof, Section 7, and Practice 3 are optional second-pass extensions, not prerequisites for Week 9. [Review C](#review-c) contains the longer scheduled review session.

**Türkçe:** Big-O bir üst sınırdır. “En fazla bu biçimde büyür” der; “tam olarak böyle büyür” demez. Hangi durumun maliyetini, hangi işlem modeliyle ve hangi girdi büyüklüğüne göre sınırladığımızı açıkça belirtmeliyiz.

## Prerequisite warm-up, with answers

1. Simplify 7n+300 for growth. **Answer:** its dominant term is linear. Keep the full expression when calculating a particular count.
2. Is 5n ≤ 5n² for integer n ≥ 1? **Answer:** yes, because n ≤ n² on that domain.
3. Are two sequential n-step loops quadratic? **Answer:** no; n+n = 2n, a linear count.
4. What is the exact mean of comparison counts 1 through 1000? **Answer:** (1+1000)/2 = 500.5, not exactly 500.
5. Does a function returning a copied list need extra storage? **Answer:** yes; a copy of n references occupies space proportional to n under the usual model.

## 1. Read the definition one part at a time

For nonnegative costs, write T(n) = O(g(n)) when there are constants c > 0 and n₀ such that:

```text
T(n) ≤ c × g(n) for every n ≥ n₀.
```

T is the cost we are bounding. g is the comparison function, such as n or n². The multiplier c may be generous but must be fixed: it cannot secretly change with n. The starting size n₀ lets a finite initial part behave differently. The phrase **for every n ≥ n₀** is essential. Checking three large examples is not the same as proving the inequality thereafter.

### Worked example 1 — exhibit a complete upper bound

Let T(n) = 7n+300. We want a bound proportional to n. Choose c = 10 and n₀ = 100.

For every n ≥ 100, multiplying the inequality n ≥ 100 by 3 gives 3n ≥ 300. Therefore:

```text
T(n) = 7n + 300
     ≤ 7n + 3n
     = 10n.
```

We have justified the same constants for every n ≥ 100, so T(n) = O(n). These are not the only valid constants. For n ≥ 1, 300 ≤ 300n gives T(n) ≤ 307n, so c = 307 and n₀ = 1 also work. A proof needs one valid pair, not the smallest possible pair.

This cost is also O(n²), since n ≤ n² for n ≥ 1. That looser upper bound is true but less informative. This is why “O(n²)” alone cannot establish a quadratic doubling ratio or rule out linear behavior on every input.

**Türkçe:** c ve n₀ birer kanıt tanığıdır. c’yi n’ye bağlı seçemeyiz. Tek bir n’de eşitsizliğin doğru olması yetmez; seçtiğimiz başlangıçtan sonraki bütün n değerleri için gerekçe gerekir.

## 2. Optional second pass — upper, lower, tight, and strict relationships

| Notation | Meaning for sufficiently large n | Example |
|---|---|---|
| f = O(g) | f is at most a fixed multiple of g | n = O(n²) |
| f = Ω(g) | f is at least a positive fixed multiple of g | n² = Ω(n) |
| f = Θ(g) | both upper and lower bounds hold | 3n+2 = Θ(n) |
| f = o(g) | f/g approaches zero | n = o(n²) |
| f = ω(g) | f/g grows without bound | n² = ω(n) |

The ratio descriptions assume positive comparison functions and the stated limits exist. Θ means growth within constant factors, not numerical equality. Since 3n/n = 3, 3n = Θ(n), but 3n is neither o(n) nor ω(n). A smaller coefficient is not a strictly smaller asymptotic order.

A lower bound on one algorithm's running time is also different from a lower bound on the **problem**. To show every correct algorithm must read n inputs in a worst case requires an argument about necessary information, not merely counting one implementation's loop.

### Worked example 2 — prove a tight cubic bound

Let f(n) = n³−3n²−n+1. For n ≥ 10, divide by the positive quantity n³:

```text
f(n)/n³ = 1 − 3/n − 1/n² + 1/n³.
```

Since 3/n ≤ 0.3 and 1/n² ≤ 0.01, discarding the positive last term gives f(n)/n³ ≥ 1−0.3−0.01 = 0.69 ≥ 0.5. Also −3n²−n+1 ≤ 0 for n ≥ 1, so f(n) ≤ n³. Thus, for every n ≥ 10:

```text
0.5n³ ≤ f(n) ≤ 1n³.
```

We have c₁ = 0.5, c₂ = 1, and n₀ = 10, establishing Θ(n³). At n = 10, f(10) = 1000−300−10+1 = 691, between 500 and 1000. That numerical check illustrates the already-established inequalities; it is not their proof.

## 3. Growth families and what their labels do not promise

For positive fixed exponents and fixed exponential bases greater than one, the familiar eventual ordering is:

```text
1 < log n < √n < n < n log n < n² < n³ < 2ⁿ < 3ⁿ < n!
```

Here `<` describes eventually slower growth, not an inequality that must hold at every tiny n. Logarithm bases differ by a constant factor: log₂n = ln(n)/ln(2). Exponential bases are different: 3ⁿ/2ⁿ = (3/2)ⁿ grows without bound, so 3ⁿ is not O(2ⁿ).

For an exact model T(n) = cn², quadrupling n multiplies T by 16. For a mere upper bound T(n) = O(n²), that precise prediction is not justified. To estimate seconds, state a model fitted to a measured range and assume relevant conditions stay comparable. O notation does not provide its coefficient.

Likewise, 2ⁿ doubles when n increases by **one**. When n doubles, 2²ⁿ = (2ⁿ)². Under an illustrative machine model of ten million unit operations per second, n = 1,000,000 linear steps take 0.1 s; n² steps take 100,000 s, approximately 27.8 hours. These are unit-operation estimates, not real benchmark results.

## 4. Analyze the code's actual work

For statements in sequence, add costs. For nested loops, add each iteration's body cost; multiplication is the shortcut when a common bound applies. Do not decide solely by counting loop keywords.

| Region | Reason | Time bound |
|---|---|---|
| `len(data)` for a Python list | stored length | O(1) |
| One pass summing n machine-sized values | n bounded updates | O(n) |
| Every ordered pair | n×n comparisons | O(n²) |
| `sorted(data)` | sorting work inside the built-in | O(n log n) worst-case upper bound |
| Last ten elements of that sorted result | at most ten copied references | O(1) additional slicing time |

The original report function combines these regions. Its total is O(1)+O(n)+O(n²)+O(n log n), hence O(n²). If the inner pair loop is limited to a fixed ten valid indices, that region becomes O(n); sorting becomes the dominant upper bound. Use `range(min(10, n))` if the data can contain fewer than ten items.

Hidden work matters. Membership `x in a_list` may scan the list. Inserting at the front shifts references. Copying a list or taking a slice of length k costs O(k). If a loop over n queries scans a separate list of m items, report O(nm); reduce to O(n²) only when both lengths are tied to n.

## 5. State best, worst, and average cases explicitly

Big-O can bound a best-case, worst-case, or average-case function. It does **not inherently mean worst case**. This course often discusses worst-case guarantees, but the case should still be named.

For linear search in a nonempty list of n items, counting equality tests:

| Case | Assumption | Exact comparisons |
|---|---|---:|
| Best | target is first | 1 |
| Worst | target absent or last | n |
| Average successful | one target position, uniformly distributed | (n+1)/2 |

The average follows from adding 1+2+…+n = n(n+1)/2, then dividing by n equally likely positions. If absence is possible, or target positions are not equally likely, this model changes. “Average n/2” without a distribution is incomplete.

```python
def search_count(data, target):
    comparisons = 0
    for item in data:
        comparisons += 1
        if item == target:
            return True, comparisons
    return False, comparisons

data = [10, 20, 30, 40]
for target in [10, 40, 99]:
    print(target, search_count(data, target))
assert search_count(data, 10) == (True, 1)
assert search_count(data, 99) == (False, 4)
assert search_count([], 99) == (False, 0)
```

The worst-case count is Θ(n) and the nonempty best case Θ(1). A Θ(n²) worst case can coexist with fast special inputs, but cannot coexist with a uniform O(n) bound over **all** inputs of each size.

**Türkçe:** Ortalama durum için olasılık varsayımı gerekir. Aranan öğe her konumda eşit olasılıkla bulunuyorsa ortalama (n+1)/2 olur. Big-O sembolü tek başına “en kötü durum” kelimelerini içermez; durumu ayrıca yazmalıyız.

## 6. Time and extra space are different accounts

Extra, or auxiliary, space excludes the input supplied to the algorithm. State whether returned output is included in your accounting. A scan keeping a total uses O(n) time and O(1) auxiliary variables. Building every ordered pair creates n² output items, so output space itself is Θ(n²).

An in-place reverse swaps endpoints inward. Its time is Θ(n), auxiliary space O(1), and it mutates the input. A reverse made by appending items in backward index order also takes Θ(n) time, but creates an O(n) result and preserves the original.

```python
data = [1, 2, 3, 4]
reversed_copy = []
for index in range(len(data) - 1, -1, -1):
    reversed_copy.append(data[index])
assert reversed_copy == [4, 3, 2, 1]
assert data == [1, 2, 3, 4]
print(data, reversed_copy)
```

The original lesson's alternative `result = [x] + result` has the same O(n) peak result size but repeatedly copies the growing prefix. Its time is quadratic: approximately 1+2+…+n copied positions. Equal output and space requirements do not imply equal time. Also, an in-place function without `return` returns `None`, even though its input list has been reversed successfully.

## 7. Optional deepening — after the core check: chapter proof toolkit

### Bound each lower-order term

For n ≥ 1, every power nⁱ with i ≤ k is at most nᵏ. A polynomial's absolute value is therefore at most `(sum of absolute coefficients) × nᵏ`. The coefficient sum is a constant. This supplies a general O(nᵏ) proof and handles negative coefficients safely.

For f = n√n+n² and g = n², n√n ≤ n² when n ≥ 1, so f ≤ 2g. For f = n²−n+1 and g = n²/2, the lower terms are nonpositive once n ≥ 1, so f ≤ n² = 2g. These are explicit witnesses, not only dominant-term labels.

### Combine bounds with a shared starting point

If f₁ ≤ c₁g₁ after n₁ and f₂ ≤ c₂g₂ after n₂, use n₀ = max(n₁,n₂). For nonnegative functions, adding gives f₁+f₂ ≤ max(c₁,c₂)(g₁+g₂). Multiplying gives f₁f₂ ≤ c₁c₂g₁g₂. Lower-bound versions use the same idea; for sums choose the smaller positive lower multiplier.

### Understand sums before simplifying

| Sum | Reasoning | Growth |
|---|---|---|
| 1+…+n | n(n+1)/2 | Θ(n²) |
| √1+…+√n | upper n√n; last half supplies a matching lower bound | Θ(n³ᐟ²) |
| 1+1/2+…+1/n | grouping or integral bounds between logarithmic quantities | Θ(log n) |
| ceiling(1/i), summed for i=1…n | each term is exactly 1 | Θ(n) |
| log 1+…+log n | equals log(n!) | Θ(n log n) |
| 1+2+4+…+2ⁿ | 2ⁿ⁺¹−1 | Θ(2ⁿ) |

For log(n!), upper-bound each log i by log n: total ≤ n log n. At least the last n/2 terms have i ≥ n/2, giving a lower bound near (n/2)log(n/2). Together these establish Θ(n log n). Taking logs of the geometric sum 2ⁿ⁺¹−1 instead gives Θ(n).

For positive powers, summing iᵏ up to n gives Θ(nᵏ⁺¹). Do not apply “n times the largest term” indiscriminately: a geometric sum is Θ(its last term), and a harmonic sum behaves differently again.

### Distinguish constants, bases, and variable exponents

Expressions 2ⁿ⁻¹, 2ⁿ and 2ⁿ⁺¹ differ only by fixed factors, so share a Θ class. Expressions 2ⁿ and 3ⁿ do not. `(1/3)ⁿ` shrinks toward zero, while a constant such as 6 stays fixed. For a fixed shift a and positive fixed exponent b, `(n+a)ᵇ = Θ(nᵇ)` once n is sufficiently large that the base is positive.

For variable exponents, take logs carefully. `log₂(n^(log₂n)) = (log₂n)²`, whereas `log₂(n log₂n) = log₂n + log₂log₂n`. Parentheses change the function. Both are eventually below `log₂((log₂n)^n) = n log₂log₂n`, but they are not the same expression.

The source’s second ordering puzzle compares the sum √1+…+√n, the polynomial 12n³ᐟ²+4n, n^(√log₂n), and (√n)^(log₂n). The first two tie at Θ(n³ᐟ²). Set L = log₂n. The variable exponents of the last two are √L and L/2. Both eventually exceed the fixed exponent 3/2, and L/2 exceeds √L once L > 4. Thus the tied pair grows slowest, then n^(√log₂n), then (√n)^(log₂n). The ties describe growth, not equal numeric values.

Some pairs are not eventually comparable. If B(n) = n^(cos(πn/8)), then along n = 16k its value is n, while along n = 8+16k its value is 1/n. Against A(n) = √n, the ratio alternates between tending toward zero and growing without bound along these subsequences. Neither an eventual O nor Ω relationship holds. A single growth ladder does not cover every oscillating function.

## 8. Graduated practice with complete solutions

### Practice 1 — provide constants, not just a label

Show 3n²+2n+5 = O(n²) for integer n ≥ 1. Give c and n₀.

#### Solution 1

Since n ≤ n² and 1 ≤ n², the expression is at most 3n²+2n²+5n² = 10n². Thus c = 10 and n₀ = 1 work. It is also Ω(n²) because the nonnegative extra terms leave it at least 3n², so it is Θ(n²).

### Practice 2 — reveal hidden work and memory

A function starts an empty list `seen`, scans n input values, and appends a value only if it is not already in `seen`. Give worst-case time and space, and identify a contrasting easy input.

#### Solution 2

When every input is distinct, the membership scans inspect 0, 1, …, n−1 stored items. Total comparisons are n(n−1)/2, giving Θ(n²) worst-case time. The result grows to n items, giving O(n) extra space. When all values are equal, `seen` stays length one, and after the first insertion each membership check succeeds immediately: Θ(n) time and O(1) result size for that particular family. The case and storage convention must accompany the labels.

### Practice 3 — optional challenge: order four functions and explain the sum

Order n²log₂n, n(log₂n)², the sum 1+2+4+…+2ⁿ, and the log₂ of that sum. Mark any ties.

#### Solution 3

The sum equals 2ⁿ⁺¹−1, so it has exponential growth. Its base-2 logarithm lies between n and n+1 for n ≥ 1, so it is Θ(n). Compare n(log₂n)² with n²log₂n by dividing both by positive n log₂n: the remaining comparison is log₂n versus n. The ordering is:

```text
log₂(1+2+4+…+2ⁿ) < n(log₂n)² < n²log₂n < 1+2+4+…+2ⁿ.
```

There are no ties among these four growth rates. The reasoning uses identities and eventual comparisons, not a few numerical samples.

## Misconceptions to repair

- “O(n²) means exactly quadratic.” An upper bound can be loose; a linear function also satisfies it.
- “Big-O always means worst case.” The symbol specifies a bound; name the case and, for averages, the distribution.
- “Linear memory implies linear time.” The copying-reversal example keeps only linear peak storage while repeatedly doing growing copies.

## Glossary and readiness

| English | Türkçe | Meaning |
|---|---|---|
| Upper bound | Üst sınır | Eventual ceiling up to a fixed multiplier |
| Lower bound | Alt sınır | Eventual floor up to a positive multiplier |
| Tight bound | Sıkı sınır | Matching upper and lower growth bounds |
| Worst case | En kötü durum | Largest cost among inputs of a fixed size |
| Average case | Ortalama durum | Expected cost under a specified distribution |
| Auxiliary space | Ek alan | Storage beyond the supplied input |
| Hidden loop | Gizli döngü | Input-dependent work inside a built-in |

You are ready when you can exhibit c and n₀, explain why O(n²) can be loose, calculate the successful-search mean, and give separate time and space accounts. If a bound feels like a guess, redo Practice 1 using inequalities. If you mix cases, write three separate rows for search. Use [Review C](#review-c) to repair those core gaps. Strict small-o/omega, oscillation examples, and extended function ordering are optional: when returning to them, simplify powers, logs, and sums before comparing. They need not be mastered before Week 9.

**Bridge to Week 9:** four correct anagram methods will apply these distinctions. You will compare strategy, operation counts, input contracts, hidden built-in work and memory rather than choosing a winner from a complexity label alone.

# Week 09 — One problem, four strategies

[Original lesson](w9/index.html)

## The big question

How can four correct programs solve the same problem with very different amounts of work? This week brings the course together: define the problem, trace a program, count its work, describe its growth, and measure carefully before choosing an implementation.

The problem is **anagram detection**. Two strings are anagrams when they contain exactly the same characters, with the same number of occurrences of each character. Order may differ. `"aab"` and `"aba"` are anagrams; `"aab"` and `"abb"` are not. Merely containing the same *kinds* of letters is insufficient.

The core route is the input contract, four strategies, two worked traces, and Practices 1–2. Practice 3 and the multiplication section are optional deepening. They preserve the source lesson's further questions without adding prerequisites for Week 10.

By the end, you should explain why marking prevents reuse, why sorting hides work, why permutation generation becomes expensive, and why counting solves the fixed-alphabet problem in linear time. You should also distinguish a proved operation bound from a measured speed comparison.

## Warm-up, with answers

1. Are `"ab"` and `"aab"` anagrams? **No.** Their lengths differ, so their multiplicities cannot all agree.
2. Are `""` and `""` anagrams? **Yes.** Both have zero copies of every character. The empty case is a valid input.
3. What is 1 + 2 + 3 + 4? **10**, also 4 × 5 / 2. This triangular sum will describe checking off.
4. What does 4! mean? **4 × 3 × 2 × 1 = 24.** It counts orderings of four distinct positions.
5. Is `sorted(word)` constant-time because it is one expression? **No.** The called operation processes the characters and constructs a result.

**Türkçe:** Anagram, yalnızca “aynı harfler var” demek değildir. Her harfin *kaç kez* geçtiği de aynı olmalıdır. `aab` ve `abb` aynı harf türlerini içerir fakat a ve b sayıları farklıdır. Önce doğru koşulu belirlemezsek hızlı çalışan yanlış bir çözüm üretebiliriz.

## Agree on a contract before comparing costs

For the main comparison, inputs are Python strings containing only the 26 ASCII letters `a` through `z`. Uppercase letters, spaces, punctuation, accents, and Turkish characters such as `ı` are outside this contract. There is no automatic case conversion or removal of spaces. Unequal lengths return `False`; equal empty strings return `True`.

The counting implementation depends on this restriction. Its index is `ord(letter) - ord('a')`: `a` gives 0, `b` gives 1, and `z` gives 25. A different character can produce an invalid index or even a valid negative Python index with the wrong meaning. A real interface should validate its input or define an explicit normalization policy before calling this restricted implementation. Calling `.lower()` alone does not turn arbitrary Unicode text into ASCII.

Let n mean the common length after the length check. We count character comparisons or tally updates under the usual unit-cost model. “Extra space” excludes the input strings and includes temporary lists. Exact selected-operation counts are not exact counts of all Python instructions.

## Strategy 1 — Find a partner and mark it used

For each character in the first string, search the second string for an unused equal character. Convert the second string to a list because Python strings cannot be changed. Replace a matched entry with `None`, a marker unequal to every character under our contract.

```python
def checking_off(s1, s2):
    if len(s1) != len(s2):
        return False
    letters = list(s2)
    for letter in s1:
        found = False
        for i in range(len(letters)):
            if letters[i] == letter:
                letters[i] = None
                found = True
                break
        if not found:
            return False
    return True

assert checking_off("aab", "aba") is True
assert checking_off("aab", "abb") is False
assert checking_off("", "") is True
print("Checking-off examples passed")
```

`break` leaves only the inner search loop. `found` is reset for each new letter. A failed search returns immediately, because one missing occurrence is enough to reject the pair.

### Worked example 1 — Repeated letters and an exact count

Trace `s1 = "aab"`, `s2 = "aba"`. Count each evaluation of `letters[i] == letter`, including comparisons against a crossed-off entry.

| Letter requested | Positions inspected, from index 0 | Match index | List after matching | Comparisons |
| --- | --- | --- | --- | --- |
| first a | a | 0 | [None, b, a] | 1 |
| second a | None, b, a | 2 | [None, b, None] | 3 |
| b | None, b | 1 | [None, None, None] | 2 |

Total = 1 + 3 + 2 = **6**. Notice that individual searches did not cost 3, then 2, then 1. The list never shrank. Instead, each successful match used a different original position. For a genuine length-n anagram, those match positions are exactly 0 through n − 1 in some order. Their search costs are therefore exactly 1 through n in some order.

Total comparisons = 1 + 2 + … + n = n(n + 1)/2. This argument works even with repeated letters. For n = 4 the total is 10; for n = 8 it is 36. The ratio 36/10 = 3.6 is near 4, not exactly 4, because the formula also contains a linear term. The worst-case time is Θ(n²), and the copied list requires Θ(n) extra space.

**Türkçe:** Silinen elemanın yeri listeden kaldırılmıyor; `None` oluyor. Bu nedenle “her turda liste bir eleman kısalır” açıklaması bu kod için yanlıştır. Üçgensel toplamın nedeni, başarılı eşleştirmede her konumun bir kez kullanılmasıdır. İşaretleme olmazsa aynı a harfini iki kez kullanıp yanlışlıkla `True` döndürebiliriz.

## Strategy 2 — Put both strings in a common order

Sorting makes equal multisets look identical. Repeated letters are preserved: `"aab"` sorts to `[a, a, b]`, while `"abb"` sorts to `[a, b, b]`.

```python
def sort_and_compare(s1, s2):
    if len(s1) != len(s2):
        return False
    return sorted(s1) == sorted(s2)

print(sort_and_compare("listen", "silent"))  # True
print(sort_and_compare("aab", "abb"))        # False
```

A usual worst-case bound for comparison sorting is O(n log n). Two sorts plus a comparison give O(n log n) + O(n log n) + O(n), hence O(n log n). The two sorted lists use O(n) extra space. The factor 2 disappears from the growth class, but the second sort still performs real work.

This is an upper-bound analysis, not a promise of exactly n log n comparisons. Python sorting adapts to existing order. Actual character distributions, repeated values, and implementation details matter. Short code can be a good engineering choice, but its cost must still be accounted for.

## Strategy 3 — Generate candidates until one matches

Brute force tries arrangements of input positions. The generator yields one tuple at a time. `"".join(candidate)` builds a string from that tuple, and the comparison checks whether it is the target.

```python
from itertools import permutations

def brute_force(s1, s2):
    if len(s1) != len(s2):
        return False
    for candidate in permutations(s1):
        if "".join(candidate) == s2:
            return True
    return False

print(brute_force("abc", "cab"))  # True
print(brute_force("aaa", "aab"))  # False; exhausts 3! candidates
print(brute_force("", ""))        # True
```

There are n! positional permutations. With repeated characters, different positional permutations can produce the same string: `"aab"` has 3! = 6 positional permutations but only 3!/2! = 3 distinct strings. This code still visits the duplicate candidates. It does not automatically remove them.

The candidate count is factorial, but the full code also joins n characters for each candidate. Exhausting the generator therefore costs **Θ(n × n!)** under our model. Reporting O(n!) alone describes a unit-cost-per-candidate simplification, not the full implementation. Early success may stop much sooner; worst-case statements concern inputs that force all candidates to be tried.

The generator avoids storing n! results at once. It still holds O(n) state and creates length-n candidates and strings, so auxiliary space is O(n), not O(1). Keep classroom runs very small. The examples above never exceed six candidates.

**Türkçe:** “Üreteç kullanmak” zaman maliyetini ortadan kaldırmaz. Üreteç bütün sonuçları aynı anda belleğe koymaz, ama gerektiğinde yine bütün adayları üretir. Ayrıca her adayın n harfini birleştirmek de iş gerektirir. Aday sayısı ile aday başına maliyeti ayrı ayrı yazmalıyız.

## Strategy 4 — Count occurrences directly

Use one slot per allowed letter in each string. The exact positions no longer matter; only their totals matter.

```python
def count_and_compare(s1, s2):
    # Contract: every character is an ASCII letter from a through z.
    if len(s1) != len(s2):
        return False
    counts1 = [0] * 26
    counts2 = [0] * 26
    for letter in s1:
        counts1[ord(letter) - ord('a')] += 1
    for letter in s2:
        counts2[ord(letter) - ord('a')] += 1
    for i in range(26):
        if counts1[i] != counts2[i]:
            return False
    return True

assert count_and_compare("aab", "aba")
assert not count_and_compare("aab", "abb")
assert count_and_compare("", "")
print("Counting examples passed")
```

### Worked example 2 — A frequency table is a correctness argument

For `"aab"` and `"aba"`, the relevant slots are:

| Slot | Character | First string | Second string | Equal? |
| --- | --- | --- | --- | --- |
| 0 | a | 2 | 2 | yes |
| 1 | b | 1 | 1 | yes |
| 2 through 25 | c through z | all 0 | all 0 | yes |

After k characters of the first loop, its tally records exactly the occurrences in the first k characters. Initially k = 0 and every tally is zero. Processing one more character increments precisely its slot, preserving that statement. At the end, the table is correct for the whole string. The same argument applies to the second string. Comparing all slots therefore checks exactly the anagram definition.

For a true pair, selected work = n first-string updates + n second-string updates + 26 comparisons = **2n + 26**. At n = 3 that is 32; at n = 1,000 it is 2,026. This excludes initialization and index arithmetic, whose inclusion does not change the linear class. A false pair may stop the final comparison before slot 25.

Two 26-slot lists occupy a fixed number of slots: O(1) extra space with respect to n in the usual word model. If alphabet size k is variable, the corresponding bounds are O(n + k) time and O(k) slots. If memory is measured in individual bits, storing increasingly large counts also matters; the constant-slot statement is not a claim of constant bits for unbounded n.

## Compare evidence fairly

| Method | Worst-case time under the stated model | Auxiliary space | Main lesson |
| --- | --- | --- | --- |
| Checking off | Θ(n²) | Θ(n) | repeated searching adds up |
| Sort and compare | O(n log n) | O(n) | built-ins hide substantial work |
| Brute-force code above | Θ(n × n!) | O(n) | candidate count and cost both matter |
| Count, fixed alphabet | Θ(n) | O(1) slots | choose a representation matching the question |

These are deterministic selected counts for genuine anagrams, not benchmark measurements:

| n | Checking-off comparisons n(n + 1)/2 | Tally updates plus final checks 2n + 26 |
| --- | --- | --- |
| 250 | 31,375 | 526 |
| 500 | 125,250 | 1,026 |
| 1,000 | 500,500 | 2,026 |
| 2,000 | 2,001,000 | 4,026 |

The formulas establish growth; finitely many observations only support it. To measure the implementations, prepare identical valid input pairs outside the timer, check their answers, repeat, and report sizes and input family. Genuine anagrams fully exercise checking off and counting, but need not be worst-case sorting or brute-force inputs. Do not include brute force in a large-input timing loop.

Python's built-in sorting may beat a Python-level counting loop at measured sizes. These upper bounds do not guarantee that a sort/count crossover will appear in your chosen input family. Report “no crossover observed up to n = …” if that is what happened. A timing table without an actual run should be labelled illustrative, never presented as measured evidence.

For occasional short words, sorting offers a compact implementation. For a fixed alphabet and stringent time or memory needs, counting is a strong candidate. Choose using the contract, representative measurements, maintainability, and memory budget. The anagram *problem* is tractable; one inefficient algorithm does not make the problem intractable.

## Three graduated practice problems

### Practice 1 — Explain a rejection

Trace checking off for `"aab"` and `"abb"`. Count comparisons and explain why reusing a match would be wrong.

#### Solution 1

The first a matches index 0 in one comparison. The list becomes `[None, b, b]`. The second a tests all three entries and fails, so the function returns `False` after 1 + 3 = **4 comparisons**. It never processes the final b. Without marking, both a requests could reuse index 0, giving a false positive. The six-comparison formula applies to genuine length-3 anagrams, not every rejected input.

**Türkçe:** İkinci a için yeni bir a gerekir. Daha önce kullanılan eşleşme tekrar kullanılamaz; bu yüzden `None` işareti doğruluğun bir parçasıdır.

### Practice 2 — Rearranged digits

Decide whether two lists containing integers 0–9 have the same multiplicities, using one tally list. Explain each phase and test an empty case, a true pair, and a false pair.

#### Solution 2

Add one for each occurrence in the first list; subtract one for each occurrence in the second. At the end, slot d stores “first count of digit d minus second count of digit d”. Every slot must be zero. `all(...)` returns `True` only if every generated condition is true.

```python
def same_digits(a, b):
    # Contract: list items are integers from 0 through 9.
    if len(a) != len(b):
        return False
    balance = [0] * 10
    for digit in a:
        balance[digit] += 1
    for digit in b:
        balance[digit] -= 1
    return all(value == 0 for value in balance)

assert same_digits([], [])
assert same_digits([3, 1, 4, 1], [1, 4, 3, 1])
assert not same_digits([1, 1, 2], [1, 2, 2])
assert not same_digits([1], [1, 1])
print("Digit tests passed")
```

For the false equal-length pair, the final balances are +1 at digit 1 and −1 at digit 2. Time is Θ(n) in the worst case and extra space is ten slots, O(1). **Türkçe:** Toplama ve çıkarma iki ayrı sayacı tek bir “fark sayacı”na dönüştürür. Sıfır toplam tek başına yetmez; *her kutunun* sıfır olması gerekir.

### Practice 3 — Optional challenge: estimate factorial growth honestly

Suppose exhaustive candidate generation at n = 9 takes one second in an illustrative constant-cost-per-candidate model. Predict n = 12 and n = 15. Then account for a cost proportional to n per candidate. Do not run those sizes.

#### Solution 3

The candidate-count multiplier from 9 to 12 is 12!/9! = 10 × 11 × 12 = 1,320. The prediction is 1,320 seconds = **22 minutes**. From 9 to 15 it is 10 × 11 × 12 × 13 × 14 × 15 = 3,603,600, giving 3,603,600/86,400 ≈ **41.71 days**.

In the full n × n! model, multiply again by the candidate-length ratio. For n = 12: 1,320 × 12/9 = 1,760 seconds, about 29.33 minutes. For n = 15: 3,603,600 × 15/9 = 6,006,000 seconds, about 69.51 days. These are model-based extrapolations, not measurements or guarantees about hardware. They also assume exhaustion, not an early successful match.

## Optional deepening — Other representations and multiplication

The source's fifth implementation, `collections.Counter`, generalizes the tally idea using a dictionary of observed characters. For ordinary hash-table assumptions it takes expected O(n) time and O(k) space for k distinct characters. It supports more characters than the fixed ASCII table; this changes the contract. Its exact performance must be measured rather than assumed.

```python
from collections import Counter

def anagram_counter(s1, s2):
    return Counter(s1) == Counter(s2)

print(anagram_counter("şiş", "işş"))  # True: same exact Unicode characters
print(anagram_counter("aab", "abb"))  # False
```

The chapter's multiplication problems ask the same strategic question with a different input-size definition: n is now the **number of digits**, not the numeric value.

Repeated addition computes x × y with y additions. An n-digit base-b integer can be as large as bⁿ − 1. The running result needs at most 2n digits, so digit-by-digit addition costs O(n), not O(1). The worst-case bound is O(n × bⁿ). For fixed b, that is exponential in the input's digit length.

Grade-school multiplication pairs each of n digits with each of n digits: n² single-digit products, plus O(n²) work for carrying and adding rows. For fixed base, the total is Θ(n²).

For example, 23 × 14 = 23 × 4 + 23 × 10 = 92 + 230 = **322**. The two-by-two digit multiplication uses four digit products: 3 × 4, 2 × 4, 3 × 1, and 2 × 1. Carrying and adding are additional work. Repeated addition instead adds 23 fourteen times. At twenty digits, “400” counts digit products in long multiplication, not every elementary step; the alternative can require nearly 10²⁰ additions. A smarter representation of the task changes the growth dramatically.

**Türkçe:** 999 sayısının değeri 999, basamak sayısı 3'tür. Girdi boyutunu 3 kabul ediyorsak 999 tekrar, boyuta göre küçük bir sabit değildir. Algoritma analizinde önce n'nin neyi ölçtüğünü söylemek bu yüzden zorunludur.

## Misconceptions to repair

- “Same letters means anagram.” Count repeated occurrences as well as letter types.
- “Nested loops always mean n².” Here the exact successful count is triangular; prove the bounds from the actual searches.
- “A generator uses no growing memory.” It avoids storing all results, but its state and current candidate still grow.
- “A linear upper bound guarantees the fastest Python code.” Correctness, implementation, input family, and measured sizes still matter.
- “Four measurements prove the class.” A general count argument proves a bound; measurements test the model's relevance.

## English–Turkish glossary

| English | Türkçe | Meaning here |
| --- | --- | --- |
| anagram | anagram | equal character multiplicities, any order |
| multiplicity | tekrar sayısı | how many occurrences an item has |
| input contract | girdi koşulları | assumptions the implementation requires |
| checking off | eşleştirip işaretleme | consume each matching occurrence once |
| permutation | permütasyon | an ordering of positions or elements |
| tally / frequency | sayım / sıklık | count associated with each symbol |
| auxiliary space | ek bellek | working storage beyond input |
| crossover | performansın kesiştiği boyut | an observed or modelled change of winner |

## Readiness, repair, and the Week 10 bridge

You are ready when you can explain the repeated-letter example, name the work hidden in sorting and joining, derive 2n + 26 under the stated count convention, and choose a method with one explicit assumption. You do not need to master factorial extrapolation or digit-complexity proofs before progressing.

If matching is unclear, redraw Practice 1 and physically cross out each used position. If counts are unclear, tally `"aab"` and `"abb"` by hand before rereading the loops. If class and timing are getting mixed together, write two separate sentences: “Under this model, the bound is …” and “On these measured inputs, implementation … was faster.”

Week 10 compares data structures and the costs of their operations. Carry forward this week's main habit: a representation is useful because it makes the operations your problem needs cheaper or clearer. The array of counts worked because the question was about frequency, not order.

# Week 10 — The real cost of list operations

[Original lesson](w10/index.html)

## The big question

**Why can two loops with the same number of iterations have very different costs?** Because the operation inside each iteration may become more expensive as the list grows. This week connects the counting methods you already know to ordinary list operations. You do not need to memorize Python internals. You need to recognize when work means a direct access, a search, a shift, or a copy.

By the end, explain why indexing is constant time, why front operations are linear, and why repeated front insertion becomes quadratic. Explain amortized append without claiming every append is equally fast. Rewrite a list-building method while preserving its output, and distinguish the memory used by the answer from additional working memory.

**Türkçe:** Döngünün kaç kez çalıştığını bilmek tek başına yeterli değildir. Her turda yapılan iş büyüyor mu? Bir kutuya doğrudan ulaşmak ile bütün kutuları bir yer kaydırmak aynı maliyette değildir. Bu hafta kodu ezberlemek yerine bu farkı görmeyi öğreniyoruz.

## Prerequisite warm-up, with answers

For `data = [10, 20, 30, 40]`, answer three questions before continuing. What are `data[2]`, `data[1:3]`, and the number of items inspected when searching for the missing value 99 from left to right?

**Answers:** Indexing begins at zero, so `data[2]` is 30. A slice includes its start and excludes its stop, so `data[1:3]` creates `[20, 30]`. The missing-value search checks all four items. Indexing chooses a known position; membership must discover whether a suitable position exists.

Now add `0 + 1 + 2 + 3`. The answer is 6. Pair the ends: `0 + 3 = 3` and `1 + 2 = 3`, giving `2 × 3 = 6`. This small sum will explain a large performance problem.

## Read the operation before counting the loop

A Python list stores an ordered sequence of references. A reference points to an object; moving a reference is different from copying the object's entire contents. The list knows where its slots begin and how many slots it uses.

If slot numbers start at zero, reaching slot i uses a location calculation. It does not visit slots 0 through i first. This is why `data[i]` has O(1) cost in the usual list model. By contrast, a search for a value may inspect every slot, so its worst case is O(n), where n is the current list length.

| Operation | Work to count | Time model |
| --- | --- | --- |
| Read or replace `data[i]` | Reach one slot | O(1) |
| `len(data)` | Read the stored length | O(1) |
| `data.append(x)` | Add one reference, occasionally resize | O(1) amortized |
| `data.pop()` | Remove from the end, occasionally resize | O(1) amortized in the dynamic-array model |
| `data.insert(0, x)` | Shift the existing n references | O(n) |
| `data.pop(0)` | Shift the remaining n − 1 references | O(n) |
| `x in data` | Search until found or exhausted | O(n) worst case |
| `data[a:b]` with k selected items | Make a new list of k references | O(k) |
| `a + b`, lengths n and m | Make a new list with both sequences | O(n + m) |
| `sum(data)` | Visit each number | O(n) |

These models assume simple, fixed-size values and comparisons. Comparing two very long strings introduces another input size. An O(n) operation also does not necessarily inspect n elements on every call: a search can find its answer immediately.

## Worked example 1 — Four front insertions

Start empty and insert 0, 1, 2, 3 at the front. Count only the old references that must shift, separately from writing the new item.

| Incoming value | Before insertion | Old references shifted | After insertion |
| --- | --- | --- | --- |
| 0 | `[]` | 0 | `[0]` |
| 1 | `[0]` | 1 | `[1, 0]` |
| 2 | `[1, 0]` | 2 | `[2, 1, 0]` |
| 3 | `[2, 1, 0]` | 3 | `[3, 2, 1, 0]` |

Total shifts are `0 + 1 + 2 + 3 = 6`. There are also four writes for the new values. For n insertions, shifts are `0 + 1 + ... + (n − 1)`.

Write this sum forwards and backwards. Each paired column becomes n − 1, and there are n columns. Thus twice the sum is `n(n − 1)`. Divide by two: **shifts = n(n − 1)/2**. Including the n new writes gives `n(n − 1)/2 + n = (n² + n)/2`, which is O(n²).

At n = 1,000, shifts are `1,000 × 999 / 2 = 499,500`. At n = 2,000, they are `2,000 × 1,999 / 2 = 1,999,000`. The ratio is about 4.002, approaching four rather than being exactly four.

**Türkçe:** Her turda n kaydırma yapılmıyor; ilk turda sıfır, sonra bir, iki, üç yapılıyor. Bu yüzden kesin sayı bir toplamdır. O(n²) dememizin nedeni toplamın büyümesini n² teriminin belirlemesidir. Dört kat ifadesi büyük girdiler için yaklaşık büyüme davranışını anlatır.

Preserve the output when improving the method. Appending produces ascending order here; front insertion produces descending order. This replacement does the same job:

```python
data = []
for value in range(4):
    data.append(value)
data.reverse()
assert data == [3, 2, 1, 0]
print(data)
```

Appending n items costs O(n) total and reversing costs another O(n). Add the phases: `O(n) + O(n) = O(n)`. Consecutive phases add; they do not multiply.

## Worked example 2 — Copying the growing answer

Consider `result = result + [value]`. The plus operation builds a new list. With values 0 through 3, the new list lengths are 1, 2, 3, 4. Therefore 10 references are placed into newly built lists: `1 + 2 + 3 + 4 = 10`.

For n values this becomes `n(n + 1)/2`. At n = 1,000 it is 500,500 reference placements, versus 1,000 ordinary append writes plus occasional resizing. Both methods create the same ordered result, but they do not perform the same amount of copying.

A full slice has the same danger when repeated. Copying an n-item list once takes O(n) time and O(n) space. Copying it n times costs O(n²) time. If each temporary copy replaces the previous one, peak extra space may still be O(n). If all copies are stored, extra space becomes O(n²). **Total work and peak simultaneous storage answer different questions.**

**Türkçe:** Bellek hesabında “şimdi aynı anda kaç öğe tutuluyor?” diye sorarız. Zaman hesabında ise işlem boyunca yapılan bütün kopyalamaları toplarız. Bir milyon kopyalama adımı, aynı anda bir milyon öğe saklandığı anlamına gelmez.

## Slow concept — Amortized does not mean random average

Imagine a teaching model whose capacity doubles when full: 1, 2, 4, 8, 16. Capacity means available slots; length means occupied slots. Python's exact growth policy is implementation-specific, so this is an explanatory model, not its literal allocation schedule.

To append eight items, suppose resizing copies 1, then 2, then 4 old references. The total is 7 copies, plus 8 new writes: 15 units. The average over this sequence is `15/8 = 1.875` units per append, although the append that crosses capacity four performs more work than an ordinary append.

For n = 2ᵏ items, where k is a nonnegative integer, the copies are `1 + 2 + ... + n/2 = n − 1`. Including n writes gives `2n − 1`. Dividing by n gives `2 − 1/n`, less than two. For other n, the geometric sum still gives a constant multiple of n total work. That is the reason for **O(1) amortized per append**.

Amortized analysis spreads the total cost across a sequence of operations. It does not assume random inputs or claim an individual operation cannot be slow. A resizing append may be O(n) in the worst case. Both statements can be true.

**Türkçe:** Amortize maliyet, pahalı işlemin ücretini çok sayıda ucuz işleme bölüştürmektir. “Ortalama kullanıcıda hızlıdır” demiyoruz. Belirli bir işlem dizisinin toplam maliyetini sınırlıyoruz. Tek bir eklemenin pahalı olması, bütün eklemelerin pahalı olduğu anlamına gelmez.

## Three graduated practice problems

### Problem 1 — Identify the hidden work

A list contains six items. How many old references shift when removing its front? How many references are copied by `data[1:4]` on the original list? What is the worst-case number of equality checks for a missing value?

#### Solution 1 — Separate three different actions

Removing the front leaves five items, all of which shift left: **five shifts**. The slice selects indices 1, 2, 3: **three copied references**, O(k) with k = 3. The missing-value search inspects all six: **six equality checks**, O(n). The slice does not include index 4. These counts concern the original six-item list separately, not three consecutive operations on a changing list.

### Problem 2 — Empty a queue

Jobs `["A", "B", "C", "D"]` must be processed in arrival order. Repeatedly removing index zero shifts how many references in total? Give a suitable alternative and its total cost.

#### Solution 2 — Keep the order and change the container

The shifts are `3 + 2 + 1 + 0 = 6`. For n jobs, they total `n(n − 1)/2`, so removal work is O(n²). A deque supports end operations without shifting the entire remaining sequence.

```python
from collections import deque

queue = deque(["A", "B", "C", "D"])
processed = []
while queue:
    processed.append(queue.popleft())
assert processed == ["A", "B", "C", "D"]
print(processed)
```

Construction is O(n); n left removals are O(n); collecting the answer is O(n). Total time remains O(n), with O(n) storage. A deque is suitable for this queue, but its middle indexing is not a constant-time replacement for list indexing.

### Problem 3 — Diagnose a timing experiment

A benchmark starts with 100,000 items and calls `pop()` 200,000 times. It also reports that a single front removal doubles in time when n doubles. What must be corrected, and what can the timing support?

#### Solution 3 — Validate the experiment before its conclusion

The pop benchmark exhausts the list after 100,000 removals and raises `IndexError` on the next one. It cannot produce the claimed complete result. Use no more removals than available items, or benchmark an explicitly described balanced append/pop workload. Those are different experiments.

For single front removals, prepare a fresh list before each timed operation and keep construction outside that timing. A near-two ratio supports a linear shifting model. It does not prove a complexity bound. Timing an entire queue drain answers a different question and should approach a fourfold ratio instead.

## Misconceptions to repair

“One Python statement is one unit of work” fails for slicing, searching, summing, and concatenation. Name the hidden operation. “Append is always O(1)” needs the amortized qualifier. “Faster code is equivalent code” fails when list order changes.

For text, collecting pieces and joining once avoids relying on repeated reconstruction. Measure total characters as well as piece count. Some interpreter contexts optimize repeated string concatenation, so a particular `+=` timing need not show a quadratic curve. Do not manufacture a fourfold result. The general concatenation caution is documented in [Python's sequence documentation](https://docs.python.org/3/library/stdtypes.html#immutable-sequence-types).

## Small English–Turkish glossary

| English | Türkçe and meaning |
| --- | --- |
| Reference | Başvuru: an address-like link to an object |
| Shift | Kaydırma: move existing references to adjacent slots |
| Copy | Kopyalama: create another sequence of references |
| Capacity | Kapasite: allocated slots, including unused ones |
| Amortized cost | Amortize maliyet: total sequence cost divided across operations |
| Peak extra space | En yüksek ek bellek: additional storage alive at the same time |

## Readiness, repair, and the next bridge

You are ready when you can derive the triangular sum, explain an expensive append without contradicting amortized O(1), and preserve a queue's order while improving its cost. If the sum feels mysterious, rebuild the four-row insertion table with six values. If space and time blur together, draw which copies are alive simultaneously. If timing feels decisive, state the operation count before looking at seconds.

Next week keeps the same question but changes the dominant operation: instead of shifting a list repeatedly, you will search it repeatedly. A set can help, provided its missing order and duplicate information do not change the answer.

# Week 11 — Sets, dictionaries, and preparing once

[Original lesson](w11/index.html)

## The big question

**How can we answer many membership questions without scanning the same list every time?** A set organizes values for membership. A dictionary organizes values under keys. The important decision is whether either structure preserves the meaning of your data.

This week, learn to distinguish membership from counting, keys from values, and insertion order from sorted order. Trace a small hash-table model, include the cost of building an index, and explain average-case O(1) without promising constant time in every possible situation.

**Türkçe:** Amaç yalnızca `list` yerine `set` yazmak değildir. Önce soruyu belirleriz: “Bu değer var mı?”, “Kaç defa var?” veya “Bu kimliğe ait bilgi nedir?” Bu üç soru aynı değildir. Veri yapısı seçimi hem süreyi hem de cevabın anlamını etkiler.

## Prerequisite warm-up, with answers

Suppose `visits = ["Ada", "Cem", "Ada"]`. How many visits occurred? How many different people visited? If you search this list for missing name “Ece”, how many entries must be checked?

**Answers:** There are three visits, two different people, and three checks for the missing name. Converting to a set keeps information about the two people but loses the fact that Ada visited twice. The duplicates are useful data when counting visits.

Now suppose there are n = 100 known addresses and q = 20 missing query addresses. A scan for every query performs `100 × 20 = 2,000` equality checks. Here n describes stored data and q describes the number of questions. Keep both symbols until you know how they relate.

## Slow concept — Three containers, three kinds of question

A **list** preserves sequence and allows duplicates. Its index answers “what is at position i?” A **set** keeps distinct hashable values and answers “is x present?” It supplies no index-based or sorted ordering guarantee. A **dictionary** associates each unique key with a value: “what is the score for this name?” Different keys may have equal values.

| Need | Suitable structure | What must be preserved? |
| --- | --- | --- |
| Arrival order and repeated events | List | Every event in its position |
| Repeated yes/no membership | Set | Distinct values only |
| One current score per student | Dictionary | Name-to-score association |
| Number of visits per person | Dictionary or Counter | Counts, including repeats |
| Ordered report plus membership index | List together with a set | Output order in the list |

Creating `{}` makes an empty dictionary. Creating `set()` makes an empty set. In `name in grades`, Python checks the dictionary's keys, not its scores. `grades[name]` raises `KeyError` if the key is absent; `grades.get(name, 0)` returns zero in that case without adding the key.

**Dictionary insertion order is preserved. It is not automatic sorting.** Updating a key's value does not create a second key or move it to the end. Deleting and reinserting a key adds it at the end. A set should not be used to request insertion or sorted order. These are language-level distinctions in [Python's container documentation](https://docs.python.org/3/library/stdtypes.html#mapping-types-dict).

## Worked example 1 — Count visits slowly enough to see each update

Process `Ada, Cem, Ada, Ece, Ada, Cem`. Begin with no stored counts. For each name, read its current count, using zero if it has not appeared, then add one.

| Incoming name | Previous count | Arithmetic | Counts afterwards |
| --- | --- | --- | --- |
| Ada | 0 | 0 + 1 = 1 | Ada: 1 |
| Cem | 0 | 0 + 1 = 1 | Ada: 1, Cem: 1 |
| Ada | 1 | 1 + 1 = 2 | Ada: 2, Cem: 1 |
| Ece | 0 | 0 + 1 = 1 | Ada: 2, Cem: 1, Ece: 1 |
| Ada | 2 | 2 + 1 = 3 | Ada: 3, Cem: 1, Ece: 1 |
| Cem | 1 | 1 + 1 = 2 | Ada: 3, Cem: 2, Ece: 1 |

```python
visits = ["Ada", "Cem", "Ada", "Ece", "Ada", "Cem"]
counts = {}
for name in visits:
    counts[name] = counts.get(name, 0) + 1
assert counts == {"Ada": 3, "Cem": 2, "Ece": 1}
assert sum(counts.values()) == len(visits)
print(counts)
```

The sum check gives `3 + 2 + 1 = 6`, agreeing with six input visits. This is a useful conservation check: every visit contributes to exactly one count. There are n updates for n visits. Under ordinary hashing assumptions, time is O(n) on average. If u is the number of different names, the dictionary stores u entries: O(u) extra space.

`Counter(visits)` expresses the same counting job. `setdefault` is useful for grouping: “obtain the existing group, or create its initial empty list.” Neither changes the need to understand what the output represents. Also, `Counter(...).most_common()` may perform additional ordering work; tallying and ranking all counts are separate tasks.

**Türkçe:** `get(name, 0)` sayacı sıfırlamaz. İsim varsa mevcut sayıyı, yoksa sıfırı verir. Sonra bir eklenir. `set` kullansaydık Ada'nın üç ziyaretini tek değere indirirdik. Daha az veri saklamak her zaman doğru bir iyileştirme değildir; bazen gerekli bilgiyi silmektir.

## Slow concept — Hashing narrows the search

A hash function computes a number from a key. The table uses this number to choose where to begin looking. It then checks key equality, because different keys can have the same hash location. Such a meeting is a **collision**, not proof that the keys are equal.

The lesson's bucket-and-chain picture is a teaching model. Real Python sets and dictionaries use a different internal collision-resolution layout. You need the model's lesson: a calculated starting location avoids scanning unrelated entries, while collisions can cause extra work.

Keys must be **hashable**: their hash must stay consistent while used as keys, and equal keys must have equal hashes. Ordinary numbers and strings qualify. Lists do not. A tuple qualifies only if all its components are hashable; a tuple containing a list does not become safe merely because its outer container is a tuple.

**Türkçe:** Hash değeri bir “başlangıç adresi” gibidir, kimlik belgesi değildir. İki farklı anahtar aynı yere yönlendirilebilir. Bu durumda eşitlik kontrolü hâlâ gerekir. Çakışma gerçekleşince eski verinin üzerine yazılması gerekmez; veri yapısı farklı anahtarları ayırt ederek saklar.

## Worked example 2 — Trace collisions with remainder arithmetic

Use eight buckets numbered 0 through 7 and the teaching rule `bucket = key % 8`. Insert `[10, 18, 3, 26, 7]`.

| Key | Division into whole groups and remainder | Bucket |
| --- | --- | --- |
| 10 | 10 = 1 × 8 + 2 | 2 |
| 18 | 18 = 2 × 8 + 2 | 2 |
| 3 | 3 = 0 × 8 + 3 | 3 |
| 26 | 26 = 3 × 8 + 2 | 2 |
| 7 | 7 = 0 × 8 + 7 | 7 |

Bucket 2 now holds `[10, 18, 26]`. Finding 26 computes remainder two and checks three keys in that chain. Searching for 99 computes `99 = 12 × 8 + 3`, visits bucket 3, checks its sole value 3, and concludes “absent.” It does not inspect the other chains.

If all n keys landed in one chain, a missing lookup could inspect n keys. This explains the difference between **O(1) average lookup** and **O(n) worst-case lookup**. Resizing maintains space for ordinary workloads but does not turn the worst case into a universal constant-time guarantee.

The simple cost model also assumes bounded-size keys and cheap hashing/equality. Hashing a newly created long string depends on its character count. “Independent of the number of stored keys” does not mean independent of everything.

## Prepare once, then count the whole job

Let n be known addresses and q be incoming queries. Scanning the list for every missing query costs n × q checks. Building a set once and performing q lookups has average cost O(n + q), with O(n) additional storage in the all-distinct case.

For the lesson's values n = 100,000 and q = 10,000, the scan model gives `100,000 × 10,000 = 1,000,000,000`. A simplified unit-cost build-and-query model gives `100,000 + 10,000 = 110,000`. Their ratio is about 9,091. This is a comparison of model work units, **not a predicted measured speedup**: hashing and equality have different constants.

If the set is rebuilt inside the query loop, construction alone becomes O(nq). Moving preparation outside the loop is part of the algorithm, not a minor formatting change.

For one query, both a list scan and set construction followed by lookup are O(n). Neither Big-O nor a slogan determines the winner on a particular small input. A list may find the target immediately, and the set needs extra memory. A build cost becomes useful when enough later work can reuse it.

**Türkçe:** Toplam maliyet “hazırlık + sorgular” şeklindedir. Yalnızca hazır kümedeki aramayı ölçüp kümenin kurulmasını unutmamalıyız. Hazırlığı her soruda yeniden yaparsak kazancı kaybederiz. Bir kez sorulan soruyla binlerce kez sorulan soru için aynı tercih zorunlu değildir.

## Three graduated practice problems

### Problem 1 — Keys, values, and order

Start with `scores = {"Ada": 88, "Cem": 72}`. Assign Ada's score to 91, then add Ece with score 91. What are the dictionary length, key order, and result of `91 in scores`?

#### Solution 1 — Updating a key is not adding a duplicate

There are **three keys**, in order Ada, Cem, Ece. Ada's old value is replaced, so there is no fourth entry. Both Ada and Ece can have value 91. `91 in scores` is **False**, because 91 is not a key. Checking `91 in scores.values()` would be True but requires a value search, O(n) in the worst case.

### Problem 2 — Preserve the meaning of “common”

For `a = [2, 2, 3, 4]` and `b = [2, 4, 4]`, find every entry from a whose value appears in b, preserving a's order and repeats. Explain why `set(a) & set(b)` is a different answer.

#### Solution 2 — Index the second list, retain the first list

```python
a = [2, 2, 3, 4]
b = [2, 4, 4]
lookup = set(b)
answer = [value for value in a if value in lookup]
assert answer == [2, 2, 4]
assert sorted(set(a) & set(b)) == [2, 4]
print(answer)
```

The required answer is `[2, 2, 4]`. The intersection returns distinct common values, losing one required 2. Sorting that intersection cannot restore a removed duplicate. Build cost is O(m) average for m entries in b; scanning a costs O(n) average, giving O(n + m) average time. Output storage is O(r), where r is the number of retained entries. Set storage depends on the distinct values in b.

### Problem 3 — Calculate a preparation break-even point

A measured workload needs 0.08 ms for each list query. Building its set takes 3 ms; each set query takes 0.002 ms. Assuming these averages remain applicable, how many queries make set preparation worthwhile?

#### Solution 3 — Solve the inequality, including units

Let q count queries. List time is `0.08q ms`; set time is `(3 + 0.002q) ms`. We want `3 + 0.002q < 0.08q`. Subtract `0.002q` to obtain `3 < 0.078q`. Divide by 0.078: `q > 38.4615...`. The first integer meeting the condition is **39 queries**.

At q = 38, list time is 3.04 ms and set time is 3.076 ms, so preparation loses narrowly. At q = 39, the times are 3.12 ms and 3.078 ms, so it wins narrowly. Real measurement noise may exceed that difference; repeat measurements before making a precise operational decision. This threshold belongs to these measured constants, not every Python program.

## Misconceptions, glossary, and readiness

“Sets are sorted” is false. “Dictionaries lose insertion order” is false. “Hash lookup is always O(1)” omits worst cases and key costs. “A larger text always makes list-based counting quadratic” also needs a qualifier: if the vocabulary stays fixed at u words, that method costs O(nu), which is linear in n for fixed u.

| English | Türkçe and meaning |
| --- | --- |
| Membership | Üyelik: whether a value is present |
| Key / value | Anahtar / değer: lookup label and associated information |
| Collision | Çakışma: different keys directed to the same initial location |
| Hashable | Hashlenebilir: a key satisfies stable hashing/equality rules |
| Frequency | Sıklık: how many occurrences were observed |
| Preparation cost | Hazırlık maliyeti: work paid before queries begin |

You are ready when you can trace a count update, explain why duplicate removal can be incorrect, state hash lookup's average and worst cases, and include construction in a total cost. Repair a gap by rebuilding the six-visit table, drawing the eight buckets, or repeating the break-even calculation with twice the build cost.

The next bridge is an order question: “How many observations lie between these two limits?” A set alone does not preserve the ordering or multiplicities needed for that answer. Week 12 uses sorted sequences and carefully maintained search boundaries.

# Week 12 — Binary search, boundaries, and preparation

[Original lesson](w12/index.html)

## The big question

**When is it safe to discard half the possible answers?** Binary search works because sorted order lets a comparison rule out an entire region. The difficult part is not the middle calculation. It is knowing exactly what remains possible after each comparison.

By the end, trace a successful search and an unsuccessful one, handle empty and one-item lists, explain logarithmic growth using powers of two, and compare complete strategies that include preparation. Use binary search for ordered questions without forgetting that inserting into a list still shifts items.

**Türkçe:** İkili arama “ortadakine bak” kuralından ibaret değildir. Asıl soru şudur: Bir karşılaştırmadan sonra hangi elemanların cevap olamayacağını kesin olarak biliyoruz? Liste sıralı değilse bir yarıyı güvenle silemeyiz. Hızın kaynağı bu mantıksal güvencedir.

## Prerequisite warm-up, with answers

For `[10, 20, 30, 40, 50]`, write the first and last indices. Calculate `(0 + 4) // 2`. How many items remain if indices zero through two have been ruled out?

**Answers:** The first index is zero and the last is four. Integer division gives `4 // 2 = 2`, so the middle value is 30. The remaining indices are three and four: two candidates. Do not confuse the middle index 2 with the middle value 30.

Now halve 16 repeatedly: `16 → 8 → 4 → 2 → 1`. Four halvings reach one. But reaching one candidate is different from checking that final candidate. This distinction explains several off-by-one counting mistakes.

## Slow concept — Define the search window first

The lesson's first binary search uses **inclusive boundaries**. Every possible answer is between indices low and high, including both ends. The initial window is `[0, n − 1]`, where n is list length. Its number of candidates is `high − low + 1` when low is no larger than high.

Choose `middle = (low + high) // 2`. If the target equals the middle value, return that index. If it is smaller, all values at middle and to its right are too large, so set `high = middle − 1`. If it is larger, set `low = middle + 1`.

**The tested middle is excluded after a mismatch.** Otherwise, a one-item window might remain unchanged forever. Continue while `low <= high`; equality means one candidate remains and still deserves inspection. When low becomes greater than high, no candidate remains.

```python
def binary_search(data, target):
    low, high = 0, len(data) - 1
    steps = 0
    while low <= high:
        middle = (low + high) // 2
        steps += 1
        if data[middle] == target:
            return middle, steps
        if target < data[middle]:
            high = middle - 1
        else:
            low = middle + 1
    return -1, steps

assert binary_search([], 8) == (-1, 0)
assert binary_search([8], 8) == (0, 1)
assert binary_search([8], 7) == (-1, 1)
print(binary_search([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23))
```

The printed result is `(5, 3)`: index five, after three iterations. Here steps counts **middle inspections**, not every Boolean comparison executed by Python. Keep the counted operation consistent when comparing theory and measurements.

**Türkçe:** `low == high` olduğunda aralık boş değildir; tek aday vardır. Boş aralık `low > high` durumudur. Bir elemanı kontrol edip eşleşmediğini gördükten sonra aynı elemanı yeniden aday bırakmıyoruz. `+1` ve `−1` işlemlerinin mantığı budur.

## Worked example 1 — A hit, a miss, and an empty list

Use the lesson's sorted values `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`. Search for 23.

| Iteration | low | high | middle calculation | Middle value | Update |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 9 | 9 // 2 = 4 | 16 | 23 > 16, so low = 5 |
| 2 | 5 | 9 | 14 // 2 = 7 | 56 | 23 < 56, so high = 6 |
| 3 | 5 | 6 | 11 // 2 = 5 | 23 | Found at index 5 |

The candidate counts are ten, five, then two. A match ends the search immediately; it does not have to use the maximum allowed number of steps.

Now search for missing value 40 on exactly the same data.

| Iteration | low | high | middle | Middle value | Update |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 9 | 4 | 16 | low = 5 |
| 2 | 5 | 9 | 7 | 56 | high = 6 |
| 3 | 5 | 6 | 5 | 23 | low = 6 |
| 4 | 6 | 6 | 6 | 38 | low = 7 |

Now low is seven and high is six. The loop condition fails, so return `(-1, 4)`. This final condition check is not a fifth middle inspection. The number 40 would belong between 38 and 56, but this function returns only an existing position or the absent marker −1.

For an empty list, low begins at zero and high begins at −1. The loop never runs. There is no attempt to read `data[0]`, and the result is `(-1, 0)`. Empty data is handled by the same boundary logic, not an accidental exception.

## Halving and logarithms, one arithmetic step at a time

The statement `log₂ n = k` means `2ᵏ = n`. Thus `log₂ 8 = 3` because `2 × 2 × 2 = 8`. Doubling n adds one to its base-two logarithm. This is why going from roughly one million candidates to two million adds approximately one search iteration instead of one million.

For this inclusive search, the maximum number of middle inspections is **floor(log₂ n) + 1 for n > 0**, and zero for n = 0. “Floor” means round down. At n = 8, that maximum is `3 + 1 = 4`; a far-right target can take four inspections. The commonly used “round log₂ n up” shortcut misses this detail at powers of two.

| n | Nearby powers of two | Maximum inspections |
| --- | --- | --- |
| 1 | 2⁰ = 1 | 1 |
| 8 | 2³ = 8 | 4 |
| 10 | 2³ < 10 < 2⁴ | 4 |
| 1,000 | 2⁹ < 1,000 < 2¹⁰ | 10 |
| 1,000,000 | 2¹⁹ < 1,000,000 < 2²⁰ | 20 |

Maximum does not mean every search uses that many steps. On `list(range(1_000_000))`, the exact lesson algorithm takes 20 inspections for 999,999, but 19 for 0 and for −5. A missing target can follow a shorter unsuccessful path.

**Türkçe:** Logaritma burada yeni bir gizemli işlem değildir; “ikiyle kaç kez çarparsam bu büyüklüğe ulaşırım?” sorusudur. En fazla 20 adım demek, her aramanın 20 adım süreceği demek değildir. Ayrıca bir aday kalması ile o adayın kontrol edilmesi iki ayrı durumdur.

## Worked example 2 — Does sorting first pay?

Suppose n = 1,024 unsorted values will answer q membership queries. Use a deliberately simplified model: one full scan costs n units, sorting costs `n log₂ n` units, and each later binary search costs 11 units, its maximum middle-inspection count for this n.

Because `log₂ 1,024 = 10`, preparation costs `1,024 × 10 = 10,240` model units. Scanning costs `1,024q`. Preparing and searching costs `10,240 + 11q`. To make preparation cheaper, solve:

```text
10,240 + 11q < 1,024q
10,240 < 1,013q
q > 10,240 / 1,013
q > 10.1085...
```

The first integer satisfying the inequality is 11. At ten queries, scanning costs 10,240 and preparation plus search costs 10,350. At eleven, the costs are 11,264 and 10,361. Preparation now wins in this model.

This is not a universal eleven-query rule. Real sorting comparisons, Python loop overhead, input order, successful search locations, and memory costs affect measured constants. The calculation teaches **how to include preparation**, not how to predict every machine.

For pure membership, a set offers average O(n + q) total time with extra storage. For ordered questions, sorting may supply something a set cannot: boundaries, neighbors, and retained duplicate counts. If the list is already sorted for another valid reason, there is no new sorting cost to charge to each query.

## A second boundary convention: insertion positions

`bisect_left(data, x)` finds the first position where x could be inserted while preserving order. Everything before it is smaller than x; everything from it onward is at least x. This is useful even when x is absent. The insertion position can equal n, beyond the last element.

A common implementation uses a half-open interval `[low, high)`, initially `[0, n)`. Its condition is `low < high`, and one branch uses `high = middle`. Those choices are correct together. Do not mix them with the earlier inclusive algorithm and then declare either convention wrong.

For a membership test, check the boundary before indexing: `i < len(data) and data[i] == target`. For a range containing its endpoints, use the first position at least the lower bound and the first position greater than the upper bound. Their difference counts entries, including repeated values.

Finding an insertion position is O(log n); physically inserting into a list is O(n) because elements may shift. Returning k actual range items also costs O(k), even if finding the range boundaries takes O(log n). [Python's bisect documentation](https://docs.python.org/3/library/bisect.html#performance-notes) separates the search and insertion costs.

## Three graduated practice problems

### Problem 1 — Check both ends

Trace the inclusive algorithm on `[10, 20]` for target 20 and for missing target 5. State every window and the return value.

#### Solution 1 — Do not skip the final candidate

For 20, start low zero, high one, middle zero: value 10 is too small, so low becomes one. The next window is `[1, 1]`, middle one, value 20. Return `(1, 2)`.

For 5, the initial middle is again zero and value 10 is too large. Set high to `0 − 1 = −1`. Low zero exceeds high −1, so return `(-1, 1)`. Using `high = middle` in this inclusive version would leave `[0, 0]` unchanged on later iterations and fail to terminate.

### Problem 2 — Count a range with duplicates

Given sorted readings `[10, 20, 20, 25, 30, 30, 40]`, count readings between 20 and 30 inclusive. Explain the boundary subtraction and handle an empty input safely.

#### Solution 2 — Subtract positions, not values

```python
from bisect import bisect_left, bisect_right

readings = [10, 20, 20, 25, 30, 30, 40]
left = bisect_left(readings, 20)
right = bisect_right(readings, 30)
count = right - left
assert (left, right, count) == (1, 6, 5)
assert bisect_right([], 30) - bisect_left([], 20) == 0
print(count)
```

Indices one through five contain the five readings. The right boundary is six and is excluded, so `6 − 1 = 5`. Two searches plus subtraction cost O(log n) for nonempty data. A set would erase repeated 20 and 30 readings and therefore change this counting problem.

### Problem 3 — Choose the complete strategy

You receive an unsorted log once. Scenario A asks one membership question. Scenario B asks 10,000 membership questions. Scenario C repeatedly counts timestamps in inclusive ranges. Recommend a method and explain its preparation, query cost, and information requirements.

#### Solution 3 — Let the question determine the structure

For A, a scan is a simple O(n) worst-case solution with O(1) extra space. Sorting solely for that query adds unnecessary O(n log n) worst-case preparation. For B, construct a set once: O(n) average preparation, O(1) average per query, and O(n) extra space in the distinct case. Retain the original log if its events still matter elsewhere.

For C, sort the timestamps once, preserving duplicates. Preparation costs O(n log n) worst case; each range count takes two O(log n) boundary searches. If timestamps change, include maintenance or rebuilding costs. State that all compared timestamps use a consistent representation and that the lower bound does not exceed the upper bound.

## Misconceptions, glossary, and readiness

Successful tests provide evidence, not a proof covering every list. The reason binary search is correct is that sorted order keeps every possible answer inside the maintained window, and every mismatch shrinks that window. A sorted-position result also need not be the element's original position before sorting. With duplicates, the first algorithm can return any matching position; use a boundary search for the first occurrence.

| English | Türkçe and meaning |
| --- | --- |
| Precondition | Önkoşul: fact required before the algorithm begins |
| Boundary | Sınır: edge of the remaining candidate interval |
| Inclusive | Dahil: an endpoint belongs to the interval |
| Insertion point | Ekleme konumu: where a value could fit in sorted order |
| Logarithm | Logaritma: exponent answering a repeated-multiplication question |
| Break-even | Başabaş noktası: where competing total costs meet |

You are ready when you can complete both traces without guessing, explain the empty-list result, and charge preparation once. If boundaries confuse you, draw two boxes and repeat Problem 1. If logarithms confuse you, rebuild the powers-of-two table. If strategy choice feels arbitrary, write the exact output requirement before choosing a container.

Next week explains the sorting cost used here. You will count real comparisons, distinguish best from worst inputs, and see why preparation is often O(n log n) instead of O(n²).

# Week 13 — Sorting: count the work and preserve the meaning

[Original lesson](w13/index.html)

## The big question

**How can several correct ways to sort the same values require different amounts of work?** Sorting is a useful place to connect traces, exact counts, growth classes, memory, and measurement. The slow sorts are learning tools. Python's built-in sorting is the practical baseline in the original lesson.

Your outcomes are to trace bubble and selection sort accurately, explain insertion sort's sensitivity to existing order, derive triangular comparison counts, and interpret O(n log n) as repeated levels of linear work. You should also distinguish a new sorted list from mutation of an existing list and preserve the intended ordering of tied records.

**Türkçe:** Bütün yöntemlerin sonunda aynı sıralı listeye ulaşması, aynı işi yaptıkları anlamına gelmez. Karşılaştırma, takas ve kaydırma sayılarını ayrı ayrı sayacağız. “Hızlı” kararını da yalnızca küçük bir örneğe veya tek bir süreye bağlamayacağız.

## Prerequisite warm-up, with answers

How many adjacent pairs exist in five items? Add `4 + 3 + 2 + 1`. If doubling input changes modeled time from n² to (2n)², what happens to the time?

**Answers:** There are four adjacent pairs, because the final item has no next neighbor. The sum is ten. Expanding `(2n)² = (2n)(2n) = 4n²` gives four times the leading quadratic term. An exact count containing both n² and n terms need not increase by exactly four.

Remember that a comparison asks a question such as “is the left value greater?” A swap changes two positions. A comparison may produce no swap, so these counters must not be treated as identical.

## Worked example 1 — Bubble sort, one pass at a time

Use the actual lesson input `[5, 1, 4, 2, 8]`. Bubble sort compares adjacent values and swaps out-of-order neighbors. After one pass, the largest value in the unsorted region is at its right end. That final position no longer needs checking in later passes.

During pass one, compare 5 with 1 and swap: `[1, 5, 4, 2, 8]`. Compare 5 with 4 and swap: `[1, 4, 5, 2, 8]`. Compare 5 with 2 and swap: `[1, 4, 2, 5, 8]`. Compare 5 with 8 and leave them alone. Four comparisons, three swaps.

| Pass | Comparisons in this pass | Swaps | List afterwards |
| --- | --- | --- | --- |
| 1 | 4 | 3 | `[1, 4, 2, 5, 8]` |
| 2 | 3 | 1 | `[1, 2, 4, 5, 8]` |
| 3 | 2 | 0 | `[1, 2, 4, 5, 8]` |

The third pass makes no swaps. Every adjacent pair it checks is in order, and the previously completed suffix is already correct. The early-exit flag therefore stops the algorithm. Total comparisons are `4 + 3 + 2 = 9`; total swaps are `3 + 1 + 0 = 4`. Although the list became sorted after pass two, the algorithm needs the clean pass to discover that it can stop.

```python
def bubble_sort(data):
    items = data[:]
    comparisons = swaps = 0
    for end in range(len(items) - 1, 0, -1):
        swapped = False
        for i in range(end):
            comparisons += 1
            if items[i] > items[i + 1]:
                items[i], items[i + 1] = items[i + 1], items[i]
                swaps += 1
                swapped = True
        if not swapped:
            break
    return items, comparisons, swaps

assert bubble_sort([5, 1, 4, 2, 8]) == ([1, 2, 4, 5, 8], 9, 4)
assert bubble_sort([]) == ([], 0, 0)
print(bubble_sort([3, 2, 1]))
```

The printed result is `([1, 2, 3], 3, 3)`. The initial slice protects the caller's input, but it costs O(n) time and O(n) additional space. A function that sorts a copy is not an O(1)-extra-space implementation merely because its swap operation uses constant storage.

**Türkçe:** Liste ikinci tur sonunda sıralandı; fakat program bunu henüz kesin olarak bilmiyor. Üçüncü turdaki “hiç takas yok” bilgisi durma gerekçesidir. Kağıt üzerinde sonucu görmemiz ile algoritmanın durma koşuluna ulaşması aynı an olmak zorunda değildir.

## Worked example 2 — Selection sort makes a different promise

Selection sort repeatedly finds the smallest value in the remaining suffix and puts it at the next final position. It cannot stop examining a suffix merely because the values inspected so far look sorted: a smaller value might still be near the end.

| Start position | Values compared while finding minimum | Chosen value | Result after possible swap |
| --- | --- | --- | --- |
| 0 | 4 comparisons | 1 | `[1, 5, 4, 2, 8]` |
| 1 | 3 comparisons | 2 | `[1, 2, 4, 5, 8]` |
| 2 | 2 comparisons | 4 | No change |
| 3 | 1 comparison | 5 | No change |
| 4 | 0 comparisons | 8 | No change |

This gives **ten comparisons and two swaps**. The fact that the list becomes sorted early does not remove the later scans from this implementation.

```python
def selection_sort(data):
    items = data[:]
    comparisons = swaps = 0
    for start in range(len(items)):
        smallest = start
        for i in range(start + 1, len(items)):
            comparisons += 1
            if items[i] < items[smallest]:
                smallest = i
        if smallest != start:
            items[start], items[smallest] = items[smallest], items[start]
            swaps += 1
    return items, comparisons, swaps

assert selection_sort([5, 1, 4, 2, 8]) == ([1, 2, 4, 5, 8], 10, 2)
assert selection_sort([1, 2, 3]) == ([1, 2, 3], 3, 0)
print(selection_sort([2, 1]))
```

The printed result is `([1, 2], 1, 1)`. At most one swap happens for each of the first n − 1 positions, so at most n − 1 swaps occur. Comparison count is still quadratic. Fewer swaps may improve a measured constant without changing that growth class.

## Slow concept — Derive the exact count before simplifying

Selection sort's comparisons are `(n − 1) + (n − 2) + ... + 1`. Let the sum be S. Write the terms in reverse order beneath them. Each column adds to n; there are n − 1 columns. Therefore `2S = n(n − 1)`, and **S = n(n − 1)/2**.

For n = 2,000, `S = 2,000 × 1,999 / 2 = 1,999,000`. For n = 4,000, `S = 4,000 × 3,999 / 2 = 7,998,000`. The ratio is approximately 4.001, not exactly four. The dominant n² term explains O(n²), while the exact expression explains the slightly different ratio.

For the bubble implementation, the same sum is its full-pass worst-case count, not a mandatory count for every input. On an already sorted list of n ≥ 2 items, it performs n − 1 comparisons, zero swaps, and exits. A strictly descending list requires every comparison and swap. Random input often requires nearly all passes, but the precise count depends on the actual permutation.

**Türkçe:** Seçmeli sıralamada üçgen toplam her girdide geçerlidir. Erken durmalı kabarcık sıralamasında ise bu toplam en kötü durum içindir. Aynı formülü kullanırken “hangi algoritma, hangi girdi, hangi durum?” sorularını belirtmek gerekir.

## Insertion sort and existing order

Insertion sort maintains a sorted prefix. Take the next value, shift larger prefix values right, and place the held value into the gap. On the same five-item example, inserting 1 requires one comparison and one shift. Inserting 4 requires two comparisons and one shift. Inserting 2 requires three comparisons and two shifts. Inserting 8 requires one comparison and no shift. Totals are **seven comparisons and four shifts**, matching the original lesson's counting convention.

On already sorted input, each new item needs one comparison: n − 1 comparisons. On strictly reverse-sorted input, all earlier items shift, giving the triangular sum. Thus insertion sort is O(n) in its best case and O(n²) in its worst case. All three lesson functions copy their input first and therefore use O(n) extra space; their in-place cores can use O(1) auxiliary space.

## Why n log n appears, and what sorted() guarantees

Imagine splitting eight items until single items remain. There are three splitting levels because `8 = 2³`. When combining sorted pieces, each merge level processes eight items in total: first four two-item merges, then two four-item merges, then one eight-item merge. The work model is `8 + 8 + 8 = 8 × 3 = 24`. This is an illustration of total processing, not an exact claim of 24 key comparisons.

In general, about log₂ n levels each perform O(n) work, yielding O(n log n). On doubling n, the leading work ratio is `2(log₂ n + 1)/log₂ n`. At n = 1,024, it is `2 × 11 / 10 = 2.2`. The ratio changes slowly with size; 2.1 or 2.2 is not a universal constant.

Python's built-in sorting is adaptive: it can exploit existing order. It has O(n log n) worst-case comparison-sort behavior and can be linear on already ordered data. `sorted(data)` returns a new list. `data.sort()` modifies the existing list and returns `None`. In-place modification does not promise zero workspace; built-in list sorting may use O(n) auxiliary storage.

A **stable** sort preserves relative order among records with equal keys. It does not mean equally valued records remain at their original absolute indices. `reverse=True` also preserves tie order. See the [official sorting guide](https://docs.python.org/3/howto/sorting.html#sort-stability-and-complex-sorts) for the language guarantees.

## Three graduated practice problems

### Problem 1 — Best versus worst

For six distinct items, give bubble sort's comparisons and swaps on sorted and reverse-sorted input. Give selection sort's comparisons in both cases. Use the implementations above.

#### Solution 1 — Use the stopping rules

Sorted bubble input uses `6 − 1 = 5` comparisons and zero swaps. Reverse-sorted bubble input uses `6 × 5 / 2 = 15` comparisons and 15 swaps. Selection sort always uses 15 comparisons here, including on sorted input; its sorted case makes zero swaps. Do not assign selection sort 15 swaps merely because it makes 15 comparisons.

### Problem 2 — Preserve ties, then deliberately break them

Records arrive as `[("Cem", 88), ("Ada", 88), ("Ece", 72)]`. Sort by descending grade while preserving arrival order for ties. Then sort by descending grade and ascending name. Explain the difference.

#### Solution 2 — Define the full key

```python
records = [("Cem", 88), ("Ada", 88), ("Ece", 72)]
by_grade = sorted(records, key=lambda item: item[1], reverse=True)
by_grade_name = sorted(records, key=lambda item: (-item[1], item[0]))
assert by_grade == [("Cem", 88), ("Ada", 88), ("Ece", 72)]
assert by_grade_name == [("Ada", 88), ("Cem", 88), ("Ece", 72)]
print(by_grade_name)
```

In the first result, Cem stays before Ada because their keys are equal. In the second, negated numeric grade sorts larger grades first; name breaks the tie alphabetically. A tuple can express these mixed directions for a numeric grade. Two stable passes are another valid option, beginning with the less important key. The original records remain unchanged because both calls use `sorted`.

### Problem 3 — Predict without pretending to measure

Suppose a repeated benchmark gives 0.20 seconds for bubble sort at n = 2,000 and 0.80 seconds at n = 4,000 on comparable difficult inputs. Predict at n = 8,000. Explain what a fair comparison with `sorted()` needs.

#### Solution 3 — State the model and its limits

The observed doubling ratio is `0.80 / 0.20 = 4`. Under the same quadratic-dominant model, predict `0.80 × 4 = 3.20 seconds` at 8,000. This is a prediction, not an observed runtime, and it assumes similar input structure and operating conditions.

Give both sorts identical input values, fresh inputs when mutation matters, and equivalent output requirements. Build test data outside the timed region. Repeat runs and report the chosen summary. Include copying consistently: the lesson's bubble function already copies internally. Check equality with a trusted sorted result outside timing. Benchmark multiple input patterns because already sorted data activates early exits and adaptive behavior.

## Misconceptions and a short bridge to the chapter puzzle

Do not infer “quadratic” from any two nested loops without counting their bounds. Do not infer a proof from near-four timing ratios. Do not replace `data` with `data.sort()`, because the assigned result is `None`. Do not call every in-place operation constant-space.

The optional triangle puzzle uses the same “count contributions” habit. Row sums are 1, 3, 9, 27. Every entry contributes to exactly three positions in the next row, so each new total is three times the previous total. Row i therefore sums to 3 raised to the power i − 1. The explanation establishes the general pattern; the four observed totals alone do not.

| English | Türkçe and meaning |
| --- | --- |
| Comparison | Karşılaştırma: test the relative order of two keys |
| Swap / shift | Takas / kaydırma: exchange two positions or move an item along |
| Stable sort | Kararlı sıralama: equal-key records retain relative order |
| Sorted prefix | Sıralı önek: the completed beginning of the sequence |
| In place | Yerinde: modify the existing container |
| Auxiliary space | Yardımcı bellek: extra workspace beyond input/output |

You are ready when you can reproduce 9/4 for bubble and 10/2 for selection, derive the triangular count, and explain a stable tie. Repair counting gaps with three items before returning to five. Repair complexity gaps by naming the input case explicitly. Bring these habits to Week 14, where two correct approaches become a complete, evidence-based recommendation.

# Week 14 — From a correct algorithm to a convincing report

[Original lesson](w14/index.html)

## The big question

**How do we recommend an approach using correct outputs, a cost argument, and honest measurements together?** The final week combines the course's habits. Define the question, inspect the repeated operation, improve the method, check the answer, measure fairly, and explain when the improvement matters.

Your outcomes are to compare two complete approaches, include setup that belongs to the algorithm, use four input sizes and repeated timings, calculate ratios and a prediction, and state a recommendation with limitations. The project is an explanation of your reasoning, not a contest for the largest speedup.

**Türkçe:** Son hafta yalnızca hızlı bir program yazma haftası değildir. Aynı soruya doğru cevap veren iki yöntemi karşılaştırıyoruz. Neden farklı büyüdüklerini hesaplıyor, sürelerle kontrol ediyor ve hangi koşullarda hangisini seçeceğimizi anlatıyoruz. Büyük bir hızlanma sayısı, eksik bir deneyin yerini tutmaz.

## Prerequisite warm-up, with answers

There are n orders and m watched customer names. What is the worst-case membership work if every order scans the watch list? What changes if we build a set once? What if m remains fixed at ten while n grows?

**Answers:** Scanning costs O(nm). Set preparation plus the scan costs O(n + m) on average, assuming ordinary hash behavior and simple keys. If m grows proportionally with n, the slow method is quadratic in n. If m stays ten, `10n` is linear in n. A multiplication involving two symbols is not automatically quadratic in either one separately.

If measured time rises from 0.10 to 0.40 seconds when input doubles, the ratio is `0.40 / 0.10 = 4`. This supports a quadratic-dominant model over the tested range. It does not prove that every future input or every different input arrangement follows that model.

## Worked example 1 — The watched-customer report

Use the lesson's problem: total spending for customers appearing on a watch list. Make the output contract explicit. Amounts are nonnegative integer cents. Every order contributes once if its customer is watched. Repeated watch-list names do not multiply spending. Return totals for watched customers who actually have orders; omit watched names with no orders.

Watch list: `["Ada", "Cem"]`. Orders arrive as Ada: 300, Ece: 900, Cem: 200, Ada: 450 cents.

| Order | Membership result | Calculation | Totals afterwards |
| --- | --- | --- | --- |
| Ada, 300 | Watched | 0 + 300 = 300 | Ada: 300 |
| Ece, 900 | Not watched | No update | Ada: 300 |
| Cem, 200 | Watched | 0 + 200 = 200 | Ada: 300, Cem: 200 |
| Ada, 450 | Watched | 300 + 450 = 750 | Ada: 750, Cem: 200 |

The output is `{"Ada": 750, "Cem": 200}` cents. Its total 950 equals the included order amounts `300 + 200 + 450`. The excluded 900 must not appear. Integer cents keep this example's arithmetic exact.

Approach A scans the watch list inside the order loop. Approach B constructs a set of watched names once, then uses it for membership. Both update a dictionary of totals. Their correctness comes from the same invariant: after processing the first k orders, each stored total equals that customer's eligible spending in those k orders. The next order either changes no total or adds its amount to exactly the correct total.

Set construction preserves this contract because the contract asks whether a name is watched, not how many times it occurs in the watch list. The set is used for lookup; we do not iterate over it to determine report order.

**Türkçe:** İlk k sipariş işlendiğinde toplamların ne anlama geldiğini söyleyebilmek önemlidir. Yeni sipariş geldiğinde bu anlamın bozulmadığını gösteririz. Bu bir doğruluk gerekçesidir. İki programın bir örnekte aynı sonucu vermesi ise bu gerekçeyi destekleyen bir testtir; bütün olası girdiler için tek başına kanıt değildir.

## A complete, bounded four-size benchmark

This independent example implements both methods and checks small edge cases. It then uses four doubling sizes, three repeats, and the best time. Input generation is deterministic; **timings will vary**. The slow method's watch list grows with n. Setup outside the timer creates shared input; the fast method's required set construction stays inside its timed function.

Read the block in these stages; you do not need to understand every line simultaneously.

| Stage | What it does | What to inspect first |
| --- | --- | --- |
| Two functions | Implement the same spending contract | Only membership preparation changes; both return totals. |
| Small cases | Check empty data, a miss, repeated names and totals | Compare each returned dictionary with its explicit expected answer. |
| Input generation | Create n orders, n // 2 customer names, and m = n // 10 watched names | `//` means integer division; at n = 200 these counts are 200, 100 and 20. |
| Three repeats | Time a fresh function call, alternating which method runs first | The timer surrounds the call; the equality check follows it. |
| Summaries | Take each method's minimum time and compare consecutive sizes | `previous` stores the preceding row; the first row has no doubling ratio. |

Each generated customer appears in two orders, and one fifth of the customer names are watched. Thus both hits and misses occur while n and m grow together. This is a specified workload, not a random sample of all possible order patterns.

```python
from time import perf_counter

def summarise_slow(orders, watch):
    totals = {}
    for name, cents in orders:
        if name in watch:
            totals[name] = totals.get(name, 0) + cents
    return totals

def summarise_fast(orders, watch):
    watched = set(watch)
    totals = {}
    for name, cents in orders:
        if name in watched:
            totals[name] = totals.get(name, 0) + cents
    return totals

cases = [
    ([], ["Ada"], {}),
    ([("Ece", 900)], ["Ada"], {}),
    ([("Ada", 300), ("Ada", 450)], ["Ada", "Ada"], {"Ada": 750}),
    ([("Ada", 300), ("Ece", 900), ("Cem", 200), ("Ada", 450)],
     ["Ada", "Cem"], {"Ada": 750, "Cem": 200}),
]
for orders, watch, expected in cases:
    assert summarise_slow(orders, watch) == expected
    assert summarise_fast(orders, watch) == expected

previous = None
for n in [200, 400, 800, 1600]:
    names = [f"customer{i}" for i in range(n // 2)]
    orders = [(names[i % len(names)], 10 + i % 91) for i in range(n)]
    watch = names[:n // 10]
    expected = summarise_slow(orders, watch)
    assert summarise_fast(orders, watch) == expected
    samples = {"slow": [], "fast": []}
    functions = [("slow", summarise_slow), ("fast", summarise_fast)]
    for repeat in range(3):
        order = functions if repeat % 2 == 0 else functions[::-1]
        for label, function in order:
            start = perf_counter()
            result = function(orders, watch)
            elapsed = perf_counter() - start
            samples[label].append(elapsed)
            assert result == expected
    slow = min(samples["slow"])
    fast = min(samples["fast"])
    ratios = ("first size" if previous is None else
              f"doubling: slow={slow / previous[0]:.2f}, fast={fast / previous[1]:.2f}")
    print(f"n={n}, m={len(watch)}, slow={slow:.6f}s, fast={fast:.6f}s; {ratios}")
    previous = (slow, fast)
```

The functions do not mutate the supplied lists, so reusing them is fair. Both create a fresh result on every call. Checks and printing occur outside timing. Alternating execution order reduces a simple “always run A first” bias; it does not eliminate all environmental variation. These small sizes keep the example safe to run. If the fastest measurements are too short to be stable, increase sizes carefully or repeat a clearly defined batch.

A plot belongs in the final notebook: input size n on the horizontal axis, seconds on the vertical axis, both logarithmic, and a labelled line for each approach. Use the actual recorded times, with the repeat summary stated. Do not substitute the illustrative numbers below for your own measurements.

## Worked example 2 — Interpret a table and make a prediction

The following numbers are **invented teaching data**, chosen to make the arithmetic visible. They are not results from the preceding code.

| n | A seconds | B seconds | A doubling ratio | B doubling ratio | Speedup A/B |
| --- | --- | --- | --- | --- | --- |
| 1,000 | 0.020 | 0.002 | — | — | 10 |
| 2,000 | 0.080 | 0.004 | 4 | 2 | 20 |
| 4,000 | 0.320 | 0.008 | 4 | 2 | 40 |
| 8,000 | 1.280 | 0.016 | 4 | 2 | 80 |

For the last row, A's growth ratio is `1.280 / 0.320 = 4`. B's is `0.016 / 0.008 = 2`. Speedup compares the methods at the same n: `1.280 / 0.016 = 80`. A growth ratio and a speedup ratio answer different questions.

Assuming the same dominant behavior at n = 16,000, predict `1.280 × 4 = 5.120 seconds` for A and `0.016 × 2 = 0.032 seconds` for B. Predicted speedup is `5.120 / 0.032 = 160`. Mark these values as predictions, not extra measured rows.

The operation analysis explains the table: here m grows with n, so A's O(nm) becomes O(n²); B's average O(n + m) becomes O(n). The measurement is consistent with that reasoning. It does not establish hash worst cases, memory limits, or behavior under different customer distributions.

**Türkçe:** Aynı satırdaki iki süreyi bölersek yöntemler arasındaki hızlanmayı buluruz. Aynı sütundaki ardışık süreleri bölersek girdinin büyümesine verilen tepkiyi buluruz. Bu iki oranı karıştırmamak, rapordaki en önemli hesap alışkanlıklarından biridir.

## Three graduated practice problems

### Problem 1 — Repair the report total

A report collects r matching orders, then repeats `total += sum(all_matching_values)` once per matching order. For values `[10, 20, 30]`, find the returned total, the intended total, and an efficient repair. Also replace repeated list concatenation and define the report text's separator policy.

#### Solution 1 — Fix meaning before speed

The sum is `10 + 20 + 30 = 60`. Repeating it three times gives `60 + 60 + 60 = 180`, so the program returns three times the intended total. In general it returns r times the sum and spends O(r²) time recomputing it.

Filter eligible orders with a set prepared once. Append each eligible order to the output list. Compute the sum once, or maintain a running total as orders are appended. The total is now 60. For report text, specify comma-space separators with no trailing separator and join the identifiers once. This deliberately defines the required formatting; a version ending with an extra comma is not an identical string. With n orders, m watched names, and L output characters, average time is O(n + m + L), with storage for the set and output.

### Problem 2 — Two numbers, two positions

Decide whether two different positions contain values adding to a target. Explain the result for `[3]` with target six and `[3, 3]` with target six. Give a linear-average-time method.

#### Solution 2 — Check earlier values before storing this one

```python
def has_pair(data, target):
    seen = set()
    for value in data:
        if target - value in seen:
            return True
        seen.add(value)
    return False

assert has_pair([3], 6) is False
assert has_pair([3, 3], 6) is True
assert has_pair([4, 7, 1], 8) is True
assert has_pair([], 8) is False
```

For the first 3, the required partner is `6 − 3 = 3`, but seen is empty. Store 3 only after checking. A second 3 then finds a partner from a different position. The one-element list cannot reuse its sole position. For `[4, 7, 1]`, needed partners are 4, then 1, then 7; the third item finds the earlier 7. There are at most n lookups and n insertions: O(n) average time and O(n) worst-case extra space. A fair all-pairs baseline checks index pairs i < j and may require `n(n − 1)/2` sums when no pair exists.

### Problem 3 — Audit a performance claim

A draft says “B is 100× faster, therefore it is proven O(n).” It times A on reverse-sorted values, B on sorted values, excludes B's required preprocessing, and presents only one size. Give a complete repair plan.

#### Solution 3 — Make the claim testable

First specify one output contract and test both implementations against expected answers, including empty, repeated, and missing cases where relevant. Give both identical data at each size. Include required preprocessing in end-to-end time, or label a separate query-only measurement and report preparation separately. Use four sizes and at least three repeats, with the chosen summary stated. Record both growth ratios and same-size speedups. Explain the operation count independently, then make a conditional prediction. Replace “proven” with a statement that measurements support the proposed model over the tested range, followed by its limitations.

## The existing final project, made manageable

The original lesson requests **one notebook `AA_Final_YourName.ipynb`, a report of about two pages, and a five-minute presentation**. The notebook contains both approaches, the benchmark with at least three repeats, and a labelled log–log figure. The presentation uses the problem, one figure, one recommendation, and one limitation, without code on the slides. This guide does not add grading rules or deliverables.

Use the original seven-part report structure. A practical two-page allocation follows; it is writing guidance, not a new rubric.

| Section | What to write |
| --- | --- |
| Problem | Input, exact required output, current and expected sizes; define n and any second size m. |
| Approach A | Plain-language steps, a short code excerpt if useful, and a justified cost expression. |
| Approach B | The changed repeated operation, preparation cost, and memory/information trade-off. |
| Evidence | Four-size table, ratios, labelled figure, machine/runtime, repeat count and summary method. |
| Interpretation | Explain observed growth, compare with the operation model, and calculate one unrun prediction. |
| Recommendation | Choose a method for the stated workload and name conditions that could change the choice. |
| Limitations | Identify untested inputs, timing noise, memory assumptions, or omitted costs honestly. |

Put framing and methods on approximately the first page, then evidence and decisions on the second. Keep full implementations and raw measurements in the notebook. The existing rubric assigns 10 to framing, 20 to two correct approaches, 15 to analysis, 20 to benchmark quality, 15 to interpretation/prediction, 10 to recommendation, and 10 to limitations, totaling 100. A small well-supported improvement can satisfy this reasoning-focused standard.

## Misconceptions, glossary, and final readiness

Profiling identifies where time is spent; it does not itself prove complexity. `cProfile` reports function-level costs, not a precise per-source-line breakdown of a membership expression. Use section timings and focused comparisons to investigate a suspected operation. The “90/10 rule” is a heuristic, not a measured guarantee for every program.

Repeatedly sorting n items n times can be O(n² log n), so not every hidden expensive operation is exactly quadratic. String concatenation may be optimized in some interpreter contexts; report what actually happens. The optional chapter puzzles extend these reasoning habits, but they are not extra final-project deliverables.

| English | Türkçe and meaning |
| --- | --- |
| Contract | Girdi/çıktı koşulları: what counts as the correct answer |
| Bottleneck | Darboğaz: a part that limits overall performance |
| Benchmark | Performans deneyi: a specified, repeatable timing workload |
| Evidence / proof | Bulgular / kanıt: observed support versus a general justification |
| Prediction | Tahmin: a model-based value not yet measured |
| Limitation | Sınırlılık: where the claim has not been established |

You are ready to finish when another person can reproduce your table, understand why both methods answer the same question, follow your prediction arithmetic, and identify the scope of your recommendation. Repair missing correctness with a hand-traced example. Repair unclear growth by exposing the repeated operation and its bound. Repair a weak report by replacing “much faster” with a size, a ratio, an explanation, and a limitation.

**Türkçe:** Son kontrol şudur: Arkadaşınız sonuçları sizin yardımınız olmadan anlayabiliyor mu? Hangi sayı ölçüldü, hangisi hesaplandı, hangi varsayım kullanıldı açık mı? Bu açıklık, sonraki Veri Yapıları ve Algoritmalar dersine taşıyacağınız temel beceridir.

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
