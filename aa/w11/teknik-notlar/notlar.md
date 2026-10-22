# AA · 11. Hafta — 22 örneğin Türkçe teknik açıklaması

Bu notlar **en kısa yollar** dersindeki 22 kartı aynı sırayla açıklar. 9 ve 16 numaralı mola kartları cevaplı tekrar içerir. Her bölümün başındaki bağlantılar aynı örneğe ve ilgili ders notuna gider. Hesaplar, karşı örnekler ve cevaplar açılır menü arkasında değildir.

## Başlamadan: neyi en aza indiriyoruz?

Geçen hafta bütün kabloların kurulum toplamını azaltıyorduk. Bu hafta bir başlangıçtan hedefe giderken **rotada kullanılan kenarların ağırlıklarını** topluyoruz. Ağırlık metre, süre veya modellenmiş enerji maliyeti olabilir; hangi birim olduğu belirtilmelidir.

- **Kaynak:** Başlangıç düğümü. **Hedef:** Ulaşılmak istenen düğüm.
- **Yönlü kenar:** A→B yalnızca o yönde geçiş sağlar. B→A ayrıca verilmedikçe varsayılmaz.
- **Rota maliyeti:** Kenar ağırlıklarının toplamı. Düğüm veya kenar sayısı olmak zorunda değildir.
- **dist / distance:** Şimdiye kadar bulunan en iyi maliyet kaydı. Algoritmanın ortasında her kayıt kesin cevap değildir.
- **∞:** Henüz rota bulunmadı; başarılı algoritmanın sonunda kalırsa erişilemez demektir. Gerçek bir çok uzun yolculuk süresi değildir.
- **−∞:** Maliyet aşağı doğru sınırsız azaltılabilir; en küçük sonlu maliyet yoktur. “Sonsuz hızda gidiliyor” anlamına gelmez.
- **Relaxation / gevşetme:** Bir kenar üzerinden daha ucuz teklif bulunup bulunmadığını sınama. Daha ucuzsa mesafeyi ve ebeveyni birlikte güncelleme.
- **Parent / ebeveyn:** Seçilen rotada hedefin hemen öncesindeki düğüm. Geriye doğru takip edilerek rota çıkarılır.
- **Kesinleştirme:** İlgili algoritmanın koşulları altında bir mesafenin artık değişmeyeceğini belirleme. İlk keşif ile aynı şey değildir.
- **n ve m:** Düğüm ve kenar sayıları. O ifadesi büyüme üst sınırı, Θ aynı mertebede alt ve üst sınırdır; saniye belirtmez.

Negatif çevrimleri konuşurken kenar veya düğümlerin tekrar kullanılabildiği yürüyüşler dikkate alınır. Yalnızca düğüm tekrarsız basit yollar arasında optimizasyon yapmak farklı bir problemdir. Bu ayrım, “maliyet neden sonsuza kadar azalıyor?” sorusunun temelidir.

## 1. En ucuz ağ ile en ucuz yolculuk farklıdır

[Ders sayfasındaki örnek 1](../onceki-ders.html#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

**Veri.** Yönsüz üçgende AB=2, BC=2, AC=3. Bütün düğümleri bağlayan en ucuz ağaç AB ve BC'dir; toplam kurulum maliyeti 4 olur.

| Soru | Seçim | Toplanan miktar |
|---|---|---:|
| Bütün ağı en ucuza kur | AB ve BC | 2+2=4 |
| Özgün grafta A'dan C'ye en ucuza git | AC | 3 |
| Sadece kurulmuş ağaç üzerinde A'dan C'ye git | A—B—C | 4 |

**Neden farklı sonuç?** İlk soruda bütün cihazların bağlı olması zorunludur. İkinci soruda belirli bir başlangıç ve hedef vardır; diğer bütün düğümleri ziyaret etmemiz gerekmez. Aynı grafı kullansak da amaç fonksiyonu değişmiştir.

**Hangi bağlantılar kullanılabilir?** Eğer yalnızca MST kabloları fiziksel olarak kurulduysa AC artık seçenek değildir. “AC daha kısa” karşılaştırması özgün grafın olası bağlantılarına göredir. Problemi yazarken rota hangi graf üzerinde aranıyor, bunu açıkça söyleyin.

DFS erişilebilirliği bulur ama genel ağırlıklı en kısa yol garantisi vermez. Topolojik sıra, yönlü ön koşulları sıralar; tek başına rota maliyetlerini hesaplamaz. Bu hafta uygun sıralamayla birlikte maliyet güncellemeleri yapacağız.

**Kontrol ve cevap.** MST mutlaka A–C en kısa rotasını içerir mi? Hayır. Bu küçük üçgen, 3 maliyetli doğrudan bağlantının MST dışında kalabildiğini gösterir.

## 2. Daha az yol parçası daha az süre demek değildir

[Ders sayfasındaki örnek 2](../onceki-ders.html#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

**Problem.** A→D doğrudan kenarı 10; A→B, B→C, C→D kenarlarının her biri 1 olsun. Okların ters yönü verilmemiştir.

```text
Doğrudan: A ──10──→ D           1 kenar, toplam 10
Dolaylı:  A ─1→ B ─1→ C ─1→ D  3 kenar, toplam 3
```

BFS, kaynaktan kenar sayısına göre katmanlar oluşturur. D bir kenarla bulunur ve BFS en az hareket sayısını 1 olarak doğru hesaplar. Ancak süreyi soruyorsak 10 yerine 1+1+1=3 daha iyidir. BFS yanlış problemi çözmüş olmaz; bizim istediğimiz ölçütle onun garanti ettiği ölçüt farklıdır.

**Eşit maliyet özel durumu.** Her kenar aynı pozitif c maliyetini taşıyorsa k kenarlı rota kc tutar. k küçülünce kc de küçülür; bu nedenle BFS yeterlidir. Bu örnekte bütün kenarları 1 yaparsak doğrudan rota 1, dolaylı rota 3 olur.

**Mühendislik yorumu.** Tek koridor çamurlu, dolambaçlı veya yavaş olabilir. Üç kısa hareket, tek uzun hareketten daha çabuk bitebilir. Çizgideki kenar sayısı veya çizginin ekrandaki uzunluğu ağırlığın yerine geçmez.

**Kontrol ve cevap.** “Hedefi ilk buldum, en ucuz rota budur” diyebilir miyiz? Farklı ağırlıklarda hayır. Önce arama yönteminin neye göre ilerlediğini bilmeliyiz.

## 3. Her kenara aynı sayıyı eklemek sonucu bozabilir

[Ders sayfasındaki örnek 3](../onceki-ders.html#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

Başlangıçta üç kenarlı rota 1+1+1=3, doğrudan rota 4 tutuyor. Her kenara 10 ekleyelim.

| Rota | Eski toplam | Eklenen toplam | Yeni toplam |
|---|---:|---:|---:|
| Üç kenarlı | 3 | 3×10=30 | 33 |
| Tek kenarlı | 4 | 1×10=10 | 14 |

Önce üç kenarlı rota kazanıyordu; şimdi doğrudan rota kazanır. Aynı sayı her **kenara** eklendi, her **rotaya** değil. Kenar sayıları farklıysa toplam ek ücretler de farklıdır.

**Genel hesap.** k kenarlı bir rotanın eski maliyeti L ise, kenar başına c eklenince yeni maliyet L+kc olur. İki rota aynı k değerine sahipse ikisi de aynı miktarda artar ve kendi aralarındaki sıralama korunur. Bütün rota adaylarının aynı sayıda kenar taşıdığı varsayımı genel graflarda doğru değildir.

**Negatif ağırlıkla bağlantı.** “En küçük ağırlık −10; hepsine 10 ekler, Dijkstra çalıştırırım” yöntemi genel olarak geçersizdir. Negatif sayıları kaldırırken sorunun en iyi cevabını da değiştirebilir. Farklı, ispatlı yeniden ağırlıklandırma yöntemleri vardır; bunlar her kenara gelişigüzel sabit eklemek değildir.

**Çarpma farkı.** Bütün ağırlıkları aynı pozitif sayıyla çarpmak her rotanın toplamını da aynı pozitif sayıyla çarpar; rota karşılaştırmalarını korur. Toplama ve çarpmanın etkisi bu yüzden aynı değildir.

**Kontrol ve cevap.** İki rota da iki kenarlıysa +10 değişikliği ne yapar? İkisine de +20 ekler; birbirlerine göre hangisinin ucuz olduğu değişmez.

## 4. Gevşetme, daha ucuz teklif sınamasıdır

[Ders sayfasındaki örnek 4](../onceki-ders.html#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-4)

**Durum.** A'dan B'ye bulunan maliyet 2. B→C kenarı 1. C'nin mevcut kaydı 5 olsun.

```text
aday = dist[B] + ağırlık(B,C) = 2 + 1 = 3
3 < 5 olduğu için:
    dist[C] = 3
    parent[C] = B
```

Aday rota, B'ye kadar bildiğimiz rotaya B→C kenarını ekleyerek oluşur. Bu, soyut bir tahmin değil, bulunan bir rota maliyetidir. Fakat daha ucuz başka bir rota sonradan bulunabilir; “şimdiye kadar en iyi” ile “kesin en iyi” ayrılır.

| C'nin mevcut kaydı | Teklif | Karar |
|---|---:|---|
| ∞ | 3 | İlk sonlu rota bulunur; güncelle |
| 5 | 3 | Daha ucuz; güncelle |
| 3 | 3 | Eşit; bu uygulamada değiştirme |
| 2 | 3 | Daha pahalı; değiştirme |

**Ebeveyn neden birlikte güncellenir?** Maliyeti 3 yazıp parent'ı A bırakmak, kayıtların farklı rotaları anlatmasına neden olur. Sayı ve onu üreten son kenar birlikte tutulmalıdır.

**∞ kaynağı.** B'ye hiç ulaşılamadıysa B'den başlayan sonlu bir teklif çıkaramayız. Bellman–Ford'da kaynağı erişilemeyen kenar atlanır. Özellikle ∞ yerine büyük bir tamsayı kullanılan kodlarda negatif ağırlık ekleyip sahte iyileşme üretmemeye dikkat edilir.

**Kontrol ve cevap.** C zaten 3 ise parent değişir mi? Bu derste katı küçüklük karşılaştırması kullanıldığı için hayır. Eşit maliyetli başka rota bulunması mevcut ebeveyni değiştirmez.

## 5. Maliyet kaydından gerçek rotayı çıkarmak

[Ders sayfasındaki örnek 5](../onceki-ders.html#example-5) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

**Son kayıtlar.** dist[A]=0, dist[B]=2, dist[C]=3; parent[B]=A, parent[C]=B. Kaynak A'nın ebeveyni yoktur.

| İşlem | Oluşan liste |
|---|---|
| Hedef C ile başla | C |
| C'nin ebeveyni B | C,B |
| B'nin ebeveyni A | C,B,A |
| Kaynakta dur ve ters çevir | A,B,C |

Ebeveyn okları geriye doğru kayıt okumadır; grafın C→B veya B→A yönünde geçişe izin verdiğini söylemez. Seyahat yönü ters çevrilmiş listede A→B→C'dir. Kenarları kontrol edip 2+1=3 toplamak sonucu doğrular.

**Alt yollar neden en kısa olmalı?** Sonlu en kısa rota içindeki bir alt bölüm daha ucuz bir bölümle değiştirilebilse toplam rota da ucuzlardı. Bu, ilk rotanın en kısa olmasıyla çelişir. En kısa yol algoritmalarındaki yapı bu değiştirme fikrine dayanır; negatif çevrim etkisi varsa sonlu minimumun varlığı ayrıca sorgulanır.

**Özel durumlar.** Hedef kaynakla aynıysa boş hareketli rota [A], maliyet 0'dır; negatif çevrim kaynağa geri dönebiliyorsa bu sonuç da etkilenebilir. Hedefin kaydı ∞ ise kaynak hedefe ulaşamaz; tek elemanlı hedef listesi uydurulmaz.

**Kontrol ve cevap.** Ebeveynleri ne zaman okumalıyız? Algoritma ilgili hedef için geçerli sonlu sonuç ürettikten sonra. Negatif çevrim etrafında oluşmuş parent zincirini normal en kısa rota gibi takip etmek bitmeyen döngüye veya yanlış sonuca yol açabilir.

## 6. Dijkstra en küçük geçerli teklifi kesinleştirir

[Ders sayfasındaki örnek 6](../onceki-ders.html#example-6) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

**Veri.** A→B=2, A→C=5, B→C=1. Bütün ağırlıklar negatif değildir.

| Adım | A | B | C | Açıklama |
|---|---:|---:|---:|---|
| Başlangıç | 0 | ∞ | ∞ | Yalnızca kaynak biliniyor |
| A işlenir | 0 | 2 | 5 | A'nın iki çıkışı teklif verir |
| B işlenir | 0 | 2 | 3 | B→C, 2+1 ile iyileştirir |
| C işlenir | 0 | 2 | 3 | Çıkış yok; sonuç tamam |

C'nin 5 ile ilk görülmesi kesinleşme değildir. B'nin 2 teklifi daha küçük olduğundan B önce işlenir ve C'yi iyileştirir. Dijkstra'nın güvenli adımı, **kesinleşmemişler arasındaki en küçük geçerli mesafeyi** seçmektir.

**Negatif olmama neden gerekli?** Daha büyük maliyetli bir noktadan devam etmek, negatif olmayan kenarlarda birikmiş maliyeti azaltamaz. Standart ispatta, daha ucuz olduğu varsayılan alternatif rotanın kesinleşmiş bölgeden ilk çıkışı incelenir; o sınırdaki teklif zaten seçilen en küçük tekliften daha ucuz olmak zorunda olurdu. Bu da seçimle çelişir.

**Sıfır ağırlık olabilir mi?** Evet. Sıfır kenarı maliyeti artırmaz ama azaltmaz da. Bu nedenle Dijkstra için “pozitif” yerine “negatif olmayan” koşulu kullanılır.

**Kontrol ve cevap.** Kesinleşme, bütün olası rotaların denenmesi mi? Hayır. Uygun sırayla verilen karar ve ağırlık koşulu, geri kalan rotaları tek tek saymadan sonucun doğruluğunu garanti eder.

## 7. Beş düğümlü W grafını takip etmek

[Ders sayfasındaki örnek 7](../onceki-ders.html#example-7) · [İlgili ders notu](../lecture-notes.html#topic-2-5)

Bu örnek yönsüzdür. Kenarlar AB=4, AC=1, BC=2, BD=5, CD=8, DE=3, CE=10. Kaynak A. Aynı W grafı geçen hafta MST için kullanılmıştı; bu kez sorumuz kaynak uzaklıklarıdır.

| İşlenen düğüm | B kaydı | C kaydı | D kaydı | E kaydı |
|---|---:|---:|---:|---:|
| A, maliyet 0 | 4 | 1 | ∞ | ∞ |
| C, maliyet 1 | 3 | 1 | 9 | 11 |
| B, maliyet 3 | 3 | 1 | 8 | 11 |
| D, maliyet 8 | 3 | 1 | 8 | 11 |
| E, maliyet 11 | 3 | 1 | 8 | 11 |

**C işlenince.** B için 1+2=3, eski 4'ten küçüktür. D için 1+8=9 ve E için 1+10=11 ilk tekliflerdir. B işlenince D için 3+5=8 bulunur; 9 yerini 8'e bırakır.

**E'deki eşitlik.** D işlenince 8+3=11 önerilir. E zaten C üzerinden 11'e sahiptir. `<` karşılaştırması eşitlikte güncelleme yapmadığından parent[E]=C kalır. İki doğru rota vardır:

```text
A—C—E:       1+10 = 11
A—C—B—D—E:   1+2+5+3 = 11
```

Son ebeveynler B←C, C←A, D←B, E←C'dir. Bu en kısa yol ağacının kenar ağırlıkları toplamı 1+2+5+10=18 olabilir; geçen haftaki MST toplamı 11'di. Bu bir hata değildir: en kısa yol ağacı kaynak uzaklıklarını, MST bütün seçilen kenarların toplamını optimize eder.

**Kontrol ve cevap.** A,B,C,D,E mesafeleri 0,3,1,8,11'dir. E'nin farklı bir ebeveynle yazılması tek başına hata değildir; aynı son maliyeti veren geçerli rotaya bakılır.

## 8. Eski kuyruk kaydı yeniden işlenecek yeni bir rota değildir

[Ders sayfasındaki örnek 8](../onceki-ders.html#example-8) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

Basit örnekte C önce 5, sonra 3 maliyetiyle keşfedilir. Heap kullanan kısa uygulama eski kaydı silmek yerine yeni kaydı da ekler.

| Olay | Mantıksal bekleyen teklifler |
|---|---|
| A'nın çıkışları işlendi | (2,B), (5,C) |
| B çıkarıldı, C iyileşti | (3,C), (5,C) |
| C=3 çıkarılıp işlendi | (5,C) |
| C=5 çıkarıldı | Eski kayıt; atlanır |

Heap'in iç dizisi tamamen sıralı görünmek zorunda değildir; garantisi en küçük öğenin verimli çıkarılmasıdır. Tablodaki sıralı yazım bekleme önceliğini anlatır.

**Eski kayıt nasıl anlaşılır?** Çıkarılan cost ile güncel distance[u] karşılaştırılır. 5≠3 olduğundan kayıt artık güncel en iyi maliyeti temsil etmez. `continue` ile bu kaydın komşuları tekrar işlenmez.

**Prim karşılaştırması.** Prim, dış düğümü ağa bağlayan tek kenarın ağırlığını öncelik yapar. Dijkstra, kaynaktan o düğüme kadar **bütün rotanın** maliyetini kullanır. Benzer bir öncelik kuyruğu kullanmaları aynı problemi çözdükleri anlamına gelmez.

**Maliyet.** Diziyle en küçük düğümü seçen sürüm O(n²+m), basit graf üzerinde standart heap sürümü O((n+m)log n) zamanla ifade edilir. Eski kayıtları da tutan sürümde kuyruk O(m) kayıt taşıyabilir. Ders animasyonu küçük bir listeyi sıralayarak iz üretir; bu görsel kodu doğrudan verimli heap uygulamasının çalışma süresi diye yorumlanmamalıdır.

**Kontrol ve cevap.** B→C için karşılaştırılan sayı nedir? dist[B]+weight(B,C). Yalnızca kenarın ağırlığı değil.

## 9. İlk mola: üç farklı toplamı ayırmak

[Ders sayfasındaki örnek 9](../onceki-ders.html#example-9) · [İlgili ders notu](../lecture-notes.html)

64–74. dakikalar arasındaki moladan sonra şu soruları birer hesapla cevaplayın.

**1. A→D=10 ile üç tane 1'lik kenarı karşılaştırın.** En az kenarlı rota doğrudan olandır; en az toplam maliyetli rota üç kenarlı 3 maliyetli olandır. BFS ile ağırlıklı yol arasındaki ayrım budur.

**2. dist[B]=2, B→C=1, dist[C]=5 ise ne değişir?** C'nin mesafesi 3 ve ebeveyni B olur. Yalnızca sayıyı değiştirmek rota kaydını tutarsız bırakır.

**3. C=5 kaydı kuyruktayken C=3 bulunursa eski kayıt ne olur?** Kuyrukta kalabilir. Çıkarılınca güncel mesafeyle eşleşmediği için atlanır.

**Kısa doğrulama.** W grafında D'nin maliyetini kenarları yazarak bulun: A—C—B—D, toplam 1+2+5=8. Prim'de D'nin bağlantı anahtarı ise yalnızca BD=5 idi. Aynı düğüm için 8 ve 5'in ikisi de doğru olabilir; farklı bilgileri gösterirler.

**Hatırlatma.** Dijkstra negatif olmayan ağırlıklarda en küçük güncel teklifi kesinleştirir. İlk bulunan teklif, kesin cevap değildir.

## 10. Tek negatif kenar kesinleştirme kuralını bozabilir

[Ders sayfasındaki örnek 10](../onceki-ders.html#example-10) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

**Veri.** A→B=2, A→C=5, C→B=−4. B'nin çıkış kenarı yoktur.

| Rota | Toplam |
|---|---:|
| A→B | 2 |
| A→C→B | 5−4=1 |

Bir kez kesinleştirip düğümü tekrar açmayan Dijkstra, A'dan sonra B'yi 2 ile kesinleştirir. C'nin 5 maliyeti daha büyük görünür. Fakat C'den çıkan −4 kenarı, B için 1 toplamını mümkün kılar. Negatif olmayan kenarlara dayanan ispat artık kullanılamaz.

**Her negatif girişte sonuç yanlış mı?** Hayır. Bazı örneklerde tesadüfen doğru sonuç çıkabilir. Bir karşı örnek, “bütün negatif ağırlıklı graflarda doğru” iddiasını çürütmeye yeter. Düğümleri yeniden açan bazı farklı uygulamalar bu örneği düzeltebilir; bu, standart Dijkstra'nın koşulunu ve maliyet garantisini ortadan kaldırmaz.

**Çevrim var mı?** Yok. B'den geriye giden ok olmadığı için başlangıca dönülemez. Negatif kenar ile negatif toplamlı çevrim ayrı kavramlardır. Bu örnekte sonlu en kısa mesafe vardır: B için 1.

**Görselde ne çalışıyor?** Negatif örneğin animasyonu Bellman–Ford kullanır; Python Dijkstra örneği negatif ağırlığı hata mesajıyla reddeder. Ekranda doğru sonuç görmek, negatif girişin Dijkstra ile çözüldüğü anlamına gelmez.

**Mühendislik anlamı.** −4 bir kredi veya modellenmiş enerji kazanımı olabilir; negatif yolculuk süresi değildir. Batarya kapasitesi gibi kısıtlar varsa yalnızca toplam enerji ağırlığı yeterli bir fiziksel model olmayabilir.

## 11. Bellman–Ford teklifleri yeniden değerlendirir

[Ders sayfasındaki örnek 11](../onceki-ders.html#example-11) · [İlgili ders notu](../lecture-notes.html#topic-3-3)

**Kenar sırası.** S→A=4, S→B=2, B→A=−3, A→C=1, B→C=5. Başlangıçta S=0, diğerleri ∞. Güncellemeler hemen uygulanır.

| İlk turdaki kenar | Hesap | A | B | C |
|---|---|---:|---:|---:|
| S→A | 0+4=4 | 4 | ∞ | ∞ |
| S→B | 0+2=2 | 4 | 2 | ∞ |
| B→A | 2−3=−1 | −1 | 2 | ∞ |
| A→C | −1+1=0 | −1 | 2 | 0 |
| B→C | 2+5=7; 0'dan iyi değil | −1 | 2 | 0 |

Bir turda S→B→A→C boyunca üç kenarlık bilgi yayılmıştır. “Her turda tam bir kenar ilerlenir” bu yerinde güncelleme uygulaması için doğru değildir. Kenarların yararlı sırada gelmesi, yeni değerlerin aynı turda kullanılmasını sağlar.

**İkinci tur.** Bütün kenarlar yeniden incelenir. Hiçbir teklif iyileşmez. Tam bir tur değişikliksiz bittiği için erken durulabilir. Sonuç S=0,A=−1,B=2,C=0. C'nin rotası S→B→A→C; toplam 2−3+1=0.

**Dijkstra'dan farkı.** Bellman–Ford bir düğümü küçük maliyeti nedeniyle kalıcı olarak kapatmaz. Kenarları tekrar tekrar tarayıp teklifleri yeniler. Bu nedenle negatif kenarlarla çalışabilir; negatif çevrim varsa bunun etkisini ayrıca belirler.

**Kontrol ve cevap.** İlk turda sonuca ulaştığımızı sadece tabloya bakıp bilebilir miyiz? Genelde durma gerekçesi gerekir: değişikliksiz tam tur veya gerekli tur sınırı ve negatif çevrim kontrolü. Bu örnekte ikinci tur değişiklik olmadığını doğrular.

## 12. Kenar listesi sırası ara tabloları değiştirir

[Ders sayfasındaki örnek 12](../onceki-ders.html#example-12) · [İlgili ders notu](../lecture-notes.html#topic-3-4)

Önceki örneğin **listesini** ters çeviriyoruz; okların yönlerini değil. Yeni sıra B→C, A→C, B→A, S→B, S→A olur.

| Tur sonu | S | A | B | C |
|---|---:|---:|---:|---:|
| Başlangıç | 0 | ∞ | ∞ | ∞ |
| 1 | 0 | 4 | 2 | ∞ |
| 2 | 0 | −1 | 2 | 5 |
| 3 | 0 | −1 | 2 | 0 |

İlk turda C'ye giden kenarlar incelenirken kaynakları henüz erişilebilir değildir. İkinci turda B→C önce 7, A→C sonra 5 verir; B→A ancak bundan sonra A'yı −1'e indirir. C'nin 0'a inmesi üçüncü turdaki A→C kenarını bekler. Son sonuç değişmez, ilerleme hızı değişir.

**Görselin ikinci senaryosu.** Ayrıca şu farklı graf gösterilir: S→A=6, S→B=7, A→C=5, B→C=−2, C→A=−3. Verilen sırayla ilk turda A önce 6, C önce 11 sonra 5 olur; C→A da A'yı 2'ye indirir. Son mesafeler A=2,B=7,C=5'tir.

**Çevrim toplamı.** İkinci grafta A→C→A çevrimi vardır ama maliyeti 5−3=2'dir. Tekrar etmek maliyeti azaltmaz, artırır. Grafın çevrimli olması, negatif çevrimli olması demek değildir.

**Kontrol ve cevap.** İki öğrencinin ilk tur tabloları neden farklı olabilir? Kenar sırası veya güncelleme yöntemi farklı olabilir. Her tur önceki tablonun kopyasını kullanan sürümle yerinde güncelleme sürümü de farklı ara tablolar üretir. Çözümde bu tercihleri belirtin.

## 13. n−1 tur sınırının gerekçesi

[Ders sayfasındaki örnek 13](../onceki-ders.html#example-13) · [İlgili ders notu](../lecture-notes.html#topic-3-6)

n düğümlü bir basit yol, düğüm tekrarlamadan en fazla n−1 kenar kullanır. Beş farklı düğümün zinciri dört bağlantı içerir.

**Neden basit bir en kısa yol arayabiliriz?** Kaynaktan erişilebilir negatif çevrim yoksa, bir yürüyüşte tekrar edilen çevrimlerin toplamı negatif değildir. Bu çevrimleri çıkarmak maliyeti artırmaz. Sonlu minimuma ulaşan, düğüm tekrarsız bir yol seçilebilir. Pozitif çevrimi kaldırmak ucuzlatır; sıfır çevrimi kaldırmak aynı maliyeti korur.

**Tur garantisi.** İlk tam tarama kaynaktan tek kenarla ulaşılabilen bütün tekliflere fırsat verir. İkinci tarama, önceki turda bulunan teklifleri bir kenar daha ileri taşımaya fırsat verir. k turdan sonra en fazla k kenarlı yolların bilgisi yayılabilecek kadar işlem yapılmıştır.

Yerinde güncellemede daha uzun yolların bilgisi de aynı turda yayılabilir. Garanti “en fazla k kenar kullanılabilir” sınırlaması değil, “en az bu kadar ilerleme fırsatı sağlandı” alt güvencesidir. Bu yüzden bazı örnekler n−1 turdan önce biter.

**Beş düğümde.** En fazla dört gevşetme turu, ardından daha fazla iyileşme mümkün mü kontrolü yapılır. Hiçbir tam turda değişiklik yoksa erken çıkılabilir. n−1 sınırı, kenar listesini sadece n−1 kenara kadar taramak demek değildir; her tur bütün m kenarı tarar.

**Maliyet.** Standart en kötü durum O(nm), düğüm başlangıç kayıtlarıyla birlikte O(n+nm) olarak yazılabilir. m=0 olduğunda bile n kayıt hazırlanır. Bu hesap animasyon çizimi veya bütün ara tabloları saklama maliyetini kapsamaz.

## 14. Negatif çevrim maliyeti sınırsız azaltır

[Ders sayfasındaki örnek 14](../onceki-ders.html#example-14) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

**Veri.** S→A=1, A→B=2, B→C=−4, C→A=1. Çevrimin toplamı 2−4+1=−1'dir.

| A'ya varış biçimi | Toplam |
|---|---:|
| S→A, çevrim yok | 1 |
| Bir çevrim daha | 0 |
| İki çevrim daha | −1 |
| k çevrim daha | 1−k |

Ne kadar küçük bir değer yazarsanız yazın, bir tur daha atıp onu 1 azaltabilirsiniz. Bu nedenle “en küçük sonlu maliyet” yoktur. −∞ bu durumu ifade eder; gerçekleştirilmiş tek bir sonsuz uzun rotanın maliyeti diye yorumlanmaz.

**Hangi düğümler etkilenir?** Kaynak çevrime ulaşabilmeli, çevrim de hedefe ulaşabilmelidir. Bu örnekte A,B,C etkilenir. Çevrimden S'ye geri ok yoktur; S'nin mesafesi 0 kalır. C→D eklenirse D çevrimin üzerinde olmasa da etkilenir: önce çevrimde istenildiği kadar maliyet azaltılır, sonra D'ye gidilir.

**Erişilemeyen çevrim.** Başka bir bölgede negatif çevrim olup S'den oraya geçiş yoksa S kaynaklı mesafeler etkilenmez. Bu nedenle Bellman–Ford kontrolü yalnızca sonlu dist[u] kaydı olan kaynaklardan gelen iyileşmeleri dikkate alır.

**Tespit.** n−1 turdan sonra hâlâ bir kenarda iyileşme varsa kaynaktan erişilebilir negatif çevrim vardır. Etkilenen düğümleri işaretlemek için bu iyileşmelerden ileri yönde erişimi de yaymak gerekir. Sadece ilk iyileşen düğüme −∞ yazmak eksik kalabilir.

**Kontrol ve cevap.** Her düğüm −∞ olur mu? Hayır. Erişim yönleri belirleyicidir. Sonlu, erişilemez ve aşağı sınırsız sonuçlar ayrı tutulmalıdır.

## 15. DAG'da sıra, öncelik kuyruğunun yerini alır

[Ders sayfasındaki örnek 15](../onceki-ders.html#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

A→B=2, A→C=5, C→B=−4 grafı çevrimsizdir. Geçerli topolojik sıra **A,C,B**'dir; çünkü C→B oku C'nin B'den önce gelmesini ister.

| İşlenen | Yapılan güncellemeler | Son kayıtlar |
|---|---|---|
| A | B'ye 2, C'ye 5 teklif et | A=0,C=5,B=2 |
| C | B'ye 5−4=1 teklif et | A=0,C=5,B=1 |
| B | Çıkış yok | Aynı |

B işlendiğinde ona gelebilecek bütün öncüller zaten işlenmiştir. Daha sonra gelecek bir düğümden B'ye ok olamaz; olsaydı topolojik sıra geçersiz olurdu. Güvenliği bu kez negatif olmayan ağırlıklar değil, okların sırada hep ileri gitmesi sağlar.

**Week 9 ile bağlantı.** Topolojik sıralamayı DFS veya Kahn ile bulmuştuk. Burada o sırayı rota maliyetlerini güncellemek için kullanıyoruz. Topolojik sıra tek başına mesafe değildir; her düğümün çıkışları üzerinde gevşetme yapılır.

**Koşullar.** Önce grafın gerçekten DAG olduğunu doğrulamak gerekir. Erişilemeyen düğümün mesafesi ∞ kalır ve oradan sonlu teklif üretilmez. Bütün topolojik sıralar aynı son mesafeleri verir; eşit rotaların ebeveynleri farklı olabilir.

**Maliyet.** Topolojik sıra ve bütün kenar güncellemeleri komşuluk listeleriyle O(n+m) zamanda yapılabilir. Negatif kenar var diye her zaman daha pahalı Bellman–Ford'a ihtiyaç duyulmaz.

**Kontrol ve cevap.** A,B,C sırası neden yanlış? C→B kuralını ihlal eder; B, C'nin daha ucuz teklifini almadan işlenmiş olur.

## 16. İkinci mola: üç negatif durumu ayırmak

[Ders sayfasındaki örnek 16](../onceki-ders.html#example-16) · [İlgili ders notu](../lecture-notes.html)

122–132. dakikalar arasındaki moladan sonra aşağıdaki ayrımı kendi grafınızla doğrulayın.

| Durum | Örnek | Ne sonuç çıkar? |
|---|---|---|
| Negatif kenar, çevrim yok | A→C=5, C→B=−4 | Sonlu en kısa yol olabilir |
| Çevrim var, toplam pozitif | A→C=5, C→A=−3 | Çevrim maliyeti 2; tekrar ucuzlatmaz |
| Erişilebilir negatif çevrim | A→B=2, B→C=−4, C→A=1 | Etkilediği hedeflerde sonlu minimum yok |

**Soru.** Negatif kenarı kaldırmak için hepsine +10 eklesek? Genel olarak olmaz; farklı sayıda kenar içeren rotalar farklı miktarda pahalılaşır.

**Soru.** DAG'da negatif ağırlık varsa? Topolojik sırayla gevşetme geçerlidir. DAG çevrim içeremediği için negatif çevrim de içeremez.

**Soru.** Bellman–Ford ilk turda birkaç kenar ilerleyebilir mi? Yerinde güncellemede evet. Kenar sırası uygun olduğunda yeni bilgi aynı turda sonraki kenara aktarılır.

**Kısa hesap.** S→B=2, B→A=−3, A→C=1 için toplam 0. Sonucun 0 olması yol bulunmadığı anlamına gelmez; gerçek, sonlu ve üç kenarlı bir rota vardır. Erişilemezlik ∞ ile gösterilir.

## 17. Floyd–Warshall bütün çiftleri bir tabloda tutar

[Ders sayfasındaki örnek 17](../onceki-ders.html#example-17) · [İlgili ders notu](../lecture-notes.html#topic-4-2)

**Veri.** A→B=2, B→C=1, A→C=5. Satır başlangıç, sütun hedef olsun. Başlangıçta doğrudan kenarlar yazılır, köşegene 0, bulunmayan bağlantılara ∞ konur.

| Başlangıç / hedef | A | B | C |
|---|---:|---:|---:|
| A | 0 | 2 | 5 |
| B | ∞ | 0 | 1 |
| C | ∞ | ∞ | 0 |

B ara düğümüne izin verildiğinde A→C için 2+1=3 denenir ve 5 yerine 3 yazılır. Diğer girişler bu graf için değişmez. C→A hâlâ ∞'dir; A→C bulunması ters yönü oluşturmaz.

**Güncelleme.** Her ara düğüm k için bütün i,j çiftlerinde `dist[i,k]+dist[k,j]` ile `dist[i,j]` karşılaştırılır. k dış döngü olmalıdır: her aşamanın anlamı, şimdiye kadar izin verilen ara düğümler üzerinden en iyi rota bilgisidir. İç ve dış döngüleri rastgele yer değiştirmek aynı tek geçiş garantisini vermez.

**Maliyet.** n ara düğüm × n başlangıç × n hedef = n³ karşılaştırma ölçeği. n iki katına çıkınca 2³=8 kat olur. n=200 için 8.000.000 çift denetimi vardır; bu sayı süre değildir. Tablo n² alan tutar. Standart sürüm Θ(n³) zaman ve Θ(n²) alan kullanır.

**Negatif çevrim.** Çalışma sonunda negatif köşegen, bir düğümün kendisine negatif maliyetle dönebildiğini gösterir. Bu durumda çıkan sonlu sayılar etkilenen çiftlerde en kısa mesafe diye sunulamaz. i çevrime ulaşabiliyor ve çevrim j'ye ulaşabiliyorsa o çift için −∞ işaretlemesi ayrıca gerekir.

**Kontrol ve cevap.** Bu yöntem yalnızca A'dan mı hesaplar? Hayır; bütün kaynak–hedef çiftlerini aynı tabloda hesaplar. Bu yüzden tek kaynak sorusuna göre daha fazla iş yapabilir.

## 18. Kendi ağırlıklı oklarınızla deney yapmak

[Ders sayfasındaki örnek 18](../onceki-ders.html#example-18) · [İlgili ders notu](../lecture-notes.html#topic-1-4)

Editörde düğümler A–E, kaynak A olarak sabittir. `A B 4`, A→B maliyeti 4 demektir; çift yönlü koridor değildir. Editör Bellman–Ford hesaplar; bu nedenle negatif girişleri de inceleyebilir.

**Deney 1: kısayol.**

```text
A B 4
A C 1
C B 1
```

A=0,C=1,B=2 olur. B'nin ebeveyni C'dir; doğrudan 4 yerine 1+1=2 kazanır. D ve E ∞ kalır. Satırları farklı sırada yazmak ara turları değiştirebilir ama bu son mesafeleri değiştirmez.

**Deney 2: negatif çevrim ve devamındaki hedef.**

```text
A B 1
B C -2
C B 1
C D 3
```

B→C→B çevrimi −1'dir. A çevrime ulaşır. B,C ve çevrimden çıkışla ulaşılabilen D aşağı sınırsızdır: −∞. A'ya geri ok olmadığı için A=0 kalır. E erişilemez: ∞. Aynı graf üzerinde üç farklı sonuç türü birlikte görülür.

**Deney 3: boş liste.** A=0, B,C,D,E=∞. Kaynak kendi konumuna sıfır hareketle ulaşır; boş kenar listesi diğer düğümleri silmez.

**Editör sınırları.** Kendine oklar ve aynı yönlü uç çiftinin tekrarı kabul edilen modelin dışında; ters oklar ise ayrı geçişlerdir. Matematikte negatif kendine ok bir negatif çevrimdir, ancak bu editör onu girmenize izin veren genel amaçlı bir graf sistemi değildir.

**Kontrol ve cevap.** Negatif ok yazınca mutlaka −∞ mi çıkar? Hayır. Erişilebilir negatif toplamlı çevrim ve hedefine doğru erişim gerekir. Tek bir negatif kenar sonlu bir rotanın parçası olabilir.

## 19. Python Dijkstra kodunu satır satır okumak

[Ders sayfasındaki örnek 19](../onceki-ders.html#example-19) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

Ana örnekteki Run düğmesi aşağıdaki kodu çalıştırır. `input()` yoktur; graf doğrudan sözlükte tanımlıdır. Her çalıştırma başlangıç kayıtlarını yeniden oluşturur.

```python
import heapq

graph = {"A": [("B", 2), ("C", 5)],
         "B": [("C", 1)], "C": []}
if any(weight < 0 for edges in graph.values() for _, weight in edges):
    raise ValueError("Dijkstra requires nonnegative weights")
distance = {v: float("inf") for v in graph}
parent = {v: None for v in graph}
distance["A"] = 0
queue = [(0, "A")]
while queue:
    cost, u = heapq.heappop(queue)
    if cost != distance[u]:
        continue
    for v, weight in graph[u]:
        candidate = cost + weight
        if candidate < distance[v]:
            distance[v] = candidate
            parent[v] = u
            heapq.heappush(queue, (candidate, v))
print("Distances:", distance)
print("Parents:", parent)
```

| Satır | Açıklama |
|---|---|
| 1 | En küçük öğeyi çıkaran heap işlemlerini kullanmak için `heapq` yükler. |
| 2 | Okunabilirlik için boş satırdır. |
| 3–4 | Her düğümün çıkışlarını (hedef, ağırlık) çiftleri olarak yazar. C'nin çıkış listesi boştur. |
| 5 | Bütün kenar ağırlıklarını tarar; herhangi biri negatif mi diye kontrol eder. `_`, bu kontrolde kullanılmayan hedef etiketidir. |
| 6 | Negatif varsa algoritmayı çalıştırmadan anlaşılır hata verir. |
| 7 | Bütün mesafe kayıtlarını ∞ yapar; henüz hiçbir rota bulunmadı. |
| 8 | Ebeveynleri `None` yapar; henüz önceki düğüm bilinmiyor. |
| 9 | Kaynağın kendisine maliyetini 0 olarak ayarlar. |
| 10 | Başlangıç kuyruğuna yalnızca (0,A) teklifini koyar. |
| 11 | Bekleyen kayıt kaldığı sürece döngüyü sürdürür. |
| 12 | En küçük maliyetli kaydı çıkarır; `cost` maliyet, `u` düğümdür. |
| 13 | Bu kayıt sonradan iyileşmiş eski bir teklif mi diye karşılaştırır. |
| 14 | Eskiyse komşulara bakmadan sonraki kayda geçer. |
| 15 | Güncel u düğümünden çıkan bütün kenarları dolaşır. |
| 16 | u'ya kadar ödenen maliyete yeni kenarın ağırlığını ekler. |
| 17 | Adayın mevcut v kaydından kesin olarak küçük olup olmadığını sınar. |
| 18 | Daha ucuz toplamı v'nin mesafesine yazar. |
| 19 | Bu iyileşmenin son kenarı u→v olduğu için ebeveyni u yapar. |
| 20 | Yeni teklifi heap'e ekler; eski v kaydını arayıp silmez. |
| 21 | Son mesafe sözlüğünü yazdırır. |
| 22 | Rotayı geri kurmaya yarayan ebeveyn sözlüğünü yazdırır. |

**Beklenen çıktı.**

```text
Distances: {'A': 0, 'B': 2, 'C': 3}
Parents: {'A': None, 'B': 'A', 'C': 'B'}
```

**Değişiklik deneyi.** B→C ağırlığını 1 yerine 10 yaparsanız B üzerinden C'ye teklif 2+10=12 olur. Doğrudan 5 daha ucuzdur: C'nin mesafesi 5, ebeveyni A kalır. B yine 2'dir. Negatif değer yazarsanız kod bilerek `ValueError` verir; bu durumda bir rota sonucu üretmesi beklenmez.

**Veri sözleşmesi.** Her hedef, sözlükte anahtar olarak da bulunmalıdır. D'ye ok ekliyorsanız `"D": []` gibi D kaydını da ekleyin. Bu kısa öğretim kodu her olası hatalı veri türünü doğrulayan genel bir kütüphane değildir. Sonlu sayısal ağırlıklar ve tanımlı düğümler kullanın.

**Eşitlik.** Maliyetler eşitse Python'un bu `(maliyet, harf)` kayıtlarında harf sırası bağlayıcı olur. Mesafe eşitliğinde güncelleme yapılmaz; mevcut ebeveyn korunur. Ebeveyn ağacı eşitlik kuralına bağlı olabilir ama en kısa maliyet değişmez. Graf editörü ile kod örneği ayrı girdilerdir; birindeki değişiklik diğerine otomatik aktarılmaz.

## 20. Robot daha fazla hareketle daha az maliyet ödeyebilir

[Ders sayfasındaki örnek 20](../onceki-ders.html#example-20) · [İlgili ders notu](../lecture-notes.html#topic-5-2)

**Izgara.** İki satır, üç sütun. Üst satır S, çamur, hedef; alt satır A,B,C. Bu harfler yalnızca bu ızgaranın hücre etiketleridir. Hareketler yukarı, aşağı, sağ, sol; çapraz hareket yok.

```text
S (başlangıç)   Çamur (8)   Hedef (1)
A (3)          B (3)       C (1)
```

Ücret, **girilen hücrenin** maliyetidir. Başlangıçta S üzerinde bulunmak için ücret ödenmez. Görsel S'nin giriş maliyetini 1 gösterir; S'ye sonradan geri girilirse bu maliyet uygulanır.

| Rota | Hareket sayısı | Toplam giriş maliyeti |
|---|---:|---:|
| S→Çamur→Hedef | 2 | 8+1=9 |
| S→A→B→C→Hedef | 4 | 3+3+1+1=8 |

BFS en az hareketli iki adımlı rotayı bulur. Dijkstra biriken maliyete bakarak dört adımlı 8 maliyetli rotayı seçer. Başka bir rota ara hücrelerden çamura çıkabilir; fakat negatif maliyet olmadığı için tekrarlar ucuzlatmaz ve verilen değerlerde bu dolambaçlı seçenekler 8'i iyileştirmez.

**Hedefi unutmayın.** Alt sıradaki üç hücre toplamı 7'dir ama robot henüz hedefte değildir. Hedefe girmek için +1 daha gerekir. Bu yüzden cevap 7 değil 8.

**Çamur 1 olursa.** Doğrudan rota 1+1=2 olur ve kazanır. Değişen ağırlıkla eski cevap kullanılmamalıdır.

**Model ayrıntısı.** Komşuluk iki yönde açık olsa bile giriş maliyeti farklı hücrelerde farklıdır. u'dan v'ye geçiş bedeli v'nin, ters geçiş bedeli u'nun giriş maliyetidir. Fiziksel hareket simetrik olabilir; maliyetler aynı olmak zorunda değildir.

## 21. A*: ödenen maliyete kalan iş tahminini eklemek

[Ders sayfasındaki örnek 21](../onceki-ders.html#example-21) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

A* önceliği `f=g+h` olarak kurar. g, şimdiye kadar bulunan rotanın gerçek maliyetidir. h, hedefe kalan maliyet için iyimser tahmindir. h, ödenmiş gerçek ücret değildir.

Aynı dört yönlü ızgarada her giriş maliyeti en az 1. Manhattan uzaklığı yatay ve düşey farkların toplamıdır. Hedef üst sağ hücre (0,2) ise:

| Hücre | Konum | Manhattan h | Bilinen rota g | f=g+h |
|---|---|---:|---:|---:|
| S | (0,0) | 2 | 0 | 2 |
| Çamur | (0,1) | 1 | 8 | 9 |
| Alt sol A | (1,0) | 3 | 3 | 6 |
| Alt orta B | (1,1) | 2 | 6 | 8 |
| Alt sağ C | (1,2) | 1 | 7 | 8 |
| Hedef | (0,2) | 0 | 8 | 8 |

Tablodaki g değerleri ilgili rotalar bulunduğundaki değerlerdir; hepsi aramanın başında biliniyor değildir. S işlenince A için f=6, çamur için f=9 olur. Alt yol ilerletilir ve hedef 8 maliyetiyle çıkarılır. Bu örnekte A* çamuru işlemekten kaçınabilir; her haritada mutlaka daha az düğüm işleyeceği söylenemez.

**Tahmin neden güvenli?** Dört yönlü hareketle hedefe ulaşmak için en az Manhattan kadar hareket gerekir; her hareket en az 1 tutar. Bu nedenle h gerçek kalan maliyeti aşmaz. Ayrıca tek hareket h'yi en fazla 1 azaltabilir ve maliyeti en az 1'dir. Böylece her kenarda `h(u) ≤ cost(u,v)+h(v)` sağlanır: tahmin tutarlıdır.

**Kapatılmış düğümler.** Bu tutarlı tahminle, standart kapalı-kümeli A* kesinleşmiş hücreleri tekrar açmadan doğru sonuç verebilir. Yalnızca iyimser ama tutarsız bir tahminde daha iyi g bulununca düğümü yeniden açmak gerekebilir. Bu iki koşul aynı değildir.

**Kontrol ve cevap.** h=0 olursa ne olur? Öncelik g olur; aynı eşitlik kuralıyla Dijkstra gibi davranır. Çapraz hareket veya sıfır maliyetli geçiş eklenirse bu Manhattan×1 gerekçesi yeniden değerlendirilmelidir.

## 22. Algoritmayı isminden değil koşullarından seçmek

[Ders sayfasındaki örnek 22](../onceki-ders.html#example-22) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

Önce okun anlamını, sonra ağırlığı, sonra hangi mesafelerin istendiğini yazın. Tek hedef, tek kaynaktan bütün hedefler ve bütün çiftler farklı çıktı kapsamlarıdır.

| Koşul / ihtiyaç | Uygun araç | Gerekçe |
|---|---|---|
| Bütün kenarlar eşit pozitif maliyetli | BFS | En az kenar, en az toplam demektir |
| Ağırlıklar negatif değil | Dijkstra | En küçük teklif güvenle kesinleşir |
| Negatif ağırlık olabilir | Bellman–Ford | Tekrarlanan gevşetme ve negatif çevrim kontrolü |
| Yönlü çevrimsiz graf | Topolojik gevşetme | Bütün öncüller önce işlenir; negatif ağırlık da olabilir |
| Küçük/orta boyutta bütün çiftler | Floyd–Warshall düşünülebilir | n×n mesafe tablosunu birlikte hesaplar |
| Tek hedef, güvenli tahmin mevcut | A* | g+h ile hedefe yönelik öncelik |

**Çıktıdan önce üç soru.** Hedef erişilemez mi? Mesafe sonlu mu? Kaynaktan erişilebilir negatif çevrim hedefe ulaşabiliyor mu? Bu soruların cevapları sırasıyla ∞, sonlu sayı veya −∞ yorumunu belirler. Her duruma sıradan bir rota listesi yazılmaz.

**Cevabı denetlenebilir yapmak.** “Dijkstra kullandım” yerine “bütün ağırlıklar negatif değil; kaynak A; rota A→B→C; maliyet 2+1=3” yazın. Bir alternatifin neden kaybettiğini de gösterin: doğrudan rota 5. Yalnızca algoritma adı değil, model ve hesap görünür olur.

**Özel yapıdan yararlanma.** Negatif ağırlıklı bir DAG için Bellman–Ford zorunlu değildir; O(n+m) topolojik yöntem yeterlidir. Buna karşılık işler arasındaki en uzun zorunlu zinciri bulmak bir en uzun yol/çizelgeleme sorusudur; en kısa rota güncellemesini amaç değişmeden uygulamayız.

**Robot modelini kontrol etme.** Enerji kazanımı, batarya üst sınırı, yönelme ve dönüş süresi gibi etkiler varsa düğümü yalnızca konum olarak tanımlamak yetersiz olabilir. Durumun konumla birlikte yön veya enerji içermesi gerekebilir. Algoritmanın doğruluğu, verdiğimiz graf modelini doğru çözmesiyle ilgilidir; modelin bütün fiziksel gereksinimleri içerdiğini ayrıca değerlendirmeliyiz.

