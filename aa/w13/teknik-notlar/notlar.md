# AA · 13. Hafta — 22 örneğin Türkçe teknik açıklaması

Bu notlar **dinamik programlama uygulamaları** dersindeki 22 kartı aynı sırayla açıklar. Her bölüm ilgili örneğe ve ders notuna bağlanır. 9 ve 16 numaralı mola kartlarında cevaplı tekrar bulunur. Açıklamalar ve cevaplar menü açmadan okunabilir.

Bu haftanın sorusu “hangi formülü ezberlemeliyim?” değil, **“bu hücre hangi küçük sorunun cevabı?”** sorusudur. Aynı biçimde görünen iki tablo farklı şeyler hesaplayabilir.

- **Durum:** Kalan hesabı belirleyen bilgiler. İki metnin önek uzunlukları veya kullanılan nesne sayısıyla kapasite gibi.
- **Önek:** Baştan alınan bölüm. `cat` metninin uzunluğu 2 olan öneki `ca`dır.
- **Taban durum:** Cevabı doğrudan bilinen küçük soru. Boş metni üç harfe dönüştürmek üç ekleme gerektirir.
- **Geçiş:** Küçük cevaplardan yeni cevabın nasıl kurulacağı.
- **Minimum / maksimum:** Sırasıyla adayların en küçüğü / en büyüğü. Önce hangi ölçüyü iyileştirdiğimizi belirtmeliyiz.
- **∞:** Ulaşılamayan durumun işareti. Çok büyük ama geçerli bir çözüm değildir.
- **Geriye izleme:** Sonuç hücresinden önceki seçimleri takip ederek bir çözümün nasıl oluştuğunu bulma.
- **Alt dizi:** Sıra korunur, aradan eleman atlanabilir. **Bitişik parça:** Aradan eleman atlanamaz.

Hesap maliyetlerinde, aksi söylenmedikçe küçük tamsayıların karşılaştırılması ve toplanması birim işlem kabul edilir. Bir tabloya sahip olmak doğruluk veya küçük çalışma süresi garantisi değildir.

## 1. Her tablo hücresine açık bir anlam verin

[Ders sayfasındaki örnek 1](../#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Problem.** “6 numaralı hücrede 2 var” tek başına bir açıklama değildir. Bu 2, iki çözüm mü, iki para mı, iki saniye mi? Önce birimi ve amacı söylemeliyiz: “6 tutarını oluşturmak için gereken en az para sayısı 2.”

| Tasarım sorusu | Para örneğindeki cevap |
|---|---|
| Durum neyi tutuyor? | `dp[t]`: t tutarı için en az para sayısı |
| Başlangıç nedir? | `dp[0]=0` |
| Seçenekler nelerdir? | Son paranın değeri 1, 3 veya 4 olabilir |
| Nasıl birleştiriliyor? | Geçerli adayların minimumu |
| Sonuç nerede? | Hedef 6 ise `dp[6]` |

**Neden önce anlam?** Aynı paralardan 6 yapmanın kaç yolu olduğunu sorsaydık minimum almak yanlış olurdu. Ayrıca sıralı dizileri mi yoksa sırasız para çokluklarını mı saydığımızı belirtmemiz gerekirdi. Görünüşte doğru çalışan bir döngü yanlış soruyu çözebilir.

**Hesaplama sırası.** Pozitif para değerlerinde `t−c`, t'den küçüktür. Küçük tutarlardan büyüklere gidersek gereken cevaplar hazırdır. Önbellekli özyineleme de aynı bağıntıyı ihtiyaç oldukça hesaplayabilir.

**Maliyet.** T+1 durum ve her durumda k para seçeneği varsa bu uygulama O(kT) zaman kullanır. “DP kullandık, hızlıdır” yerine durum ve seçenek sayılarını sayıyoruz.

**Kontrol ve cevap.** `dp[6]=2` bize hangi iki paranın seçildiğini de verir mi? Hayır. Yalnızca minimum sayıyı verir. Gerçek para listesini üretmek için bir en iyi seçimi kaydetmek veya tablodan geri çıkarmak gerekir.

## 2. Altı tutarını en az sayıda parayla oluşturmak

[Ders sayfasındaki örnek 2](../#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

1,3,4 değerli paralardan sınırsız kopya var. Büyükten başlamak 4+1+1 ile üç para kullanır. 3+3 ise iki para kullanır. 6 değerli tek para olmadığı için iki paranın optimum olduğu da anlaşılır.

`dp[t]`, tam t tutarını oluşturmak için gereken en az para sayısı olsun. `dp[0]=0`; ulaşılamayan tutar ∞ olarak kalır. Pozitif c parası sığıyorsa aday `1+dp[t−c]` olur. Baştaki 1, son eklenen parayı sayar.

| Tutar t | Son paraya göre adaylar | Minimum |
|---|---|---|
| 0 | Hiç para kullanma | 0 |
| 1 | 1+dp[0] | 1 |
| 2 | 1+dp[1] | 2 |
| 3 | 1+dp[2], 1+dp[0] | 1 |
| 4 | 1+dp[3], 1+dp[1], 1+dp[0] | 1 |
| 5 | 1+dp[4], 1+dp[2], 1+dp[1] | 2 |
| 6 | 1+dp[5]=3, 1+dp[3]=2, 1+dp[2]=3 | 2 |

**Neden doğru?** Her boş olmayan çözümün bir son parası vardır. O parayı çıkarınca kalan tutar için bir çözüm kalır. Bu kalanı daha az parayla yapabilseydik bütün çözümü de iyileştirebilirdik. Bütün olası son paraları deneyip minimum almak seçenekleri kapsar.

**Görseli okuma.** Her adım bir tutarı tamamlar. Sağdaki ∞ değerleri henüz doldurulmamış da olabilir; ilgili tutarın adımı tamamlanmadan “kesinlikle yapılamaz” demeyin.

**Kontrol ve cevap.** Yalnızca 3 ve 4 varsa 2 yapılamaz; `dp[2]=∞`. Bunu 0 yapmak “2 tutarı hiç para kullanmadan yapılabilir” gibi yanlış bir anlam verir. Bu problem her nesnenin bir kez alındığı sırt çantası problemi değildir.

## 3. cat sözcüğünü cut yapmak

[Ders sayfasındaki örnek 3](../#example-3) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

İzin verilen işlemler bir harf ekleme, bir harf silme ve bir harfi değiştirmedir; her biri 1 maliyetlidir. Aynı harfi eşleştirmek 0 maliyetlidir. `cat → cut` için a yerine u yazmak yeterlidir; cevap 1'dir.

**Durum.** `D[i][j]`, kaynak metnin ilk i harfini hedefin ilk j harfine dönüştürmenin minimum maliyetidir. Örneğin `D[2][2]`, `ca → cu` sorusudur; bütün sözcükleri değil önekleri karşılaştırır.

| Son işlem | Önce çözülmüş soru | Aday maliyet |
|---|---|---|
| Kaynağın son harfini sil | İlk i−1 kaynak → ilk j hedef | D[i−1][j]+1 |
| Hedefin son harfini ekle | İlk i kaynak → ilk j−1 hedef | D[i][j−1]+1 |
| Son harfleri eşleştir/değiştir | İlk i−1 kaynak → ilk j−1 hedef | D[i−1][j−1]+0 veya 1 |

`ca → cu` hücresinde silme 2, ekleme 2, değiştirme 1 verir. En küçük 1 seçilir. Son t harfleri aynı olduğundan `cat → cut` hücresinin köşegen adayı bu 1'e sıfır ekler.

**Neden bütün seçenekler?** Bir hizalamadaki son adım ya kaynak harfini boşlukla, ya hedef harfini boşlukla, ya da iki harfi birbirleriyle eşleştirir. Bu üç seçenek uygun küçük önek sorularına iner.

**Kontrol ve cevap.** `cat → cat` maliyeti 0'dır. `ab → ba` ise bu modelde 1 değildir: harflerin yerini değiştirmek tek işlem olarak tanımlanmadı. İşlem kümesi değiştirilirse başka bir uzaklık hesaplanır.

## 4. Boş satır ve sütun gerçek problemleri temsil eder

[Ders sayfasındaki örnek 4](../#example-4) · [İlgili ders notu](../lecture-notes.html#topic-2-7)

Kaynak satırlarda, hedef sütunlarda olsun. ∅ işareti boş önektir; metnin içine eklenmiş bir karakter değildir.

| Kaynak / hedef | ∅ | c | cu | cut |
|---|---|---|---|---|
| ∅ | 0 | 1 | 2 | 3 |
| c | 1 | 0 | 1 | 2 |
| ca | 2 | 1 | 1 | 2 |
| cat | 3 | 2 | 2 | 1 |

**Üst satır.** Boştan `cut` yapmak üç ekleme gerektirir. Bu yüzden `D[0][j]=j`. **Sol sütun.** `cat` metnini boşaltmak üç silme gerektirir; `D[i][0]=i`.

**Bir hücrenin hesabı.** Son hücre `D[3][3]` için yukarıdan silme 2+1=3, soldan ekleme 2+1=3, köşegenden t eşleşmesi 1+0=1. Cevap 1. Sınırları yanlışlıkla sıfır doldurmak bu adayları da yanlış ucuzlatır.

**Sıra.** Satırları yukarıdan aşağı, her satırı soldan sağa doldurmak yeterlidir. Yukarı, sol ve sol üst hücreler hesap anında hazırdır. Her tabloda bu sıranın çalışacağını varsaymayın; bağımlılıklara bakın.

**Maliyet.** m ve n metin uzunluklarıdır. Sınırlar dahil (m+1)(n+1) hücre vardır; hücre başına üç aday karşılaştırılır. Genel ifade O((m+1)(n+1)); iki uzunluk da pozitifken O(mn) denir. Biri boşken sınırı hazırlamak yine doğrusal iş gerektirir.

**Kontrol ve cevap.** Yalnızca uzaklık isteniyorsa iki satır saklanabilir. Ama bütün tabloyu çizmek veya standart geri izlemeyi yapmak istiyorsak geçmiş bilgilerin nasıl korunacağını ayrıca planlamalıyız.

## 5. Yalnızca işlem sayısını değil işlemleri de bulmak

[Ders sayfasındaki örnek 5](../#example-5) · [İlgili ders notu](../lecture-notes.html#topic-2-5)

`sun → snow` için bir optimum dönüşüm şöyledir:

```text
sun → sn     u silindi: 1
sn  → sno    o eklendi: 1
sno → snow   w eklendi: 1
Toplam: 3
```

**Üç işlem yeterli, ama gerekli mi?** Uzunluk farkı 1 olduğu için iki işlemle dönüşüm olsaydı bunlar bir ekleme ve bir değiştirme olmak zorundaydı. `snow`dan eklenen tek harfi çıkardığımızda `now`, `sow`, `snw` veya `sno` kalır. Bunların hiçbiri `sun`dan tek harf değişikliğiyle elde edilemez. Dolayısıyla iki işlem yetmez; üç işlemlik örnek optimumdur.

**Tablodan çözüm çıkarma.** Sağ alt hücreden başlayın. Mevcut değeri açıklayan bir önceki hücre bulun. Köşegen eşleşme/değiştirme, yukarı silme, sol ekleme anlamına gelir. Adımlar sondan başa toplandığı için sonunda ters çevrilir.

**Birden fazla doğru cevap.** Eşit maliyetli öncüller olabilir. Görsel önce köşegen, sonra silme, sonra ekleme seçer. Bu nedenle yazılı örnekten farklı ama yine üç maliyetli bir hizalama gösterebilir. Aynı minimum maliyet, aynı işlem dizisini zorunlu kılmaz.

**Kontrol ve cevap.** İşlem dizisinin gerçekten optimum olduğunu yalnızca üç işlem yazmak kanıtlar mı? Hayır; bu yalnızca en fazla üç işlem gerektiğini gösterir. DP minimum hesabı veya yukarıdaki alt sınır gerekçesi, daha ucuz çözüm olmadığını tamamlar.

## 6. Kendi sözcüklerinizi deneyin

[Ders sayfasındaki örnek 6](../#example-6) · [İlgili ders notu](../lecture-notes.html#topic-2-4)

Kaynak ve hedef alanlarını değiştirip **Build table** düğmesine basın. **Step →** hesaplanan hücreleri sırayla gösterir. Turuncu hücre şu anda hesaplanandır; son adım minimum uzaklıkla birlikte bir optimum hizalama verir. Yeni girişler hem sayıları hem açıklamaları yeniden oluşturur.

| Kaynak | Hedef | Beklenen uzaklık | Gerekçe |
|---|---|---|---|
| cat | cat | 0 | Bütün harfler eşleşir |
| cat | cut | 1 | a yerine u |
| Boş | cut | 3 | Üç ekleme |
| ab | ba | 2 | İki değiştirme; tek-adım takas yok |
| A | a | 1 | Büyük/küçük harf ayrımı var |

**İki ayrı boşluk işareti.** Tablo sınırındaki ∅ boş öneki gösterir. Son hizalamadaki uzun çizgi ise o tarafta harf bulunmadığını, bir ekleme veya silme yapıldığını gösterir. İkisi de öğrencinin sözcüğüne ait bir harf değildir.

**Giriş sınırları.** Etkileşimli düzenleyici her alanda en fazla sekiz ASCII harfi kabul eder; boş sözcük kullanılabilir. Türkçe ş, ı gibi harfler ve boşluklar bu arayüzün izin verdiği kümede değildir. Bu, algoritmanın Türkçe metne uygulanamayacağı anlamına gelmez; ders arayüzünün sınırlamasıdır.

**Kontrol ve cevap.** Değiştirme maliyetini 2 yapmak için yalnızca sözcükleri değiştirmek yeterli mi? Hayır. Arayüzdeki model hâlâ değiştirmeyi 1 sayar. Maliyet kuralının da kodda değiştirilmesi gerekir. Sonucu yorumlarken girişle birlikte işlem modelini de belirtin.

## 7. Python kodunda tabloyu satır satır kurmak

[Ders sayfasındaki örnek 7](../#example-7) · [İlgili ders notu](../lecture-notes.html#topic-2-6)

Ana ders sayfasındaki **Run** düğmesi aşağıdaki kodu çalıştırır. Kod kaynakla bire bir aynıdır; giriş kutusu gerektiren `input()` çağrısı yoktur.

```python
source = "cat"
target = "cut"
m, n = len(source), len(target)
dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m + 1):
    dp[i][0] = i
for j in range(n + 1):
    dp[0][j] = j
for i in range(1, m + 1):
    for j in range(1, n + 1):
        replace_cost = 0 if source[i - 1] == target[j - 1] else 1
        dp[i][j] = min(dp[i - 1][j] + 1,
                       dp[i][j - 1] + 1,
                       dp[i - 1][j - 1] + replace_cost)
for row in dp:
    print(row)
print("Distance:", dp[m][n])
```

| Satır | Ne yapıyor, neden gerekli? |
|---|---|
| 1 | Kaynak metni belirler. Değiştirilen metin budur. |
| 2 | Ulaşılacak hedef metni belirler. |
| 3 | İki uzunluğu m ve n değişkenlerine koyar. |
| 4 | m+1 ayrı satır, her satırda n+1 hücre oluşturur. Ek satır/sütun boş önek içindir. |
| 5 | 0'dan m'ye bütün kaynak önek uzunluklarını gezer. |
| 6 | Sol sınırı i silmenin maliyetiyle doldurur. |
| 7 | 0'dan n'ye bütün hedef önek uzunluklarını gezer. |
| 8 | Üst sınırı j eklemenin maliyetiyle doldurur. |
| 9 | Boş olmayan kaynak öneklerini sırayla işler. |
| 10 | Her kaynak öneki için boş olmayan hedef öneklerini işler. |
| 11 | Son harfler aynıysa 0, farklıysa 1 seçer. Önek uzunluğu i, son karakter indeksi i−1'dir. |
| 12 | Minimum hesabını başlatır; ilk aday yukarıdaki cevaba bir silme ekler. |
| 13 | İkinci aday soldaki cevaba bir ekleme ekler. |
| 14 | Üçüncü aday köşegene eşleşme/değiştirme maliyetini ekler; minimum hücreye yazılır. |
| 15 | Bitmiş matrisin satırlarını sırayla alır. |
| 16 | O satırdaki değerleri ekrana yazar. |
| 17 | İki tam metnin cevabını, sağ alt hücreyi yazdırır. |

Beklenen çıktı:

```text
[0, 1, 2, 3]
[1, 0, 1, 2]
[2, 1, 1, 2]
[3, 2, 2, 1]
Distance: 1
```

**Önemli Python ayrıntısı.** 4. satırdaki liste üretimi her satırı ayrı oluşturur. `[[0]*(n+1)]*(m+1)` biçimi aynı satıra birden çok referans üretir; bir hücreyi değiştirince başka satırlar da değişebilir.

**Deney ve cevap.** Kaynağı `""`, hedefi `"cut"` yapın: tek satır `[0,1,2,3]`, uzaklık 3. İkisi de boşsa `[[0]]`, uzaklık 0. Kodun iç döngüleri çalışmasa bile sınırlar doğru cevabı sağlar. Kod görsel giriş kutusundaki sekiz ASCII harf sınırını uygulamaz; okunabilir çıktı için kısa metinler kullanın.

## 8. Ortak sırayı koruyun, aralarda boşluk olabilir

[Ders sayfasındaki örnek 8](../#example-8) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

`ABCD` ile `ACBD` karşılaştırılıyor. `ABD` her ikisinde de aynı sırada bulunur; bazı harfleri atlıyoruz. `ACD` de ortak ve uzunluğu 3'tür. Dört harfli ortak alt dizi olsaydı iki metnin tamamı aynı sırada olmalıydı; değiller. Bu nedenle en uzun ortak alt dizi uzunluğu 3'tür.

**Durum.** `L[i][j]`, iki öneğin en uzun ortak alt dizi uzunluğudur. Boş önekle ortak alt dizi yalnızca boş dizidir; sınır değerleri 0.

- Son harfler aynıysa `L[i−1][j−1]+1` kullanılır. Ortak son harfi eklemek bir önceki optimumu uzatır.
- Farklıysa iki son harfi birlikte eşleştiremeyiz. Kaynağın veya hedefin son harfini dışarıda bırakan iki sorudan büyük olan alınır: `max(L[i−1][j], L[i][j−1])`.

**Bitişik parça farkı.** `ABD`, `ABCD` içinde bitişik değildir; C atlanmıştır. En uzun ortak bitişik parçayı aramak başka bir problemdir, aynı geçişi kullanmaz.

**Düzenleme uzaklığı bağlantısı.** Yalnızca ekleme ve silme serbestse m+n−2L işlem yeterlidir ve gereklidir. Ortak L harfi tutar, kaynaktaki diğer m−L harfi siler, hedefteki diğer n−L harfi ekleriz. Burada 4+4−2×3=2.

**Kontrol ve cevap.** Bu formül, değiştirme maliyeti 1 olan her Levenshtein uzaklığını verir mi? Hayır. `a → b` için ortak alt dizi 0, yalnızca ekle/sil maliyeti 2, bir değiştirmeyle maliyet 1'dir.

## 9. İlk mola: aynı tablo biçimi, farklı anlamlar

[Ders sayfasındaki örnek 9](../#example-9) · [İlgili ders notu](../lecture-notes.html)

64–74. dakikalardaki moladan sonra aşağıdaki ayrımları kontrol edin.

| Soru | Taban değer | Birleştirme |
|---|---|---|
| En az para | Sıfır tutara 0 para | Minimum |
| Düzenleme uzaklığı | Boş öneğe ekleme/silme sayısı | Minimum |
| Ortak alt dizi uzunluğu | Boş önekle uzunluk 0 | Uygun durumda maksimum |

**Soru:** `D[2][3]` ne demektir? **Cevap:** İlk iki kaynak harfini ilk üç hedef harfine dönüştürmenin minimum maliyeti. “İkinci harfi üçüncü harfe dönüştürmek” değildir; tek karakterleri değil önekleri karşılaştırır.

**Soru:** Görselde bir boş hücre ile sayısal 0 aynı mı? **Cevap:** Hayır. Hesaplanmamış hücre henüz cevap değildir; 0 ise bazı durumlarda gerçekten maliyet sıfır demektir.

**Soru:** Minimum değeri yazdırmak çözümün nasıl oluştuğunu gösterir mi? **Cevap:** Hayır. Geriye izleme, değeri gerçekleştiren seçimleri ortaya çıkarır. Eşitliklerde farklı optimumlar mümkündür.

**Kısa uygulama.** `a → b` için üç aday 2,2,1'dir: silme yoluyla 2, ekleme yoluyla 2, değiştirme yoluyla 1. Ortak alt dizi uzunluğu ise 0'dır. Aynı iki metin üzerinde iki farklı soru farklı sayılar üretir.

## 10. Artan alt dizi için sırayı değiştirmeyin

[Ders sayfasındaki örnek 10](../#example-10) · [İlgili ders notu](../lecture-notes.html#topic-3-2)

Girdi `3,1,4,1,5,9,2,6`. Amaç bazı konumları seçerek değerleri kesin artan bir alt dizi bulmaktır. `3,4,5,6` geçerli ve uzunluğu 4'tür; değerler orijinal sıradadır.

**Durum.** `d[i]`, mutlaka i konumunda biten en uzun artan alt dizinin uzunluğudur. Her eleman tek başına uzunluk 1 verir. Daha önceki j konumu için `a[j]<a[i]` ise aday `d[j]+1`.

| Konum (1'den) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Değer | 3 | 1 | 4 | 1 | 5 | 9 | 2 | 6 |
| Burada biten en iyi uzunluk | 1 | 1 | 2 | 1 | 3 | 4 | 2 | 4 |

**Örnek hesap.** Son 6 için daha önceki 5'in uzunluğu 3 olduğundan 3+1=4 elde edilir. 9 daha önce olsa da 9<6 yanlış olduğundan uzatma adayı değildir. Sonuç bütün `d[i]` değerlerinin maksimumudur; en iyi alt dizinin son girdi elemanında bitmesi şart değildir.

**Neden sıralamıyoruz?** Sıralama, verilen zaman/konum düzenini değiştirir. Sensör ölçümleri zaman sırasındaysa bunları sıraya dizmek farklı bir deney olur.

**LCS bağlantısı.** Orijinal diziyi sıralanmış ve tekrarları kaldırılmış kopyasıyla LCS karşılaştırmasına sokmak kesin artan alt dizi uzunluğunu verir. Tekrarları bırakmak artmayan eşit değerleri kabul ederek başka bir soruya kayabilir.

**Kontrol ve cevap.** 1,1 kesin artan değildir; eşitlik kabul edilmez. Basit uygulama O(n²) karşılaştırma yapar. Daha hızlı yöntemler bulunsa da bu tablo hangi önceki cevabın uzatıldığını açıkça gösterir.

## 11. İki akışı kendi iç sıralarını bozmadan karıştırmak

[Ders sayfasındaki örnek 11](../#example-11) · [İlgili ders notu](../lecture-notes.html#topic-3-3)

Girdiler `AB` ve `CD`. Çıktı `ACBD` olabilir: A birinci akıştan, C ikinciden, B birinciden, D ikinciden alınır. `ADBC` olamaz; D, C'den önce kullanılmıştır.

**Durum.** `S[i][j]`, ilk akıştan i ve ikinciden j harf kullanarak çıktının ilk i+j harfinin oluşturulup oluşturulamadığıdır. Hücre sayı değil doğru/yanlış tutar. Önce çıktı uzunluğunun iki girdi uzunluğunun toplamı olduğunu kontrol ederiz.

`ACBD` için bir başarılı yol:

```text
(0,0) → A → (1,0) → C → (1,1) → B → (2,1) → D → (2,2)
```

**Geçiş.** Son çıktı harfi birinci akıştan geldiyse `S[i−1][j]` doğru olmalı ve o akışın i. harfi çıktıdaki son harfle eşleşmeli. İkinci akıştan geldiyse benzer biçimde `S[i][j−1]` kullanılır. İki koşuldan en az biri yeterlidir; mantıksal VEYA alınır.

**Neden iki seçenek?** Tekrarlanan harflerde aynı çıktı harfi iki akışın da sıradaki harfi olabilir. İlk eşleşeni keyfî seçmek daha sonra başarısız olabilir; tablo olası iki geçmişi de korur. Bir hücrenin doğru olması kaynak atamasının tek olduğunu söylemez.

**Kontrol ve cevap.** `CABD` geçerlidir: C, A, B, D alınır. Girdi sıraları C<D ve A<B korunur. Buna karşılık yalnızca harf sayılarını kontrol etmek yeterli değildir; `ADBC` aynı harfleri içerdiği hâlde geçersizdir.

## 12. Uzun mesajın içinde yaklaşık eşleşme aramak

[Ders sayfasındaki örnek 12](../#example-12) · [İlgili ders notu](../lecture-notes.html#topic-3-4)

Desen `cat`, metin `xxcutyy`. Bütün metinleri dönüştürmek, ilgisiz xx ve yy harflerine de işlem maliyeti yükler. Burada desenin metin içindeki en iyi parçayla eşleşmesini istiyoruz.

**Değişen iki şey.** Desen önekleri satır, metin önekleri sütundur. Üst satırın tamamı 0 yapılır: eşleşmenin başlangıcından önceki metin ücretsiz atlanabilir. Sonuç yalnızca sağ alt hücre değil, son desen satırındaki en küçük değerdir: bitiş noktası da serbesttir.

| Metin öneki | ∅ | x | xx | xxc | xxcu | xxcut | xxcuty | xxcutyy |
|---|---|---|---|---|---|---|---|---|
| Boş desen sınırı | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Tam cat deseninin maliyeti | 3 | 3 | 3 | 2 | 2 | 1 | 2 | 3 |

En iyi bitiş beşinci metin harfindedir: `xxcut` önekinin sonunda. Geriye izleme başlangıçtaki xx'i dışarıda bırakır; eşleşen parça `cut`, maliyet 1'dir. Sonraki yy'yi işlemek zorunda değiliz.

**Ne değişmedi?** İç hücreler yine silme, ekleme ve eşleştirme/değiştirme seçeneklerinin minimumunu kullanır. Aynı geçiş farklı sınırlar ve sonuç seçimiyle başka bir soruyu çözebilir.

**Kontrol ve cevap.** Üst satırın sıfır olması bütün eşleşmeleri ücretsiz mi yapar? Hayır; yalnızca başlangıç konumunu serbest bırakır. Desenin seçilen parçaya dönüşmesi hâlâ ücretlidir. Bu kurulum tüm deseni silerek boş parçayla eşleşmeye de izin verir; boş parçayı yasaklayan farklı bir şart varsa ayrıca modellenmelidir.

## 13. En değerli tek nesne yerine en iyi birleşimi seçmek

[Ders sayfasındaki örnek 13](../#example-13) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

Nesneler ağırlık/değer olarak (2,3), (3,4), (4,5). Kapasite 5. En değerli tek nesne 5 değer verir. İlk iki nesne birlikte ağırlık 5, değer 7 verir ve daha iyidir.

`V[i][w]`, ilk i nesneyle **en fazla w** ağırlıkta elde edilen en büyük değerdir. Kapasitenin tamamen doldurulması şart değildir. Hiç nesne kullanmadan değer 0 elde edilir.

| Kullanılabilen nesneler / kapasite | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Hiçbiri | 0 | 0 | 0 | 0 | 0 | 0 |
| İlk nesne | 0 | 0 | 3 | 3 | 3 | 3 |
| İlk iki | 0 | 0 | 3 | 4 | 4 | 7 |
| Üçü de | 0 | 0 | 3 | 4 | 5 | 7 |

**Al veya alma.** Nesneyi almazsak önceki satırdaki aynı kapasiteyi kullanırız. Alırsak değerini, önceki satırın kalan kapasitedeki cevabına ekleriz. Sığmayan nesne alınamaz. İki seçenek de önceki satırı okuduğu için aynı nesne tekrar kullanılmaz: 0/1'in anlamı budur.

Son hücrede üçüncü nesneyi alma adayı `5+V[2][1]=5`; almama adayı `V[2][5]=7`. Üçüncü nesne dışarıda kalır.

**Maliyet ve temsil.** Tamsayı kapasite W için O(nW) hücre hesabı yapılır. W'nin değeri ile onu ikili yazmak için gereken bit sayısı farklıdır; bu yüzden sözde polinom denir. b bitlik bir sayının değeri yaklaşık 2ᵇ ölçeğine çıkabilir.

**Kontrol ve cevap.** Kapasiteyi tam doldurmak şart olsaydı aynı başlangıç tablosu kullanılabilir mi? Hayır. Tam ağırlığa ulaşma gerektiren modelde ulaşılamayan ağırlıkları geçerli sıfır değerli çözümlerden ayırmak gerekir.

## 14. Daha çok iş yapmak ile daha çok ücret kazanmak farklıdır

[Ders sayfasındaki örnek 14](../#example-14) · [İlgili ders notu](../lecture-notes.html#topic-4-3)

A işi [1,10) aralığında ve ücreti 10. B [2,3), ücreti 3; C [4,5), ücreti 4. B ve C birlikte yapılabilir; gelir 7. A tek başına 10 getirir ama diğerleriyle çakışır.

**Açgözlü kuralın sınırı.** En erken biteni seçmek, eşit önemde işlerden en çok sayıda yapma probleminde doğrudur. Ücretler farklı olunca amaç değişir; iki işin geliri tek işten düşük olabilir.

Bitiş zamanına göre sıra B,C,A olur. `OPT[i]`, bu sıradaki ilk i işten elde edilen en iyi toplam ücrettir. `p(i)`, i başlamadan önce biten son uygun işin indeksidir; yoksa boş öneği kullanırız.

| İş | Almazsak | Alırsak | En iyi |
|---|---|---|---|
| B | 0 | 3+0 | 3 |
| C | 3 | 4+3 | 7 |
| A | 7 | 10+0 | 10 |

**Geçiş.** `OPT[i]=max(OPT[i−1], ücret[i]+OPT[p(i)])`. İşi alırsak onunla uyumlu bütün önceki işleri tek tek yeniden çözmek yerine uygun öneğin optimumunu kullanırız.

**Sınır anlaşması.** [başlangıç,bitiş) gösteriminde bitiş anı aralığa dahil değildir. Bir iş 3'te bitip diğeri 3'te başlayabilir; uyum koşulu `bitiş≤başlangıç`tır.

**Kontrol ve cevap.** Genel O(n log n) süre nasıl sağlanır? Sıralama ve her öncülü ikili aramayla bulma, ardından doğrusal DP. Ders görselindeki basit geriye tarama daha büyük girdilerde O(n²) öncül araması yapabilir; hızlı sınır bütün uygulamalara otomatik geçmez.

## 15. Burada biten en iyi parça, genel en iyi parça değildir

[Ders sayfasındaki örnek 15](../#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-4)

Dizi −2,3,−1,4,−5. Bitişik, boş olmayan bir parçanın toplamını en büyük yapmak istiyoruz. `3,−1,4` toplamı 6. −1'i atlayıp 3+4=7 diyemeyiz; bitişiklik bozulur.

`ending[i]`, tam i konumunda biten en iyi parçanın toplamıdır. İki seçenek vardır: önceki parçayı uzat veya yalnızca mevcut elemanla yeniden başla.

| Değer | Baştan başla | Öncekini uzat | Burada biten | Şimdiye kadarki en iyi |
|---|---|---|---|---|
| −2 | −2 | İlk eleman | −2 | −2 |
| 3 | 3 | −2+3=1 | 3 | 3 |
| −1 | −1 | 3−1=2 | 2 | 3 |
| 4 | 4 | 2+4=6 | 6 | 6 |
| −5 | −5 | 6−5=1 | 1 | 6 |

Son elemanda biten en iyi toplam 1 iken genel cevap 6'dır. Bu nedenle yalnızca son `ending` değerini döndürmek yanlıştır; görülen en iyi değer ayrıca tutulur.

**Neden yeterli?** i konumunda biten bir parça ya tek elemandır ya da i−1'de biten bir parçanın uzantısıdır. Önceki konumda daha kötü bir toplamı uzatmak daha iyi sonuç vermez; en iyi önceki toplam yeterlidir.

**Kontrol ve cevap.** −5,−2,−7 için sonuç −2. Başlangıcı 0 yapmak boş parçaya örtük izin verip yanlış cevap verebilir. İlk elemandan başlatırız. Boş girdi içinse boş olmayan parça yoktur; ayrıca davranış tanımlanmalıdır. Kadane yöntemi O(n) zaman, toplam ve uç indeksler için sabit ek alan kullanır.

## 16. İkinci mola: çıktı türünü ve kısıtı söyleyin

[Ders sayfasındaki örnek 16](../#example-16) · [İlgili ders notu](../lecture-notes.html)

122–132. dakikalar arasındaki moladan sonra her problem için tek cümlelik durum tanımı yapın.

| Örnek | Hücrenin anlamı | Kritik kısıt |
|---|---|---|
| Artan alt dizi | Burada biten en iyi uzunluk | Sıra korunur, değer kesin artar |
| İki akışı karıştırma | Bu çıktı öneki yapılabilir mi? | Her akışın iç sırası korunur |
| Sırt çantası | İlk i nesneyle kapasiteye sığan en iyi değer | Her nesne en fazla bir kez |
| İş planlama | Bitişe göre ilk i işin en iyi ücreti | Zaman çakışması yok |
| En büyük parça toplamı | Burada biten en iyi toplam | Bitişik ve boş olmayan parça |

**Soru:** Artan alt dizide aradaki −1'i atlamak mümkünken en büyük bitişik parçada neden değil? **Cevap:** İki sorunun izin verdiği seçimler farklıdır; birinin çözümü diğerine doğrudan taşınamaz.

**Soru:** Doğru/yanlış tablosunda maksimum değer aramak gerekir mi? **Cevap:** İki akış probleminde en az bir geçerli geçiş yeterlidir; mantıksal VEYA kullanılır. Ücret probleminde ise gerçekten sayısal maksimum gerekir.

**Soru:** En iyi sonucu kaydetmek her durumda geçmişi unutmak mıdır? **Cevap:** Hayır. Yalnızca gelecekteki kararları etkilemeyen ayrıntılar atılabilir. Sırt çantasında kullanılan nesneler, tablo satırıyla; karıştırmada tüketilen harf sayıları, iki indeksle temsil edilir.

## 17. İki kırılabilir numuneyle en kötü durumu planlamak

[Ders sayfasındaki örnek 17](../#example-17) · [İlgili ders notu](../lecture-notes.html#topic-4-5)

10 kat ve iki özdeş yumurta var. Bilinmeyen en yüksek güvenli kat 0 ile 10 arasında olabilir: toplam 11 eşik. Eşik katı ve altındaki atışlar güvenli, üstündekiler kırılma yaratır. Gürültüsüz, sabit ve monoton bir eşik varsayıyoruz.

**İki sonuç.** x. katta atınca kırılırsa x−1 alt kat bir yumurtayla araştırılır. Kırılmazsa üstteki n−x kat aynı yumurta sayısıyla araştırılır. Deneyi yapmadan sonucu seçemeyiz; kötü olan dalın süresini göze almalıyız.

`E(e,n)=1+min_x max(E(e−1,x−1), E(e,n−x))`.

Burada min ilk katı seçmemizi, max doğanın iki olası cevabını temsil eder. Sıfır kat için 0 test, bir yumurtayla n kat için n test gerekir.

**Dört atışlık strateji.** İlk yumurtayla 4,7,9,10 katlarını deneyin.

| Kırıldığı kat | Önceden kullanılan atış | İkinci yumurtayla araştırılacak katlar | Toplam en fazla |
|---|---|---|---|
| 4 | 1 | 1,2,3 | 4 |
| 7 | 2 | 5,6 | 4 |
| 9 | 3 | 8 | 4 |
| 10 | 4 | Kalan belirsiz kat yok | 4 |

Hepsi güvenliyse eşik 10'dur. Aralıklar 4,3,2,1 diye küçülür; önceki başarılı atışlar bütçeden harcanmıştır.

**Neden üç yetmez?** İki yumurta ve d atış en fazla d+(d−1)+…+1 katı kapsar. Üç atış 6, dört atış 10 kat. Bu, kat sayısıdır; olası eşik sayısı bir fazladır.

**Kontrol ve cevap.** İkili arama neden doğrudan uygulanmaz? Kırılınca yumurta azalır. Tek yumurtayla geniş aralıkta ortadan denemek, kırılma durumunda alt katları ayırt etmeye araç bırakmaz.

## 18. İlk kesim sonraki maliyetleri değiştirir

[Ders sayfasındaki örnek 18](../#example-18) · [İlgili ders notu](../lecture-notes.html#topic-4-6)

10 uzunluğunda parça 2 ve 5 konumlarından kesilecek. Bir kesim o anda kesilen parçanın uzunluğu kadar maliyetli olsun.

| İlk kesim | İlk maliyet | İkinci kesilen parça | İkinci maliyet | Toplam |
|---|---|---|---|---|
| 2 | 10 | [2,10], içinde 5 var | 8 | 18 |
| 5 | 10 | [0,5], içinde 2 var | 5 | 15 |

Son parçalar aynı uzunlukta olsa da işlem sırası maliyeti değiştirir. Bu, fiziksel kesme süresinin her durumda böyle olduğu iddiası değil, verilen uzunluk-maliyet modelidir.

**Durum.** Sıralı kesim koordinatlarına başlangıç 0 ve bitiş L eklenir. `C[i][j]`, bu iki sınır arasındaki bütün zorunlu kesimleri tamamlamanın en düşük maliyetidir. İçeride kesim yoksa 0.

İlk kesim k olursa maliyet `konum[j]−konum[i]+C[i][k]+C[k][j]`. İçerideki bütün k seçenekleri denenir, minimum seçilir. Daha kısa aralıkların cevapları önce hesaplanır. q iç kesim için standart tablo O(q²) alan ve O(q³) zaman ölçeğindedir.

**İkinci örnek.** L=20, kesimler 3,8,10:

| İlk kesim | Sol optimum | Sağ optimum | Toplam |
|---|---|---|---|
| 3 | 0 | 24 | 44 |
| 8 | 8 | 12 | 40 |
| 10 | 17 | 0 | 37 |

10'dan sonra soldaki uzunluk 10 parçasını 3'ten kesmek 10, kalan [3,10] parçasını 8'den kesmek 7 maliyetlidir. Toplam 20+10+7=37.

**Kontrol ve cevap.** Her zaman ortadaki noktayı seçmek kanıtlanmış bir kural mı? Hayır. DP bütün izinli ilk kesimleri karşılaştırır; yalnızca bu iki örnekte görülen iyi seçimi genel kurala çevirmeyin.

## 19. Yol parçası sayısı ile yakıt molası sayısını ayırmak

[Ders sayfasındaki örnek 19](../#example-19) · [İlgili ders notu](../lecture-notes.html#topic-4-7)

Tam depoyla menzil 60. İstasyonlar 40,70,120,150; hedef 190. Başlangıç 0'da depo dolu, hareket ileri yönde, her duruş depoyu tamamen dolduruyor; fiyat farkı yok.

```text
0 → 40 → 70 → 120 → 150 → 190
   40    30     50      30     40   (yol uzunlukları)
```

Her yol parçası 60'ı geçmiyor. Beş yol parçası, dört ara yakıt molası var. Başlangıçtaki dolumu veya hedefe vardıktan sonraki olası dolumu mola olarak saymıyoruz.

**Durum.** `L[i]`, i noktasına ulaşmak için gereken en az yol parçası sayısı. `L[0]=0`. Önceki j noktasından i'ye mesafe en fazla 60 ise aday `L[j]+1`; geçerli adayların minimumu alınır. Ulaşılamayan durum ∞ kalır.

| Nokta | 0 | 40 | 70 | 120 | 150 | 190 |
|---|---|---|---|---|---|---|
| En az yol parçası | 0 | 1 | 2 | 3 | 4 | 5 |

**Hepsi neden gerekli?** 0'dan 70'e gidilemez. 40'tan 120'ye 80, 70'ten 150'ye 80, 120'den 190'a 70 gerekir. Her istasyonu atlama denemesi menzili aşar; dört mola zorunludur.

**Kontrol ve cevap.** Ardışık kullanılabilir noktalar arasında 60'tan büyük boşluk varsa yolculuk mümkün değildir. ∞'den bir çıkarıp geçerli mola sayısı üretmeyin. Pozitif mesafeli, ulaşılabilir hedef için mola=parça−1; hedef başlangıçsa cevap doğrudan 0'dır.

Bu basit modelde en uzaktaki ulaşılabilir istasyona gitmek de doğru bir açgözlü yöntemdir. Yakıt fiyatları, sınırlı dolum veya farklı yol ağı eklenirse aynı kuralın geçerliliği yeniden incelenir.

## 20. Sıralı işleri en ağır grubu küçülterek paylaşmak

[Ders sayfasındaki örnek 20](../#example-20) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

1,2,3,4,5 süreli işler iki boş olmayan bitişik gruba ayrılacak. Sıra değiştirilemez. Amaç grup toplamlarının en büyüğünü en aza indirmektir; iki eş hızlı işçi eşzamanlı çalışırsa bu en büyük toplam bitiş süresini belirler.

| Kesim yeri | Sol toplam | Sağ toplam | Büyük olan |
|---|---|---|---|
| 1'den sonra | 1 | 14 | 14 |
| 2'den sonra | 3 | 12 | 12 |
| 3'ten sonra | 6 | 9 | 9 |
| 4'ten sonra | 10 | 5 | 10 |

Dört olasılığın tamamı kontrol edildi: optimum 9. Toplam 15 olduğundan teorik dengeli hedef 7,5 olsa da sıra ve bölünemeyen işler bu hedefe ulaşmayı engeller.

**Durum.** `P[i][k]`, ilk i işi k boş olmayan gruba bölmenin en küçük maksimum grup toplamıdır. Son kesim x'ten sonra olsun. Önceki k−1 grubun en iyi değeri `P[x][k−1]`, son grubun toplamı `prefix[i]−prefix[x]`.

Önce bu iki yükün **maksimumu**, sonra bütün x seçeneklerinin **minimumu** alınır. x, k−1 ile i−1 arasındadır; böylece her gruba en az bir iş kalır. Tek grupta cevap ilk i işin toplamı; i<k durumları imkânsızdır.

**Önek toplamı.** `[0,1,3,6,10,15]` dizisi sayesinde son iki işin toplamı 15−6=9 olarak sabit zamanda hesaplanır. Negatif olmayan iş yükleri varsayımı altında boş başlangıç için 0 taban değeri uygundur.

**Kontrol ve cevap.** İşleri serbestçe dağıtabilir miyiz? Hayır. Örneğin 1,2,4 ile 3,5 grupları 7 ve 8 verir ama ilk grup bitişik değildir. O sonuç başka bir problemin cevabıdır. Genel standart DP, k grup için O(kn²) zaman kullanır.

## 21. Yavaş ve hızlı sensör akışlarını hizalamak

[Ders sayfasındaki örnek 21](../#example-21) · [İlgili ders notu](../lecture-notes.html#topic-dtw)

A=[1,3,3,1], B=[1,3,1]. A'daki 3 değeri iki örnek boyunca, B'de bir örnek boyunca sürüyor. İndeksleri doğrudan eşlemek ilk üç çiftte 0+0+2 maliyet verir ve A'nın son elemanı açıkta kalır; bu tam bir hizalama değildir.

**DTW fikri.** Zaman ekseninde ilerlerken bir örneği diğer dizinin birden fazla örneğiyle eşleştirebiliriz. Yerel maliyet mutlak farktır: `|A[i]−B[j]|`. Hücre, yerel maliyetle yukarı, sol ve köşegen birikmiş maliyetlerin minimumunu toplar.

| A / B | 1 | 3 | 1 |
|---|---|---|---|
| 1 | 0 | 2 | 2 |
| 3 | 2 | 0 | 2 |
| 3 | 4 | 0 | 2 |
| 1 | 4 | 2 | 0 |

Sınırdaki `D[0][0]=0`; diğer boş önek sınırları ∞'dir. Böylece hizalama ilk örneklerden başlar ve sağ alt hücrede iki son örneğe de ulaşır.

**Sıfır maliyetli yol.** 1'den numaralanmış indekslerle (1,1)→(2,2)→(3,2)→(4,3). Ortadaki dikey adım B'nin ikinci örneğini yeniden eşleştirir:

```text
A değerleri:   1  3  3  1
B değerleri:   1  3  3  1
B indeksleri:  1  2  2  3
Farklar:      0  0  0  0
```

B'ye yeni fiziksel ölçüm eklenmedi; aynı ölçüm hizalamada iki kez kullanıldı. Bu nedenle yatay/dikey adımlar düzenleme uzaklığındaki literal karakter ekleme/silme işlemleri değildir.

**Kontrol ve cevap.** Sıfır maliyet iki gerçek hareketin aynı olduğunu kanıtlar mı? Hayır. Seçilen temsil ve maliyet altında uyumlu olduklarını söyler. Ölçek, gürültü ve izin verilen zaman bükülmesi ayrıca belirlenmelidir. Çok dar bir hizalama bandı iyi yolu dışlayabilir. Tam tablo O(mn) hücre içerir.

## 22. DP kullanmak küçük tablo garantisi vermez

[Ders sayfasındaki örnek 22](../#example-22) · [İlgili ders notu](../lecture-notes.html#topic-6-1)

Düzenleme uzaklığında iki önek uzunluğu gelecekteki seçenekleri belirlemek için yeterliydi. Ama silme maliyeti bir önceki işlemin silme olup olmamasına bağlıysa aynı (i,j) durumuna farklı geçmişlerden gelmek farklı gelecek maliyetleri doğurabilir. Bu durumda işlem türü gibi ek bilgi tutulmalıdır.

**Gezgin satıcı örneği.** Her şehri bir kez ziyaret edip başlangıca dönmek istiyoruz. “Şu anda C'deyim” yetmez: daha önce A,B mi, A,D mi ziyaret edildi? Kalan izinli şehirler farklıdır. Durum, ziyaret edilen küme S ve son şehir v olabilir.

Sabit başlangıç s ile `H[S,v]`, s'den başlayıp S kümesindeki şehirleri ziyaret ederek v'de bitmenin en düşük maliyetidir. Son adım u→v ise aday `H[S−{v},u]+mesafe(u,v)`. En sonda başlangıca dönüş kenarı da eklenir; yalnızca en ucuz açık yolu bulmak tur problemini tamamlamaz.

| Şehir sayısı n | n×2ⁿ durum ölçeği |
|---|---|
| 10 | 10.240 |
| 20 | 20.971.520 |

Bunlar tam erişilebilir durum sayıları değil, büyüme ölçeğidir. Her durumda O(n) önceki şehir denemek standart Held–Karp yönteminde O(n²2ⁿ) zaman, O(n2ⁿ) alan verir. Permütasyonları tek tek denemeye göre büyük iyileşme olsa da hâlâ üsteldir.

**Son kontrol ve cevap.** Optimal alt yapı açgözlü seçimi otomatik doğru yapar mı? Hayır. DP farklı seçenekleri karşılaştırır; açgözlü yöntem birine hemen bağlanır. 1,3,4 paralarıyla 6 yapma örneği, en büyük ilk seçimin yanlış olabileceğini zaten gösterdi.

Bu haftanın ortak yöntemi: durumu açıkça tanımla, tabanı gerekçelendir, geçişin bütün seçenekleri kapsadığını göster, bağımlılık sırasını kur, istenen cevap hücresini seç. Son olarak küçük örneği elle doğrula ve durum sayısıyla durum başına işi ayrı say.

