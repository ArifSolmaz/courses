# Güncel canlı Adventure — tam tekrar kontrolü

19 Ekim 2026. Canlı sürüm: `adventure.js?v=20261019playback3`; uygulama commit’i `39577fd`, depo HEAD `54d71d5`.

Bu kontrol önceki 7 yayın sonrası denemeden bağımsız, baştan yapılan tam bir oynama turudur. 16 seviyenin her biri 1366×768 laptop ve 390×844 mobil boyutunda başarılı ve başarısız planla oynandı: **64 ayrı deneme, 32 başarı, 32 hata sonucu**. Her seviye/ekran boyutu grubunda devam eden animasyon gözlemi var. **184 animasyon/geçiş karesi ve 64 sonuç ekranı** kaydedildi; seviye ve boyuta göre oluşturulan görsel karşılaştırmalar incelendi.

| Oyun | Seviye | Laptop başarı/hata | Mobil başarı/hata | Animasyon ve görsel inceleme |
|---|---|---|---|---|
| robot | 1 — Beat Pip | ✓ / ✓ | ✓ / ✓ | ✓ |
| robot | 2 — City blocks | ✓ / ✓ | ✓ / ✓ | ✓ |
| robot | 3 — Pick up first | ✓ / ✓ | ✓ / ✓ | ✓ |
| robot | 4 — A new city | ✓ / ✓ | ✓ / ✓ | ✓ |
| commands | 1 — Find the exit | ✓ / ✓ | ✓ / ✓ | ✓ |
| commands | 2 — Reverse control | ✓ / ✓ | ✓ / ✓ | ✓ |
| commands | 3 — Collect the key | ✓ / ✓ | ✓ / ✓ | ✓ |
| commands | 4 — A new mission | ✓ / ✓ | ✓ / ✓ | ✓ |
| depot | 1 — Build the shelves | ✓ / ✓ | ✓ / ✓ | ✓ |
| depot | 2 — The lost parcel | ✓ / ✓ | ✓ / ✓ | ✓ |
| depot | 3 — Grow a tree | ✓ / ✓ | ✓ / ✓ | ✓ |
| depot | 4 — Choose the index | ✓ / ✓ | ✓ / ✓ | ✓ |
| sorting | 1 — An easy line? | ✓ / ✓ | ✓ / ✓ | ✓ |
| sorting | 2 — Expensive writes | ✓ / ✓ | ✓ / ✓ | ✓ |
| sorting | 3 — Two packing lanes | ✓ / ✓ | ✓ / ✓ | ✓ |
| sorting | 4 — A new contract | ✓ / ✓ | ✓ / ✓ | ✓ |

## Sonuçlar

- 64/64 denemede beklenen başarı/hata durumu geldi.
- Sonuç ve kayıtlı geçişlerde yatay sayfa taşması yok.
- Küçük sıralama çubuklarındaki yüzler ve sayılar kesilmiyor; iki hat ve birleşme aşamalarında görünür kalıyor.
- Robot rotalarının düğümleri, komut ızgarası, çalışan/hatalı komut vurguları ve anahtar/çıkış durumları incelendi.
- Depodaki raf ve ağaç arama vurguları, uzun arama yolları ve sonuç metinleri incelendi.
- Başarı/hata kutularında gözlenen yeni örtüşme veya kesilme yok. Tarayıcı hata kaydı boş.
- Yeni bir uygulama düzeltmesi gerekmedi; bu turda oyun kodu değiştirilmedi.

## Kapsam sınırı

Mobil kontrol fiziksel telefon yerine tarayıcı görünüm boyutu benzetimidir. Yeni durum üreten dördüncü seviyeler Case 1 ile oynandı. Her olası rastgele durum, her tarayıcı ve her animasyon karesi için kapsam iddiası yoktur. Animasyonlar çalışırken ardışık ekran görüntüleri alınmıştır; tam video kaydı değildir. İlk komutta biten bazı hatalar ilk görüntü alınırken sonuç ekranına ulaşır; aynı seviyenin başarılı planında devam eden animasyon ayrıca kontrol edilmiştir. Factory ve Strategy Quests bu istenen 16 seviyelik kapsamın dışında kalır.

Görsel kanıt galerisi: [aa-adventure-live-full-audit](/Users/arf/.codex/visualizations/2026/09/19/01a0baee-0b67-7363-b228-f8b7ce6c94e5/aa-adventure-live-full-audit/index.html). Ham sonuç kaydı: `/Users/arf/.codex/visualizations/2026/09/19/01a0baee-0b67-7363-b228-f8b7ce6c94e5/aa-adventure-live-full-audit/results.json`.
