# PHY101 — Course policy

**Adopted 17 September 2026.** This file records the decisions that every weekly notebook, laboratory
brief and exam question must respect. Where a notebook and this file disagree, this file is wrong and
should be corrected — it is a record, not an authority of its own. The one exception is §1, which is set
outside this course.

---

## 1. The topic sequence is fixed, and the exams are common

The week-by-week topic order and the laboratory order come from the **departmental Fall 2026–27 schedule**
(the *Ders Konusu İZLENCE* and *Deney* columns). Colleagues teach parallel sections from the same list,
and the **midterm and final are common exams** written against it.

Consequences, and they are hard constraints:

- **Topics are not moved between weeks, merged, split across weeks differently, or dropped.** A topic that
  would teach better in another order still stays where the schedule puts it, because a student sitting
  the common exam in Week 07 must have been taught the same material as every other section.
- **Enrichment happens inside a week, or outside the exam scope.** Anything added must not displace
  scheduled material or imply examinable content that other sections have not covered.
- **Examinable scope is exactly the Week 01–13 topic list.** Extension notebooks, the gravitation
  supplement, the final-review notebook's stretch sections and all laboratory analysis technique are
  enrichment and are **not** examined.

**TR:** Haftalık konu sırası ve deney sırası bölüm izlencesi tarafından belirlenmiştir; vize ve final
ortak sınavdır. Konular haftalar arasında taşınamaz, birleştirilemez, çıkarılamaz. Zenginleştirme
yalnızca hafta içinde veya sınav kapsamı dışında yapılır. Sınav kapsamı tam olarak 01–13. hafta konu
listesidir.

### Known consequences we accept

| Tension | Why we live with it |
| --- | --- |
| Week 03 carries both 2D motion **and** the introduction to Newton's laws — the heaviest single week, and load-bearing for Weeks 04–13. | Fixed by the schedule. Mitigated with a Week 02 projectile preview, a longer Week 03 entry routine, and a repair block at the start of Week 04 — not by moving the topic. |
| The Week 11 laboratory needs the simple pendulum, taught in Week 13. | Fixed by the schedule. Mitigated with a self-contained primer in Lab 11 §3 and a preview in Week 11. |
| Angular momentum appears in the stated learning outcomes but not as a scheduled topic. | Taught inside Week 11, where it belongs to *Dönme Hareketi Dinamiği*, and extended optionally. Not examinable beyond what Week 11 covers. |
| Gravitation and Kepler's laws are in every standard textbook but not on the list. | Offered as a clearly labelled non-examinable supplement. |

---

## 2. Numbers

| Rule | Value |
| --- | --- |
| Acceleration due to gravity | $g = 9.81\ \mathrm{m/s^2}$ — never 9.8, never 10 |
| Reported answers | **three significant figures**, unless the data justify fewer |
| Intermediate values | carry full precision in the arithmetic; displayed intermediate values are rounded for reading only |
| Uncertainties | quoted to **one** significant figure, with the value rounded to the same decimal place |
| Exact definitions | unit-conversion definitions ($1\ \mathrm{ft} = 0.3048\ \mathrm{m}$) are exact and are never rounded |

**The displayed-intermediate convention matters.** A worked example may show an intermediate as
$0.375\ \mathrm{s^2}$ and then a result computed from the unrounded $0.37453\ldots$ — so recomputing from
the printed intermediate can differ in the last digit. This is deliberate and is stated in every
notebook. Rounding early is the error being avoided.

**TR:** Ara değerler okunabilirlik için yuvarlanmış gösterilir; hesap tam duyarlıkla yapılır. Bu yüzden
yazılı ara değerden yeniden hesaplarsan son hane farklı çıkabilir. Kaçınılan hata, erken yuvarlamaktır.

The significant-figure teaching cells in Week 01 are exempt: there, a four-digit number *is* the lesson.

---

## 3. Every problem is answered symbolically first

The course standard is **draw → choose a law → rearrange → check a limiting case → substitute with units
→ interpret**. The limiting-case step was added in September 2026 and is now required.

Before choosing the equation, identify the quantity, system, axes and geometry. Explain why the operation fits the physical question—combining, projecting, turning, taking a rate, accumulating, or weighting—and predict a sign or trend. See [the course-wide teaching approach](TEACHING_APPROACH.md) for the topic map and scope boundaries. This strengthens the existing method without changing common-exam topics or grading.

1. **Symbolic answer.** Get the unknown alone on one side, in symbols, before any number appears.
2. **One limiting case.** Send a parameter to a value whose answer you already know — $\mu \to 0$,
   $m_2 \to \infty$, $\theta \to 90^\circ$, $I \to 0$ — and confirm the formula does the sensible thing.
3. **Then numbers**, with units carried through.

**Why this is the way to raise rigour without raising difficulty.** It is what makes a problem hard in the
sense that matters — you must understand the structure, not just push arithmetic — while *reducing* the
arithmetic load. It also gives partial credit a place to live: a correct symbolic answer with an
arithmetic slip is nearly full marks, and a right number with no derivation is not.

**TR:** Önce sembolik sonuç, sonra bir sınır durumu kontrolü, sonra sayılar. Bu, zorluğu doğru yerden
yükseltir: aritmetik yükü azaltırken yapının anlaşılmasını zorunlu kılar. Doğru sembolik çözüm artı
aritmetik sürçme neredeyse tam puandır; türetmesi olmayan doğru sayı değildir.

---

## 4. Problem sets: predict before you open

Each problem shows its **answer** inline so you can check yourself, and the **full worked solution** is in
the separate solutions collection, released a week after the last lecture that uses that module.

The order is not optional: **write your own attempt, then open the answer.** Opening first converts a
problem into a worked example, and worked examples do not build the skill the exam tests. If you have
opened the answer before attempting, the problem is spent — do a different one.

**TR:** Her problemin **yanıtı** hemen altındadır; tam çözümü ayrı koleksiyonda ve gecikmeli açılır. Önce
kendi denemeni yaz, sonra yanıtı aç. Önce açarsan problem çözümlü örneğe dönüşür ve sınavın ölçtüğü
beceriyi kazandırmaz.

---

## 5. Laboratory

- Eight sessions, from the departmental *Deney* column. Shared technique lives in
  [Lab 00 — measurement and uncertainty toolkit](labs/Lab_00_Uncertainty_Toolkit.ipynb).
- Every brief opens with a **prediction made before the apparatus is switched on**, and the prediction is
  symbolic with a limiting check, exactly as in §3.
- Reports are graded on **the quality of reasoning about the student's own data**, never on proximity to
  the accepted value. A result that disagrees, with the discrepancy quantified in $\sigma$ and a named
  systematic error with its **sign**, earns full marks. A result that reports the textbook value without
  supporting data does not.
- Uncertainty, propagation, linearising and $\sigma$-counting are **laboratory requirements and are not
  examined in the common exams.**

**TR:** Raporlar, öğrencinin kendi verisiyle kurduğu akıl yürütmeden not alır; kabul edilen değere
yakınlıktan değil. Belirsizlik ve yayılma teknikleri laboratuvar gereğidir, ortak sınav kapsamında
değildir.

---

## 6. Interactive demonstrations

No demonstration is opened without a **written prediction first**. Moving a slider and watching a curve
change teaches very little on its own; moving it after committing to what should happen teaches a lot.
Every interactive cell therefore carries a prediction prompt above it, and Python is never a learning
objective in this course.

**TR:** Hiçbir gösterim, önce yazılı bir tahmin yapılmadan açılmaz. Kaydırıcıyı oynatıp eğriyi izlemek tek
başına çok az şey öğretir. Kod yazmak bu dersin öğrenme hedefi değildir.

---

## 7. Public practice and reserved exam questions

Public notebooks and HTML use independently authored practice scenarios. Do not reproduce reserved
exam-bank stems, givens and answer patterns, or treat changing only names or numbers as a new problem.
Keep the scheduled concept, but change the situation and the reasoning task: prediction, diagnosis,
comparison or design. Include the worked route and its assumptions so students learn a transferable
method. Exam preparation still follows the common syllabus.

Replacing a published example does not retract copies or older git revisions. Previously exposed
items should not be treated as unseen exam questions.

**TR:** Açık ders materyallerinde sınav için ayrılan soru bankası soruları kullanılmaz. Yalnızca isim ve
sayı değişikliği yerine, aynı kazanımı farklı bir durum ve akıl yürütme göreviyle çalıştıran özgün
örnekler yazılır. Daha önce yayımlanmış bir soru, sayfadan kaldırılsa da görülmemiş kabul edilemez.

---

See [the textbook and laboratory map](TEXTBOOK_MAP.md), [the concept-inventory protocol](CONCEPT_INVENTORY.md),
[the adopted calendar](SCHEDULE_ALIGNMENT.md) and [the course outline](content.md).
