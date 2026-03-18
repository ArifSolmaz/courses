# CP2.md
# Computer Programming II (Python, Colab-temelli)
**Süre:** 14 hafta — **5 saat/hafta**
**Format:** Tamamen Google Colab notebook'ları üzerinden

## 🎯 CORE MASTERY: "I can decompose a problem into small, testable functions"
> **Functional Decomposition — the Pipeline Mindset.** Given a complex problem,
> the student can break it into 6-8 small, pure, testable functions, wire them
> into a pipeline (read → clean → process → output), and verify each piece
> independently.
>
> Every week teaches new *tools* (dicts, CSV, numpy, matplotlib) but always in
> service of this ONE skill. The weekly question is always:
> **"How does this tool become a stage in my decomposed pipeline?"**

## Haftalık teslim seti (standart)
Her hafta 1 notebook:
- `Week_XX.ipynb` (≈5 saat): kavram + demo + practice + exercises

## CP2 hedefleri
- Fonksiyonel tasarım (modülerlik) — **THE core skill**
- Veri okuma/temizleme/çizdirme — pipeline stages
- Basit test kültürü (assert tabanlı) — pipeline verification
- Parametreleşme (notebook başında "ayar hücresi") — pipeline configuration
- (Opsiyonel ama önerilir) `numpy` ile verimli hesap — pipeline optimization

## Colab pratikleri
- Veri dosyaları: repo'dan indirme (`wget/curl`) veya Drive
- "CLI yerine": notebook başında `CONFIG` hücresi (DATA_URL, window_size, threshold vs.)
- Çıktı standardı: CSV/JSON + plot + kısa rapor hücresi

---

## 14 Haftalık Konu Planı (CP2)

### PHASE 1: From Code to Clean Code (Week 1)
*"Refactoring is the first step toward decomposition"*

### Week 01 — From Working to Clean: The Refactoring Mindset
**Core mastery link:** Before you can decompose, you must learn to see structure in messy code. Refactoring teaches you to RENAME, EXTRACT, SIMPLIFY, DOCUMENT.
- CP1 hızlı tekrar + refactor kavramı
- The Four Moves: RENAME, EXTRACT, SIMPLIFY, DOCUMENT
- Code smell catalogue
- Lab: CP1 mini kodunu daha temiz yazma
- Check: refactor checklist

### PHASE 2: The Decomposition Recipe (Weeks 2-3)
*"The core skill: break problems into small, testable functions"*

### Week 02 — Functions with Superpowers
**Core mastery link:** Functions are the building blocks of decomposition. Master argument patterns and docstrings to make each function a reliable, documented unit.
- Fonksiyonlar (ileri): varsayılan argüman, named args, mutable default trap
- Google-style docstring yazma
- Lab: küçük fonksiyon kütüphanesi (6 functions)
- Check: docstring + test

### Week 03 — The Decomposition Recipe: Divide & Conquer
**Core mastery link:** THIS IS THE CORE WEEK. The design-before-code recipe: READ → DECOMPOSE → NAME → CONTRACT → DRAW → CODE. Zero-logic main().
- Modüler düşünme: "böl ve birleştir"
- Dependency graphs, I/O contracts
- Bottom-up implementation (leaf nodes first)
- Lab: tek problemi 6–8 fonksiyona bölme
- Check: bağımlılık kontrolü, global state audit

### PHASE 3: Data Tools for Your Pipeline (Weeks 4-5)
*"These tools become stages in your decomposed pipeline"*

### Week 04 — dict as a Pipeline Tool: Counters, Histograms & Lookups
**Core mastery link:** Dicts are the Swiss army knife of data processing pipelines. Counter → histogram → lookup are three reusable pipeline patterns.
- `dict` derinleşme: sayaç, histogram, lookup
- Lab: log verisinden histogram üretme (decomposed pipeline)
- Check: doğrulama testleri

### Week 05 — Reading the World: CSV/JSON as Pipeline Input
**Core mastery link:** Every pipeline starts with reading data. CSV/JSON are how real-world data arrives. Schema validation is the first pipeline stage.
- CSV/JSON okuma-yazma
- Veri sözleşmesi (schema): kolonlar, tipler
- Lab: schema doğrulayan fonksiyon (as pipeline stage)
- Check: schema testleri

### PHASE 4: Processing Stages (Weeks 6-7)
*"These are the transformation stages in your pipeline"*

### Week 06 — Clean Stage: Data Cleaning & Normalization
**Core mastery link:** Real data is messy. The "clean" stage handles missing values, outliers, and normalization — a critical pipeline component.
- Veri temizleme: eksik/aykırı değer
- Normalize/standardize (basit)
- Lab: temizleme pipeline'ı (decomposed: validate → filter → normalize)
- Check: edge-case testleri

### Week 07 — Compute Stage: numpy for Efficient Processing
**Core mastery link:** When your pipeline processes large data, numpy replaces loops with vectorized operations — same logic, faster execution.
- `numpy` giriş: array, vectorization sezgisi
- Lab: loop vs numpy kıyas fikri (basit)
- Check: doğru sonuç testi

### PHASE 5: Output & Verification (Weeks 8-9)
*"The final pipeline stages: visualize and verify"*

### Week 08 — Present Stage: matplotlib for Pipeline Output
**Core mastery link:** A pipeline's output often includes visualizations. matplotlib is how you present processed data clearly.
- `matplotlib` standartları: title/label/grid/legend
- Lab: ölçüm verisi çizimleri + karşılaştırmalı plot
- Check: plot + çıktı dosyası

### Week 09 — Verify Stage: Testing Your Pipeline
**Core mastery link:** Every function in your pipeline needs verification. Assert-based testing ensures each stage produces correct output.
- Test yaklaşımı: assert tabanlı mini test setleri
- Lab: "expected output" üretme per pipeline stage
- Check: test coverage kontrol listesi

### PHASE 6: Scaling Your Pipeline (Weeks 10-11)
*"Make your decomposed solution faster and more organized"*

### Week 10 — Measuring Your Pipeline: Performance
**Core mastery link:** Decomposition makes it easy to find bottlenecks — measure each function independently and optimize the slow ones.
- Performans sezgisi: `time` ile kaba benchmark
- Lab: iki çözümü karşılaştırma (per-function profiling)
- Check: küçük performans raporu hücresi

### Week 11 — Organizing Your Pipeline: Project Structure
**Core mastery link:** When your pipeline grows, functions move into separate files. Modules and imports organize your decomposed solution.
- Basit proje yapısı: repo'dan `src/` çekme
- `sys.path` ile import fikri (Colab'da pratik)
- Lab: helper fonksiyonları ayrı dosyadan import
- Check: import çalışırlığı

### PHASE 7: Proving Mastery (Weeks 12-14)
*"Build a complete decomposed pipeline from scratch"*

### Week 12 — Mini Project v2: Sensor Log Analyzer (Start)
**Core mastery link:** Design a complete pipeline: dependency graph → contracts → implement leaf-first → wire with main().
- Clean + normalize + summary
- Plot üret
- Export: temiz veri + rapor

### Week 13 — Mini Project v2.1: Improve & Extend
**Core mastery link:** Extend your pipeline without breaking existing functions — prove your decomposition was good.
- Parametreleşme (CONFIG hücresi)
- Ek özellik: moving average / median filtresi
- Test setini büyütme

### Week 14 — Final: Demo & Reflection
**Core mastery link:** Present your decomposed pipeline. Show dependency graph. Demonstrate that each function works independently.
- Proje demo
- Test raporu (kaç test, hangi edge-case'ler)
- Kısa yazılı değerlendirme: "Ne öğrendim, neyi iyileştirdim?"
