# AA · 7. Hafta — 28 örneğin Türkçe teknik açıklaması

Bu notlar **“Recursion and sorting”** dersindeki 28 kartı aynı sırayla açıklar. Her bölümde problemi küçük bir örnek üzerinde izliyor, adımların neden doğru olduğunu açıklıyor ve hangi işi saydığımızı belirtiyoruz. 14 ve 21 numaralı kartlar moladır; burada cevaplı tekrar bölümleridir. Açıklamalar doğrudan görünür; okumak için menü açmak gerekmez.

## Başlamadan: bu haftanın dili

- **Özyineleme (recursion):** Bir problemin çözümünde aynı türde daha küçük problemlerin çözümlerini kullanmak. **Taban durum (base case):** Yeni çağrı yapmadan cevap verilen küçük durum.
- **T(n):** n büyüklüğündeki girdinin işlem maliyeti. Gerçek saniye olmak zorunda değildir; belirlenmiş bir işlem sayısını modelleyebilir.
- **Yerel iş:** Bir çağrının, alt çağrıların yaptığı işi dışarıda bıraktığımızda kendi yaptığı iş. Aynı işi iki kez saymamak için bu ayrım önemlidir.
- **log₂ n:** n'yi yaklaşık kaç kez yarıya indirerek 1'e ulaşabileceğimizi anlatır. 8 → 4 → 2 → 1 için üç yarılama vardır. **floor:** Aşağı yuvarlama; floor(3,5) = 3. **ceiling:** Yukarı yuvarlama; ceiling(3,5) = 4.
- **O(f(n)):** Büyüme için üst sınır. **Ω(f(n)):** Alt sınır. **Θ(f(n)):** İki sınırın birlikte verdiği sıkı büyüme mertebesi. Bunlar tek başına “en kötü durum” demek değildir; hangi durumun maliyetinden söz ettiğimizi ayrıca belirtiriz.
- **Kararlı sıralama (stable sort):** Tam sıralama anahtarları eşit kayıtların girişteki göreli sırasını korur. Anahtar, sıraladığımız bilgi; kayıt ise onunla birlikte taşınan kimlik, zaman veya başka alanlardır.
- **n!:** n faktöriyel; 1×2×…×n. Örneğin 3! = 6. n farklı kaydın olası diziliş sayısıdır.

**Sayım anlaşması:** Anahtar karşılaştırması, çıktıya yazma, takas ve çağrı sayısı birbirinden farklıdır. Sekiz değer yazmak sekiz karşılaştırma yapmak anlamına gelmez. Kodda bir döngü bulunması da o döngünün bir kez çalıştığı anlamına gelmez.

## 1. Hangi soruyu cevapladığımızı unutmayalım

[Ders sayfasındaki örnek 1](../#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** “Sıradaki minimum hangisi?”, “70 numaralı kayıt nerede?” ve “bütün kayıtları sırayla ver” farklı sorulardır. Önceki haftaların veri yapıları bu soruların farklılarına odaklanıyordu.

| İhtiyaç | Yararlı düzen | Önemli koşul |
|---|---|---|
| Tekrar tekrar minimum | Min-heap | Çıkarma sonrası onarım gerekir |
| Tam anahtarla bulma | Hash tablosu | Beklenen hız dağılım ve doluluğa bağlı |
| Sıralı sorgular | Dengeli BST | Sıradan BST kendiliğinden dengeli değildir |
| Sabit veriyi sıralı okumak | Sıralanmış dizi | Önce sıralama bedeli ödenir |

**Küçük karşılaştırma.** `[1,3,2]` geçerli min-heap'tir: 1, iki çocuğundan da büyük değildir. Fakat sıralı dizi değildir; 3, 2'den önce gelir. İkili arama için gerekli “bir taraftaki bütün değerler daha küçük” bilgisi yoktur. Kökün minimum olması bu eksikliği gidermez.

**Bu haftanın yeni hedefi:** Bütün koleksiyonu artan sıraya getirmek. Minimumu bir kez bulmaktan daha fazla bilgi üretiriz. Bu nedenle tek minimumun doğrusal zamanda bulunması, bütün sıralamanın da aynı maliyette yapılabildiğini göstermez.

**Kontrol ve cevap.** Hash tablosunu dolaşınca sayılar otomatik artan gelir mi? Hayır. Anahtarların sayısal sırası hash dağılımının amacı değildir. Sıralı çıktı gerekiyorsa ayrıca sıralamak veya uygun sıralı yapı kullanmak gerekir. İşleme uygun veri yapısı seçmek, algoritma adı ezberlemekten önce gelir.

## 2. Büyümenin adını koymadan önce eylemleri saymak

[Ders sayfasındaki örnek 2](../#example-2) · [İlgili ders notu](../lecture-notes.html#topic-0-3)

**Problem.** Sekiz kartlık bir grubu iki şekilde küçültelim.

```text
Yarıya indir: 8 → 4 → 2 → 1                 : 3 küçültme
Bir çıkar:   8 → 7 → 6 → 5 → 4 → 3 → 2 → 1 : 7 küçültme
```

**İlk sayı neyi anlatır?** Üç, yalnızca bir küçülme yolundaki adım sayısıdır. Bütün bir sıralama algoritmasının toplam işi değildir. Her seviyede sekiz kartla işlem yapılıyorsa üç seviye boyunca 8+8+8 = 24 kart işlemi vardır. “Derinlik logaritmik” ile “toplam iş logaritmik” aynı iddia değildir.

**Genelleme.** n = 2^k ise k kez yarılama sonunda 1 kalır; k = log₂ n. Her seferinde bir çıkarırsak n−1 küçültme gerekir. Dolayısıyla iki yöntemin yol uzunlukları sırasıyla Θ(log n) ve Θ(n) büyür. Fakat adım başına iş değişiyorsa toplam maliyet bu sayılarla ayrıca birleştirilmelidir.

**Tek sayılarda ne olur?** Yedi elemanı ikiye bölerken 3 ve 4 elde ederiz. Küçük taraf floor(7/2), büyük taraf ceiling(7/2)'dir. Kesirli eleman saklamıyoruz; bölme kuralını açıkça belirtiyoruz.

**Kontrol ve cevap.** n iki katına çıkınca yarılama yoluna yaklaşık bir adım eklenir. Ama her seviyede işlenen toplam kayıt da iki katına çıkabilir. Bu nedenle sadece seviyelerin azlığına bakarak hız kararı verilemez. Önce “neyi sayıyorum?” sorusuna cevap verin: yol mu, bütün düğümler mi, karşılaştırma mı, yazma mı?

## 3. Özyineleme, daha küçük aynı soruyu çözmektir

[Ders sayfasındaki örnek 3](../#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

**Problem.** `[A,B,C,D]` içindeki parçaları sayalım. İlk parçayı ayırıp kalanların sayısına 1 ekleyebiliriz.

```text
say(A,B,C,D) = 1 + say(B,C,D)
say(B,C,D)   = 1 + say(C,D)
say(C,D)     = 1 + say(D)
say(D)       = 1 + say(boş)
say(boş)     = 0
Dönüşler: 0 → 1 → 2 → 3 → 4
```

**Bekleyen iş.** İlk çağrı cevabı hemen veremez; kalan üç parçanın sayısını bekler. Her çağrının “cevap gelince 1 ekle” işi vardır. Taban durum 0 döndürünce cevaplar ters yönde, çağrı yığını boyunca geri taşınır. Dört parça için boş durum dahil beş çağrı vardır; dört toplama yapılır.

**Bitmenin iki şartı.** Ulaşılabilir bir taban durum olmalı ve her alt çağrı ona doğru ilerlemelidir. Her seferinde aynı listeyle yeniden çağırmak ilerleme sağlamaz. Sonuç gelmeden yeni çağrılar birikir; uygulama çağrı sınırına ulaşabilir.

**Maliyet uygulamaya bağlıdır.** Kalan kısmı indeksle temsil eder ve çağrı başına sabit iş yaparsak toplam süre Θ(n), bekleyen çağrılar için alan O(n)'dir. Python listesini her seferinde `values[1:]` ile kopyalarsak kopyalanan uzunluklar n−1, n−2, … olur; bu ek iş toplamı karesel büyüyebilir. Küçük problem tanımlamak ile onu bellekte bedelsiz oluşturmak aynı şey değildir.

**Ne alınmalı?** Bu, özyinelemeyi anlamak için bir modeldir. Listeyi saymak için döngü genellikle daha basittir. Özyineleme tek başına hızlandırma değildir; problemi nasıl böldüğümüz belirleyicidir.

## 4. Eylemleri maliyet bağıntısına çevirmek

[Ders sayfasındaki örnek 4](../#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

**Problem.** T(n), n eleman için gereken işi temsil etsin. Bir çağrıda kaç alt çağrı yapılıyor, bunların boyutu ne, çağrının kendisi başka ne yapıyor?

| Yapılan iş | Maliyet modeli |
|---|---|
| Bir yarıyı çöz, sabit yerel iş yap | T(n) = T(n/2) + Θ(1) |
| İki yarıyı çöz, n elemanı birleştir | T(n) = 2T(n/2) + Θ(n) |
| Bir eleman azalt, kalan soruyu çöz, n eleman tara | T(n) = T(n−1) + Θ(n) |

**Katsayıyı doğru okuyun.** `2T(n/2)` içindeki 2, iki alt çağrıyı sayar. Kodda iki döngü bulunması otomatik olarak bu terimi vermez. Döngüler yerel iş olabilir. Alt çağrılardan biri hiç yapılmıyorsa yine iki yazamayız.

**Yerel işi ayırın.** Birleştirme bütün n çıktıyı yazıyorsa doğrusal katkı vardır. Yalnızca tek değeri karşılaştırmak sabit iş olabilir. Alt çağrıların iç işini yerel terime yeniden eklemek aynı maliyeti iki kez sayar.

**Taban durum:** Örneğin T(1) = sabit. Bağıntı tek başına sonsuza kadar açılmaz; nerede durduğu belirtilmelidir. Tek sayılar için iki parça T(floor(n/2)) ve T(ceiling(n/2)) olarak yazılır. İkili kuvvet girdileri, başlangıç çizimlerini sadeleştirir.

**O ile Θ ayrımı.** Sayfada bir yarı ve `O(1)` yerel iş bir üst sınır modeli olarak veriliyor. Her çağrının gerçekten sabit pozitif iş yaptığını da biliyorsak sıkı sonuç için Θ(1) yazabiliriz. Yalnızca bir üst sınırdan bütün durumlar için kesin işlem sayısı türetemeyiz.

## 5. İki sıralı satırı birleştirmek

[Ders sayfasındaki örnek 5](../#example-5) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

**Problem.** Sol `[2,5,8]`, sağ `[1,4,9]`. İki satırın da zaten sıralı olduğu veriliyor. Her satırdaki ilk okunmamış değeri bir aday olarak tutuyoruz.

| Karşılaştırma | Seçim | Çıktı |
|---|---|---|
| 2 ve 1 | Sağdan 1 | [1] |
| 2 ve 4 | Soldan 2 | [1,2] |
| 5 ve 4 | Sağdan 4 | [1,2,4] |
| 5 ve 9 | Soldan 5 | [1,2,4,5] |
| 8 ve 9 | Soldan 8 | [1,2,4,5,8] |
| Sol bitti | Kalan 9'u kopyala | [1,2,4,5,8,9] |

**Neden yalnızca öndekiler?** Sıralı satırın daha gerisinde öndekinden küçük değer yoktur. Dolayısıyla bütün kalanların minimumu iki ön adaydan biridir. Küçüğünü seçmek, sıradaki doğru çıktıyı verir. Seçilen satırın indeksi ilerler; diğer aday sonraki karşılaştırmada yerinde kalır.

**Değişmez.** Üretilmiş çıktı sıralıdır ve girdilerden tüketilen kayıtları doğru sırada içerir. Her adım buna bir sonraki minimumu ekler. Bir satır bitince diğerinin kalanı zaten sıralıdır; yeni anahtar karşılaştırması olmadan kopyalanabilir.

**Maliyet.** Bu örnekte beş anahtar karşılaştırması, altı çıktı yazması vardır. Uzunluklar a ve b ise iki satır da boş değilken en fazla a+b−1 karşılaştırma, yeni çıktı oluştururken a+b yazma gerekir. Toplam süre Θ(a+b), çıktı alanı O(a+b). Sırasız iki satıra bu yöntemi uygulamak sıralama garantisi vermez.

## 6. Merge sort: böl, çöz, birleştir

[Ders sayfasındaki örnek 6](../#example-6) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

**Problem.** `[7,2,5,1]` sıralanacak. Tek eleman zaten sıralı olduğundan büyük problemi tek elemanlı parçalara kadar küçültebiliriz.

```text
                 [7,2,5,1]
                 /       \
              [7,2]     [5,1]
              /  \       /  \
            [7]  [2]   [5]  [1]
               ↓           ↓
             [2,7]       [1,5]
                  \       /
                  [1,2,5,7]
```

**Geri dönüş sırası.** Sol yarı özyinelemeli olarak sıralanır, sağ yarı sıralanır; bu iki cevap geldikten sonra merge yapılır. Henüz sıralanmamış yarıları birleştirmeye çalışmak, birleştirmenin ön koşulunu bozar. Uzunluğu 0 veya 1 olan liste yeni bölme yapmadan döner.

**Somut hesap.** `[7]` ile `[2]` için bir karşılaştırma ve iki yazma; `[5]` ile `[1]` için aynı. Son birleşmede 2–1, 2–5, 7–5 karşılaştırılır; kalan 7 kopyalanır. Toplam beş anahtar karşılaştırması ve sekiz birleştirme çıktısı yazması vardır. Bunlar dilimleme ve çağrı işleri hariç sayılardır.

**Python ayrıntısı.** Dersteki uygulama dilimler ve yeni çıktı listesi kullanır; giriş listesini değiştirmez. Birleştirmede ön elemanı `pop(0)` ile silmek yerine indeksler ilerletilir. Python listesinde baştan silme, kalan elemanları kaydırdığı için tekrarlanan doğrusal masraf yaratabilir.

**Kararlılık.** Anahtarlar eşitse sol yarıdaki kayıt önce alınır. Sol yarı girişte önce geldiği ve iki alt çözüm de kararlı olduğu için eşit kayıtların göreli sırası korunur. Standart bu uygulama Θ(n log n) süre ve O(n) tepe yardımcı alan kullanır; yerinde sıralama değildir.

## 7. Birleştirme işini seviye seviye saymak

[Ders sayfasındaki örnek 7](../#example-7) · [İlgili ders notu](../lecture-notes.html#topic-2-3)

**Problem.** Sekiz değeri dengeli bölüp birleştiriyoruz. Her seviyede kaç eleman çıktıya yazılır?

| Birleştirme seviyesi | İşler | Toplam yazma |
|---|---|---:|
| En alt | Dört adet 2 elemanlı sonuç | 8 |
| Orta | İki adet 4 elemanlı sonuç | 8 |
| En üst | Bir adet 8 elemanlı sonuç | 8 |

**Toplam:** 8+8+8 = 24 birleştirme yazması. Küçük problemler çoğalıyor ama bir seviyedeki toplam eleman sayısı değişmiyor. Bu yüzden yalnızca en üstteki sekiz yazmayı saymak eksik; alt birleştirmeler de yapılmıştır.

**Genel sonuç.** n ikinin kuvvetiyse tek elemandan n elemana ulaşmak log₂ n birleştirme seviyesi gerektirir. Her seviyede n yazma olduğundan modelin tam sayısı n log₂ n'dir. Dört elemanda iki seviye ve sekiz yazma vardır. Tek sayılı bölmelerde seviyeler tam eşit görünmeyebilir; asimptotik Θ(n log n) sonucu değişmez.

**Neleri dışarıda bıraktık?** Bu sayı kesin karşılaştırma sayısı değildir. Bir satır erken biterse daha az karşılaştırma olur ama bütün çıktı yine yazılır. Dilim kopyaları, liste tahsisi ve taban durumdaki kopyalar bu özel 24 sayısına dahil değildir. Bunları eklemek standart uygulamanın büyüme sınıfını değiştirmez.

**Bellek ayrımı.** İşlem boyunca toplam yazılan veri n log n olabilir; aynı anda tutulması gereken yardımcı veri O(n) olabilir. Toplam işlem hacmi ile aynı anda kullanılan en yüksek bellek miktarı farklı ölçülerdir.

## 8. İki kümenin ortak kimliği var mı?

[Ders sayfasındaki örnek 8](../#example-8) · [İlgili ders notu](../lecture-notes.html#topic-2-4)

**Problem.** Sıralı kimlikler A = `[1,4,7]`, B = `[2,4,9]`. Bütün çiftleri denemek yerine iki indeksle ilerleyebiliriz.

```text
A: 1  4  7       B: 2  4  9
   ↑                ↑        1 < 2 → A'yı ilerlet
      ↑             ↑        4 > 2 → B'yi ilerlet
      ↑                ↑     4 = 4 → ortak kimlik bulundu
```

**Atlamanın gerekçesi.** A'nın mevcut değeri 1, B'nin mevcut değeri 2. B sıralı olduğundan incelenmemiş diğer B değerleri de en az 2'dir. 1, bunların hiçbiriyle eşleşemez; güvenle atılır. Sonraki adımda aynı düşünce B'deki 2 için kullanılır.

**Durma koşulları.** Eşitlik bulunursa evet/hayır sorusu cevaplanır; bütün ortakları aramıyorsak durabiliriz. Bir taraf tükenirse ve eşitlik hiç bulunmamışsa kümeler ayrıktır. Önceden atlanan değerlerin eşleşemeyeceğini her adımda gerekçelendirdiğimiz için geride kaçırılmış aday kalmaz.

**Maliyet.** Her adım en az bir indeksi ileri taşır; hiçbir indeks geriye dönmez. Toplam tarama O(a+b), ek çalışma alanı O(1)'dir. Girdiler başlangıçta sıralı değilse sıralama bedeli ayrıca eklenir. Hash kümesi kullanmak uygun varsayımlarla beklenen doğrusal süreli başka bir çözümdür, fakat ek alan ister.

**Görevi değiştirmeyin.** “Ortak bir kimlik var mı?” ile “tekrar adetlerini de koruyarak bütün ortak kayıtları listele” farklıdır. İkinci görevde eşitlikte indekslerin ve tekrarların nasıl ilerletileceği ayrıca tanımlanmalıdır.

## 9. Birleştirmede üç yaygın hata

[Ders sayfasındaki örnek 9](../#example-9) · [İlgili ders notu](../lecture-notes.html#topic-2-5)

**Hata 1 — yan yana koymak.** `[2,7]` ile `[1,5]` birleştirilince sonuç `[1,2,5,7]` olmalıdır. Sadece listeleri art arda eklemek `[2,7,1,5]` verir; 7 → 1 geçişi sıralamayı bozar. İki listenin kendi içinde sıralı olması, ilk listenin bütün değerlerinin ikinci listeden küçük olduğu anlamına gelmez.

**Hata 2 — eşitlikte kayıtları karıştırmak.** Soldaki `2A` ve sağdaki `2B` etiketlerinde sıralama anahtarı 2; A ve B kayıt kimlikleridir. Kararlı birleştirmede soldaki 2A önce alınır. Eşitlikte sağdan almak sayısal sıralamayı bozmayabilir, fakat başlangıç sırasını koruma sözünü bozabilir. Sadece sayıları taşımak da kaydın diğer alanlarını kaybettirir.

**Hata 3 — kalanları unutmak.** `[1]` ile `[2,3]` için önce 1 seçilir. Sol bitti diye algoritmanın çıktısı yalnızca `[1]` olamaz; 2 ve 3 de eklenmelidir. Bir taraf boşken anahtar karşılaştırması bitmiştir, veri aktarma işi bitmemiştir.

**Kontrol ve cevap.** Boş liste ile `[1,2,3]` birleştirilirse sıfır anahtar karşılaştırması yapılabilir. Ama yeni bir sonuç listesi üretiyorsak üç çıktı yazması gerekir. Aynı listeyi doğrudan döndüren veya bağlantıları yeniden kullanan başka uygulamalar farklı maliyet ayrıntılarına sahip olabilir. İşlem sayısını söylemeden önce hangi uygulamayı anlattığımızı belirlemeliyiz.

## 10. Özyineleme ağacı, işin haritasıdır

[Ders sayfasındaki örnek 10](../#example-10) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

**Problem.** `T(n) = 2T(n/2) + n` modelini n = 8 için çizelim. Her düğüm bir alt problemi, etiketi ise yalnızca o çağrının yerel işini göstersin.

```text
Boyutlar / yerel iş:
                 8                 → toplam 8
             4       4             → toplam 8
           2   2   2   2           → toplam 8
          1 1 1 1 1 1 1 1         → sekiz taban durum
```

**Çifte sayımı önleyin.** Köke 8 yazmak bütün algoritmanın T(8) maliyetini yazmak değildir. Yalnızca o seviyedeki bölme/birleştirme gibi yerel katkıdır. Alt çağrıların işi aşağıdaki düğümlerde sayılır. Köke T(8) yazıp altları da toplamak aynı işi tekrar sayar.

**Yatay, sonra dikey topla.** Önce her seviyenin katkısını buluruz: 8, 8, 8. Sonra seviyeleri toplarız. Bu iç seviyeler 24 birim verir. Her taban durumun maliyeti tam 1 seçilirse sekiz yaprak 8 daha ekler ve bu özel model T(8) = 32 verir.

**Model ile program aynı sayaç değildir.** Bu 32, önceki bölümün 24 birleştirme yazmasıyla çelişmez: burada taban maliyetini de ekledik. Gerçek kodda yerel iş tam n değil Θ(n) ise kesin 32 sayısı verilmez; büyüme sonucu Θ(n log n) olarak kalır.

**Ne alınmalı?** Derinlik, düğüm sayısı ve düğüm başına maliyet ayrı ayrı görülmelidir. Çok sayıda küçük düğüm, az sayıda büyük düğüm kadar toplam iş üretebilir.

## 11. Bir eleman azaltmak yarıya indirmek değildir

[Ders sayfasındaki örnek 11](../#example-11) · [İlgili ders notu](../lecture-notes.html#topic-3-2)

**Problem.** `T(n) = T(n−1) + n`, T(1) = 1. Her çağrı bir küçük probleme iner ama yerel olarak mevcut boyut kadar iş yapar.

```text
T(5) = T(4) + 5
     = T(3) + 4 + 5
     = T(2) + 3 + 4 + 5
     = 1 + 2 + 3 + 4 + 5 = 15
```

**Neden karesel?** Toplam `1+2+…+n = n(n+1)/2`. Terimleri baştan ve sondan eşleştirirsek her çift n+1 verir; toplam formülü buradan anlaşılabilir. Açılmış formülün baskın terimi n²/2 olduğundan büyüme Θ(n²)'dir. Sadece “her çağrıda bir döngü var” demek bu toplamı açıklamaz; döngü uzunlukları n, n−1, … şeklindedir.

**Derinlik.** Her seferinde bir eksilttiğimiz için n = 5'te taban dahil beş çağrı vardır. Genelde derinlik Θ(n)'dir; yarı yarıya bölmedeki logaritmik derinlik yoktur. Bekleyen çağrılar da basit özyinelemeli uygulamada O(n) alan kullanabilir.

**Kesin sayıların varsayımı.** 15 sonucu yerel işin tam n, taban işinin tam 1 olduğu modele aittir. Yerel iş 3n+2 olsaydı kesin toplam değişirdi; yine Θ(n²) olurdu. Asimptotik ifade ayrıntılı sayacın yerine geçmez.

**Kontrol ve cevap.** T(6) = 6+5+4+3+2+1 = 21. Tek bir kez problemi çok az küçültmek kareselliği kanıtlamaz; burada bu küçük azalma her çağrıda tekrarlandığı için uzun maliyet zinciri oluşur.

## 12. Önerdiğimiz formülü nasıl doğrularız?

[Ders sayfasındaki örnek 12](../#example-12) · [İlgili ders notu](../lecture-notes.html#topic-3-3)

**Problem.** Önceki bağıntı için `T(n) = n(n+1)/2` öneriyoruz. Birkaç sayıda doğru çıkması yeterli değildir. Başlangıcı ve genel geçişi kontrol edeceğiz.

**Başlangıç:** n = 1 için `1×2/2 = 1`; T(1) ile aynı. **Tümevarım varsayımı:** Bir küçük boyutta formülün doğru olduğunu kabul edelim: `T(n−1) = (n−1)n/2`.

```text
T(n) = T(n−1) + n
     = (n−1)n/2 + n
     = (n² − n + 2n)/2
     = (n² + n)/2
     = n(n+1)/2
```

**Bu neden döngüsel bir iddia değil?** n için doğru olduğunu varsaymadık; daha küçük n−1 için doğru olduğunu kullanıp n için gösterdik. Başlangıç doğruysa 1'den 2'ye, 2'den 3'e ve bütün pozitif tam sayılara zincir kurulur.

**Sadece taban yetmez.** Örneğin `T(n)=n` de n = 1'de 1 verir ama T(2)=T(1)+2=3 koşulunu sağlamaz. Başlangıç noktasıyla uyuşmak bütün bağıntıyla uyuşmak değildir.

**Üst sınır kanıtlarken:** Tam eşitlik yerine uygun sabitlerle eşitsizlik kullanırız. Örneğin c·n² gibi bir önerinin alt çağrıya yerleştirildiğinde yine sınır içinde kaldığını kontrol ederiz; küçük başlangıç değerleri de sağlanmalıdır. Formülü tahmin etmek ile bütün izin verilen n değerlerinde doğrulamak iki ayrı aşamadır.

## 13. Üç bağıntı, üç farklı sonuç

[Ders sayfasındaki örnek 13](../#example-13) · [İlgili ders notu](../lecture-notes.html#topic-3-4)

**Problem.** Alt problemlerin yarı boyutlu olması, tek başına toplam maliyetin aynı olmasını sağlamaz. Çağrı sayısı ve yerel katkı da belirleyicidir.

| Bağıntı | n = 8 için seviye işleri | Büyüme |
|---|---|---|
| T(n)=T(n/2)+1 | 1,1,1,1 | Θ(log n) |
| T(n)=2T(n/2)+1 | 1,2,4,8 | Θ(n) |
| T(n)=2T(n/2)+n | 8,8,8; yapraklarda 8 | Θ(n log n) |

**Bir yol:** İlk modelde her seviyede yalnızca bir çağrı vardır. **Dallanan ağaç:** İkincide çağrı sayısı ikiye katlanır; sabit iş yapan toplam 2n−1 düğüm oluşur. n = 8 için 15 birim. **Pahalı birleştirme:** Üçüncüde her düğüm kendi boyutu kadar yerel iş yapar; iç seviyelerde toplam n sabit kalır.

**Master teoremi nerede kullanılır?** `aT(n/b)+f(n)` biçimindeki belirli bağıntıları, teoremin varsayımları altında çözmek için bir araçtır. a çağrı sayısı, b küçülme katsayısı, f yerel iştir. `T(n−1)+n` aynı biçimde değildir; sırf özyinelemeli diye bu kalıba zorlanmaz.

**Koşullar.** Taban maliyetleri sabit pozitif, başlangıç boyutları açıklama için ikinin kuvvetidir. Uygun floor/ceiling bölmeleri temel büyüme sonuçlarını değiştirmez. Buradaki kesin seviye sayıları ile eşitsiz bölmeli bir çizimi karıştırmayın.

**Kontrol ve cevap.** Merge sort üçüncü kalıba uyar: iki yarıyı çözer ve lineer birleştirme yapar. “İki çağrı var, demek iki kat yavaş” gibi tek katsayılı bir yorum yerine bütün çağrı ağacını değerlendirin.

## 14. İlk mola — bölmek, birleştirmek ve saymak

[Ders sayfasındaki örnek 14](../#example-14) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart ilk on dakikalık moladır. Aşağıdaki cevaplar, ilk bölümün sık karışan noktalarını toparlar.

**Üç yarılama, üç toplam işlem midir?** Hayır. Üç yalnızca bir yolun küçülme sayısı olabilir. Her seviyede sekiz kayıt işleniyorsa toplam 24 kayıt işlemi vardır.

**Merge neden sadece öndeki iki değere bakar?** Her giriş satırı zaten sıralıdır. Bir satırın gerisinde, kendi ön değerinden küçük aday bulunmaz. İki önün küçüğü bütün kalanların minimumudur.

**Bir taraf boşalınca iş tamamen biter mi?** Anahtar karşılaştırmaları bitebilir ama diğer tarafın kalan değerleri çıktıya yazılmalıdır. Boş liste ile üç elemanı birleştirmek yeni çıktı oluşturuyorsa üç yazma gerektirir.

**Özyineleme neden durur?** Bir taban duruma ulaşılır ve her çağrı boyutu bu duruma doğru küçültür. Aynı boyutu tekrar çağırmak bu ilerlemeyi sağlamaz.

**n−1 ile n/2 farkı neden büyük?** İlki doğrusal derinlikte zincir, ikincisi tek yol üzerinde logaritmik derinlik oluşturur. Fakat bütün maliyet için dal sayısı ve yerel işler de sayılmalıdır.

**Bir formülün üç örnekte doğru çıkması kanıt mı?** Hayır. Sayılar tahmin üretir. Genel doğruluk için taban durum ve bütün geçerli boyutlar arasında çalışan mantıksal geçiş gerekir.

## 15. Bir pivotun etrafında bölmek

[Ders sayfasındaki örnek 15](../#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

**Problem.** `[4,1,5,2,3]` için son değer 3 pivot. Görselin belirli yöntemi: solda pivot'tan **kesin küçük** değerleri biriktir, diğerlerini sağda bırak, son adımda pivotu araya koy.

```text
Başlangıç, sınır 0: [4,1,5,2,3]
4 < 3 yanlış:      [4,1,5,2,3]
1 < 3 doğru:      [1,4,5,2,3]  sınır 1
5 < 3 yanlış:      [1,4,5,2,3]
2 < 3 doğru:      [1,2,5,4,3]  sınır 2
Pivotu sınıra koy: [1,2,3,4,5]
```

**Sınır neyi gösterir?** Pivot'tan küçük bir sonraki değerin konacağı yeri. Taranmış kısımda sınırın solu küçükler, sınır ile tarama noktası arası küçük olmayanlardır. Henüz taranmamış bölüm hakkında karar verilmemiştir. Bir küçük değer gelince sınırdaki değerle takas edilir ve sınır ilerler.

**Sonuçta garanti edilen:** Sol değerler < pivot, sağ değerler ≥ pivot. Bu şemada pivot seçilen sınır konumuna yerleşir; özyineleme bu konumu hariç tutarak iki yanda sürer. Başka partition yöntemlerinin dönüş değeri ve özyineleme sınırları farklı olabilir.

**Tesadüfi sıralılığa aldanmayın.** Bu giriş bir partition sonunda tamamen sıralandı. Ama `[7,2,5,1,4]`, aynı kuralla `[2,1,4,7,5]` olur. Pivot 4 doğru bölmede; sol ve sağ kendi içinde sıralı değil. Bunlar ayrıca çözülmelidir.

**Maliyet.** Beş elemanda pivot dışındaki dört değer birer kez karşılaştırılır. Genel partition işi Θ(n)'dir. Bu yalnızca bir bölme turudur; quicksort'un bütün turlarının toplamı ayrıca hesaplanır.

## 16. Pivot işi dengeli bölebilir veya neredeyse hiç küçültmeyebilir

[Ders sayfasındaki örnek 16](../#example-16) · [İlgili ders notu](../lecture-notes.html#topic-4-2)

**Problem.** Yedi farklı anahtarı sıralıyoruz. Ortanca anahtar pivot olursa üç küçük ve üç büyük değer kalır. En büyük seçilirse altı küçük ve boş bir büyük taraf kalır.

```text
Dengeli:  [1,2,3] |4| [5,6,7]
Uç seçim: [1,2,3,4,5,6] |7| []
```

**Dengeli durum.** Her seviye yaklaşık O(n) tarama işi yapar; yarıya yakın küçülme O(log n) derinlik verir. Bu davranışın toplamı Θ(n log n)'dir. Pivotların tam ortanca olması gerekmez; sürekli yeterince dengeli bölmeler de aynı mertebeyi sağlayabilir.

**Tekrarlanan uç seçimler.** Altı kalan elemanda yine maksimum seçilirse beş, sonra dört kalır. Gösterilen partition her turda kalan pivot dışı değerleri bir kez karşılaştırır:

```text
7 eleman için: 6+5+4+3+2+1 = 21 karşılaştırma
n eleman için: n(n−1)/2 → Θ(n²)
```

**Neden tek kötü tur yeterli değil?** Bir kez dengesiz bölme yapmak yalnızca o turu etkiler. Kalan büyük parça sonradan iyi bölünürse toplam yine iyi olabilir. Karesel örneği üreten şey, uç seçimin uzun süre tekrar etmesidir.

**Koşullar.** 21 sayısı farklı anahtarlar ve her taranan elemanı pivotla bir kez karşılaştıran bu özel şema içindir. Takas, çağrı ve sınır kontrolü sayısı değildir. “Quicksort hızlıdır” yerine pivot ve partition davranışını, girdi dağılımını ve hangi durum maliyetini söylediğimizi belirtmeliyiz.

## 17. Rastgele pivot, giriş sırasına bağımlılığı azaltır

[Ders sayfasındaki örnek 17](../#example-17) · [İlgili ders notu](../lecture-notes.html#topic-4-3)

**Problem.** Artan sıralı farklı anahtarlarda son elemanı sürekli pivot seçmek maksimumu seçer; önceki kötü zincir oluşur. Her alt problemde pivotu mevcut kayıtlardan eşit olasılıkla seçersek giriş sırası artık bunu tek başına zorlayamaz.

**Yedi anahtarda:** Her sıralama derecesinin seçilme olasılığı 1/7. Ortanca derece 4 seçilebilir; ama minimum 1 veya maksimum 7 de seçilebilir. Rastgele seçim “ortancayı seçmek” değildir.

**Beklenen analiz neye göre?** Girdi sabitken algoritmanın rastgele pivot seçimleri üzerinden ortalama alınır. Farklı anahtarlar ve standart uygun partition modeli altında beklenen karşılaştırma sayısı O(n log n)'dir. Bu, her çalıştırmanın bu sınır içinde olduğu anlamına gelmez; şanssız bir dizi uç seçim yine karesel davranabilir.

**Neden iyileşme makul?** Her adımda yalnızca iki uç anahtar en kötü bölmeyi verir; birçok iç anahtar iki tarafta da anlamlı miktarda iş bırakır. Rastgeleliğin bütün turlar üzerindeki analizi beklenen sınırı verir. Yalnızca tek turdaki bu gözlem bütün kanıtın yerine geçmez, fakat mekanizmayı açıklar.

**İki sınır.** Üç adayın ortancasını almak gibi yöntemler pratikte yardımcı olabilir; tek başına en kötü O(n log n) garantisi oluşturmaz. Ayrıca bütün anahtarlar aynıysa rastgele hangi 4'ü seçersek seçelim katı iki yönlü partition aynı dengesizliği üretir. Rastgeleleştirme ile tekrarları doğru ele alma ayrı konulardır.

## 18. Eşit anahtarları ayrıca düşünmek gerekir

[Ders sayfasındaki örnek 18](../#example-18) · [İlgili ders notu](../lecture-notes.html#topic-4-7)

**Problem.** `[4,4,4,4]` dizisinde “pivot'tan küçükse sola al” kuralını kullanalım. Hiçbir değer 4'ten küçük değildir.

```text
İlk tur:  [] |4| [4,4,4] → 3 karşılaştırma
Sonraki:  [] |4| [4,4]   → 2 karşılaştırma
Sonraki:  [] |4| [4]     → 1 karşılaştırma
Toplam: 6
```

**Sorun:** Sayısal olarak hepsi zaten eşit olduğu halde algoritma aynı işi tekrarlar. Pivotu rastgele seçmek değeri değiştirmez; yine 4 seçilir. Bu örnek, farklı anahtarlara ilişkin beklenen süre sonucunu bütün girdilere koşulsuz taşımamamız gerektiğini gösterir.

**Üç yönlü partition:** Kayıtları `< pivot`, `= pivot`, `> pivot` şeklinde üç bölgeye ayırır. Bu girişte eşit bölge dört kaydın tamamıdır, diğerleri boştur. Eşit bölgenin içinde sıralama anahtarları aynı olduğundan bu bölgeye yeniden özyineleme yapılmaz. Tek doğrusal gruplama geçişi yeterlidir.

**Kayıtları atmayın.** Dört adet 4, dört farklı sensör kaydı veya zaman damgası taşıyabilir. Eşit anahtarlar “aynı kaydı dört kez görmüşüz, üçünü silelim” anlamına gelmez. Üç yönlü gruplama bütün kayıtları korumalıdır. Ayrıca tipik yerinde quicksort kararlı değildir; eşit kayıtların göreli sırası değişebilir.

**Görselin kapsamı.** Üç bölge çizimi fikri gösterir. Sayfadaki katı iki yönlü kod, açıklamayı okumakla üç yönlü hale gelmez; uygulama değiştirilmelidir. İki yöntemin karşılaştırma ve sınır kurallarını ayrı izleyin.

## 19. Garantilere ve ölçülen iş yüküne göre seçim

[Ders sayfasındaki örnek 19](../#example-19) · [İlgili ders notu](../lecture-notes.html#topic-4-5)

**Problem.** Merge sort, heapsort ve quicksort arasında tek bir evrensel kazanan yoktur. Süre garantisi, yardımcı alan ve eşit anahtarların sırası birlikte değerlendirilir.

| Yöntem | En kötü süre | Tipik yardımcı alan | Kararlılık |
|---|---|---|---|
| Standart dizi merge sort | Θ(n log n) | O(n) | Eşitlik kuralı doğruysa kararlı |
| Döngülü yerinde heapsort | Θ(n log n) | O(1) | Genel olarak kararsız |
| Basit yerinde quicksort | Θ(n²) olabilir | Çağrı yığınına bağlı | Genel olarak kararsız |

**Quicksort alanı:** Partition dizi içinde takas yapabilir; buna bakıp toplam ek alan O(1) diyemeyiz. Dengeli özyinelemede yığın O(log n), saf ve kötü bölünen uygulamada O(n) olabilir. Küçük tarafı özyinelemeli çözüp büyük tarafı döngüyle sürdürmek, yığın derinliğini O(log n) ile sınırlayabilir. Bu düzenleme karesel karşılaştırma süresini tek başına kaldırmaz.

**Kararlılık gereksinimi:** Aynı not veya zaman damgasına sahip kayıtların geliş sırası önemliyse bunu bir gereksinim olarak yazın. Sadece tamsayı örnekleriyle test etmek bu farkı görünmez yapabilir; kayıtları A, B gibi etiketlerle izlemek faydalıdır.

**Ölçümün sınırı.** Belirli bir dilde, bilgisayarda ve veri kümesinde ölçülen süre bütün sistemler için sıralama vermez. Kütüphaneler birden çok yöntemi birleştirebilir. Üretim kodunda belgelenmiş garantilere ve kendi iş yükünüzün ölçümüne bakın; fonksiyon adından uygulamayı tahmin etmeyin.

## 20. Somun ve cıvataları yalnızca çapraz karşılaştırmayla eşlemek

[Ders sayfasındaki örnek 20](../#example-20) · [İlgili ders notu](../lecture-notes.html#topic-4-6)

**Problem.** İki somunu veya iki cıvatayı doğrudan karşılaştıramıyoruz. Yalnızca bir somunla bir cıvatayı deneyip küçük, eşit veya büyük sonucunu alabiliyoruz. Her boyuttan tek somun ve tek eş cıvata olduğunu varsayıyoruz.

**Sayfadaki küçük örnek:** Somunlar N3,N1,N2; cıvatalar B2,B3,B1. Sayılar öğrenmek için gösterilen gizli boyut etiketleri; algoritmanın doğrudan okuyup sıralayabildiği anahtarlar değiller.

1. N2 somununu pivot seç.
2. N2'yi bütün cıvatalarla çapraz karşılaştır. Küçük grup B1, eş B2, büyük grup B3 bulunur.
3. Bulunan B2'yi diğer somunlarla karşılaştır. Küçük grup N1, eş N2, büyük grup N3 oluşur.
4. Küçük somunlarla küçük cıvataları, büyük somunlarla büyük cıvataları aynı yöntemle eşleştir.

**Neden önce eş cıvata?** Pivot somunu diğer somunlarla karşılaştırmak yasak. Eş cıvata aynı boyut sınırını diğer koleksiyona uygulamak için izin verilen aracı sağlar. Böylece iki grubu aynı boyutta bölen karşılıklar kurulur.

**Doğruluk ve maliyet.** Eşlerin tam olduğu varsayımıyla küçük somunun eşi küçük cıvata grubunda olmalıdır; büyük tarafta olamaz. Her bölme turu doğrusal çapraz karşılaştırma yapar. Uygun rastgele pivot seçiminde quicksort benzeri beklenen O(n log n) toplam elde edilir; sürekli uç seçimlerde karesel kötü durum mümkündür.

**Sınır.** Eksik eşler, aynı boyuttan birden çok parça veya belirsiz karşılaştırma varsa bu basit yöntem ek kurallar gerektirir. Problemin izin vermediği somun–somun sıralamasını kullanmak çözüm değildir.

## 21. İkinci mola — pivotun verdiği sözü ayıralım

[Ders sayfasındaki örnek 21](../#example-21) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart ikinci on dakikalık moladır. Pivot ve sıralama kavramlarını aşağıdaki küçük sorularla toparlayın.

**Partition neyi garanti eder?** Belirtilen şemada pivotun solundakiler ondan küçük, sağındakiler küçük değildir. İki tarafın kendi içinde sıralı olması garanti edilmez.

**Bir kötü bölme quicksort'u kesin karesel yapar mı?** Hayır. Kalan problemlerin nasıl bölündüğü de önemlidir. Uzun süre tekrarlanan uç bölmeler kötü zinciri oluşturur.

**Rastgele pivot her seferinde ortanca mıdır?** Hayır. Uçlar da seçilebilir. Beklenen O(n log n), rastgele seçimler üzerinden değerlendirilen sonuçtur; tek çalıştırmanın garantisi değildir.

**Bütün anahtarlar eşitse rastgelelik yeterli mi?** Katı iki yönlü yöntemde hayır. Pivotun değeri yine aynıdır. Üç yönlü partition eşit grubu ayırıp tekrar işlememeyi sağlar.

**Yerinde takas, sabit toplam alan demek mi?** Özyinelemeli quicksort'ta hayır; çağrı yığını da alan kullanır. Partition alanıyla bütün algoritmanın alanını ayırın.

**Somun–cıvata problemi neden doğrudan iki listeyi sıralamıyor?** Aynı tür iki parçayı karşılaştırmak yasaktır. Eş pivot çifti, iki koleksiyonu yalnızca izin verilen çapraz testlerle aynı boyut sınırından ayırır. Çözümün doğruluğu kadar izin verilen işlemlere uyması da gerekir.

## 22. Karşılaştırmalı sıralama yeterince bilgi toplamalıdır

[Ders sayfasındaki örnek 22](../#example-22) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

**Problem.** Üç farklı anahtar altı sırada gelebilir: 123,132,213,231,312,321. Doğru bir algoritma bunların her birinde hangi kaydın nereye gideceğini belirlemelidir.

**Karar ağacı:** Farklı anahtarlar için bir evet/hayır karşılaştırması iki dala ayrılır. En fazla iki karşılaştırmalı bir yol ağacı en fazla 2² = 4 ayrı sonuca yer açar; altı düzen için yetmez. Üç karşılaştırma 2³ = 8 yaprak kapasitesi verir. Bu nedenle bazı girişlerde en az üç karşılaştırma gerekir. Kapasitenin yeterli olması tek başına bir sıralama algoritması kurmaz; bu bir alt sınır gerekçesidir.

**Genel hesap:** n farklı anahtarın n! dizilişi vardır. En kötü yol h karşılaştırma ise en fazla 2^h yaprak olabilir. O halde `2^h ≥ n!`, yani `h ≥ ceiling(log₂(n!))` gerekir. Üç elemanda log₂6, 2 ile 3 arasındadır; ceiling ile 3'e yuvarlarız. Yarım karşılaştırma yapamayız.

**Neden n log n mertebesi?** n!'in son yaklaşık yarısındaki her çarpan en az n/2'dir. Bu yüzden logaritması en az yaklaşık `(n/2)log₂(n/2)` büyür. Böylece karşılaştırma modelinde en kötü süre için Ω(n log n) alt sınırı çıkar.

**Kapsam.** Bu her girişin o kadar iş gerektirdiğini söylemez; bazı girişler daha kolay olabilir. Sayma ve radix gibi yöntemler anahtarların sayısal yapısını kullanır; yalnızca ikili karşılaştırmalardan öğrenmez. Bu nedenle onların uygun koşullarda doğrusal olması alt sınırla çelişmez.

## 23. Küçük tamsayıları karşılaştırmak yerine saymak

[Ders sayfasındaki örnek 23](../#example-23) · [İlgili ders notu](../lecture-notes.html#topic-5-2)

**Problem.** Girdi `[3,1,2,3,0,1]`, izin verilen anahtarlar 0…15. On altı sayacı önce sıfırlarız. Her x değerinde `sayac[x]` bir artırılır.

| Okunan | 0 sayacı | 1 sayacı | 2 sayacı | 3 sayacı |
|---:|---:|---:|---:|---:|
| 3 | 0 | 0 | 0 | 1 |
| 1 | 0 | 1 | 0 | 1 |
| 2 | 0 | 1 | 1 | 1 |
| 3 | 0 | 1 | 1 | 2 |
| 0 | 1 | 1 | 1 | 2 |
| 1 | 1 | 2 | 1 | 2 |

Diğer on iki sayaç sıfır kalır. Sayaçları anahtar sırasıyla okuruz: 0 bir kez, 1 iki kez, 2 bir kez, 3 iki kez. Sonuç `[0,1,1,2,3,3]`.

**Maliyet.** n girdiyi oku, k sayacı başlat ve tara, n çıktıyı yaz: Θ(n+k). Burada k = 16. Sabit aralıkta Θ(n) diyebiliriz. Fakat üç kayıt 0 ile bir milyar arasına yayılmışsa k çok büyük olabilir; sayaç belleği ve taraması baskın hale gelir. “Az veri var” yeterli gerekçe değildir; anahtar aralığı önemlidir.

**Neden alt sınırı aşmıyor?** Anahtar doğrudan sayaç indeksi seçiyor. Yalnızca “x < y mi?” sorularını kullanmıyoruz. Bu ek bilgi karşılaştırma modelinin dışındadır.

**Kayıt uyarısı.** Bu görsel yalnızca çıplak anahtarları yeniden üretir. Kimlik ve zaman gibi alanlar sayaçlardan geri elde edilemez. Tam kayıtları kararlı sıralamak için kümülatif sayımlar, uygun yerleştirme sırası ve çıktı dizisi kullanan kararlı counting sort gerekir. Aralık dışı değerler de sayaca erişmeden önce ele alınmalıdır.

## 24. Kovalar aralıkları ayırır; içleri ayrıca sıralanır

[Ders sayfasındaki örnek 24](../#example-24) · [İlgili ders notu](../lecture-notes.html#topic-5-4)

**Problem.** `[0.42,0.12,0.88,0.31,0.74]` değerlerini dört eşit aralık kovasına dağıtıyoruz. Giriş aralığı `[0,1)`; 0 dahil, 1 hariç. Kova numarası `floor(4x)`.

| Kova | Aralık | İlk içerik | Sıralı içerik |
|---:|---|---|---|
| 0 | [0,0.25) | 0.12 | 0.12 |
| 1 | [0.25,0.50) | 0.42,0.31 | 0.31,0.42 |
| 2 | [0.50,0.75) | 0.74 | 0.74 |
| 3 | [0.75,1) | 0.88 | 0.88 |

**Adımlar.** Önce değerleri aralıklarına göre dağıtırız. Sonra her kovayı kendi içinde sıralarız. Son olarak kovaları 0,1,2,3 sırasıyla birleştiririz: `[0.12,0.31,0.42,0.74,0.88]`.

**Neden doğru?** Önceki kovanın aralığı sonraki kovadan önce gelir. Bu yüzden farklı kovalar arasındaki sıra bellidir. Ama 0.42 ile 0.31 aynı kovaya girdiği için aralarındaki düzeni dağıtım tek başına çözmez; iç sıralama gereklidir.

**Sınırlar.** 0.50 için floor(2) = 2; ikinci aralığın sağ ucu hariç olduğundan kova 2'ye gider. 1.00 bu problemde kabul edilmez: formül 4 üretir, oysa geçerli kovalar 0…3'tür. Sınırları belirsiz bırakmak indeks hatasına yol açar.

**Maliyet.** İç kova boyutları nᵢ ise dağıtım ve toplama işine, her kovanın sıralama maliyeti eklenir. Insertion sort kullanılırsa toplam iç maliyet O(Σ nᵢ²) olabilir. Hepsi bir kovada toplanırsa karesel kötü durum mümkündür. Beklenen doğrusal bucket sort iddiası dağılım, kova sayısı ve iç yöntem varsayımlarını gerektirir; dört kovalı bu küçük çizim tek başına genel garanti değildir.

## 25. Basamakları sıralarken önceki işi korumak

[Ders sayfasındaki örnek 25](../#example-25) · [İlgili ders notu](../lecture-notes.html#topic-5-5)

**Problem.** Girdi `[170,45,75,90,802,24,2,66]`. Sayılar negatif olmayan, en fazla üç basamaklı tamsayılar. LSD radix sort, birler basamağından başlayıp sola doğru gider. Eksik basamakları sıfır kabul ederiz: 2 → 002.

```text
Başlangıç: [170,45,75,90,802,24,2,66]
Birler:    [170,90,802,2,24,45,75,66]
Onlar:     [802,2,24,45,66,170,75,90]
Yüzler:    [2,24,45,66,75,90,170,802]
```

**Birler turu:** Sonu 0 olanlar 170,90 sırasını korur. Sonu 2 olanlar 802,2 sırasını korur. Ardından 4,5,6 kovaları okunur. Bu aşamada bütün sayılar sıralı değildir; yalnızca birler basamağına göre düzenlidir.

**Onlar turu:** Aynı onlar basamağındakiler mevcut sıralarını korur. Örneğin onlar basamağı 7 olan 170 ve 75, önceki turda birler açısından 0 ve 5 sırasındaydı; 170 önce kalmalıdır. Böylece son iki basamağa göre doğru düzen kurulur.

**Yüzler turu:** Yüzler basamağı 0 olan bütün iki ve tek basamaklı değerler, zaten doğru olan son iki basamak sıralarını korur. 170 ve 802 kendi yüzler kovalarına geçer; tam sayısal sıra elde edilir.

**Neden kararlılık zorunlu?** Sonraki tur aynı basamaklı değerleri rastgele değiştirirse önceki düşük basamak düzeni bozulabilir. Her tur sonunda işlenmiş basamaklar birlikte sıralıdır; kararlılık bu bilgiyi korur.

**Maliyet ve kapsam.** d basamak, b taban için kararlı sayma turları O(d(n+b)) süre ve tipik O(n+b) yardımcı alan kullanır. d büyüyorsa koşulsuz O(n) denmez. Bu demoda üç onluk tur var; negatif sayılar veya metinler için ek kodlama ve sıralama kuralları gerekir.

## 26. Sensör günlükleri ile ADC seviyeleri farklı sorular sorar

[Ders sayfasındaki örnek 26](../#example-26) · [İlgili ders notu](../lecture-notes.html#topic-6)

**Problem A — iki sıralı zaman günlüğü:** `[1,4,6]` ve `[2,3,5]` zamanlarına ait kayıtları tek günlükte birleştirelim. Her giriş zaten sıralı olduğu için O(a+b) merge yeterlidir; birleşimi baştan genel sıralamaya göndermek gereksiz iş yapabilir. Zamanla birlikte sensör kimliği ve ölçüm de taşınır.

**Eşit zamanlar:** İki kaydın zaman damgası aynı olabilir. Kaynak önceliği veya geliş sıra numarası gibi bir kural belirlenmelidir. Zaman tek başına benzersiz kimlik değildir. Sol kaynak önce kuralı deterministik olabilir; fiziksel olayların gerçek oluş sırasını bildiğimizi göstermez.

**Problem B — 12 bit ADC histogramı:** İdeal sayısal kod uzayı 0…4095, yani 4096 farklı koddur. Her seviyenin kaç kez okunduğunu sayabiliriz.

```text
4096 sayaç × 4 bayt = 16384 bayt = 16 KiB
[1,2,1] ve [1,1,2] → aynı histogram: 1 iki kez, 2 bir kez
```

**Neyi kaybederiz?** Histogram sıklığı korur; geliş sırasını ve tek tek kayıt kimliklerini korumaz. İki farklı zaman dizisi aynı sayımları verebilir. Bu nedenle histogramdan orijinal zaman akışını geri çıkaramayız.

**Bellek koşulu.** 16 KiB hesabı her sayacın tam dört bayt olduğu ham depolama içindir; dil ve kapsayıcı ek yükleri dahil değildir. Sayacın kapasitesi aşılırsa taşma politikasına ihtiyaç vardır. Tam kayıtları ADC koduna göre kararlı sıralamak istiyorsak yalnızca kodları sayıp tekrar yazmak yeterli değildir; uygun kayıt yerleştirme yöntemi gerekir.

## 27. Küçük örneklerle yanlış iddiaları reddetmek

[Ders sayfasındaki örnek 27](../#example-27) · [İlgili ders notu](../lecture-notes.html#topic-7-1)

**İddia 1: “Tek partition her şeyi sıralar.”** `[7,2,5,1,4]` için son pivot 4 ile sonuç `[2,1,4,7,5]`. Solda 2 > 1, sağda 7 > 5; iki taraf da hâlâ iş ister. Buna rağmen partition doğru çalışmıştır: 2 ve 1, 4'ten küçük; 7 ve 5 küçük değildir. Algoritmanın vermediği bir sözü ondan beklemeyin.

**İddia 2: “Kodda sabit sayıda döngü varsa süre sabittir.”** Counting sort birkaç döngüden oluşabilir. Bir döngü n kaydı, diğeri k sayacı, başka bir bölüm n çıktıyı işler. Döngülerin kaynak kodundaki sayısı sabit olsa da tekrar sayıları girdiye bağlıdır. Toplam Θ(n+k)'dir, O(1) değil.

**İddia 3: “Sıralı olduğunu lineer kontrol edebiliyorsam her şeyi lineer sıralayabilirim.”** Kontrol, komşu değerlerin doğru sırada olup olmadığını sorar. Sıralama, keyfi girdide bütün kayıtların yeni konumunu bulmalıdır. Farklı görevlerdir; kontrolün kolaylığı üretimin aynı maliyette olduğunu göstermez.

**Doğru deney yaklaşımı.** Önce iddiayı ve kapsamını yazın: her giriş mi, beklenen durum mu, farklı anahtarlar mı, sınırlı tamsayılar mı? Sonra küçük bir karşı örnek arayın. Tek geçerli karşı örnek evrensel iddiayı çürütür. Buna karşılık birkaç başarılı örnek bütün girdilerde doğruluğu kanıtlamaz; bunun için algoritmanın koruduğu koşulları açıklamak gerekir.

## 28. Önce adımları açıkla, sonra maliyeti adlandır

[Ders sayfasındaki örnek 28](../#example-28) · [İlgili ders notu](../lecture-notes.html#topic-7-2)

**Görev A — birleştirme:** Sol `[1,4,6]`, sağ `[2,3,5]`.

| Adım | Karşılaştırma | Yazılan |
|---:|---|---:|
| 1 | 1 ve 2 | 1 |
| 2 | 4 ve 2 | 2 |
| 3 | 4 ve 3 | 3 |
| 4 | 4 ve 5 | 4 |
| 5 | 6 ve 5 | 5 |
| 6 | Sağ bitti; kalan sol | 6 |

Sonuç `[1,2,3,4,5,6]`. Beş anahtar karşılaştırması, altı çıktı yazması. Son adım karşılaştırma yapmadan iş üretir; iki sayacı ayrı tutmanın nedeni budur.

**Görev B — 0…15 ölçümleri:** On altı sayacı sıfırla, her okumada ilgili sayacı artır, sayaçları sırayla tara. Çıplak anahtarları yeniden üretmek Θ(n+16), sabit aralıkta Θ(n) sürer. Kimlik ve zaman bilgisi bu yeniden üretimde korunmaz. Bunlar gerekiyorsa tam kayıtlar için kararlı sıralama yöntemi seçilmelidir.

**Haftanın üç karşıtlığı:** Dengeli bölme ve doğrusal birleştirme n log n iş verir. Her seferinde yalnızca bir eleman azaltıp kalanı taramak n² iş üretebilir. Sınırlı tamsayı anahtarları saymak, karşılaştırma modelinden daha fazla bilgi kullanır ve uygun aralıkta doğrusal olabilir.

**Son kontrol.** “Quicksort her zaman n log n” yanlış; “uygun rastgele pivot ve farklı anahtar varsayımlarıyla beklenen n log n” anlamlı bir ifadedir. İyi teknik cevap başlangıç verisini, kullanılan yöntemi, ara durumları, sayılan işlemleri ve varsayımları birlikte söyler. Yalnızca bir O sembolü yazmak, neden doğru veya hızlı olduğunu açıklamaz.

