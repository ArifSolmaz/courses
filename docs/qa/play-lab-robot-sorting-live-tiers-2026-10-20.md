# Robot ve Sorting Arena: canlı kademe kontrolü — 20 Ekim 2026

## Kapsam

Canlı adres: https://arifsolmaz.github.io/courses/aa/play-lab/adventures/

Yayımlanmış sürüm: 44f07401c15e83381d7e01a9b0508f109914b823.
Bu denetim, iki oyunun dördüncü Adventure bölümündeki New case ile artan dört **Challenge** kademesini kapsar. Önceki üç sabit öğretici bölüm bu yeni 64 denemenin parçası değildir.

| Kademe | Oynanan durumlar | Robot | Sorting |
|---|---|---|---|
| 1 | Case 2, 3 | 3 durak | 4 parça |
| 2 | Case 5, 6 | 4 durak | 5 parça |
| 3 | Case 8, 9 | 5 durak, A önce D | 7 parça |
| 4 | Case 11, 12 | 6 durak, A önce D | 8 parça |

Her durum 390×844 ve 1366×768 görünümde, bir başarısız ve bir başarılı planla canlı arayüz üzerinden oynandı. Durumlar New case düğmesiyle üretildi. Planlar yerel modelden hazırlanıp arayüzdeki düğme ve seçim kutularıyla girildi; uygulama durumu veya puanlar doğrudan değiştirilmedi.

## Sonuç

- 64/64 deneme beklenen başarı/hata ekranını verdi (32 başarı, 32 hata).
- 64/64 denemede sayfa genişliğini aşan yatay taşma yok.
- Robot: ilk iki kademede uzun rota; son iki kademede A→D öncelik ihlali reddedildi. En kısa geçerli rotalar kabul edildi.
- Sorting: bütçeyi aşan planlar reddedildi, hedef maliyeti sağlayan planlar kabul edildi. Tek hat ve iki hat/birleştirme durumları kapsandı.
- Her koşunun animasyon sırasında alınan kareleri ve nihai ekranı görsel olarak incelendi. İncelenen yüzler, sayılar, durak etiketleri, rota çizgileri, şeritler ve sonuç kutularında kesilme bulunmadı.
- Canlı sekmede tarayıcı hata kaydı yok.
- Canlı sınıf tablosu test_user için 480 puan gösterdi; bu tekrarlar puan eklemedi.

## Bulunan iki küçük sorun ve yerel düzeltmeler

1. 390 px genişlikte Sorting seçim kutusunda “Selection · find smallest” metni kesiliyordu. 420 px ve altındaki seçim alanları tam satır genişliğine alındı.
2. Tek birleştirme karşılaştırması için “1 comparisons” yazıyordu; “1 comparison” olarak düzeltildi.

Bu düzeltmeler **push edilmedi**. Yerelde Sorting Case 8 başarılı planı yeniden oynandı: 52 enerji, doğru tekil metin, tam görünen seçenekler ve yatay taşma olmaması doğrulandı. JavaScript sözdizimi ve diff boşluk kontrolü geçti.

## Sınırlar ve kalan kullanım sorunu

Bu bir fiziksel telefon/Safari/Android tarayıcı testi değil; aynı tarayıcıda mobil ve laptop viewport kontrolüdür. Sonlu örnekler test edildi, üretilebilecek tüm case'ler değil. Animasyonların ara kareleri incelendi; her video karesi veya performans hızı ölçülmedi.
Mobilde harita, kontrol alanları ve açıklamalı sonuç tek ekrana sığmıyor; dikey kaydırma gerekiyor. Laptopta da üst gezinme alanıyla birlikte tüm sonuç tek ilk ekranda görünmüyor. İçerik kesilmiyor fakat daha kompakt oyun görünümü ayrı bir tasarım iyileştirmesi olarak duruyor.

## Kanıt

- [Koşu ve ekran görüntüsü galerisi](/Users/arf/.codex/visualizations/2026/09/19/01a0baee-0b67-7363-b228-f8b7ce6c94e5/robot-sorting-live-all-tiers/index.html)
- [Ham sonuçlar](/Users/arf/.codex/visualizations/2026/09/19/01a0baee-0b67-7363-b228-f8b7ce6c94e5/robot-sorting-live-all-tiers/results.json)
- [Canlı sınıf tablosu](/Users/arf/.codex/visualizations/2026/09/19/01a0baee-0b67-7363-b228-f8b7ce6c94e5/robot-sorting-live-all-tiers/board-after.png)

## Canlı koşu dökümü

| Görünüm | Oyun | Case | Kademe | Plan | Sonuç |
|---|---|---|---|---|---|
| mobile | robot | 2 | 1 | bad | Reddedildi |
| mobile | robot | 2 | 1 | good | Başarılı |
| mobile | robot | 3 | 1 | bad | Reddedildi |
| mobile | robot | 3 | 1 | good | Başarılı |
| mobile | robot | 5 | 2 | bad | Reddedildi |
| mobile | robot | 5 | 2 | good | Başarılı |
| mobile | robot | 6 | 2 | bad | Reddedildi |
| mobile | robot | 6 | 2 | good | Başarılı |
| mobile | robot | 8 | 3 | bad | Reddedildi |
| mobile | robot | 8 | 3 | good | Başarılı |
| mobile | robot | 9 | 3 | bad | Reddedildi |
| mobile | robot | 9 | 3 | good | Başarılı |
| mobile | robot | 11 | 4 | bad | Reddedildi |
| mobile | robot | 11 | 4 | good | Başarılı |
| mobile | robot | 12 | 4 | bad | Reddedildi |
| mobile | robot | 12 | 4 | good | Başarılı |
| mobile | sorting | 2 | 1 | bad | Reddedildi |
| mobile | sorting | 2 | 1 | good | Başarılı |
| mobile | sorting | 3 | 1 | bad | Reddedildi |
| mobile | sorting | 3 | 1 | good | Başarılı |
| mobile | sorting | 5 | 2 | bad | Reddedildi |
| mobile | sorting | 5 | 2 | good | Başarılı |
| mobile | sorting | 6 | 2 | bad | Reddedildi |
| mobile | sorting | 6 | 2 | good | Başarılı |
| mobile | sorting | 8 | 3 | bad | Reddedildi |
| mobile | sorting | 8 | 3 | good | Başarılı |
| mobile | sorting | 9 | 3 | bad | Reddedildi |
| mobile | sorting | 9 | 3 | good | Başarılı |
| mobile | sorting | 11 | 4 | bad | Reddedildi |
| mobile | sorting | 11 | 4 | good | Başarılı |
| mobile | sorting | 12 | 4 | bad | Reddedildi |
| mobile | sorting | 12 | 4 | good | Başarılı |
| laptop | robot | 2 | 1 | bad | Reddedildi |
| laptop | robot | 2 | 1 | good | Başarılı |
| laptop | robot | 3 | 1 | bad | Reddedildi |
| laptop | robot | 3 | 1 | good | Başarılı |
| laptop | robot | 5 | 2 | bad | Reddedildi |
| laptop | robot | 5 | 2 | good | Başarılı |
| laptop | robot | 6 | 2 | bad | Reddedildi |
| laptop | robot | 6 | 2 | good | Başarılı |
| laptop | robot | 8 | 3 | bad | Reddedildi |
| laptop | robot | 8 | 3 | good | Başarılı |
| laptop | robot | 9 | 3 | bad | Reddedildi |
| laptop | robot | 9 | 3 | good | Başarılı |
| laptop | robot | 11 | 4 | bad | Reddedildi |
| laptop | robot | 11 | 4 | good | Başarılı |
| laptop | robot | 12 | 4 | bad | Reddedildi |
| laptop | robot | 12 | 4 | good | Başarılı |
| laptop | sorting | 2 | 1 | bad | Reddedildi |
| laptop | sorting | 2 | 1 | good | Başarılı |
| laptop | sorting | 3 | 1 | bad | Reddedildi |
| laptop | sorting | 3 | 1 | good | Başarılı |
| laptop | sorting | 5 | 2 | bad | Reddedildi |
| laptop | sorting | 5 | 2 | good | Başarılı |
| laptop | sorting | 6 | 2 | bad | Reddedildi |
| laptop | sorting | 6 | 2 | good | Başarılı |
| laptop | sorting | 8 | 3 | bad | Reddedildi |
| laptop | sorting | 8 | 3 | good | Başarılı |
| laptop | sorting | 9 | 3 | bad | Reddedildi |
| laptop | sorting | 9 | 3 | good | Başarılı |
| laptop | sorting | 11 | 4 | bad | Reddedildi |
| laptop | sorting | 11 | 4 | good | Başarılı |
| laptop | sorting | 12 | 4 | bad | Reddedildi |
| laptop | sorting | 12 | 4 | good | Başarılı |
