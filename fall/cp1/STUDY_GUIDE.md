# CP1: a simple course guide

The aim is to turn a problem into small steps that you can explain, write in Python, and check. You do not need to memorize every command.

**Türkçe:** Amaç bütün komutları ezberlemek değil; problemi küçük adımlara ayırmak, her adımı açıklamak ve sonucu kontrol etmektir.

## Engineering experiences for mechatronics

[Open the course and choose a weekly lesson](web/CP1_Course_Dashboard.html). Each companion starts from a physical question and ends with a small engineering handover: a prediction, an independent check, a boundary or fault case, and a limitation. The browser cases use prepared teaching data; three lessons also include adjustable models. No hardware or AI account is required.

Use the HTML investigation within guided class time, alongside the matching Colab notebook. Selected exercise IDs connect the engineering question to the existing programming workshop; they do not redefine the notebook's core/optional labels or add homework. AI can propose code during practice, but students must examine assumptions, check units and defend the result. Existing assessment rules still apply.

Notes on each HTML lesson can be saved in the browser and downloaded as an engineering log. They are private reasoning notes, not automatic grades or evidence of completion.

## Explain the program before running it

Every weekly lesson now has an explanation tied to its actual Python topic: what the operation means, a small drawing or state trace, a prediction, a folded worked explanation and a changed-input question. The same section appears in the Colab notebook. Use it beside the existing walkthrough; it fits within the existing class time.

State what a variable represents after each important step. Draw name-to-object arrows for shared lists, input/output arrows for functions, and a pipeline for the sensor report. These representations explain why the code should work; running examples then checks particular cases. A successful run alone does not establish correctness for every input.

At the end of the course, the sensor example connects to [AA’s comparison of two reporting methods](../../aa/w14/#meaning-before-analysis). CP1 establishes the behaviour and validation rules; AA compares methods that preserve those rules. Neither course requires enrolment in the other.

**Türkçe:** Önce işlemin anlamını ve küçük bir örnekte durumun nasıl değiştiğini açıkla. Çalıştırmadan tahmin et; sonra bir girdiyi değiştirip gerekçeni yeniden dene.

## Your weekly routine

1. Read the goal and identify the inputs and the required output.
2. Predict one small example on paper before running code.
3. Trace variable values after each important line. For a loop, use one row per iteration.
4. Write and run your own solution. Check a normal case and a boundary case.
5. Compare with the [worked solutions](solutions/README.md). Explain any difference, close the solution, and solve a changed example yourself.

The notebooks contain four concept checkpoints, four short breaks, core practice, and a final review period within the existing five-hour session. Questions and retries belong inside that time. Optional extensions are extra practice; weekly notebooks are not collected as homework.

**Türkçe:** Takıldığında daha fazla kod yazmadan önce küçük bir örneği elle çöz. Değişkenlerin değerlerini tabloya yaz. Mola ve tekrar süreleri öğrenme sürecinin bir parçasıdır.

## Fourteen weeks, with connections and review

| Week | Main question | Review before moving on |
|---|---|---|
| 01 · Variables and types | What information do I need to store? | Distinguish a value, a variable name, and printed output. Değer, değişken adı ve çıktı farklıdır. |
| 02 · Expressions and input | How do I calculate and display a result? | Predict precedence, division and conversion using small numbers. İşlemleri sırayla yaz. |
| 03 · Decisions | Which path should this input take? | Draw the branches and test both sides of a boundary. Sınır değerini ve iki yanını dene. |
| 04 · `for` loops | What step repeats a known number of times? | Trace `range()` and an accumulator one iteration at a time. Her tur için bir satır kullan. |
| 05 · `while` loops | When should repetition stop? | Identify the starting state, condition, update and stopping case. Döngünün nasıl biteceğini açıkla. |
| 06 · Patterns | Is this a sum, count, search, minimum or maximum? | Choose the pattern before coding; compare sum and count. Önce çözüm kalıbını seç. |
| 07 · Lists | How do I manage many values together? | Separate an index from its value, and mutation from a returned result. İndis ile değer aynı değildir. |
| 08 · Tables | Which row and column am I processing? | Trace a 2×3 table before using a larger grid. Önce küçük bir tabloyu elle gez. |
| 09 · Strings | How can text become useful data? | Split a single line, inspect its pieces, then convert a value. Önce parçala, sonra dönüştür. |
| 10 · Functions | Which steps deserve a reusable name? | Distinguish parameters, arguments, `print()` and `return`. Ekrana yazmak ile değer döndürmek farklıdır. |
| 11 · Scope and composition | How do small functions cooperate? | Review rebinding, list mutation, dictionaries and tuple returns before combining functions. Verinin nereden gelip nereye gittiğini izle. |
| 12 · Errors and validation | What should happen with invalid input? | Test valid, invalid, boundary and nonfinite values. Hatalı girdiye verilecek cevabı önceden belirle. |
| 13 · Files | How do I read and save a result? | Read a small file, inspect rows, then write and reopen the output. Yazdığın dosyayı yeniden okuyup kontrol et. |
| 14 · Sensor project | Can I explain and test the entire process? | Read → validate → summarize → save → demonstrate. Her aşamanın girdisini ve çıktısını açıkla. |

Weeks 1–13 have eight core exercises each. Week 14 has ten core milestones, including saving the text report and assembling the program; its two bonus tasks are optional. The supplied dataset setup is the first milestone. The project uses `sensor_data.csv` and produces `sensor_data_clean.csv` plus `sensor_report.txt`.

## Understanding the feedback

Concept checkpoints compare your short prediction with the expected answer. The final practice list is an **explicit self-report**: record an exercise only after you have tested it and can explain it. Running an untouched starter does not demonstrate understanding. The list is not an automatic correctness score or a grade.

**Türkçe:** “Çalıştım” listesi öz değerlendirmedir. Bir hücrenin çalışması, çözümün doğru olduğunu tek başına göstermez. Sonucu test et ve neden doğru olduğunu anlat.

## How to use a worked solution

Each solution shows the problem and data, the reasoning, executable Python, and checks or expected results. Use it to answer three questions: Which step did I miss? Why does this operation work? What input would reveal a mistake? Keep your own notebook and solution notebook in separate runtimes when testing.

The solutions are available as learning aids for private practice. In an exam, follow the stated rules and explain your own reasoning. Assessment consists only of the midterm exam (50%) and final exam (50%). Weekly notebooks, exercises, projects, demonstrations and presentations are ungraded practice; no weekly submission is required.

The week numbers describe the teaching sequence. Official CP1 teaching dates, holidays and exam dates have not been supplied here; use the instructor's announced timetable for dates.

[Course dashboard](web/CP1_Course_Dashboard.html) · [Syllabus](web/CP1_Syllabus.html) · [Detailed outline](content.md)
