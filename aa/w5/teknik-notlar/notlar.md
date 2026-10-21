# AA · 5. Hafta — 28 örneğin Türkçe teknik açıklaması

Bu notlar, **“Search trees and hash tables”** dersindeki 28 kartı aynı sırayla açıklar. Amaç yalnızca işlemin sonucunu bulmak değil, her adımın neden doğru olduğunu ve hangi koşullarda hızlı çalıştığını anlamaktır. 14 ve 21 numaralı kartlar derste moladır; burada cevaplı tekrar için kullanılır. Ayrı araştırma vaka çalışması bu 28 örneğe dahil değildir.

## Önce kullanacağımız dil

- **Anahtar (key):** Kaydı bulmak için kullandığımız kimlik; örneğin sensör numarası 30.
- **Değer (value):** O kimliğe ait bilgi; örneğin 21 °C. Anahtarın büyüklüğü ile sıcaklığın büyüklüğü aynı şey değildir.
- **n:** Saklanan kayıt sayısı. **m:** Hash tablosundaki yuva/kova sayısı. **h:** Ağacın yüksekliği; bu notlarda kökten en derin düğüme giden yolun kenar sayısıdır. Tek düğümlü ağacın yüksekliği 0'dır.
- **O(1):** Kayıt sayısı büyürken, kullandığımız hesaplama modelinde işlem maliyetinin sabit bir üst sınırı vardır. “Tam bir işlem” veya “bir saniye” demek değildir.
- **O(log n):** Adayları tekrar tekrar yaklaşık yarıya indirmeye benzer büyüme. Örneğin 8 → 4 → 2 → 1, üç yarılama gerektirir. Burada logaritmayı 2 tabanında düşünebiliriz; sabit taban değişimi büyüme sınıfını değiştirmez.
- **O(n):** Maliyet için doğrusal bir üst sınır. Bütün kayıtları bir kez okumak buna örnektir. **O(n²)** ise bütün çiftleri karşılaştırmak gibi karesel büyümenin üst sınırıdır.
- **Θ(n):** Maliyet hem alttan hem üstten doğrusal büyümeyle sınırlıdır. O yalnızca üst sınır verir; Θ büyüme mertebesini daha sıkı belirtir. Ayrıca her ifade için “en kötü”, “beklenen” veya “amortize” maliyetten hangisini söylediğimizi belirtmeliyiz.

**Sayım anlaşması:** Ağaç örneklerinde ziyaret edilen düğümleri sayıyoruz. Bir düğümde programın hem `==` hem `<` kontrolü yapması, burada iki düğüm ziyareti sayılmaz. Bu yüzden sayıları doğrudan işlemci komutu veya milisaniye gibi okumayın.

## 1. Her kutuya bakmak mı, yarısını elemek mi?

[Ders sayfasındaki örnek 1](../onceki-ders.html#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** Sıralı sensör kimlikleri `[10, 20, 30, 40, 50, 60, 70]`. Aranan kimlik 60. İki yöntemin de bulduğu kayıt aynıdır; farklı olan, bulana kadar yaptıkları iştir.

**Adım adım karşılaştırma:**

| Yöntem | Ziyaret edilen kimlikler | Ziyaret sayısı |
|---|---|---:|
| Baştan sırayla arama | 10 → 20 → 30 → 40 → 50 → 60 | 6 |
| İkili arama | 40 → 60 | 2 |

İkili arama önce ortadaki 40'a bakar. 60 daha büyük olduğu için 40 ve solundaki bütün kimlikler elenir. Kalan bölüm `[50, 60, 70]`; bunun ortası 60'tır. Buradaki kazanım “daha hızlı karşılaştırma yapmak” değil, **gereksiz karşılaştırmaları yapmamaktır**.

**Neden doğru?** Sıralılık, solda kalan her kaydın 40'tan küçük olduğunu garanti eder. Veri sıralı değilse bu çıkarım yapılamaz; aranan kaydı yanlışlıkla elemek mümkündür. Algoritma, aranan kayıt varsa hâlâ incelenen aralık içinde olduğu bilgisini her adımda korur.

**Maliyet ve koşul.** Sıralı bir dizide ortadaki elemana sabit zamanda erişebildiğimizde ikili aramanın en kötü maliyeti O(log n), doğrusal aramanınki O(n)'dir. Yedi kayıtta başarılı ikili arama en fazla üç ziyaret gerektirir. Bağlı listede ortaya gitmek için bağlantıları yürümek gerektiğinden aynı zaman sonucu otomatik olarak geçerli değildir. Veriyi önce sıralamak gerekiyorsa bunun maliyeti de ayrıca düşünülür.

**Kontrol ve cevap.** 10'u arayın: 40 → 20 → 10, toplam üç ziyaret. 60'ın iki adımda bulunması, her anahtarın iki adımda bulunacağı anlamına gelmez.

## 2. Kimlik anahtardır; ölçüm değerdir

[Ders sayfasındaki örnek 2](../onceki-ders.html#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

**Problem.** `30 → 21 °C` kaydında 30 sensörün kimliğidir, 21 ise ölçümüdür. “30 numaralı sensörü bul” ile “en düşük sıcaklığı bul” farklı sorulardır.

Bir sözlük (dictionary), anahtarı ilgili değerle eşleştirir. `search(30)` ilgili kaydı getirir; `insert(40, 18)` yeni bir kayıt ekler; `delete(30)` o anahtara ait kaydı kaldırır. Bir kimlik yeniden gelirse sistemin ne yapacağı önceden belirlenmelidir: eski ölçümü güncellemek, reddetmek veya bir ölçüm listesine eklemek farklı tasarımlardır. Sözlükte aynı anahtarın değerini güncellemek, zorunlu olarak yeni bir düğüm eklemek değildir.

**Sıralı sözlükte diğer işlemler:** minimum en küçük anahtarı, maksimum en büyük anahtarı verir. Ardıl (successor), daha büyük saklanan anahtarlar içindeki en küçüğüdür. Öncül (predecessor), daha küçükler içindeki en büyüğüdür.

```text
Saklanan anahtarlar: 20      30                50
                            └── ardılı ──────→ 50
```

**Önemli ayrım.** 30'un ardılı 31 değildir; 31 kayıtlı değil. Aynı şekilde en küçük kimlikli sensörün sıcaklığı mutlaka en düşük değildir. Ağaç kimliğe göre kurulmuşsa sıcaklığa göre minimum bulmak için başka bir düzenleme veya kayıtları tarama gerekebilir.

**Ne alınmalı?** Veri yapısını seçmeden önce hangi soruların sorulacağını tanımlayın. Sadece kimlikle arama ile kimlikler arasında sırayla ilerleme aynı gereksinim değildir. İşlemlerin adı tek başına ne kadar hızlı olduklarını söylemez; kullanılan yapı belirleyicidir.

## 3. Hızlı aramanın ekleme bedeli olabilir

[Ders sayfasındaki örnek 3](../onceki-ders.html#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

**Problem.** Sıralı dizi `[10, 20, 30, 40]` içine 25 eklenecek. 25'i sona yazarsak dizi artık sıralı olmaz. İkili aramanın dayandığı özellik bozulur.

```text
Başlangıç: 10  20  30  40  [boş]
40'ı taşı: 10  20  30  [ ]  40
30'u taşı: 10  20  [ ]  30  40
25'i yaz: 10  20  25   30  40
```

**Neden sağdan başlıyoruz?** Önce 30'u 40'ın yerine yazarsak, 40'ı saklamadan üzerine yazmış oluruz. Sağdan sola taşıma henüz taşınmamış kayıtları korur. Bu örnekte iki mevcut kayıt yer değiştirir; ayrıca yeni kayıt yazılır. “İki kaydırma” toplam işlemlerin tamamı değildir.

**Arama ve taşıma ayrı işlerdir.** Ekleme konumu ikili aramayla O(log n) zamanda bulunabilir. Ancak başa yakın eklemede yaklaşık n kayıt taşınacağından toplam en kötü ekleme maliyeti O(n)'dir. Dizide boş kapasite olduğunu varsaydık; kapasite doluysa yeni bellek ayırma ve kopyalama da gerekebilir.

**Bağlı liste karşılaştırması.** Sırasız tek bağlı listenin başına yeni düğüm eklemek, düğüm hazırken iki bağlantı ayarıyla O(1) yapılabilir: yeni düğümün `next` alanı eski başı gösterir, baş işaretçisi yeni düğüme alınır. Fakat liste artık anahtara göre sıralı değildir; arama en kötü O(n) olur. “Listeye ekleme O(1)” ifadesi, önce arayarak uygun konumu bulma maliyetini kapsamaz.

**Kontrol ve cevap.** Aynı diziye 5 eklemek dört mevcut kaydın da sağa taşınmasını gerektirir. Hangi yapı daha iyi sorusunun cevabı, arama ve eklemeyi ne sıklıkta yaptığımıza bağlıdır.

## 4. Arama ağacı: küçük veya büyük kararları

[Ders sayfasındaki örnek 4](../onceki-ders.html#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

**Problem.** Anahtarları şu ikili arama ağacında (BST) saklayalım:

```text
          50
        /    \
      30      70
     /  \    /  \
   20   40  60   80
```

**Kural.** Her düğümün sol alt ağacındaki bütün anahtarlar ondan küçük, sağ alt ağacındaki bütün anahtarlar ondan büyüktür. Burada anahtarların farklı olduğunu varsayıyoruz. Alt ağaç, doğrudan çocuğu ve onun altındaki bütün düğümleri kapsar.

40 neden doğru yerde? 50'den küçük olduğu için 50'nin sol tarafında, 30'dan büyük olduğu için 30'un sağ tarafındadır. Yani aynı anda iki sınırı sağlar: `30 < 40 < 50`.

**Sık hata.** 30'un sağına 55 koymak, yalnızca 30 ile karşılaştırınca uygun görünür. Ama bu konum hâlâ 50'nin sol alt ağacındadır. 55, 50'den küçük olmadığı için bütün ağacın BST kuralı bozulur. Kural sadece ebeveyn ve çocuk arasında kontrol edilmez; üst düğümlerden gelen sınırlar da korunur.

**Neden önemli?** Arama sırasında bir dalı tamamen atlayabilmemizi sağlayan şey bu kuraldır. Kural bozuksa algoritma doğru anahtarı yanlış tarafta bırakıp “yok” diyebilir. Her ikili ağaç BST değildir: “ikili” en fazla iki çocuk olduğunu, “arama ağacı” ise ek bir sıralama kuralını söyler.

**Kontrol ve cevap.** 35, 30'un sağındaki alt ağaçta bulunabilir mi? Evet; 30 ile 50 arasındadır. Ancak 40'ın çocuğu olacaksa 40'tan küçük olduğu için onun soluna yerleştirilmelidir.

## 5. Her dalı değil, tek yolu izlemek

[Ders sayfasındaki örnek 5](../onceki-ders.html#example-5) · [İlgili ders notu](../lecture-notes.html#topic-1-4)

**Problem.** Önceki ağaçta 60'ı arıyoruz. Her karşılaştırmada aramanın devam edeceği yalnızca bir yön vardır.

| Ziyaret | Bulunduğumuz düğüm | Karar |
|---:|---:|---|
| 1 | 50 | 60 daha büyük; sağa git |
| 2 | 70 | 60 daha küçük; sola git |
| 3 | 60 | Eşit; bulundu |

**Bulunamazsa ne olur?** 65 arandığında yine 50 → 70 → 60 ziyaret edilir. 65, 60'tan büyük olduğu için sağ bağlantıya bakılır. Bağlantı boştur; kayıt yoktur. Burada üç mevcut düğüm ziyaret edilmiştir. Son boş bağlantıyı kontrol etmek de programda iş yapar, fakat sayımımızda dördüncü düğüm ziyareti değildir.

**Doğruluk düşüncesi.** 50'nin solundakiler 50'den küçük; hiçbirisi 65 olamaz. 70'in sağındakiler 70'ten büyük; onlar da 65 olamaz. Böylece elenen kısımları tekrar taramaya gerek kalmaz. Aranan anahtar varsa, seçtiğimiz alt ağaçta olmalıdır.

**Maliyet.** Arama maliyeti ağaç yüksekliğiyle ilgilidir: en kötü O(h + 1). Dengeli ağaçta yükseklik logaritmik, zincire dönüşmüş ağaçta n − 1 olabilir. Bu yüzden sıradan BST için koşulsuz “arama O(log n)” denmez. Döngüyle yazılan arama O(1) ek alan kullanabilir; özyinelemeli sürüm yol boyunca çağrı yığını kullanır.

**Kontrol ve cevap.** 20'nin yolu 50 → 30 → 20'dir. Ağaçta yedi kayıt olsa da hepsini okumayız.

## 6. En küçük için sola; en büyük için sağa

[Ders sayfasındaki örnek 6](../onceki-ders.html#example-6) · [İlgili ders notu](../lecture-notes.html#topic-1-5)

**Problem.** BST'de minimum anahtarı arıyoruz. Her sol adım daha küçük bir anahtarın bulunduğu alt ağaca götürür.

```text
Minimum: 50 → 30 → 20 → sol bağlantı boş → sonuç 20
Maksimum: 50 → 70 → 80 → sağ bağlantı boş → sonuç 80
```

**Neden durabiliriz?** 20'nin sol alt ağacı yoksa, o alt ağaç içinde 20'den küçük saklanan bir anahtar yoktur. Kökten sürekli sola giderek zaten her aşamada daha küçük anahtarları içerebilecek tarafa geçtik. Sağ alt ağaçları kontrol etmeye gerek yoktur; oradaki anahtarlar ilgili düğümden büyüktür.

**Tüm ağaç mı, alt ağaç mı?** İşlemi 70'ten başlatırsak minimum 60 olur. Bu, bütün ağacın minimumu değildir; yalnızca kökü 70 olan alt ağacın minimumudur. Bu ayrım, iki çocuklu düğüm silerken kullanılacaktır.

**Maliyet ve sınır durumları.** Kökten başlamak ve bağlantıları izlemek en kötü O(h + 1) sürer. “Minimum her zaman O(1)” demek doğru değildir; bunun için ayrıca minimuma doğrudan bir referans tutmak gibi bir tasarım gerekir. Boş ağaçta minimum yoktur; uygulama `None`, uygun bir sonuç türü veya tanımlanmış bir hata döndürmelidir. 0 gibi geçerli bir anahtarı “yok” anlamında kullanmak belirsizlik doğurabilir.

**Kontrol ve cevap.** Standart ağaçta 30 alt ağacının maksimumu 40'tır. İşleme başladığımız kök, hangi kayıt kümesi hakkında cevap verdiğimizi belirler.

## 7. Ekleme: boş yere kadar aramak

[Ders sayfasındaki örnek 7](../onceki-ders.html#example-7) · [İlgili ders notu](../lecture-notes.html#topic-1-6)

**Problem.** Anahtarları sırayla `50, 30, 70, 20, 40, 60, 80` ekleyelim. İlk anahtar kök olur. Sonraki her anahtar, aramada olduğu gibi küçükse sola, büyükse sağa ilerler; boş bağlantıya yeni düğüm yerleştirilir.

**40'ın eklenmesi:** 40 < 50, sola; 40 > 30, sağa; bağlantı boş, yeni düğümü buraya bağla. Eklemeden sonra 40 hem 30'dan büyük hem 50'den küçüktür. Yolda alınan kararlar, bütün üst düğümlerin sınırlarını aynı anda korur.

**65'i sonradan ekleyelim:**

```text
65 > 50 → sağ
65 < 70 → sol
65 > 60 → sağ bağlantı boş → 65'i bağla
```

Arama yolu üzerinde üç mevcut düğüm ziyaret edilir; yeni düğümün bağlanması ayrı son adımdır. Yerini bulma O(h + 1), uygun bağlantıyı değiştirme sabit iştir. Sıradan BST bu eklemeden sonra kendiliğinden dengelenmez.

**Aynı anahtar yeniden gelirse?** Sözlük olarak kullanıyorsak 60 anahtarı için yeni değer geldiğinde mevcut 60'ın değeri güncellenebilir. Aynı anahtarı rastgele bir dala eklemek, burada kullandığımız kesin küçük/büyük kuralıyla uyumlu değildir. Tekrarları saklamak gerekiyorsa sayaç, değer listesi veya açık bir başka politika gerekir.

**Kontrol ve cevap.** 25, 50 → 30 → 20 yolunu izler ve 20'nin sağına eklenir. Aynı anahtar kümesini farklı sırayla eklemek farklı ağaç şekilleri ve dolayısıyla farklı arama süreleri oluşturabilir.

## 8. Ağacı sıralı okumak

[Ders sayfasındaki örnek 8](../onceki-ders.html#example-8) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

**Problem.** Anahtarları küçükten büyüğe yazdırmak istiyoruz. Kökten başlayıp rastgele çocuklara gitmek yeterli değildir. Kullanılan yöntem **inorder**, yani “sol alt ağaç → düğüm → sağ alt ağaç” dolaşımıdır.

```text
50'nin solunu bitir: 20, 30, 40
50'yi yaz:          50
50'nin sağını bitir:60, 70, 80
Sonuç:             20, 30, 40, 50, 60, 70, 80
```

**Özyinelemeyi açalım.** 50'nin solunu okumak için 30'a gideriz. Önce 30'un solu olan 20 okunur. Sonra 30 yazılır. Ardından 40 okunur. Böylece 30 alt ağacı biter; 50'ye dönüp onu yazabiliriz. Sağ taraf için aynı işlem tekrarlanır. Bir düğüme ulaşmak ile o düğümü çıktıya yazmak aynı an olmak zorunda değildir.

**Neden sıralı?** BST kuralına göre sol alt ağaçtaki bütün anahtarlar düğümden küçük, sağdakiler büyüktür. Alt ağaçlar da kendi içlerinde aynı kuralla okunursa, üç parçanın birleşimi sıralı olur. Bu gerekçe her seviyede geçerlidir.

**Maliyet.** Her düğüm bir kez yazıldığından toplam süre Θ(n)'dir. Yalnızca tek kayıt aramaktan farklı olarak bütün çıktıyı üretmek zorundayız. Özyinelemeli yöntemin ek yığını O(h + 1), sonucu ayrıca listeye toplarsak sonuç listesi O(n) yer tutar. Zincir biçimindeki BST de doğru sıralı çıktı verir; fakat yığını derin olabilir.

**Kontrol ve cevap.** İlk yazılan anahtar 50 değil 20'dir. Kökü önce yazdırmak farklı bir dolaşımdır; genel olarak sıralı çıktı sağlamaz.

## 9. Ardıl: bir sonraki saklanan anahtar

[Ders sayfasındaki örnek 9](../onceki-ders.html#example-9) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

**Problem.** 50'nin ve 40'ın ardılını bulacağız. Ardıl, anahtarın sayısal olarak bir fazlası değil, mevcut anahtarlar arasında bir sonrakidir.

**Durum 1 — sağ alt ağaç var.** 50'nin sağında 70 alt ağacı var. 50'den büyük anahtarlar burada bulunur. Bu grubun en küçüğü için 70'ten sola gideriz: 60. Dolayısıyla 50'nin ardılı 60'tır.

**Durum 2 — sağ alt ağaç yok.** 40'ın sağı boş. Yukarı çıkıp, sol tarafından geldiğimiz ilk üst düğümü ararız. 40'tan 30'a çıktığımızda sağ çocuktan gelmiş oluruz; 30 zaten 40'tan küçüktür. 30'dan 50'ye çıktığımızda sol taraftan geliyoruz; 50, 40'tan büyük en yakın uygun üst düğümdür. Sonuç 50'dir.

```text
50'nin ardılı: sağa git 70 → olabildiğince sola git 60
40'ın ardılı:  yukarı 30 (küçük) → yukarı 50 (uygun)
```

**Öncül simetriktir.** Sol alt ağaç varsa onun maksimumunu buluruz; yoksa sağ tarafından geldiğimiz ilk uygun üst düğüme çıkarız. 60'ın öncülü 50'dir. En büyük anahtar 80'in ardılı yoktur.

**Uygulama ve maliyet.** Yukarı çıkmak için ebeveyn bağlantıları, arama sırasında saklanmış bir yol veya kökten aday tutarak arama gerekir. Yalnızca aşağı yönlü bağlantılardan kendiliğinden ebeveyne geçemeyiz. Maliyet O(h + 1)'dir; yalnızca anahtar verildiyse düğümü bulma işi de bu değerlendirmeye dahil edilmelidir.

## 10. Silme: yaprak ve tek çocuk

[Ders sayfasındaki örnek 10](../onceki-ders.html#example-10) · [İlgili ders notu](../lecture-notes.html#topic-2-3)

**Problem.** Silinen düğümün altında kalan kayıtları kaybetmeden bağlantıları düzenlemeliyiz. İlk iki durum basittir.

**Yaprak silme.** Standart ağaçta 20'nin çocuğu yoktur. 20'yi bulur, ebeveyni 30'un sol bağlantısını boş yaparız. Başka bir alt ağaç taşımaya gerek yoktur.

**Tek çocuk silme.** Bu kez ayrı bir ağaç kullanıyoruz: ekleme sırası `[50, 30, 70, 40]`. Burada 30'un tek çocuğu 40'tır.

```text
Önce:          Sonra:
    50             50
   /  \           /  \
 30   70        40   70
   \
   40
```

30'u kaldırırken 50'nin sol bağlantısını 40'a bağlarız. Yalnızca bağlantıyı boş yapmak 40'ı erişilemez bırakır. Çocuğun bütün alt ağacı, varsa, birlikte korunur.

**Neden sıralama bozulmaz?** 30 alt ağacındaki bütün kayıtlar zaten 50'den küçüktü. 40'ı aynı bağlantı üzerinden yukarı almak bu üst sınırı bozmaz; 40'ın kendi alt ağacındaki sıralama da değişmez.

**Özel durum.** Silinen düğüm kökse ebeveyn bağlantısı yoktur. Tek çocuk yeni kök yapılır; kök tek başına yapraksa ağaç boş olur. Ebeveyn işaretçileri veya alt ağaç boyutları tutuluyorsa bunlar da güncellenir.

**Maliyet.** Düğümü ve gerekirse ebeveynini bulmak O(h + 1), bu iki durumda esas bağlantı değişikliği sabit iştir. Bu yüzden “silme sadece bir bağlantı değiştiriyor, O(1)” demek arama maliyetini gözden kaçırır.

## 11. Silme: iki çocuk olduğunda ardılı kullanmak

[Ders sayfasındaki örnek 11](../onceki-ders.html#example-11) · [İlgili ders notu](../lecture-notes.html#topic-2-3)

**Problem.** Standart ağaçta 50'yi silelim. İki çocuğu olduğu için yalnızca 30'u veya 70'i yerine almak, bağlantıları ayrıca düzenlemeden diğer tarafı kaybettirebilir. Düzenli yöntem, yerine sıralamada komşu bir kaydı taşımaktır.

**Adımlar:**

1. 50'nin sağ alt ağacına gir: 70.
2. Bu alt ağacın minimumunu bul: 60. Bu, 50'nin ardılıdır.
3. Silinecek konuma 60'ın **anahtarını ve ona ait değerini** aktar.
4. Eski 60 düğümünü kendi konumundan kaldır. Bu örnekte 70'in sol bağlantısı boş olur.

```text
Son ağaç:
          60
        /    \
      30      70
     /  \       \
   20   40       80
```

**Neden 60?** Sol taraftaki bütün anahtarlar 50'den küçük olduğu için 60'tan da küçüktür. Sağ alt ağaçta 60 en küçük anahtardı; eski 60 kaldırıldıktan sonra kalanların hepsi 60'tan büyüktür. Böylece yeni konumun iki tarafı da kurala uyar.

**Neden ikinci silme daha kolay?** Bir alt ağacın minimum düğümünün sol çocuğu olamaz. Olsaydı minimum daha solda olurdu. Ardılın sağ çocuğu olabilir; bu durumda eski yerinde tek çocuk silme yöntemi uygulanır.

**Hata riski.** Anahtarı değiştirip sensörün ölçümünü değiştirmezsek yanlış kimlik–değer eşleştirmesi yaratırız. Ayrıca eski ardıl düğümünü silmezsek tekrar kalır. Kopyalamadan sonraki ara görüntü tamamlanmış ağaç değildir. Alternatif olarak sol alt ağacın maksimumu, yani 40 da uygun şekilde kullanılabilir. Toplam işlem O(h + 1)'dir.

## 12. Aynı anahtarlar, farklı yükseklikler

[Ders sayfasındaki örnek 12](../onceki-ders.html#example-12) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

**Problem.** Aynı yedi anahtar bir ağaçta dengeli, diğerinde zincir biçiminde olabilir. Sadece kayıt sayısına bakmak arama maliyetini belirlemeye yetmez.

```text
Dengeli ağaçta 80: 50 → 70 → 80                      (3 ziyaret)
Artan ekleme:     20 → 30 → 40 → 50 → 60 → 70 → 80 (7 ziyaret)
```

İkinci ağaç, anahtarlar küçükten büyüğe sıradan BST'ye eklendiğinde oluşur: her yeni anahtar bütün öncekilerden büyük olduğu için sürekli sağa gider. Ağaç hâlâ geçerli bir BST'dir; sorun doğruluğunda değil, yolun uzunluğundadır.

**Yükseklik nasıl sayılır?** Kenar sayısını kullanıyoruz. Dengeli çizimde en uzun yol iki kenar, üç düğüm içerir: h = 2. Zincirde altı kenar, yedi düğüm vardır: h = 6. Bu nedenle bir aramada ziyaret edilebilecek düğüm sayısını h + 1 ile sınırlarız.

**Logaritma burada nereden gelir?** Bütün seviyeleri dolu bir ikili ağaçta düğüm sayısı `1 + 2 + 4 + … + 2^h = 2^(h+1) − 1` olur. Tersinden, `h + 1 = log₂(n + 1)`. Örneğin 15 düğüm dört dolu seviyeye, yani yüksekliği 3 olan ağaca sığar. Bu eşitlik tam dolu ağaç içindir; her BST için eşitlik değildir.

**Ne alınmalı?** BST sıralama kuralı aramanın doğru yönü seçmesini sağlar. Denge ise kaç adım atacağını sınırlar. Bunlar farklı özelliklerdir; doğru bir yapı yine de yavaş olabilir.

## 13. Rastgele sıra yardımcı olur; dengeleme garanti verir

[Ders sayfasındaki örnek 13](../onceki-ders.html#example-13) · [İlgili ders notu](../lecture-notes.html#topic-3-3)

**Problem.** Sıradan BST'nin kötü zincirini nasıl önleriz? İki yaklaşımı birbirine karıştırmamalıyız.

**Rastgele ekleme sırası.** Farklı anahtarların bütün permütasyonlarının eşit olasılıkla seçildiği modelde sıradan BST'nin beklenen yüksekliği O(log n)'dir. Yani çok sayıda rastgele oluşumu düşündüğümüzde ortalama davranış iyidir. Yine de artan sıra gibi kötü bir sıra mümkündür. “Rastgele” demek her çalıştırmada kısa yol garantisi değildir; gerçek sensör verisinin gelişi de bu modele uymayabilir.

**Dengeli ağaç.** AVL ve kırmızı-siyah ağaç gibi yapılar ekleme ve silmeden sonra denge koşullarını korur. Böylece yükseklik O(log n), temel arama/ekleme/silme işlemleri en kötü durumda O(log n) olur. Her seviyenin tamamen dolu olması gerekmez; matematiksel yükseklik sınırının korunması yeterlidir.

**Ağaçla sıralama:** n farklı anahtarı dengeli ağaca eklemek O(n log n), sonra inorder okumak Θ(n) sürer. Toplam O(n log n)'dir. Buna karşılık artan anahtarları sıradan BST'ye eklerken mevcut düğüm ziyaretleri şöyledir:

```text
1. anahtar: 0       2. anahtar: 1       3. anahtar: 2
...
n. anahtar: n − 1
Toplam: 0 + 1 + … + (n − 1) = n(n − 1)/2 → Θ(n²)
```

Bu sayım yeni düğüm yaratma gibi sabit işleri dışarıda bırakır; onları eklemek büyüme sonucunu değiştirmez.

**Dikkat.** Sıralanacak veride tekrarlar varsa sözlükteki “aynı anahtarı güncelle” davranışı tekrarları kaybettirebilir. Doğru sıralama için her tekrar korunmalı; örneğin düğümde adet veya kayıt listesi tutulmalıdır.

## 14. İlk mola — ağaçları cevaplarla toparlayalım

[Ders sayfasındaki örnek 14](../onceki-ders.html#example-14) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart yeni bir algoritma anlatmaz. Dersteki 78–88. dakikalar arasındaki on dakikalık moladır. Aşağıdaki kısa tekrar, mola öncesi veya sonrası kullanılabilir.

**Soru: Bir ağacın BST olması dengeli olduğunu söyler mi?** Hayır. BST, küçük ve büyük anahtarların hangi tarafta olduğunu söyler. Denge, yolların uzunluğunu kontrol eder. Artan sırayla eklenen anahtarlar doğru ama uzun bir zincir oluşturabilir.

**Soru: Neden 55, 30'un sağ çocuğu olarak 50'nin sol alt ağacına konamaz?** 55 > 30 koşulu yeterli değildir. Konumu aynı zamanda 55 < 50 gerektirir; bu sağlanmaz. Üst düğümlerden gelen bütün sınırlar geçerlidir.

**Soru: Bir anahtarı aramakla bütün anahtarları sıralı yazdırmak neden farklı maliyettedir?** Aramada tek yol yeterli olabilir. Bütün kayıtları yazdırmada n çıktının tamamını üretmek gerekir. Dengeli ağaçta tek arama O(log n), tam dolaşım Θ(n)'dir.

**Soru: İki çocuklu düğümün yerine neden sağ alt ağacın minimumu gelir?** Sol taraftan büyük kalır; sağ tarafta ondan küçük başka bir anahtar bırakmaz. Ardılın eski yerini silmek de en fazla tek çocuklu silmeye indirgenir.

**Kendi cümlenizle özet:** “Ağaç, sıralama bilgisini kullanarak her adımda bir alt ağacı eler. Ne kadar hızlı olduğu, ağacın yüksekliğine bağlıdır.” Bu cümlede hem doğruluğun hem hızın gerekçesi vardır.

## 15. Anahtardan başlangıç yuvası hesaplamak

[Ders sayfasındaki örnek 15](../onceki-ders.html#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

**Problem.** Beş yuvalı bir hash tablosunda yuvalar 0, 1, 2, 3, 4 diye numaralanmıştır. Basit hash kuralımız `h(k) = k mod 5`; yani k'yi 5'e bölünce kalan.

```text
13 = 2 × 5 + 3  → h(13) = 3
 8 = 1 × 5 + 3  → h(8)  = 3
10 = 2 × 5 + 0  → h(10) = 0
15 = 3 × 5 + 0  → h(15) = 0
```

13 ile 8 farklı anahtarlardır ama aynı başlangıç yuvasını verir. Buna **çakışma (collision)** denir. Hesaplama hatası değildir. Çok sayıda olası anahtarı az sayıda yuvaya eşlediğimiz için bazı anahtarların aynı yere düşmesi kaçınılmazdır.

**Hash sonucu kimliğin yerine geçmez.** 3 numaralı yuvaya geldiğimizde “aradığım anahtar budur” diyemeyiz. Gerçek anahtarı da saklamalı ve eşitliğini kontrol etmeliyiz. Hash yalnızca nereden başlayacağımızı belirler; çakışmayı yönetmek için ayrıca yöntem gerekir.

**Neden faydalı?** Sıralı bir arama yolu takip etmek yerine doğrudan hesaplanmış küçük bir bölgeye gideriz. İyi dağılım ve uygun dolulukla az sayıda kayıt kontrol etmek yeterli olabilir. Ama bu örnekteki kalan alma kuralı, her veri kümesinde iyi dağılım garantisi vermez.

**Koşullar.** Burada negatif olmayan, makine sözcüğüne sığan tamsayılar kullanıyoruz. Uzun metin anahtarının hash'ini hesaplamak, metnin karakterlerini okumayı gerektirebilir; anahtar uzunluğu dikkate alındığında hesap otomatik olarak sabit zaman değildir.

## 16. Çakışma çözümü: ayrı zincirleme

[Ders sayfasındaki örnek 16](../onceki-ders.html#example-16) · [İlgili ders notu](../lecture-notes.html#topic-4-3)

**Problem.** Beş kovaya sırasıyla `10, 15, 3, 20, 8, 13` ekliyoruz. Her anahtar `k mod 5` kovasına gider. Aynı kovaya düşen kayıtlar bir listede tutulur. Bu örnekte listenin sonuna ekliyoruz.

```text
Kova 0: 10 → 15 → 20
Kova 1: boş
Kova 2: boş
Kova 3:  3 →  8 → 13
Kova 4: boş
```

**20'yi arama:** `20 mod 5 = 0`. Yalnızca kova 0'ın listesine bakarız: 10 değil, 15 değil, 20 bulundu. Üç anahtar karşılaştırması. **13'ü arama:** kova 3 içinde 3 → 8 → 13, yine üç karşılaştırma. Diğer kovaları taramayız.

**Bulunmayan kayıt.** 25 için kova 0'a gider, 10, 15, 20'yi kontrol ederiz. Listenin sonuna ulaşınca 25'in bulunmadığını söyleriz. Kova boşsa bu sonuca hemen ulaşılır. Aynı kovada olmak eşit anahtar olmak değildir.

**Maliyet.** İyi, yaklaşık eşit dağılım altında ortalama kova uzunluğu α = n/m'dir. Standart varsayımlarla arama için beklenen maliyet O(1 + α) olur. α sabit bir sınırda tutulursa bu beklenen O(1)'e dönüşür. Bütün anahtarlar aynı kovaya düşerse tek listede n kayıt olabilir ve en kötü arama O(n) olur.

**Dikkat.** Kovanın başına ekleseydik liste sırası ve tek tek arama sayıları değişirdi. Zincirleme tekniğinin kendisi “her zaman sona ekle” demek değildir. Beş kova kullanmak da yalnızca beş kayıt saklayabileceğimiz anlamına gelmez; her kovada birden çok kayıt olabilir.

## 17. Çakışma çözümü: doğrusal yoklama

[Ders sayfasındaki örnek 17](../onceki-ders.html#example-17) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

**Problem.** Bu kez her yuva en fazla bir kayıt tutuyor. Başlangıç yuvası doluysa bir sonrakini deniyoruz. Kurala **linear probing**, yani doğrusal yoklama denir.

| Eklenen | Denenen yuvalar | Son yer |
|---:|---|---:|
| 10 | 0 boş | 0 |
| 15 | 0 dolu → 1 boş | 1 |
| 3 | 3 boş | 3 |
| 20 | 0 dolu → 1 dolu → 2 boş | 2 |

```text
Yuva:     0   1   2   3    4
Anahtar: 10  15  20   3  [boş]
```

**Arama aynı yolu izler.** 20'yi bulmak için `20 mod 5 = 0` ile başlar, 0, 1 ve 2'yi inceleriz. Üç yuva kontrolü yapılır. Doğrudan `tablo[0]` değerine bakıp “20 yok” demek yanlış olur; kayıt çakışma nedeniyle ileride olabilir.

**Sona gelince:** Denenecek yuva `(h(k) + i) mod m` ile hesaplanır; i = 0, 1, 2, … . Böylece son yuvadan sonra 0'a dönülür. En fazla m yuva denenmeli; tablo doluysa sonsuz döngü yerine büyütme veya tanımlı başarısızlık gerekir.

**Neden yavaşlayabilir?** Yan yana dolu yuvalar birikerek kümeler oluşturur. Yeni kayıtlar bu kümelerin arkasına eklenir; aramalar daha çok yuva gezer. Sadece hash hesabının sabit maliyetli olması bütün aramanın sabit maliyetli olduğunu göstermez.

**Silme uyarısı.** Hiç kullanılmamış boş yuva aramayı durdurabilir. Fakat silinen bir kaydın yerini sıradan boş yapmak doğru değildir; sonraki örnek bunun nedenini gösterir.

## 18. “Silindi” ile “hiç kullanılmadı” farklıdır

[Ders sayfasındaki örnek 18](../onceki-ders.html#example-18) · [İlgili ders notu](../lecture-notes.html#topic-4-5)

**Problem.** Yedi yuvalı tabloda 7, 14, 21, 1 eklenmiş olsun. İlk üç anahtarın başlangıcı 0; 1'in başlangıcı 1'dir. Çakışmalardan sonra tablo şöyledir:

```text
Yuva:       0     1     2     3     4     5     6
Başlangıç:  7    14    21     1    boş   boş   boş
Yanlış sil: 7    boş   21     1    boş   boş   boş
Doğru sil:  7   SİLİNDİ 21   1    boş   boş   boş
```

**Yanlış silme neden tehlikeli?** 21'in araması 0'dan başlar. 7 eşit değildir; 1 numaralı yuvaya geçilir. Burayı “hiç kullanılmamış boş” sanarsak aramayı durdururuz. Oysa 21 hemen sonraki yuvadadır. İçerik kaybolmamıştır, ama algoritma ona ulaşamamaktadır.

**Çözüm: tombstone, silindi işareti.** İşaret “burada kayıt yok, fakat yoklama yolu burada bitmez” der. Arama 0 → 1 → 2 ilerler ve 21'i bulur. Üç yuva incelenir. Bu işaret normal bir anahtarla karışmayacak ayrı bir durum olmalıdır.

**Eklemede ince ayrıntı.** İlk silindi yuvası yeniden kullanılabilecek adaydır. Ancak aynı anahtarın daha ileride bulunmadığını kontrol etmeden hemen yeni kayıt yazmak, sözlükte tekrar oluşturabilir. Uygun arama sonuna kadar ilerleyip mevcut anahtarı güncellemek veya ilk silindi yerine eklemek gerekir. Dolaşım yine m denemeyle sınırlandırılmalıdır.

**Performans.** Çok sayıda silindi işareti varsa canlı kayıt sayısı az olsa bile aramalar uzun sürebilir. Tabloyu yeniden kurmak bu işaretleri temizler. Bu yüzden yalnızca canlı kayıtların doluluk oranına bakmak her zaman yeterli değildir.

## 19. Doluluk oranı ve yeniden yerleştirme

[Ders sayfasındaki örnek 19](../onceki-ders.html#example-19) · [İlgili ders notu](../lecture-notes.html#topic-4-6)

**Problem.** Yük faktörü (load factor) `α = n/m` olarak tanımlanır. Dört kayıt beş yuvada α = 4/5 = 0,8; on yuvada α = 4/10 = 0,4 eder. Daha fazla boşluk genellikle çakışma çözümünü kolaylaştırır; daha fazla bellek kullanır.

**Tablo büyüyünce kayıtlar neden taşınır?** Hash kuralında m değişti. Örneğin `8 mod 5 = 3`, fakat `8 mod 10 = 8`. Yeni tabloda 8'i eski yerinde bırakırsak yeni arama kuralı onu orada aramayabilir.

```text
5 yuva:  [10, 15, 20, 8, boş]
10 yuva: [10, 20, boş, boş, boş, 15, boş, boş, 8, boş]
```

Yeni tabloda 10, 0'a; 15, 5'e; 20, başlangıcı 0 dolu olduğu için 1'e; 8 ise 8'e yerleşir. Sadece dizinin sonuna boş alan eklemek yetmez: mevcut kayıtların yeni kuralla tekrar yerleştirilmesi gerekir.

**Tek işlem pahalı olabilir.** Büyütmeyi tetikleyen ekleme, bütün eski kayıtları işlediği için pahalıdır. Geometrik kapasite artışı, örneğin iki katına çıkarma, yeniden kurma masrafının uzun bir ekleme dizisine yayılmasını sağlar. İyi hash ve kontrollü doluluk varsayımlarıyla beklenen amortize ekleme maliyeti O(1) olabilir. Bu, her eklemenin O(1) sürdüğü anlamına gelmez.

**İki yöntemi ayırın.** Zincirlemede α = 2, kova başına ortalama iki kayıt demektir ve mümkündür. Her yuvaya tek kayıt koyan açık adreslemede n > m olamaz. Ayrıca silindi işaretleri, canlı kayıt sayısı düşükken bile yoklama maliyetini artırabilir.

## 20. En kötü, beklenen ve amortize: üç ayrı iddia

[Ders sayfasındaki örnek 20](../onceki-ders.html#example-20) · [İlgili ders notu](../lecture-notes.html#topic-4-7)

**Problem.** “Hızlı” kelimesi farklı matematiksel iddiaları gizleyebilir. Hangi anlamı kullandığımızı söylemezsek mühendislik açısından yanlış karar verebiliriz.

| İfade | Ne söyler? | Ne söylemez? |
|---|---|---|
| En kötü O(log n) | Modeldeki her geçerli durum için maliyetin logaritmik üst sınırı var | Her işlem aynı süreyi alır |
| Beklenen O(1) | Belirtilen olasılık modeli altında maliyetin beklenen değeri sabit sınırda | Kötü çakışma hiç olmaz |
| Amortize O(1) | Uzun bir işlem dizisindeki toplam maliyet, işlem sayısına bölününce sabit sınırda | Dizideki her işlem ucuzdur |

**Dengeli ağaç:** Yüksekliği sınırlı tuttuğu için temel işlemlerde en kötü O(log n) garantisi verir. **Hash tablosu:** Uygun hash dağılımı ve doluluk kontrolü altında beklenen O(1) arama sağlayabilir; kötü çakışma durumunda O(n) olabilir.

**Amortize düşünceyi somutlaştıralım.** Kapasiteler 1, 2, 4, 8, … diye büyürse taşınan kayıt sayıları da yaklaşık 1 + 2 + 4 + … olur. n eklemeye kadar bu toplam n'nin sabit katıyla sınırlanabilir. Toplam taşıma işinin n ekleme arasında paylaştırılması sabit maliyet verir. Bu, rastgelelik kullanmadan yapılan bir toplam maliyet hesabıdır. Hash tablosunda buna çakışmaların beklenen maliyet hesabı da eklenebilir; bu nedenle “beklenen amortize” iki ayrı niteliği birlikte söyler.

**Mühendislik sonucu.** Kesin zaman sınırı olan bir kontrol görevinde nadir bir pahalı işlem de önemli olabilir. Bununla birlikte O gösterimi tek başına gerçek zaman garantisi değildir: anahtar uzunluğu, bellek tahsisi, önbellek ve donanım da hesaba katılır. Önce hangi işlemin, hangi varsayımlar altında ölçüldüğünü sorun.

## 21. İkinci mola — hash tablosunu cevaplarla toparlayalım

[Ders sayfasındaki örnek 21](../onceki-ders.html#example-21) · [İlgili ders notu](../lecture-notes.html#topic-8)

Bu kart 124–134. dakikalar arasındaki on dakikalık moladır. Yeni bir veri yapısı değildir. Aşağıdaki sorular, birbirine benzeyen kavramları ayırmak içindir.

**Soru: İki anahtarın hash sonucu aynıysa anahtarlar aynı mıdır?** Hayır. 8 ve 13, mod 5 altında 3 verir. Hash başlangıcı belirler; gerçek anahtar eşitliği ayrıca kontrol edilir.

**Soru: Zincirleme ile doğrusal yoklama arasındaki temel fark nedir?** Zincirlemede aynı kovada birden çok kayıt bir listede tutulabilir. Doğrusal yoklamada kayıtlar tablonun farklı yuvalarına taşar; her yuva bir kayıt tutar. Doluluk ve silme davranışları bu yüzden farklıdır.

**Soru: Silindi işareti neden gereklidir?** O yuvadan geçmiş kayıtların daha ileride olabileceği bilgisini korur. Aramayı yanlışlıkla erken durdurmayı önler. İşaret, kayıt var demek değil, “aramaya devam et” demektir.

**Soru: Kapasiteyi artırmak neden tek başına yeterli değildir?** Hash hesabında kullanılan m değişebilir. Mevcut anahtarların başlangıç yuvaları yeniden hesaplanmalı ve kayıtlar yeni tabloya yerleştirilmelidir.

**Soru: Beklenen O(1), en kötü O(1) midir?** Hayır. Beklenen sonuç olasılık varsayımlarına bağlıdır; kötü dağılımda daha uzun aramalar olabilir. Amortize O(1) de farklıdır: maliyeti bir işlem dizisinin toplamı üzerinden değerlendirir.

**Özet cümlesi:** “Hash, aramaya nereden başlayacağımızı hesaplar; çakışma yöntemi, aramanın nasıl devam edeceğini belirler.”

## 22. İyi hash kuralı gerçek anahtarları yaymalıdır

[Ders sayfasındaki örnek 22](../onceki-ders.html#example-22) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

**Problem.** Sensör kimlikleri `[10, 20, 30, 40]`. Mod 10 kuralı hepsini 0'a gönderir. On kovamız olsa bile dokuzu işe yaramaz.

| Anahtar | mod 10 | mod 7 |
|---:|---:|---:|
| 10 | 0 | 3 |
| 20 | 0 | 6 |
| 30 | 0 | 2 |
| 40 | 0 | 5 |

Mod 7 bu dört anahtarı farklı kovalara dağıtır. Ancak “asal sayı seç, bütün sorun çözülsün” sonucu çıkarılamaz. Yeni anahtarlar `[7, 14, 21]` olursa mod 7 hepsini yine 0'a gönderir. Buradaki başarı, seçilen anahtar örüntüsüyle ilişkilidir.

**İyi davranış için ne gerekir?** Hesap uygun maliyetli olmalı, kullanılan anahtarların özelliklerini makul biçimde dağıtmalı ve aramayla eklemede aynı yapılandırma kullanılmalıdır. Aynı anahtar, aynı tablo yapılandırmasında aynı başlangıcı vermelidir; aksi halde eklenen kayıt bulunamaz. Bazı gerçek sistemler saldırganın çakışmaları özellikle üretmesini zorlaştırmak için rastgeleleştirilmiş hash kullanır.

**Gözlem ile garanti farklıdır.** Dört örneğin ayrı yerlere düşmesi, bütün olası anahtarlar için çakışmasızlık kanıtı değildir. Veri dağılımını, yük faktörünü ve çakışma çözümünü birlikte değerlendirmek gerekir.

**Kontrol ve cevap.** Mod 7 için 28 nereye gider? 0'a. Dolayısıyla mevcut 7, 14 ve 21 grubuna çakışarak katılır. Hash tablosu için uygun dağılım sağlamak ile güvenlik amaçlı kriptografik hash tasarlamak da aynı problem değildir.

## 23. Çakışmalar neden beklenenden erken gelir?

[Ders sayfasındaki örnek 23](../onceki-ders.html#example-23) · [İlgili ders notu](../lecture-notes.html#topic-5-2)

**Problem.** 365 kovadan her birinin eşit olasılıkla seçildiğini ve seçimlerin bağımsız olduğunu varsayalım. Soru “belirli iki kaydın çakışması” değil, “grupta herhangi iki kaydın çakışması”dır. Bu iki soru çok farklıdır.

**İki kayıt:** İlk kayıt nereye giderse gitsin, ikincinin aynı kovaya düşme olasılığı 1/365 ≈ %0,274'tür. Küçük görünür. **23 kayıt:** Birbirine denk gelebilecek çift sayısı `23 × 22 / 2 = 253` olur. Artık çok sayıda çakışma fırsatı vardır.

**Tam olasılığı tersinden hesaplayalım.** Hiç çakışma olmaması için ikinci kayıt 364 boş seçenekten birini, üçüncü 363 boş seçenekten birini, …, yirmi üçüncü 343 boş seçenekten birini seçmelidir.

```text
P(hiç çakışma yok) = 1 × (364/365) × (363/365) × … × (343/365)
                   ≈ 0,492703
P(en az bir çakışma) = 1 − 0,492703 ≈ 0,507297 ≈ %50,73
```

**Neden 253/365 demiyoruz?** Bu sayı yaklaşık 0,693'tür ve bu modelde çakışan çift sayısının beklenen değeridir. “En az bir çakışma” olasılığı değildir. Aynı sonuçta birden fazla çift çakışabilir; olaylar örtüşür. Çiftlerin olasılıklarını doğrudan toplamak bunları tekrar sayar.

**Genel fikir.** Çift sayısı n² mertebesinde büyüdüğü için, çakışma olasılığı tablo dolmadan çok önce anlamlı hale gelir; eşit ve bağımsız dağılım modelinde ölçek yaklaşık √m'dir. Bu, hash tablosunun yarı dolu olduğu anlamına gelmez: 23/365 yalnızca yaklaşık %6,3'tür.

**Ne alınmalı?** Çakışmayı olağan bir durum olarak tasarlayın. Gerçek doğum günleri veya gerçek hash dağılımları tam bu modele uymayabilir; %50,73 sonucu belirtilen varsayımların sonucudur.

## 24. İki ölçümün toplamını bulmak

[Ders sayfasındaki örnek 24](../onceki-ders.html#example-24) · [İlgili ders notu](../lecture-notes.html#topic-5-4)

**Problem.** Ölçümler `[4, 7, 1, 6]`, hedef 10. Farklı iki konumdaki değerin toplamı 10 olsun istiyoruz. Bütün çiftleri denemek yerine, daha önce gördüğümüz değerleri bir hash kümesinde tutacağız.

| Şimdiki x | Gerekli değer 10 − x | Daha önce görüldü mü? | Sonuç |
|---:|---:|---|---|
| 4 | 6 | Hayır; küme boş | 4'ü ekle |
| 7 | 3 | Hayır; küme {4} | 7'yi ekle |
| 1 | 9 | Hayır; küme {4, 7} | 1'i ekle |
| 6 | 4 | Evet | 4 + 6 = 10; bulundu |

**Korunan bilgi.** Her adımın başında küme yalnızca önceki konumlardaki değerleri içerir. Bu nedenle kümede bulunan tamamlayıcı, şimdiki elemandan farklı bir konuma aittir. Bir çözüm varsa, o çiftin daha sonra gelen elemanına ulaştığımızda önce geleni kümede buluruz.

**Neden önce kontrol, sonra ekleme?** Hedef 10 ve veri yalnızca `[5]` olsun. Önce 5'i eklersek sonra 5'in tamamlayıcısı 5'i bulup aynı konumu iki kez kullanabiliriz. Önce kontrol edersek küme boş olduğundan doğru şekilde çift bulunmaz. `[5, 5]` için ikinci 5 geldiğinde ilk 5 kümede bulunur; bu geçerli çifttir.

**Maliyet.** Her eleman için bir arama ve gerekirse bir ekleme yapılır. Uygun hash varsayımlarıyla toplam beklenen O(n) zaman ve O(n) ek alan kullanılır. Kötü çakışma davranışında toplam O(n²)'ye çıkabilir. Bu çözüm bir çift bulmayı amaçlar; bütün çiftleri listelemek farklı bir görevdir ve çıktı sayısı karesel olabilir.

## 25. Metin arama: önce hash, sonra gerçek harfler

[Ders sayfasındaki örnek 25](../onceki-ders.html#example-25) · [İlgili ders notu](../lecture-notes.html#topic-5-5)

**Problem.** `ABRACADABRA` içinde `ABRA` arıyoruz. Metin uzunluğu N = 11, desen uzunluğu M = 4. Dört harflik pencereyi birer karakter kaydırırsak `N − M + 1 = 8` aday pencere oluşur. Konumlar 0'dan başlar.

| Başlangıç | Pencere | Hash (taban 31, mod 101) | Karar |
|---:|---|---:|---|
| 0 | ABRA | 22 | Desenle harf harf aynı; eşleşme |
| 1 | BRAC | 22 | Hash aynı, harfler farklı; çakışmayı ele |
| 2 | RACA | 43 | Hash farklı; ele |
| 3 | ACAD | 55 | Hash farklı; ele |
| 4 | CADA | 33 | Hash farklı; ele |
| 5 | ADAB | 4 | Hash farklı; ele |
| 6 | DABR | 85 | Hash farklı; ele |
| 7 | ABRA | 22 | Desenle harf harf aynı; eşleşme |

**Hash nasıl hesaplanır?** ASCII kodları A = 65, B = 66, R = 82, C = 67, D = 68. Dört harf için `H = (c₀·31³ + c₁·31² + c₂·31 + c₃) mod 101`. ABRA için sonuç 22'dir. Üsler harfin konumunu ayırt eder; yalnızca karakter kodlarını toplamak sıralama bilgisini kaybeder.

**Her pencereyi baştan hesaplamıyoruz.** Soldan çıkan harfin katkısını çıkarır, kalan ifadeyi 31 ile çarpar ve yeni harfi ekleriz. `31³ mod 101 = 97` önceden hesaplanır:

```text
H_yeni = ((H_eski − çıkan_harf × 97) × 31 + giren_harf) mod 101
ABRA → BRAC: ((22 − 65 × 97) × 31 + 67) mod 101 = 22
```

Bu, **rolling hash**, yani kaydırılarak güncellenen hash fikridir. Python'da pozitif modül ile `%` sonucu 0…100 aralığına getirir; başka bir dilde negatif kalan davranışına dikkat etmek gerekebilir.

**Neden harfleri yine kontrol ediyoruz?** Farklı hash değerleri farklı metinleri garanti eder; aynı hash değeri eşit metin garantisi vermez. Bu nedenle 22 çıkan pencerelerde gerçek karakter eşitliği doğrulanır. Özellikle BRAC de 22 verir ama ABRA değildir; daha ilk harfte B ≠ A olduğu görülür ve aday elenir. Bu örnek çakışmanın yalnızca teorik bir ihtimal olmadığını doğrudan gösterir. Böylece hash çakışması yanlış eşleşme sonucuna dönüşmez.

**Maliyet.** Sabit boyutlu aritmetik varsayımıyla ilk hesap ve hazırlık O(M), her kaydırma O(1)'dir. Fakat hash eşleşmelerindeki harf kontrolü O(M) sürebilir. Bu yüzden doğrulamalı yöntemin en kötü toplam maliyeti O(NM)'ye çıkabilir; her durumda doğrusal çalışma garantisi vermez. Bu örnekte doğru eşleşmeler 0 ve 7'dir.

## 26. Parmak izi ipucudur; kimliğin kendisi değildir

[Ders sayfasındaki örnek 26](../onceki-ders.html#example-26) · [İlgili ders notu](../lecture-notes.html#topic-5-3)

**Problem.** Dosyaları kısa hash değerleriyle grupluyoruz. Aynı hash'e sahip iki dosya görünce bunların aynı dosya olduğunu söyleyebilir miyiz? Matematiksel olarak hayır.

**Sayfadaki somut çakışma.** Basit kural “karakter kodlarını topla, mod 101 al” olsun. `AB` için `(65 + 66) mod 101 = 30`, `BA` için `(66 + 65) mod 101 = 30` bulunur. Parmak izleri aynı, metinler farklıdır. İlk karakteri karşılaştırmak bile A ≠ B farkını ortaya çıkarır. Bu kural karakterlerin sırasını korumadığı için bu çakışma kolayca oluşur. Önceki örneğin konuma duyarlı hash'i de çakışabilir; yalnızca çakışmanın biçimi farklıdır.

**Güvercin yuvası ilkesi.** Örneğin yalnızca 100 farklı hash çıktımız varsa, 101 farklı dosyayı bu çıktılara yerleştirirken en az iki dosya aynı çıktıyı paylaşmak zorundadır. Gerçek sabit uzunluklu hash uzayı çok daha büyük olabilir, fakat olası dosya sayısı çıktı sayısından fazla olduğunda aynı mantık geçerlidir.

```text
Dosyalar → hash hesapla → aynı hash'e sahip adayları grupla
                            ↓
                  kesin eşitlik gerekiyorsa baytları karşılaştır
```

**İki yön aynı değildir.** Aynı hash algoritmasıyla aynı tam içerik daima aynı hash'i verir. Bu nedenle farklı hash'ler içeriklerin farklı olduğunu gösterir. Tersi zorunlu değildir: aynı hash, aynı içerik anlamına gelmeyebilir. Kullanılan algoritma veya anahtarlı yapılandırma farklıysa sonuçları doğrudan bu şekilde karşılaştıramayız.

**Mühendislik kullanımı.** Hash, büyük aday kümesini küçültmek için yararlıdır. Kesin kopya dosya tespitinde uygun adaylar bulunduktan sonra gerçek baytlar karşılaştırılabilir. Dosyanın hash'ini ilk kez üretmek de dosyayı okumayı gerektirir; kısa çıktıyı karşılaştırmak hızlı diye bütün işlem maliyetsiz olmaz.

**Güvenlik ayrımı.** Kriptografik hash'ler çakışma üretmeyi hesaplama açısından zorlaştıracak ek özellikler amaçlar. Dersin mod 5 veya mod 101 örnekleri bu güvenlik özelliğini taşımaz. “Çakışma mümkün” ile “pratikte kolayca bulunabilir” de farklı iddialardır.

## 27. Makinenin sorusuna göre veri yapısı seçmek

[Ders sayfasındaki örnek 27](../onceki-ders.html#example-27) · [İlgili ders notu](../lecture-notes.html#topic-6-1)

**Problem.** İki mühendislik görevi düşünelim: “CAN kimliği 70 geldi; hangi işleyici çağrılacak?” ve “Zamanı 30 ile 60 arasında olan bütün ölçümleri getir.” İkisi de arama içerir ama ihtiyaçları aynı değildir.

**Tam anahtarla arama.** CAN kimliği için doğrudan bir kimlik–işleyici eşlemesi gerekir. Uygun hash tablosu beklenen O(1) erişim sağlayabilir. Anahtarların sırası gerekmiyorsa hash'in sıralama tutmaması sorun değildir. Küçük ve sabit kimlik uzayında doğrudan indekslenen bir tablo; az sayıda sabit kayıt için sıralı dizi de uygun olabilir. Hash tek doğru cevap değildir.

**Aralık sorgusu.** Dengeli BST'de önce 30'dan küçük olmayan ilk kaydı buluruz, sonra anahtar sırasıyla ilerler ve 60'ı aşınca dururuz. Uygun inorder yürüyüşü veya yineleyiciyle toplam O(log n + k) maliyet mümkündür; k döndürülen kayıt sayısıdır. Her sonraki kayıt için kökten bağımsız yeni arama yapmak aynı uygulama değildir.

```text
Anahtarlar: 10  20  [30  40  50  60]  70  80
                     └─ istenen aralık ─┘
```

**Neden +k?** Kayıtları gerçekten listeleyeceksek k tanesini üretmek en az k kadar çıktı işi gerektirir. “Aralık sorgusu yalnızca O(log n)” demek çıktı maliyetini saklar. Ek bir sıralı indeks yoksa standart hash tablosu bu aralık için bütün kayıtları taramak zorunda kalabilir.

**Gerçek sistem ayrıntısı.** Aynı zaman damgasına birden çok ölçüm düşebilir; değer listesi veya `(zaman, sıra_numarası)` gibi birleşik anahtar gerekir. Kesin gecikme sınırları varsa yeniden boyutlandırma, bellek tahsisi ve en kötü durum da değerlendirilir.

## 28. Son kontrol: seçiminizi ve işlemlerinizi açıklayın

[Ders sayfasındaki örnek 28](../onceki-ders.html#example-28) · [İlgili ders notu](../lecture-notes.html#topic-7-1)

**Ağaç görevi.** Sırayla 30, 10, 50, 40 ekleyin. 30 kök; 10 solda; 50 sağda; 40, 50'nin solunda olur.

```text
Başlangıç:           30 silindikten sonra:
     30                       40
    /  \                     /  \
  10    50                 10    50
       /
      40
```

40'ı aramak için 30 → 50 → 40: üç düğüm ziyareti. 30'u silmek için sağ alt ağacın minimumu 40 bulunur; kaydı kök konumuna aktarılır ve eski 40 düğümü kaldırılır. Sonuçta 10 < 40 < 50 koşulu korunur. “40'ı köke koyduk” demek tek başına yeterli açıklama değildir; neden sıralamanın bozulmadığını da söylemeliyiz.

**Hash görevi.** m = 5 ve doğrusal yoklama ile 10, 15, 20 ekleyin. Üçü de 0'dan başlar; sırasıyla 0, 1, 2 yuvalarına yerleşir. 15 silinince 1 numaralı yuva silindi işareti taşır. 20'yi ararken 0 → 1 → 2 izlenir; işarette durulmaz.

```text
Yuva:    0      1      2     3    4
İçerik: 10   SİLİNDİ  20   boş  boş
```

**Ortak fikir.** Ağaçta sıralama bilgisini; hash tablosunda kaydın ulaşılabilir olduğu yoklama yolunu koruyoruz. Veri yapısında güncelleme, yalnızca bir kaydı ekleyip çıkarmak değildir. Sonraki aramanın kullandığı kuralları da geçerli bırakmak gerekir.

**Tam cevap nasıl görünür?** “Şu yapıyı seçtim; çünkü sorgum şu. Bu adımları uyguladım. Şu özelliği korudum. Maliyetim şu varsayımlar altında şu.” Böyle bir açıklama hem doğruluğu hem performansı denetlenebilir kılar. BST için otomatik logaritmik, hash için otomatik sabit en kötü zaman iddiasından kaçının.

