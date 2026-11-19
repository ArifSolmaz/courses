# AA · 6. Hafta — 28 örneğin Türkçe teknik açıklaması

Bu notlar, **“Sorting, heaps and priority queues”** dersinin 28 kartını aynı sırayla açıklar. Önce bir işlemin ne yaptığını, sonra neden doğru olduğunu, en son maliyetini ele alıyoruz. Sayılara bakarken dizideki konumu, o konumdaki değeri ve yapılan işlem sayısını birbirinden ayırın. 14 ve 21 numaralı kartlar moladır; burada cevaplı tekrar bölümü olarak kullanılmıştır.

## Başlamadan: terimler ve sayım kuralları

- **Öncelik kuyruğu (priority queue):** Bir sonraki çıkarılacak kaydı öncelik anahtarına göre seçen soyut veri yapısı. İkili heap, bunu gerçekleştirme yollarından biridir.
- **Min-heap:** Ebeveyn değeri çocuklarının değerlerinden büyük değildir. **Max-heap:** Ebeveyn değeri çocuklarının değerlerinden küçük değildir. Eşitlik her ikisinde de mümkündür.
- **Tamamlanmış şekil (complete binary tree):** Son seviye dışında seviyeler doludur; son seviye soldan sağa, arada boşluk bırakılmadan doldurulur. Bütün seviyelerin dolu olması gerekmez.
- **İndeks:** Dizideki yerin numarası. Yeni örneklerde 0'dan başlar. **Değer:** O yerde saklanan anahtar. Ebeveyn hesabında değeri değil indeksi kullanırız.
- **n:** Kayıt sayısı. **h:** Kökten en derin yaprağa kadar kenar sayısı. Tek düğümde h = 0. **k:** İstenen sıra numarası; örneğin üçüncü küçük değer için k = 3.
- **O:** Büyüme için üst sınır. **Θ:** Hem üst hem alt sınırla belirlenen büyüme mertebesi. O(log n), tam olarak log n karşılaştırma veya belirli bir süre demek değildir. Maliyetin en kötü, beklenen veya amortize olduğu ayrıca söylenmelidir.
- **Yerinde (in-place):** Bu haftaki heapsort bağlamında, giriş dizisini kullanarak sabit miktarda ek çalışma alanıyla sıralama. **Kararlı (stable):** Tam sıralama anahtarları eşit kayıtların başlangıçtaki göreli sırasını koruma.

**Ne sayıyoruz?** Karşılaştırma, iki saklanan anahtarın büyüklüğünü karşılaştırmaktır. Takas, iki konumun değerlerini değiştirmektir. Bunlar farklı sayılardır. İndeks hesabı, döngü koşulu, bellek ayırma ve çıktıyı çizme maliyetleri bir karşılaştırma sayacına otomatik olarak dahil değildir.

## 1. Bir sonraki işi seçmenin üç kuralı

[Ders sayfasındaki örnek 1](../onceki-ders.html#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** İşler A, B, C sırasıyla geliyor. Son teslim zamanları A için 9, B için 3, C için 7 milisaniye. “Sıradaki iş hangisi?” sorusu, bir seçim kuralı söylemeden cevaplanamaz.

| Yapı | Seçim kuralı | İlk çıkan |
|---|---|---|
| Kuyruk | İlk giren ilk çıkar: FIFO | A |
| Yığın / stack | Son giren ilk çıkar: LIFO | C |
| Min-öncelik kuyruğu | En küçük son teslim zamanı | B |

**Neden B?** 3, 7 ve 9'dan küçüktür. B'nin sonradan gelmesi bu kuralda onu geri bırakmaz. Burada iş adı kaydın kimliği, son teslim zamanı ise seçim anahtarıdır. İşlerin kendisi değişmiyor; yalnızca hangi ölçüte göre çıkarılacakları değişiyor.

**Soyut kural ile uygulamayı ayırın.** Kuyruk, stack ve öncelik kuyruğu birer davranış tanımlar. Dizi, bağlı yapı veya heap ise bu davranışın nasıl gerçekleştirildiğiyle ilgilidir. Bu haftada öncelik kuyruğunu dizide saklanan ikili heap ile gerçekleştireceğiz. Heap sözcüğü burada bellek yöneticisinin heap alanından farklı bir kavramdır.

**Kontrol ve cevap.** C'nin son teslim zamanı 1 olursa normal FIFO kuyruğu C'yi otomatik olarak başa getirmez. Öncelik kuyruğunda da saklanan anahtarı değiştirip yapıyı onarmak gerekir. Dışarıdaki bir değişkeni güncellemek, heap'in yerleşimini kendiliğinden düzeltmez. Ayrıca en erken işi seçmek, tek başına bütün işlerin zamanında tamamlanacağını kanıtlamaz.

## 2. Minimumu kolay erişilir tutmak

[Ders sayfasındaki örnek 2](../onceki-ders.html#example-2) · [İlgili ders notu](../lecture-notes.html#topic-0-2)

**Problem.** Sürekli “en erken son teslim zamanı hangisi?” diye soruyoruz. Sırasız dizide bu soruya her defasında bütün kayıtları tarayarak cevap verebiliriz. Min-heap ise minimumu kökte tutar.

```text
Min-heap: [5, 9, 7]
Kök: indeks 0 → değer 5
peek → 5; dizi değişmez
```

**Neden kök minimumdur?** Her ebeveyn çocuğundan büyük değilse, kökten herhangi bir düğüme inen yol boyunca değer azalamaz. Dolayısıyla hiçbir düğüm kökten küçük olamaz. Bu sonuç, yalnızca kökün çocuklarıyla değil, her seviyedeki ebeveyn–çocuk ilişkisiyle sağlanır.

**Diğer yapılarla karşılaştırma.** BST minimumu bulmak için sol bağlantıları izler; maliyet yüksekliğe bağlıdır. Hash tablosu anahtarla erişim için düzenlenir, minimum anahtarı kökte tutma gibi bir kuralı yoktur. Min-heap, bütün sıralı sözlük işlemlerini değil, minimumu tekrar tekrar kullanma işini kolaylaştırır.

**Okuma ve silme farklıdır.** `peek` kökü okur; O(1). `extract-min` kökteki kaydı çıkarır, başka kayıtların yerleşimini değiştirebilir; heap düzeni onarılmalıdır. Kökün kolay okunması, çıkarılmasının da sabit maliyetli olduğu anlamına gelmez.

**Kontrol ve cevap.** Heap içinde rastgele bir sensör kimliğini anında bulabilir miyiz? Ek bir indeks yoksa hayır; en kötü O(n) arama gerekebilir. Heap'in dalları BST gibi “aranan büyükse sağa git” bilgisi vermez.

## 3. Sıralamaya neden emek harcıyoruz?

[Ders sayfasındaki örnek 3](../onceki-ders.html#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

**Problem.** Ölçümler `[41, 7, 19, 3, 25, 12, 8]` sırasıyla gelmiş. Sıralanınca `[3, 7, 8, 12, 19, 25, 41]` olur. Bu yeni düzen bazı sonraki soruları kolaylaştırır; fakat düzeni kurmanın maliyeti vardır.

**Tek minimum için:** İlk değeri geçici minimum seçeriz. 7 ile karşılaştırınca minimum 7, 19'da değişmez, 3'te minimum 3 olur; kalanlar daha büyüktür. Yedi elemanda altı anahtar karşılaştırması yeterlidir. Genel olarak bu tarama Θ(n) zaman, sabit ek alan kullanır. Bütün diziyi sıralamak gereksiz ek iş olabilir.

**Çok sayıda sorgu için:** Dizi sabit kalacaksa sıralama sonrasında ikili arama kullanılabilir. q sorgu için sırasız taramalar O(qn), karşılaştırmalı sıralama ve ikili aramalar toplam O(n log n + q log n) üst sınırı verir. Bu, mutlaka her küçük girdide daha hızlı çalışma iddiası değildir; sabit maliyetler de önemlidir.

**Başka kazanımlar.** Tekrar eden değerler yan yana gelir. En yakın sayıları bulmak için komşular karşılaştırılabilir. Küçükten büyüğe rapor üretmek doğrudan mümkün olur. Sıralama, veride önceden var olan büyüklük ilişkisini erişilebilir hale getirir.

**Dikkat.** Ölçümün zamanı ve sensör kimliği varsa, değeri bütün kaydıyla birlikte taşıyın. Yalnızca ölçüm sütununu sıralayıp diğer sütunları yerinde bırakmak verinin anlamını bozar. Giriş değişmeye devam ediyorsa sıralı düzeni sürdürme maliyeti de değerlendirmeye katılmalıdır.

## 4. En yakın sayılar sıralanınca komşu olur

[Ders sayfasındaki örnek 4](../onceki-ders.html#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

**Problem.** Önceki yedi ölçüm arasındaki en küçük mutlak farkı arıyoruz. Her çifti denemek `7 × 6 / 2 = 21` çift gerektirir. Sıralı dizide yalnızca altı komşu aralığına bakabiliriz.

| Komşular | Fark |
|---|---:|
| 3, 7 | 4 |
| 7, 8 | 1 |
| 8, 12 | 4 |
| 12, 19 | 7 |
| 19, 25 | 6 |
| 25, 41 | 16 |

**Sonuç:** 7 ve 8, fark 1. Ama neden komşu olmayan bütün çiftleri güvenle atlayabildik? Sıralı üç sayı `x ≤ y ≤ z` için `z − x = (y − x) + (z − y)`. İki terim de negatif değildir. Dolayısıyla x ile z arasındaki uzaklık, aradaki komşu aralıklardan daha küçük olamaz. Daha uzun bir aralıkta da aynı toplam düşüncesi geçerlidir. En az bir en yakın çift komşular arasında bulunur.

**Tekrarlar:** `[6, 2, 6, 9]` sıralanınca `[2, 6, 6, 9]` olur. İki ayrı 6 kaydının farkı 0'dır; bundan küçük mutlak fark olamaz. Aynı kaydı kendisiyle eşleştirmiyoruz; iki ayrı konumdaki kaydı kullanıyoruz.

**Maliyet ve kapsam.** Sıralama O(n log n), sonraki tarama Θ(n); toplam O(n log n). Girdi zaten sıralıysa yalnızca tarama gerekir. En az iki kayıt olmalıdır. Bu kanıt sayı doğrusu içindir; iki boyutlu noktaları yalnızca x koordinatına göre sıralayıp komşuları kontrol etmek aynı garantiye sahip değildir.

## 5. Eşitlik durumunun kuralı da görevin parçasıdır

[Ders sayfasındaki örnek 5](../onceki-ders.html#example-5) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

**Problem.** Giriş sırası `Ece 90, Ali 85, Can 90, Deniz 85`. Notları büyükten küçüğe sıralıyoruz. Eşit notlarda kimin önce geleceği ayrıca tanımlanmalıdır.

```text
Yalnızca nota göre kararlı:
Ece 90 → Can 90 → Ali 85 → Deniz 85

Önce azalan not, sonra artan ad:
Can 90 → Ece 90 → Ali 85 → Deniz 85
```

**Kararlılık neyi korur?** Sıralama anahtarı yalnızca notsa Ece ve Can eşit anahtarlıdır. Kararlı sıralama, başlangıçta önce gelen Ece'yi önce tutar. Kendiliğinden alfabetik sıralama yapmaz. Adı ikinci anahtar olarak eklersek artık iki kaydın tam anahtarları farklıdır; Can'ın önce gelmesi kararlılıktan değil ikinci ölçütten kaynaklanır.

**Python karşılığı.** Bu adlar için `key=lambda kayit: (-kayit[1], kayit[0])`, `(ad, not)` biçimindeki kayıtları azalan nota ve eşitlikte artan ada göre düzenler. Eksi işareti yüksek notu küçük sayısal anahtara çevirir. Python'ın `sorted()` işlemi kararlıdır. Gerçek Türkçe alfabetik sıralama gerekiyorsa varsayılan karakter sırasının dilin sıralama kurallarıyla aynı olduğu varsayılmamalıdır.

**Kayıt bütünlüğü.** Ad ile not birlikte taşınır. Yalnızca notları sıralamak kimin hangi notu aldığını kaybettirir. Standart yerinde heapsort genel olarak kararlı değildir; eşit kayıtların göreli sırası değişebilir.

**Kontrol ve cevap.** Yalnızca nota göre kararlı sıralamada 85 alan Ali, Deniz'den önce kalır. Çünkü başlangıç sırası böyledir; ad karşılaştırması yapılmasına gerek yoktur.

## 6. En ağır çifti hafifletmek için büyükle küçüğü eşleştirmek

[Ders sayfasındaki örnek 6](../onceki-ders.html#example-6) · [İlgili ders notu](../lecture-notes.html#topic-1-4)

**Problem.** Ağırlıklar `[1, 3, 5, 9]`. Her parça bir kez kullanılacak ve ikişerli gruplar kurulacak. Amaç, **en büyük çift toplamını en aza indirmek**; bütün ağırlıkların toplamını değiştirmek değil.

| Eşleştirme | Çift toplamları | En büyük |
|---|---|---:|
| (1,3), (5,9) | 4, 14 | 14 |
| (1,5), (3,9) | 6, 12 | 12 |
| (1,9), (3,5) | 10, 8 | 10 |

**Yöntem.** Sıraladıktan sonra en küçükle en büyüğü eşleştirir, iki uçtan içeri ilerleriz. Dört eleman için bütün olasılıklar yukarıdadır; son seçenek en iyidir.

**Genel gerekçe: eş değiştirme.** En küçük a ve en büyük d başka çiftlerde olsun: `(a,b)` ve `(c,d)`. Bunların yerine `(a,d)` ve `(b,c)` kurabiliriz. `a ≤ c` olduğundan `a+d ≤ c+d`; `b ≤ d` olduğundan `b+c ≤ d+c`. İki yeni toplam da eski çiftlerden c+d'yi aşmaz, dolayısıyla eski en büyük çift toplamını artıramaz. En küçük ve en büyüğü birlikte kullanmanın zarar vermediğini gösterdik. Kalan değerlerde aynı gerekçeyi tekrarlayabiliriz.

**Maliyet ve sınır.** Sıralama O(n log n), eşleştirme Θ(n). Eleman sayısı çift olmalı ve hedef tam olarak en büyük ikili toplamı küçültmek olmalıdır. Üçerli gruplar, farklı makine kısıtları veya başka hedefler için bu sonucu otomatik kullanamayız.

**Kontrol ve cevap.** `[2,4,6,8]` için (2,8) ve (4,6); iki toplam da 10. Toplam yük 20 sabit olduğundan iki çiftin en büyüğü 10'dan küçük olamaz; bu sonuç alt sınıra ulaşır.

## 7. Peek okur; extract çıkarır

[Ders sayfasındaki örnek 7](../onceki-ders.html#example-7) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

**Problem.** Zamanlayıcıların son teslim değerleri `[5, 9, 7]`. Minimum 5'tir. Aynı minimum üzerinde iki farklı işlem yapabiliriz.

| İşlem | Dönen değer | Kalan kayıtlar |
|---|---:|---|
| peek | 5 | 5, 9, 7 hâlâ içeride |
| extract-min | 5 | 7 ve 9 kalır |

**Arka arkaya iki peek:** Arada güncelleme yoksa ikisi de 5 verir. **İki extract:** Önce 5, sonra 7 çıkar. Birinci işlem sadece gözlem, ikinci işlem durum değişikliğidir. Kod okurken aynı çıktıyı vermelerinin aynı işi yaptıkları anlamına gelmediğini hatırlayın.

**Min mi max mı?** Küçük son teslim zamanı daha acilse min-öncelik kuyruğu uygundur. Öncelik puanı büyüdükçe aciliyet artıyorsa max-öncelik kuyruğu kullanılabilir. “Öncelik” kelimesi tek başına küçüğün mü büyüğün mü seçileceğini söylemez.

**Eşitlik kuralı.** İki işin zamanı aynıysa hangisinin önce çıkacağı tanımlı olmayabilir. Geliş sırası korunacaksa anahtar `(son_teslim, geliş_sırası)` yapılabilir. Önce zaman, eşitse artan sıra numarası karşılaştırılır. Benzersiz sıra numarası, karşılaştırılamayan iş nesnelerinin yanlışlıkla karşılaştırılmasını da önleyebilir.

**Sınır durumu.** Boş yapıda minimum yoktur. Program boşluğu kontrol etmeli veya kullanılan kütüphanenin hatasını ele almalıdır. 0 gibi geçerli bir önceliği “boş” anlamında döndürmek belirsizlik yaratabilir.

## 8. Tekrar tekrar taramak seçim sıralamasını pahalı yapar

[Ders sayfasındaki örnek 8](../onceki-ders.html#example-8) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

**Problem.** Her turda kalanların minimumunu seçip sıradaki çıktı konumuna koyuyoruz. Dört değer varken ilk minimum için üç karşılaştırma gerekir: bir geçici aday seçilir, diğer üç değer onunla karşılaştırılır.

```text
Kalan elemanlar:       4   3   2   1
Minimum karşılaştırma:3 + 2 + 1 + 0 = 6
```

**Genel hesap.** n elemanda `(n−1)+(n−2)+…+1 = n(n−1)/2` karşılaştırma. Bu Θ(n²)'dir. n yaklaşık iki katına çıktığında baskın karşılaştırma sayısı yaklaşık dört katına çıkar. Standart selection sort'ta girdi zaten sıralı olsa bile bu minimum taramaları yapılır; takas sayısı farklı olabilir.

**Heap ile ne değişiyor?** Yüksek seviyedeki “sıradaki minimumu seç” fikri aynı kalabilir. Fakat minimumu her defasında baştan aramak yerine heap kökte tutar. Çıkarma sonrasında yalnızca bir yol onarılır. Alttan kurulum O(n), tekrarlanan çıkarmalar toplam O(n log n) üst sınır verir.

**Sayacı doğru okuyun.** Altı sayısı takasları, döngü kontrollerini ve dizi erişimlerini içermez. “Heap dört elemanda kesin daha hızlıdır” sonucu da çıkmaz: küçük girdide ek yönetim maliyeti baskın olabilir. Büyüme sınıfı, belirli bir bilgisayarda ölçülmüş süre değildir.

**Kontrol ve cevap.** Beş eleman için 4+3+2+1 = 10 minimum seçme karşılaştırması. Dengeli ağaç kullanarak yapılan sıralama tree sort; heap kullanarak yapılanı heap tabanlı sıralamadır. Yapılar ve onarım kuralları aynı değildir.

## 9. Görseldeki işlemi Python ile çalıştırmak

[Ders sayfasındaki örnek 9](../onceki-ders.html#example-9) · [İlgili ders notu](../lecture-notes.html#topic-2-3)

**Problem.** Python'ın `heapq` modülü normal listeyi min-heap olarak kullanır. Dersteki kodun yaptığı işlemler şunlardır:

```python
import heapq
jobs = [5, 9, 7]
heapq.heapify(jobs)
heapq.heappush(jobs, 2)
print("Next:", jobs[0])
print("Removed:", heapq.heappop(jobs))
print("Remaining heap:", jobs)
```

**Satır satır:** `import` modülün fonksiyonlarını erişilebilir yapar. İkinci satır üç öncelikten oluşan listeyi oluşturur. `heapify(jobs)` aynı listeyi heap düzenine getirir; yeni liste döndürmez. Bu örneğin başlangıç listesi zaten geçerli heap'tir. `heappush` 2'yi sona ekler, yukarı taşıyarak listeyi `[2,5,7,9]` yapar. `jobs[0]` kökü okur. `heappop` kökü çıkarır ve kalan yapıyı onarır. Son satır listenin mevcut halini gösterir.

```text
Next: 2
Removed: 2
Remaining heap: [5, 9, 7]
```

**Önemli hata.** `jobs = heapq.heapify(jobs)` yazmayın: fonksiyon yerinde düzenler ve `None` döndürür. Bu atama liste değişkeninizi kaybettirir. Ayrıca `[5,9,7]` sıralı değildir ama geçerli heap'tir; çıktının artan olmaması hata değildir.

**Değiştirip deneyin.** 2 yerine 8 eklerseniz ilk çıkan 5 olur. Yeni gelen her iş otomatik olarak en acil değildir. Sayfadaki hücre her çalıştırmada başlangıç listesini yeniden oluşturur; önceki çalıştırmanın kalan listesinden devam etmez. İlk çalıştırmada tarayıcı Python ortamının yüklenme süresi algoritmanın hesaplama maliyetiyle karıştırılmamalıdır.

## 10. Heap'in iki kuralı vardır; tam sıralılık bunlardan biri değildir

[Ders sayfasındaki örnek 10](../onceki-ders.html#example-10) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

**Problem.** `[1,3,2,5,4]` geçerli min-heap mi? Diziyi seviyeler halinde okuyalım.

```text
       1
     /   \
    3     2
   / \
  5   4
```

**Şekil kuralı:** Kök ve ikinci seviye dolu. Son seviye soldan başlayarak doldurulmuş. Arada boş yer yok. **Değer kuralı:** 1 ≤ 3, 1 ≤ 2, 3 ≤ 5, 3 ≤ 4. Bütün ebeveyn–çocuk ilişkileri geçerli. Dolayısıyla cevap evet.

**Ek bir kural uydurmayın.** Kardeşler için “soldaki daha küçük olmalı” koşulu yoktur. 3'ün solda, 2'nin sağda olması sorun değildir. Sol alt ağacın bütün değerlerinin sağ alt ağaçtan küçük olması da gerekmez. Bu özellikler heap'i BST'den ayırır.

**Eşitlik serbesttir.** `[2,2,3]` geçerli min-heap'tir. Kural “ebeveyn kesin küçüktür” değil, “ebeveyn büyük değildir” şeklindedir. Tekrar eden öncelikler gerçek uygulamalarda yaygındır; eşit öncelikli kayıtların kimliğini veya geliş sırasını ayrıca tutabiliriz.

**Ne alınmalı?** Heap, minimumu köke taşımaya yetecek kadar düzen tutar. Her şeyi sıralamak daha güçlü bir gereksinimdir. Az ama işe yarayan bir düzeni güncellemek, bütün diziyi her seferinde sıralamaktan daha ucuz olabilir. Bu haftanın 22. örneğinde artan yerinde sıralama için max-heap'e açıkça geçeceğiz.

## 11. Kökün en küçük olması yeterli değildir

[Ders sayfasındaki örnek 11](../onceki-ders.html#example-11) · [İlgili ders notu](../lecture-notes.html#topic-3-2)

**Problem.** `[1,3,2,5,4]` ile `[1,5,2,3,4]` dizilerini karşılaştırın. İkisinin kökü de 1 ve ikisinde de 1 minimum. Fakat ikincisi geçerli heap değildir.

```text
Geçersiz yapının alt kısmı:
      5
     / \
    3   4
5 ≤ 3 yanlış; 5 ≤ 4 de yanlış.
```

**Mantıksal yön önemli.** “Bütün ebeveynler çocuklarından büyük değilse kök minimumdur” doğrudur. “Kök minimumsa bütün ebeveynler çocuklarından büyük değildir” bunun tersi olup doğru değildir. Bir sonucun sağlanması, o sonucu üreten bütün koşulların sağlandığını göstermez.

**Nasıl kontrol edilir?** Sıkı yerleşimli bir dizide her kök dışı i indeksi için `a[(i−1)//2] ≤ a[i]` koşuluna bakın. n−1 ilişki vardır. İlk ihlalde durabilirsiniz; geçerli olduğunu doğrulamak için bütün ilişkiler kontrol edilmelidir. Bu kontrol en kötü Θ(n) sürer; kökü okumakla aynı iş değildir.

**Kontrol ve cevap.** `[1,4,2,3]` geçersizdir: indeks 3'teki 3'ün ebeveyni indeks 1'deki 4'tür. `[1,3,2]` ise geçerlidir. Görseldeki denetleyici normal bir dizinin değer düzenini kontrol eder; dizi zaten boşluksuz şekli temsil eder. Arasında eksik düğümler olan rastgele bir ağaç çiziminde şekil koşulunu da ayrıca incelemek gerekir.

## 12. İndeks konumdur; değer değildir

[Ders sayfasındaki örnek 12](../onceki-ders.html#example-12) · [İlgili ders notu](../lecture-notes.html#topic-3-3)

**Problem.** `[1,3,2,5,4]` dizisinde indeks 1'de değer 3 bulunur. Çocukları hesaplarken 3'ü değil, konum numarası olan 1'i kullanırız.

| Kural | 0 tabanlı indeks i | 1 tabanlı konum p |
|---|---|---|
| Sol çocuk | 2i+1 | 2p |
| Sağ çocuk | 2i+2 | 2p+1 |
| Ebeveyn | (i−1)//2, i>0 | p//2, p>1 |

**Aynı düğümü iki türlü adlandırmak:** İndeks 1, bir tabanlı konum 2'dir. Sıfır tabanında çocukları 3 ve 4; bir tabanında 4 ve 5. Bunlar aynı iki dizi hücresidir. Korunmuş ders notundaki bir tabanlı kodla yeni görseldeki sıfır tabanlı izleri karşılaştırırken bu farkı hesaba katın.

**Tam bölme ne demek?** İndeks 4'ün ebeveyni `(4−1)//2 = 3//2 = 1`. Gerçek bölme 1,5 verir; pozitif sayılarda tam bölme kesir kısmını aşağı yuvarlar. İndeksler tam sayı olmalıdır. Kökün ebeveyni yoktur; kök için formülü çalıştırıp −1 üretmek, Python'da yanlışlıkla son elemana eriştirebilir.

**Sınır kontrolü:** Formül aday konumu verir; çocuk gerçekten var mı diye `çocuk_indeksi < n` kontrol edilir. On elemanda geçerli indeksler 0…9'dur. İndeks 4'ün sol çocuğu 9 vardır, sağ çocuğu 10 yoktur. Beş elemanda indeks 2'nin çocuk adayları 5 ve 6'dır; ikisi de olmadığı için düğüm yapraktır.

## 13. Heap yolu neden kısa kalır?

[Ders sayfasındaki örnek 13](../onceki-ders.html#example-13) · [İlgili ders notu](../lecture-notes.html#topic-3-4)

**Problem.** Yedi düğümlü tamamlanmış heap'te bir değer yapraktan köke en fazla kaç kenar geçer? Seviyeler 1, 2 ve 4 düğüm içerir; üç seviye ama iki kenarlık yükseklik vardır.

| n | Seviye sayısı | Yükseklik h |
|---:|---:|---:|
| 1 | 1 | 0 |
| 7 | 3 | 2 |
| 8 | 4 | 3 |
| 10 | 4 | 3 |
| 15 | 4 | 3 |

**Logaritmayı sözle okuyalım.** Boş olmayan tamamlanmış heap için `h = floor(log₂ n)`. floor, aşağı yuvarlama demektir: sayıyı aşmayan en büyük tam sayı. n = 10 için `2³ = 8 ≤ 10 < 16 = 2⁴`; dolayısıyla h = 3. Kesirli logaritmayı hesaplamak zorunda değilsiniz; 2'nin hangi iki kuvveti arasında olduğunu görmek yeterlidir.

**Neden büyüme yavaş?** Her yeni seviye kapasiteye iki katına yakın katkı yapar. Örneğin 7'den 15 düğüme çıkarken en uzun yola sadece bir kenar eklenir. Bağlı liste gibi her yeni elemanda yolu bir uzatmak zorunda kalmayız; şekil kuralı dallanmayı korur.

**Sınır ve maliyet.** Boş heap için `log₂ 0` kullanılmaz; ayrı kontrol gerekir. Onarımın O(log n) olması, seviye başına sabit miktarda iş ve tek yol izlenmesiyle ilgilidir. Her seviyede birden fazla karşılaştırma olabilir. Bu nedenle yükseklik 3 demek mutlaka üç karşılaştırma yapıldı demek değildir.

## 14. İlk mola — düzen kurallarını toparlayalım

[Ders sayfasındaki örnek 14](../onceki-ders.html#example-14) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart dersteki 78–88. dakikalar arasındaki moladır. Yeni algoritma yoktur. Aşağıdaki cevaplı sorular ilk bölümün temel ayrımlarını toplar.

**Kuyruk ve öncelik kuyruğu aynı mı?** Hayır. Kuyruk geliş sırasını, öncelik kuyruğu seçilen anahtarı kullanır. Sonradan gelen daha acil bir iş, öncelik kuyruğunda önce çıkabilir.

**Heap sıralı bir dizi midir?** Hayır. `[1,3,2]` geçerli min-heap ama artan dizi değil. Heap ebeveynlerle çocuklar arasında düzen ister; kardeşler arasında istemez.

**Kökün minimum olması doğrulama için yeterli mi?** Hayır. `[1,5,2,3]` örneğinde kök minimumdur, fakat 5 → 3 kenarı kuralı bozar. Alt seviyeler de kontrol edilir.

**İndeks 1'deki değer 7 ise çocuklar nerede?** Sıfır tabanında indeks 3 ve 4 adaydır; 15 ve 16 değil. Çocuk hesabında değer 7 kullanılmaz. Ayrıca bu konumların dizi sınırı içinde olması gerekir.

**Sekiz düğüm neden yediden bir seviye daha derindir?** İlk üç seviye en fazla 1+2+4 = 7 düğüm alır. Sekizinci düğüm yeni seviyenin ilk yerine eklenir.

**Tek minimum için sıralama gerekli mi?** Hayır. Bir tarama yeterlidir. Sıralama maliyetini ancak uygulamanın daha güçlü düzen ihtiyacı varsa üstlenmeliyiz.

## 15. Sona ekle, sonra yukarı taşı

[Ders sayfasındaki örnek 15](../onceki-ders.html#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

**Problem.** `[2,4,3]` min-heap'ine 1 ekliyoruz. Önce şekli, sonra değer düzenini koruyacağız.

```text
Başlangıç:          [2, 4, 3]
Sona ekle:          [2, 4, 3, 1]
1 ile 4'ü takas et: [2, 1, 3, 4]
1 ile 2'yi takas et:[1, 2, 3, 4]
```

**Neden sona?** İndeks 3 ağacın soldan sağa sıradaki boş konumudur. Ortaya yeni hücre açmak veya rastgele dal eklemek şekil kuralını bozabilir. Sona ekleme eski düğümlerin birbirleriyle ilişkisini değiştirmez; olası ihlal yeni değerin ebeveyn yolundadır.

**İndekslerle iz:** 1, indeks 3'e eklenir. Ebeveyn `(3−1)//2 = 1`, değeri 4. 1 < 4 olduğundan takas. Yeni indeks 1, ebeveyn 0, değeri 2. 1 < 2 olduğundan tekrar takas. Kökün ebeveyni olmadığından dururuz.

**Ne zaman erken durur?** Ebeveyn yeni değerden büyük değilse yukarı taşıma gerekmez. 8 eklense `[2,4,3,8]` kalır; 4 ≤ 8 olduğundan sıfır takas. Fakat ilişkinin kontrol edilmesi yine iştir.

**Maliyet.** Bubble-up / sift-up bir ata yolu izler; heap düzenini onarma en kötü O(log n). Dinamik dizinin kapasitesi doluysa ayrıca yeni alan ve kopyalama gerekebilir. Bu bellek maliyetini onarım sayısıyla karıştırmayın. Örnekte son dizinin sıralı çıkması tesadüftür; genel ekleme sonucundan sıralılık beklenmez.

## 16. Kökü çıkar, sonra aşağı taşı

[Ders sayfasındaki örnek 16](../onceki-ders.html#example-16) · [İlgili ders notu](../lecture-notes.html#topic-4-2)

**Problem.** `[1,3,2,7,4]` içinden minimumu çıkaracağız. 1 döndürülür. Kökün boşluğunu son değer 4 ile doldurur ve son hücreyi kaldırırız.

```text
Başlangıç:       [1, 3, 2, 7, 4]
Kökü doldur:     [4, 3, 2, 7]
Küçük çocuk 2:   [2, 3, 4, 7]
Dönen değer:     1
```

**Neden son değer?** Son hücreyi kaldırmak tamamlanmış şekli korur. İçeride bir boşluk bırakıp diğer düğümlere dokunmamak şekil kuralını bozar. Son değerin köke alınması ise değer kuralını bozabilir; bu yüzden aşağı onarım vardır.

**Neden küçük çocuk seçilir?** 4'ün çocukları 3 ve 2. 3'ü köke taşısaydık kök 3, çocuk 2 olurdu ve ihlal sürerdi. 2'yi taşıyınca 2 hem 3'ten hem 4'ten büyük değildir. Geriye olası sorun, aşağı inen 4'ün yeni konumunda kalır. Bu konum yaprak olduğu için işlem biter.

**Durma koşulları.** Çocuk yoksa dur. Tek çocuk varsa onu kullan. İki çocuk varsa küçüğünü seç; mevcut değer ondan büyük değilse dur. Eşit çocuklarda bu görseller sol çocuğu seçer; başka tutarlı seçimler de geçerli heap üretebilir.

**Sınır ve maliyet.** `[4]` içinden çıkarma 4 döndürür, `[]` bırakır; yerine koyacak değer yoktur. Boş heap'ten çıkarma tanımlı bir hata veya ayrı sonuç gerektirir. Bir aşağı yol izlendiğinden düzen onarımı en kötü O(log n)'dir; çocuk alt ağaçlarının önceden geçerli olduğu varsayılır.

## 17. Onarım maliyetini dizi büyümesinden ayırmak

[Ders sayfasındaki örnek 17](../onceki-ders.html#example-17) · [İlgili ders notu](../lecture-notes.html#topic-4-3)

**Problem.** Bir görselde iki takas gördük diye toplam işi iki kabul edemeyiz. Önce ne saydığımızı belirlemeliyiz.

**Yukarı onarım:** Yeni değer ebeveyniyle karşılaştırılır. Küçükse takas edilir; değilse işlem durur. **Aşağı onarım:** İki çocuk varsa önce çocuklar karşılaştırılıp küçük seçilir, ardından ebeveynle karşılaştırılır. Tek seviyede iki anahtar karşılaştırması yapılabilir. Bir seviye ilerlemek, bir karşılaştırma yapmakla aynı değildir.

| İş | Heap düzeni açısından maliyet |
|---|---|
| Kökü okumak | O(1) |
| Yeni değeri yukarı taşımak | En kötü O(log n) |
| Kök değişiminden sonra aşağı taşımak | En kötü O(log n) |
| Dinamik diziyi büyütürken eski kayıtları kopyalamak | Büyütme anında O(n) olabilir |

**Büyütme ayrı katmandır.** Yeterli kapasite önceden ayrıldıysa ekleme sırasında büyütme kopyası yapılmaz. Geometrik büyüyen dinamik dizide çok sayıda eklemeye dağıtılan ekleme sonu maliyeti amortize sabit olabilir; yine de tek bir ekleme pahalı kopyalama tetikleyebilir. Heap onarımının logaritmik üst sınırı bu kopyalamayı ortadan kaldırmaz.

**Kontrol ve cevap.** Ekleme sıfır takas yapabilir mi? Evet, yeni değer ebeveyninden küçük değilse. Ama bu “sıfır iş” değildir: yeni değer yazılmış ve ilişki kontrol edilmiştir. Zaman sınırı önemli bir sistemde yalnızca takas sayısı değil, bellek ve çalışma ortamı da değerlendirilmelidir.

## 18. Tek tek ekleyerek kurmak işi tekrarlayabilir

[Ders sayfasındaki örnek 18](../onceki-ders.html#example-18) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

**Problem.** Boş min-heap'e `7,6,5,4,3,2,1` ekliyoruz. Her gelen değer öncekilerin hepsinden küçüktür; yeni yapraktan köke kadar çıkar.

| Eklenen | Ekleme sonrası düğüm sayısı | Yukarı takas |
|---:|---:|---:|
| 7 | 1 | 0 |
| 6 | 2 | 1 |
| 5 | 3 | 1 |
| 4 | 4 | 2 |
| 3 | 5 | 2 |
| 2 | 6 | 2 |
| 1 | 7 | 2 |

Toplam `0+1+1+2+2+2+2 = 10` takas. Her eklemede köke kadar gidilmesi, bu girdiyi yukarı onarım için kötü durum yapar. Genel olarak bu takasların toplamı `Σ floor(log₂ j)`, j = 1…n; en kötü Θ(n log n) büyür.

**Neden yalnızca O değil Θ diyebiliyoruz?** Üst sınır n eklemenin her birine O(log n) vererek bulunur. Alt sınır için son yaklaşık n/2 eklemeye bakın: her biri log n mertebesinde derinlikten köke çıkar. Bu kadar çok uzun yol, toplamı n log n mertebesine zorlar.

**Aynı anahtarlar, başka sıra:** `1,2,3,4,5,6,7` eklense yeni değerler ebeveynlerinden küçük olmaz; sıfır takas yeterlidir. Yine de değerler yazılır ve ebeveynler kontrol edilir; toplam iş sıfır olmaz.

**Ne alınmalı?** Tek tek ekleme, değerler zamanla geliyorsa doğal çözümdür. Bütün değerler zaten elimizdeyse aynı yapıyı daha az toplam işle kurabiliriz; sonraki örnek bunu yapar.

## 19. En alttaki ebeveynlerden başlayarak kurmak

[Ders sayfasındaki örnek 19](../onceki-ders.html#example-19) · [İlgili ders notu](../lecture-notes.html#topic-5-2)

**Problem.** `[9,4,7,1,3,8,2]` dizisini min-heap'e çevireceğiz. Çocukları zaten heap olan bir ebeveyni aşağı onarmak güvenlidir. Bu koşulu sağlamak için aşağıdan yukarıya gideriz.

**Son ebeveyn:** Sıfır tabanında `n//2 − 1`. n = 7 için 2. İndeks 3, 4, 5, 6 yapraktır; tek düğümlü alt ağaçlar zaten heap'tir.

```text
Başlangıç:        [9, 4, 7, 1, 3, 8, 2]
İndeks 2: 7 ↔ 2  [9, 4, 2, 1, 3, 8, 7]
İndeks 1: 4 ↔ 1  [9, 1, 2, 4, 3, 8, 7]
İndeks 0: 9 ↔ 1  [1, 9, 2, 4, 3, 8, 7]
Devam:    9 ↔ 3  [1, 3, 2, 4, 9, 8, 7]
```

**Son iki adımı anlayalım.** Kök 9'un çocukları 1 ve 2; küçük olan 1 yukarı çıkar. Aşağı inen 9'un çocukları artık 4 ve 3; küçük olan 3 yukarı çıkar. 9 yaprağa ulaşınca onarım tamamlanır. Önceden düzeltilen yan dalları baştan taramayız.

**Neden kökten başlamıyoruz?** Rastgele bir dizide kökün çocuk alt ağaçları bozuk olabilir. Tek kök onarımı, başka dalda kalan hataları düzeltemez. Ters indeks sırası, her onarımın ön koşulunu hazırlar.

**Kontrol ve cevap.** Sıfır tabanlı 2,1,0 sırası, bir tabanlı 3,2,1 konumlarıdır. Son dizi sıralı değildir; örneğin 3, 2'den önce gelir. Ama her ebeveyn–çocuk ilişkisi doğrudur. Aynı değerlerle başka geçerli heap'ler de olabilir; belirtilen takas kuralını izleme sorusunda bu özel ara durumlar önemlidir.

## 20. Düğümlerin çoğunun aşağıda gidecek pek yeri yoktur

[Ders sayfasındaki örnek 20](../onceki-ders.html#example-20) · [İlgili ders notu](../lecture-notes.html#topic-5-3)

**Problem.** Her onarıma O(log n) deyip n ile çarpmak O(n log n) üst sınır verir. Ancak alttan kurulum için bu sınır gereğinden büyüktür. Çünkü bütün düğümler kökün yüksekliğinden aşağı inemez.

**15 düğümlü dolu ağaç:**

| Düğüm grubu | Adet | En fazla aşağı mesafe | Toplam |
|---|---:|---:|---:|
| Yapraklar | 8 | 0 | 0 |
| Yaprakların ebeveynleri | 4 | 1 | 4 |
| Bir üst seviye | 2 | 2 | 4 |
| Kök | 1 | 3 | 3 |

Toplam 11 olası aşağı adım kapasitesi. Bu, tam 11 takas yapılacağını söylemez; zaten heap olan bir dizide takas gerekmeyebilir. Ayrıca karşılaştırma sayısı da 11 olmak zorunda değildir.

**Genel doğrusal sınırı başka türlü sayalım.** En az bir seviye aşağı gidebilecek düğüm sayısı yaklaşık n/2, en az iki seviye gidebilen yaklaşık n/4, en az üç seviye gidebilen yaklaşık n/8'dir. Tamamlanmış ağaçta bu sayılar sırasıyla `floor(n/2), floor(n/4), floor(n/8), …` olur. Her aşağı hareket kapasitesini saydığımız toplam, `n/2+n/4+n/8+… < n` ile sınırlanır. Onarım çağrılarının sabit başlangıç işleri de O(n)'dir.

**Sonuç.** Bottom-up heapify Θ(n) zamanda heap kurar. Yapraklara uzun yol maliyeti yüklememek, doğru toplamı ortaya çıkarır. İşlem bir sıralama değildir; daha zayıf bir düzen kurduğu için karşılaştırmalı sıralamanın n log n alt sınırıyla çelişmez.

## 21. İkinci mola — onarma ile kurmayı ayıralım

[Ders sayfasındaki örnek 21](../onceki-ders.html#example-21) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart 124–134. dakikalar arasındaki moladır. Birkaç kısa gerekçe, formüllerden daha kalıcı olabilir.

**Eklemede neden yukarı gidiyoruz?** Eski yapı geçerlidir. Yeni yaprak yalnızca ebeveyninden küçük olabilir; hata ata yolu boyunca taşınır. Sona ekleme şekli korur.

**Çıkarmada neden küçük çocuk yükseliyor?** Min-heap'te yeni ebeveyn iki çocuğundan da büyük olmamalıdır. Büyük çocuğu seçmek, diğer küçük çocukla ihlal bırakabilir.

**Alttan kurulumun sırası neden ters?** Bir ebeveynin onarımı, çocuk alt ağaçlarının zaten heap olmasını varsayar. Yapraklardan yukarı ilerlemek bu varsayımı hazırlar; rastgele sırada onarım bunu garanti etmez.

**Her düğüme log n maliyet yazmak neden gevşek?** Yapraklar aşağı hiç ilerleyemez. Bir seviye yukarıdaki çok sayıda düğüm yalnızca bir adım ilerleyebilir. Uzun yol yapabilecek düğümler azdır. Eşit olmayan maliyetleri doğru toplamak doğrusal sonucu verir.

**Sıfır takas, sıfır iş midir?** Hayır. Karşılaştırmalar, dizi yazmaları ve döngü işleri olabilir. Sayaçların neyi ölçtüğünü söylemeliyiz.

**Heapify doğrusal ise heapsort da doğrusal mı?** Hayır. Kurulum yalnızca başlangıçtır. Sıralama için sonradan tekrar tekrar çıkarma veya kökü sona taşıma yapılır; bunların maliyeti ayrıca toplanır.

## 22. Artan yerinde heapsort neden max-heap kullanır?

[Ders sayfasındaki örnek 22](../onceki-ders.html#example-22) · [İlgili ders notu](../lecture-notes.html#topic-5-4)

**Problem.** `[4,1,3,2]` dizisini küçükten büyüğe, aynı dizi içinde sıralayacağız. Bu kez **max-heap** kullanıyoruz: en büyük kökte, son konuma konmaya hazırdır.

```text
Max-heap kur:          [4, 2, 3, 1]
Kökü sonla değiştir:   [1, 2, 3 | 4]
Aktif kısmı onar:      [3, 2, 1 | 4]
Kökü sonla değiştir:   [1, 2 | 3, 4]
Aktif kısmı onar:      [2, 1 | 3, 4]
Son değişim:           [1 | 2, 3, 4]
```

Dikey çizginin sağındaki bölüm sıralanmış son ektir; artık heap'in parçası değildir. 4 yerine konduktan sonra onarım onu geri hareket ettirmemelidir. Aktif boyut her turda bir azalır.

**Doğruluk.** Aktif max-heap'in kökü, henüz yerleşmemiş kayıtların maksimumudur. Bu yüzden aktif bölümün en sağı onun doğru son konumudur. Yerleşen maksimumlar sağ tarafta sıralı kalır. Kalan kısmı onardıktan sonra aynı gerekçe bir sonraki tur için geçerlidir.

**Min-heap niçin kullanılmadı?** Min-heap'ten çıkarılan minimumları ayrı bir çıktı listesine soldan sağa yazmak artan sıralama yapabilir. Ancak kökü aynı dizinin sağına yerleştiren bu yöntemde minimumu sağa koymak ters yönü üretir. “Heap ile artan sıralama” deyince hangi yerleştirme yöntemini kullandığımızı belirtmeliyiz.

**Maliyet.** Alttan kurulum O(n), tüm turlar en kötü Θ(n log n). Döngülü yerinde uygulama O(1) ek çalışma alanı kullanır ve genel olarak kararlı değildir. Görselin öğretim için sakladığı ara durumlar algoritmanın çalışma alanına dahil değildir.

## 23. İhtiyacın kadarını çıkar; sonra dur

[Ders sayfasındaki örnek 23](../onceki-ders.html#example-23) · [İlgili ders notu](../lecture-notes.html#topic-5-5)

**Problem.** `[9,4,7,1,3,8,2]` içindeki üçüncü küçük oluşumu bulacağız. Tam sıralama `[1,2,3,4,7,8,9]` verir; üçüncü değer 3. Ancak bütün diziyi sıralamak zorunda değiliz.

**Heap yöntemi:** Alttan min-heap kur. Birinci minimumu çıkar: 1. Onar. İkinci minimumu çıkar: 2. Onar. Üçüncü minimumu çıkar: 3. İstenen cevap elde edildiği için dur. Kalan dört değerin kendi aralarında tam sıralı olması gerekmiyor.

**Neden üçüncü çıkarılan üçüncü küçüktür?** Her çıkarma o anda kalanların minimumunu verir. Önceki çıkarmalar daha küçük veya eşit oluşumları kaldırmıştır. Böylece çıkarılma sırası azalmayan sıradır. Bu gerekçe yalnızca farklı değerlere bağlı değildir; tekrarlar da sırada ayrı yer tutar.

**Kontrol:** `[2,2,5,8]` için ikinci küçük 2'dir; ikinci *farklı* değer olan 5 değildir. `[1,1,4]` için de ikinci küçük oluşum 1 olur. Soru farklı değerleri istiyorsa algoritma ve sayma kuralı buna göre değiştirilmelidir.

**Maliyet ve koşullar.** Kurulum O(n), k çıkarma O(k log n); toplam O(n + k log n). `1 ≤ k ≤ n` olmalıdır. Heap değişir; giriş korunacaksa kopya gerekir ve O(n) ek alan kullanılır. Bu yöntem küçük k için tam sıralamadan daha az iş yapabilir; bütün seçim problemlerinde en iyi yöntem olduğu iddia edilmez. k = n olduğunda yine bütün elemanları çıkarmış oluruz.

## 24. Sonraki olay, sonraki saat darbesi değildir

[Ders sayfasındaki örnek 24](../onceki-ders.html#example-24) · [İlgili ders notu](../lecture-notes.html#topic-6)

**Problem.** A, B, C zamanlayıcıları ilk kez 5, 9, 7 ms'de çalışacak; periyotları da sırasıyla 5, 9, 7 ms. Min-öncelik kuyruğunda anahtar bir sonraki planlanmış zamandır.

| Olay zamanı | Çıkan | Yeniden eklenen zaman |
|---:|---|---:|
| 5 | A | 10 |
| 7 | C | 14 |
| 9 | B | 18 |
| 10 | A | 15 |
| 14 | C | 21 |
| 15 | A | 20 |

**İş döngüsü:** En erken kaydı çıkar, ilgili işi işle, sonraki zamanı hesapla ve yeni kaydı ekle. A'nın 10'a yeniden eklenmesi onu hemen sıradaki yapmaz; C'nin 7'si daha erkendir. Her seferinde bütün bekleyen kayıtlar arasındaki en erken zaman seçilir.

**Planlama kuralı önemlidir.** Bu demoda `yeni_zaman = önceki_planlanmış_zaman + periyot`. İş gecikmişse “şimdiki gerçek zaman + periyot” kullanmak farklı davranıştır ve faz kaymasına yol açabilir. Gerçek sistem, gecikmiş tekrarları çalıştırma, birleştirme veya atlama politikasını ayrıca belirlemelidir.

**Eşzamanlı işler:** Anahtar `(zaman, kuyruğa_eklenme_sırası)` olduğunda eşit zamanlarda davranış öngörülebilirdir. Görselde bir adım bir olayı işler; gerçek saat darbesinde birden fazla olayın zamanı gelmiş olabilir. Gerekirse `minimum_zaman ≤ şimdi` olduğu sürece olaylar işlenir.

**Maliyet ve sınır.** r olay için heap işi O(r log n), buna işlevlerin gerçek çalışma süresi eklenir. Heap kullanmak tek başına gerçek zaman garantisi değildir; kesmeler, bellek tahsisi ve işlerin süresi de son teslim zamanlarını etkiler.

## 25. Değişmez: işlem boyunca korunan bilgi

[Ders sayfasındaki örnek 25](../onceki-ders.html#example-25) · [İlgili ders notu](../lecture-notes.html#topic-0-3)

**Problem.** Birkaç örneği çalıştırmak bize güven verir ama bütün girdiler için doğruluk kanıtı değildir. Aşağı onarımı açıklamak için bir **değişmez (invariant)** kullanırız: hangi kısmın doğru kaldığını, hatanın nerede olabileceğini söyleriz.

**Başlangıç koşulu:** Mevcut düğümün çocuk alt ağaçları heap'tir; sadece mevcut değer çocuklarına göre büyük olabilir. Kök çıkarılıp son değer köke konduğunda bu koşul sağlanır. Alttan kurulum da her ebeveyni işlemeye başlamadan önce bu koşulu hazırlar.

**Bir adımın gerekçesi:** Çocukların küçüğünü seç. Mevcut değer ondan büyükse takas et. Yükselen çocuk, diğer çocuktan ve eski ebeveynden büyük değildir; yeni konumunda düzen doğrudur. Aşağı itilen değer kendi yeni çocuklarından büyük olabilir; olası hata bir seviye aşağı taşınmıştır. Değişen yol dışındaki ilişkiler korunur.

**Bitiş neden kesin?** Her takas aşağı yönde bir kenar ilerler. Sonlu bir ağaçta sonsuza kadar aşağı gidilemez. Yaprakta karşılaştırılacak çocuk yoktur. Daha önce durursak da mevcut değer küçük çocuktan büyük değildir; dolayısıyla iki çocuktan da büyük değildir. Olası yerel ihlal kalmaz.

**Kontrol ve cevap.** Rastgele diziyi yalnızca kökten bir kez onarmak yeterli mi? Hayır; başlangıçta çocuk alt ağaçları heap olmayabilir. Örneğin minimum kökte olduğu halde daha aşağıda ihlal varsa kök onarımı hemen durabilir. Kanıtın ön koşullarını atlamak, doğru bir işlemi yanlış yerde kullanmaktır.

## 26. Veri yapısını tekrarlanan soruya göre seçmek

[Ders sayfasındaki örnek 26](../onceki-ders.html#example-26) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** Bir sistem sürekli en erken işi istiyor; diğeri iki zaman arasındaki bütün kayıtları istiyor. Aynı kayıt türü farklı veri yapıları gerektirebilir.

**En erken kayıt:** Min-heap kökten O(1) okuma, ekleme ve çıkarma sonrasında O(log n) düzen onarımı sağlar. **Aralık veya ardıl:** Dengeli BST anahtar sırasını korur. Uygun bir aralık yürüyüşüyle O(log n + k) maliyet mümkündür; k döndürülen kayıt sayısıdır. Heap'te ayrı dallar birbirine göre sıralı olmadığından aynı yönlendirme yoktur.

**Güncellemenin gizli ilk adımı.** “B işinin önceliğini değiştir” diyorsak önce B'nin hangi heap indeksinde olduğunu bulmalıyız. İndeks biliniyorsa anahtarı değiştirdikten sonra uygun yönde onarım O(log n) olur. İndeks bilinmiyorsa arama en kötü O(n) sürebilir. Kimlikten indekse yardımcı bir harita kullanılabilir; her takasta bu haritanın da güncellenmesi gerekir.

**Küçük sistemde basit çözüm.** Üç sabit görev için doğrusal tarama anlaşılır ve yeterli olabilir. Çok sayıda değişken görevde heap daha anlamlı hale gelir. Büyük-O, ölçümün ve uygulama koşullarının yerine geçmez.

**Kontrol ve cevap.** Heap dizisinde doğrudan ikili arama çalışır mı? Hayır. `[1,3,2]` geçerli heap olmasına rağmen sıralı değildir. İkili aramanın bir yarıyı eleme gerekçesi yoktur. Bir veri yapısının hızlı bir işlemi olması, bütün arama türlerinde hızlı olduğu anlamına gelmez.

## 27. Küçük karşı örnekler büyük yanlış anlamaları gösterir

[Ders sayfasındaki örnek 27](../onceki-ders.html#example-27) · [İlgili ders notu](../lecture-notes.html#topic-3-2)

**İddia 1: “Her heap sıralıdır.”** `[1,3,2]` karşı örnektir. Kök 1 iki çocuğundan da büyük değildir; şekil geçerlidir. Fakat dizi artan değildir, çünkü 3 > 2. Geçerli bir heap bulduk ve iddianın sonucunun yanlış olduğunu gösterdik.

**İddia 2: “Kök en küçükse yapı heap'tir.”** `[1,5,2,3]` karşı örnektir. 1 minimumdur; fakat indeks 1'deki 5, indeks 3'teki çocuğu 3'ten büyüktür. Sonuçta alt ilişki bozulur.

**Neden tek örnek yeterli?** “Her” sözcüğü bütün geçerli durumları kapsar. Bir istisna bu evrensel iddiayı çürütür. Tersine, bir veya yüz başarılı deneme genel doğruluğu kanıtlamaz. Deneme hata bulmaya; değişmez ve mantıksal gerekçe neden her durumda çalıştığını göstermeye yarar.

**Düzenli deney:** Önce geçerli küçük bir dizi seçin. Bir değeri değiştirin. Onun ebeveyn ve çocuk ilişkilerinden hangilerinin etkilendiğini yazın. Sonra denetleyiciyi çalıştırıp tahmininizi karşılaştırın. Rastgele birçok değeri aynı anda değiştirmek hatanın nedenini takip etmeyi zorlaştırır.

**Kontrol ve cevap.** `[3,3,3,3]` geçerlidir; eşitlik serbesttir ve şekil boşluksuzdur. Fakat “geçerli bir heap yaz” ile “belirtilen ekleme sırasından oluşan heap'i yaz” farklı sorulardır. İkinci soru belirli ara takasları izlemeyi gerektirir; başka geçerli yerleşim tek başına yeterli cevap değildir.

## 28. Kur, onar ve gerekçesini açıkla

[Ders sayfasındaki örnek 28](../onceki-ders.html#example-28) · [İlgili ders notu](../lecture-notes.html#topic-7-1)

**İki ayrı görev var.** Her ikisi de aynı başlangıçtan, `[1,3,2,7,4]` dizisinden başlıyor. Çıkarma görevini ekleme sonucunun üzerinde yapmıyoruz.

**Görev A — 0 ekleme:**

```text
Başlangıç:    [1, 3, 2, 7, 4]
0'ı sona yaz: [1, 3, 2, 7, 4, 0]
İndeks 5↔2: [1, 3, 0, 7, 4, 2]
İndeks 2↔0: [0, 3, 1, 7, 4, 2]
```

İndeks 5'in ebeveyni 2, oradaki değer 2. 0 daha küçük olduğu için yukarı çıkar. Yeni ebeveyn kökteki 1'dir; bir takas daha gerekir. İki yukarı takas yapılır; şekil korunur.

**Görev B — taze başlangıçtan minimum çıkarma:**

```text
Başlangıç:       [1, 3, 2, 7, 4]
1'i döndür,
sonu köke taşı:  [4, 3, 2, 7]
Küçük çocukla:   [2, 3, 4, 7]
```

Küçük çocuk 2 seçilmelidir. 3 seçilse yeni kök 3'ün altında daha küçük 2 kalırdı. Bir aşağı takas yeterlidir; 4'ün yeni konumu yapraktır.

**Maliyetleri bağlayalım.** Peek bir konumu okur. Tek onarım bir logaritmik yol izler. Alttan kurulum, çoğu düğümün aşağı yolu kısa olduğu için doğrusal toplam iş yapar. Heapsort'ta bunun üzerine tekrar tekrar kökü çıkarma/sona yerleştirme maliyeti gelir; en kötü süre Θ(n log n)'dir.

**İyi teknik cevap:** Başlangıç dizisini, kullanılan min/max kuralını, indeks tabanını, her ara durumu ve durma gerekçesini yazın. Sonra ne saydığınızı belirtin: takas mı, anahtar karşılaştırması mı, toplam asimptotik maliyet mi? Bu ayrımlar, doğru sonuca tesadüfen ulaşmakla işlemi gerçekten açıklamak arasındaki farktır.

