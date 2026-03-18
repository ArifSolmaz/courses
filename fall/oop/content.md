# OOP.md
# Object Oriented Programming (Python, Colab-temelli)
**Süre:** 14 hafta — **3 saat/hafta**
**Format:** Colab notebook + repo'dan çok dosyalı yapı (önerilir)

## 🎯 CORE MASTERY: "I can model a system as collaborating objects"
> **Composition — building complex systems from simple, reliable components.**
> The student can design small classes that protect their own state, then
> *compose* them into a working system where objects collaborate through
> clear interfaces.
>
> Every week teaches new *design tools* (encapsulation, inheritance, patterns)
> but always in service of this ONE skill. The weekly question is always:
> **"How does this concept help me build better components or compose them better?"**

## Haftalık teslim seti (standart)
Her hafta 2 notebook:
- `Wxx_OOP_Core.ipynb` (≈2 saat): kavram + demo
- `Wxx_OOP_Studio.ipynb` (≈1 saat): tasarım egzersizi + refactor + mini test

## OOP hedefleri
- Sınıf tasarımı, state/invariant — **building reliable components**
- Composition (mekatronik için kritik) — **THE core skill**
- Basit mimari ve okunabilir API — **clear component interfaces**
- Unit test mantığı (en azından "self-check" seviyesinde) — **verifying components**
- Küçük "paket" yapısı: `src/` üzerinden import — **organizing composed systems**

## Colab'da çok dosyalı çalışma
- Repo'dan `src/` klasörünü çek
- `sys.path.append("/content/<repo>/src")`
- Sınıfları `.py` dosyalarında tut, Colab'da sadece kullan/deneyle

---

## 14 Haftalık Konu Planı (OOP)

### PHASE 1: Building One Reliable Component (Weeks 1-3)
*"Before you can compose objects, you need to build ONE that works reliably"*

### Week 01 — Why Objects? Data + Behavior Together
**Core mastery link:** A component bundles data and behavior. This week you learn to create your first component — a class with attributes and state.
- OOP motivasyonu: data + behavior
- Sınıf/nesne, state kavramı
- Studio: basit `Motor`/`Sensor` sınıfı

### Week 02 — Complete Components: __init__, Methods, __repr__
**Core mastery link:** A reliable component initializes itself properly, has clear behavior (methods), and can describe itself (__repr__).
- `__init__`, methodlar, `__repr__`
- `self` parametresi
- Studio: sınıfı "kullanıcı dostu" hale getirme

### Week 03 — Self-Protecting Components: Encapsulation
**Core mastery link:** A reliable component protects its own state. Invalid data should be impossible — the component enforces its own rules.
- Encapsulation: invariant koruma
- property yaklaşımı (gerektiği kadar)
- Setter with validation
- Studio: hatalı state'i engelleyen sınıf

### PHASE 2: Composing Components (Weeks 4-6)
*"The core skill: wiring simple components into complex systems"*

### Week 04 — Composition: Objects Inside Objects
**Core mastery link:** THIS IS THE CORE WEEK. Composition means one object *contains* others. Sensor + Filter + Logger wired into a MonitoringSystem. "Has-a" not "is-a".
- Composition: `Sensor + Filter + Logger`
- Filtrelenmiş veriyi `matplotlib` ile görselleştirme
- Studio: bileşenleri birleştir (composition over inheritance) + before/after plot

### Week 05 — Shared Interfaces: Inheritance & Polymorphism
**Core mastery link:** When multiple components share the same interface, they become interchangeable in your composed system. Polymorphism enables plug-and-play.
- Inheritance & polymorphism (sınırlı, ihtiyaç kadar)
- `super()`, method overriding
- Studio: iki farklı sensor alt türü — same interface, different behavior

### Week 06 — Contracts Between Components: Abstract Classes
**Core mastery link:** Interfaces are *contracts* that guarantee a component provides certain methods. This makes composition safe — you know what you can plug in.
- Arayüz fikri: `abc` ile minimal sözleşme
- `@abstractmethod` decorator
- Studio: "Filter interface" tanımla, multiple implementations

### PHASE 3: Making Composition Maintainable (Weeks 7-8)
*"Design principles that keep composed systems clean as they grow"*

### Week 07 — Clean Components: SOLID (SRP + OCP)
**Core mastery link:** SRP = each component does ONE thing. OCP = you extend by adding new components, not modifying existing ones. Both serve composition.
- SOLID (pratik): SRP + OCP (kod kokuları üzerinden)
- Studio: SRP ihlalini düzeltme — split a God class into composable parts

### Week 08 — Speaking Clearly: Custom Exceptions
**Core mastery link:** When components collaborate, errors must be meaningful. Custom exceptions let components communicate failures clearly across the system.
- Domain exception tasarımı: custom exceptions
- Exception hierarchies
- Studio: hataları anlamlı hale getir

### PHASE 4: Verifying & Swapping Components (Weeks 9-10)
*"Testing ensures components work; patterns make them swappable"*

### Week 09 — Trusting Components: Unit Testing
**Core mastery link:** Each component in your composed system needs independent verification. Unit tests prove a component works before you plug it in.
- Unit test: sınıf testleri (basit)
- `unittest` module, `setUp`, edge cases
- Studio: test hücreleri + edge-case seti

### Week 10 — Swappable Components: Strategy Pattern
**Core mastery link:** The Strategy pattern is composition in action — swap one component for another at runtime without changing the rest of the system.
- Design pattern (uygulamalı): Strategy (filter seçimi)
- Runtime behavior swapping
- Studio: filtreyi runtime seçilebilir yap

### PHASE 5: Organizing the Composed System (Week 11)
*"As your system grows, components need a home"*

### Week 11 — System Structure: Packages & Modules
**Core mastery link:** A composed system with many components needs organization. Modules and packages give each component its own file and clear import path.
- Paket yapısı: `src/`, import düzeni, modülleme
- `__init__.py`, import patterns
- Studio: "toolkit" klasör yapısı

### PHASE 6: Proving Mastery (Weeks 12-14)
*"Compose a complete system from scratch — Mechatronics Toolkit"*

### Week 12 — Mini Project v3: Mechatronics Toolkit (Start)
**Core mastery link:** Design and compose a complete system: Sensor → Filter → Logger, each a self-protecting component, wired together.
- `Sensor` (simulated/reader)
- `Filter` (moving average / median)
- `Logger` (CSV exporter)
- Basit testler
- Sensor verisi + filtre çıktısı plot'ları

### Week 13 — Mini Project v3.1: Improve & Document
**Core mastery link:** Good components have clear APIs. Refactor, document, and simplify the interfaces between your composed objects.
- Dokümantasyon (docstring)
- Type hints (temel)
- Refactor + API sadeleştirme

### Week 14 — Final: Architecture, Demo & Review
**Core mastery link:** Draw the composition diagram. Show how components connect. Demonstrate that swapping one component doesn't break the system.
- Mimari sunum (diagram + açıklama)
- Demo notebook
- Test raporu
