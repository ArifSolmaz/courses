# AA Türkçe teknik notlar — 5–14. hafta denetimi

Tarih: 19 Ekim 2026. İncelenen temel sürüm: `e54ef48`; aşağıdaki düzeltmeler yerel çalışma dosyalarındadır.

## Kapsam ve sonuç

10 haftadaki 238 bölüm (218 örnek ve 20 mola/tekrar bölümü), giriş tanımları, tablolar, hesaplar, karmaşıklık varsayımları ve kod açıklamaları incelendi. Örneklerin sırası ve İngilizce başlıkları `examples/cards.js` ile, konu bağlantıları `lecture-notes.html` ile karşılaştırıldı. Büyük bir hesap veya algoritma doğruluğu hatası bulunmadı. Bu bir içerik denetimidir; tüm olası girdiler için biçimsel doğrulama iddiası değildir.

| Hafta | Bölüm | İncelenen başlıca doğruluk noktaları |
|---|---:|---|
| 5 | 28 | BST yüksekliği/ardıl/silme; hash çakışması ve tombstone; beklenen–amortize ayrımı; doğum günü olasılığı; Rabin–Karp hash değerleri |
| 6 | 28 | Heap şekli ve değer koşulu; ekleme/çıkarma izleri; aşağıdan kurmanın doğrusal maliyeti; heapsort ve zamanlayıcılar |
| 7 | 28 | Özyineleme bağıntıları; merge karşılaştırma/yazma sayıları; partition; rastgele pivot varsayımı; counting/radix ve kararlılık |
| 8 | 22 | Graf temsili; BFS keşfi/kuyruk/ebeveyn; yönlülük; iki renklilik; ızgara kenar ve yol sayımları |
| 9 | 22 | DFS aktif–bitmiş ayrımı; zaman damgaları/kenar sınıfları; Kahn ve ters bitiş sırası; çevrim, kesme düğümü ve SCC |
| 10 | 22 | MST ve en kısa yol ayrımı; kesit/değişim gerekçesi; Prim/Kruskal toplamları; union-find; eşit ağırlıklar ve metrik tur koşulları |
| 11 | 22 | Gevşetme; Dijkstra koşulları; negatif kenar/çevrim; Bellman–Ford tur sırası; DAG, Floyd–Warshall ve A* varsayımları |
| 12 | 22 | Alt küme/permutasyon sayıları; güvenli budama; vezir/Sudoku; Fibonacci çağrıları; DP durumları; tam kenar sayısı; ızgara yolları |
| 13 | 22 | Düzenleme/LCS/LIS/DTW tabloları; knapsack; aralık planlama; Kadane; yumurta/kesim/yakıt/gruplama hesapları; sözde polinom ve üstel DP |
| 14 | 22 | Tanık ve arama; P/NP tanımları; indirgeme yönü; SAT yapımı; örtü/bağımsız küme/klik; alt–üst sınırlar ve yaklaşım garantileri |

## Yapılan düzeltmeler

- Hafta 7, örnek 11: `n(n+1)/2` açılımındaki `n²/2`, “en büyük terim” yerine “açılmış formülün baskın terimi” olarak tanımlandı. Toplamın en büyük toplananı olan n ile karışması önlendi.
- Hafta 8, örnek 6: Komşuluk listesi/matrisi tablosundaki iş “komşuları sayma” yerine “komşuları listeleme” oldu. Saklanan derece/uzunluk bilgisini okumakla bütün komşuları dolaşmak ayrıldı.
- Hafta 6 ve 8: Python bloklarına eksik satır numaraları eklendi; diğer haftalarla aynı görünüm kullanıldı. Numaralar kopyalama ve ekran okuyucu metnine dahil edilmez.
- Bütün haftalar: `pre` içindeki kodun ayrıca yüzde 88'e küçülmesi kaldırıldı. Kod laptopta 14 px, dar ekranda 12 px olarak gösterilir. CSS sürümü yenilendi.
- Metinsel düzeltmeler hem Markdown hem HTML kaynağına işlendi; çalıştırılan Python mantığı değiştirilmedi.

## Doğrulama kanıtları

- `node tools/aa_checks/check-wN.cjs`, N=5…14: on kontrolün tamamı geçti. Toplam 1.311 kaynak görsel karesi kontrol edildi. Bunlar kaynak örneklerin algoritma testleridir; Türkçe metnin doğruluğunun tek başına kanıtı olarak kullanılmadı.
- Notlara özgü ek denetim: 238 bölümün numarası, başlığı ve kaynak örneği eşleşiyor; bölüm kimlikleri benzersiz.
- 767 bağlantı kaydı incelendi: 764 yerel dosya/bölüm hedefi mevcut. Kalan üç kayıt aynı Clay Mathematics Institute sayfasına gider; bu sayfa ayrıca açıldı. Dinamik `#example-N` bağlantıları kart sayısıyla doğrulandı. Mola bölümlerinin genel tekrar bağlantıları ayrı ele alındı.
- On haftanın Markdown ve HTML ana içerikleri, biçimlendirme ve görüntüleme amaçlı satır numaraları çıkarılarak karşılaştırıldı: metinler eşleşiyor.
- Sekiz Python bloğu çalıştırıldı; sonuçları notlarda yazılı çıktılarla eşleşti. Ana ders kodlarıyla sözdizim ağacı karşılaştırması da geçti. Hafta 6'nın ana ders kodunda fazladan iki İngilizce yorum vardır; çalıştırılan işlemler aynıdır.
- `git diff --check` temiz.

## Görsel kontrolün kapsamı

- Her hafta tarayıcıda açıldı. 1366×768, 1024×768 ve 390×844 boyutlarında bütün bölümlerin, tabloların ve kod bloklarının yerleşim ölçümleri alındı.
- Sayfa düzeyinde yatay taşma, gizli bölüm veya tablonun kendi alanından taşması bulunmadı.
- Her haftadan temsilî tablo/kod/metin bölümleri ekran görüntüsüyle incelendi. Bu, 238 bölümün her pikselinin ayrı ekran görüntüsüyle incelendiği anlamına gelmez; tüm bölümler ölçümle, seçilen bölümler ayrıca görsel olarak kontrol edildi.
- 1366 px genişlikte bütün kod ve şema blokları yatay kaydırma olmadan sığıyor. 1024 px'de bazı uzun kodlar, telefonda ise uzun kod/ASCII şemaları kendi kutuları içinde yatay kaydırma gerektiriyor. Girinti ve şema hizası korunuyor; sayfanın tamamı taşmıyor.
- Açıklamalar ve cevaplar açık kalıyor. Bunlar uzun teknik okuma sayfaları olduğu için düşey kaydırma beklenir; bütün bir açıklamayı tek ekrana sıkıştırmak için içerik kaldırılmadı.
- Yazdırma/PDF çıktısı bu tarayıcı denetiminin kapsamında ayrıca üretilmedi.

## Başvuru kontrolü

- [MIT 6.046J ders notları](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/b1e5ac3c8f7d60db9b8d5b66c40bc55e_MIT6_046JS12_Notes.pdf): özellikle union-find amortize sınırı ve MST tabanlı kümeleme bağlamı.
- [Clay Mathematics Institute: P vs NP](https://www.claymath.org/millennium/p-vs-np/): 14. haftanın P=NP/P≠NP konusunda açık problem ifadesi güncel resmî durumla uyumlu.

Bu denetim sonunda commit veya push yapılmadı.
