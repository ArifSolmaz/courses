# Adventure — New case canlı testleri

19 Ekim 2026. Canlı adres: https://arifsolmaz.github.io/courses/aa/play-lab/adventures/
Sürüm: adventure.js?v=20261019playback3.

Önceki 16 seviye / 64 Case 1 denemesine ek olarak, yeni durum üreten dördüncü seviyelerde **64 canlı UI denemesi** yapıldı. Her durum 1366×768 laptop ve 390×844 mobil görünümde, bir başarılı ve bir başarısız planla oynandı. Durumlar gerçek New case düğmesine basılarak oluşturuldu; sonuçlar veya oyun durumu programatik olarak değiştirilmedi. Planlar kaynak modelden hazırlanıp arayüz kontrolleriyle girildi.

| Oyun | New case ile ulaşılan durumlar | Laptop + mobil deneme |
|---|---|---|
| Beat the Robot | Case 2–5, dört yeni harita | 16 |
| Command Centre | Case 2–7, altı farklı düzen | 24 |
| Depot Detective | Case 2–3, iki veri kümesi | 8 |
| Sorting Arena | Case 2–5, dört dizi/yazma maliyeti | 16 |

## Sonuç

- 64/64 denemede beklenen başarı/hata sonucu: 32 başarı, 32 başarısızlık.
- 251 animasyon/geçiş görüntüsü ve 64 sonuç görüntüsü kaydedildi. Karşılaştırma sayfaları görsel olarak incelendi.
- Kaydedilen geçiş ve sonuçlarda yatay sayfa taşması yok. Tarayıcı hata kaydı boş.
- Robot: değişen konumlar, rota çizgileri, geçerli ama pahalı planlar ve teslim alma sırasını ihlal eden planlar.
- Commands: altı haritada anahtar toplama, stack sırası, başarılı çıkış; doğru rotadan sonra sınır dışına çıkan ekstra komutla hata ekranı. Çalışan/hatalı komut ve hücre vurguları incelendi.
- Depot: çakışmasız hash, çakışmalı hash, doğrusal ve dengeli ağaç; arama yolu ve sonuç açıklamaları incelendi.
- Sorting: yazma ağırlıkları 3, 4, 1, 2; tekrarlı değerler, tek/iki hat, dengesiz bölmeler, sıralama/birleşme aşamaları. Küçük çubuk yüzlerinde kesilme gözlenmedi.
- Yeni görsel hata gözlenmedi; uygulama kodu değiştirilmedi ve yeni yayın yapılmadı.

## Çeşitlilik ve kapsam sınırı

Depot üreticisi yalnızca iki anahtar kümesi arasında döner; Commands altı farklı düzen üretir. Bu iki oyunda üretilen düzen çeşitlerinin tamamı kapsandı. Robot ve Sorting için dört yeni durum örneklendi; tüm olası durumların kontrol edildiği iddia edilmez.

Bu ek tur dört Adventure oyununun yeni durum üreten dördüncü seviyelerine odaklanır; ilk üç seviyenin Case 1 testleri önceki rapordadır. Factory Rush ve Strategy Quests bu 16 Adventure seviyelik kapsamın dışında kalır. Mobil test fiziksel telefon değil, tarayıcı görünüm boyutu benzetimidir. Animasyonlar ardışık ekran görüntüleriyle incelendi; her kareyi içeren video değildir. Sorting animasyonu her karşılaştırmayı değil, aşama geçişlerini gösterir. Sonuç dosyasındaki legacy `level` alanı bu ek turda case numarasını taşır; oynanan seviye hepsinde 4'tür.

Kanıt galerisi: [Ekran kayıtları](/Users/arf/.codex/visualizations/2026/09/19/01a0baee-0b67-7363-b228-f8b7ce6c94e5/aa-adventure-newcase-audit/index.html).
