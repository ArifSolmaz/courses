# AA — The Detailed Learning Guide

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
