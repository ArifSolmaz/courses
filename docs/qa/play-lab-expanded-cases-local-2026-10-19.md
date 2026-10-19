# Depot ve Command Centre — genişletilmiş yerel durumlar

Henüz push veya deploy yapılmadı. Dördüncü Adventure seviyesindeki New case üretimi değişti; ilk üç öğretici seviye aynı kaldı.

## Tasarım

- Her üç case bir üst kademeye geçer; 10. case sonrası dördüncü kademede yeni durumlar devam eder.
- Command Centre: 6–8, 9–11, 12–14, 15–17 hamlelik en kısa çözüm bantları; değişen başlangıç/çıkış, duvarlar, anahtar ve queue/stack. Her aday BFS ile doğrulanır. Üretim sınırına ulaşılırsa çözülebilir koridor kullanılır.
- Depot: 4, 5, 6, 7 parça; farklı sayılar ve farklı hash ev-raf dağılımları. Dağınık, karışık ve kümelenmiş örnekler. En iyi hash yerleştirme sırası tüm permütasyonlarla karşılaştırılır; dengeli ağaç hedefiyle birlikte gerçek optimum gösterilir. Zorluk kademesi parça sayısını artırır; her case'in diğerinden mutlak olarak zor olduğu iddia edilmez.
- Previous case geri dönmeyi sağlar. Challenge etiketi ve kısa Türkçe açıklama görünür.

## Kontrol

- 120 benzersiz komut haritası, 120 benzersiz parça kümesi, 67 farklı hash kalan dağılımı. Her hedef için çözüm tanığı doğrulandı.
- Adventure regresyonları, 15 Strategy Quest modeli ve sınıf puanı doğrulayıcısının 66 Adventure tekrarı geçti.
- Yerel UI: Commands Case 1/4/7/10 ve Depot Case 2/5/8/11; her biri laptop 1366 ve mobil 390 piksel genişlikte başarılı/başarısız planla oynandı: 32 doğrulanmış kombinasyon. Yanlış sekmeye uygulanan ilk boyutlandırma denemeleri kapsamdan çıkarıldı, doğru boyutta tekrarlandı; son PNG genişlikleri kontrol edildi.
- Mobil/laptop sonuç ekranları ve animasyon geçişleri incelendi. Yatay taşma veya yeni kesilme gözlenmedi. Mobil fiziksel cihaz testi değildir.
- Previous case → New case dönüşü ve boş tarayıcı hata kaydı doğrulandı.

## Yayın öncesi

Ortak sınıf tablosunun Workers doğrulayıcısı aynı model dosyasını paketler. Yayın onayından sonra frontend ile Workers birlikte güncellenmeli; eski açık sekmelerin eski case üretimiyle puan göndermesi için sürüm uyumluluğu ele alınmalı. Bu turda canlı backend değiştirilmedi.
