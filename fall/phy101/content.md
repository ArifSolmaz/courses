# PHY101.md
# PHYSICS 101 (Calculus-based, Colab-temelli)
**Süre:** 14 hafta — *(haftalık saat: bölüm programına göre uyarlanır; Colab formatı 3–5 saat arası derslerde çalışır)*
**Format:** Google Colab notebook'ları üzerinden: kavram + türetim + simülasyon + problem çözümü + otomatik kontrol

## 🎯 CORE MASTERY: "I can model any mechanical system and predict its motion"
> **Diagram → Principle → Equation → Prediction → Verify.**
> Given any mechanical system (falling, sliding, rotating, oscillating), the student
> can draw the diagram, identify the right principle (Newton's laws, energy
> conservation, momentum conservation), write the equation, predict the outcome,
> and verify with simulation.
>
> Every week teaches a new *context* (linear, circular, rotational, oscillatory)
> but always in service of this ONE skill. The weekly question is always:
> **"What principle governs this system, and what does it predict?"**

## Haftalık teslim seti (standart)
Her hafta 2–3 notebook (ders saati durumuna göre):
- `Wxx_PHY101_Lecture.ipynb` (≈1.5–2 saat): teori + türetim + görsel/simülasyon demo
- `Wxx_PHY101_ProblemLab.ipynb` (≈1–2 saat): çözülmüş örnekler + alıştırmalar (L1–L2–L3)
- `Wxx_PHY101_Check.ipynb` (≈0.5–1 saat): kısa quiz + sayısal cevap doğrulama + mini görev

> 3 saat/hafta ise: Lecture + ProblemLab
> 5 saat/hafta ise: Lecture + ProblemLab + Check

## Colab Notebook Şablonu (PHY101)
1. **Goal / Öğrenme çıktıları** — always linked back to core mastery
2. **Core Mastery Connection** — "This week's principle helps you predict ___ type of motion"
3. **Ön bilgi / Hızlı hatırlatma (matematik & vektörler)**
4. **Teori + kritik türetimler (çok uzun değil, "kullanılabilir")**
5. **Interactive demo** (grafik/animasyon/parametre slider)
6. **Worked examples** (en az 2 adet)
7. **Problem set (L1–L2–L3)** — each framed as "Model → Predict → Verify"
8. **Self-check** (sayısal testler: toleranslı kontrol + birim kontrolü)
9. **Teslim** (çıktı: kısa rapor hücresi + plot + hesap özeti)

## Python araç seti (öneri)
- `numpy`, `matplotlib`
- (opsiyonel) `scipy` (ODE çözümleri), `sympy` (sembolik türetim)
- (opsiyonel) `ipywidgets` (slider ile parametre tarama)

---

## 14 Haftalık Konu Planı (PHY101)

### PHASE 1: The Language of Motion (Weeks 1-3)
*"Before you can predict motion, you need the vocabulary to describe it"*

### Week 01 — The Toolbox: Units, Vectors & Colab
**Core mastery link:** Every prediction starts with the right units and the right vector decomposition. This is your measurement and mathematical foundation.
- SI birimler, boyut analizi, anlamlı basamak
- Vektörler, bileşenler, birim vektörler
- Demo: vektör toplamı ve projeksiyon
- Lab: boyut analizi + vektör parçalama

### Week 02 — Describing Motion: 1D Kinematics
**Core mastery link:** Before predicting WHY things move, you must describe HOW they move. Position, velocity, acceleration — the kinematic equations are your first prediction tools.
- konum–hız–ivme ilişkileri, grafik okuma
- Demo: sabit ivmeli hareket simülasyonu
- ProblemLab: düşey atış, fren mesafesi

### Week 03 — Motion in 2D: Projectile Motion
**Core mastery link:** Real motion happens in 2D/3D. Decomposing into independent axes is the key insight — predict each axis separately, combine for the full trajectory.
- eğik atış, menzil, maksimum yükseklik
- Demo: atış + (opsiyonel) hava direnci karşılaştırması
- Mini görev: hedef vurma (menzil optimizasyonu)

### PHASE 2: Forces Predict Motion (Weeks 4-5)
*"Newton's laws: given forces, predict the motion"*

### Week 04 — The Prediction Engine: Newton's Laws & FBD
**Core mastery link:** THIS IS THE CORE WEEK. F = ma is the prediction engine. Draw the Free Body Diagram → write ΣF = ma → solve for motion. Every mechanics problem starts here.
- kuvvetler, sürtünme, ip gerilmesi
- Demo: eğik düzlem + sürtünme parametre tarama
- Check: FBD doğrulama + sayısal çözüm

### Week 05 — Circular Prediction: Newton + Curves
**Core mastery link:** Same F = ma, new geometry. For circular motion, the net force points inward. Predict speeds, forces, and limits on curved paths.
- merkezcil ivme, banked curve, loop
- Demo: dairesel hareket ve hız limitleri
- Lab: dönel platform / robot dönüş senaryosu

### PHASE 3: Conservation Shortcuts (Weeks 6-7)
*"Energy and momentum bypass complex force analysis — powerful prediction tools"*

### Week 06 — Energy: The Shortcut Principle
**Core mastery link:** When forces are complex, energy conservation predicts outcomes without solving F = ma step by step. "Energy in = Energy out" is a powerful shortcut.
- iş, güç, kinetik enerji, potansiyel enerji
- Demo: enerji diyagramları
- ProblemLab: yay–blok, eğik düzlem enerji yaklaşımı

### Week 07 — Momentum: Predicting Collisions
**Core mastery link:** When objects interact, momentum conservation predicts the outcome. Before/after analysis — no need to know the details of the collision force.
- momentum korunumu, esnek/esnek olmayan çarpışma
- Demo: 1D çarpışma simülasyonu
- Mini görev: tampon tasarımı (enerji/momentum yorumlu)

### PHASE 4: Rotation — Same Laws, New Geometry (Weeks 8-10)
*"Everything you learned about linear motion applies to rotation — with angular versions"*

### Week 08 — Balance: Center of Mass & Static Equilibrium
**Core mastery link:** Before things rotate, they must balance. ΣF = 0 and Στ = 0 predict whether a system stays still or starts to move.
- kütle merkezi, tork, denge koşulları
- Demo: kirişte yük dağılımı (basit)
- Lab: denge problemleri (robot kolu moment)

### Week 09 — Spinning Up: Rotational Dynamics I
**Core mastery link:** τ = Iα is the rotational version of F = ma. Same prediction method: diagram → torques → angular acceleration → motion.
- açısal kinematik, eylemsizlik momenti
- Demo: farklı cisimlerin I hesabı + enerji
- ProblemLab: makara–ip sistemleri

### Week 10 — Angular Momentum: Rotational Conservation
**Core mastery link:** L = Iω is conserved when no external torque acts. Predict spinning behavior: ice skater speeds up, gyroscope precesses.
- açısal momentum korunumu
- Demo: dönme + tork etkileşimi
- Check: birim ve ölçek kontrol testleri

### PHASE 5: Oscillations & Waves (Weeks 11-13)
*"Periodic motion — the same principles in rhythmic, repeating contexts"*

### Week 11 — Back and Forth: Simple Harmonic Motion
**Core mastery link:** SHM is F = -kx applied through F = ma. The restoring force predicts sinusoidal motion. Same principle, periodic result.
- yay–kütle, sarkaç, enerji
- Demo: SHM + sönüm (opsiyonel)
- Lab: ODE çözümü (Euler/odeint)

### Week 12 — Resonance: When Frequency Matches
**Core mastery link:** Drive a system at its natural frequency → amplitude explodes. Predict resonance conditions and design dampers to control it. Critical for mechatronics.
- rezonans, faz, genlik frekans cevabı
- Demo: rezonans eğrisi, Q faktörü
- Mini görev: "titreşim sönümleyici" parametre seçimi

### Week 13 — Waves: Motion That Travels
**Core mastery link:** Waves carry energy through space. Predict wave speed, interference patterns, and standing wave frequencies using the same force/energy principles.
- dalga denklemi sezgisi, hız, girişim
- Demo: iki kaynak girişimi (2D heatmap)
- Lab: titreşim/akustik örnekleri

### PHASE 6: Proving Mastery (Week 14)
*"Model a complete mechanical system, predict its behavior, verify with simulation"*

### Week 14 — Capstone: Model → Predict → Verify
**Core mastery link:** This is the proof. Choose a mechanical system, model it with the right principles, predict its behavior, and verify with data/simulation.
**Mini Proje (örnek seçenekler):**
1. **Hava dirençli atış**: veriyle kalibrasyon (parametre tarama)
2. **Sönümlü yay–kütle**: ölçüm verisinden (sentetik/gerçek) sönüm bulma
3. **Dönme sistemi**: atalet momenti + enerji kayıpları analizi

**Çıktılar:** 1 notebook raporu + 2–3 plot + kısa sonuç paragrafı
