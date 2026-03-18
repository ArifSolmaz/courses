# PHY102.md
# PHYSICS 102 (E&M + Optik + Modern, Colab-temelli)
**Süre:** 14 hafta — *(haftalık saat: bölüm programına göre uyarlanır; Colab formatı 3–5 saat arası derslerde çalışır)*
**Format:** Google Colab notebook'ları üzerinden: teori + alan/ devre simülasyonları + problem çözümü + otomatik kontrol

## 🎯 CORE MASTERY: "I can analyze any circuit or field and predict its behavior"
> **Configuration → Law → Equation → Prediction → Verify.**
> Given any electromagnetic system (charges, fields, circuits, waves, light),
> the student can identify the configuration, choose the right law
> (Coulomb, Gauss, Kirchhoff, Ampere, Faraday), write the equation,
> predict the measurable quantity, and verify with simulation.
>
> Every week teaches a new *electromagnetic context* (fields, circuits,
> magnetism, light) but always in service of this ONE skill. The weekly
> question is always:
> **"What law governs this system, and what does it predict?"**

## Haftalık teslim seti (standart)
Her hafta 2–3 notebook (ders saati durumuna göre):
- `Wxx_PHY102_Lecture.ipynb` (≈1.5–2 saat): teori + türetim + alan/ devre görselleri
- `Wxx_PHY102_ProblemLab.ipynb` (≈1–2 saat): çözülmüş örnekler + alıştırmalar (L1–L2–L3)
- `Wxx_PHY102_Check.ipynb` (≈0.5–1 saat): kısa quiz + sayısal doğrulama + mini görev

## Colab Notebook Şablonu (PHY102)
1. **Goal / Öğrenme çıktıları** — always linked back to core mastery
2. **Core Mastery Connection** — "This week's law helps you predict ___ behavior"
3. **Ön bilgi (vektör alan sezgisi, integral fikri)**
4. **Teori + kritik türetim (Gauss/Ampere/Faraday sezgisi)**
5. **Field/ Circuit demo** (2D/3D görselleştirme + parametre tarama)
6. **Worked examples** (en az 2)
7. **Problem set (L1–L2–L3)** — each framed as "Configuration → Law → Predict → Verify"
8. **Self-check** (sayısal test + tolerans + birim kontrol)
9. **Teslim** (rapor hücresi + plot + sonuç)

## Python araç seti (öneri)
- `numpy`, `matplotlib`
- (opsiyonel) `scipy` (devre ODE, Fourier), `sympy` (analitik)
- (opsiyonel) `ipywidgets` (parametre slider)

---

## 14 Haftalık Konu Planı (PHY102)

### PHASE 1: Electric Fields & Energy (Weeks 1-3)
*"Charges create fields and potentials — predict field patterns and energy storage"*

### Week 01 — The Invisible Force: Charge, Coulomb & Electric Field
**Core mastery link:** Coulomb's law predicts the force between charges. The electric field concept lets you predict the force on ANY charge placed in the field.
- süperpozisyon, noktasal yük alanı
- Demo: 2D alan vektörleri + potansiyel kontur
- Lab: çoklu yük konfigurasyonları

### Week 02 — Energy Landscape: Electric Potential
**Core mastery link:** Potential is the energy map of the electric field. Predict how much energy a charge gains or loses as it moves through the field.
- potansiyel–alan ilişkisi, iş/enerji
- Demo: potansiyel yüzeyleri
- ProblemLab: potansiyel farkı, hızlandırma

### Week 03 — The Symmetry Shortcut: Gauss's Law
**Core mastery link:** When charge distributions have symmetry (sphere, cylinder, plane), Gauss's law predicts the field in one line instead of a painful integral.
- simetri, kapalı yüzey akısı
- Demo: simetrik dağılımlarda alan
- Check: "hangi yüzey, hangi simetri?" mini quiz

### PHASE 2: Storing & Moving Charge (Weeks 4-6)
*"Capacitors store energy, circuits move charge — predict voltages, currents, time behavior"*

### Week 04 — Storing Energy: Capacitors & Dielectrics
**Core mastery link:** Capacitors store energy in the electric field. Predict capacitance, stored energy, and the effect of dielectrics on circuit behavior.
- C hesabı, enerji depolama
- Demo: paralel levha + parametre tarama
- Lab: kapasitör seri/paralel

### Week 05 — Predicting Circuits: Ohm & Kirchhoff
**Core mastery link:** THIS IS A CORE WEEK. Kirchhoff's rules (junction + loop) predict every current and voltage in any DC circuit. Draw the circuit → write the equations → solve.
- düğüm/çevre analizi
- Demo: devre çözümü (lineer sistem)
- Mini görev: sensör okuma devresi (voltaj bölücü)

### Week 06 — Time Behavior: RC Circuits
**Core mastery link:** RC circuits predict how voltages change over TIME. The time constant τ = RC tells you how fast a circuit charges/discharges — critical for sensor and filter design.
- şarj/deşarj, zaman sabiti
- Demo: RC step response + semi-log doğrulama
- Lab: filtre (low-pass) kavramı

### PHASE 3: Magnetism & Induction (Weeks 7-9)
*"Moving charges create magnetic fields, changing fields induce currents — new prediction tools"*

### Week 07 — The Other Force: Magnetic Fields & Lorentz
**Core mastery link:** Moving charges in magnetic fields experience the Lorentz force. Predict circular orbits, velocity selection, and mass spectrometry.
- hareketli yük, manyetik kuvvet, yüklü parçacık yörüngesi
- Demo: B alanında dairesel hareket
- ProblemLab: hız seçici, kütle spektrometre sezgisi

### Week 08 — Creating B Fields: Ampere's Law
**Core mastery link:** Currents create magnetic fields. Ampere's law predicts B field strength for symmetric current configurations (wire, solenoid, toroid).
- uzun tel, solenoid, toroid
- Demo: solenoid alan sezgisi (basit)
- Check: alan yönü (sağ el kuralı) testleri

### Week 09 — Change Creates Current: Faraday & Lenz
**Core mastery link:** Changing magnetic flux induces EMF. Faraday's law predicts the voltage; Lenz's law predicts the direction. This is how generators and transformers work.
- indüklenen emk, yön, enerji yorumu
- Demo: değişen akı → emk
- Mini görev: jeneratör modeli (sinüzoidal akı)

### PHASE 4: AC & Resonance (Week 10)
*"When L, R, and C combine — predict transient response and resonance"*

### Week 10 — Resonance: RL & RLC Circuits
**Core mastery link:** RLC circuits combine all passive components. Predict natural frequency, damping, and resonance — the same resonance concept from Physics I, now in circuits.
- RL step response, RLC doğal frekans, sönüm
- Demo: RLC rezonans eğrisi, Q faktörü
- Lab: mekatronik filtre/rezonans yorumu

### PHASE 5: Unification — Maxwell (Week 11)
*"All electromagnetic laws unified — fields create each other, light is an EM wave"*

### Week 11 — The Grand Unification: Maxwell & EM Waves
**Core mastery link:** Maxwell's equations unify ALL of electricity and magnetism. They predict that changing fields create each other, producing electromagnetic waves at the speed of light.
- alanların birbirini doğurması, dalga fikri
- Demo: 1D dalga animasyonu (E ve B faz ilişkisi)
- Check: kavramsal kısa sınav

### PHASE 6: Light — Fields You Can See (Weeks 12-13)
*"Light follows predictable laws — trace rays, predict interference patterns"*

### Week 12 — Tracing Light: Geometric Optics
**Core mastery link:** Light travels in straight lines (approximately). Snell's law predicts refraction angles; the lens equation predicts image position and size.
- yansıma/kırılma, Snell, mercekler, görüntü oluşumu
- Demo: ışın izleme (ray tracing) basit
- Lab: mercek sistemleri (odak, büyütme)

### Week 13 — Light as a Wave: Interference & Diffraction
**Core mastery link:** Light is a wave. Superposition predicts interference fringes and diffraction patterns. Measure the pattern → determine the wavelength.
- çift yarık, ızgara, saçılma sezgisi
- Demo: girişim deseni (I(x) plot)
- ProblemLab: desen aralığı, dalga boyu çıkarımı

### PHASE 7: Proving Mastery (Week 14)
*"Analyze a complete electromagnetic system, predict its behavior, verify"*

### Week 14 — Capstone: Configuration → Law → Predict → Verify
**Core mastery link:** This is the proof. Choose an EM system, identify the governing law, predict measurable outcomes, and verify with simulation.
**Mini Proje (örnek seçenekler):**
1. **RC/RLC filtre tasarımı**: hedef frekans cevabı → parametre seçimi + plot
2. **Manyetik indüksiyon jeneratörü**: emk modellemesi + enerji yorumu
3. **Optik sistem**: iki mercekli basit kamera modeli + görüntü mesafesi analizi

**Çıktılar:** 1 notebook raporu + 2–3 plot + kısa sonuç paragrafı
