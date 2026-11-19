# AA · 10. Hafta — 22 örneğin Türkçe teknik açıklaması

Bu notlar **minimum kapsayan ağaçlar, Prim, Kruskal ve union-find** dersindeki 22 kartı aynı sırayla açıklar. 9 ve 16 numaralı mola kartları cevaplı tekrar olarak yer alır. Her bölümden ilgili örneğe ve ayrıntılı ders notuna geçebilirsiniz. Açıklamalar, tablolar ve cevaplar doğrudan görünür.

## Başlamadan: en ucuz olan tam olarak ne?

Beş istasyon arasında kablo döşüyoruz. İstasyonlar birbirine başka istasyonlar üzerinden ulaşabilir. Amaç **kurulan kabloların toplam maliyetini** azaltmak. Her yolculuğu kısaltmak veya yedek bağlantı sağlamak başka amaçlardır.

- **Düğüm:** İstasyon veya cihaz. **Kenar:** Kurulmasına izin verilen bağlantı. Bu hafta kenarlar yönsüzdür; AB ile BA aynı kablodur.
- **Ağırlık:** Bir kenarın maliyeti. Örneğin metre veya para olabilir. Bir örnek boyunca aynı birim kullanılmalıdır.
- **Bağlı graf:** Her düğümden diğerlerine bir yol vardır. Her çift arasında doğrudan kenar bulunması gerekmez.
- **Ağaç:** Bağlı ve çevrimsiz yönsüz graf. n düğümlü ağaç n−1 kenar içerir; her iki düğüm arasında tam bir basit yol vardır.
- **Kapsayan ağaç:** Verilen grafın bütün düğümlerini içeren, kenarlarını o graftan seçen ağaç.
- **MST:** Minimum spanning tree, minimum kapsayan ağaç. Bütün kapsayan ağaçlar arasında kenar ağırlıkları toplamı en küçük olanı.
- **Orman:** Birbirinden ayrı ağaçlardan oluşabilir. Bağlantısız grafın tamamını kapsayan tek ağaç yoktur; her bağlı bileşen için bir MST seçilerek minimum kapsayan orman elde edilir.
- **Kesit:** Düğümlerin tamamını iki boş olmayan gruba ayırma. **Kesiti geçen kenar:** Uçları farklı gruplarda olan kenar.
- **Union-find:** Hangi elemanların aynı grupta olduğunu tutan yapı. `find` temsilciyi bulur; `union` farklı grupları birleştirir.

Bu haftanın ortak **W grafı** aşağıdadır. n=5, m=7. Sonraki örneklerde yalnızca açıkça belirtilen ağırlık veya kenar değişir.

| Kenar | AB | AC | BC | BD | CD | DE | CE |
|---|---:|---:|---:|---:|---:|---:|---:|
| Maliyet | 4 | 1 | 2 | 5 | 8 | 3 | 10 |

W'nin minimum ağacı AC, BC, BD, DE kenarlarını kullanır. Toplam 1+2+5+3=11. Bu sonucu ezberlemek yerine neden bu seçimlerin güvenli olduğunu inceleyeceğiz.

## 1. Her istasyonu bağlamak, her çifti doğrudan bağlamak değildir

[Ders sayfasındaki örnek 1](../onceki-ders.html#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** Fabrikadaki beş istasyonun haberleşmesi gerekiyor. Bir mesaj ara istasyonlardan aktarılabiliyorsa, A'dan E'ye doğrudan kablo çekmek zorunda değiliz. A—C—B—D—E gibi bir zincir de bütün istasyonları birbirine bağlar.

**İki tasarımın farkı.** Beş düğümlü tam basit yönsüz grafın 5×4/2=10 kenarı olur. Bölme ikiye yapılır çünkü A—B ile B—A aynı kenardır. Beş düğümlü ağaçta ise yalnızca 5−1=4 kenar vardır. Ancak W grafında yalnızca yedi güzergâha izin verilmiştir; listede olmayan kabloları kendiliğinden ekleyemeyiz.

**Neden dört kenar?** Başlangıçta beş ayrı parça vardır. Farklı iki parçayı bağlayan her yeni kenar parça sayısını bir azaltır. Beş parçadan bir parçaya inmek için dört birleşme gerekir. Aynı parçanın iki düğümünü bağlamak ise birleşme sağlamaz; bir çevrim oluşturur.

**BFS ve DFS neden yeterli değil?** Bu aramalar bağlantı ve erişim bulabilir. Standart sürümleri, ağırlıkları karşılaştırıp toplam kurulum maliyetini en aza indirme kuralı taşımaz. Bir kapsayan ağaç bulmak ile en ucuz kapsayan ağacı bulmak farklıdır.

**Model sınırı.** Fiziksel kablo maliyeti genellikle negatif değildir. Matematiksel MST problemi negatif ağırlıkları da kabul eder: çözüm yine ağaç olmak zorundadır. Negatif maliyetli bütün kenarları çevrim oluşturacak şekilde eklemek başka bir optimizasyon problemi olur.

**Kontrol ve cevap.** Her çift doğrudan bağlanmalı mı? Hayır; aktarma yapılabiliyorsa bağlılık yeterlidir. Aktarma yasaksa modeli değiştirmemiz gerekir.

## 2. Üç istasyonda bütün ağaçları karşılaştırmak

[Ders sayfasındaki örnek 2](../onceki-ders.html#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

**Veri.** AB=1, BC=2, AC=3. Üç düğümün kapsayan ağacında iki kenar bulunur. Üç kenardan ikisini seçmenin üç yolu vardır.

| Seçim | Bütün düğümler bağlı mı? | Toplam |
|---|---|---:|
| AB ve BC | Evet: A—B—C | 1+2=3 |
| AB ve AC | Evet: B—A—C | 1+3=4 |
| BC ve AC | Evet: B—C—A | 2+3=5 |

En küçük toplam 3'tür. Dolayısıyla AB ve BC, bu grafın tek MST'sidir. “Minimum” sözcüğü, geçerli kapsayan ağaçlar arasında karşılaştırma yapıldığını anlatır.

**Ucuz ama geçersiz seçim.** Sadece AB'yi almak 1 tutar ama C dışarıda kalır. Soruyu çözmez. Önce bütün istasyonları bağlama ve çevrim içermeme koşullarını sağlamalıyız; ancak sonra maliyetleri karşılaştırırız.

**Üçünü de alsak?** Toplam 6 olur ve A—B—C—A çevrimi oluşur. Bu bir bağlı ağdır fakat ağaç değildir. Ek bağlantı yedeklilik için faydalı olabilir; burada istenen MST çözümü değildir.

**Kendi denemeniz.** AC'nin maliyetini 0 yaparsanız AC+AB toplam 1 ile en iyi olur. İstasyon sayısı değişmediğinden kenar sayısı yine ikidir; değişen yalnızca hangi kenarların tercih edildiğidir.

**Kontrol ve cevap.** Neden yalnızca en ucuz tek kenar alınmaz? Çünkü çözümün bütün düğümleri kapsaması gerekir. Daha küçük sayı, eksik çözümü doğru yapmaz.

## 3. Bütün olasılıkları denemek neden büyür?

[Ders sayfasındaki örnek 3](../onceki-ders.html#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

**Problem.** W grafının beş düğümü için yedi olası kenardan dört tanesini seçiyoruz. Seçim sırası önemli değildir: AB,AC,BC,DE ile aynı dört kenarı başka sırada yazmak yeni aday oluşturmaz.

```text
Aday sayısı = C(7,4)
           = (7×6×5×4)/(4×3×2×1)
           = 35
```

Paydaki çarpım sıralı seçimleri sayar. Dört kenarın kendi aralarında 4!=24 farklı yazılışını aynı seçim saymak için paydadaki 24'e böleriz. Bu 35 adayın yalnızca **21'i geçerli kapsayan ağaçtır**. Geçerli ağaçlar arasında minimum toplam 11'dir.

**Dört kenar neden tek başına yetmez?** AB,AC,BC,DE seçilsin. İlk üçü A,B,C üzerinde üçgen yapar; DE ayrı bir parça kalır. Beş düğüm ve dört kenar vardır ama iki bileşen bulunur. Bu yüzden “n−1 kenar seçtim, ağaçtır” çıkarımı eksiktir.

Bir kontrol yöntemi, kenarları sırayla ekleyip her eklemenin iki ayrı grubu birleştirdiğini doğrulamaktır. Beş başlangıç grubunda dört başarılı birleşme kalanı tek gruba indirir ve çevrim oluşturmaz. Alternatif olarak n−1 kenarla birlikte bağlılığı doğrulayabilirsiniz.

**Neden daha iyi algoritma?** Genel aday sayısı C(m,n−1) olur. Küçük örnekte tüm adayları denemek doğrulama için kullanışlıdır; büyük ağda sayılar hızla artar. Prim ve Kruskal, bütün alt kümeleri üretmeden doğru kararlar verecek güvenli seçim kurallarını kullanır.

**Kontrol ve cevap.** Ucuz ama bağlantısız bir aday karşılaştırmaya alınır mı? Hayır; minimumu yalnızca geçerli ağaçlar arasında ararız.

## 4. Kesitin iki tarafını gerçekten ayırmak

[Ders sayfasındaki örnek 4](../onceki-ders.html#example-4) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

W'nin düğümlerini **{A,B,C}** ve **{D,E}** diye ayıralım. Bütün düğümler bir tarafta bulunur; hiçbir düğüm iki tarafta birden bulunmaz.

| Kesiti geçenler | Maliyet | İçeride kalanlar | Neden geçmiyor? |
|---|---:|---|---|
| BD | 5 | AB, AC, BC | İki uç da ilk tarafta |
| CD | 8 | DE | İki uç da ikinci tarafta |
| CE | 10 | — | — |

**Her ağaç neden geçmek zorunda?** İki taraf arasında hiç seçilmiş kenar olmasa ilk gruptan ikinci gruba gidilemez. Bu nedenle kapsayan ağaç en az bir kesit kenarı kullanmalıdır.

Bu kesitin en ucuz kenarı BD=5'tir. **Kesit özelliği**, en hafif kesit kenarının en az bir MST'de bulunabileceğini söyler. Burada minimum tektir; dolayısıyla BD her MST'de bulunur. Eşit minimumlar varsa belirli birinin her MST'de bulunacağını söyleyemeyiz.

**DE neden seçilemiyor?** DE=3 daha ucuzdur ama bu iki tarafı birleştirmez. Maliyet karşılaştırmasından önce hangi kenarların soruya uygun olduğunu belirlemeliyiz. “Grafın en ucuz kenarı” ile “bu kesitin en ucuz kenarı” aynı kavram değildir.

**Algoritmadaki güvenlik.** Daha önce seçilmiş kenarları koruyarak büyüyorsak, bu seçilmiş kenarların hiçbirinin kesiti geçmediği bir kesit kullanılır. Böylece eklenen en hafif kenar, mevcut seçimi bir MST'ye tamamlama olanağını korur. İlgisiz kesitlerden ayrı ayrı güvenli görünen kenarları gelişigüzel biriktirmek yeterli bir algoritma tanımı değildir.

**Kontrol ve cevap.** Bu kesitte dört değil üç aday vardır: BD, CD, CE. DE aynı tarafta kaldığından aday değildir.

## 5. Bir kenar ekleyip bir kenar çıkarmak

[Ders sayfasındaki örnek 5](../onceki-ders.html#example-5) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

**Başlangıç ağacı.** AB,BC,CD,DE; maliyeti 4+2+8+3=17. B ile D arasında mevcut yol B—C—D'dir.

| İşlem | Sonuç | Maliyet |
|---|---|---:|
| Başlangıç | Beş düğüm, dört kenar; ağaç | 17 |
| BD=5 ekle | B—C—D—B çevrimi oluşur | 22 |
| CD=8 çıkar | Çevrim kalkar, bağlılık korunur | 14 |

**Neden bağlılık kalır?** Çıkarılan CD'nin uçları artık C—B—D yolu üzerinden bağlıdır. Çevrim üzerindeki bir kenarı çıkarmak alternatif yolu korur. Çevrimin dışından rastgele bir kenarı çıkarmak aynı garantiyi vermez.

Ağaca bir kenar eklenince tam bir çevrim oluşur: yeni kenar ve uçları arasındaki önceden var olan tek yol. Bir ağacın uçlar arasında iki farklı basit yolu olsaydı zaten çevrim içerirdi.

**14 son cevap mı?** Hayır. AC=1 eklenirse A—B—C—A çevrimi oluşur. AB=4 çıkarılınca maliyet 14+1−4=11'e iner. Dolayısıyla hem 17 hem 14 maliyetli ağaçlar geçerlidir ama minimum değildir.

**İspat ile örneği ayırmak.** Kesit özelliğinin ispatında bir MST'den başlanır. En hafif kesit kenarı ağaçta yoksa eklenir; oluşan çevrimdeki başka bir kesit kenarı çıkarılır. Yeni kenar daha pahalı olmadığı için toplam artmaz. Başlangıç gerçekten minimumsa toplam kesin olarak azalmak zorunda değildir; azalması başlangıcın minimumluğuyla çelişirdi. Bu nedenle ispatta eşit maliyetli başka bir MST elde edilir.

**Kontrol ve cevap.** “Bir değişimle ucuzlattım” neden tek başına minimumluk kanıtı değil? Çünkü başka bir değişimle daha da ucuzlatılabilir; burada 14→11 bunu gösterir.

## 6. Prim bir bağlı parçayı büyütür

[Ders sayfasındaki örnek 6](../onceki-ders.html#example-6) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

**Başlangıç.** W üzerinde A içeride; B,C,D,E dışarıda. Henüz kablo seçilmedi. Prim her adımda içerideki bir düğümle dışarıdaki bir düğümü bağlayan en ucuz kenarı alır.

| İçeridekiler | Kesit adayları | Seçim | Biriken toplam |
|---|---|---|---:|
| A | AB=4, AC=1 | AC | 1 |
| A,C | AB=4, BC=2, CD=8, CE=10 | BC | 3 |
| A,B,C | BD=5, CD=8, CE=10 | BD | 8 |
| A,B,C,D | DE=3, CE=10 | DE | 11 |

Her kabul, mevcut ağaca tam bir yeni düğüm ekler. Böylece seçilen kenarlar hep bağlı ve çevrimsiz kalır. Kesit özelliği bu büyümenin bir MST'ye tamamlanabileceğini garanti eder.

**5 neden 3'ten önce geldi?** Üçüncü seçimde DE=3'ün iki ucu da dışarıdadır. Prim onu henüz kullanamaz. BD alınıp D içeri girdikten sonra DE sınırı geçmeye başlar. Seçilen ağırlıkların 1,2,5,3 olması hata değildir; Prim'in seçimleri küresel olarak artan ağırlık sırası olmak zorunda değildir.

**Başlangıç değişirse.** D'den başlamak önce DE=3'ü seçtirebilir. Sıra değişir ama en küçük toplam değişmez. W'nin ağırlıkları birbirinden farklı olduğu için MST'nin kenar kümesi de tektir; eşit ağırlıklı başka graflarda farklı minimum ağaçlar çıkabilir.

**Kontrol ve cevap.** Prim DE'yi neden daha önce almıyor? Çünkü o an büyüyen parçaya bağlanmıyor. Prim'in kuralı tüm grafın en ucuz kullanılmamış kenarı değildir.

## 7. Prim'in anahtarı yol uzunluğu değildir

[Ders sayfasındaki örnek 7](../onceki-ders.html#example-7) · [İlgili ders notu](../lecture-notes.html#topic-3-2)

Her dış düğüm için **key**, şu anki ağaca bağlayan en ucuz tek kenarın ağırlığını tutar. Henüz böyle bir kenar bilinmiyorsa anahtar sonsuz kabul edilir; görselde çizgiyle gösterilebilir.

| İçeri alınan son düğüm | B teklifi | D teklifi | E teklifi |
|---|---|---|---|
| A | AB=4 | Yok | Yok |
| C | BC=2 | CD=8 | CE=10 |
| B | B artık içeride | BD=5 | CE=10 |
| D | — | D artık içeride | DE=3 |

C eklenince B için 4 yerine 2 önerilir. B eklenince D için 8 yerine 5 önerilir. D eklenince E için 10 yerine 3 önerilir. Teklif yalnızca daha ucuz bir **bağlantı kenarı** bulunduğunda iyileşir.

**D'nin anahtarı neden 8 değil?** A—C—B—D rotasının toplamı 1+2+5=8'dir. Fakat D'yi mevcut ağaca bağlamak için yeni ödenecek kenar BD=5'tir. Prim bu tek kenarı karşılaştırır. A'dan D'ye en kısa yol hesabı farklı amaç taşır ve başka bir güncelleme kullanır.

**Bir düğüm eklenince ne değişir?** Yeni düğümün dışarıdaki komşularına sunduğu kenarlar değerlendirilir. İçerideki iki düğüm arasındaki kenar ağacı büyütmez. Bu nedenle önceden seçilmiş düğümlerin anahtarları yeni adaylar gibi kullanılmaz.

**Kontrol ve cevap.** E, D eklenmeden önce 10; D eklenince 3 teklifine sahiptir. Bu “E'ye yol 3” değil, “E'yi mevcut ağa bağlamak için 3 ödemek yeterli” demektir.

## 8. Çalışma maliyeti uygulamaya bağlıdır

[Ders sayfasındaki örnek 8](../onceki-ders.html#example-8) · [İlgili ders notu](../lecture-notes.html#topic-3-4)

Aynı algoritmik fikir farklı veri yapılarıyla uygulanabilir. Bu yüzden “Prim'in maliyeti nedir?” sorusunu, hangi uygulamadan söz ettiğimizi belirterek cevaplarız.

| Uygulama | Yaygın zaman sınırı | Ana iş |
|---|---|---|
| Dizi/matris ile Prim | O(n²) | Yaklaşık n kez n aday tarama |
| Komşuluk listesi ve ikili heap ile Prim | O((n+m) log n) | Kenar güncellemeleri ve öncelik kuyruğu |
| Kruskal, verimli union-find | O(n+m log m), m≥2 | Kenar sıralama ve grup sorguları |

**n² ne demek?** n=10 için 100, n=20 için 400 ölçeğindedir. Düğüm sayısını ikiye çıkarmak bu ana tarama ölçeğini yaklaşık dört kat yapar. Bunlar saniye veya her programda bire bir aynı işlem sayısı değildir.

**m log₂m ne demek?** m=8 için 8×3=24, m=16 için 16×4=64. log₂8=3 çünkü 8'i üç kez ikiye bölerek 1'e ineriz. Bu ifade sıralamanın büyüme ölçeğidir; her girişte tam 24 ya da 64 karşılaştırma yapılacağını söylemez.

**Görselin koduyla teoriyi karıştırmayın.** Basit öğretim yaklaşımı her seçimde bütün kenarları tararsa O(nm) iş yapabilir. Mevcut animasyon uygulaması ayrıca kareleri üretirken kenarları tekrar sıralar ve teklifleri hesaplar. Bu çizim/iz üretme kodunu, standart O(n²) Prim uygulaması veya zaman ölçümü olarak okumamalıyız. Tablodaki sınırlar belirtilen veri yapılarıyla çalışan temel algoritmalar içindir.

**Yalıtılmış düğümler.** Kruskal'da hiç kenar olmasa bile n başlangıç grubu oluşturulur; O(n) maliyet unutulmaz. m=0 veya 1 için log ifadesinin özel durumlarına takılmak yerine doğrudan başlangıç ve birkaç kenar işlemini sayabiliriz.

**Kontrol ve cevap.** Bütün Prim uygulamaları n² mi? Hayır. Amaç aynı kalabilir; uygulama ve temsil maliyeti değiştirir.

## 9. İlk mola: güvenli seçim ne demek?

[Ders sayfasındaki örnek 9](../onceki-ders.html#example-9) · [İlgili ders notu](../lecture-notes.html)

64–74. dakikalar arasındaki moladan sonra W grafında şu üç soruyu cevaplayın.

**1. Beş düğüm ve dört kenar ağaç olduğunu kanıtlar mı?** Tek başına hayır. AB,AC,BC,DE seçimi bir üçgen ve ayrı bir ikili oluşturur. Bağlılık veya çevrimsizlik de doğrulanmalıdır.

**2. Prim içeride A,B,C varken hangi kenarı seçer?** BD=5. Kesiti geçen diğer seçenekler CD=8 ve CE=10'dur. DE=3 dışarıda kaldığı için bu adımda aday değildir.

**3. “Güvenli” sözcüğü neyi korur?** Seçilmiş kenarları bir MST'ye tamamlama imkânını. Tek başına çevrim yapmamak her keyfî pahalı kenarı güvenli kılmaz. Örneğin üçgende en pahalı iki kenarı seçmek ağaç verir ama minimum vermez.

**Kısa uygulama.** Kâğıda {A,B,C} ve {D,E} için iki kutu çizin. Yalnızca kutular arası kenarları yazın. En ucuzunu seçmeden önce aday kümesini doğru kurmanız gerektiğini bu çizim gösterir.

**Hatırlatma cümlesi.** Prim, mevcut ağacın sınırını geçen en ucuz kenarı alır; kesit özelliği bunun doğruluğunu açıklar.

## 10. Kruskal aynı anda birkaç parça büyütebilir

[Ders sayfasındaki örnek 10](../onceki-ders.html#example-10) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

Kruskal, W'nin bütün kenarlarını küçükten büyüğe sıralar: AC=1, BC=2, DE=3, AB=4, BD=5, CD=8, CE=10. Başlangıçta her düğüm ayrı gruptur.

| Kenar | Karar | Gruplar | Toplam |
|---|---|---|---:|
| AC=1 | Kabul | AC / B / D / E | 1 |
| BC=2 | Kabul | ABC / D / E | 3 |
| DE=3 | Kabul | ABC / DE | 6 |
| AB=4 | Ret | ABC / DE | 6 |
| BD=5 | Kabul | ABCDE | 11 |

AB'nin uçları zaten A—C—B yoluyla bağlıdır. AB eklenirse çevrim kapanır. Daha pahalı BD ise iki ayrı parçayı bağlar; bu nedenle kabul edilir. Kenarın ucuzluğu inceleme sırasını, mevcut bağlantı durumu kabul kararını belirler.

**Prim'den farkı.** Prim A'dan büyürken DE'yi erken alamıyordu. Kruskal DE ile bağımsız ikinci bir parça kurabilir. Sonunda bu parçaları birleştirir. Ara durumun tek bağlı ağaç olması gerekmez; çevrimsiz orman olması yeterlidir.

**Neden minimum?** Kenarlar ağırlık sırasındayken iki ayrı bileşeni birleştiren sıradaki kenar, uygun bileşen kesitinin en hafif geçişlerinden biridir. Kesit özelliği seçimi güvenli yapar. Sadece çevrim kontrolü yapıp ağırlıkları rastgele sırayla işlemek aynı minimumluk garantisini vermez.

**Ne zaman durulur?** Beş düğümde dört kabul edilmiş kenara ulaşıldığında ağaç tamamdır. Ret edilen AB kabul sayısına katılmaz. CD ve CE artık gerekli değildir.

**Kontrol ve cevap.** AB=4 neden BD=5'ten önce gelip reddedilir? Çünkü AB yeni bir parçayı bağlamaz; BD bağlar.

## 11. Yedi düğümlü örnekte aynı kuralı sürdürmek

[Ders sayfasındaki örnek 11](../onceki-ders.html#example-11) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

**H grafı.** AD=5, CE=5, DF=6, AB=7, BE=7, BC=8, EF=8, BD=9, EG=9, FG=11, DE=15. Düğümler A–G. Eşit ağırlıklarda demo bu listedeki giriş sırasını korur.

| İncelenen kenar | Karar ve gerekçe | Kabul toplamı |
|---|---|---:|
| AD=5 | A ile D birleşir | 5 |
| CE=5 | C ile E birleşir | 10 |
| DF=6 | F, AD grubuna katılır | 16 |
| AB=7 | B, ADF grubuna katılır | 23 |
| BE=7 | ABDF ile CE birleşir | 30 |
| BC=8 | B ve C zaten aynı grupta; ret | 30 |
| EF=8 | E ve F zaten aynı grupta; ret | 30 |
| BD=9 | B ve D zaten aynı grupta; ret | 30 |
| EG=9 | Yalnız G ana gruba katılır | 39 |

Yedi düğüm için altı kabul edilmiş kenar gerekir. Seçilenlerin maliyeti 5+5+6+7+7+9=39'dur. Daha sonra FG ve DE'yi eklemek gerekmez.

**Eşit maliyet neden eşit karar değil?** BD ve EG'nin ikisi de 9'dur. BD mevcut grup içinde kalır, EG ise G'yi bağlar. Ağırlık tek başına kabul/ret koşulu değildir. Aynı şekilde daha ucuz BC=8, EG=9'dan önce reddedilebilir.

**İz kontrolü.** İlk beş kabulden sonra A,B,C,D,E,F tek parçadır; G ayrıdır. Bu noktada görselde seçilmiş kenarların oluşturduğu yolları takip ederek ret kararlarını doğrulayın. “Çizgiler kesişiyor” diye çevrim kararı verilmez; uçlar arasında seçilmiş bir yol bulunup bulunmadığına bakılır.

**Kontrol ve cevap.** Altı kabul yerine altı incelenmiş kenarda durabilir miyiz? Hayır. İncelenenlerden bazıları reddedilir; bağlantıyı artırmaz.

## 12. Union-find düğümleri değil, grupları karşılaştırır

[Ders sayfasındaki örnek 12](../onceki-ders.html#example-12) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

Başlangıçta 1,2,3,4,5,6 ayrı gruplardır. Her elemanın parent kaydı kendisini gösterir. Kök, grubun temsilcisidir; “grubun fiziksel merkezi” olmak zorunda değildir.

| İşlem | Sonuç grupları |
|---|---|
| union(1,2) | {1,2}, {3}, {4}, {5}, {6} |
| union(3,4) | {1,2}, {3,4}, {5}, {6} |
| union(2,4) | {1,2,3,4}, {5}, {6} |
| union(5,6) | {1,2,3,4}, {5,6} |
| union(1,3) | Değişmez |

**union(2,4) nasıl yapılır?** 2'nin kökü 1, 4'ün kökü 3'tür. Birleştirmede kökler bağlanır; yalnızca `parent[2]=4` gibi rastgele bir kayıt değiştirilmez. Demo boyutlar eşitse ilk kökü tutar: 3, 1'in altına bağlanır. O anda 4→3→1 yolu oluşabilir.

**Neden etiket karşılaştırması yetmez?** 1 ile 3 farklı sayılardır ama son adımda aynı gruptadırlar. `find(1)==find(3)` olduğu için birleşme yapılmaz. Kruskal'da bu, uçlar arasında zaten kabul edilmiş bir yol olduğu anlamına gelir; yeni kenar çevrim oluşturur.

**Kayıt ağacı ile kablo ağacı farklıdır.** Union-find parent bağlantıları grupları verimli temsil etmek içindir. Örneğin gerçek kabul edilmiş kablo 2—4 iken kayıt yapısı 3 kökünü 1'e bağlayabilir. Orijinal grafın kablo listesinde 1—3 bulunması gerekmez.

**Kontrol ve cevap.** Başarısız union hata mı? Hayır. Aynı gruptaki iki elemanı yeniden birleştirmeye gerek olmadığını bildirir; Kruskal'ın ret kararı için istenen bilgidir.

## 13. Küçük grubu büyüğün altına bağlamak

[Ders sayfasındaki örnek 13](../onceki-ders.html#example-13) · [İlgili ders notu](../lecture-notes.html#topic-5-3)

Parent bağlantıları gelişigüzel kurulursa sekiz eleman 8→7→6→5→4→3→2→1 zinciri oluşturabilir. 8'in kökünü bulmak yedi bağlantı izlemeyi gerektirir.

**Boyuta göre birleştirme.** İki farklı kök bulunduğunda küçük grubun kökü büyük grubun altına bağlanır. Eşitlerse herhangi birini seçebiliriz; demo belirli bir eşitlik kuralıyla tutarlı davranır.

| Bir elemanın derinliği artınca | İçinde bulunduğu grubun en az boyutu |
|---|---:|
| Başlangıç, derinlik 0 | 1 |
| İlk artış | 2 |
| İkinci artış | 4 |
| Üçüncü artış | 8 |
| Dördüncü artış | 16 |

**Neden ikiye katlanır?** Elemanın bulunduğu grup aşağıya taşındıysa diğer grup en az onun kadar büyüktür. s elemanlı grup, en az s elemanlı başka grupla birleşince yeni boyut en az 2s olur. Derinlik her artışta bu bedeli gerektirir.

Bu nedenle n=8 için bir eleman en fazla üç seviye derinleşebilir. Genel sınır en fazla ⌊log₂n⌋'dir. Örneğin n=10 için 1→2→4→8 mümkündür, 16 mümkün değildir; sınır yine 3. Aşağı yuvarlama işareti, aşılmayan tam sayı sayısını ifade eder.

**Önemli ayrım.** Sekiz elemanlı yedi bağlantılık zincir boyut kuralını uygulamadan oluşturulabilen kötü örnektir. Aynı zinciri boyuta göre birleşmenin ürettiğini söylemek ispatla çelişir.

**Kontrol ve cevap.** 1'den 16'ya kaç ikiye katlama var? Dört. Boyut kuralı tek başına kök arama derinliğini logaritmik sınırlar; yol sıkıştırma ayrıca iyileştirir.

## 14. Arama, sonrakiler için kısa yol bırakabilir

[Ders sayfasındaki örnek 14](../onceki-ders.html#example-14) · [İlgili ders notu](../lecture-notes.html#topic-5-4)

Örnek 12'de birleşmeden sonra 4→3→1 ve 1→1 olsun. `find(4)` kökü arar.

```text
Önce: 4 → 3 → 1
Sonra: 4 ───→ 1
       3 ───→ 1
```

**Tam yol sıkıştırma.** Önce köke ulaşılır. Sonra ziyaret edilmiş kök olmayan kayıtların parent değerleri doğrudan o köke yönlendirilir. 4 artık 3'ten geçmek zorunda değildir. 3 zaten köke bağlıysa değişmeden kalabilir.

**Ne değişmedi?** {1,2,3,4} grubunun elemanları ve temsilcisi 1 aynı kalır. Grup boyutu değişmez. Yeni kablo döşenmez ve gerçek grafın kenarları silinmez. Yalnızca yardımcı veri yapısının köke giden yolları kısalır.

**Boyut kayıtları.** Boyut, köklerde anlamlıdır. 3 artık kök değilse eski size[3] kaydını güncel bağımsız grup boyutu gibi kullanmayız. Birleşme kararları önce kök bulunarak yapılır; doğru boyut bu kökte okunur.

**İki uygulama.** Animasyon tam sıkıştırmayı gösterir. Python örneği yol yarılama kullanır: yürürken düğümü büyük ebeveynine bağlar. İkisi de yolları kısaltır, ancak uzun bir yolda tek çağrı sonunda değiştirdikleri bütün bağlantılar aynı olmak zorunda değildir.

**Kontrol ve cevap.** Sıkıştırma 4'ü yeni lider yapar mı? Hayır. Lider hâlâ 1'dir; 4'ün ona erişimi kısalır. Aynı kümede kalmayı korumayan bir parent güncellemesi yol sıkıştırma değildir.

## 15. Neredeyse sabit, her çağrıda tek işlem demek değildir

[Ders sayfasındaki örnek 15](../onceki-ders.html#example-15) · [İlgili ders notu](../lecture-notes.html#topic-5-4)

Sekiz elemanlı uzun zincirin en derin elemanında arka arkaya sekiz `find` yapalım. Arada yeni union yapılmadığını varsayıyoruz. Burada sayılan şey köke ulaşırken izlenen parent bağlantılarıdır.

| Yöntem | İlk arama | Sonraki yedi arama | Toplam |
|---|---:|---:|---:|
| Sıkıştırma yok | 7 | Her biri 7 | 7+7×7=56 |
| İlk aramada tam sıkıştırma | 7 | Her biri 1 | 7+7×1=14 |

İlk arama uzun yolu öğrenip kayıtları kısaltır. Sonraki aramalar bu değişiklikten yararlanır. Bu tablo parent yazmalarını, karşılaştırmaları ve sıkıştırma için ikinci geçişi toplam işlem sayısına dahil etmez. “14” programın bütün talimatlarının sayısı değildir.

**Amortize ne demek?** Bir işlemin tek başına en kötü maliyeti yerine, uzun bir işlem dizisinin toplamını sınırlarız. İlk aramanın pahalı olması, bütün dizinin ortalama işlem başı maliyetinin küçük olmasıyla çelişmez. Bu olasılıksal ortalama da değildir; rastgele girdi varsaymadan toplam için garanti verilebilir.

**Genel sınır.** Boyuta veya rütbeye göre birleştirme ile yol sıkıştırma birlikte kullanıldığında, n başlangıç elemanı ve sonrasındaki q işlem için standart sınır O(n+qα(n)) biçiminde ifade edilir. α ters Ackermann fonksiyonudur; son derece yavaş büyür. Öğrenilecek fikir “α tam olarak 1'dir” değil, çok sayıdaki işlem için büyümenin çok küçük olduğudur.

**Örneğin sınırı.** Uzun zincir sıkıştırmanın etkisini ayırmak için kullanılır; boyut kuralıyla üretilmiş bir zincir olarak sunulmaz. İki iyileştirmenin birlikte sağladığı genel teorem tek başına bu küçük tablodan ispatlanmış olmaz.

**Kontrol ve cevap.** İlk find yedi bağlantı izlerse amortize sınır yanlış mı? Hayır; sınır bütün işlem dizisiyle ilgilidir.

## 16. İkinci mola: üç ayrı ağacı karıştırmamak

[Ders sayfasındaki örnek 16](../onceki-ders.html#example-16) · [İlgili ders notu](../lecture-notes.html)

122–132. dakikalar arasındaki moladan sonra şu ayrımları tekrar edin.

**1. Grafın olası kabloları.** W'de yedi kenar var. Bunlar kurulabilecek bağlantıların tamamı; hepsini seçmek zorunda değiliz.

**2. Seçilmiş MST.** AC,BC,BD,DE olmak üzere dört kenar. Bunlar gerçekten kabul edilen kabloları ve 11 toplam maliyeti belirler.

**3. Union-find kayıt ağacı.** Elemanların hangi grupta olduğunu tutan parent bağlantıları. Kabloların listesi olmak zorunda değildir; sıkıştırma sırasında değişebilir.

**Soru.** Kruskal AC,BC,DE aldıktan sonra AB'yi neden reddeder? A ile B zaten A—C—B yoluyla bağlıdır. Find sonuçları aynı temsilciyi verir; AB çevrim oluşturur.

**Soru.** Path compression ağın toplam kablo maliyetini azaltır mı? Hayır. Yardımcı yapıda köke gitme işini azaltır. MST kenarlarını veya ağırlıklarını değiştirmez.

**Soru.** Bir birleşmede hangi kök alta bağlanır? Boyut kuralında küçük grubunki. Böylece bir elemanın derinliği ancak grup boyutu en az ikiye katlanırken artar.

**Hatırlatma.** Kruskal'ın doğruluğunu ağırlık sırası ve güvenli birleşmeler sağlar. Union-find bu birleşme sorgularını hızlı yapmanın aracıdır; tek başına en ucuz kenarı seçmez.

## 17. Kablo fiyatlarını değiştirip sonucu yeniden hesaplamak

[Ders sayfasındaki örnek 17](../onceki-ders.html#example-17) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

Editörde düğümler A,B,C,D,E olarak sabittir. Her satıra `A B 4` gibi iki uç ve maliyet girilir. Kenarlar yönsüzdür; AB ile BA ayrı kablolar değildir. Kendine kenar ve tekrarlanan uç çiftleri bu editörün basit graf modeline uymaz.

**Deney 1: W'de BD'yi pahalılaştırın.** BD=5 yerine BD=20 olsun. Artık AC=1,BC=2,DE=3 seçilir; AB=4 çevrim yaptığı için reddedilir. ABC ile DE'yi birleştiren en ucuz kenar CD=8 olur. Yeni toplam 1+2+3+8=14. CE=10 ve BD=20 daha pahalı alternatiflerdir.

**Deney 2: yalnızca iki kenar yazın.**

```text
A B 4
C D 2
```

Gruplar {A,B}, {C,D}, {E}; toplam 6. Üç bileşen kaldığından bütün beş düğümü kapsayan ağaç yoktur. Sonuç minimum kapsayan ormandır. E'nin hiç kenarı olmaması, onu düğüm kümesinden çıkarmaz.

**Deney 3: boş kenar listesi.** Beş yalıtılmış düğüm, sıfır seçilmiş kenar ve toplam 0 vardır. Bu ücretsiz bir bağlı çözüm değildir. Beş ayrı bileşen kalır.

**Negatif maliyet.** Matematiksel deneyde AB=−2 olabilir. Kruskal bu kenarı uygun sırada değerlendirir; negatif olması çevrim yasağını kaldırmaz. Fiziksel kablo örneğinde negatif metre yorumlanamayacağından bu sayıyı soyut maliyet olarak düşünün.

**Prim ile karşılaştırma.** Bağlı girişte doğru Prim ve Kruskal aynı minimum toplamı vermelidir; kenar kümeleri eşitliklerde farklı olabilir. Bağlantısız graf için tek başlangıçlı Prim yalnızca başlangıcının bileşenini kapsayabilir. Bütün ormanı elde etmek için kalan bileşenlerden de başlamak gerekir; Kruskal tüm kenarları işlerken bu ayrık parçaları birlikte ele alır.

## 18. Python'da Kruskal'ı satır satır izlemek

[Ders sayfasındaki örnek 18](../onceki-ders.html#example-18) · [İlgili ders notu](../lecture-notes.html#topic-4-7)

Ders sayfasındaki kod aşağıdadır. `input()` kullanılmaz; düğümler ve kenarlar kodun başında tanımlıdır. Ana örnekteki Run düğmesiyle çalıştırabilirsiniz.

```python
vertices = "ABCDE"
edges = [("A", "B", 4), ("A", "C", 1), ("B", "C", 2),
         ("B", "D", 5), ("C", "D", 8), ("D", "E", 3),
         ("C", "E", 10)]
parent = {v: v for v in vertices}
size = {v: 1 for v in vertices}

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

chosen = []
for u, v, weight in sorted(edges, key=lambda edge: edge[2]):
    a, b = find(u), find(v)
    if a == b:
        continue
    if size[a] < size[b]:
        a, b = b, a
    parent[b] = a
    size[a] += size[b]
    chosen.append((u, v, weight))
print("Edges:", chosen)
print("Total:", sum(weight for u, v, weight in chosen))
print("MST" if len(chosen) == len(vertices) - 1
      else "Disconnected: minimum spanning forest")
```

| Satır | Ne yapıyor ve neden? |
|---|---|
| 1 | Bütün düğümleri tanımlar. Kenarsız bir düğüm de burada bulunmalıdır. |
| 2–4 | Her kenarı (uç, uç, ağırlık) üçlüsü olarak kaydeder. W grafının yedi kenarıdır. |
| 5 | Başlangıçta her düğümü kendi kökü yapar. Henüz beş ayrı grup vardır. |
| 6 | Her grubun boyutunu 1 olarak başlatır. |
| 7 | Okunabilirlik için boş satırdır. |
| 8 | Bir elemanın grup kökünü bulacak fonksiyonu tanımlar. |
| 9 | Parent kendisi değilse köke henüz ulaşılmamıştır; döngü sürer. |
| 10 | x'i büyük ebeveynine bağlayarak yolu kısaltır. Bu yol yarılamadır. |
| 11 | Güncellenmiş parent'a ilerler; sonraki adım buradan devam eder. |
| 12 | Parent kendisini gösteren kökü döndürür. |
| 13 | Okunabilirlik için boş satırdır. |
| 14 | Kabul edilen gerçek graf kenarlarını boş listede toplamaya başlar. |
| 15 | Kenarları üçüncü bileşen olan ağırlığa göre sıralar ve tek tek inceler. |
| 16 | Uçların etiketlerini değil, grup temsilcilerini bulur. |
| 17 | Temsilciler eşitse uçlar zaten bağlıdır. |
| 18 | Çevrim oluşturacak kenarı atlayıp sonraki kenara geçer. |
| 19 | İlk grubun daha küçük olup olmadığını kontrol eder. |
| 20 | Gerekirse kök değişkenlerini yer değiştirir; a büyük grubun kökü olur. |
| 21 | Küçük grubun kökü b'yi büyük kök a'nın altına bağlar. |
| 22 | Yeni birleşik grubun boyutunu a kökünde günceller. |
| 23 | Birleşme başarılı olduğu için özgün (u,v,weight) kenarını kabul listesine ekler. |
| 24 | Kabul edilen kenarları yazdırır; parent bağlantılarını yazdırmaz. |
| 25 | Yalnızca kabul edilmiş kenarların ağırlıklarını toplar. |
| 26–27 | Seçim n−1 kenarsa MST, değilse bağlantısız minimum orman etiketi verir. |

**Beklenen çıktı.**

```text
Edges: [('A', 'C', 1), ('B', 'C', 2), ('D', 'E', 3), ('B', 'D', 5)]
Total: 11
MST
```

**Son kenar sayısı neden burada yeterli?** Kod zaten her kabulde ayrı grupları birleştirip çevrim oluşmasını engelledi. Bu değişmez koşul altında n−1 kabul, tek bağlı bileşen kaldığını gösterir. Rastgele bir kenar listesinin yalnızca sayısını kontrol etmek aynı garantiyi vermez.

**Küçük deney.** BD ağırlığını 20 yapın. Dördüncü kabul CD=8 olur; toplam 14 çıkar. Kod bütün kenarları tarar, animasyon ise ağaç tamamlandığında durabilir. Daha sonraki kenarlar aynı grupta kaldığı için kodda reddedilir; sonuç değişmez.

**Veri koşulları.** Her uç `vertices` içinde bulunmalıdır; aksi durumda `find` eksik anahtarla karşılaşır. Bu ders örneği beş farklı düğüm kullanır. Tekrarlanan düğüm adları veya boş düğüm kümesi için bu kısa çıktı denetimini genel doğrulayıcı gibi kullanmayın. Editör ile Python'un verisi ayrıdır; editörde maliyet değiştirmek kodu kendiliğinden güncellemez.

## 19. En ucuz ağ, her yolculuğu en kısa yapmaz

[Ders sayfasındaki örnek 19](../onceki-ders.html#example-19) · [İlgili ders notu](../lecture-notes.html#topic-6-2)

**Veri.** AB=2, BC=2, AC=3. Kapsayan ağaç seçenekleri AB+BC=4, AB+AC=5, BC+AC=5. Minimum ağ AB ve BC'dir.

| Soru | Cevap | Maliyet |
|---|---|---:|
| Bütün istasyonları en ucuza bağla | AB ve BC kur | 4 |
| Özgün grafta A'dan C'ye en kısa yol | AC kullan | 3 |
| Kurulmuş MST'de A'dan C'ye git | A—B—C kullan | 4 |

**Çelişki yok.** İlk soru, bütün kabloların kurulum bedelini toplar. İkinci soru, yalnızca belirli bir yolculuğun kullandığı kenarları toplar. İki toplam farklı nesnelere aittir; birini küçültmek diğerini otomatik olarak küçültmez.

AC'yi de kurarsak A–C yolculuğu 3'e düşer fakat toplam kurulum 2+2+3=7 olur; ağ çevrim içerir. Alternatif olarak AC ile AB kurulursa toplam 5 olur. Bu da bir ağaçtır ama minimum değildir. Daha kısa belirli rotalar için daha yüksek kurulum bütçesi kabul edilebilir; karar mühendislik hedeflerine bağlıdır.

**Algoritma seçimi.** Ağırlıklı en kısa yol için ağırlık koşullarına uygun en kısa yol algoritması gerekir. Prim'in key değeri bu yol maliyetini tutmaz. Önce “hangi toplamı en aza indiriyorum?” sorusunu yazmak yanlış algoritmayı önler.

**Kontrol ve cevap.** MST bütün en kısa yolları içerir mi? Hayır. Bu üçgen, A–C'nin en kısa doğrudan kenarının MST dışında kalabildiğini gösteren karşı örnektir.

## 20. Eşit maliyetler, çok sayıda cevap zorunluluğu değildir

[Ders sayfasındaki örnek 20](../onceki-ders.html#example-20) · [İlgili ders notu](../lecture-notes.html#topic-6-3)

İki üçgeni karşılaştıralım. Her üçgende üç farklı iki-kenarlı kapsayan ağaç vardır.

| Üçgen ağırlıkları | Üç ağacın toplamları | Minimum ağaç sayısı |
|---|---|---:|
| 1,1,1 | 2,2,2 | 3 |
| 1,1,2 | 2,3,3 | 1 |

İkinci üçgende iki tane 1 ağırlıklı kenar birlikte seçilir. Diğer her seçim 2 ağırlıklı kenarı içerir ve toplamı 3'e çıkarır. Dolayısıyla ağırlık tekrarı olmasına rağmen minimum ağaç tektir.

**Mantık ayrımı.** Bağlı grafın bütün kenar ağırlıkları farklıysa MST tektir. Bu yeterli koşuldur. Tersi, yani “MST tekse bütün ağırlıklar farklı olmalıdır” doğru değildir. 1,1,2 örneği ters iddiayı çürütür.

**Kesit özelliğiyle bağlantı.** Bir kesitte birden fazla eşit en ucuz kenar varsa her biri en az bir MST'de bulunabilir; belirli birinin bütün MST'lerde bulunması gerekmez. Örneğin 1,1,1 üçgeninde bir kenarı dışarıda bırakan minimum ağaç vardır.

**Pratik karşılaştırma.** Prim ile Kruskal eşitliklerde farklı kenar kümeleri seçerse önce bağlılık, çevrimsizlik, n−1 kenar ve toplam maliyet kontrol edilir. Kenar adlarının farklı olması tek başına hata değildir. Tüm ağırlıkları farklı olan W için ise tek minimum kenar kümesi beklenir.

**Kontrol ve cevap.** İki eşit maliyet gördük, iki MST var diyebilir miyiz? Hayır. Tam ve geçerli ağaçların toplamlarını karşılaştırmak gerekir.

## 21. Ağ geçidi ve üç sensör için gerçek tasarım sorusu

[Ders sayfasındaki örnek 21](../onceki-ders.html#example-21) · [İlgili ders notu](../lecture-notes.html#topic-7-1)

A ağ geçidi, B,C,D veri aktarabilen sensörler olsun. Güzergâh uzunlukları BC=2, AB=3, CD=4, AC=5, BD=7, AD=8 metredir. Bunlar izin verilen kablo güzergâhlarının uzunluklarıdır; çizimdeki düz çizginin ölçeği değildir.

**Doğrudan yıldız.** A'dan her sensöre kablo: AB+AC+AD=3+5+8=16 metre.

**MST seçimi.** Önce BC=2 ile iki sensör birleşir. AB=3 ağ geçidini bu gruba bağlar. CD=4 son sensörü ekler. Dört cihaz, üç kenar, toplam 9 metre. Tasarruf 16−9=7 metredir.

```text
A —3— B —2— C —4— D
D'nin A'ya rotası: D → C → B → A
Rota toplamı: 4+2+3 = 9 metre
```

**Bedeli ne?** D'nin doğrudan A bağlantısı 8 metre olabilirdi. Toplam kabloyu azaltan ağaçta D'nin A'ya rotası 9 metredir. Ayrıca sensörlerin ara düğüm olarak veri aktarabilmesi gerekir; yalnızca ölçüm yapıp aktaramıyorlarsa bu model uygun değildir.

**Arıza durumu.** Seçilmiş herhangi bir ağaç kenarı koparsa ağ iki parçaya ayrılır. Örneğin BC kopunca A,B ile C,D birbirinden ayrılır. MST yedek rota garantisi vermez. Yedeklilik isteniyorsa fazladan bağlantılar ve farklı bir maliyet/sağlamlık hedefi gerekir.

**Eksik ölçütler.** Kablo uzunluğu tek başına gecikme, kapasite, enerji tüketimi veya ortak güç kaynağı arızasını hesaplamaz. Bu örnek seçimin hangi amaca göre iyi olduğunu görünür kılar; gerçek sistemin bütün gereksinimlerini çözdüğünü iddia etmez.

**Kontrol ve cevap.** “7 metre tasarruf ettik, her bakımdan daha iyi” doğru mu? Hayır. Toplam kurulum açısından daha ucuz; bazı rotalar daha uzun ve yedek yol yok.

## 22. Ağacı başka amaçlarla kullanırken varsayımları korumak

[Ders sayfasındaki örnek 22](../onceki-ders.html#example-22) · [İlgili ders notu](../lecture-notes.html#topic-7-2)

**Kümeleme örneği.** A—B—C—D—E zincirinin ağırlıkları sırasıyla 1,1,8,1 olsun. Büyük 8 bağlantısı C—D arasındadır. Onu kaldırınca {A,B,C} ve {D,E} grupları oluşur.

| İstenen grup sayısı | Ağaçtan çıkarılacak kenar sayısı |
|---|---:|
| 1 | 0 |
| 2 | 1 |
| 3 | 2 |
| k | k−1 |

Ağacın her kenarı köprü olduğundan her silme bileşen sayısını bir artırır. k, 1 ile n arasında olmalıdır. En büyük k−1 MST kenarını kaldırmak tek bağlantılı hiyerarşik kümeleme fikriyle ilişkilidir. Eşit büyük ağırlıklarda farklı grup ayrımları mümkün olabilir.

**Gruplar neden her zaman sıkı kümeler değil?** Tek bağlantı yaklaşımı, bir yakınlık zinciri üzerinden uzak uçları aynı grupta birleştirebilir. A ile B yakın, B ile C yakın diye A ile C'nin de çok yakın olması gerekmez. Bu nedenle kümeleme sonucunu uygulamanın beklediği grup anlamıyla karşılaştırın.

**İsteğe bağlı tur fikri.** Bütün çiftler arasında kenar bulunan, simetrik ve negatif olmayan uzaklıkların üçgen eşitsizliğine uyduğu bir metrik graf düşünün. Üçgen eşitsizliği, doğrudan u→w mesafesinin u→v→w toplamından uzun olmamasıdır.

1. Bir MST bulun; toplamına M deyin.
2. Her ağaç kenarını gidiş-dönüş dolaşın. Kapalı yürüyüşün maliyeti 2M olur.
3. Önceden ziyaret edilmiş düğümleri doğrudan bağlantılarla atlayın. Üçgen eşitsizliği nedeniyle bu kısaltmalar maliyeti artırmaz.
4. Böylece her düğümü bir kez ziyaret edip başlangıca dönen bir tur elde edilir; maliyeti en fazla 2M'dir.

**Neden en iyi turun iki katını aşmaz?** En iyi turdan bir kenar çıkarınca kapsayan ağaç kalır. Negatif olmayan uzaklıklarda bu ağacın maliyeti tur maliyetinden büyük değildir. MST de herhangi bir kapsayan ağaçtan pahalı olamaz. Dolayısıyla M ≤ en iyi tur maliyeti; üretilen tur ≤ 2M ≤ 2×en iyi tur maliyeti.

Eksik doğrudan bağlantılar veya üçgen eşitsizliğini bozan maliyetlerde bu kısayol garantisi kullanılamaz. Bu, genel gezgin satıcı problemini tam çözdüğümüz anlamına gelmez; belirtilen koşullarda yaklaşık çözüm garantisidir.

**Son kontrol.** Üç grup için iki kenar çıkarılır. Prim tek bağlı parçayı büyütür, Kruskal ayrı parçaları birleştirir, union-find aynı grupta olmayı sınar. Her kullanımda önce amaç, sonra veri modeli, sonra algoritmanın garantisi yazılmalıdır.

