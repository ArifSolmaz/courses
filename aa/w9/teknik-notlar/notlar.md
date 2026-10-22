# AA · 9. Hafta — 22 örneğin Türkçe teknik açıklaması

Bu notlar **DFS, çevrimler ve bağımlılık sırası** dersindeki 22 kartı aynı sırayla açıklar. 9 ve 16 numaralı kartlar moladır; burada cevaplı tekrar içerir. Açıklamalar doğrudan görünür: açılır menü kullanmanız gerekmez. Her bölümdeki bağlantıyla aynı örneğin animasyonuna dönebilirsiniz.

## Başlamadan: bu hafta hangi soruyu soruyoruz?

Bir robotun odaları araştırması ile bir robotun montaj işlerini sıraya koymak farklı problemlerdir. İlkinde kenar bir geçiş, ikincisinde bir ön koşul anlamına gelir. Önce **okun anlamını**, sonra algoritmayı seçeriz.

- **Graf:** Düğümler ve kenarlardan oluşan model. n düğüm, m kenar sayısıdır.
- **DFS:** Derinlik öncelikli arama. Henüz görülmemiş bir komşuya girer, onun işini bitirir, sonra bekleyen düğüme döner.
- **BFS:** Genişlik öncelikli arama. Kuyrukla katman katman ilerler; ağırlıksız grafın en az kenarlı yolunu bulur.
- **Aktif:** DFS çağrısı başladı ama bitmedi. **Tamamlanmış:** Bütün çıkış kenarları incelendi ve çağrı döndü. İkisi de keşfedilmiştir.
- **Stack / yığın:** Son eklenen kayıt önce çıkar. Çağrı yığını, şu anda tamamlanmayı bekleyen çağrıları tutar.
- **Çevrim:** Okları izleyerek başlangıca geri dönen kapalı yol. Yönlü grafın çevriminde her okun yönüne uyulur.
- **DAG:** Yönlü ve çevrimsiz graf. Topolojik sıralama yalnızca böyle bir graf için mümkündür.
- **Topolojik sıra:** Her u → v kenarında u'nun v'den önce bulunduğu, bütün düğümleri birer kez içeren sıra.
- **Giriş derecesi:** Düğüme gelen kenar sayısı. Kahn algoritması sırasında kalan ön koşulları sayar.
- **Θ(n+m):** İş miktarı düğüm ve kenar sayılarının toplamı mertebesindedir. Tam işlem sayısı veya saniye değildir. Komşuluk listeleri hazır kabul edilir.

Aksi söylenmedikçe yönlü graflar kullanılır; komşular ve yeni DFS kökleri alfabetik sırada incelenir. Komşu sırası değişince keşif ve bitiş sıraları değişebilir. Bu, algoritmanın yanlış çalıştığı anlamına gelmez.

## 1. Kuyruk yayılır; DFS derine gider

[Ders sayfasındaki örnek 1](../onceki-ders.html#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** A'dan B ve C'ye, B'den D'ye gidilebilsin: AB, AC, BD. Robot bütün erişilebilir odaları araştıracak. Harfler oda kimliğidir; mesafe değildir.

| Adım | BFS keşif sırası | DFS keşif sırası |
|---|---|---|
| Başlangıç | A | A |
| İlk tercih | B ve C kuyruğa girer | B'ye girilir |
| Sonraki iş | B işlenir; D kuyruğun sonuna girer | B'den D'ye girilir |
| Sonuç | A, B, C, D | A, B, D, C |

BFS, önceden bekleyen C'yi yeni bulunan D'den önce işler. DFS ise B'nin araştırmasını bitirmeden A'nın diğer komşusu C'ye geçmez. İkisinin de düğümleri bulabilmesi, aynı bilgiyi ürettikleri anlamına gelmez.

**En kısa yol ayrımı.** AB, BC, CD ve AD oklarını düşünün. DFS B'yi önce seçerse D'yi A→B→C→D üzerinden keşfedebilir: üç kenar. Oysa A→D tek kenardır. DFS'nin ilk bulduğu yol geçerli ama en kısa olmak zorunda değildir. BFS bu ağırlıksız örnekte bir kenarlık mesafeyi bulur.

**Animasyonu okuma.** Keşif sırasını bir kâğıda, aktif çağrıları başka bir satıra yazın. Bitmiş düğümler keşif kaydında kalır ama aktif yığından çıkar. “Geri döndü” demek “o odayı unuttu” demek değildir.

**Kontrol ve cevap.** DFS en az kenarlı yolu garanti eder mi? Hayır; yukarıdaki üç kenarlı ve tek kenarlı iki yol bunun doğrudan karşı örneğidir.

## 2. Geri dönüş, yarım kalan işe dönmektir

[Ders sayfasındaki örnek 2](../onceki-ders.html#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

**Problem.** Basit A→B→D zincirini izliyoruz. Yığının soldaki ucu taban, sağdaki ucu tepedir.

| Olay | Aktif çağrılar | Ne bekliyor? |
|---|---|---|
| A'ya gir | A | A'nın komşuları |
| B'ye gir | A, B | A, B'nin dönmesini bekler |
| D'ye gir | A, B, D | B, D'nin dönmesini bekler |
| D biter | A, B | B kaldığı yerden sürer |
| B biter | A | A kaldığı yerden sürer |
| A biter | boş | Araştırma tamamlanır |

D'nin çıkış kenarı yoksa D hemen tamamlanır. B'ye dönüldüğünde B'yi yeniden keşfetmeyiz; yalnızca B'nin komşu listesindeki sıradaki işi yaparız. B'nin başka komşusu yoksa o da biter.

**Neden kayıt gerekli?** Bir fonksiyon başka bir fonksiyonu çağırdığında yalnızca hangi düğümde olduğunu değil, dönüşten sonra hangi işlemi yapacağını da hatırlamalıdır. Robot benzetmesindeki ip, bu geri dönüş bilgisini temsil eder. Bilgisayarın çağrı yığını fiziksel robotun hareket süresini hesaplamaz.

**Sık hata.** Geri dönerken “ziyaret edildi” kaydını silmek, grafın aynı bölgesine tekrar tekrar girmeye yol açabilir. Standart DFS'de keşfedilmiş olma bilgisi kalıcıdır; aktif olma bilgisi geçicidir.

**Kontrol ve cevap.** D bitince neden A'ya değil B'ye dönülür? D'yi çağıran B'dir. Son başlayan çağrı önce tamamlanır.

## 3. Görülmüş olmak ile aktif olmak aynı şey değildir

[Ders sayfasındaki örnek 3](../onceki-ders.html#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

**Problem.** Yönlü elmas graf: A→B, A→C, B→D, C→D. İki farklı yol D'de buluşur.

```text
A → B → D
└→ C ──↗
D'den geriye giden ok yok.
```

Önce A, B, D çağrıları açılır. D'nin çıkışı yoktur; tamamlanır. Ardından B tamamlanır. A şimdi C'yi çağırır. C→D incelendiğinde D daha önce görülmüştür, fakat **aktif değildir**.

| Durum | Anlam | Kenar incelenirken yapılacak iş |
|---|---|---|
| Görülmemiş | Çağrı hiç açılmadı | Yeni DFS çağrısı başlat |
| Aktif | Çağrı henüz dönmedi | Yönlü DFS'de geri kenar: çevrim kanıtı |
| Tamamlanmış | Çağrı döndü | Tek başına çevrim kanıtı değil |

**Neden çevrim yok?** C'den D'ye gidebilmek yetmez; D'den C'ye dönen bir yol da gerekir. Bu grafın D düğümünden hiç çıkışı yoktur. “D'yi ikinci kez gördüm, çevrim var” kuralı yanlış alarm üretir.

Üç durum bazen beyaz, gri ve siyah diye adlandırılır. Renkleri ezberlemek yerine “başlamadı, sürüyor, bitti” diye okuyun. Yönlü çevrim denetiminde genel bir visited kümesine ek olarak aktif çağrıları ayırt eden bilgi gerekir.

**Kontrol ve cevap.** C→D çevrim midir? Hayır. Aktif çağrılar A ve C iken D tamamlanmıştır; D'den geri dönüş bulunmaz.

## 4. Altı düğümlü örnekte çevrimi göstermek

[Ders sayfasındaki örnek 4](../onceki-ders.html#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

**Veri.** Oklar AB, AC, BD, CD, CF, DE, EB; düğümler A–F. Alfabetik incelemede ilk derin rota A→B→D→E olur.

```text
Aktif yığın: A, B, D, E
İncelenen ok: E → B
Kapanan çevrim: B → D → E → B
```

E'den B'ye bakıldığında B hâlâ aktiftir. B, D'nin; D de E'nin işini beklemektedir. DFS ağacında zaten B'den E'ye bir yol vardır. E→B oku bu yolun başlangıcına geri döndürür. Bu nedenle soyut bir “çevrim var” sonucunun yanında somut kanıtı da yazabiliriz: **BD, DE, EB**.

Animasyon çevrimi kaydettikten sonra araştırmayı sürdürür. E, D ve B tamamlanır. A'nın diğer komşusu C'ye geçilir. C→D oku bu kez bitmiş bir dala gider; C→F ise F'yi ilk kez keşfeder. Keşif sırası A,B,D,E,C,F; bitiş sırası E,D,B,F,C,A olur.

**Önemli ayrım.** A ve C çevrimin parçası değildir. Bir DFS ağacının bütün düğümlerini çevrime dahil etmek yanlıştır. Grafın bir bölümü çevrimli, başka bir bölümü çevrimsiz olabilir.

**Kontrol ve cevap.** Hangi ok çevrimi kapatır? Seçilen DFS sırasında E→B. Farklı başlangıç ve komşu sırası başka bir geri kenarı ilk kanıt olarak gösterebilir; çevrimin graf içinde var olması değişmez.

## 5. Giriş ve çıkış iki ayrı olaydır

[Ders sayfasındaki örnek 5](../onceki-ders.html#example-5) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

Örnek 4'teki grafı kullanıp her girişte ve her bitişte sayacı bir artırıyoruz. Kenar incelerken bu saat artmıyor.

| Düğüm | Giriş | Çıkış |
|---|---:|---:|
| A | 1 | 12 |
| B | 2 | 7 |
| D | 3 | 6 |
| E | 4 | 5 |
| C | 8 | 11 |
| F | 9 | 10 |

**Nasıl okunur?** B'nin [2,7] aralığı, D'nin [3,6] aralığını içerir. Çünkü B açıldı, D çağrıldı, D tamamlandı ve ancak sonra B tamamlandı. E'nin [4,5] aralığı da D'nin içinde kalır. Buna karşılık B'nin [2,7] ve C'nin [8,11] aralıkları ayrıdır: B bittiğinde C henüz başlamamıştır.

**Ne sayıyoruz?** Altı düğümün her birinde iki olay vardır: toplam 12. Bu, programın yalnızca 12 işlem yaptığı anlamına gelmez. Yedi kenarın denetlenmesi, durumların okunması ve diğer işlemler bu saatin dışında kalır. Sayaç olay sırasını anlatır; fiziksel zamanı ölçmez.

Bir düğümün DFS ağacındaki torunları, giriş-çıkış aralığının içinde yer alır. Ayrı dalların aralıkları birbirinin içine girmez. Buradaki “torun” graf üzerindeki herhangi bir erişilebilir düğüm değil, seçilmiş DFS ağacındaki torundur.

**Kontrol ve cevap.** Çocuk aktifken ebeveyn bitebilir mi? Bu standart özyinelemeli DFS'de hayır. Ebeveyn önce çocuğun çağrısından dönmek zorundadır.

## 6. Açık yığınla çağrıları taklit etmek

[Ders sayfasındaki örnek 6](../onceki-ders.html#example-6) · [İlgili ders notu](../lecture-notes.html#topic-1-5)

Python iç içe çağrıları kendi çağrı yığınında saklayabilir. Çok uzun bir zincir, çok sayıda eşzamanlı çağrı gerektirir. Yinelemeli DFS'de bu kayıtları kendimiz tutabiliriz.

Bir kayıt **(düğüm, sıradaki komşu indeksi)** biçiminde olsun. A'nın listesi [B,C], B'nin listesi [D], D'nin listesi boş olsun.

| Olay | Yığının içeriği |
|---|---|
| A açılır | (A,0) |
| A'nın B kenarı seçilir | (A,1), (B,0) |
| B'nin D kenarı seçilir | (A,1), (B,1), (D,0) |
| D biter | (A,1), (B,1) |
| B biter | (A,1) |
| A, C ile devam eder | (A,2), (C,0) |

İndeks sıfırdan başlar. A için 1, B'nin incelendiğini ve sırada C'nin olduğunu söyler. Yeni komşuya girmeden önce ebeveynin indeksi ilerletilir; yoksa dönüşte aynı kenarı yeniden seçebiliriz.

**Neden yalnızca harfler yetmeyebilir?** Harf yığını kullanan bazı DFS uygulamaları erişilebilirliği doğru bulur. Fakat bütün komşuları bir anda yığına itmek, aynı keşif ve bitiş olaylarını otomatik olarak üretmez. Bu haftaki zaman damgalarını ve aktif ata ilişkilerini bire bir taklit etmek için yarım kalan komşu taramasını da saklamak gerekir.

**Maliyet.** n düğümlü zincirde en fazla n aktif kayıt olabilir: ek yığın alanı O(n). Açık yığın Python'un derin özyineleme sınırına bağlı kalmayı önler; bellek kullanımını sıfırlamaz.

**Kontrol ve cevap.** D bitince A'nın komşu listesine baştan mı dönülür? Hayır. B tamamlandıktan sonra A'nın saklanan indeksi C'yi gösterir.

## 7. Düğümleri ve kenarları ayrı saymak

[Ders sayfasındaki örnek 7](../onceki-ders.html#example-7) · [İlgili ders notu](../lecture-notes.html#topic-1-6)

**Problem.** Altı düğümlü iki farklı yönlü grafı karşılaştıralım. Birincisi A→B→C→D→E→F zinciri: n=6,m=5. İkincisinde aynı altı düğüm arasında 12 farklı ok olsun: n=6,m=12.

Her iki grafın tam DFS taramasında altı giriş ve altı çıkış vardır. Buna rağmen ikinci grafın komşu listelerinde daha fazla kayıt incelenir. Yalnızca düğüm sayısına bakmak bu farkı kaçırır.

| Temsil | Tam DFS'de incelenen bağlantı kayıtları |
|---|---|
| Yönlü komşuluk listesi | m |
| Yönsüz komşuluk listesi | 2m; kenar iki uçta saklanır |
| n×n komşuluk matrisi | n² hücre |

**Θ(n+m) neden?** Düğüm başına sınırlı bir iş ve liste kaydı başına sınırlı bir iş vardır. İkisini toplarız. Θ sembolü, bu temsil ve tam tarama için büyümenin hem alttan hem üstten aynı mertebede olduğunu söyler. İki yönlü kayıt gibi sabit çarpanlar mertebeyi değiştirmez.

**Yalıtılmış düğümler.** m=0 olsa bile n düğümlü tam tarama n ayrı kök açıp kapatır; Θ(n) iş vardır. Bir kaynaktan başlatıp erişilemeyenleri hiç dolaşmayan sürüm ise yalnızca o kaynağın erişilebilir bölgesini araştırır. “Tam DFS” ile “tek kaynak araması”nı karıştırmayın.

**Varsayım.** Komşu listeleri hazır ve sıralıdır. Komşuları alfabetik sıralamak ayrıca yapılırsa bunun maliyeti de eklenir. Girdi okuma, çizim üretme ve animasyon karelerini saklama, temel DFS maliyetiyle aynı hesap değildir.

**Kontrol ve cevap.** n sabitken m artarsa ne olur? Daha fazla bağlantı denetlenir. Θ(n+m) ifadesindeki m bunu açıkça gösterir.

## 8. Dört kenar sınıfını iz üzerinden ayırmak

[Ders sayfasındaki örnek 8](../onceki-ders.html#example-8) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

**Veri.** AB, AC, AD, BD, CD oklarını alfabetik sırada izleyelim. B→D, D'yi ilk kez keşfeder. D ve B bittikten sonra C açılır.

| Kenar | Hedefin o andaki durumu | Sınıf | Gerekçe |
|---|---|---|---|
| A→B | Görülmemiş | Ağaç | B'yi ilk kez bulur |
| B→D | Görülmemiş | Ağaç | D'yi ilk kez bulur |
| A→C | Görülmemiş | Ağaç | C'yi ilk kez bulur |
| C→D | Tamamlanmış | Çapraz | D, C'nin torunu değildir |
| A→D | Tamamlanmış | İleri | D, A'nın torunudur; bu ok onu keşfetmedi |

Bu graf çevrimsizdir; **geri kenar içermez**. D→A eklenirse D aktifken A da aktif olduğundan D→A geri kenar olur ve A→B→D→A çevrimini gösterir. Dört sınıfın hepsinin her graf içinde bulunması gerekmez.

**Temel ayrım.** Ağaç kenarı yeni bir çağrı açar. İleri kenar zaten keşfedilmiş bir toruna gider. İkisinin de çizimde aşağı doğru görünmesi onları aynı yapmaz. Çapraz kenar ise daha önce bitmiş başka bir dala gider; çizginin geometrik olarak kesişmesiyle tanımlanmaz.

**Zaman damgasıyla kontrol.** Bir torunun giriş ve çıkışı atasının aralığının içindedir. Bu bilgi, bitmiş hedefin torun mu başka dal mı olduğunu ayırt etmeye yarar. Kenar sınıfları grafın çizimindeki konuma değil, seçilmiş DFS ağacına bağlıdır.

**Kontrol ve cevap.** Bitmiş düğüme giden her ok ileri kenar mıdır? Hayır: tabloda C→D çapraz, A→D ileridir. Bu dört sınıf yönlü DFS içindir; yönsüz kenarlar sonraki örnekte ayrı ele alınır.

## 9. İlk mola: üç ayrımı tekrar etmek

[Ders sayfasındaki örnek 9](../onceki-ders.html#example-9) · [İlgili ders notu](../lecture-notes.html)

64–74. dakikalar arasındaki mola, üç saatlik planın içindedir. Dönünce aşağıdaki soruları önce kendiniz cevaplayıp açıklamalarla karşılaştırın.

**1. Keşfedilmiş düğüm mutlaka aktif midir?** Hayır. D çağrısı tamamlandıktan sonra keşfedilmiş kalır ama aktif yığından çıkar. Bu ayrım, C→D gibi paylaşılan hedeflerin yanlışlıkla çevrim sayılmasını önler.

**2. Altı düğüm neden 12 saat olayı üretir?** Her düğüme bir kez girilir ve bir kez çıkılır. Saat bu iki olayı sayar. Kenar denetimlerini de sayan toplam çalışma maliyeti değildir.

**3. DFS neden yarım kalan işi hatırlar?** Bir çocuk çağrısı bittikten sonra ebeveynin sıradaki komşusundan devam etmek gerekir. Yığın yalnızca rota geçmişi değil, bekleyen iş kayıtlarıdır.

**Küçük çalışma.** A→B→D için “gir A, gir B, gir D, bitir D, bitir B, bitir A” olaylarını yazın. Her “bitir”de yalnızca en sağdaki aktif çağrıyı silin; keşfedilenler listesini silmeyin. Bu iki listenin farklı görevlerini gözle görünür hâle getirir.

## 10. Tek koridoru iki ayrı kenar sanmamak

[Ders sayfasındaki örnek 10](../onceki-ders.html#example-10) · [İlgili ders notu](../lecture-notes.html#topic-1-4)

**Problem.** Yönsüz A—B kenarı komşuluk listesinde hem A:[B] hem B:[A] olarak saklanır. Bunlar aynı fiziksel bağlantının iki kaydıdır.

A'dan B'ye girince B'nin listesinde A görülür. A aktiftir; ancak bu, yönlü graf için kullandığımız kuralı aynen uygulayıp çevrim ilan etmemizi gerektirmez. B'yi keşfeden aynı yönsüz kenarın ters kaydını görüyoruz. Basit yönsüz graf için ebeveyn kenarı atlanır.

```text
Tek kenar: A—B        çevrim yok
Üçgen:    A—B—C—A    üç farklı kenarla çevrim var
```

Üçgende A'dan B'ye, B'den C'ye gidilir. C'nin B kaydı ebeveyn kenarıdır; atlanır. C'nin A kaydı farklı bir kenardır. A aktif ata olduğundan A—B—C—A çevrimini kapatır.

**Varsayım neden önemli?** Basit graf, aynı iki düğüm arasında paralel kenar barındırmaz. Paralel kenarlar varsa yalnızca “hedef ebeveyn mi?” diye bütün kayıtları atlamak yeterli değildir; hangi kenardan geldiğimizi kenar kimliğiyle ayırmak gerekir. Buradaki örnek bu ayrıntıyı gerektirmeyen basit graftır.

**Kontrol ve cevap.** Tek AB koridorundan gidip geri gelmek çevrim midir? Basit grafın çevrim tanımında aynı kenarı tekrar kullanarak yapılan bu yürüyüş çevrim sayılmaz. AC ve BC eklenirse üç farklı kenarlı çevrim oluşur.

## 11. Bir okun yönü sonucu değiştirir

[Ders sayfasındaki örnek 11](../onceki-ders.html#example-11) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

Başlangıç A→B→C olsun. C'den çıkış olmadığı için geri dönüş yoktur. Şimdi iki farklı değişikliği karşılaştırın.

| Eklenen ok | Oluşan durum | Sonuç |
|---|---|---|
| C→A | A→B→C→A | Yönlü çevrim |
| A→C | A'dan C'ye kısa alternatif | Çevrim yok |

İlk durumda C işlenirken A hâlâ aktiftir. A'dan C'ye DFS ağacı yolu ve C→A kenarı birleşerek kapalı yol oluşturur. İkinci durumda bütün oklar aynı yönde ilerler; C'den A'ya dönmek mümkün değildir.

**Mühendislik yorumu.** Bir geri besleme sisteminde ölçümün denetleyiciyi, denetleyicinin motoru, motorun yeniden ölçümü etkilemesi amaçlanan bir çevrim olabilir. “Çevrim var” tek başına “sistem hatalı” demek değildir. Aynı oklar “önce bitmeli” anlamına gelirse A'nın B'yi, B'nin C'yi, C'nin A'yı beklemesi yürütülebilir bir ön koşul sırasını engeller.

Graf modeli fiziksel sistemin kararlılığını tek başına kanıtlamaz. DFS çevrim bulur; kontrol kuramındaki kararlılık için zaman, kazanç ve dinamikler gibi başka bilgiler gerekir.

**Kontrol ve cevap.** A→C eklemek neden çevrim oluşturmaz? Yeni bir ileri rota ekler ama başlangıca döndüren hiçbir yol eklemez. Kanıt için yalnızca “ok sayısı arttı” demek yeterli değildir.

## 12. Ön koşullar iş sırasını belirler

[Ders sayfasındaki örnek 12](../onceki-ders.html#example-12) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

**İşler.** A: tabanı monte et, B: sensörü tak, C: kalibrasyon yap, D: test et. Modelin okları A→C, B→C, C→D. Model yalnızca yazılan ön koşulları kabul eder.

A ve B'nin giriş derecesi sıfırdır; ikisinden biri önce yapılabilir. C'nin iki ön koşulu vardır. A'nın bitmesi tek başına C'yi hazır yapmaz; B de tamamlanmalıdır. D ise C'yi bekler.

```text
Geçerli: A, B, C, D
Geçerli: B, A, C, D
Geçersiz: A, C, B, D  (B→C ihlal edilir)
```

**Gerçek hayat ile model.** Sensörün fiziksel olarak taban takıldıktan sonra takılması gerekiyorsa A→B oku da eklenmelidir. Mevcut örnekte bu ok yoktur; gerçek süreçte bulunabilecek bir kuralı varsayarak sıralamayı değerlendirmiyoruz. Graf eksik modellenirse algoritma modele göre doğru, gerçek iş için uygunsuz bir sıra verebilir.

**Sıra ile takvim ayrımı.** Topolojik sıra süreleri, çalışan sayısını veya makine paylaşımını hesaplamaz. A ve B bağımsızsa uygun kaynaklarla paralel yapılabilir; sıraya yazılmış olmaları eşzamanlı çalışmayı yasaklayan bir fiziksel kural değildir.

**Kontrol ve cevap.** C ilk iş olabilir mi? Hayır. Hem A→C hem B→C kenarını ihlal eder. Geçerliliği sınamak için her okun kaynağının hedefinden önce yer aldığını kontrol ederiz.

## 13. Önce bitir, sonra listeyi ters çevir

[Ders sayfasındaki örnek 13](../onceki-ders.html#example-13) · [İlgili ders notu](../lecture-notes.html#topic-4-2)

**Ortak DAG.** AB, AC, BD, CD, CE, DE okları; A–E düğümleri. Alfabetik DFS A→B→D→E dalını açar.

| Olay | Bitiş listesi |
|---|---|
| E tamamlanır | E |
| D tamamlanır | E,D |
| B tamamlanır | E,D,B |
| C açılır; D ve E zaten bitmiştir; C biter | E,D,B,C |
| A tamamlanır | E,D,B,C,A |

Tersi **A,C,B,D,E** olur. A, B ve C'den önce; B ve C, D'den önce; C ve D, E'den öncedir. Altı kenarın tümü doğru yöndedir.

**Neden çalışır?** Çevrimsiz yönlü grafta u→v incelendiğinde v görülmemişse önce v'nin çağrısı tamamlanır; dolayısıyla v, u'dan önce biter. v zaten tamamlanmışsa yine u'dan önce bitmiştir. v aktif olamaz; aktif ataya ok çevrim oluştururdu. Bu yüzden her kenarda v'nin bitişi u'nunkinden öncedir. Bitiş listesini ters çevirince u önce gelir.

**Keşif sırası neden olmaz?** Keşif sırası A,B,D,E,C'dir. C→D ve C→E okları olmasına rağmen C en sona konmuştur. Bir düğüme erken ulaşmak, bütün ön koşullarının tamamlandığını göstermez.

**Koşullar.** Bütün düğümler için DFS yapılmalı, henüz görülmemiş her düğümden yeni kök açılmalıdır. Herhangi bir geri kenar varsa ters bitiş listesi topolojik sıra diye sunulmamalıdır. Listeyi ters çevirmek çevrimi ortadan kaldırmaz.

## 14. Kahn: bekleyecek işi kalmayanı seçmek

[Ders sayfasındaki örnek 14](../onceki-ders.html#example-14) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

Aynı beş düğümlü graf için başlangıç giriş dereceleri A:0,B:1,C:1,D:2,E:2. Hazır kuyruğu yalnızca A içerir.

| Çıkarılan | Azalan sayaçlar | İşlem sonrası hazır kuyruğu | Üretilen sıra |
|---|---|---|---|
| A | B:1→0, C:1→0 | B,C | A |
| B | D:2→1 | C | A,B |
| C | D:1→0, E:2→1 | D | A,B,C |
| D | E:1→0 | E | A,B,C,D |
| E | Çıkış oku yok | boş | A,B,C,D,E |

**Sayaç ne demek?** D'nin sayacı 1 olduğunda kalan bir ön koşulu vardır. “Yarısı tamamlandı, başlayabilir” denmez. Ön koşulların hepsi gerekli olduğundan ancak sıfırda kuyruğa girer.

**Neden doğru?** Kuyruktan seçilen düğüme, henüz sıraya alınmamış düğümlerden gelen ok kalmamıştır. Dolayısıyla onu sıradaki yere koymak geride bir ön koşul bırakmaz. Çıkış kenarlarını kaldırmak da bu işin artık diğerlerini bekletmediğini kaydeder.

Buradaki kaldırma mantıksaldır; özgün grafın çizimini silmek zorunlu değildir. Sayaçları azaltmak yeterlidir. Animasyon FIFO kuyruğu kullanır. Başlangıçta hazır düğümler ve komşu listeleri alfabetiktir; her adımda kuyruğun tamamı yeniden alfabetik sıralanmaz.

**Kontrol ve cevap.** B çıkarılınca D neden eklenmez? D hâlâ C'yi bekler. C çıkarıldığında D'nin sayacı sıfıra ulaşır.

## 15. İki farklı doğru cevabı doğrulamak

[Ders sayfasındaki örnek 15](../onceki-ders.html#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-6)

Önceki graf için DFS **A,C,B,D,E**, Kahn **A,B,C,D,E** verdi. Birini diğerine benzemediği için yanlış sayamayız.

| Zorunluluk | İki sırada da sağlanıyor mu? |
|---|---|
| A, B ve C'den önce | Evet |
| B ve C, D'den önce | Evet |
| C ve D, E'den önce | Evet |

**Neden tam iki sıra?** A herkesin önündedir: B ve C'ye doğrudan, D ve E'ye yollar üzerinden ön koşuldur. D hem B hem C'yi bekler. E de D'yi bekler. Yalnızca B ile C'nin kendi aralarındaki sıra serbesttir. İki seçenek, iki geçerli sıra üretir.

**Genelleme.** Tek zincirin sırası zorunludur. n yalıtılmış düğümde bütün permütasyonlar geçerlidir: n! farklı sıra. Örneğin üç bağımsız iş için 3×2×1=6 sıra vardır. Geçerli bir sıra bulmak ile bütün sıraları üretmek farklı işlerdir; çıktı sayısı bile çok büyük olabilir.

**Doğrulama yöntemi.** Önce her düğümün tam bir kez geçtiğini kontrol edin. Sonra her düğümün listedeki konumunu yazın. Her u→v için konum(u)<konum(v) olmalı. Yalnızca kenarları kontrol etmek, listeden bağımsız bir düğümün yanlışlıkla çıkarılmasını yakalamayabilir; ilk kontrol de gereklidir.

**Kontrol ve cevap.** A,B,D,C,E geçerli mi? Hayır. C→D kenarı C'nin D'den önce olmasını ister. B ile C'nin değişebilmesi, herhangi iki düğümün değişebileceği anlamına gelmez.

## 16. İkinci mola: kanıtı bir cümlede söylemek

[Ders sayfasındaki örnek 16](../onceki-ders.html#example-16) · [İlgili ders notu](../lecture-notes.html)

122–132. dakikalar arasındaki moladan sonra üç küçük graf çizin: zincir, yönlü elmas ve yönlü üçgen.

| Graf | Çevrim | Topolojik sıra örneği |
|---|---|---|
| A→B→C | Yok | A,B,C |
| AB,AC,BD,CD | Yok | A,B,C,D veya A,C,B,D |
| A→B→C→A | Var | Mümkün değil |

**Zincir için açıklama.** Her düğüm kendisinden öncekini bekler; bekleme geriye kapanmaz. Sıra zorunludur.

**Elmas için açıklama.** B ve C, A'dan sonra yapılabilir. D ikisini de bekler. D'ye iki yoldan ulaşılması çevrim değildir; geri dönüş yolu yoktur.

**Üçgen için açıklama.** Her düğüm bir diğerini bekler. Başlangıçta giriş derecesi sıfır olan düğüm yoktur. Kahn kuyruğu boştur fakat üç düğümün hiçbiri çıkarılmamıştır; bu başarısızlıktır.

**Kendinizi sınayın.** “DFS bitiş listesini ters çevirdim” tek başına yeterli gerekçe mi? Hayır. Önce grafın yönlü ve çevrimsiz olduğunu, ayrıca bütün düğümlerin tarandığını belirtmek gerekir.

## 17. Kuyruğun erken boşalması ne anlatır?

[Ders sayfasındaki örnek 17](../onceki-ders.html#example-17) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

Ortak DAG'a **E→B** ekleyelim. Yeni çevrim B→D→E→B. Başlangıç sayaçları A:0,B:2,C:1,D:2,E:2 olur.

| Adım | Değişim | Hazır kuyruğu |
|---|---|---|
| Başlangıç | Yalnızca A hazır | A |
| A çıkar | B:2→1, C:1→0 | C |
| C çıkar | D:2→1, E:2→1 | boş |

Sıra [A,C] olarak kalır. B E'yi, D B'yi, E D'yi bekler. Üç kalan düğümün her birinin giriş derecesi 1'dir. İki düğüm çıkarılmış olması beş düğümlü graf için tam sonuç değildir.

**Neden çevrim kanıtı?** Sonlu bir yönlü grafta kalan her düğümün kalan bir ön koşulu varsa, geriye doğru ön koşulları takip edin. Düğüm sayısı sonlu olduğu için sonunda bir düğüm tekrarlanır; yönlü çevrim vardır. Kahn'ın bütün düğümleri çıkarabilmesi ile grafın çevrimsiz olması bu yüzden eşdeğerdir.

**Her engellenen düğüm çevrimde mi?** Hayır. Bu grafa E→F ekleyin. F'nin geri dönen oku olmasa da E tamamlanamadığı için F bekler. F çevrimden etkilenir fakat çevrimin üzerinde değildir. Kuyrukta kalmış olmak ile çevrim üyesi olmak ayrı sonuçlardır.

**Kontrol ve cevap.** Boş kuyruk başarı mı? Ancak üretilen sıra bütün düğümleri içeriyorsa. Burada 2<5 olduğu için çevrim raporlanır; [A,C] yalnızca kısmi sıradır.

## 18. Kendi oklarınızla deney yapmak

[Ders sayfasındaki örnek 18](../onceki-ders.html#example-18) · [İlgili ders notu](../lecture-notes.html#topic-editor)

Editörde **AB**, A→B demektir. BA ters yöndeki başka bir oktur. Düğüm kümesi her zaman A,B,C,D,E,F olarak kalır; kenar yazılmayan düğümler kaybolmaz.

**Deney 1: `AB AC BD CD`.** A,E,F başlangıçta hazırdır. FIFO kuyruğu aşağıdaki gibi ilerler:

```text
[A,E,F] → A çıkar → [E,F,B,C]
E çıkar → [F,B,C]
F çıkar → [B,C]
B çıkar → [C]       D hâlâ C'yi bekler
C çıkar → [D]
D çıkar → []
Sonuç: A,E,F,B,C,D
```

E ve F'nin erken çıkması hata değildir; hiçbir ön koşulları yoktur. Kuyruğun her adımda yeniden alfabetik sıralandığını varsaysaydınız farklı sonuç beklerdiniz.

**Deney 2: `AB BC CA`.** A,B,C çevrimdedir. D,E,F yalıtılmıştır ve çıkarılabilir. Sonuç [D,E,F] kısmi sırasıdır; üç düğüm kalır. Grafın bir kısmının işlenmesi bütün grafın çevrimsiz olduğunu göstermez.

**Deney 3: boş kenar listesi.** Altı düğümün hepsi hazırdır. Demo A,B,C,D,E,F verir; aslında 6!=720 permütasyonun tamamı geçerlidir.

**Editör sınırları.** Aynı ok tekrar yazılırsa birleştirilir. Bu editör kendine okları dışlar ve A–F dışındaki düğümleri desteklemez. Bu, matematiksel graflarda kendine ok olamayacağı anlamına gelmez; A→A yönlü bir çevrimdir.

**Kontrol ve cevap.** Bir çevrimden bir ok silmek bütün grafı düzeltir mi? Yalnızca başka çevrim kalmadıysa. Silme sonrası algoritmayı yeniden çalıştırıp bütün düğümlerin çıkarıldığını kontrol edin.

## 19. Python kodunu satır satır anlamak

[Ders sayfasındaki örnek 19](../onceki-ders.html#example-19) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

Ders sayfasındaki kod, beş iş için Kahn algoritmasını çalıştırır. `input()` çağrısı yoktur; veri doğrudan `graph` sözlüğündedir.

```python
from collections import deque

graph = {"A": ["B", "C"], "B": ["D"],
         "C": ["D", "E"], "D": ["E"], "E": []}
indegree = {u: 0 for u in graph}
for u in graph:
    for v in graph[u]:
        indegree[v] += 1
ready = deque(u for u in graph if indegree[u] == 0)
order = []
while ready:
    u = ready.popleft()
    order.append(u)
    for v in graph[u]:
        indegree[v] -= 1
        if indegree[v] == 0:
            ready.append(v)
if len(order) == len(graph):
    print("Valid order:", order)
else:
    print("Cycle detected. Partial order:", order)
```

| Satır | Açıklama |
|---|---|
| 1 | `deque` sınıfını alır; kuyruk başından verimli çıkarma sağlar. |
| 2 | Boş satır yalnızca okunabilirlik içindir. |
| 3–4 | Çıkış komşularını tanımlar. E'nin boş listesi, E yok demek değil, E'den çıkan ok yok demektir. |
| 5 | Her düğümün gelen ok sayacını başlangıçta sıfırlar. |
| 6 | Her kaynak düğüm u üzerinde dolaşır. |
| 7 | u'dan çıkan her okun hedefi v'yi seçer. |
| 8 | u→v bulunduğundan v'nin sayacını bir artırır. |
| 9 | Sayacı sıfır olanları başlangıç kuyruğuna alır. Bu sözlükte ilk hazır düğüm A'dır. |
| 10 | Üretilecek sırayı boş liste olarak başlatır. |
| 11 | Kuyruk boş olmadığı sürece işlem yapar. |
| 12 | En önce beklemeye başlamış hazır düğümü çıkarır. |
| 13 | Bu düğümü sonuç sırasının sonuna ekler. |
| 14 | Çıkarılan düğümün etkilediği hedefleri dolaşır. |
| 15 | u artık sıraya alındığı için v'nin kalan ön koşul sayısını azaltır. |
| 16 | Bütün kalan ön koşullar bitmiş mi diye sınar. |
| 17 | Yalnızca sıfıra ulaşan hedefi kuyruğun sonuna ekler. |
| 18 | Çıkarılan düğüm sayısıyla toplam düğüm sayısını karşılaştırır. |
| 19 | Hepsi çıkarıldıysa tam ve geçerli sırayı yazdırır. |
| 20–21 | Aksi durumda çevrim bulunduğunu ve yalnızca kısmi sıra üretildiğini açıkça yazar. |

**Beklenen çıktı.**

```text
Valid order: ['A', 'B', 'C', 'D', 'E']
```

E'nin listesini `["B"]` yaparsanız E→B eklenir ve çıktı değişir:

```text
Cycle detected. Partial order: ['A', 'C']
```

**Veriyi değiştirirken.** Her komşu sözlükte anahtar olarak da bulunmalıdır. Örneğin E'nin listesine F ekliyorsanız `"F": []` kaydını da ekleyin; aksi durumda sayaç güncellemesi `KeyError` verir. Python sözlük ekleme sırasını izler; kod komşuları kendiliğinden alfabetik sıralamaz. Bu örnekte verilen sıralar zaten alfabetiktir.

**Maliyet.** İlk tarama gelen okları sayar, ikinci tarama çıkarılan düğümlerin çıkışlarını işler. Her kenara sabit sayıda iş yapılır; komşuluk listeleri ve olağan sözlük işlemleri varsayımıyla O(n+m) zaman, graf dışında O(n) yardımcı alan gerekir. Kodun oluşturduğu sıra, graf editörünün verisini otomatik okumaz; kod örneğini değiştirmek ayrı bir işlemdir.

## 20. Bir düğümün kaybı ağı böler mi?

[Ders sayfasındaki örnek 20](../onceki-ders.html#example-20) · [İlgili ders notu](../lecture-notes.html#topic-6-1)

**Problem.** Yönsüz A—B—C zinciri ile A—B—C—A üçgenini karşılaştırıyoruz. Başlangıçta her biri tek bağlı bileşendir. B'yi ve B'ye bağlı bütün kenarları kaldırın.

| Graf | B silinmeden | B silindikten sonra | Sonuç |
|---|---:|---:|---|
| Zincir | 1 bileşen | 2: {A}, {C} | B kesme düğümüdür |
| Üçgen | 1 bileşen | 1: {A,C} | B kesme düğümü değildir |

**Tanım.** Bir düğüm kaldırıldığında bağlı bileşen sayısı artıyorsa o düğüm kesme düğümüdür. Silinen düğümü ayrı bir bileşen olarak saymayız; kalan grafın bileşenlerini sayarız. Zincirin uç düğümü A silinirse B—C bağlı kalır; sayı 1'den 1'e gider ve A kesme düğümü değildir.

**Mühendislik anlamı.** B bir iletişim anahtarıysa zincirde B'nin arızası A ile C arasındaki bağlantıyı keser. Üçgende alternatif A—C yolu kalır. Bu topolojik dayanıklılık kontrolüdür; bant genişliği, gecikme veya aynı güç kaynağına bağlı ortak arıza gibi bilgileri kendiliğinden içermez.

**DFS bağlantısı.** Görsel doğrudan silip bileşen sayar. Daha verimli genel algoritmalar giriş zamanları ve `low` kayıtları kullanır. Kök olmayan u için bir çocuk alt ağacı u'nun üstündeki bir ataya kaçamıyorsa u kesme düğümüdür; teknik koşul `low[çocuk] >= giriş[u]` olur. DFS kökü için ayrı kural vardır: en az iki DFS ağacı çocuğu. Kökün toplam graf derecesiyle çocuk sayısı aynı şey değildir.

**Kontrol ve cevap.** Üçgendeki B neden kritik değildir? A ile C arasındaki alternatif kenar, B silindikten sonra da bağlantıyı korur.

## 21. Tek yönlü erişim güçlü bağlılık değildir

[Ders sayfasındaki örnek 21](../onceki-ders.html#example-21) · [İlgili ders notu](../lecture-notes.html#topic-6-2)

**Veri.** A→B→C→A çevrimi ve C→D oku. A,B,C birbirine ok yönlerini izleyerek ulaşabilir. D'ye de ulaşırlar fakat D'den geri dönemezler.

| Grup | Karşılıklı erişim | Güçlü bağlı bileşen |
|---|---|---|
| A,B,C | Her düğüm diğerlerine ulaşır | {A,B,C} |
| D | Kendisine sıfır kenarlı yol | {D} |

**Tanımdaki “maksimal”.** Bir güçlü bağlı bileşene, karşılıklı erişimi bozmadan başka düğüm eklenememelidir. A ve B karşılıklı erişilebilir olsa da {A,B} burada tam bileşen değildir; C de gruba eklenebilir. D ise geri dönemediği için eklenemez.

**Neden DFS ağacı yetmez?** A'dan başlatılan DFS D'ye kadar ulaşarak dört düğümü aynı ağaçta gösterebilir. Ağaç bir kaynaktan erişimi kaydeder; herkesin herkese geri dönebildiğini kanıtlamaz. Bu yüzden DFS ağacının düğümlerini doğrudan tek güçlü bağlı bileşen sayamayız.

**D→A eklenirse.** D artık A'ya; A üzerinden B ve C'ye ulaşır. Önceden diğerleri de D'ye ulaşıyordu. Böylece dört düğüm tek güçlü bağlı bileşen olur.

**Grupları küçültmek.** Her güçlü bağlı bileşeni tek kutuya dönüştürürsek burada {A,B,C}→{D} kalır. Bu bileşen grafı her zaman DAG'dır: kutular arasında çevrim olsaydı bu kutular karşılıklı erişilebilir olur ve zaten tek bileşen sayılmaları gerekirdi.

**Kontrol ve cevap.** D tek başına neden bileşendir? Bir düğüm kendisine hiç kenar kullanmadan ulaşabilir. D'nin öz çevrim oku taşıması gerekmez.

## 22. Önce soruyu seç, sonra kanıtı göster

[Ders sayfasındaki örnek 22](../onceki-ders.html#example-22) · [İlgili ders notu](../lecture-notes.html#topic-8-1)

Aynı graf yapısı farklı sorular için farklı algoritmalar gerektirir. Bir algoritmayı tanımak, onu her soruya uygulamak demek değildir.

| Sorulan şey | Uygun araç | Gösterilecek kanıt |
|---|---|---|
| Eşit maliyetli en az hareket | BFS | Mesafe katmanları ve ebeveynlerden yol |
| Bir dalı araştırıp geri dönme | DFS | Aktif yığın, giriş ve bitiş olayları |
| Yönlü çevrim | Üç durumlu DFS | Aktif ataya geri kenar ve kapalı yol |
| Ön koşullara uygun sıra | Kahn veya çevrim kontrollü ters DFS bitişi | Bütün düğümler ve her okun doğru sırada olması |
| Kritik bağlantı düğümü | Yönsüz kesme düğümü analizi | Silme sonrası bileşen sayısının artması |
| Karşılıklı erişim grupları | Güçlü bağlı bileşen analizi | Her çift için iki yönde erişim |

**Son elmas kontrolü.** AB,AC,BD,CD grafında D'ye iki yol gider. Bu çevrim değildir; D'den geri dönüş yoktur. A,B,C,D ve A,C,B,D geçerli sıralardır. DFS keşif sırası A,B,D,C ise C→D koşulunu ihlal ettiğinden topolojik sıra değildir. Böylece erişmek, çevrim bulmak ve sıralamak arasındaki fark aynı küçük graf üzerinde görülebilir.

**Kilitlenme benzetmesinin sınırı.** Bekleme grafında u→v, u'nun v'nin tuttuğu kaynağı beklediği anlamına gelsin. Her kaynak türünün tek örneği olduğu standart bekleme modelinde bir bekleme çevrimi kilitlenme gösterir. Birden fazla kaynak örneği veya farklı bekleme kuralları varsa aynı kısa çıkarım her durumda geçerli değildir. Genel bir geri besleme çevrimini de işletim sistemi kilitlenmesiyle eşitlemeyin.

**Kendi cevabınızı kurma şablonu.** Önce düğüm ve okların anlamını yazın. Başlangıç ve komşu sırasını belirtin. Yığın veya kuyruğun iki-üç kritik adımını gösterin. Sonra somut sonucu yazın: rota, çevrimdeki oklar, geçerli iş sırası veya kalan düğümler. Son cümlede hangi varsayımla geçerli olduğunu söyleyin. Böyle bir cevap, yalnızca “DFS kullandım” demekten çok daha açıklayıcı ve denetlenebilirdir.

