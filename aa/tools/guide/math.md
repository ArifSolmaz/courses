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
