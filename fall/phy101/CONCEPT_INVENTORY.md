# PHY101 — Concept-inventory pre/post protocol

**Purpose.** To find out whether the course actually changes how students think, rather than whether they
can pass an exam written by the people who taught them. Without a pre/post measurement, a teaching
change is an opinion.

**Why it matters here.** The Week 01–13 sequence is fixed by the department and the exams are common, so
the exam results cannot distinguish this section's materials from any other section's. A concept
inventory can, because it is independent of both.

---

## 1. The standard instruments

| Instrument | What it measures | Where to get it |
| --- | --- | --- |
| **FCI** — Force Concept Inventory (Hestenes, Wells & Swackhamer 1992) | Newtonian force and motion concepts; 30 multiple-choice items | [PhysPort](https://www.physport.org/assessments/) |
| **FMCE** — Force and Motion Conceptual Evaluation (Thornton & Sokoloff 1998) | Same domain, graph-heavy; sensitive to different misconceptions | PhysPort |
| **ECS** — Energy Concept Survey / **R-FCI** | Energy transfer and conservation; rotational concepts | PhysPort |

### Important conditions of use

These instruments are **copyrighted and access-controlled on purpose**. Their validity depends on
students not having seen the items in advance.

- Obtain them through PhysPort, which verifies instructor status. Do **not** source them from a random
  web upload — circulating versions are often altered or mis-scored.
- **Never post the items** in a notebook, on the course dashboard, in a public repository, or in any
  student-facing material. Nothing in this course's public files may contain an item.
- Do not review the specific items with students afterwards, and do not return marked papers. Debrief the
  *concepts* using the course's own questions instead (§3).
- Turkish translations of the FCI exist and have been used in published work; check PhysPort and the
  Turkish physics-education literature for a validated version rather than translating it yourself, as an
  ad-hoc translation destroys comparability with published baselines.

**TR:** Bu araçlar telif hakkıyla korunur ve erişimi bilerek sınırlıdır; geçerlilikleri, öğrencilerin
soruları önceden görmemesine dayanır. PhysPort üzerinden edinin, **soruları hiçbir öğrenciye açık
materyalde yayımlamayın**, sınav sonrası soruları tek tek tartışmayın. Doğrulanmış Türkçe çeviri kullanın;
kendi çevirinizi yapmak, yayımlanmış karşılaştırma verileriyle uyumu bozar.

---

## 2. Protocol

| When | What | Conditions |
| --- | --- | --- |
| **Week 01**, first session | FCI as a **pre-test** | 30 min, closed book, no calculator. Say clearly: not graded, no effect on marks, answer honestly rather than guessing what sounds clever. |
| **Week 13** or the first revision session | Same instrument as a **post-test** | Same conditions, same time allowance |

- **Match the papers** with a code the student generates and remembers (not a name and not a student
  number), so pre and post can be paired while the response stays confidential. Unmatched data gives you
  a class average and nothing about individuals.
- Collect the same pair every year. One year's number means very little; a three-year trend after a
  teaching change means a great deal.
- Record the enrolment department (Mechatronics / Computer / Chemical) with the code. The three cohorts
  arrive with different preparation, and a difference in gain between them is directly useful for
  planning the Week 10–13 application framing.

### Scoring

$$\langle g\rangle = \frac{\text{post}\% - \text{pre}\%}{100 - \text{pre}\%}$$

Hake's **normalized gain**: the fraction of the available improvement that was actually achieved. It is
used instead of the raw difference because a class starting at 60% cannot gain 40 points, so raw gains
punish well-prepared cohorts and flatter weak ones.

Published benchmarks (Hake 1998, ~6000 students):

| $\langle g\rangle$ | Interpretation |
| --- | --- |
| $\approx 0.23$ | typical of traditional lecture instruction |
| $0.3 - 0.4$ | low-to-medium interactive engagement |
| $> 0.4$ | interactive-engagement courses, consistently |

**How to read your own result honestly.** A gain near 0.23 means the materials — notebooks, peer
instruction, labs and all — are performing no better than a conventional lecture, whatever the effort
that went into them. That would be worth knowing, and it is the reason to run the measurement rather
than assume.

**TR:** Hake normalize kazancı, elde edilebilir iyileşmenin gerçekleşen kesridir; ham fark yerine
kullanılır çünkü %60'tan başlayan bir sınıf 40 puan kazanamaz. 0.23 civarı bir kazanç, bütün bu
materyalin geleneksel bir dersten iyi çalışmadığı anlamına gelir — ve bunu bilmek, varsaymaktan iyidir.

---

## 3. The course's own concept check (open, reusable)

Because the standard instruments cannot be shown to students, this course carries its **own** twelve
conceptual questions, written for it and freely usable:

- **Pre-test:** Week 01, section *Concept pre-check* — questions only, no answers given.
- **Post-test:** [Final_Review.ipynb](notebooks/Final_Review.ipynb) §3 — the same twelve questions with
  full answers and the week to revise for each.

This pair is **not** a validated instrument and its scores are not comparable with published FCI data. It
serves two different purposes: it gives students a self-diagnosis they can act on, and it gives you a
same-cohort before/after signal without touching the controlled instruments. Run both.

**TR:** Standart araçlar öğrenciye gösterilemediği için bu dersin kendi on iki kavramsal sorusu vardır:
1. haftada yanıtsız ön test, final tekrarında yanıtlı son test. Bu çift **doğrulanmış bir araç değildir**
ve puanları yayımlanmış FCI verisiyle karşılaştırılamaz; amacı, öğrenciye eyleme dönüştürülebilir bir
teşhis ve size aynı kohort içinde bir öncesi/sonrası sinyali vermektir.

---

## 4. Why this is worth the two lost half-hours

1. **It tells you which weeks are not working.** Item-level analysis points at specific misconceptions —
   if the Newton's-third-law items barely move, the Week 03/04 treatment needs changing regardless of how
   good the exam results look.
2. **It is independent of the common exam.** The exam is written by the teaching team against the topic
   list, so it cannot tell you whether the concepts landed — only whether the syllabus was covered.
3. **It is publishable.** A three-department mixed cohort, bilingual scaffolding, structured peer
   instruction and a notebook-based delivery, with matched pre/post gains and per-department breakdown, is
   a legitimate physics-education result. Suitable venues include *European Journal of Physics*,
   *Physics Education*, *Revista Brasileira de Ensino de Física* and the Turkish science-education
   journals. Two half-hours per semester is a very low price for a paper.
4. **It protects the materials from their author.** Everyone believes their own course materials work.
   This is the only cheap way to find out.

**Ethics.** If the results are to be published, get institutional ethics approval **before** the Week 01
pre-test, use the generated codes rather than identifiers, take informed consent for the research use
(while the diagnostic use itself is ordinary teaching practice), and make participation in the research
optional without any effect on marks.

**TR:** Yayımlanacaksa 1. hafta ön testinden **önce** etik kurul onayı alın, kimlik yerine öğrencinin
kendi ürettiği kodu kullanın, araştırma kullanımı için bilgilendirilmiş onam alın ve katılımın notlara
hiçbir etkisi olmasın.

---

See [the course policy](COURSE_POLICY.md) and [the textbook map](TEXTBOOK_MAP.md).
