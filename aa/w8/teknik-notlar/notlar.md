# AA · 8. Hafta — 22 örneğin Türkçe teknik açıklaması

Bu notlar **“Graphs and breadth-first search”** dersindeki 22 kartı aynı sırayla açıklar. Bu haftada 28 değil 22 kart vardır; 9 ve 16 numaralı kartlar moladır ve burada cevaplı tekrar olarak kullanılır. Her örnekte neyi modellediğimizi, algoritmanın nasıl ilerlediğini, neden doğru olduğunu ve hangi işi saydığımızı ayırıyoruz.

## Başlamadan: kavramlar ve ortak örnek

- **Graf (graph):** Düğümler ve onları bağlayan kenarlardan oluşan model. Buradaki graf sözcüğü, bir fonksiyonun koordinat düzlemindeki grafiğinden farklı anlamdadır.
- **Düğüm / tepe (vertex):** Oda, bileşen veya durum gibi bir nesne. **Kenar (edge):** İki düğüm arasındaki doğrudan bağlantı. **Komşu:** Doğrudan kenarla bağlı düğüm.
- **n = |V|:** Düğüm sayısı. **m = |E|:** Kenar sayısı. Yönsüz bir AB kenarını iki uçtan kullanabilsek de m içinde bir kez sayarız.
- **Derece (degree):** Buradaki basit yönsüz graflarda düğüme bağlı kenar sayısı. Yönlü graf için gelen ve giden dereceler ayrı sayılır.
- **BFS (breadth-first search):** Genişlik öncelikli arama. Kaynaktan başlayıp eşit adım uzaklığındaki düğümleri katmanlar halinde keşfeder. **FIFO kuyruğu:** İlk giren ilk çıkar.
- **Mesafe:** Ağırlıksız örneklerde kaynaktan düğüme ulaşmak için gereken en az kenar sayısı. Kaynağın kendisine mesafesi 0; erişilemeyen düğümün mesafesi 0 değildir.
- **Keşif:** Düğümün ilk kez bulunup işaretlenmesi. **İşleme:** Kuyruktan çıkarılıp komşularının incelenmesi. Kuyrukta bekleyen düğüm keşfedilmiştir ama henüz işlenmemiş olabilir.
- **Ebeveyn (parent):** Düğümü ilk keşfeden önceki düğüm. Rotayı geri kurmak için saklanır. Grafın özgün bütün kenarlarını temsil etmez.
- **O:** Maliyet için büyüme üst sınırı. **Θ:** Aynı mertebede alt ve üst sınır. O(n+m) ifadesi, düğüm ve bağlantı işlerinin birlikte sayıldığını söyler; saniye veya tam işlem sayısı değildir.

Hafta boyunca sık kullanılan yönsüz dört odalı graf şöyledir:

```text
       A
      / \
     B   C
      \ /
       D
Kenarlar: AB, AC, BD, CD
```

Harfler kimliktir; konum veya uzaklık değildir. Aşağıda aksi söylenmedikçe bu graf, alfabetik komşu sırası ve A kaynağı kullanılır. Şekildeki çapraz çizgilerin uzunluğu bir ağırlık belirtmez.

## 1. Doğru bekleme sırasını seçmek

[Ders sayfasındaki örnek 1](../onceki-ders.html#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** Robot B, C, D yerlerini bu sırayla keşfetti. Hangisini önce işleyeceği, bekleyenleri nasıl sakladığına bağlıdır.

| Yapı | Bekleyenler | İlk çıkarılan | Kural |
|---|---|---|---|
| Kuyruk | B, C, D | B | İlk giren ilk çıkar |
| Stack | B, C, D | D | Son giren ilk çıkar |

**BFS için neden kuyruk?** Daha önce keşfedilmiş yakın düğümler, sonradan keşfedilen uzak düğümlerden önce işlenir. Yeni bulunan düğümler kuyruğun sonuna eklenir. Böylece mevcut katmanın bekleyenleri atlanmadan tamamlanır. Stack ise başka bir araştırma düzeni sağlayabilir; uygun derinlik öncelikli arama bir dalın içine ilerleyip sonra geri döner. Aynı kayıtları tutmak aynı dolaşım sırasını vermez.

**İki ayrı büyüklük.** Bu hafta yalnızca ziyaret edilen odaları değil, kontrol edilen bağlantıları da sayacağız. On düğümlü bir grafın hiç kenarı olmayabilir veya çok sayıda kenarı olabilir. n ile m bu yüzden ayrı değişkenlerdir. Düğüm sayısından kenar sayısını her graf için çıkaramayız.

**Kontrol ve cevap.** n > 0 iken m = 0 olabilir mi? Evet. Bütün düğümler yalıtılmıştır. Bir kaynakla BFS başlatınca kaynak keşfedilip işlenir; başka yere geçilemez. Düğümler kenarları olmadığı için modelden silinmez. Veri yapısında bu düğümler için boş komşu listesi gibi bir temsil bulunmalıdır.

## 2. Graf, neyin neye bağlı olduğunu kaydeder

[Ders sayfasındaki örnek 2](../onceki-ders.html#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

**Problem.** Dört oda A, B, C, D; koridorlar AB, AC, BD, CD. A'nın doğrudan komşuları B ve C'dir. D'ye ulaşılabilir ama A–D doğrudan kenarı yoktur.

```text
Doğrudan komşuluk: A—B
İki adımlı rota:   A—B—D
Başka rota:       A—C—D
```

**Komşuluk ile erişilebilirlik farklıdır.** Komşuluk tek kenar sorusudur. Erişilebilirlik, bir veya daha çok kenarla yol olup olmadığını sorar; düğümün kendisine sıfır kenarlı yol da kabul edilir. B ile C komşu değildir, fakat B–A–C veya B–D–C üzerinden birbirine ulaşırlar.

**Modeli önce tanımlayın.** Bir kenar fiziksel koridor, elektrik bağlantısı, veri iletimi veya durum geçişi olabilir. Bu anlam, hangi algoritmanın sonucunun işe yarayacağını belirler. Örneğin fiziksel bağlantı olması iki bileşenin aynı protokolü konuşabildiğini kendiliğinden söylemez; model neyi kodluyorsa yalnızca onu kullanabiliriz.

**Çizim değişince ne değişir?** A'yı kağıdın sağ altına taşımak, kenarlar aynıysa bağlantıları değiştirmez. İki çizginin kesişmesi de o kesişimde bir düğüm olduğu anlamına gelmez. Düğüm ve kenarlar açıkça tanımlanmalıdır. Çizim mesafesini yol uzunluğu sanmak, ağırlıksız modeli yanlış okumaktır.

**Temsil.** `A: [B,C]` gibi bir sözlük, her kimliği komşularına eşler. Sonradan E odası eklenip koridor bağlanmazsa `E: []` kaydı gerekir. Graf yalnızca kenar uçlarından otomatik oluşturulursa yalıtılmış odalar yanlışlıkla kaybolabilir.

## 3. Tek yön, çift yön ve maliyet ayrı özelliklerdir

[Ders sayfasındaki örnek 3](../onceki-ders.html#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

**Problem.** Bir koridor iki yönlü olabilir, bir kapı yalnızca A'dan B'ye geçirebilir, bir yolun enerji maliyeti farklı olabilir. Bunları tek kavram gibi kullanmayalım.

| Özellik | Ne söyler? | Ne söylemez? |
|---|---|---|
| Yönsüz AB | A'dan B'ye ve B'den A'ya bağlantı var | Geçişin kaç saniye sürdüğü |
| Yönlü A → B | A'dan B'ye doğrudan geçiş var | B'den A'ya da geçilebildiği |
| Ağırlık 7 | Kenarın tanımlanmış maliyeti 7 | Maliyetin zaman mı enerji mi olduğu |

**Yön ve ağırlık bağımsızdır.** Yönlü graf ağırlıklı veya ağırlıksız olabilir. Yönsüz graf da aynı iki seçeneğe sahiptir. A → B ve B → A ayrı yönlü kenarlarsa maliyetleri bile farklı olabilir.

**Erişimde oku takip edin.** Kaynaktan ulaşılabilen düğümleri bulurken giden kenarlara bakılır. A → B üzerinden A'dan B'ye ulaşmak, B'den A'ya dönüş yolu olduğunu kanıtlamaz. Başka bir dolaylı dönüş yolu varsa ayrıca gösterilmelidir.

**Amaç değişirse algoritma da değişebilir.** Ağırlıksız BFS az kenarlı yolu bulur. Her hareket eşit pozitif süre alıyorsa bu aynı zamanda az süreli yoldur. Farklı ağırlıklarda bu bağlantı kopar; iki ucuz kenar bir pahalı kenardan iyi olabilir. “En kısa” derken kenar sayısı mı, toplam mesafe mi, enerji mi dediğimizi belirtmeliyiz.

**Sınır.** Kendi üzerine kenar ve paralel kenarlar bazı gerçek modellerde anlamlıdır. Bu haftanın düzenlenebilir örnekleri bunları kabul etmeyen basit graflardır. Bir algoritmanın sayımını başka tür grafa taşırken saklama ve derece kurallarını yeniden kontrol edin.

## 4. Tek bağlantı eklemek neyi değiştirir?

[Ders sayfasındaki örnek 4](../onceki-ders.html#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-4)

**Problem.** AB, AC, BD, CD grafında n = 4, m = 4. E odasını koridorsuz eklersek n = 5, m = 4 olur. A'dan BFS, E'ye erişemez.

**DE ekleyelim:** E artık D'nin komşusudur. A'dan D'ye iki adım, D'den E'ye bir adım daha vardır. A–B–D–E veya A–C–D–E üç kenarlı rotalardır. n değişmez, m = 5 olur.

**AE kestirmesini de ekleyelim:** E doğrudan komşu olur ve mesafesi 1'e düşer. Üç adımlı eski rotalar hâlâ vardır; algoritma bunların varlığını inkâr etmez, en az kenar sayısını verir. Yeni kenar erişimi iyileştirebilir veya bazı mesafeleri aynı bırakabilir; bu ağırlıksız durumda kenar eklemek mevcut en kısa mesafeyi büyütmez.

**Sayfadaki editörün farkı.** Metin dört odadan başlayarak düşünce deneyi yapar. Düzenlenebilir görselde ise **A–F düğümlerinin altısı her zaman vardır**. `AB AC BD CD DE` yazdığınızda n = 6, m = 5; F yalıtılmıştır. Metindeki n = 5 sayısını bu ekrana aynen taşımayın. Kenar kutusunu boşaltmak düğümleri silmez: altı düğüm ve sıfır kenar kalır.

**Giriş kuralları.** `AB` ile `BA` aynı yönsüz kenardır; tekrarı bir kez saklanır. `AA` gibi kendi üzerine kenar kabul edilmez. Kaynak değiştirmek grafın kenarlarını değiştirmez ama erişilen küme ve mesafeler değişebilir. Editörde bir değişiklik yaptıktan sonra eski cevapları ezberden kullanmak yerine yeni modelden yeniden hesaplayın.

## 5. Aynı grafı iki farklı biçimde saklamak

[Ders sayfasındaki örnek 5](../onceki-ders.html#example-5) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

**Problem.** Dört odalı grafın komşu listeleri şöyledir:

```text
A: B, C
B: A, D
C: A, D
D: B, C
```

Aynı bilgiyi satır ve sütun sırası A, B, C, D olan komşuluk matrisiyle saklayabiliriz:

| | A | B | C | D |
|---|---:|---:|---:|---:|
| A | 0 | 1 | 1 | 0 |
| B | 1 | 0 | 0 | 1 |
| C | 1 | 0 | 0 | 1 |
| D | 0 | 1 | 1 | 0 |

**Hücreyi okuma.** A satırı, B sütunundaki 1, AB kenarının varlığını söyler. A–D hücresi 0'dır; bu yalnızca doğrudan kenarın olmadığını söyler. A'dan D'ye hiçbir yol yok anlamına gelmez.

**Neden simetrik?** Yönsüz AB kenarı A'nın listesinde B, B'nin listesinde A olarak saklanır. Matriste de hem AB hem BA 1 olur. Dört kenar bu yüzden sekiz adet 1 üretir. Köşegende sıfır olması bu örnekte kendi üzerine kenar olmadığını gösterir. Yönlü grafın matrisi genel olarak simetrik değildir.

**Düğüm sırası.** Matris indisleri harflerin yerine kullanılır; etiket–indeks eşlemesi sabit tutulmalıdır. Sütun sırası değişip satır adları aynı yorumlanırsa farklı graf okunur.

**Yalıtılmış ve ağırlıklı durumlar.** Yalıtılmış düğümün listesi boştur; yönsüz matriste satır ve sütunu sıfırdır. Yönlü grafta sıfır satır yalnızca giden kenar olmadığını söyler; gelen kenarlar olabilir. Ağırlıklı matriste 0 geçerli maliyetse “kenar yok” için 0 kullanmak belirsizdir; ayrı bir işaret gerekir.

## 6. Saklama biçimini yapılacak işlere göre seçmek

[Ders sayfasındaki örnek 6](../onceki-ders.html#example-6) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

**Problem.** Altı düğüm ve üç yönsüz kenar olsun. Tam matris 6×6 = 36 hücre kullanır. Komşu listeleri altı düğüm başlığı ve toplam altı komşu girdisi tutar.

| İşlem / alan | Düz komşu listeleri | Tam matris |
|---|---|---|
| Saklama | Θ(n+m) | Θ(n²) |
| u'nun komşularını listeleme | Derecesi kadar girdi | n hücrelik satır |
| Belirli uv kenarı var mı? | u listesini taramak gerekebilir | İndeksler biliniyorsa O(1) |

**Seyrek graf.** Kenar sayısı olası maksimuma göre küçükse, olmayan kenarlar için n² hücre tutmak israf olabilir. Komşu listeleri yalnızca gerçek bağlantıları taramayı sağlar. Çok yoğun grafta ise matrisin doğrudan erişimi ve düzenli yerleşimi uygun olabilir. Seçim yalnızca bellek değil sorgu türüne de bağlıdır.

**Maksimum kenar hesabı.** Basit yönsüz, kendi üzerine kenarsız altı düğümde her düğüm diğer beşine bağlanabilir; 6×5 sayısı her kenarı iki kez sayar. Bu nedenle maksimum 15. Yönlü durumda AB ile BA ayrı kenarlar olduğundan maksimum 30. Matris her iki durumda da 36 konum içerir; köşegen ve simetrik yerler de hücredir.

**Varsayımlar.** Düz liste ile hash tabanlı komşu kümesi aynı maliyetlere sahip değildir. Hash kümesi uygun varsayımlarla beklenen sabit kenar sorgusu verebilir; ek bellek yükü vardır. Ayrıca “altı girdi” altı bayt demek değildir: Python nesnesi, referans ve bit farklı büyüklükler kullanır. Buradaki karşılaştırma mantıksal öğe sayısıdır.

## 7. Dönüştürürken kenarları kaybetmemek veya iki kez saymamak

[Ders sayfasındaki örnek 7](../onceki-ders.html#example-7) · [İlgili ders notu](../lecture-notes.html#topic-2-4)

**Problem.** Komşuluk matrisinden listeye ya da listeden matrise geçelim. Aynı grafı korumak için kenarın kendisi ile onu saklayan girdileri ayırmalıyız.

**Matristen listeye:** Her u satırında her v sütununa bak. Kenar varsa v'yi u'nun listesine ekle. Bu, kenar az olsa bile n² hücrenin taranmasını gerektirir. Yönsüz simetrik matriste AB ve BA hücrelerini okumak iki komşu girdisi oluşturur; iki farklı yönsüz kenar oluşturmaz.

**Listeden matrise:** Önce n² hücreyi “yok” durumuna getir, sonra listedeki bağlantıları işaretle. Kenarları okumak O(n+m) olsa da tam matrisi başlatma Θ(n²) maliyetini ortadan kaldırmaz. Seyrek matris gibi farklı temsil kullanılıyorsa o başka bir uygulama olur.

**Derece toplamı:** Her yönsüz kenarın iki ucu vardır. Kenar, her uç düğümün derecesine bir katkı verir. Bu nedenle `dereceler toplamı = 2m`. Örneğin A,B,C,D dereceleri 2,2,2,2; toplam 8, kenar sayısı 4. Derece toplamı 10 ise m = 5.

**Yönlü ayrım.** Her yönlü kenarın bir başlangıcı, bir bitişi vardır. Giden derece toplamı m, gelen derece toplamı m'dir. Bunları birleştirip her birini 2m sanmayın.

**Kontrol.** Yönsüz listede A'nın listesinde B varsa B'nin listesinde A da olmalıdır. Eksik simetri başka bir grafı temsil eder. Yalıtılmış düğümler dönüşümde tutulmalıdır. Kendi üzerine kenarlar için standart derece tanımı ek dikkat ister; bu haftanın basit örneklerinde bunlar yoktur.

## 8. BFS katman katman yayılır

[Ders sayfasındaki örnek 8](../onceki-ders.html#example-8) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

**Problem.** A'dan başlayıp önce bir kenarla, sonra iki kenarla ulaşılabilen odaları bulacağız.

```text
Katman 0: A       mesafe 0
Katman 1: B, C    mesafe 1
Katman 2: D       mesafe 2
```

**Başlangıç:** A'nın mesafesini 0 yap, keşfedildi olarak kaydet ve kuyruğa koy. Kuyruktan A çıkınca B ve C incelenir. İkisi de yeni olduğu için mesafeleri `distance[A]+1 = 1` olur; ebeveynleri A, kuyruk sıraları B,C'dir.

**Bir sonraki katman:** B çıkarıldığında D keşfedilir, mesafesi `1+1 = 2`, ebeveyni B olur. D kuyruğun sonuna eklenir; C zaten beklediğinden önce C işlenir. C de D'ye bağlıdır ama D daha önce keşfedilmiştir; yeniden eklenmez.

**Keşif anında işaretleme.** D'yi kuyruğa koyarken işaretlemek gerekir. İşlemeye başlayana kadar işaretlemezsek C de D'yi yeni sanıp ikinci bir kayıt oluşturabilir. Basit BFS'nin “her düğüm bir kez kuyruğa girer” özelliği, işareti erken koymamıza dayanır.

**Neden en kısa katman?** FIFO, daha yakın katmandaki bekleyenleri yeni uzak düğümlerin önünde tutar. Bir düğüme daha kısa yol olsaydı o yolun önceki düğümü daha erken işlenecek ve düğümü daha erken keşfedecekti. Bu yüzden ilk keşifte verilen kenar sayısı en küçüktür.

**Kontrol ve cevap.** Kuyrukta bekleyen düğüm ziyaret edilmiş sayılır mı? Kullanılan terime bağlı karışıklığı önlemek için “keşfedildi ama işlenmedi” deyin. Bu notlarda iki olay açıkça ayrılır.

## 9. İlk mola — grafı doğru okumak

[Ders sayfasındaki örnek 9](../onceki-ders.html#example-9) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart 64–74. dakikalar arasındaki moladır. İlk bölümün temel ayrımlarını aşağıdaki cevaplarla tekrar edin.

**Komşu ile erişilebilir aynı mı?** Hayır. A ve D doğrudan komşu değildir; fakat A–B–D üzerinden erişilebilir. Komşuluk tek kenar, erişim bir rota sorusudur.

**Dört yönsüz kenar neden sekiz listede görünür?** Sekiz ayrı liste değil, toplam sekiz komşu girdisi vardır. Her kenar iki uçtaki listede birer kez saklanır. Kenar sayısı yine dörttür.

**A → B varsa B → A var mı?** Otomatik olarak yoktur. Yönlü kenarı tersinden kullanamayız. Ters veya dolaylı dönüş yolunun gerçekten bulunması gerekir.

**Kuyruktaki düğüm yeni mi, eski mi?** Keşfedilmiştir ve mesafesi atanmıştır. Kuyruktan çıkarılınca komşuları işlenecektir. Keşif ile işleme zamanını ayırmak tekrar eklemeyi önler.

**Kenar kutusunu boşaltırsak graf boş mu olur?** Düzenlenebilir görselde A–F düğümleri hâlâ vardır; yalnızca kenarlar sıfırdır. Dolayısıyla altı yalıtılmış düğüm kalır.

**Matris her zaman daha hızlı mı?** Belirli kenar sorgusunda doğrudan erişim sağlar. Ama komşuları bulmak için bütün satırı tarar ve n² hücre tutar. Hangi işlemin hızından söz ettiğimizi belirtmeden genel kazanan seçemeyiz.

## 10. Kuyruğu tek işlem tek işlem izlemek

[Ders sayfasındaki örnek 10](../onceki-ders.html#example-10) · [İlgili ders notu](../lecture-notes.html#topic-3-3)

**Problem.** A kaynağı ve alfabetik komşu sırası. Kuyruk gösterimi soldan sağa, önden arkaya okunur.

| İşlem | Son kuyruk | Yeni bilgi |
|---|---|---|
| A'yı keşfet | [A] | A: 0, ebeveyn yok |
| A'yı çıkar, B ve C'yi keşfet | [B,C] | B:1, C:1; ikisinin ebeveyni A |
| B'yi çıkar, A'yı atla, D'yi keşfet | [C,D] | D:2, ebeveyn B |
| C'yi çıkar, A ve D'yi kontrol et | [D] | İkisi de keşfedilmiş; ekleme yok |
| D'yi çıkar, B ve C'yi kontrol et | [] | Ekleme yok; işlem bitti |

**Önemli an:** B, D'yi bulduğunda C kuyrukta öndedir. D acilen başa alınmaz. Bu düzen, mesafe 1'deki bütün düğümler işlenmeden mesafe 2'nin işlenmesini önler.

**Zaten bilinen komşu bedelsiz değildir.** B'nin listesinde A'yı okumak ve keşfedildiğini kontrol etmek iştir. C'nin listesinde D'yi kontrol etmek de iştir; yalnızca yeni kuyruk girdisi oluşturmaz. Bu yüzden “dört düğüm bulundu, toplam dört işlem yapıldı” yanlış olur.

**Tam sayım.** Her liste iki komşu içerir: A için 2, B için 2, C için 2, D için 2. Toplam sekiz komşu girdisi incelenir. Dört düğüm birer kez kuyruğa girer ve çıkar. Keşif sırası ve işleme sırası bu örnekte A,B,C,D olarak görünür, fakat olayların zamanı farklıdır.

**Komşu sırası değişirse:** A'nın listesi C,B olursa D'yi önce C keşfedebilir. Mesafeler değişmez; D'nin ebeveyni değişebilir. Algoritmanın belirlenmiş bağlayıcı sırası yoksa farklı doğru BFS ağaçları mümkündür.

## 11. Python kodunu kuyruk iziyle bağlamak

[Ders sayfasındaki örnek 11](../onceki-ders.html#example-11) · [İlgili ders notu](../lecture-notes.html#topic-3-2)

**Problem.** Ders sayfasındaki kod, FIFO kuyruğu için `deque` kullanır. `distance` sözlüğü hem keşif işareti hem de mesafe tablosudur.

```python
from collections import deque

graph = {"A": ["B", "C"], "B": ["A", "D"],
         "C": ["A", "D"], "D": ["B", "C"]}
start = "A"
distance = {start: 0}
parent = {start: None}
queue = deque([start])
while queue:
    u = queue.popleft()
    for v in graph[u]:
        if v not in distance:
            distance[v] = distance[u] + 1
            parent[v] = u
            queue.append(v)
print("Distances:", distance)
print("Parents:", parent)
```

**Başlatma satırları:** `import`, deque türünü getirir. `graph` komşu listelerini tanımlar; yönsüz her kenar iki listede bulunur. `start` kaynağı seçer. `distance` içine A:0 yazıldığı anda A keşfedilmiş olur. `parent[A]=None`, kaynağın bir önceki düğümü olmadığını belirtir. `deque([start])` bir elemanlı bekleme kuyruğunu oluşturur.

**Döngü satırları:** `while queue`, bekleyen düğüm olduğu sürece çalışır. `popleft()` en eski girdiyi çıkarır; sıradan listenin başından `pop(0)` gibi bütün kalanları kaydırmaz. `for v in graph[u]`, u'nun bütün komşu girdilerini inceler. `if v not in distance`, yalnızca ilk keşifte içeri girer. Sonraki üç satır sırasıyla mesafeyi, ebeveyni ve kuyruk girdisini oluşturur. İşaret, eklemeden önce yerleştirilir.

```text
Distances: {'A': 0, 'B': 1, 'C': 1, 'D': 2}
Parents: {'A': None, 'B': 'A', 'C': 'A', 'D': 'B'}
```

**Sınırlar.** Kaynak ve bütün komşu etiketleri `graph` anahtarları olmalıdır; aksi halde eksik düğüm işlenirken hata oluşur. `"E": []` yalıtılmış kaynağı bir kez işlenir ve mesafesi 0 kalır. Her Run kodu baştan çalıştırır. Graf editörü ile Python hücresi ayrı örneklerdir; birini değiştirmek diğerinin girdisini otomatik değiştirmez.

## 12. Maliyette neden hem n hem m var?

[Ders sayfasındaki örnek 12](../onceki-ders.html#example-12) · [İlgili ders notu](../lecture-notes.html#topic-3-5)

**Problem.** BFS'de düğüm işleri ile bağlantı işleri ayrı birikir. Düğüm kuyruğa bir kez girer diye her komşu da yalnızca bir kez görünüyor sanmayın.

**Düğüm işi:** Her keşfedilen düğüm için mesafe/ebeveyn kaydı, bir ekleme, bir çıkarma. **Kenar işi:** İşlenen her düğümün komşu listesi taranır. Yönsüz her kenar iki uçtan listelendiği için tam dolaşımda 2m komşu girdisi incelenir. Yönlü listede her kenar başlangıcının listesinde bir kez yer alır; toplam m olur.

```text
Dört odalı örnek:
Düğüm: 4 kez işleme
Komşu girdisi: 2 + 2 + 2 + 2 = 8 inceleme
n = 4, m = 4; 2m = 8
```

**Toplam:** Uygun sabit maliyetli kuyruk ve keşif işlemleriyle komşu listeli tam dolaşım O(n+m) sürer. Kuyruk, mesafe ve ebeveyn için ek alan O(n)'dir; grafın kendisinin alanı ayrıca Θ(n+m)'dir. Python sözlükleri kullanıldığında sabit erişim varsayımı hash davranışına ilişkin olağan beklenen maliyet varsayımıdır.

**Erişilen kısım ayrımı.** Yalnızca keşfedilen düğümlere sözlük kaydı açan kaynak BFS'si, erişilemeyen düğümleri taramayabilir. İş nᵣ erişilen düğüm ve onların aᵣ komşu girdileri için O(nᵣ+aᵣ) olur. Önceden bütün n düğümü başlatmak veya bütün graf dosyasını okumak ayrı bir maliyettir.

**Matrisle:** Her işlenen düğüm için n hücrelik satır taranır. Tam dolaşım Θ(n²) olabilir; m küçük diye satırlar kısalmaz. Bu yüzden algoritma adını söylemek yetmez; kullanılan gösterimi de belirtmeliyiz.

## 13. Bir ok, kimin kime ulaşabildiğini değiştirir

[Ders sayfasındaki örnek 13](../onceki-ders.html#example-13) · [İlgili ders notu](../lecture-notes.html#topic-3-6)

**Problem.** Yönlü kenarlar A → B, B → C ve D → C.

```text
A → B → C ← D
```

**A'dan:** Önce A, sonra B, sonra C keşfedilir. C'nin giden komşusu yoktur; D'ye geçemeyiz. **D'den:** D ve C erişilir; C'den B'ye geri dönemeyiz. **C'den:** Yalnızca C erişilir. Çizimde yakın görünmek yönlü erişim sağlamaz.

| Kaynak | Erişilenler | Mesafeler |
|---|---|---|
| A | A,B,C | 0,1,2 |
| D | D,C | 0,1 |
| C | C | 0 |

**Komşu listesi ne içerir?** Bu BFS'de giden kenarların hedeflerini: A:[B], B:[C], C:[], D:[C]. C'nin listesine B ve D'yi eklemek yönsüz bir model oluşturur; özgün problemi değiştirir. Ters yönde erişim soruluyorsa kenarların ters grafı ayrıca kurulabilir; bu bilinçli bir model dönüşümüdür.

**Bağlantılılık terimleri.** Yönleri yok sayınca bütün bu düğümler bir grupta birleşir; bu, zayıf bağlantılılıktır. Güçlü bağlantılılıkta her düğüm diğerine yönlere uyarak ulaşabilmelidir. Bu örnekte ters yollar olmadığı için dört ayrı tek düğümlü güçlü bileşen vardır. A'dan çıkan erişim kümesi bir güçlü bileşen değildir.

**Ne alınmalı?** Yönsüz bağlı bileşenleri bulmak için kullanılan “keşfedilmemiş düğümden BFS'yi yeniden başlat” yöntemi, yönlü güçlü bileşen algoritması diye kullanılamaz. Önce erişim sorusunun yönlü mü, karşılıklı mı, yönleri yok sayarak mı sorulduğunu belirleyin.

## 14. Ebeveynler keşiften rotaya götürür

[Ders sayfasındaki örnek 14](../onceki-ders.html#example-14) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

**Problem.** A'dan D'ye yalnızca mesafe değil, bir rota istiyoruz. Alfabetik komşu sırasında kayıtlar B←A, C←A, D←B şeklindedir.

```text
Geri takip: D → parent[D]=B → parent[B]=A → None
Ters çevir: A → B → D
Düğüm sayısı 3; kenar sayısı 2
```

**Neden geri gidiyoruz?** Her kayıt hedef düğümün hangi önceki düğümden keşfedildiğini tutar. Bu nedenle D'den başlayıp köke yürümek kolaydır. Yol hedef–kaynak yönünde oluştuğundan kullanıcıya göstermek için ters çevrilir. Yolun düğüm sayısı kenar sayısından bir fazladır.

**Ebeveyn döngüsü neden yok?** Her ebeveynin mesafesi çocuğundan tam bir küçüktür. Geri takipte 2 → 1 → 0 ilerler; aynı mesafeye geri dönen çevrim mümkün değildir. Her erişilen, kaynak dışı düğüm tek ebeveyn aldığından bu bağlantılar kaynak köklü ağaç oluşturur.

**En kısalık gerekçesi.** FIFO, k mesafeli düğümleri k+1 mesafeli düğümlerden önce işler. D'ye iki adımda ulaşmadan önce bir adımlı yol olsaydı A'nın komşuları taranırken zaten bulunurdu. Genel olarak daha kısa yol, hedefin daha erken katmanda keşfini gerektirir.

**Birden fazla doğru rota.** A–C–D de iki kenarlı en kısa yoldur. BFS tüm en kısa yolları saklamak zorunda değildir; bir ebeveyn bir rota verir. D erişilmez olsaydı ebeveyn zinciri uydurulmazdı. A'nın kendisine yolu `[A]`, maliyeti sıfır kenardır; bu geçerli bir özel durumdur.

## 15. İki küçük uygulama kararı sonucu etkiler

[Ders sayfasındaki örnek 15](../onceki-ders.html#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-3)

**Problem A — FIFO yerine derine gitmek:** Kenarlar AB, BC, CD ve AD. A–D doğrudan bir kenarlı yol. Fakat komşu sırasıyla A–B–C–D dalını önce takip eden derinlik öncelikli arama D'yi ilk kez üç kenarlı yoldan bulabilir.

```text
Uzun ilk rota: A → B → C → D   (3 kenar)
En kısa rota:  A → D           (1 kenar)
```

**Bu DFS hatası mı?** Hayır; DFS erişilen düğümleri bulabilir, ancak ilk keşif yolunun en az kenarlı olacağını vaat etmez. BFS'nin en kısa yol sonucu yalnızca “bir arama yapıldı” bilgisinden değil, FIFO katman düzeninden çıkar. Ayrıca her rastgele stack uygulamasının tam bu sırayı oluşturacağı iddia edilmiyor; karşı örnek uzun dalı önce izleyen derinlik öncelikli düzene aittir.

**Problem B — geç işaretleme:** Elmas grafta B ve C, D'ye bağlıdır. B, D'yi kuyruğa ekler ama henüz işaretlemezse C de D'yi yeni sanıp tekrar ekleyebilir. Bu tekrarlar kuyruk boyutunu, ebeveyn atamalarını ve sayımları karmaşıklaştırır.

**Basit çözüm:** İlk keşifte `distance[D]` ve `parent[D]` yaz, sonra kuyruğa ekle. C incelerken D sözlükte bulunduğundan ikinci ekleme yapılmaz. “Bir düğüm, en fazla bir kuyruk girdisi” değişmezi korunur.

**Nüans.** Her geç işaretleme varyantı mutlaka yanlış mesafe verir denemez; tekrarları dikkatli yöneten başka algoritmalar vardır. Ancak bu dersin kısa doğruluk ve O(n+m) açıklaması, keşifte işaretlenen basit BFS sürümüne dayanır.

## 16. İkinci mola — BFS'nin verdiği garantiyi toparlayalım

[Ders sayfasındaki örnek 16](../onceki-ders.html#example-16) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart 122–132. dakikalar arasındaki moladır. Aşağıdaki sorular uygulama ile matematik arasındaki bağı kontrol eder.

**Mesafe sıfır ne anlama gelir?** Kaynağın kendisine ulaşmak için sıfır kenar kullanılır. Erişilemeyen düğüme sıfır mesafe yazılmaz; ayrı bir erişilemedi durumu gerekir.

**Kuyruktaki D neden yeniden eklenmez?** Kuyruğa ilk konduğu anda keşif kaydı yazılmıştır. Henüz işlenmemiş olsa bile yeni değildir.

**BFS ağacı özgün grafın bütün kenarlarını içerir mi?** Hayır. Her erişilen, kaynak dışı düğüme bir ebeveyn kenarı seçer. Diğer kenarlar taranır ama ağaca eklenmek zorunda değildir.

**Ebeveyni B yerine C olan D yanlış mı?** İkisi de A'dan bir adım uzaktaysa ve D'ye kenarları varsa iki seçim de D'ye iki adımlı doğru yol verir. Komşu sırası ebeveyni değiştirebilir, minimum mesafeyi değiştirmez.

**O(n+m) için hangi gösterim kullanıldı?** Komşu listeleri ve uygun kuyruk/keşif işlemleri. Matris satırları taranıyorsa bütün n² hücreye kadar iş çıkabilir.

**Yönlü kenarı ters okuyabilir miyiz?** Hayır. Düğümün çizimde yanında olması veya ona gelen bir ok bulunması, oraya giden bir geçiş olduğunu göstermez. Giden komşuları izlemeliyiz.

## 17. Az kenarlı yol her zaman ucuz yol değildir

[Ders sayfasındaki örnek 17](../onceki-ders.html#example-17) · [İlgili ders notu](../lecture-notes.html#topic-4-5)

**Problem.** A–D doğrudan kenarının maliyeti 10; A–B ve B–D kenarlarının her biri 1.

| Rota | Kenar sayısı | Toplam maliyet |
|---|---:|---:|
| A–D | 1 | 10 |
| A–B–D | 2 | 2 |

**BFS'nin cevabı:** Kenar sayısını küçültmek için A–D. **Maliyeti küçültmenin cevabı:** A–B–D. BFS'de `distance[D]=1` çıktısı “bir kenar” demektir; bir joule, bir metre veya bir milisaniye demek değildir. Ağırlıkları yok sayarsak onların toplamına ilişkin optimumluk bekleyemeyiz.

**Ne zaman amaçlar aynı olur?** Bütün kenarların maliyeti aynı pozitif c ise her rotanın maliyeti `c × kenar_sayısı` olur. Kenar sayısını azaltmak toplam maliyeti de azaltır. Örneğin her kenar 3 birimse bir kenarlı rota 3, iki kenarlı rota 6 birimdir; BFS uygundur.

**Farklı ağırlıklar:** Negatif olmayan kenar maliyetlerinde ağırlıklı en kısa yol için Dijkstra algoritması kullanılabilir. Bu notun amacı Dijkstra'yı uygulamak değil, BFS'nin varsayım sınırını açık tutmaktır. Negatif ağırlıklar başka koşullar gerektirir; sıradan Dijkstra'nın garantisini onlara taşımayın.

**Mühendislik yorumu.** Robotta iki hareket aynı uzunlukta olsa bile enerji veya dönüş maliyetleri farklı olabilir. “Her hücre geçişi bir adım” modeli bilinçli bir sadeleştirmedir. Hedef gerçekten en az enerji ise önce ağırlıkları ve durumu doğru modellemek gerekir; algoritmayı doğru çalıştırmak yanlış modeli düzeltmez.

## 18. Her bağlı grubu bulmak için yeniden başlatmak

[Ders sayfasındaki örnek 18](../onceki-ders.html#example-18) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

**Problem.** Yönsüz kenarlar AB, BC ve DE; F yalıtılmış.

```text
A—B—C        D—E        F
Bileşen 1    Bileşen 2  Bileşen 3
```

**İlk BFS:** A'dan başlayınca A,B,C bulunur. Kuyruk boşalınca bütün graf bitti demeyiz; yalnızca A'nın bağlı grubu bitmiştir. **İkinci BFS:** Genel düğüm listesinde hâlâ keşfedilmemiş D'yi seçeriz; D,E bulunur. **Üçüncü BFS:** F tek başına keşfedilip işlenir. Sonuç üç bağlı bileşendir.

**Neden aynı keşif bilgisi korunur?** Her yeni kaynakta bütün işaretleri silersek A,B,C tekrar tekrar gezilebilir. Dış döngü tüm düğümleri kontrol eder, yalnızca henüz işaretlenmemiş olanlardan yeni BFS başlatır. Her aramanın bulduğu düğümlere aynı bileşen numarası verilebilir.

**Maliyet.** Çok sayıda BFS çağrısı olması, her seferinde bütün grafın tarandığı anlamına gelmez. Gruplar ayrıdır. Her düğüm toplamda bir kez işlenir, her komşu girdisi bir kez incelenir. n = 6, m = 3 örneğinde altı düğüm ve altı yönsüz komşu girdisi vardır. Genel toplam O(n+m), ek işaretleme alanı O(n)'dir.

**Yalıtılmış düğüm de bileşendir.** F'ye kendisinden sıfır kenarla ulaşılır. Başka düğüme bağlanmaması, grafın parçası olmadığı anlamına gelmez. Kenarsız n düğümlü yönsüz grafta n bileşen vardır.

**Kapsam.** Bu yöntem yönsüz bağlı bileşenler içindir. Yönlü erişim kümeleri aynı biçimde bölümlenmeyebilir; güçlü bağlı bileşenleri bulmak için farklı bir algoritma gerekir.

## 19. Her kenar karşıt iki grubu bağlayabilir mi?

[Ders sayfasındaki örnek 19](../onceki-ders.html#example-19) · [İlgili ders notu](../lecture-notes.html#topic-5-2)

**Problem.** Düğümlere iki renk verelim ve her kenarın uçları farklı renk olsun. Böyle bir ayrım mümkünse graf **iki parçalıdır (bipartite)**.

**Kare:** A–B–C–D–A döngüsünde A'yı 0 yap. Komşuları B ve D, 1 olur. C, 0 olur. Her kenar 0 ile 1 arasında; koşul sağlanır.

**Üçgen:** A–B–C–A'da A = 0, B = 1, C = 1. BC kenarı aynı renkte iki düğümü bağlar. C'yi 0'a çevirsek bu kez AC bozulur; iki renk bütün üçgeni sağlayamaz. Bu, tek uzunluklu döngünün yarattığı çelişkinin en küçük örneğidir.

**BFS uygulaması:** Yeni komşuya `1 − mevcut_renk` verilir. Ama yalnızca yeni düğümleri boyamak yetmez. Zaten boyalı komşuların kenarları da kontrol edilmelidir; aynı renkli iki uç bir çelişkidir. BFS ebeveyn ağacı her zaman alternatif renklendirilebilir; hatayı ortaya çıkaran kenar ağaç dışında olabilir.

**Bütün bileşenler:** Bir kaynak grubunun kare olması, başka yerdeki üçgeni aklamaz. Boyasız her düğümden yeniden başlamak gerekir. Böylece komşu listeleriyle toplam O(n+m) kontrol yapılır. Renk tablosu ve kuyruk O(n) alan kullanır.

**Sınırlar.** Kenarsız graf iki parçalıdır; çelişki koyan kenar yoktur. Yalıtılmış düğümü iki gruptan herhangi birine koyabiliriz. Kendi üzerine kenar olsaydı düğümün kendisinden farklı renk olması gerekirdi; mümkün değildir. Bu haftanın kare ve üçgen örneklerinde kendi üzerine kenar yoktur.

## 20. Izgara, hareket kuralı tanımlanmış bir graftır

[Ders sayfasındaki örnek 20](../onceki-ders.html#example-20) · [İlgili ders notu](../lecture-notes.html#topic-6)

**Problem.** Görsel üç satır, dört sütun kullanıyor. Başlangıç S = (0,0), hedef T = (0,3). (0,1) ve (1,1) hücreleri engel. Satır ve sütunlar 0'dan başlıyor.

```text
      sütun 0  1  2  3
satır 0     S  ×  ·  T
satır 1     ·  ×  ·  ·
satır 2     ·  ·  ·  ·
```

**Graf modeli.** Her serbest hücre bir düğüm. Yalnızca yukarı, aşağı, sağ ve sol komşulara, iki hücre de serbestse kenar var. Çapraz hareket yok; dış sınıra taşmak yok. Her izinli adımın maliyeti 1.

**Görseldeki kısa rota:**

```text
(0,0) → (1,0) → (2,0) → (2,1)
      → (2,2) → (1,2) → (0,2) → (0,3)
```

Sekiz hücreden geçilir ama **yedi hareket** yapılır. Engel sütununu aşmak için 2 numaralı satıra (en alt satıra) inmek, sağ tarafa geçip tekrar yukarı çıkmak gerekir. Aynı uzunlukta başka rotalar da olabilir; komşu inceleme sırası seçilen ebeveynleri belirler.

**Boş ızgara hesabı:** R×C hücrede n = RC. Yatay kenarlar R(C−1), dikey kenarlar C(R−1); toplam m = R(C−1)+C(R−1). Engelsiz 3×4 için n = 12, m = 17 ve tam matris 144 hücredir. **Engelli görselde** ise iki düğüm ve onlara dokunan altı farklı kenar çıkar: 10 serbest düğüm, 11 kenar kalır. Engelsiz sorunun sayılarıyla görseli karıştırmayın.

**Gerçek robot farkı.** Bu model robotun yönünü, boyutunu veya dönüş maliyetini içermez. Komşular koordinatlardan anlık üretilebilir; büyük matris gerekmez. Eşit adım maliyetinde BFS en az hareketi bulur. Ayak izi ve dönüşler önemliyse durum uzayını ve çarpışma modelini genişletmek gerekir.

## 21. Küçük grafla genel iddiayı sınamak

[Ders sayfasındaki örnek 21](../onceki-ders.html#example-21) · [İlgili ders notu](../lecture-notes.html#topic-7-1)

**İddia 1: “BFS bütün düğümleri ziyaret eder.”** Kenarlar AB ve CD, kaynak A olsun. BFS yalnızca A,B'yi bulur. C,D başka bir bileşendedir. Doğru ifade “kaynaktan erişilebilen bütün düğümleri bulur” şeklindedir. Bütün yönsüz bileşenleri dolaşmak için dış döngüyle yeni kaynaklar gerekir.

**İddia 2: “Bütün BFS ağaçları aynıdır.”** Elmas grafta D'nin ebeveyni B veya C olabilir. A–B–D ve A–C–D iki kenarlıdır. Komşuların incelenme sırası seçimi değiştirebilir. Buna rağmen A:0, B:1, C:1, D:2 mesafeleri graf ve kaynak tarafından belirlenir.

**Neyi karşılaştırmalıyız?** İki çıktının ebeveyn dizisi farklı diye hemen hata demeyin. Her ebeveyn bağlantısı gerçek kenar mı? Kaynağa ulaşıyor mu? Ebeveynin mesafesi çocuğununkinden bir küçük mü? Mesafeler beklenen minimum değerlerle aynı mı? Bunlar sıralama tesadüflerinden daha anlamlı doğrulamalardır.

**Etiket ve çizim.** Alfabetik olarak önce gelmek yakın olmak demek değildir. Düğümleri sayfada yaklaştırmak da kenar sayısını değiştirmez. Editörde kaynağı veya kenarları değiştirirken topolojik bağlantılardan hesap yapın; şeklin görsel uzaklığından değil.

**Kanıt sınırı.** Tek karşı örnek evrensel iddiayı çürütür. Birkaç doğru örnek algoritmayı bütün graflar için kanıtlamaz. BFS'nin genel gerekçesi FIFO katman düzeni, ilk keşifte işaretleme ve sonlu sayıdaki düğüm/kenarın işlenmesine dayanır.

## 22. Çiz, izle ve gerekçelendir

[Ders sayfasındaki örnek 22](../onceki-ders.html#example-22) · [İlgili ders notu](../lecture-notes.html#topic-7-2)

**Problem.** Düğümler A…E; yönsüz kenarlar AB, AC, BD, CD, DE. Kaynak A, komşular alfabetik. Bu görev beş düğümlüdür; editörde ayrıca F tutuluyorsa F ayrı, yalıtılmış bir düğüm olarak kalır.

| Düğüm | İlk keşfeden | Mesafe | İşleme sonrası kuyruk |
|---|---|---:|---|
| A | Kaynak | 0 | [B,C] |
| B | A | 1 | [C,D] |
| C | A | 1 | [D] |
| D | B | 2 | [E] |
| E | D | 3 | [] |

**İlk sonuç:** Keşif sırası A,B,C,D,E. E'nin geri ebeveyn zinciri E–D–B–A; ileri rota A–B–D–E, üç kenar. A–C–D–E de aynı uzunluktadır, fakat bu komşu sırası ilk rotayı seçer.

**DE silinirse:** E düğümü varlığını korur ama A'dan erişilemez. A,B,C,D mesafeleri 0,1,1,2 olarak kalır. E için eski mesafe 3 ve eski ebeveyn D tutulmamalı; yeni çalıştırma yeni grafın durumunu hesaplamalıdır. Baştan çalışan örnek, önceki keşif sözlüklerini yeniden başlatır.

**Sayım:** Başlangıçta n = 5, m = 5. Dereceler A:2, B:2, C:2, D:3, E:1; toplam 10 komşu girdisi. Tam bağlantılı BFS bunların hepsini inceler. Ebeveyn ağacı AB, AC, BD, DE olmak üzere dört kenar içerir; CD incelenmiş ama keşif kenarı olmamıştır.

**Sonuçların anlamı.** Kaynakla bağlantılı n düğümlü grafın BFS ağacı n−1 ebeveyn kenarı tutar. Özgün graf daha fazla kenara sahip olabilir. İyi cevap grafın türünü, saklama biçimini, kaynak ve komşu sırasını, kuyruk izini, mesafe ile ebeveynleri ve sayılan işlemleri birlikte açıklar.

