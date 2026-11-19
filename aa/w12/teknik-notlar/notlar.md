# AA · 12. Hafta — 22 örneğin Türkçe teknik açıklaması

Bu notlar **geri izleme (backtracking) ve dinamik programlama (DP)** dersindeki 22 kartı aynı sırayla açıklar. 9 ve 16 numaralı mola kartlarında cevaplı tekrar bulunur. Her bölümden aynı örneğe ve ilgili ders notuna geçebilirsiniz. Açıklamalar ve cevaplar doğrudan görünür.

## Başlamadan: üç farklı çıktı

“Bir çözüm var mı?”, “Kaç çözüm var?” ve “Bütün çözümleri listele” aynı soru değildir. Bir sayıyı hesaplamak, o sayıda ayrı sonucu ekrana yazmaktan çok daha az iş gerektirebilir.

- **Geri izleme:** Bir seçim yap, devamını araştır, geri dönünce seçimi geri al ve başka seçeneği dene.
- **Kısmi çözüm:** Kararların yalnızca bir bölümü verilmiştir. Örneğin üç görevden ilk ikisi için al/atla kararı verilmiş olabilir.
- **Arama ağacı:** Her düğüm bir kısmi durumu, her dal bir sonraki seçimi gösterir. Tam cevaplar yapraklarda olabilir.
- **Budama:** Hiçbir geçerli tamamlaması olamayacağı kanıtlanan dalı araştırmayı bırakma. “Pek iyi görünmüyor” yeterli gerekçe değildir.
- **Durum (state):** Kalan sorunun cevabını belirlemek için gereken bilgi. Yetersiz durum, farklı soruları yanlışlıkla birleştirir.
- **Taban durum:** Daha küçük soruya gitmeden cevabı bilinen durum. Örneğin sıfır basamağı çıkmanın bir boş hareket dizisi vardır.
- **Geçiş:** Bir durumun cevabını daha küçük durumların cevaplarından kuran kural.
- **Memoization:** İstenen alt soruyu çözüp cevabını saklama; tekrar sorulduğunda yeniden hesaplamama.
- **Tabulation:** Taban durumlardan başlayıp bağımlılıkların gerektirdiği sırayla tablo doldurma.
- **Alt küme:** Seçilen nesneler; sıra önemli değildir. **Permütasyon:** Nesnelerin sıralanışı; sıra önemlidir.

Sayılar küçük olsa da aynı kavram farklı örneklerde farklı şeyi sayar: çağrı sayısı, çözüm sayısı, tablo durumu sayısı veya fiziksel kontrol sayısı. Karşılaştırmadan önce birimi yazacağız.

## 1. En büyük parayı almak her zaman güvenli değildir

[Ders sayfasındaki örnek 1](../onceki-ders.html#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** Değerleri 1,3,4 olan paralardan sınırsız kopya var. Toplam 6 oluştururken para sayısını en aza indirmek istiyoruz.

| Yöntem | Seçim | Para sayısı |
|---|---|---:|
| Her adımda sığan en büyüğü al | 4+1+1 | 3 |
| Başka ilk seçimi dene | 3+3 | 2 |

4 seçimi ilk anda daha fazla tutarı kapatır ama kalan 2, iki tane 1 gerektirir. 3 seçimi daha küçük görünse de toplam çözüm daha iyidir. Tek para ile 6 yapılamadığı ve iki para ile yapılabildiği için optimumun 2 olduğunu da kanıtlamış oluruz.

**Hangi iddia çürüdü?** “Her para değerleri kümesinde en büyükten başlamak en az para verir” iddiası. Bütün açgözlü algoritmaların yanlış olduğu çıkmaz. Prim'in kesit özelliği ve Dijkstra'nın negatif olmayan ağırlık koşulu gibi doğruluk gerekçeleri vardı; yeni bir açgözlü kuralın da gerekçesi olmalıdır.

**DP ile bağlantı.** Bu problem için M(t), t tutarını yapan en az para sayısı olsun. M(0)=0. Son para c ise aday 1+M(t−c) olur; uygun bütün c değerlerinden en küçüğü seçilir. M(6) için 3'ü son para almak 1+M(3)=2 verir. Bu fikir, yalnızca ilk görünen tercihe bağlı kalmadan alt cevapları kullanır.

**Kontrol ve cevap.** Sonraki görev örneklerinde aynı görevi iki kez alabilir miyiz? Hayır. Bu para örneği sınırsız kopya, görev örnekleri her görevi en fazla bir kez kullanma modelidir. Bu varsayım değişirse geçiş de değişir.

## 2. Al veya atla: alt kümeleri üretmek

[Ders sayfasındaki örnek 2](../onceki-ders.html#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

Üç farklı görev A,B,C için her birine iki karar verilir: al veya atla. Karar sırası A,B,C olarak sabittir.

```text
A alınırsa:   ABC, AB, AC, A
A atlanırsa:  BC, B, C, boş küme
```

Toplam 2×2×2=8 alt küme vardır. Boş küme de geçerli seçimdir: bütün görevleri atladık. Dördüncü görev eklenince her eski seçimin onu içeren ve içermeyen iki sürümü oluşur; sayı 16 olur.

**Bir dalı takip edelim.** Boş listeden A'yı ekle, B'yi ekle, C'yi ekle: ABC tamamlanır. Geri dönerken C kaldırılır ve C'nin atlandığı AB cevabı elde edilir. Ardından B kaldırılarak AC ve A dallarına geçilir. Aşağıda yapılan değişiklik geri alınmazsa kardeş dallar birbirinin seçimini taşır ve sonuç bozulur.

**Kopya kullanma farkı.** Her çağrıya yeni liste verilirse eski liste değişmez; açık bir `pop` gerekmeyebilir. Aynı liste üzerinde çalışılıyorsa ekleme ve çıkarma dengeli yapılmalıdır. İki uygulama aynı “seç, araştır, geri al” mantığını farklı bellek kullanımıyla gerçekleştirebilir.

**Ne sayılıyor?** Üç görevde 8 tam seçim vardır; tam ikili ağacın çağrı sayısı 1+2+4+8=15'tir. Kök ve kısmi kararlar da çağrıdır. Bütün seçilmiş listeleri yazmak, liste uzunluklarına bağlı ek çıktı maliyeti getirir.

**Kontrol ve cevap.** Dört görevde 16 çözüm sayılması, 16 çağrı demek mi? Hayır. Budamasız tam ağaç 1+2+4+8+16=32−1 düğüm/çağrı içerir.

## 3. Görev seçmek ile görev sıralamak farklıdır

[Ders sayfasındaki örnek 3](../onceki-ders.html#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-5)

A,B,C görevlerinin hepsi bir kez yapılacak; hangi sırada yapılacağını araştırıyoruz. İlk konuma üç, ikinciye kalan iki, sonuncuya kalan bir seçenek vardır.

```text
ABC  ACB  BAC  BCA  CAB  CBA
3! = 3×2×1 = 6
```

Alt kümede AB ile BA aynı seçilmiş kümedir. Permütasyonda ABC ile BAC farklı çalışma sıralarıdır. Soruda sıra önemli değilken permütasyon üretmek aynı cevabı gereksiz yere tekrar sayar.

**Arama durumu.** Şu anki sıralama ve hangi görevlerin kullanıldığı tutulur. Örneğin önek BA ise yalnızca C kullanılabilir. A tekrar seçilirse AAB gibi geçersiz sonuç oluşabilir. Geri dönerken görev “kullanıldı” işareti kaldırılır; başka dalda farklı konumda kullanılabilir.

**Neden n!?** Her yeni konumda kullanılabilir görev sayısı bir azalır. Dört farklı görev için 4×3×2×1=24 sıra vardır. Tüm sıraları listelemek zaten n! ayrı çıktı gerektirir; iyi kod bu çıktı zorunluluğunu ortadan kaldırmaz.

**Sıfır görev.** Bir boş sıralama vardır; bu nedenle 0!=1. “Hiç nesne yok, dolayısıyla hiç çözüm yok” demek taban durumu yanlış kurar. Burada istenen, verilen bütün nesneleri bir kez kullanmaktır; boş liste bunu sağlar.

**Kontrol ve cevap.** AAB, A,B,C'nin permütasyonu mu? Hayır. A iki kez kullanılmış, C kullanılmamıştır.

## 4. Eşit etiketler aynı cevabı tekrar üretebilir

[Ders sayfasındaki örnek 4](../onceki-ders.html#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-7)

A,A,B harflerini düzenleyelim. İki A'yı geçici olarak A₁,A₂ diye ayırırsak altı indeks sıralaması vardır. Fakat A₁ ile A₂ görünürde aynı harftir.

| Görünen dizi | Onu üreten ayırt edilmiş sıralar |
|---|---|
| AAB | A₁A₂B, A₂A₁B |
| ABA | A₁BA₂, A₂BA₁ |
| BAA | BA₁A₂, BA₂A₁ |

Görünür cevap sayısı 3!/2!=3'tür. İki A'nın yer değiştirmesi yeni görünür cevap üretmez.

**Frekansla arama.** Başlangıçta A:2,B:1 olsun. A seçildiğinde A sayacı 1'e iner. Sonraki konum için kalan değerler denenir. Dal bitince sayaç eski değerine artırılır. Aynı karar seviyesinde “ilk A'yı seç” ve “ikinci A'yı seç” diye görünürde aynı iki dal açılmaz.

**Neden geri yüklemek gerekli?** A ile başlayan bütün dalları bitirdikten sonra B ile başlayan dalları araştıracağız. A sayacı geri yüklenmediyse BAA gibi geçerli bir cevap için gereken iki A kaybolmuş görünür.

**Model ayrımı.** Aynı süreli iki fiziksel iş yine farklı işler olabilir. “Aynı değer” mutlaka “aynı nesne” demek değildir. Harf dizisi sorusunda eşit A'lar özdeş sayılıyor; görev kimliklerini ayırt etmemiz isteniyorsa onları birleştiremeyiz.

**Kontrol ve cevap.** AAB için neden altı değil üç cevap? Çünkü görünür diziyi değiştirmeyen iki A değiş tokuşu aynı cevabın ikinci yazılışıdır.

## 5. Dört veziri satır satır yerleştirmek

[Ders sayfasındaki örnek 5](../onceki-ders.html#example-5) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

4×4 tahtada birbirini tehdit etmeyen dört vezir yerleştiriyoruz. Her satıra bir vezir koyduğumuz için satır çatışmasını temsil zaten önler. Karar, sıradaki satırın sütunudur.

**İki çatışma sınaması.** Önceki vezir (r,c), yeni aday (R,C) olsun. Aynı sütun için C=c; aynı köşegen için |R−r|=|C−c| kontrol edilir. Mutlak değer, farkın işaretsiz büyüklüğüdür. Satır ve sütun farkları eşitse hareket çaprazdır.

Örneğin (1,1) ve (2,2), farklar 1 ve 1 olduğu için çatışır. (1,2) ile (2,4) farkları 1 ve 2 olduğu için çatışmaz. Burada satır ve sütunlar 1'den numaralanmıştır.

| Çözüm | Satır 1 sütunu | Satır 2 sütunu | Satır 3 sütunu | Satır 4 sütunu |
|---|---:|---:|---:|---:|
| 1 | 2 | 4 | 1 | 3 |
| 2 | 3 | 1 | 4 | 2 |

İlk çözümde bütün sütunlar farklıdır. Örneğin ilk ve üçüncü vezir arasında satır farkı 2, sütun farkı 1; ikinci ve dördüncü arasında 2 ve 1 vardır. Bütün çiftlerde bu kontrol yapılır; hiçbir köşegen eşitliği oluşmaz.

**Budama neden güvenli?** İki mevcut vezir çatışıyorsa daha sonra yeni vezir eklemek bu ikisini yerinden oynatmaz. Bu önekin hiçbir uzantısı çözüm olamaz. Geri dönüp önceki yerleşimi değiştirmek gerekir.

**Animasyonu okuma.** Çarpıyla gösterilen aday reddedilmeden önce görünür. Bu, algoritmanın yanlış veziri kalıcı yerleştirdiği anlamına gelmez; çatışma sınamasını gösterir. Dört satır başarıyla tamamlanınca çözüm kaydedilir ve diğer çözümler için arama sürer.

**Kontrol ve cevap.** Sonraki vezir mevcut köşegen saldırısını düzeltebilir mi? Hayır; bu nedenle dal erken kesilebilir.

## 6. Sudoku'da az seçeneği olan hücreden başlamak

[Ders sayfasındaki örnek 6](../onceki-ders.html#example-6) · [İlgili ders notu](../lecture-notes.html#topic-2-4)

Görsel 1–4 rakamlarını kullanan 4×4 Sudoku'dur. Her satır, sütun ve 2×2 kutu her rakamı bir kez içermelidir. Verilmiş ipuçları sabit tutulur.

```text
1 . . 4
. 4 1 .
2 1 . 3
4 . 2 1
```

**İlk hücreyi hesaplayalım.** Birinci satır ikinci sütun için satırda eksik rakamlar {2,3}. İkinci sütunda 4 ve 1 var; yine {2,3} mümkün. Sol üst kutuda da 1 ve 4 var. Adaylar {2,3}; henüz tek seçenek yok.

Birinci satır üçüncü sütun için satır {2,3} ister; üçüncü sütunda 1 ve 2 bulunduğundan {3,4} kalır. Kesişim {3} olur; sağ üst kutu da 3'e izin verir. Bu hücre 3'tür. Sonra ilk satırın diğer boş hücresi 2 olur.

**Tamamlanan tablo.**

```text
1 2 3 4
3 4 1 2
2 1 4 3
4 3 2 1
```

**En az aday kuralı.** Boş hücreler arasında aday sayısı en küçük olan seçilir. Bu, imkânsızlıkları daha erken ortaya çıkarabilir. Geçerli çözüm tanımını değiştirmez; yalnızca araştırma sırasını değiştirir.

Hiç adayı olmayan hücreye gelinirse önceki denemelerden biri geri alınır. Tek aday bulunması o hücreyi mevcut dal altında zorunlu yapar; önceki varsayımların tümünün doğru olduğunu tek başına kanıtlamaz. Genel Sudoku'da daha sonra çelişki çıkabilir.

**Kontrol ve cevap.** Bu yöntem geri dönüşü tamamen kaldırır mı? Hayır. Görsel çözücü ilk çözümde durur; sadece bir çözüm göstermesi, çözümün tekliğinin araştırıldığı anlamına gelmez.

## 7. Dokuz milisaniyeyi tam dolduran görevleri seçmek

[Ders sayfasındaki örnek 7](../onceki-ders.html#example-7) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

Görev süreleri sırasıyla 3,34,4,12,5,2 ms. Her görev en fazla bir kez seçilebilir. Hedef en fazla 9 değil, **tam 9**'dur.

| Görev numaraları | Süreler | Toplam |
|---|---|---:|
| 3,5 | 4+5 | 9 |
| 1,3,6 | 3+4+2 | 9 |

Bu örnekte iki çözüm vardır. Büyük süreli 34 ve 12, pozitif süreler arasında toplamı 9'a tamamlayamaz. Kalan 3,4,5,2 üzerinde al/atla kararlarını kontrol ederek iki cevabı doğrulayabiliriz.

**Tam arama maliyeti.** Altı görev için 2⁶=64 yaprak vardır. Kısmi çağrıları da sayınca 1+2+4+8+16+32+64=127 çağrı olur. Yaprak sayısıyla bütün ağacın düğüm sayısı aynı değildir.

**Budama.** Kısmi toplam 9'u aşarsa bu dal kesilir. Çünkü kalan süreler pozitiftir; başka görev eklemek toplamı düşüremez. 34 seçildiği anda o dalın bütün devamlarını üretmek gereksiz olur.

**Neyi koruyoruz?** Budamalı ve budamasız sürüm aynı iki çözümü üretmelidir. Daha az çağrı yaparken cevaplardan birini kaybetmek hızlandırma değil, başka ve yanlış bir algoritmadır. Görsel her girilen çağrıyı sayar; hemen budanan çağrı da bu sayıya dahildir.

**Görev kimliği.** İki ayrı görev aynı süreyi taşıyabilir. O durumda yalnızca süre listesi yazmak hangi görevlerin seçildiğini ayırt etmeyebilir; görev numaraları da tutulur.

**Kontrol ve cevap.** 34 ms görev çözümde olabilir mi? Hayır; tek başına hedefi aşar ve kalan pozitif sürelerle aşağı inilemez.

## 8. Negatif değer, “hedefi aştıysan dur” kuralını bozar

[Ders sayfasındaki örnek 8](../onceki-ders.html#example-8) · [İlgili ders notu](../lecture-notes.html#topic-3-2)

Bu kez matematiksel sayılar 5,4,−3,2; hedef 6. Fiziksel görev süresinin negatif olduğunu iddia etmiyoruz; budama varsayımını sınayan karşı örnektir.

```text
5 seç → toplam 5
4 seç → toplam 9   (burada durmak yanlış)
−3 seç → toplam 6 (geçerli çözüm)
2 atla
```

Pozitif örnekte toplam yalnızca artabiliyordu. Şimdi kalan −3 toplamı azaltabilir. Dolayısıyla aynı budama kuralı geçerli cevabı kaybeder.

**Güvenli genel aralık.** Mevcut toplam s olsun. Kalan bütün negatifleri eklemek ulaşılabilir tamamlamalar için bir alt sınır, bütün pozitifleri eklemek bir üst sınır verir. Hedef bu aralığın dışındaysa dal kesilebilir.

s=9 ve kalanlar {−3,2} için alt sınır 9−3=6, üst sınır 9+2=11'dir. Hedef 6 içeridedir; dal korunur. Ancak aralık içinde olmak bir çözüm bulunduğu anlamına gelmez. Örneğin kalanlar {2,4}, s=0 iken 3, [0,6] aralığındadır fakat hiçbir alt küme 3 yapmaz.

**Neden aralık güvenli?** Negatifleri atlamak toplamı alt sınırın üstüne çıkarır; pozitifleri atlamak toplamı üst sınırın altına indirir. Her gerçek tamamlamanın toplamı iki sınırın arasında kalır. Aralık gerekli koşuldur, yeterli koşul değildir.

**Kontrol ve cevap.** “Hedefin yarısını geçtiysen dur” pozitif sayılarda güvenli mi? Hayır. Hedef 9 için 4+5 çözümünde 5'lik ara toplam yarıyı aşabilir. Budama, yalnızca gözle iyi görünmeye değil bütün devamları dışlayan gerekçeye dayanmalıdır.

## 9. İlk mola: seçim ve budama ayrımı

[Ders sayfasındaki örnek 9](../onceki-ders.html#example-9) · [İlgili ders notu](../lecture-notes.html)

64–74. dakikalar arasındaki moladan sonra aşağıdaki cevapları birer örnekle açıklayın.

**Alt küme ile permütasyon farkı.** AB ile BA aynı görev kümesi olabilir; ABC ile BAC farklı görev sıralarıdır. Önce sıranın çıktı için önemli olup olmadığını belirleyin.

**Geri alma neden gerekli?** Bir dalda kullanılan görevin işareti kalırsa kardeş dal onu kullanamaz. Kısmi çözüm, bir sonraki deneme başlamadan önce eski hâline dönmelidir. Kopyalanan durum kullanılıyorsa bu koruma kopyalar aracılığıyla sağlanır.

**Vezir budaması neden güvenli?** İki mevcut vezirin çatışmasını sonraki vezirler çözemez. Sabit önekin hiçbir devamı geçerli değildir.

**Toplam budaması neye bağlı?** Hedefi aşınca durma, kalan değerler negatif değilse güvenlidir. Negatif değerler toplamı düşürebilir; 5+4−3=6 karşı örneği bunu gösterir.

**Sayım kontrolü.** Altı görevde 64 tam alt küme, budamasız tam ağaçta 127 çağrı vardır. Bu iki sayıyı aynı ölçü gibi karşılaştırmayın.

## 10. Fibonacci aynı soruyu tekrar tekrar sorar

[Ders sayfasındaki örnek 10](../onceki-ders.html#example-10) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

Tanım F(0)=0, F(1)=1; n≥2 için F(n)=F(n−1)+F(n−2). İlk değerler 0,1,1,2,3,5'tir.

F(5), F(4) ile F(3)'ü ister. F(4) de F(3) ile F(2)'yi ister. Böylece F(3) iki ayrı dalda yeniden hesaplanır. Daha küçük sorular daha çok tekrar eder.

| n | F(n): cevap | C(n): saf özyinelemenin çağrı sayısı |
|---|---:|---:|
| 0 | 0 | 1 |
| 1 | 1 | 1 |
| 2 | 1 | 3 |
| 3 | 2 | 5 |
| 4 | 3 | 9 |
| 5 | 5 | 15 |

**Çağrı hesabı.** C(0)=C(1)=1, çünkü taban durum da bir çağrıdır. Diğerlerinde C(n)=1+C(n−1)+C(n−2); baştaki 1, mevcut çağrıyı sayar. F(5)'in sayısal cevabı 5 ama hesaplaması 15 çağrı gerektirir. Cevabın büyüklüğüyle yapılan işlem sayısı karıştırılmamalıdır.

**F(3) izi.** F(3), F(2), F(1), F(0), F(1): beş çağrı. Son iki F(1) aynı değeri döndürse de ayrı çağrı girişleridir.

Bu sayım için C(n)=2F(n+1)−1 bağıntısı da geçerlidir. Örneğin C(5)=2×8−1=15. Amaç formülü ezberlemekten çok aynı sorunun neden tekrar hesaplandığını görmektir.

**Kontrol ve cevap.** Tekrar edilen soru farklı dallarda farklı cevap mı verir? Hayır; sabit Fibonacci tanımı altında F(3) her zaman 2'dir. Saklama fikrinin dayanağı budur.

## 11. Memoization tamamlanan cevabı hatırlar

[Ders sayfasındaki örnek 11](../onceki-ders.html#example-11) · [İlgili ders notu](../lecture-notes.html#topic-4-3)

Önbellek başlangıçta boş olsun. F(5) için ilk kez F(3) gerektiğinde alt çağrılar hesaplanır ve sonuç 2, anahtar 3 altında saklanır. Sonraki F(3) isteğinde aynı alt ağaç tekrar açılmaz.

**İşlem sırası.** Önce “bu durumun cevabı saklı mı?” diye bakılır. Varsa döndürülür. Yoksa alt durumlar çözülür, tamamlanmış sonuç saklanır, sonra döndürülür. Henüz hesaplanmamış ara değeri bitmiş cevap gibi saklamak doğru değildir.

| Ölçü | F(5) saf özyineleme | Görseldeki önbellekli sürüm |
|---|---:|---:|
| Bütün çağrı girişleri | 15 | 9 |
| Farklı durumlar | 6 | 6 |
| Saklanan cevaplar | Yok | F(0)–F(5), altı cevap |

Önbelleğe isabet de bir çağrı ve sorgu olarak sayılır. Bu nedenle “altı farklı durum var, toplam altı çağrı olmalı” çıkarımı yanlıştır. Görsel taban durumları da saklar; başka uygulamalarda başlangıçta hazır taban değerleri veya farklı sayım kuralları olabilir.

**Anahtar neyi içermeli?** Fibonacci'de n yeterlidir. Görev seçmede kalan görevler ve kalan hedef de gerekebilir. Problem kuralları değişirse eski önbellek geçersiz olabilir; ilgili kuralları anahtara katmak veya önbelleği temizlemek gerekir.

**Maliyet.** Toplamayı birim iş saydığımız modelde n+1 durum O(n) iş ve O(n) önbellek/çağrı yığını alanı verir. Büyük Fibonacci tamsayıları çok basamaklı olduğundan gerçek bit işlemlerinin ek maliyeti vardır. O(n) ifadesi bu basitleştirilmiş aritmetik modelle okunmalıdır.

**Kontrol ve cevap.** Önbellek tekrar sorulmayı mı, tekrar genişletilmeyi mi önler? İkincisini. Aynı değer tekrar istenebilir; çocukları yeniden hesaplanmaz.

## 12. Tabloyu bağımlılık sırasıyla doldurmak

[Ders sayfasındaki örnek 12](../onceki-ders.html#example-12) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

Fibonacci'yi aşağıdan yukarı hesaplayalım. F(0)=0 ve F(1)=1 hazırdır. Sonraki hücre, önceki iki hücrenin toplamıdır.

| Hücre | Hesap | Değer |
|---|---|---:|
| F(2) | 0+1 | 1 |
| F(3) | 1+1 | 2 |
| F(4) | 1+2 | 3 |
| F(5) | 2+3 | 5 |
| F(6) | 3+5 | 8 |

Tablo 0,1,1,2,3,5,8 olur. Her hücre hesaplanırken gerekli iki önceki cevap hazırdır. Değişen matematiksel bağıntı değil, hesaplama sırası ve kayıt biçimidir.

**İki değişken yeterli olabilir.** Yalnızca F(6) isteniyorsa bütün eski değerleri saklamak gerekmez. Son iki değer bir çift olarak tutulur: (0,1)→(1,1)→(1,2)→(2,3)→(3,5)→(5,8). Güncellerken eski iki değeri kullanmak gerekir; birini erken değiştirip diğer hesapta yeni değeri yanlışlıkla kullanmayın.

**Alan ve zaman ayrımı.** İki değişkenle saklanan sayı adedi sabittir; toplama sayısı yine n ile büyür. Bütün tabloyu göstermek veya eski bir hücreye sonradan erişmek isteniyorsa alanı azaltmanın bu çıktıya etkisi düşünülmelidir. Büyük sayıların bit uzunluğu açısından “iki değişken” sabit sayıda bit anlamına gelmez.

**Ne zaman önbellek faydasız olabilir?** Alt sorular hiç tekrarlanmıyorsa saklayıp sorgulamak aynı hesapları ortadan kaldırmaz. Her özyinelemeli program otomatik olarak büyük DP kazancı sağlamaz.

**Kontrol ve cevap.** F(6)=8. Bu, merdiven örneğinde altı basamağın rota sayısıyla aynı başlangıç koşullarını kullandığımız anlamına gelmez.

## 13. Dört basamağa çıkış yollarını saymak

[Ders sayfasındaki örnek 13](../onceki-ders.html#example-13) · [İlgili ders notu](../lecture-notes.html#topic-5-3)

Her hareket 1 veya 2 basamak; sıralama önemli. Dört basamak için beş hareket dizisi vardır:

```text
1+1+1+1
1+1+2
1+2+1
2+1+1
2+2
```

**Son harekete göre ayırma.** Son hareket 1 ise önce n−1 basamağa ulaşılmıştır. Son hareket 2 ise önce n−2'ye ulaşılmıştır. Bir dizinin son hareketi aynı anda hem 1 hem 2 olamaz; gruplar ayrıdır. Her geçerli dizinin bir son hareketi olduğundan bütün cevaplar kapsanır.

Bu nedenle ways[n]=ways[n−1]+ways[n−2]. ways[0]=1 ve ways[1]=1. Tablo n=0…4 için 1,1,2,3,5'tir.

**Sıfır neden bir?** Sıfır basamak için bir boş hareket dizisi vardır. Onun sonuna 2 eklemek, iki basamağı tek hareketle çıkmanın yolunu üretir. ways[0]=0 deseydik ways[2]=1 olurdu ve [2] rotasını kaybederdik; doğru cevap [1,1] ve [2] olmak üzere ikidir.

**Fibonacci farkı.** Aynı toplama kuralı farklı taban değerleriyle farklı dizi üretir. Fibonacci F(0)=0 iken bu sayımda ways[0]=1; burada ways[n]=F(n+1) olur. İsme bakıp başlangıçları kopyalamak yerine durumun neyi saydığını yazın.

**Kontrol ve cevap.** 112 ile 211 aynı çözüm mü? Hayır. Hareket sırası farklıdır. Sırasız “kaç tane 1, kaç tane 2 kullanıldı?” sorusu başka bir sayım verir.

## 14. Durum geleceği belirleyecek kadar bilgi tutmalı

[Ders sayfasındaki örnek 14](../onceki-ders.html#example-14) · [İlgili ders notu](../lecture-notes.html#topic-5-2)

“Şimdi toplam 4” bilgisi tek başına yeterli olmayabilir. Örneğin görev süreleri 4,2,2,5 ve hedef 6 olsun. İlk 4'ü aldıktan sonra hâlâ 2,2,5 görevleri vardır ve hedef tamamlanabilir. İlk üç görevi işleyip iki tane 2'yi seçtiysek toplam yine 4'tür; geriye yalnızca 5 kaldığından 6 yapılamaz.

**Yeterli durum.** Görevler sabit sırada işleniyorsa (i,t), “i numaralı görevden itibaren kalan görevlerle t toplamı yapılabilir mi?” demektir. i kalan görev kümesini, t kalan ihtiyacı temsil eder.

```text
Yapılabilir(i,t) =
    Yapılabilir(i+1,t)                 [görevi atla]
    VEYA Yapılabilir(i+1,t−süre[i])    [görevi al]
```

Pozitif süreli karar probleminde t=0 ise boş kalan seçim yeterlidir. Görevler bitti ve t≠0 ise cevap hayırdır. Negatif kalan hedefi budamak yalnızca kalan süreler negatif değilse güvenlidir.

**Beş soru.** Durum ne demek? Taban cevaplar hangileri? Geçiş neden bütün seçenekleri kapsıyor? Hangi sırayla hesaplanacak? İstenen cevap hangi hücrede? Bu sorular cevaplanmadan tabloya sayı yazmak mekanik ve hataya açık olur.

**Tek satır mümkün mü?** Evet; görevleri dış döngüde sırayla işlersek “hangi görevler kullanılabilir?” bilgisi algoritmanın aşamasında saklanır. Tek boyutlu dizi, problemden bu bilginin silindiği anlamına gelmez.

**Maliyet.** Negatif olmayan tamsayı süreler ve hedef T için O(nT) karar tablosu kullanılabilir. Bu, T'nin sayısal değerine bağlıdır; ikili yazım uzunluğuna göre polinom değildir. T iki katına çıkınca gereken hücreler yaklaşık iki kat artarken T'yi yazmak için yalnızca bir bit daha gerekebilir. Buna sözde polinom zaman denir.

## 15. Ekip seçmek: son kişiyi al veya alma

[Ders sayfasındaki örnek 15](../onceki-ders.html#example-15) · [İlgili ders notu](../lecture-notes.html#topic-5-5)

Beş farklı kişiden üç kişilik ekip seçiyoruz. Sıra önemli değil. Son kişi E olsun.

| Durum | Geriye kalan seçim | Sayı |
|---|---|---:|
| E ekipte | İlk dört kişiden iki kişi | C(4,2)=6 |
| E ekipte değil | İlk dört kişiden üç kişi | C(4,3)=4 |

İki durum aynı ekibi içeremez; bir ekip E'yi ya içerir ya içermez. Toplam 6+4=10'dur. Genel bağıntı C(n,k)=C(n−1,k−1)+C(n−1,k).

**Pascal satırları.**

```text
n=0: 1
n=1: 1 1
n=2: 1 2 1
n=3: 1 3 3 1
n=4: 1 4 6 4 1
n=5: 1 5 10 10 5 1
```

Satırdaki konum k=0'dan başlar. C(5,3), son satırın dördüncü girişidir: 10. Kenarlarda 1 vardır; kimseyi seçmenin bir yolu, herkesi seçmenin bir yolu vardır. k<0 veya k>n ise 0; mümkün olmayan ekip boyutu.

**Neden faktöriyel kadar saymıyoruz?** ABC, ACB ve CBA aynı ekip olabilir. Her üç kişilik ekibin 3!=6 sıralaması vardır. Sıraları ayrı saymak istenmeyen çoğaltma yapar. Bu tablo yalnızca ekip sayısını üretir; on ekibin ad listesini üretmiş olmaz.

**Kontrol ve cevap.** C(5,3)=10 sonucu hangi iki ayrık grubun toplamı? E'li altı ekip ve E'siz dört ekip.

## 16. İkinci mola: bağıntı aynı, anlam farklı olabilir

[Ders sayfasındaki örnek 16](../onceki-ders.html#example-16) · [İlgili ders notu](../lecture-notes.html)

122–132. dakikalar arasındaki moladan sonra üç taban durumu karşılaştırın.

| Soru | Sıfır durumunun cevabı | Gerekçe |
|---|---:|---|
| Fibonacci F(0) | 0 | Dizinin tanımı |
| Sıfır basamağa çıkış sayısı | 1 | Bir boş hareket dizisi |
| Sıfır kişilik ekip sayısı | 1 | Bir boş ekip |

**Soru.** F(5)=5, saf programın çağrı sayısı da 5 mi? Hayır. 15 çağrı vardır; sonuç değeriyle işlem sayısı ayrıdır.

**Soru.** Önbellekte altı durum varsa altı çağrı mı yapılır? Hayır. Tekrar sorguları da çağrı sayılır; görselin F(5) örneğinde toplam 9 çağrı vardır.

**Soru.** Görev seçiminde yalnızca mevcut toplamı saklamak güvenli mi? Gelecekte hangi görevlerin kaldığı da belli olmalı. Bu bilgi durumdaki indeksle veya tabloyu dolduran dış döngünün aşamasıyla taşınabilir.

**Küçük alıştırma.** Dört basamağın beş dizisini iki gruba ayırın. Sonu 1 olanlar 1111,121,211; sonu 2 olanlar 112,22. Sayılar 3+2=5. Böylece toplama kuralının bütün cevapları kapsayıp hiçbirini iki kez saymadığını görürsünüz.

## 17. Hiçbir etiket kendi yerinde kalmasın

[Ders sayfasındaki örnek 17](../onceki-ders.html#example-17) · [İlgili ders notu](../lecture-notes.html#topic-1-6)

1,2,3 etiketlerini 1,2,3 konumlarına birer kez yerleştiriyoruz. i konumuna i etiketi gelemez. Böyle permütasyonlara sabit noktasız permütasyon, İngilizcede derangement denir.

| Dizi | Kontrol | Geçerli mi? |
|---|---|---|
| 2,3,1 | 1. yerde 2; 2. yerde 3; 3. yerde 1 | Evet |
| 3,1,2 | Hiçbiri kendi yerinde değil | Evet |
| 2,1,3 | 3. yerde 3 kaldı | Hayır |

Normal permütasyon aramasına ek olarak aday etiketin konumdan farklı olması sınanır. Kendi konumuna gelen etiket, daha sonra başka yerlere ekleme yapılarak düzeltilemez; o dal erken kesilir.

**İsteğe bağlı sayım bağıntısı.** D(0)=1, D(1)=0 ve n≥2 için D(n)=(n−1)(D(n−1)+D(n−2)). D(2)=1, D(3)=2, D(4)=9 olur.

**İki durumun gerekçesi.** Etiket 1'in gideceği başka konumu j seçin: n−1 seçenek. Etiket j de 1. konuma gidiyorsa bu ikili yer değiştirir; kalan n−2 eleman için D(n−2) seçenek vardır. Etiket j, 1. konuma gitmiyorsa 1 daha uzun bir döngü içindedir. O döngüden 1 çıkarılarak n−1 eleman üzerinde bir sabit noktasız permütasyonla bire bir eşleme kurulabilir; sayı D(n−1)'dir. Seçilen j için iki durum ayrıdır, sonra n−1 ile çarpılır.

**Kontrol ve cevap.** İki etiket için yalnızca 2,1 geçerlidir. Bağıntı cevap sayısını verir; dokuz farklı dört-etiketli diziyi tek tek yazmış olmaz.

## 18. Tam iki kenar kullanmak ayrı bir kısıttır

[Ders sayfasındaki örnek 18](../onceki-ders.html#example-18) · [İlgili ders notu](../lecture-notes.html#topic-5-8)

A→B=2, B→C=3, A→C=1 olsun. Kaynak A.

| Kullanılan kenar sayısı | A maliyeti | B maliyeti | C maliyeti |
|---|---:|---:|---:|
| Tam 0 | 0 | ∞ | ∞ |
| Tam 1 | ∞ | 2 | 1 |
| Tam 2 | ∞ | ∞ | 5 |

Serbest kenar sayısında A→C maliyeti 1 en iyidir. **Tam iki kenar** koşulunda A→B→C, maliyet 2+3=5 gerekir. Bir kenarlı cevabı iki kenarlı satıra aynen kopyalamak koşulu bozar.

**Durum.** dp[k][v], A'dan v'ye tam k kenarlı en ucuz yürüyüştür. dp[0][A]=0; diğer sıfır-kenar hedefleri ∞. Son kenar u→v ise önce tam k−1 kenarla u'ya gelinmiştir. Aday dp[k−1][u]+w(u,v); bütün gelen kenarlar arasından minimum alınır.

**Neden yeni satır?** Bir satırı hesaplarken yalnızca önceki satırı okumak, tam bir kenar eklemeyi garanti eder. Yeni güncellenen hücreyi aynı satırda yeniden kullanırsak tek aşamada birkaç kenar ilerleyebiliriz. Week 11 Bellman–Ford'daki yerinde güncellemeyle bu tablo aynı ara-anlamı taşımaz.

**Tam ve en fazla ayrımı.** “En fazla iki” sorusunda bir kenarlı 1 maliyetli rota geçerli olur. “Tam iki” sorusunda değildir. Durum tanımındaki tek sözcük geçişi değiştirebilir.

**Negatif çevrim.** Burada tekrar eden düğümler serbesttir ama k sabittir. Sonlu graf ve sonlu ağırlıklarda en fazla bu kadar kenar kullanabileceğimiz için çevrimi sınırsız tekrar edemeyiz. Problem sonlu kalır. Genel hesap için O(k(n+m)) ile satır hazırlayıp kenar taraması yapılabilir; iki satırla yalnızca maliyetler saklanabilir.

## 19. Merdiven tablosunu Python'da çalıştırmak

[Ders sayfasındaki örnek 19](../onceki-ders.html#example-19) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

Ana örnekteki Run düğmesi aşağıdaki kodu çalıştırır. n değişkeni basamak sayısıdır; sonuç, 1 veya 2 basamaklık hareketlerin sıralı dizilerini sayar.

```python
n = 4
if not isinstance(n, int) or not 0 <= n <= 30:
    raise ValueError("Choose a whole number from 0 to 30")
ways = [0] * (n + 1)
ways[0] = 1
if n >= 1:
    ways[1] = 1
for step in range(2, n + 1):
    ways[step] = ways[step - 1] + ways[step - 2]
print("Table:", ways)
print("Number of routes:", ways[n])
```

| Satır | Açıklama |
|---|---|
| 1 | Çıkılacak basamak sayısını 4 seçer. Başka örnek için bu değeri değiştirin. |
| 2 | n'nin tamsayı türünde ve 0–30 aralığında olup olmadığını sınar. `or`, iki geçersizlikten biri varsa hata yoluna girer. |
| 3 | Geçersiz girişte hesaplamayı durdurup hata mesajı verir. |
| 4 | 0'dan n'ye kadar n+1 hücre oluşturur; başlangıçta hepsi 0'dır. |
| 5 | Sıfır basamak için bir boş hareket dizisini kaydeder. |
| 6 | 1 numaralı hücre gerçekten var mı diye sınar. n=0 iken yoktur. |
| 7 | Bir basamak için tek rota [1] olduğundan 1 yazar. |
| 8 | 2,3,…,n durumlarını sırayla işler. `range` üst sınırı dahil etmez; bu yüzden n+1 kullanılır. |
| 9 | Son hareketi 1 ve son hareketi 2 olan ayrık grupların sayılarını toplar. |
| 10 | Bütün ara cevapları gösterir; tabloyu elle hesapla karşılaştırabiliriz. |
| 11 | İstenen n durumunun cevabını yazdırır. |

**n=4 çıktısı.**

```text
Table: [1, 1, 2, 3, 5]
Number of routes: 5
```

| Değiştirilen n | Tablo / sonuç | Neyi sınar? |
|---|---|---|
| 0 | [1], sonuç 1 | Boş hareket dizisi; ways[1] yazılmaz |
| 1 | [1,1], sonuç 1 | Döngü hiç çalışmadan taban cevap |
| 5 | [1,1,2,3,5,8], sonuç 8 | 5+3 toplamı |
| −1 veya 32 | ValueError | İzin verilen aralık |

**Kodun sınırı.** 30 sınırı matematiksel zorunluluk değil, gösterimi okunabilir tutan ders tercihidir. Python tamsayıları bu sonuçları tam temsil eder. `isinstance(True,int)` Python'da doğru olduğundan bu kısa tür kontrolü boolean değerini ayrıca dışlamaz; ders deneylerinde n için 0,1,4 gibi tamsayılar kullanın. `input()` çağrısı yoktur.

**Kontrol ve cevap.** ways[0]=0 yapılsaydı? n=2 için [2] yolu sayılmaz, sonraki bütün cevaplar yanlış kayar. Hata yalnızca sıfır basamak çıktısını etkilemez.

## 20. Robot engelin çevresindeki rotaları sayar

[Ders sayfasındaki örnek 20](../onceki-ders.html#example-20) · [İlgili ders notu](../lecture-notes.html#topic-6-2)

Izgara 3 satır, 4 sütun. Başlangıç sol üst, hedef sağ alt. Yalnızca **sağa veya aşağıya** gidilebilir. Görselin başlangıç engeli ikinci satır ikinci sütundadır; aşağıda satır ve sütunları 1'den sayıyoruz.

| Hücre sayımları | Sütun 1 | Sütun 2 | Sütun 3 | Sütun 4 |
|---|---:|---:|---:|---:|
| Satır 1 | 1 | 1 | 1 | 1 |
| Satır 2 | 1 | Engel: 0 | 1 | 2 |
| Satır 3 | 1 | 1 | 2 | 4 |

**Başlangıç.** Açık başlangıç hücresine bir boş rota vardır. Engelli hücreye sıfır rota girer. Diğer açık hücrelerin cevabı üst komşu + sol komşudur. Izgara dışı komşu 0 katkı yapar.

**Örnek hücre.** İkinci satır dördüncü sütuna yukarıdan 1, soldan 1 rota gelir; toplam 2. Hedefe yukarıdan 2, soldan 2 gelir; cevap 4. İki grubun son hareketleri farklı olduğundan aynı rota iki kez sayılmaz.

**Engel kalkarsa.** Tablo sırasıyla [1,1,1,1], [1,2,3,4], [1,3,6,10] olur; cevap 10. Bağımsız kontrol: hedefe iki aşağı, üç sağ hareket gerekir. Beş hareketin ikisinin aşağı yerlerini seçmek C(5,2)=10 verir.

Engelin üzerinden geçecek rotalar da sayılabilir: başlangıçtan (2,2)'ye 2 yol, oradan hedefe 3 yol; 2×3=6 rota engellenir. 10−6=4, tabloyla aynıdır. Bu çıkarma burada tek engel için kolaydır; çoklu engellerde engellenen rotalar örtüşebilir.

**Görselde deneme.** Hücreye tıklayınca engel durumu değişir ve hesap baştan kurulur. Başlangıç veya hedef engellenirse cevap 0 olur. Bu bir rota sayımıdır; rotaları tek tek listelemez, maliyet minimize etmez.

**Kontrol ve cevap.** Dört yönde aynı kural çalışır mı? Hayır. Geri dönüşler çevrim yaratır; yürüyüş sayısı sınırsız olabilir. Sağ/aşağı kısıtı bağımlılıkları çevrimsiz yapar.

## 21. Robot kolunda düzeltilemeyecek çarpışmayı erken elemek

[Ders sayfasındaki örnek 21](../onceki-ders.html#example-21) · [İlgili ders notu](../lecture-notes.html#topic-6-1)

Üç eklemin her birinde 12 izinli açı var. Bütün tam konfigürasyonlar 12³=1.728 adettir. Sabit tabanlı seri kol modelinde önceki eklem açıları sabitse sonraki eklemler, önceki kol parçasının konumunu değiştirmez.

| Aşama | Yapılan aday kontrolü | Sonraki aşamaya kalan |
|---|---:|---:|
| Birinci eklem | 12 | 4 ret, 8 önek |
| İkinci eklem | 8×12=96 | Her önekte 3 ret; 8×9=72 önek |
| Üçüncü eklem | 72×12=864 | Tam adaylar burada sınanır |

Toplam önek düzeyinde kontrol 12+96+864=972'dir. Üçüncü aşamadaki bütün adayların geçerli olduğu söylenmiyor; bu sayı değerlendirilen adayları gösterir.

**Atlanan tam konfigürasyonlar.** İlk eklemde reddedilen dört açı, 4×12×12=576 tam devamı ortadan kaldırır. Sağ kalan ilk açılar altında ikinci eklemde reddedilenler 8×3×12=288 devamı kaldırır. Gruplar ayrıdır; toplam atlanan 864. Böylece 1.728−864=864 tam adaya kadar ulaşılır.

**972 ile 1.728 aynı birim mi?** Hayır. 972 önek düzeyinde, 1.728 tam-konfigürasyon düzeyinde kontroldür. İşlem süreleri hakkında doğrudan yüzde kazanç çıkarmak için her kontrolün ne kadar iş yaptığı belirtilmelidir. Güvenilir doğrudan sonuç, belirtilen modelde 864 tam konfigürasyonun erken elendiğidir.

**Budama koşulu.** Sabit önceki kol parçası duvara giriyorsa sonraki açı seçimleri o parçayı kurtaramaz. Ama yalnızca uç nokta şu anda hedefe uzak diye dal kesmek, ulaşamayacağını gösteren ek bir sınır olmadan güvenli değildir.

**Kontrol ve cevap.** Bu gerçek çarpışma simülasyonu mu? Hayır; her aşamadaki ret sayılarının verildiği sayım modelidir. Gerçek robotta geometri, eklem sınırları ve çarpışma testleri ayrıca tanımlanmalıdır.

## 22. Listele, say veya karar ver: doğru çıktıyı seçmek

[Ders sayfasındaki örnek 22](../onceki-ders.html#example-22) · [İlgili ders notu](../lecture-notes.html#topic-5-9)

Aynı görev kümesi için farklı istekler farklı iş gerektirir.

| İstek | Örnek çıktı | Uygun yaklaşım fikri |
|---|---|---|
| Tam 9 yapan bir seçim var mı? | Evet/hayır | Erişilebilirlik DP veya arama |
| Kaç seçim var? | 2 | Doğru durumlu sayım DP veya arama |
| Bütün seçimleri yaz | {3,5}, {1,3,6} görev numaraları | Geri izleme veya DP destekli üretim |

Sayım tablosu hızlı olsa bile bütün çözümleri yazmak çok büyük çıktı gerektirebilir. DP, üretilmesi istenen ayrı sonuçların zorunlu çıktı maliyetini ortadan kaldırmaz. Geri izleme de yalnızca listeleme için değildir; ilk çözümde durarak karar problemi çözebilir.

**Tek satırla bir-kez görev seçimi.** reachable[s], işlenen görevlerden s toplamının yapılabildiğini söylesin. Başlangıçta yalnızca reachable[0]=True. Her görev süresi d için s değerleri T'den d'ye **azalarak** güncellenir: reachable[s], önceki değeri veya reachable[s−d] doğruysa doğru olur.

**Neden azalan sıra?** Tek görev 3, hedef 6 olsun. Başlangıçta 3 ve 6 yanlış. Azalan sırada önce 6 kontrol edilir; 3 henüz yanlış olduğu için 6 yanlış kalır. Sonra 3, reachable[0] üzerinden doğru olur. Görev yalnızca bir kez kullanıldı.

Artan sırada önce 3 doğru yapılır; sonra 6 hesaplanırken aynı turda yeni yapılmış 3 okunur ve 6 da doğru olur. Bu, tek 3'lük görevi iki kez kullanmış olmaktır. İki ayrı 3'lük görev gerçekten varsa ikinci dış turda 6'nın doğru olması ise geçerlidir.

**İki satırlı alternatif.** Yeni satır yalnızca eski satırı okuyorsa bu karışıklık oluşmaz. Alan azaltarak tek satıra geçmek, güncelleme sırasını ispatın bir parçası hâline getirir.

**Son kontrol.** Bir durumun anlamını, taban cevabı, geçişi ve hangi bilginin eski/yeni olduğunu söyleyin. Bir budamanın neden hiçbir doğru cevabı kaybetmediğini karşı örnek arayarak sınayın. Bu hafta temel kazanım belirli kodu ezberlemek değil, seçimleri doğru temsil etmek ve tekrar edilen soruları güvenle birleştirmektir.

