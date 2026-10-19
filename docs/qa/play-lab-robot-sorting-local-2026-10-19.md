# Robot / Sorting — kademeli yeni durumlar (yerel)

Henüz push veya deploy yapılmadı. Dördüncü Adventure seviyelerinin New case üreticileri güncellendi.

- Her üç case bir sonraki kademeye geçer; Case 10 sonrası son kademede yeni örnekler sürer.
- Robot: 3, 4, 5, 6 durak; başlangıç ve durak konumları değişir. Son iki kademede A, D’den önce ziyaret edilmeli. En kısa geçerli gidiş-dönüş bütün sıralardan hesaplanır. Zorluk daha çok durak ve kuraldır; mesafenin her case'te artması gerekmez.
- Sorting: 4, 5, 7, 8 parça; az bozuk, ters, sıralı alt gruplar ve karışık diziler. İlk kademede yazma maliyeti 1; sonrakilerde maliyet çeşitliliği artar. Hedef tüm mevcut bölme ve yöntem seçenekleri arasındaki en düşük maliyettir. Her ileri örneğin öznel olarak daha zor olduğu iddia edilmez.
- İlk üç öğretici seviye korunur; Previous case düğmesi geri dönüş sağlar. Challenge etiketi her oyuna uygun kısa açıklama gösterir.

## Kontroller

120 farklı Robot haritası ve 120 farklı Sorting durumu. Rota maliyetleri bağımsız Manhattan toplamıyla karşılaştırıldı; her hedefe ulaşılabildiği doğrulandı. Her Sorting planının sıralı sonucu ve maliyeti kontrol edildi; insertion, selection ve iki hatlı kazanan stratejiler mevcut.

Case 1/4/7/10 her iki oyunda 390×844 ve 1366×768 görünümde başarılı/başarısız planlarla oynandı: 32/32 beklenen sonuç. Kayıtlı ekran boyutları doğrulandı. Başarı/hata ekranları, rota hareketleri, kısa çubuk yüzleri, iki hat ve birleşme geçişleri görsel incelendi. Yeni taşma/kesilme gözlenmedi; konsol hata kaydı boş. Mobil kontrol fiziksel telefon değil görünüm benzetimidir. Örnek kareler incelendi; tüm rastgele durumların UI testi veya kesintisiz video değildir.

Adventure regresyonları, Depot/Commands 120-case testleri, 15 Quest modeli ve server scoring testleri geçti.

## Yayın için hazırlanmış uyumluluk

Yeni sonuçlar caseVersion 3 taşır. Robot/Sorting'in eski üreticileri sunucuda saklandı; sürümsüz ve v2 sonuçlar eski modele göre, v3 sonuçlar yeni modele göre doğrulanır. Depot/Commands v2/v3 aynı mevcut modeli kullanır. Görev kimlikleri değişmez. Yayın onayında Worker önce deploy edilmeli. Bu turda canlı hizmete dokunulmadı.
